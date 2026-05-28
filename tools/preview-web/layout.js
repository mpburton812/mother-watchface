/**
 * WFF layout rects — 456×456 round, ~90% safe zone (Pixel Watch 4).
 * Kept in sync with watchface/src/main/res/raw/watchface.xml and tools/export/export.js crops.
 */
const WFF_LAYOUT = {
  face: { w: 456, h: 456 },
  terminal: { x: 91, y: 72, w: 274, h: 220 },
  footer: {
    padX: 10,
    h: 28,
    y: 72 + 220 - 28,
    dateW: 130,
    batW: 130,
  },
  activeTime: { x: 0, y: 296, w: 456, h: 72 },
  ambientTime: { x: 0, y: 168, w: 456, h: 120 },
};

function footerRects() {
  const t = WFF_LAYOUT.terminal;
  const f = WFF_LAYOUT.footer;
  return {
    date: {
      x: t.x + f.padX,
      y: f.y,
      w: f.dateW,
      h: f.h,
    },
    bat: {
      x: t.x + t.w - f.padX - f.batW,
      y: f.y,
      w: f.batW,
      h: f.h,
    },
  };
}

if (typeof window !== "undefined") {
  window.WFF_LAYOUT = WFF_LAYOUT;
  window.WFF_FOOTER_RECTS = footerRects;
}

if (typeof module !== "undefined") {
  module.exports = { WFF_LAYOUT, footerRects };
}
