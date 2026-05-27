# MU-TH-UR frame export

Headless capture of [preview-web](../preview-web/) at **456×456** for Wear OS WFF animated WebP assets.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [ffmpeg](https://ffmpeg.org/) on PATH (for WebP assembly only)

## Install

```powershell
cd tools\export
npm install
```

`postinstall` downloads Chromium for Playwright.

## Export frames

```powershell
npm run export -- --scene boot
npm run export -- --scene demo --fps 15 --max-seconds 30
```

On Windows, if flags are ignored by npm, call Node directly:

```powershell
node export.js --scene boot
node export.js --scene demo --fps 15 --max-seconds 30
node export.js --scene line --out .\output\test
```

| Flag | Default | Description |
|------|---------|-------------|
| `--scene` | `boot` | `boot`, `demo`, or `line` (see preview-web sequences) |
| `--fps` | `15` | PNG capture rate |
| `--max-seconds` | `45` | Stop after this many seconds (safety cap) |
| `--out` | `tools/export/output` | Output root (scene subfolder created) |
| `--no-round` | off | Square stage (no round CSS mask) |

### Output layout

```
tools/export/output/
  boot/
    frame_000001.png
    frame_000002.png
    ...
    manifest.json
```

`output/` is gitignored.

## Assemble animated WebP

After export, from the scene folder:

```powershell
cd tools\export\output\boot
ffmpeg -y -framerate 15 -i frame_%06d.png -loop 0 -c:v libwebp -quality 80 -preset default boot.webp
```

Adjust `-framerate` to match `--fps`. For WFF, follow Google’s asset size / duration limits for your complication slot.

### Lossless / smaller alternatives

- **GIF** (larger, no alpha): `-c:v gif`
- **APNG**: PNG sequence in some pipelines; WFF typically expects WebP for animated bitmaps — confirm against [WFF docs](https://developer.android.com/training/wearables/wff).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Fonts look wrong | Ensure network access on first run (Google Fonts CDN) |
| Blank frames | Increase `--max-seconds`; check preview in browser with `?export=1&scene=boot&autoplay=1` |
| Playwright missing browser | `npx playwright install chromium` |

## Preview without export

See [../preview-web/README.md](../preview-web/README.md).
