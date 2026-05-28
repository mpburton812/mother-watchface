(function () {
  const { Mother } = window.MotherEffects;
  const params = new URLSearchParams(window.location.search);
  const exportMode =
    params.get("export") === "1" || params.get("export") === "true";

  if (exportMode) {
    document.body.classList.add("export-mode");
  }

  const sceneSelect = document.getElementById("scene-select");
  const playBtn = document.getElementById("play-btn");
  const statusEl = document.getElementById("status");
  const stageEl = document.getElementById("stage");
  const safezoneToggle = document.getElementById("safezone-toggle");
  const layoutOverlay = document.getElementById("layout-overlay");

  function isSafeZoneEnabled() {
    const q = params.get("safezone");
    if (q === "1" || q === "true") {
      return true;
    }
    if (q === "0" || q === "false") {
      return false;
    }
    return safezoneToggle?.checked === true;
  }

  function isLayoutHudEnabled() {
    const q = params.get("layout");
    return q === "hud" || q === "HUD";
  }

  function applyLayoutHud() {
    if (!stageEl) {
      return;
    }
    const on = isLayoutHudEnabled();
    stageEl.classList.toggle("show-layout-hud", on);
    stageEl.classList.toggle("show-hud-footer", on);
    if (!layoutOverlay || !on) {
      return;
    }
    const L = window.WFF_LAYOUT;
    if (!L) {
      return;
    }
    const footers = window.WFF_FOOTER_RECTS?.() || {};
    layoutOverlay.innerHTML = "";
    const rects = [
      { ...L.terminal, label: "terminal 274×220" },
      { ...footers.date, label: "DATE" },
      { ...footers.bat, label: "BAT" },
      { ...L.activeTime, label: "active time" },
      { ...L.ambientTime, label: "ambient time" },
    ];
    rects.forEach((r) => {
      const div = document.createElement("div");
      div.className = "layout-rect";
      div.dataset.label = r.label;
      div.style.left = `${r.x}px`;
      div.style.top = `${r.y}px`;
      div.style.width = `${r.w}px`;
      div.style.height = `${r.h}px`;
      layoutOverlay.appendChild(div);
    });
  }

  function applySafeZone() {
    if (!stageEl) {
      return;
    }
    stageEl.classList.toggle("show-safe-zone", isSafeZoneEnabled());
  }

  if (safezoneToggle) {
    const q = params.get("safezone");
    if (q === "1" || q === "true") {
      safezoneToggle.checked = true;
    } else if (q === "0" || q === "false") {
      safezoneToggle.checked = false;
    }
    safezoneToggle.addEventListener("change", applySafeZone);
  }
  applySafeZone();
  applyLayoutHud();

  let mother = null;
  let playPromiseResolve = null;
  let playPromiseReject = null;
  let frameIndex = 0;
  let playing = false;

  function setStatus(text) {
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  function getSceneName() {
    return params.get("scene") || sceneSelect?.value || "boot";
  }

  function getSequence(name) {
    const seq = window.MOTHER_SEQUENCES?.[name];
    if (!seq) {
      throw new Error(`Unknown scene: ${name}`);
    }
    return seq;
  }

  function resetStage() {
    if (mother) {
      mother.reset();
    }
    document
      .querySelectorAll(".clear_screen_container, .boot_screen")
      .forEach((el) => el.remove());
    if (stageEl) {
      stageEl.querySelectorAll(".line").forEach((el) => el.remove());
    }
    const lines = document.getElementById("lines_container");
    if (lines) {
      lines.innerHTML = "";
    }
    const timeStrip = document.getElementById("time_strip");
    if (timeStrip) {
      timeStrip.innerHTML = "";
    }
    frameIndex = 0;
    playing = false;
  }

  function playSequence(sceneName) {
    const name = sceneName || getSceneName();
    resetStage();

    return new Promise((resolve, reject) => {
      playPromiseResolve = resolve;
      playPromiseReject = reject;

      mother = new Mother({
        cmd_seq: getSequence(name),
        onStart: () => {
          playing = true;
          setStatus(`Playing: ${name}`);
          notifyExportHook("start", { scene: name });
        },
        onComplete: () => {
          playing = false;
          setStatus(`Done: ${name}`);
          notifyExportHook("complete", { scene: name });
          resolve({ scene: name, frames: frameIndex });
          playPromiseResolve = null;
        },
      });

      mother.prepare();
      mother.play();
    });
  }

  function notifyExportHook(event, data) {
    if (typeof window.__MOTHER_EXPORT__?.onEvent === "function") {
      window.__MOTHER_EXPORT__.onEvent(event, { ...data, frame: frameIndex });
    }
  }

  function tickFrame() {
    frameIndex += 1;
    if (typeof window.__MOTHER_EXPORT__?.onFrame === "function") {
      window.__MOTHER_EXPORT__.onFrame(frameIndex);
    }
  }

  window.__MOTHER_EXPORT__ = {
    ready: false,
    playing: false,
    frame: 0,
    scene: null,
    width: 456,
    height: 456,

    getState() {
      return {
        ready: this.ready,
        playing,
        frame: frameIndex,
        scene: this.scene,
      };
    },

    async playSequence(sceneName) {
      this.scene = sceneName || getSceneName();
      this.playing = true;
      playing = true;
      frameIndex = 0;
      try {
        const result = await playSequence(this.scene);
        return result;
      } finally {
        this.playing = false;
        playing = false;
      }
    },

    reset() {
      resetStage();
      setStatus("Reset");
    },

    onFrame: null,
    onEvent: null,
  };

  function rafLoop() {
    if (playing) {
      tickFrame();
    }
    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);

  playBtn?.addEventListener("click", () => {
    playSequence(getSceneName()).catch((err) => {
      console.error(err);
      setStatus(String(err.message || err));
    });
  });

  if (params.get("scene") && sceneSelect) {
    sceneSelect.value = params.get("scene");
  }

  document.fonts.ready.then(() => {
    window.__MOTHER_EXPORT__.ready = true;
    setStatus(exportMode ? "Export mode ready" : "Ready");

    if (params.get("autoplay") === "1") {
      playSequence(getSceneName());
    }
  });
})();
