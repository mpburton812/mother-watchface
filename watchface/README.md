# MU-TH-UR — WFF watch face (Phase 3)

Wear OS 6 **Watch Face Format v4** package for Pixel Watch 4 (456×456 round). Resource-only APK (`android:hasCode="false"`); no `WatchFaceService`.

## Layout

```text
watchface/
  build.gradle.kts
  src/main/
    AndroidManifest.xml          # WFF version 4, hasCode=false
    res/
      drawable-nodpi/            # boot.webp, boot_ambient.webp, line.webp, clear.webp, preview.webp
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
| Boot | `boot.webp` on **ON_VISIBLE** only; holds first frame after play | `boot_ambient.webp` loop |
| Time | `hh:mm`, green `#7af042` | Thinner weight |
| Slots | DATE (left), WATCH_BATTERY (right) | Dimmed text |

## TODOs (post–Phase 4)

- Bundle **Share Tech Mono** (`res/font`) for CodePen-accurate glyphs
- Wire `line.webp` / `clear.webp` (tap or periodic triggers)
- Replace `preview.webp` with a captured on-device screenshot
- Run [WFF validator](https://github.com/google/watchface) and memory footprint tool before Play upload
- Validate ambient OPR and per-asset size on hardware (see [PHASE4-TEST.md](../docs/PHASE4-TEST.md))

## References

- [Watch Face Format](https://developer.android.com/training/wearables/wff)
- [WFF setup](https://developer.android.com/training/wearables/wff/setup)
- [Wear OS WFF samples](https://github.com/android/wear-os-samples/tree/main/WatchFaceFormat)
