/** @typedef {{ type: string, copy?: string, delay?: number, has_underline?: boolean, t?: number }} Cmd */

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

  line: [
    { type: "line", copy: "INTERFACE 2037 READY FOR INQUIRY", has_underline: true },
    { type: "delay", t: 1 },
  ],
};

if (typeof window !== "undefined") {
  window.MOTHER_SEQUENCES = MOTHER_SEQUENCES;
}
