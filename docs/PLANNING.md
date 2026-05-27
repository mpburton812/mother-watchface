# Planning record (MU-TH-UR watch face)

Reference for decisions made before and during scaffolding. Operational handoff lives in [HANDOFF.md](HANDOFF.md).

## Original goal

Recreate the [Alien MU-TH-UR 6000 terminal UI](https://codepen.io/tkmoney/pen/qBoVGWy) (CodePen `qBoVGWy` by tkmoney) as a **dynamic** watch face on **Google Pixel Watch 4**, with green phosphor boot/typing/clear-screen behavior—not a static screenshot.

## Platform constraints

| Constraint | Value |
|------------|--------|
| OS | Wear OS 6 |
| Delivery format | [Watch Face Format (WFF) v4](https://developer.android.com/training/wearables/wff) — required for new faces on current Pixel watches |
| Display | **456×456**, round, LTPO AMOLED |
| Runtime | **No in-watch JavaScript** for the face itself; WFF is declarative XML + bitmap/font assets |

The CodePen uses GSAP, DOM, and optional audio. On-watch behavior must be expressed with WFF primitives (including **animated WebP** where motion is needed).

## Tier choice: **Tier B**

**Tier B** — Local **456×456 web preview** that mirrors the pen’s look and timing, plus an **export pipeline** (Playwright → PNG sequence → **ffmpeg → animated WebP**) for WFF assets.

### Why not Tier A

**Tier A** (minimal static WFF first: one or few PNGs, simple time/date complications, little or no motion) would ship faster but would **not** deliver the terminal typing, clears, and boot feel that define the homage. Motion would be sacrificed or faked with crude frame swaps without a tuned authoring loop.

### Why not Tier C

**Tier C** (maximum fidelity: full CodePen parity, long scripted loops, film audio, many simultaneous animated layers) fights WFF limits—**asset size, duration, ambient OPR**, and no GSAP on-device. Audio and long interactive scripts are especially risky for battery, licensing, and store policy. Tier B keeps creative work in the browser where GSAP is available, then **bakes** vetted loops into WebP for WFF.

## Open decisions (not closed)

Copy these into issue tracking or resolve before WFF packaging:

| Topic | Options / notes |
|--------|------------------|
| **Dialogue copy** | Subset of film lines vs. full CodePen script vs. shorter “boot only” loop for always-on |
| **Animation frequency** | How often the face replays boot/demo vs. holds a static time state; impact on battery and burn-in |
| **Scenes to ship** | `boot`, `demo`, `line` in preview-web today— which become on-watch states vs. dev-only |
| **Ambient / OPR** | Simplified green-on-black static frame vs. dimmed WebP vs. time-only complication |
| **Complications** | Date, steps, battery—or terminal-only |
| **Play Store** | Public listing vs. sideload-only; affects signing, privacy policy, asset licensing |
| **License** | Repo README says TBD; CodePen may use third-party fonts/sounds—audit before distribution |
| **Audio** | CodePen includes sound; WFF does not replicate Web Audio—drop or separate companion app |
| **Round mask** | Export uses CSS round clip by default (`--no-round` for square captures)—confirm matches WFF safe zone |
| **WebP params** | fps (15 default), quality, loop length vs. Google WFF asset guidance for target slot |

## Visual reference

- Primary: [CodePen qBoVGWy](https://codepen.io/tkmoney/pen/qBoVGWy)
- Local stand-in: `tools/preview-web/` (GSAP via CDN, manual character split—no SplitText plugin)
