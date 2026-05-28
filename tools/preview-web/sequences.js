/** @typedef {{ type: string, copy?: string, delay?: number, has_underline?: boolean, t?: number }} Cmd */

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
};

if (typeof window !== "undefined") {
  window.MOTHER_SEQUENCES = MOTHER_SEQUENCES;
}
