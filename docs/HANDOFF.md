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

### `tools/preview-web/` (Phase 1 complete)

Browser **456×456** preview of the CodePen-style UI (**GSAP 3.12.5** pinned on CDN, manual character splitting).

- **Scenes:** `boot`, `demo`, `full` (CodePen `cmd_seq`), `line` — see `sequences.js`
- **Parity:** gradient sweep, char stagger glow, boot random chars + bars + details, clear flash (no audio)
- **Palette:** `#000`, `#7af042` / `#7df14a` / `#80ff10`, Share Tech Mono — local `@font-face` in `styles.css` (`fonts/ShareTechMono-Regular.ttf`; canonical `assets/Share_Tech_Mono/`)
- **Round mask:** 456×456 `.round-mask`; optional **safe-zone ring** (90% diameter) via `?safezone=1` or UI checkbox
- **Run:** open `index.html`, or `npx --yes serve -p 5173` → http://localhost:5173
- **Export hooks:** `?export=1&scene=boot&autoplay=1`; API `window.__MOTHER_EXPORT__`
- **Capture root:** `[data-export-root]` / `#stage`

Details: [tools/preview-web/README.md](../tools/preview-web/README.md)

### `tools/export/` (Phase 2 complete)

Headless **Playwright** capture → PNGs → optional **ffmpeg WebP** → copy to **`assets-src/webp/`**.

```powershell
cd tools\export
npm install
node export.js --all
# single scene: node export.js --scene boot
# long CodePen: node export.js --scene full
# or: node export.js --all --include-full
```

- **Scenes:** `boot`, `line`, `clear`, `boot-ambient` (batch); `demo`, `full` optional
- **postinstall** runs `npx playwright install chromium`
- **PNG output:** `tools/export/output/<scene>/` (gitignored)
- **Committed WebPs:** `assets-src/webp/<scene>.webp` + `assets-src/webp/manifests/<scene>.json`
- **WebP defaults:** 15 fps, quality 80, 456×456, loop 0 (`assemble-webp-lib.js`)
- **ffmpeg:** auto when on PATH; `--no-webp` for PNG-only

On Windows, prefer **`node export.js`** over `npm run export -- --flags` if arguments are dropped.

Details: [tools/export/README.md](../tools/export/README.md), [assets-src/webp/README.md](../assets-src/webp/README.md)

### `scripts/create-github-repo.ps1`

Creates **`mother-watchface`** on GitHub (if missing) and sets `origin`. **Fix in `f51e929`:** `gh repo view` no longer trips `$ErrorActionPreference Stop` when the repo does not exist (stderr was treated as terminating error).

- Requires **`gh auth login`**
- Resolves `gh` from PATH or `%TEMP%\gh-cli\bin\gh.exe`

### Local verification (this machine)

- Phase 2 exports: run `node export.js --all` after pull; WebPs committed under `assets-src/webp/`.

---

## Phase 1 done (reference implementation)

| Item | Status |
|------|--------|
| CodePen visual parity (no audio) | `effects.js` — Line, ClearScreen, BootScreen, Mother |
| GSAP pinned | 3.12.5 in `index.html` + preview README |
| Palette + round 456×456 | `styles.css` |
| Safe-zone overlay | `?safezone=1` + checkbox |
| Sequences | `boot`, `demo`, `full`, `line` |
| Export smoke path | `node export.js --scene boot` from `tools/export` |

## Phase 2 done (asset pipeline)

| Item | Status |
|------|--------|
| Export CLI `--all`, `--include-full`, per-scene caps | `tools/export/export.js` |
| WebP via ffmpeg (auto / `--webp` / `--no-webp`) | `assemble-webp-lib.js` |
| Scenes `clear`, `boot-ambient` | `tools/preview-web/sequences.js` |
| Committed WebPs + manifests | `assets-src/webp/` |
| Ambient clip | `boot-ambient.webp` (+ README dim/ffmpeg notes) |

## Phase 3 done (WFF watch face)

| Item | Status |
|------|--------|
| Gradle module `:watchface` | Root `settings.gradle.kts`, `minSdk`/`compileSdk` **36**, WFF **v4** manifest property |
| `watchface.xml` | 456×456 round; boot WebP (`PartAnimatedImage`), ambient `boot_ambient`, digital `hh:mm`, DATE + WATCH_BATTERY slots |
| Drawable deploy copies | `watchface/src/main/res/drawable-nodpi/*.webp` from `assets-src/webp/` |
| Build / install docs | [watchface/README.md](../watchface/README.md) |

**Build / install (repo root, Windows):**

```powershell
cd "c:\Dev\watchface 0"
.\scripts\install-watchface.ps1
# or: .\gradlew.bat :watchface:assembleDebug  (set JAVA_HOME + ANDROID_HOME if needed)
```

Package id: `com.mpburton812.motherwatchface`. APK outputs are gitignored.

## Phase 4 done (device test & polish)

| Item | Status |
|------|--------|
| `gradlew :watchface:assembleDebug` | Verified; set `JAVA_HOME` (Studio JBR) + `ANDROID_HOME` if `sdk.dir` not picked up (repo path has a space) |
| `scripts/install-watchface.ps1` | adb device check → build → `install -r` → prints package; `-SetActive`, `-OpenPicker`, `-SkipBuild` |
| WFF polish | Ambient `boot_ambient`; active `boot` **ON_VISIBLE** only (no per-minute replay); time + complication slots unchanged |
| Test checklist | [docs/PHASE4-TEST.md](PHASE4-TEST.md) — emulator, Pixel Watch 4 adb, OPR, battery |
| Build / install docs | [watchface/README.md](../watchface/README.md) troubleshooting table |

**Still manual (Phase 4+):** run [PHASE4-TEST.md](PHASE4-TEST.md) on emulator and Pixel Watch 4; WFF validator; OPR soak; replace `preview.webp`.

## Not done yet (Phase 5+)

| Area | Status |
|------|--------|
| ~~**Share Tech Mono font**~~ | Done — preview `@font-face`, WFF `res/font/share_tech_mono.ttf`, export uses same preview |
| **`line` / `clear` WebP in WFF** | Assets copied; not wired in XML (tap / periodic triggers) |
| **`full` scene in repo** | Optional; export with `--scene full` or `--all --include-full` (long) |
| **Scanlines / cursor / audio** | Not in preview (intentionally dropped for WFF path) |
| **On-device sign-off** | Checklist written; hardware OPR / battery soak not recorded in repo |
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
   Open http://localhost:5173 — try scenes `boot`, `demo`, `full`, `line`; toggle safe zone with `?safezone=1`.

5. **Export assets (PNG + WebP)**
   ```bash
   cd tools/export
   npm install
   node export.js --all
   ```
   Committed files: `assets-src/webp/boot.webp`, `line.webp`, `clear.webp`, `boot-ambient.webp`.

6. **Optional: long `full` scene**
   ```bash
   node export.js --scene full
   ```

7. **WFF package (Phase 3–4)**
   ```powershell
   cd "c:\Dev\watchface 0"
   .\scripts\install-watchface.ps1
   ```
   See [watchface/README.md](../watchface/README.md), [PHASE4-TEST.md](PHASE4-TEST.md).

8. **Suggested next milestone (Phase 5)**
   - Complete hardware sign-off in [PHASE4-TEST.md](PHASE4-TEST.md).
   - Wire `line` / `clear` animations; run WFF validator before publish.

---

## Repository layout (current)

```text
mother-watchface/
├── docs/
│   ├── HANDOFF.md          ← this file
│   ├── PHASE4-TEST.md      ← device / OPR checklist
│   └── PLANNING.md
├── tools/
│   ├── preview-web/        # 456×456 GSAP preview
│   └── export/             # Playwright → PNG
├── watchface/              # WFF v4 Gradle module + APK (Phase 3)
├── assets-src/
│   └── webp/               # committed WebP + manifests (Phase 2)
├── scripts/
│   ├── create-github-repo.ps1
│   └── install-watchface.ps1
└── README.md
```

---

## Quick links

- GitHub: https://github.com/mpburton812/mother-watchface
- CodePen reference: https://codepen.io/tkmoney/pen/qBoVGWy
- WFF docs: https://developer.android.com/training/wearables/wff
