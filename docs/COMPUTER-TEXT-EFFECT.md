# Computer text effect (Alien 1979)

## Video reference

| | |
|---|---|
| URL | https://www.youtube.com/watch?v=Mn7A1vfs8m0 |
| Title | **Alien 1979 Computer Scene** (madjestyy, ~33s) |
| Subject | Nostromo **MU-TH-UR / Mother** CRT interface from *Alien* (1979) |

### What the film shows

The clip is the iconic green-on-black ship computer: not a smooth CSS typewriter, but **utilitarian terminal output** produced for the film with custom software (**FROLIC**) on vector plotter output ([Syssim / Alien UI background](https://webhome.cs.uvic.ca/~blob/alien.html)).

Visually you get:

1. **Random glyph noise** — blocks of characters flicker in the background (see existing `BootScreen` in `effects.js`).
2. **Decode / scramble lines** — readable lines appear as positions **cycle through random symbols**, then **lock** to the final letter with a brief bright phosphor hit.
3. **Progress bars** — horizontal green segments that flash on/off during boot.
4. **CRT feel** — scanlines, glow, and mechanical keyboard/beeper audio (audio not replicated in this watch project).

This is **not** Matrix rain, a simple left-to-right typewriter mask, or heavy glitch distortion. The signature motion is **per-character glyph scramble → settle**.

## What we implemented

| Layer | Implementation |
|-------|----------------|
| Preview | `ComputerTextLine` in `tools/preview-web/effects.js` |
| Sequencer | `type: "computer-text"` in `Mother` + scene **`computer-text`** in `sequences.js` |
| Style | `.computer-text-line`, `.computer-cursor` in `styles.css` |
| Font | Share Tech Mono (local, `assets/Share_Tech_Mono/`) |
| Glyph pool | Same charset as `BootScreen`: `AXYI@20K59VDH}#U1^>+E` |

`ComputerTextLine` behavior:

- Each character runs **7–9 rapid random glyphs**, then locks with a **green phosphor flash** (`#7df14a`).
- Staggered left-to-right so the line “decodes” like the film.
- Optional **`_` cursor** blink after the line (last line in the demo scene).
- Existing **`Line`** (gradient sweep + stagger) remains for CodePen-accurate dialogue; use `computer-text` where you want the film decode look.

## Preview

```powershell
cd tools\preview-web
npx --yes serve -p 5173
```

Open:

- http://localhost:5173/?scene=computer-text&autoplay=1  
- Or choose **computer-text** in the Scene dropdown and click **Play sequence**.

Export capture (headless):

```
index.html?export=1&scene=computer-text&autoplay=1
```

## Export to WebP (watch assets)

WFF does not express scramble logic in XML; ship it as **animated WebP** after tuning in the browser.

```powershell
cd tools\export
npm install
node export.js --scene computer-text --webp
```

Copy outputs into the watch module per [assets-src/webp/README.md](../assets-src/webp/README.md) if you want `line.webp` (or a new drawable) to use this motion on-device. **`watchface.xml` was not changed on this branch** — re-export and wire `line.webp` when ready.

## Related scenes

| Scene | Effect |
|-------|--------|
| `boot` | Random chars + bars + detail lines (boot) |
| `line` | CodePen gradient sweep + char flash |
| **`computer-text`** | Film-style scramble → settle + cursor |
