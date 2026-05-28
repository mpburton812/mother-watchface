/** @typedef {{ type: string, copy?: string, delay?: number, has_underline?: boolean, t?: number, show_cursor?: boolean, scramble_cycles?: number }} Cmd */

/** CodePen qBoVGWy cmd_seq — used by `full` scene. */
const CODEPEN_CMD_SEQ = [
  { type: "boot" },
  { type: "delay", t: 2 },
  { type: "clear" },
  {
    type: "line",
    copy: "INTERFACE 2037 READY FOR INQUIRY",
    has_underline: true,
  },
  { type: "linebreak" },
  { type: "line", copy: "REQUEST CLARIFICATION ON" },
  {
    type: "line",
    copy: "SCIENCE INABILITY TO NEUTRALIZE ALIEN",
    delay: -0.5,
    has_underline: true,
  },
  { type: "delay", t: 1 },
  { type: "linebreak" },
  { type: "line", copy: "UNABLE TO CLARIFY", has_underline: true },
  { type: "delay", t: 2 },
  { type: "clear" },

  { type: "line", copy: "REQUEST ENHANCEMENT", has_underline: true },
  { type: "linebreak" },
  { type: "delay", t: 1 },
  { type: "line", copy: "NO FURTHER ENHANCEMENT" },
  { type: "line", copy: "SPECIAL ORDER 937" },
  { type: "line", copy: "SCIENCE OFFICER EYES ONLY", has_underline: true },

  { type: "delay", t: 2 },
  { type: "clear" },

  { type: "line", copy: "EMERGENCY COMMAND OVERRIDE 100375" },
  { type: "line", copy: "WHAT IS SPECIAL ORDER 937", has_underline: true },
  { type: "delay", t: 2 },
  { type: "clear" },

  { type: "line", copy: "NOSTROMO REROUTED" },
  { type: "line", copy: "TO NEW CO-ORDINATES." },
  { type: "line", copy: "INVESTIGATE LIFE FORM. GATHER SPECIMEN." },

  { type: "delay", t: 2 },
  { type: "clear" },

  { type: "line", copy: "PRIORITY ONE" },
  { type: "line", copy: "INSURE RETURN OF ORGANISM" },
  { type: "line", copy: "FOR ANALYSIS.", delay: -0.5 },
  { type: "line", copy: "ALL OTHER CONSIDERATIONS SECONDARY." },
  { type: "line", copy: "CREW EXPENDABLE." },
  { type: "delay", t: 2 },
  { type: "clear" },
  { type: "clear" },
  { type: "clear" },
];

/** @type {Record<string, Cmd[]>} */
const MOTHER_SEQUENCES = {
  boot: [
    { type: "boot" },
    { type: "delay", t: 2.5 },
    { type: "clear" },
    {
      type: "line",
      copy: "INTERFACE 2037 READY FOR INQUIRY",
      has_underline: true,
    },
    { type: "linebreak" },
    { type: "line", copy: "MU-TH-UR 6000 ONLINE" },
    { type: "delay", t: 1.5 },
    { type: "clear" },
  ],

  demo: [
    { type: "boot" },
    { type: "delay", t: 2 },
    { type: "clear" },
    {
      type: "line",
      copy: "INTERFACE 2037 READY FOR INQUIRY",
      has_underline: true,
    },
    { type: "linebreak" },
    { type: "line", copy: "REQUEST CLARIFICATION ON" },
    {
      type: "line",
      copy: "SCIENCE INABILITY TO NEUTRALIZE ALIEN",
      delay: -0.5,
      has_underline: true,
    },
    { type: "delay", t: 1 },
    { type: "linebreak" },
    { type: "line", copy: "UNABLE TO CLARIFY", has_underline: true },
    { type: "delay", t: 1.5 },
    { type: "clear" },
    { type: "line", copy: "SPECIAL ORDER 937", has_underline: true },
    { type: "delay", t: 1.5 },
    { type: "clear" },
  ],

  full: CODEPEN_CMD_SEQ,

  line: [
    { type: "line", copy: "INTERFACE 2037 READY FOR INQUIRY", has_underline: true },
    { type: "delay", t: 1 },
  ],

  /** Short ClearScreen flash only (WFF transition asset). */
  clear: [{ type: "clear" }, { type: "delay", t: 0.8 }],

  /** Ambient / AOP: boot animation only, no dialogue (export at 8–15 fps). */
  "boot-ambient": [{ type: "boot" }, { type: "delay", t: 1.2 }],

  /**
   * Alien (1979) computer-text decode — glyph scramble → settle + cursor.
   * Reference: https://www.youtube.com/watch?v=Mn7A1vfs8m0
   */
  "computer-text": [
    { type: "delay", t: 0.4 },
    {
      type: "computer-text",
      copy: "INTERFACE 2037 READY FOR INQUIRY",
      has_underline: true,
    },
    { type: "delay", t: 1.2 },
    {
      type: "computer-text",
      copy: "MU-TH-UR 6000 SERIES 2.1 TERMINAL",
      has_underline: true,
      delay: 0.15,
    },
    { type: "delay", t: 1 },
    {
      type: "computer-text",
      copy: "WHAT IS SPECIAL ORDER 937",
      has_underline: true,
      show_cursor: true,
    },
    { type: "delay", t: 1.5 },
    { type: "clear" },
  ],
};

if (typeof window !== "undefined") {
  window.MOTHER_SEQUENCES = MOTHER_SEQUENCES;
}
