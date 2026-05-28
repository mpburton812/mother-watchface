# MU-TH-UR Watch Face

A dynamic Wear OS watch face for **Google Pixel Watch 4**, inspired by the [Alien MU-TH-UR 6000 terminal UI](https://codepen.io/tkmoney/pen/qBoVGWy) by tkmoney.

Green phosphor terminal aesthetics: boot sequences, typing-line reveals, and clear-screen flashes—adapted for a 456×456 round display on Wear OS 6 using the [Watch Face Format (WFF)](https://developer.android.com/training/wearables/wff).

**Resuming on another machine?** See [docs/HANDOFF.md](docs/HANDOFF.md) for status, commits, env notes, and next steps.

## Status

**Tier B (chosen path):** tune the CodePen look in a local **456×456** web preview, export PNG frames, and assemble **animated WebP** for WFF assets. Phase 2 ships committed WebPs under [`assets-src/webp/`](assets-src/webp/). Phase 3 adds the **WFF v4** Android module under [`watchface/`](watchface/) — see [watchface/README.md](watchface/README.md) to build and sideload.

| Tool | Purpose |
|------|---------|
| [tools/preview-web/](tools/preview-web/) | Browser preview — `Line`, `ClearScreen`, `BootScreen`, `Mother` sequencer |
| [tools/export/](tools/export/) | Playwright frame capture → ffmpeg WebP |

The CodePen remains the visual reference; on-watch delivery uses WFF (declarative XML + assets), not in-watch JavaScript.

## Target device

| | |
|---|---|
| Device | Google Pixel Watch 4 (41mm / 45mm) |
| Display | 456×456, round, LTPO AMOLED |
| OS | Wear OS 6 |
| Format | Watch Face Format v4 |

## Repository layout

```
├── tools/
│   ├── preview-web/     # 456×456 GSAP preview + export hooks
│   └── export/          # Playwright → PNG → ffmpeg WebP
├── watchface/           # WFF v4 APK module (build: watchface/README.md)
└── assets-src/          # Source art (optional)
```

## Quick start (Tier B)

**Preview** — open [tools/preview-web/index.html](tools/preview-web/index.html) or:

```powershell
cd tools\preview-web
npx --yes serve -p 5173
```

**Export frames** — see [tools/export/README.md](tools/export/README.md):

```powershell
cd tools\export
npm install
node export.js --all
```

Committed WebPs: `assets-src/webp/*.webp` (see [assets-src/webp/README.md](assets-src/webp/README.md)).

## Development (on-device)

1. Install [Android Studio](https://developer.android.com/studio) (Wear OS / API 36 SDK).
2. From repo root: `.\gradlew.bat :watchface:assembleDebug` — details in [watchface/README.md](watchface/README.md).
3. Sideload to Pixel Watch 4 or a Wear OS Large Round emulator; validate ambient OPR before publishing.

## Inspiration & credits

- UI concept: [CodePen — Alien MU-TH-UR 6000](https://codepen.io/tkmoney/pen/qBoVGWy) (tkmoney)
- Fan homage; not affiliated with Alien / 20th Century Studios

## License

TBD. Third-party assets (fonts, sounds from the original pen) may require separate licensing if distributed publicly.
