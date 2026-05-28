# MU-TH-UR frame export

Headless capture of [preview-web](../preview-web/) at **456×456**, optional **ffmpeg → WebP**, and copy into [`assets-src/webp/`](../../assets-src/webp/).

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [ffmpeg](https://ffmpeg.org/) on PATH (optional; auto-used when present for WebP)

## Install

```powershell
cd tools\export
npm install
```

`postinstall` downloads Chromium for Playwright.

## Export (PNG + WebP)

Single scene:

```powershell
node export.js --scene boot
node export.js --scene line
node export.js --scene clear
```

Batch (boot, line, clear, boot-ambient — **not** `full`):

```powershell
node export.js --all
```

Include the long CodePen `full` sequence:

```powershell
node export.js --all --include-full
```

On Windows, if `npm run export -- --flags` drops arguments, call **`node export.js`** directly.

| Flag | Default | Description |
|------|---------|-------------|
| `--scene` | `boot` | `boot`, `line`, `clear`, `boot-ambient`, `demo`, `full` |
| `--all` | off | Export default batch scenes |
| `--include-full` | off | With `--all`, also export `full` (long) |
| `--fps` | `15` | PNG capture rate |
| `--max-seconds` | per scene | Safety cap (see `SCENE_MAX_SECONDS` in `export.js`) |
| `--out` | `tools/export/output` | PNG output root |
| `--webp` | on if ffmpeg found | Force WebP assembly |
| `--no-webp` | off | PNG + manifest only |
| `--webp-only` | off | Assemble/copy WebP from existing PNGs (no Playwright) |
| `--no-copy-assets` | off | Skip copy to `assets-src/webp/` |
| `--webp-quality` | `80` | libwebp quality |
| `--no-round` | off | Square stage (no round CSS mask) |

### Scenes

| Scene | Purpose |
|-------|---------|
| `boot` | Main interactive loop (boot → line → clear) |
| `line` | Single typing line (timing test) |
| `clear` | ClearScreen flash only |
| `boot-ambient` | Short boot-only clip for ambient / AOP |
| `demo` | Dialogue subset |
| `full` | Full CodePen `cmd_seq` (optional, long) |

Per-scene defaults: `boot` ~20s cap, `clear` ~4s, `line` ~8s, `full` ~180s.

### Output layout (gitignored)

```text
tools/export/output/
  boot/
    frame_000001.png
    ...
    manifest.json
    boot.webp          # when ffmpeg ran
```

`manifest.json` fields: `scene`, `width`, `height`, `fps`, `frameCount`, `durationMs`, `webpPath` (when assembled).

Committed copies: [`assets-src/webp/`](../../assets-src/webp/).

## WebP assembly only

If PNGs already exist:

```powershell
node assemble-webp.js --scene boot
```

Library defaults (also used by `export.js`): **15 fps**, **quality 80**, **loop 0**, **456×456** scale.

Manual ffmpeg (same as assembler):

```powershell
cd tools\export\output\boot
ffmpeg -y -framerate 15 -i frame_%06d.png -vf scale=456:456:flags=lanczos -loop 0 -c:v libwebp -quality 80 -preset default boot.webp
```

## File size

Warns in the console if a WebP exceeds **5 MB**. Shorten scene, lower `--webp-quality`, or reduce `--fps` before committing.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Fonts look wrong | Network on first run (Google Fonts CDN) |
| Blank frames | Increase `--max-seconds`; test `?export=1&scene=boot&autoplay=1` |
| Playwright missing browser | `npx playwright install chromium` |
| ffmpeg not found | Install ffmpeg or use `--no-webp` and assemble later |
| npm swallows flags | `node export.js --scene boot` |

## Preview without export

See [../preview-web/README.md](../preview-web/README.md).
