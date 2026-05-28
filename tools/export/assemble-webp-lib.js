/**
 * PNG sequence → animated WebP via ffmpeg (456×456, loop, libwebp).
 */

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export const DEFAULT_FPS = 15;
export const DEFAULT_QUALITY = 80;
export const DEFAULT_WIDTH = 456;
export const DEFAULT_HEIGHT = 456;

/**
 * @returns {Promise<boolean>}
 */
export async function ffmpegAvailable() {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
}

/**
 * @param {object} opts
 * @param {string} opts.sceneDir
 * @param {string} opts.sceneName
 * @param {number} [opts.fps]
 * @param {number} [opts.quality]
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 * @param {string} [opts.outPath]
 * @returns {Promise<string>}
 */
export async function assembleWebp(opts) {
  const fps = opts.fps ?? DEFAULT_FPS;
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const width = opts.width ?? DEFAULT_WIDTH;
  const height = opts.height ?? DEFAULT_HEIGHT;
  const outPath =
    opts.outPath ?? path.join(opts.sceneDir, `${opts.sceneName}.webp`);
  const inputPattern = path.join(opts.sceneDir, "frame_%06d.png");

  try {
    await fs.access(path.join(opts.sceneDir, "frame_000001.png"));
  } catch {
    throw new Error(`No frames in ${opts.sceneDir}`);
  }

  const args = [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    inputPattern,
    "-vf",
    `scale=${width}:${height}:flags=lanczos`,
    "-loop",
    "0",
    "-c:v",
    "libwebp",
    "-quality",
    String(quality),
    "-preset",
    "default",
    outPath,
  ];

  await runFfmpeg(args);
  return outPath;
}

/**
 * @param {string[]} args
 */
function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    proc.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
      }
    });
  });
}
