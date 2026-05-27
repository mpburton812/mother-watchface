# Handoff / status — MU-TH-UR watch face

**Last updated:** 2026-05-27  
**Repo:** https://github.com/mpburton812/mother-watchface  
**Planning detail:** [PLANNING.md](PLANNING.md)

Use this document to resume work on another machine. The root [README.md](../README.md) stays the short overview; this file is the operational record.

---

## Planning summary

| Item | Decision |
|------|----------|
| Goal | MU-TH-UR-style dynamic terminal watch face for Pixel Watch 4 from [CodePen qBoVGWy](https://codepen.io/tkmoney/pen/qBoVGWy) |
| Platform | Wear OS 6, **WFF v4**, **456×456** round |
| Path | **Tier B** — web preview + export → WebP for WFF |
| Not chosen | **Tier A** — too little motion; **Tier C** — full pen parity/audio impractical under WFF |

Open product/tech decisions (copy, loop frequency, Play Store, ambient mode, audio, license) are listed in [PLANNING.md](PLANNING.md).

---

## Scaffolding completed

### Git & GitHub

| When (commit date) | Hash | Message |
|--------------------|------|---------|
| 2026-05-27 | `23624f9` | Initial commit: project scaffold and README |
| 2026-05-27 | `787264a` | Add script to create GitHub remote and push |
| 2026-05-27 | `a538a4c` | Scaffold Tier B preview and export pipeline |
| 2026-05-27 | `f51e929` | Fix repo existence check when creating GitHub remote |

```text
f51e929 Fix repo existence check when creating GitHub remote
a538a4c Scaffold Tier B preview and export pipeline
787264a Add script to create GitHub remote and push
23624f9 Initial commit: project scaffold and README
```

- **Remote:** `origin` → `https://github.com/mpburton812/mother-watchface.git`
- **Branch:** `main` (tracks `origin/main`)

### `tools/preview-web/`

Browser **456×456** preview of the CodePen-style UI (GSAP from CDN, manual character splitting).

- **Scenes:** `boot`, `demo`, `line` (see `sequences.js`)
- **Run:** open `index.html`, or `npx --yes serve -p 5173` in that folder → http://localhost:5173
- **Export hooks:** `?export=1&scene=boot&autoplay=1`; API `window.__MOTHER_EXPORT__` (`ready`, `playSequence`, `reset`, `getState`, frame callbacks)
- **Capture root:** `[data-export-root]` / `#stage`

Details: [tools/preview-web/README.md](../tools/preview-web/README.md)

### `tools/export/`

Headless **Playwright** capture of preview-web → numbered PNGs + `manifest.json`.

```powershell
cd tools\export
npm install
node export.js --scene boot
# or: npm run export -- --scene boot
```

- **postinstall** runs `npx playwright install chromium`
- **Output:** `tools/export/output/<scene>/frame_000001.png` … (gitignored)
- **WebP:** ffmpeg from scene folder, e.g.:

```powershell
cd tools\export\output\boot
ffmpeg -y -framerate 15 -i frame_%06d.png -loop 0 -c:v libwebp -quality 80 -preset default boot.webp
```

On Windows, if `npm run export -- --flags` drops arguments, call **`node export.js`** directly (documented in export README).

Details: [tools/export/README.md](../tools/export/README.md)

### `scripts/create-github-repo.ps1`

Creates **`mother-watchface`** on GitHub (if missing) and sets `origin`. **Fix in `f51e929`:** `gh repo view` no longer trips `$ErrorActionPreference Stop` when the repo does not exist (stderr was treated as terminating error).

- Requires **`gh auth login`**
- Resolves `gh` from PATH or `%TEMP%\gh-cli\bin\gh.exe`

### Local verification (this machine)

- Export has been run successfully: `tools/export/output/boot/` (~91 frames) and `output/line/` exist locally; not committed (ignored).

---

## Not done yet

| Area | Status |
|------|--------|
| **WFF XML** | `watchface/` is placeholder (`.gitkeep` only) |
| **Watch APK / Android package** | Not started |
| **Full CodePen parity** | Subset of sequences; no scanlines/cursor/audio parity |
| **Audio** | Not in preview pipeline for WFF path |
| **WebP → WFF wiring** | No `boot.webp` in repo; no WFF `<Bitmap>` / slot definitions |
| **On-device test** | No Android Studio project / sideload |
| **Play Store / signing** | Not started |
| **License** | TBD in README |

---

## Environment / machine notes

### Paths (Windows)

| Item | Path / note |
|------|-------------|
| Project | `c:\Dev\watchface 0` (space in folder name—quote paths in scripts) |
| Git | `C:\Program Files\Git\bin\git.exe` — **not always on PATH** in automation shells; use full path if `git` fails |
| Portable GitHub CLI | `%TEMP%\gh-cli\bin\gh.exe` (fallback in `create-github-repo.ps1`) |

### Tooling

| Tool | Where / purpose |
|------|------------------|
| **Node.js** 18+ | `tools/export` (`npm install`, Playwright) |
| **Playwright Chromium** | Installed via `tools/export` postinstall |
| **ffmpeg** | On PATH for PNG → WebP assembly (not invoked by `export.js` itself) |
| **npx serve** | Optional preview server (`tools/preview-web`) |
| **Android Studio** | Future: WFF package, emulator, Pixel Watch sideload |

### Windows quirks

- **PowerShell:** use `;` not `&&` between commands (older PS versions).
- **npm scripts:** `npm run export -- --scene boot` may swallow flags; prefer **`node export.js --scene boot`**.
- **`gh repo view`:** use exit code only for existence check; do not merge stderr into a Stop-preferring error handler.

### macOS / Linux

Same commands with forward slashes; install Node, ffmpeg, and Playwright deps per [export README](../tools/export/README.md). Clone path can be anywhere.

---

## Pick up on another system — checklist

1. **Clone**
   ```bash
   git clone https://github.com/mpburton812/mother-watchface.git
   cd mother-watchface
   ```

2. **Install**
   - [Node.js](https://nodejs.org/) 18+
   - [ffmpeg](https://ffmpeg.org/) on PATH
   - (Later) [Android Studio](https://developer.android.com/studio) for WFF APK work

3. **GitHub push (optional)**
   ```bash
   gh auth login
   ```
   Or use SSH remote if you prefer.

4. **Preview**
   ```bash
   cd tools/preview-web
   npx --yes serve -p 5173
   ```
   Open http://localhost:5173 — try scenes `boot`, `demo`, `line`.

5. **Export frames**
   ```bash
   cd tools/export
   npm install
   node export.js --scene boot
   ```

6. **Assemble WebP** (example for boot scene)
   ```bash
   cd tools/export/output/boot
   ffmpeg -y -framerate 15 -i frame_%06d.png -loop 0 -c:v libwebp -quality 80 -preset default boot.webp
   ```

7. **Suggested next milestone**
   - Tune `boot` (and/or `demo`) in preview until timing matches intent.
   - Produce **`boot.webp`** (and manifest metadata: fps, dimensions 456×456).
   - Add minimal **WFF v4** XML under `watchface/` referencing that WebP + static time complication.
   - Build/sign APK and sideload to Pixel Watch 4; validate **ambient OPR** and asset size limits.

---

## Repository layout (current)

```text
mother-watchface/
├── docs/
│   ├── HANDOFF.md          ← this file
│   └── PLANNING.md
├── tools/
│   ├── preview-web/        # 456×456 GSAP preview
│   └── export/             # Playwright → PNG
├── watchface/              # WFF + APK (future)
├── assets-src/             # optional source art
├── scripts/
│   └── create-github-repo.ps1
└── README.md
```

---

## Quick links

- GitHub: https://github.com/mpburton812/mother-watchface
- CodePen reference: https://codepen.io/tkmoney/pen/qBoVGWy
- WFF docs: https://developer.android.com/training/wearables/wff
