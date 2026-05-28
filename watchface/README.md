# MU-TH-UR — WFF watch face (Phase 3)

Wear OS 6 **Watch Face Format v4** package for Pixel Watch 4 (456×456 round). Resource-only APK (`android:hasCode="false"`); no `WatchFaceService`.

## Layout (456×456)

| Region | Rect | Notes |
|--------|------|--------|
| Terminal | 274×220 @ (91, 72) | Boot + `computer_text` WebPs |
| HUD footer | y=264 inside box | `DATE …` / `BAT …` complication slots |
| Active time | y=296 full width | `time_decode.webp` once per wake, then `DigitalClock` |
| Ambient time | y=168 centered | Large thin `hh:mm`; footer + terminal motion off/dim |

Preview guides: `tools/preview-web/?layout=hud`. Constants: `tools/preview-web/layout.js`.

After re-export: `.\scripts\copy-watchface-drawables.ps1`

```text
watchface/
  build.gradle.kts
  src/main/
    AndroidManifest.xml          # WFF version 4, hasCode=false
    res/
      drawable-nodpi/            # boot, boot_ambient, computer_text, time_decode, line, clear
      raw/watchface.xml          # WFF document
      xml/watch_face_info.xml
      values/strings.xml
```

Source WebPs remain canonical under [`../assets-src/webp/`](../assets-src/webp/). Re-copy after re-export if needed.

## Build (Windows)

From the **repository root** (path with spaces must be quoted):

```powershell
cd "c:\Dev\watchface 0"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"   # if java not on PATH
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"                # if Gradle cannot read sdk.dir
.\gradlew.bat :watchface:assembleDebug
```

Output APK (gitignored): `watchface\build\outputs\apk\debug\watchface-debug.apk`

Requirements:

- [Android Studio](https://developer.android.com/studio) or Android SDK + JDK 17+
- `compileSdk` / `minSdk` **36** (Wear OS 6 / WFF v4)
- `local.properties` with `sdk.dir=...` (gitignored) **or** `ANDROID_HOME` / `ANDROID_SDK_ROOT`

**Troubleshooting**

| Symptom | Fix |
|---------|-----|
| `java` not recognized | Set `JAVA_HOME` to Android Studio `jbr` (see above) |
| `SDK location not found` | Export `ANDROID_HOME` even if `local.properties` exists (common when the repo path contains a **space**) |
| `adb` not found | Add `%ANDROID_HOME%\platform-tools` to PATH |

## Install on emulator or watch

**Recommended** — build, detect device, install, print package id:

```powershell
.\scripts\install-watchface.ps1
.\scripts\install-watchface.ps1 -SetActive          # debug: set as active face
.\scripts\install-watchface.ps1 -OpenPicker       # try Wear face picker (best-effort)
.\scripts\install-watchface.ps1 -SkipBuild          # install existing APK only
```

Manual:

```powershell
adb install -r watchface\build\outputs\apk\debug\watchface-debug.apk
```

On the device: long-press watch face → add face → **MU-TH-UR**.

**Emulator:** Wear OS **Large Round** (e.g. `Wear_OS_Large_Round`) on API 36+ if available.  
**Hardware:** Pixel Watch 4 with USB/Wi‑Fi debugging.

Device test checklist: [docs/PHASE4-TEST.md](../docs/PHASE4-TEST.md).

Set active face from shell (package id):

```powershell
adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE --es operation set-watchface --es watchFaceId com.mpburton812.motherwatchface
```

## `watchface.xml` behavior

| Layer | Active | Ambient |
|-------|--------|---------|
| Background | Black (`#000`) | Black |
| Boot | Terminal crop; **ON_VISIBLE** once | Dim terminal loop (α≈140) |
| Computer text | Terminal WebP **ON_VISIBLE** once | Hidden |
| Time | Decode WebP then `DigitalClock` @ y=296 | Large centered `hh:mm` @ y=168 |
| Footer | `DATE` / `BAT` inside terminal | Hidden (α=0) |

**Limitation:** Glyph scramble is baked in WebP (`time_decode`, `computer_text`); WFF has no per-character logic.

## TODOs (post–Phase 4)

- **Share Tech Mono** bundled at `src/main/res/font/share_tech_mono.ttf` (`family="share_tech_mono"` in `watchface.xml`); source: `assets/Share_Tech_Mono/ShareTechMono-Regular.ttf`
- Wire `line.webp` / `clear.webp` (tap or periodic triggers)
- Replace `preview.webp` with a captured on-device screenshot
- Run [WFF validator](https://github.com/google/watchface) and memory footprint tool before Play upload
- Validate ambient OPR and per-asset size on hardware (see [PHASE4-TEST.md](../docs/PHASE4-TEST.md))

## References

- [Watch Face Format](https://developer.android.com/training/wearables/wff)
- [WFF setup](https://developer.android.com/training/wearables/wff/setup)
- [Wear OS WFF samples](https://github.com/android/wear-os-samples/tree/main/WatchFaceFormat)
