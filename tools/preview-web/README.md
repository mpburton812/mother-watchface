# MU-TH-UR preview (456×456)

Browser preview of the [CodePen MU-TH-UR UI](https://codepen.io/tkmoney/pen/qBoVGWy), scaled for **Pixel Watch 4** (456×456 round). Uses **GSAP 3.12.5** from jsDelivr CDN and **manual character splitting** (no SplitText).

## Dependencies

| Package | Version | URL |
|---------|---------|-----|
| GSAP | **3.12.5** | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js` |

Font: [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) (Google Fonts).

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

- **Scene** — `boot` (short export loop), `demo` (dialogue subset), `full` (CodePen `cmd_seq`), `line` (single line test)
- **Safe zone (90%)** — dashed circle at 90% diameter for PW4 content bounds; also via `?safezone=1`
- **Play sequence** — runs the selected scene

## Safe zone toggle

- URL: `?safezone=1` (on), `?safezone=0` (off)
- UI: **Safe zone (90%)** checkbox in controls (hidden in export mode)

The ring is visual only and is not captured when `export=1`.

## Export mode

Add query params for headless capture (used by `tools/export`):

- `?export=1` — hides UI chrome, black page background
- `?scene=boot` — sequence name (`boot`, `demo`, `full`, `line`)
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
