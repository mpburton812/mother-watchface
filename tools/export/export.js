#!/usr/bin/env node
/**
 * Capture PNG frames from tools/preview-web → optional WebP → assets-src/webp.
 *
 * Usage:
 *   node export.js --scene boot
 *   node export.js --all
 *   node export.js --all --include-full --webp
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assembleWebp,
  ffmpegAvailable,
  DEFAULT_FPS,
  DEFAULT_QUALITY,
} from "./assemble-webp-lib.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PREVIEW_DIR = path.join(REPO_ROOT, "tools", "preview-web");
const DEFAULT_OUT = path.join(__dirname, "output");
const ASSETS_WEBP_DIR = path.join(REPO_ROOT, "assets-src", "webp");
const ASSETS_MANIFEST_DIR = path.join(ASSETS_WEBP_DIR, "manifests");

/** Scenes exported by --all (excludes long `full` unless --include-full). */
const DEFAULT_BATCH_SCENES = ["boot", "line", "clear", "boot-ambient"];

/** All scenes known to preview-web (for validation). */
const KNOWN_SCENES = [
  "boot",
  "boot-ambient",
  "line",
  "clear",
  "demo",
  "full",
  "computer-text",
];

const SCENE_MAX_SECONDS = {
  boot: 20,
  "boot-ambient": 12,
  line: 8,
  clear: 4,
  demo: 45,
  full: 180,
  "computer-text": 18,
};

function parseArgs(argv) {
  const opts = {
    scene: "boot",
    fps: DEFAULT_FPS,
    maxSeconds: null,
    out: DEFAULT_OUT,
    width: 456,
    height: 456,
    round: true,
    all: false,
    includeFull: false,
    webp: null,
    noWebp: false,
    webpOnly: false,
    copyAssets: true,
    assetsDir: ASSETS_WEBP_DIR,
    webpQuality: DEFAULT_QUALITY,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--scene" && argv[i + 1]) {
      opts.scene = argv[++i];
    } else if (arg === "--fps" && argv[i + 1]) {
      opts.fps = Number(argv[++i]);
    } else if (arg === "--max-seconds" && argv[i + 1]) {
      opts.maxSeconds = Number(argv[++i]);
    } else if (arg === "--out" && argv[i + 1]) {
      opts.out = path.resolve(argv[++i]);
    } else if (arg === "--assets-dir" && argv[i + 1]) {
      opts.assetsDir = path.resolve(argv[++i]);
    } else if (arg === "--webp-quality" && argv[i + 1]) {
      opts.webpQuality = Number(argv[++i]);
    } else if (arg === "--no-round") {
      opts.round = false;
    } else if (arg === "--all") {
      opts.all = true;
    } else if (arg === "--include-full") {
      opts.includeFull = true;
    } else if (arg === "--webp") {
      opts.webp = true;
    } else if (arg === "--no-webp") {
      opts.noWebp = true;
    } else if (arg === "--no-copy-assets") {
      opts.copyAssets = false;
    } else if (arg === "--webp-only") {
      opts.webpOnly = true;
    } else if (arg === "--help" || arg === "-h") {
      opts.help = true;
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
MU-TH-UR frame export

  npm install
  node export.js --scene boot
  node export.js --all
  node export.js --all --include-full

Options:
  --scene <name>       boot | line | clear | boot-ambient | computer-text | demo | full
  --all                export ${DEFAULT_BATCH_SCENES.join(", ")} (not full)
  --include-full       with --all, also export full (long)
  --fps <n>            capture rate (default: ${DEFAULT_FPS})
  --max-seconds <n>    safety cap (per-scene default if omitted)
  --out <dir>          PNG output root (default: tools/export/output)
  --webp               force WebP assembly (requires ffmpeg)
  --no-webp            skip WebP even if ffmpeg is on PATH
  --webp-only          assemble/copy WebP from existing PNGs (no Playwright)
  --no-copy-assets     do not copy .webp to assets-src/webp/
  --assets-dir <dir>   committed WebP destination
  --webp-quality <n>   libwebp quality (default: ${DEFAULT_QUALITY})
  --no-round           square capture (no round CSS mask)

Output:
  <out>/<scene>/frame_000001.png …
  <out>/<scene>/manifest.json
  assets-src/webp/<scene>.webp (when WebP + copy enabled)
`);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function resolveMaxSeconds(scene, override) {
  if (override != null && !Number.isNaN(override)) {
    return override;
  }
  return SCENE_MAX_SECONDS[scene] ?? 45;
}

function buildManifest({
  scene,
  width,
  height,
  fps,
  frameCount,
  webpPath,
  previewUrl,
}) {
  const durationMs = Math.round((frameCount / fps) * 1000);
  const manifest = {
    scene,
    width,
    height,
    fps,
    frameCount,
    durationMs,
    createdAt: new Date().toISOString(),
    previewUrl,
  };
  if (webpPath) {
    manifest.webpPath = webpPath;
  }
  return manifest;
}

async function captureScene(opts, scene) {
  const previewHtml = path.join(PREVIEW_DIR, "index.html");
  const maxSeconds = resolveMaxSeconds(scene, opts.maxSeconds);
  const outDir = path.join(opts.out, scene);
  await ensureDir(outDir);

  const previewUrl =
    "file:///" +
    previewHtml.replace(/\\/g, "/") +
    `?export=1&scene=${encodeURIComponent(scene)}`;

  console.log(`\n── Scene: ${scene} ──`);
  console.log(`Preview: ${previewUrl}`);
  console.log(`Output:  ${outDir}`);
  console.log(`FPS: ${opts.fps}, max ${maxSeconds}s`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: opts.width, height: opts.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(previewUrl, { waitUntil: "networkidle", timeout: 60000 });

  await page.waitForFunction(
    () => window.__MOTHER_EXPORT__?.ready === true,
    { timeout: 30000 }
  );

  if (!opts.round) {
    await page.evaluate(() => {
      document.getElementById("stage")?.classList.remove("round-mask");
    });
  }

  const intervalMs = 1000 / opts.fps;
  const maxFrames = Math.ceil(maxSeconds * opts.fps);
  const frames = [];

  let done = false;
  const playPromise = page.evaluate(async (sceneName) => {
    return window.__MOTHER_EXPORT__.playSequence(sceneName);
  }, scene);

  playPromise.then(() => {
    done = true;
  });

  let index = 0;
  const stage = page.locator("[data-export-root]");

  while (index < maxFrames) {
    const frameName = `frame_${String(index + 1).padStart(6, "0")}.png`;
    const framePath = path.join(outDir, frameName);
    await stage.screenshot({ path: framePath, type: "png" });
    frames.push(frameName);
    index += 1;

    if (done) {
      const state = await page.evaluate(() => window.__MOTHER_EXPORT__.getState());
      if (!state.playing) {
        break;
      }
    }

    if (index >= maxFrames) {
      break;
    }

    await page.waitForTimeout(intervalMs);
  }

  await playPromise.catch(() => {});
  await browser.close();

  console.log(`Captured ${frames.length} frames → ${outDir}`);
  return { outDir, frames, previewUrl, scene };
}

async function publishWebpAndManifest(opts, capture) {
  const { outDir, frames, previewUrl, scene } = capture;
  const webpLocal = path.join(outDir, `${scene}.webp`);
  let webpCommitted = null;
  let webpSize = null;

  await assembleWebp({
    sceneDir: outDir,
    sceneName: scene,
    fps: opts.fps,
    quality: opts.webpQuality,
    width: opts.width,
    height: opts.height,
    outPath: webpLocal,
  });

  const stat = await fs.stat(webpLocal);
  webpSize = stat.size;
  console.log(`WebP: ${webpLocal} (${formatBytes(webpSize)})`);

  if (webpSize > 5 * 1024 * 1024) {
    console.warn(
      `WARNING: ${scene}.webp is over 5 MB — consider fewer frames, lower quality, or shorter scene.`
    );
  }

  if (opts.copyAssets) {
    await ensureDir(opts.assetsDir);
    await ensureDir(ASSETS_MANIFEST_DIR);
    const destWebp = path.join(opts.assetsDir, `${scene}.webp`);
    await fs.copyFile(webpLocal, destWebp);
    webpCommitted = path
      .relative(REPO_ROOT, destWebp)
      .replace(/\\/g, "/");
    console.log(`Copied → ${destWebp}`);
  }

  const webpPath =
    webpCommitted ?? path.relative(REPO_ROOT, webpLocal).replace(/\\/g, "/");

  const manifest = buildManifest({
    scene,
    width: opts.width,
    height: opts.height,
    fps: opts.fps,
    frameCount: frames.length,
    webpPath,
    previewUrl,
  });

  await fs.writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  if (opts.copyAssets) {
    const manifestDest = path.join(ASSETS_MANIFEST_DIR, `${scene}.json`);
    await fs.writeFile(manifestDest, JSON.stringify(manifest, null, 2));
  }

  return { manifest, webpSize, webpLocal };
}

function formatBytes(n) {
  if (n < 1024) {
    return `${n} B`;
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(1)} KiB`;
  }
  return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
}

async function exportOneScene(opts, scene) {
  if (!KNOWN_SCENES.includes(scene)) {
    throw new Error(
      `Unknown scene "${scene}". Known: ${KNOWN_SCENES.join(", ")}`
    );
  }

  if (opts.webpOnly) {
    if (!opts.webp) {
      throw new Error("--webp-only requires ffmpeg (omit --no-webp)");
    }
    const outDir = path.join(opts.out, scene);
    let frameCount = 0;
    try {
      const manifest = JSON.parse(
        await fs.readFile(path.join(outDir, "manifest.json"), "utf8")
      );
      frameCount = manifest.frameCount ?? 0;
    } catch {
      const files = await fs.readdir(outDir);
      frameCount = files.filter((f) => /^frame_\d+\.png$/i.test(f)).length;
    }
    if (!frameCount) {
      throw new Error(`No PNG frames in ${outDir}; run export without --webp-only first`);
    }
    const previewHtml = path.join(PREVIEW_DIR, "index.html");
    const previewUrl =
      "file:///" +
      previewHtml.replace(/\\/g, "/") +
      `?export=1&scene=${encodeURIComponent(scene)}`;
    const capture = {
      outDir,
      frames: Array.from({ length: frameCount }, (_, i) =>
        `frame_${String(i + 1).padStart(6, "0")}.png`
      ),
      previewUrl,
      scene,
    };
    const webpResult = await publishWebpAndManifest(opts, capture);
    return { scene, ...capture, webpResult };
  }

  const capture = await captureScene(opts, scene);

  let webpResult = null;
  const shouldWebp = opts.webp === true && !opts.noWebp;

  if (shouldWebp) {
    webpResult = await publishWebpAndManifest(opts, capture);
  } else {
    const manifest = buildManifest({
      scene,
      width: opts.width,
      height: opts.height,
      fps: opts.fps,
      frameCount: capture.frames.length,
      webpPath: null,
      previewUrl: capture.previewUrl,
    });
    await fs.writeFile(
      path.join(capture.outDir, "manifest.json"),
      JSON.stringify(manifest, null, 2)
    );
    console.log("WebP skipped (ffmpeg not available or --no-webp).");
    console.log(
      `  node assemble-webp.js --scene ${scene}\n  or: ffmpeg -y -framerate ${opts.fps} -i "${path.join(capture.outDir, "frame_%06d.png")}" -loop 0 -c:v libwebp -quality 80 -preset default "${path.join(capture.outDir, scene + ".webp")}"`
    );
  }

  return { scene, ...capture, webpResult };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  const previewHtml = path.join(PREVIEW_DIR, "index.html");
  try {
    await fs.access(previewHtml);
  } catch {
    console.error(`Preview not found: ${previewHtml}`);
    process.exit(1);
  }

  const hasFfmpeg = await ffmpegAvailable();
  if (opts.noWebp) {
    opts.webp = false;
  } else if (opts.webp === null) {
    opts.webp = hasFfmpeg;
  }

  console.log(`ffmpeg on PATH: ${hasFfmpeg ? "yes" : "no"}`);
  console.log(`WebP assembly: ${opts.webp ? "on" : "off"}`);

  if (opts.webp && !hasFfmpeg) {
    console.error("ffmpeg not found. Install ffmpeg or use --no-webp for PNG only.");
    process.exit(1);
  }

  const scenes = opts.all
    ? [
        ...DEFAULT_BATCH_SCENES,
        ...(opts.includeFull ? ["full"] : []),
      ]
    : [opts.scene];

  const summary = [];

  for (const scene of scenes) {
    const result = await exportOneScene(opts, scene);
    summary.push({
      scene,
      frames: result.frames.length,
      webpSize: result.webpResult?.webpSize ?? null,
      webpPath: result.webpResult?.webpLocal ?? null,
    });
  }

  console.log("\n══ Export summary ══");
  for (const row of summary) {
    const size =
      row.webpSize != null ? formatBytes(row.webpSize) : "(no webp)";
    console.log(`  ${row.scene}: ${row.frames} frames, WebP ${size}`);
  }

  if (opts.copyAssets && opts.webp) {
    console.log(`\nCommitted WebPs: ${path.relative(REPO_ROOT, opts.assetsDir)}/`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
