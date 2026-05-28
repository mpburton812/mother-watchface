# Committed WebP assets (WFF source)

Animated **456×456** WebPs produced by [`tools/export/`](../../tools/export/). Bulk PNG frames stay in `tools/export/output/` (gitignored).

## Layout

```text
assets-src/webp/
  boot.webp
  line.webp
  clear.webp
  boot-ambient.webp
  manifests/
    boot.json
    line.json
    ...
```

Each `manifests/<scene>.json` includes `fps`, `frameCount`, `width`, `height`, `durationMs`, and `webpPath` (repo-relative).

## Phase 3 (WFF package)

Copy or reference these files from the Android WFF project, typically:

```text
watchface/src/main/res/drawable/boot.webp
```

Until `watchface/` is a full Gradle module, keep sources here and wire paths in WFF XML when the package exists.

## Regenerate

```powershell
cd tools\export
npm install
node export.js --all
```

Optional long CodePen sequence:

```powershell
node export.js --scene full
# or
node export.js --all --include-full
```

Re-assemble WebP only (PNG folder already exists):

```powershell
node assemble-webp.js --scene boot
```

## Size guidance

Target **under 5 MB per WebP** for watch packaging. If export warns or Play/WFF limits bite, shorten the scene, lower `--webp-quality`, or reduce `--fps` (e.g. `boot-ambient` at 8 fps).

## Ambient (AOP)

`boot-ambient.webp` is a short boot-only loop for always-on preview. For a dimmer variant without re-exporting, you can post-process:

```powershell
ffmpeg -i boot-ambient.webp -vf "eq=brightness=0.35:saturation=0.5" -c:v libwebp -quality 75 boot-ambient-dim.webp
```

Prefer tuning `boot-ambient` in preview-web before export when possible.
