# MU-TH-UR Watch Face

A dynamic Wear OS watch face for **Google Pixel Watch 4**, inspired by the [Alien MU-TH-UR 6000 terminal UI](https://codepen.io/tkmoney/pen/qBoVGWy) by tkmoney.

Green phosphor terminal aesthetics: boot sequences, typing-line reveals, and clear-screen flashes—adapted for a 456×456 round display on Wear OS 6 using the [Watch Face Format (WFF)](https://developer.android.com/training/wearables/wff).

**Resuming on another machine?** See [docs/HANDOFF.md](docs/HANDOFF.md) for status, commits, env notes, and next steps.

## Status

**Tier B (chosen path):** tune the CodePen look in a local **456×456** web preview, export PNG frames, and assemble **animated WebP** for WFF assets. Full WFF XML packaging is not started yet.

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
├── watchface/           # WFF XML, fonts, assets, Android package (future)
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
npm run export -- --scene boot
```

## Development (on-device, later)

1. Install [Android Studio](https://developer.android.com/studio) with Wear OS / WFF support, or [Samsung Watch Face Studio](https://developer.samsung.com/watch-face-studio/overview.html).
2. Sideload the built APK to a Pixel Watch 4 (USB debugging or Wi‑Fi ADB).
3. Validate WFF XML and on-pixel ratio (OPR) for ambient mode before publishing.

## Inspiration & credits

- UI concept: [CodePen — Alien MU-TH-UR 6000](https://codepen.io/tkmoney/pen/qBoVGWy) (tkmoney)
- Fan homage; not affiliated with Alien / 20th Century Studios

## License

TBD. Third-party assets (fonts, sounds from the original pen) may require separate licensing if distributed publicly.
