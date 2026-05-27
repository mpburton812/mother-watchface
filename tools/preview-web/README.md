# MU-TH-UR preview (456×456)

Browser preview of the [CodePen MU-TH-UR UI](https://codepen.io/tkmoney/pen/qBoVGWy), scaled for **Pixel Watch 4** (456×456 round). Uses GSAP from CDN and **manual character splitting** (no SplitText).

## Run locally

Open `index.html` in a browser, or serve the folder:

```powershell
cd tools\preview-web
npx --yes serve -p 5173
```

Then open http://localhost:5173

## Controls

- **Scene** — `boot` (boot + short lines), `demo` (longer dialogue subset), `line` (single line test)
- **Play sequence** — runs the selected scene

## Export mode

Add query params for headless capture (used by `tools/export`):

- `?export=1` — hides UI chrome, black page background
- `?scene=boot` — sequence name
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

Capture element: `[data-export-root]` (`#stage`, 456×456).
