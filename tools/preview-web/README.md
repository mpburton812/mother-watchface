# MU-TH-UR preview (456×456)

Browser preview of the [CodePen MU-TH-UR UI](https://codepen.io/tkmoney/pen/qBoVGWy), scaled for **Pixel Watch 4** (456×456 round). Uses **GSAP 3.12.5** from jsDelivr CDN and **manual character splitting** (no SplitText).

> **Branch `feature/computer-text-effect`:** Adds the [Alien 1979 computer scene](https://www.youtube.com/watch?v=Mn7A1vfs8m0) **glyph scramble → settle** text effect as `ComputerTextLine` and scene `computer-text`. See [docs/COMPUTER-TEXT-EFFECT.md](../../docs/COMPUTER-TEXT-EFFECT.md).

## Dependencies

| Package | Version | URL |
|---------|---------|-----|
| GSAP | **3.12.5** | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js` |

**Font:** Share Tech Mono (local). Bundled copy: `fonts/ShareTechMono-Regular.ttf` (from `assets/Share_Tech_Mono/ShareTechMono-Regular.ttf`, OFL — see `assets/Share_Tech_Mono/OFL.txt`). Loaded via `@font-face` in `styles.css`; no Google Fonts CDN.

## Palette (locked)

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#000` | Stage |
| Terminal green | `#7af042` | Body text, underlines |
| Gradient / typed chars | `#7df14a` | Sweep gradient, char flash |
| Bright accent | `#80ff10` | Clears, boot bars, detail highlights |

Defined as CSS variables in `styles.css` (`--mother-*`).

## Run locally

Open `index.html` in a browser, or serve the folder:

```powershell
cd tools\preview-web
npx --yes serve -p 5173
```

Then open http://localhost:5173

## Controls

- **Scene** — `boot`, `boot-ambient` (boot only, for AOP), `clear` (flash only), `line`, `computer-text` (Alien decode), `demo`, `full` (CodePen `cmd_seq`)
- **Safe zone (90%)** — dashed circle at 90% diameter for PW4 content bounds; also via `?safezone=1`
- **Play sequence** — runs the selected scene

## Safe zone toggle

- URL: `?safezone=1` (on), `?safezone=0` (off)
- UI: **Safe zone (90%)** checkbox in controls (hidden in export mode)

## WFF layout overlay

- URL: `?layout=hud` — dashed rects for terminal, DATE/BAT footer, active time strip, ambient time (matches `layout.js` / `watchface.xml`)
- Mock footer labels shown when `layout=hud` (not exported)

The ring is visual only and is not captured when `export=1`.

## Export mode

Add query params for headless capture (used by `tools/export`):

- `?export=1` — hides UI chrome, black page background
- `?scene=boot` — sequence name (`boot`, `boot-ambient`, `clear`, `line`, `computer-text`, `demo`, `full`)
- `?autoplay=1` — start on load (after fonts)

Example:

```
index.html?export=1&scene=boot&autoplay=1
```

### `window.__MOTHER_EXPORT__`

| API | Description |
|-----|-------------|
| `ready` | `true` after fonts load |
| `playSequence(name)` | Returns a Promise when the GSAP timeline completes |
| `reset()` | Clears DOM / timelines |
| `getState()` | `{ ready, playing, frame, scene }` |
| `onFrame(n)` | Optional callback each animation frame while playing |
| `onEvent(type, data)` | `start` / `complete` |

Capture element: `[data-export-root]` (`#stage`, 456×456, round clip via `.round-mask`).
