/**
 * Simplified MU-TH-UR effects (CodePen qBoVGWy) — manual char split, no SplitText.
 * ComputerTextLine: Alien (1979) FROLIC-style glyph scramble → settle (see docs/COMPUTER-TEXT-EFFECT.md).
 */

/** Nostromo terminal glyph pool (BootScreen / film-adjacent). */
const SCRAMBLE_CHARS = "AXYI@20K59VDH}#U1^>+E".split("");

function randomScrambleChar() {
  return gsap.utils.random(SCRAMBLE_CHARS);
}

function splitChars(element) {
  const text = element.textContent;
  element.textContent = "";
  const chars = [];
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch === " " ? "\u00a0" : ch;
    element.appendChild(span);
    chars.push(span);
  }
  return chars;
}

function splitCharsInTree(root) {
  const all = [];
  root.querySelectorAll(".detail_copy").forEach((el) => {
    const chars = splitChars(el);
    chars.forEach((c) => c.classList.add("char"));
    all.push(...chars);
  });
  return all;
}

class Line {
  constructor(opts) {
    this.line_container = opts.line_container;
    this.copy = opts.copy || "HELLO WORLD!";
    this.delay = opts.delay || 0;
    this.has_underline =
      typeof opts.has_underline === "boolean" ? opts.has_underline : false;
    this.build();
  }

  build() {
    this.line_elm = document.createElement("div");
    this.line_elm.classList.add("line");

    this.grad_elm = document.createElement("div");
    this.grad_elm.classList.add("grad");
    this.line_elm.appendChild(this.grad_elm);

    this.copy_elm = document.createElement("div");
    this.copy_elm.classList.add("copy");
    this.copy_elm.textContent = this.copy;
    this.line_elm.appendChild(this.copy_elm);

    this.line_container.appendChild(this.line_elm);
    this.chars = splitChars(this.copy_elm);

    this.underline_elm = document.createElement("div");
    this.underline_elm.classList.add("underline");
    this.copy_elm.appendChild(this.underline_elm);

    gsap.set(this.chars, { opacity: 0 });
  }

  animate() {
    const tl = gsap
      .timeline({ delay: this.delay })
      .set(this.line_elm, { display: "grid", className: "line is-visible" })
      .set(this.chars, { opacity: 0, visibility: "visible" })
      .fromTo(
        this.line_elm,
        { "--grad-offset-scale": 1 },
        {
          "--grad-offset-scale": -1,
          duration: 0.5,
          ease: "power4.inOut",
        }
      )
      .fromTo(
        this.chars,
        { opacity: 1, backgroundColor: "#7df14a" },
        {
          opacity: 1,
          backgroundColor: "transparent",
          duration: 0.05,
          stagger: 0.05,
          ease: "steps(1)",
        },
        "-=0.12"
      )
      .fromTo(
        this.chars,
        {
          color: "#fff",
          textShadow:
            "0px 0px 6px rgba(255,255,255,1), 0px 0px 15px rgba(255,255,255,1)",
        },
        {
          color: "#7df14a",
          textShadow:
            "0px 0px 6px rgba(255,255,255,0), 0px 0px 15px rgba(255,255,255,0)",
          duration: 0.45,
          stagger: 0.05,
        },
        "<"
      );

    if (this.has_underline) {
      tl.set(this.underline_elm, { opacity: 1 }, "<");
    }
    return tl;
  }
}

/**
 * Alien 1979 computer text: rapid random glyphs per position, then lock with phosphor flash.
 * Optional blinking block cursor after the line settles.
 */
class ComputerTextLine {
  constructor(opts) {
    this.line_container = opts.line_container;
    this.copy = opts.copy || "HELLO WORLD!";
    this.delay = opts.delay || 0;
    this.has_underline =
      typeof opts.has_underline === "boolean" ? opts.has_underline : false;
    this.scramble_cycles = opts.scramble_cycles ?? 7;
    this.char_stagger = opts.char_stagger ?? 0.055;
    this.scramble_tick = opts.scramble_tick ?? 0.024;
    this.show_cursor =
      typeof opts.show_cursor === "boolean" ? opts.show_cursor : true;
    this.build();
  }

  build() {
    this.line_elm = document.createElement("div");
    this.line_elm.classList.add("line", "computer-text-line");

    this.copy_elm = document.createElement("div");
    this.copy_elm.classList.add("copy");
    this.copy_elm.textContent = this.copy;
    this.line_elm.appendChild(this.copy_elm);

    this.line_container.appendChild(this.line_elm);
    this.chars = splitChars(this.copy_elm);

    this.underline_elm = document.createElement("div");
    this.underline_elm.classList.add("underline");
    this.copy_elm.appendChild(this.underline_elm);

    if (this.show_cursor) {
      this.cursor_elm = document.createElement("span");
      this.cursor_elm.classList.add("computer-cursor");
      this.cursor_elm.textContent = "_";
      this.copy_elm.appendChild(this.cursor_elm);
    }

    gsap.set(this.chars, { opacity: 0 });
    if (this.cursor_elm) {
      gsap.set(this.cursor_elm, { opacity: 0 });
    }
  }

  /** @param {HTMLElement} span @param {string} finalChar */
  addCharScramble(tl, span, finalChar, at) {
    const display =
      finalChar === " " ? "\u00a0" : finalChar === "\u00a0" ? "\u00a0" : finalChar;
    const cycles = this.scramble_cycles + Math.floor(Math.random() * 3);
    let t = at;
    for (let i = 0; i < cycles; i++) {
      const isLast = i === cycles - 1;
      tl.set(
        span,
        {
          opacity: 1,
          visibility: "visible",
          textContent: isLast ? display : randomScrambleChar(),
          color: "#fff",
          backgroundColor: isLast ? "#7df14a" : "transparent",
          textShadow: isLast
            ? "0px 0px 8px rgba(125,241,74,0.9)"
            : "0px 0px 4px rgba(255,255,255,0.35)",
        },
        t
      );
      t += this.scramble_tick;
    }
    tl.set(
      span,
      {
        textContent: display,
        color: "#7af042",
        backgroundColor: "transparent",
        textShadow: "0px 0px 0px rgba(255,255,255,0)",
      },
      t
    );
    return t + 0.04;
  }

  animate() {
    const tl = gsap
      .timeline({ delay: this.delay })
      .set(this.line_elm, { display: "grid", className: "line computer-text-line is-visible" });

    let cursorAt = 0;
    this.chars.forEach((span, index) => {
      const final =
        this.copy[index] === " " || this.copy[index] === undefined
          ? " "
          : this.copy[index];
      const start = index * this.char_stagger;
      cursorAt = this.addCharScramble(tl, span, final, start);
    });

    if (this.has_underline) {
      tl.set(this.underline_elm, { opacity: 1 }, cursorAt * 0.85);
    }

    if (this.cursor_elm) {
      tl.set(this.cursor_elm, { opacity: 1 }, cursorAt)
        .to(
          this.cursor_elm,
          {
            opacity: 0,
            duration: 0.35,
            repeat: 5,
            yoyo: true,
            ease: "steps(1)",
          },
          cursorAt + 0.05
        )
        .set(this.cursor_elm, { opacity: 1 });
    }

    return tl;
  }
}

class LineBreak {
  constructor(opts) {
    this.line_container = opts.line_container;
    this.build();
  }

  build() {
    this.line_elm = document.createElement("div");
    this.line_elm.classList.add("line");
    const copy = document.createElement("div");
    copy.innerHTML = "&nbsp;";
    this.line_elm.appendChild(copy);
    this.line_container.appendChild(this.line_elm);
  }

  animate() {
    return gsap.timeline().set(this.line_elm, { className: "line is-visible" });
  }
}

class ClearScreen {
  constructor(opts) {
    this.mother_container_elm = opts.mother_container_elm;
    this.build();
  }

  build() {
    this.root_elm = document.createElement("div");
    this.root_elm.classList.add("clear_screen_container");
    this.mother_container_elm.appendChild(this.root_elm);

    this.top_elm = document.createElement("div");
    this.bottom_elm = document.createElement("div");
    this.root_elm.appendChild(this.top_elm);
    this.root_elm.appendChild(this.bottom_elm);

    gsap.set(this.root_elm, {
      display: "grid",
      position: "absolute",
      inset: 0,
      gridTemplateColumns: "1fr",
      gridTemplateRows: "1fr 1fr",
      opacity: 0,
      zIndex: 30,
      pointerEvents: "none",
    });
    gsap.set([this.top_elm, this.bottom_elm], {
      backgroundColor: "#80ff10",
      opacity: 0,
    });
  }

  animate() {
    return gsap
      .timeline()
      .add(() => {
        this.mother_container_elm
          .querySelectorAll(".line, .boot_screen")
          .forEach((el) => {
            el.classList.remove("is-visible", "is-active");
            gsap.set(el, { display: "none" });
          });
      })
      .set(this.root_elm, { opacity: 1 })
      .set([this.top_elm, this.bottom_elm], { opacity: 1, stagger: 0.05 })
      .set([this.top_elm, this.bottom_elm], {
        opacity: 0,
        stagger: 0.05,
        delay: 0.1,
      })
      .set(this.root_elm, { opacity: 0 });
  }
}

class BootScreen {
  constructor(opts) {
    this.num_bars = opts.num_bars ?? 12;
    this.num_lines = opts.num_lines ?? 22;
    this.line_sections = 4;
    this.details_screen_data = [
      [{ copy: "APOLLO CORE STARTUP", col_span: 2 }],
      [
        { copy: "RESET PRIORITY COMMANDS", col_span: 2 },
        { copy: "1990" },
        { copy: "90" },
      ],
      [
        { copy: "SEEGSON PROFILE DELETED", col_span: 2 },
        { copy: "0000" },
        { copy: "X-RW-W" },
      ],
      [{ copy: "ADMINISTRATION" }, { copy: "1023" }],
      [
        { copy: 'SECURITY CLEARANCE <span>N 1</span>', col_span: 2 },
        { copy: "T" },
        { copy: "90" },
      ],
      [{ copy: "WEYLAND YUTANI" }, { copy: "SUBSYSTEM ONLINE" }],
      [
        { copy: "SET <span>R</span>" },
        { copy: "OVERRIDE" },
        { copy: "Y N" },
        { copy: "Y" },
      ],
      [{ copy: "REBOOT COMPLETE" }, { copy: "Y" }],
    ];
    this.chars = "AXYI@20K59VDH}#U1^>+E".split("");
    this.mother_container_elm =
      opts.mother_container_elm || document.querySelector("#mother_container");
    this.build();
  }

  build() {
    this.root_elm = document.createElement("div");
    this.root_elm.classList.add("boot_screen");
    gsap.set(this.root_elm, {
      display: "grid",
      gridTemplateRows: "1fr",
      gridTemplateColumns: "1fr",
      position: "absolute",
      inset: 0,
      alignItems: "center",
      justifyItems: "center",
    });

    this.random_chars_screen = document.createElement("div");
    this.random_chars_screen.classList.add("random_chars_screen");
    this.root_elm.appendChild(this.random_chars_screen);

    this.line_elms = [];
    this.line_section_elms = [];

    for (let i = 0; i < this.num_lines; i++) {
      const line_elm = document.createElement("div");
      line_elm.classList.add("line_elm");
      gsap.set(line_elm, { display: "grid", gridTemplateRows: "1fr" });

      for (let n = 0; n < this.line_sections; n++) {
        const sec = document.createElement("div");
        sec.classList.add("section");
        const ch = gsap.utils.random(this.chars);
        sec.innerHTML = Array(8)
          .fill(`<span class="char">${ch}</span>`)
          .join("");
        gsap.set(sec, {
          display: "inline-block",
          opacity: 0,
          gridRow: 1,
          justifySelf: gsap.utils.random(["start", "end", "center"]),
        });
        const charEls = sec.querySelectorAll(".char");
        gsap.set(charEls, { opacity: 0 });
        gsap.set(
          [...charEls].slice(0, gsap.utils.random(2, 7, 1)),
          { opacity: 1 }
        );
        line_elm.appendChild(sec);
        this.line_section_elms.push(sec);
      }
      this.random_chars_screen.appendChild(line_elm);
      this.line_elms.push(line_elm);
    }

    for (let ls = 0; ls < this.line_section_elms.length / 3; ls++) {
      gsap.set(gsap.utils.random(this.line_section_elms), { opacity: 1 });
    }

    this.bars_container = document.createElement("div");
    this.bars_container.classList.add("bars_container");
    this.random_chars_screen.appendChild(this.bars_container);

    this.bars_elm = [];
    for (let b = 0; b < this.num_bars; b++) {
      const bar_elm = document.createElement("div");
      bar_elm.classList.add("bar_elm");
      const bar_glow = document.createElement("div");
      bar_glow.classList.add("bar_glow");
      bar_elm.appendChild(bar_glow);
      this.bars_container.appendChild(bar_elm);
      gsap.set(bar_elm, {
        background: "#80ff10",
        "--glow-opacity": 0,
        width: "random(15,100)%",
        height: "random(1,2)%",
        position: "absolute",
        top: "random(0,100)%",
        left: "random(-25,75)%",
        opacity: 0,
      });
      gsap.set(bar_glow, {
        width: "100%",
        height: "100%",
        opacity: "var(--glow-opacity)",
      });
      this.bars_elm.push(bar_elm);
    }

    this.details_screen = document.createElement("div");
    this.details_screen.classList.add("details_screen");

    this.details_screen_data.forEach((detail_line) => {
      const d_line = document.createElement("div");
      d_line.classList.add("detail_line");
      gsap.set(d_line, { "--text-shadow-opacity": 0 });

      detail_line.forEach((line_data, index) => {
        const detail_copy_elm = document.createElement("div");
        detail_copy_elm.classList.add("detail_copy");
        detail_copy_elm.innerHTML = line_data.copy;
        if (line_data.col_span) {
          gsap.set(detail_copy_elm, {
            gridColumn: `${index + 1} / span ${line_data.col_span}`,
          });
        }
        d_line.appendChild(detail_copy_elm);
      });
      this.details_screen.appendChild(d_line);
    });

    this.root_elm.prepend(this.details_screen);
    splitCharsInTree(this.details_screen);
    this.mother_container_elm.appendChild(this.root_elm);
  }

  detailsScreenAnimation() {
    const tl = gsap.timeline();
    this.details_screen.querySelectorAll(".detail_line").forEach((line_elm) => {
      tl.set(line_elm, { "--text-shadow-opacity": 0 });
      tl.fromTo(
        line_elm.querySelectorAll(".char"),
        { opacity: 0 },
        {
          opacity: 1,
          stagger: 0.01,
          duration: 0.01,
          onComplete: () => {
            gsap.fromTo(
              line_elm,
              { "--text-shadow-opacity": 1 },
              {
                "--text-shadow-opacity": 0,
                duration: 1,
                ease: "expo.out",
              }
            );
          },
        }
      );
    });
    tl.fromTo(
      this.random_chars_screen.querySelectorAll(".line_elm"),
      { opacity: 1 },
      { opacity: 0, duration: 0.01, stagger: 0.1 },
      0
    );
    return tl;
  }

  barsAnimation() {
    this.bar_tl = gsap.timeline({ repeatRefresh: true });
    this.bars_elm.forEach((bar_elm) => {
      const b_tl = gsap.timeline({ repeatRefresh: true, repeat: -1 });
      b_tl.set(bar_elm, {
        width: "random(15,100)%",
        height: "random(1,2)%",
        top: "random(0,100)%",
        left: "random(-25,75)%",
      });
      b_tl.to(bar_elm, {
        opacity: 1,
        "--glow-opacity": 1,
        delay: "random(0,2.5)",
        duration: 0.05,
        ease: "expo.out",
      });
      b_tl.to(bar_elm, {
        opacity: 0,
        "--glow-opacity": 0,
        duration: "random(0.2,0.5)",
      });
      this.bar_tl.add(b_tl, 0);
    });
    return this.bar_tl;
  }

  charsBGAnimation() {
    this.chars_tl = gsap
      .timeline({ repeat: -1, repeatRefresh: true })
      .set(this.line_section_elms, { opacity: 0, delay: 0.1 })
      .add(() => {
        const count = Math.floor(
          this.line_section_elms.length / gsap.utils.random(3, 4, 1)
        );
        for (let ls = 0; ls < count; ls++) {
          const lse = gsap.utils.random(this.line_section_elms);
          gsap.set(lse, {
            opacity: 1,
            justifySelf: gsap.utils.random(["start", "end", "center"]),
          });
        }
      });
    return this.chars_tl;
  }

  animate() {
    return gsap
      .timeline()
      .add(() => {
        this.root_elm.classList.add("is-active");
        gsap.set(this.root_elm, { display: "grid" });
        gsap.set(this.random_chars_screen, { opacity: 1 });
        gsap.set(this.bars_container, { opacity: 1 });
        this.charsBGAnimation();
        this.barsAnimation();
      })
      .add(this.detailsScreenAnimation(), 2)
      .add(() => {
        this.chars_tl?.pause();
        this.bar_tl?.pause();
        gsap.set(this.bars_container, { opacity: 0 });
      }, "-=0.15");
  }
}

class Mother {
  constructor(opts) {
    this.lines_container = document.querySelector("#lines_container");
    this.mother_container_elm = document.querySelector("#mother_container");
    this.cmd_seq = opts.cmd_seq || [{ type: "line", copy: "HELLO WORLD!" }];
    this.master_tl = gsap.timeline({ paused: true });
    this.onComplete = opts.onComplete || null;
    this.onStart = opts.onStart || null;
  }

  reset() {
    this.master_tl.kill();
    this.master_tl = gsap.timeline({ paused: true });
    this.lines_container.innerHTML = "";
    this.mother_container_elm
      .querySelectorAll(".clear_screen_container, .boot_screen")
      .forEach((el) => el.remove());
  }

  buildSeq() {
    const lineOpts = {
      line_container: this.lines_container,
      has_underline: false,
    };
    const clearOpts = {
      line_container: this.lines_container,
      mother_container_elm: this.mother_container_elm,
    };
    const bootOpts = { mother_container_elm: this.mother_container_elm };

    this.cmd_seq.forEach((cmd) => {
      let c = null;
      switch (cmd.type) {
        case "line":
          c = new Line({ ...lineOpts, ...cmd });
          break;
        case "computer-text": {
          const container =
            cmd.container === "time"
              ? document.querySelector("#time_strip")
              : this.lines_container;
          c = new ComputerTextLine({ ...lineOpts, ...cmd, line_container: container });
          break;
        }
        case "clear":
          c = new ClearScreen({ ...clearOpts, ...cmd });
          break;
        case "linebreak":
          c = new LineBreak({ line_container: this.lines_container });
          break;
        case "boot":
          c = new BootScreen(bootOpts);
          break;
        case "delay":
          c = {
            animate: () =>
              gsap.fromTo(
                { v: 0 },
                { v: 0 },
                { v: 1, duration: cmd.t || 1 }
              ),
          };
          break;
        default:
          break;
      }
      if (c) {
        this.master_tl.add(c.animate());
      }
    });

    if (this.onComplete) {
      this.master_tl.eventCallback("onComplete", this.onComplete);
    }
    return this.master_tl;
  }

  play() {
    if (this.onStart) {
      this.onStart();
    }
    this.master_tl.restart(true);
    return this.master_tl;
  }

  prepare() {
    this.reset();
    this.buildSeq();
    return this.master_tl;
  }
}

if (typeof window !== "undefined") {
  window.MotherEffects = {
    Line,
    ComputerTextLine,
    LineBreak,
    ClearScreen,
    BootScreen,
    Mother,
  };
}
