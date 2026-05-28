#!/usr/bin/env node
/**
 * Capture PNG frames from tools/preview-web for WFF animated WebP assembly.
 *
 * Usage:
 *   npm run export -- --scene boot
 *   npm run export -- --scene demo --fps 15 --max-seconds 30
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PREVIEW_DIR = path.join(REPO_ROOT, "tools", "preview-web");
const DEFAULT_OUT = path.join(__dirname, "output");

function parseArgs(argv) {
  const opts = {
    scene: "boot",
    fps: 15,
    maxSeconds: 45,
    out: DEFAULT_OUT,
    width: 456,
    height: 456,
    round: true,
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
    } else if (arg === "--no-round") {
      opts.round = false;
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
  npm run export -- --scene boot

Options:
  --scene <name>       boot | demo | full | line  (default: boot)
  --fps <n>            capture rate       (default: 15)
  --max-seconds <n>    safety cap         (default: 45)
  --out <dir>          output folder      (default: tools/export/output)
  --no-round           square capture (no round clip in browser)

Output:
  <out>/<scene>/frame_000001.png ...
  <out>/<scene>/manifest.json

Assemble animated WebP with ffmpeg (see README.md).
`);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
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

  const outDir = path.join(opts.out, opts.scene);
  await ensureDir(outDir);

  const previewUrl =
    "file:///" +
    previewHtml.replace(/\\/g, "/") +
    `?export=1&scene=${encodeURIComponent(opts.scene)}`;

  console.log(`Scene: ${opts.scene}`);
  console.log(`Preview: ${previewUrl}`);
  console.log(`Output:  ${outDir}`);
  console.log(`FPS: ${opts.fps}, max ${opts.maxSeconds}s`);

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
  const maxFrames = Math.ceil(opts.maxSeconds * opts.fps);
  const frames = [];

  let done = false;
  const playPromise = page.evaluate(async (scene) => {
    return window.__MOTHER_EXPORT__.playSequence(scene);
  }, opts.scene);

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

  const manifest = {
    scene: opts.scene,
    width: opts.width,
    height: opts.height,
    fps: opts.fps,
    frameCount: frames.length,
    frames,
    previewUrl,
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  await browser.close();

  console.log(`Captured ${frames.length} frames → ${outDir}`);
  console.log("\nAssemble WebP (lossy, loop):");
  console.log(
    `  ffmpeg -y -framerate ${opts.fps} -i "${path.join(outDir, "frame_%06d.png")}" -loop 0 -c:v libwebp -quality 80 -preset default "${path.join(outDir, opts.scene + ".webp")}"`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
