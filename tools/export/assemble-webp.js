#!/usr/bin/env node
/**
 * Assemble WebP from an existing PNG export folder.
 *
 *   node assemble-webp.js --scene boot
 *   node assemble-webp.js --dir output/line --name line --fps 15
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assembleWebp,
  DEFAULT_FPS,
  DEFAULT_QUALITY,
} from "./assemble-webp-lib.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT = path.join(__dirname, "output");

function parseArgs(argv) {
  const opts = {
    scene: "boot",
    dir: null,
    name: null,
    fps: DEFAULT_FPS,
    quality: DEFAULT_QUALITY,
    out: DEFAULT_OUT,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--scene" && argv[i + 1]) {
      opts.scene = argv[++i];
    } else if (arg === "--dir" && argv[i + 1]) {
      opts.dir = path.resolve(argv[++i]);
    } else if (arg === "--name" && argv[i + 1]) {
      opts.name = argv[++i];
    } else if (arg === "--fps" && argv[i + 1]) {
      opts.fps = Number(argv[++i]);
    } else if (arg === "--quality" && argv[i + 1]) {
      opts.quality = Number(argv[++i]);
    } else if (arg === "--out" && argv[i + 1]) {
      opts.out = path.resolve(argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      opts.help = true;
    }
  }
  opts.name = opts.name ?? opts.scene;
  opts.dir = opts.dir ?? path.join(opts.out, opts.scene);
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(`
Assemble animated WebP from exported PNGs

  node assemble-webp.js --scene boot
  node assemble-webp.js --dir output/line --name line

Options:
  --scene <name>     scene folder under --out (default: boot)
  --dir <path>       folder with frame_000001.png …
  --name <name>      output base name (default: scene name)
  --fps <n>          framerate (default: ${DEFAULT_FPS})
  --quality <n>      libwebp quality (default: ${DEFAULT_QUALITY})
  --out <dir>        export output root when using --scene
`);
    process.exit(0);
  }

  const webpPath = await assembleWebp({
    sceneDir: opts.dir,
    sceneName: opts.name,
    fps: opts.fps,
    quality: opts.quality,
  });
  console.log(`Wrote ${webpPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
