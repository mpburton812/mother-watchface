# Phase 4 — Device test checklist (MU-TH-UR)

Use this after `.\scripts\install-watchface.ps1` (or manual build + `adb install -r`).

**Package:** `com.mpburton812.motherwatchface`  
**APK:** `watchface\build\outputs\apk\debug\watchface-debug.apk`

---

## Build (host)

| Step | Command / check | Pass? |
|------|-----------------|-------|
| JDK 17+ | `JAVA_HOME` → Android Studio `jbr` or JDK 17 | ☐ |
| SDK | `local.properties` `sdk.dir` or `ANDROID_HOME` | ☐ |
| Space in path | If `gradlew` ignores `local.properties`, set `$env:ANDROID_HOME` (see [watchface/README.md](../watchface/README.md)) | ☐ |
| Assemble | `.\gradlew.bat :watchface:assembleDebug` | ☐ |

---

## Wear emulator

| Step | Action | Pass? |
|------|--------|-------|
| AVD | Wear OS **Large Round** (456×456 class), API **36+** if available | ☐ |
| Install | `.\scripts\install-watchface.ps1` or `-SetActive` after install | ☐ |
| Picker | `.\scripts\install-watchface.ps1 -OpenPicker` or long-press face → add **MU-TH-UR** | ☐ |
| Active mode | Boot animation plays once when face becomes visible; time `hh:mm` readable (green, lower third) | ☐ |
| After boot | Boot holds **first frame** (static terminal art), not looping 24/7 in active mode | ☐ |
| Ambient preview | Emulator: power button / wrist-down or **Ambient** in watch face preview | ☐ |
| Ambient visuals | `boot_ambient.webp` loops; time thinner; date/battery dimmed | ☐ |
| Complications | Date (left), battery % (right) show system data or empty slot | ☐ |

**Optional debug — set active face without picker:**

```powershell
adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE --es operation set-watchface --es watchFaceId com.mpburton812.motherwatchface
```

---

## Pixel Watch 4 (hardware)

| Step | Action | Pass? |
|------|--------|-------|
| Developer options | Watch: Settings → System → About → tap build ×7 → Developer options | ☐ |
| ADB debugging | Developer options → **ADB debugging** on | ☐ |
| USB | Cable to PC; accept RSA fingerprint on watch | ☐ |
| Wi‑Fi adb | Same network: `adb pair <ip>:<pairing-port>` then `adb connect <ip>:5555` | ☐ |
| Verify | `adb devices` → `device` | ☐ |
| Install | `.\scripts\install-watchface.ps1 -SetActive` | ☐ |
| Select face | Picker or long-press → **MU-TH-UR** | ☐ |
| Active / ambient | Repeat emulator checks on real wrist-down / AOD | ☐ |

---

## OPR / burn-in (green UI)

Always-on (ambient) uses a **dim boot loop** (`boot_ambient.webp`), not the full interactive boot.

| Look for | OK | Problem |
|----------|-----|---------|
| Green `#7af042` elements | Stable position; no harsh flicker | Rapid flashing or shifting bright pixels |
| Boot ambient loop | Short, dim loop | Full `boot.webp` playing in ambient |
| Time position | Fixed `hh:mm` lower center | Text or art drifting / pulsing brightness |
| Long soak (30+ min ambient) | No obvious ghosting of bars/text | Persistent afterimage of boot frames |

If burn-in risk appears: shorten/dim `boot-ambient` export (see [assets-src/webp/README.md](../assets-src/webp/README.md)) or reduce ambient loop `repeat` in `watchface.xml` after export review.

---

## Battery / animation policy

| Mode | Boot behavior | Expected draw |
|------|----------------|---------------|
| **Active** | `boot.webp` on **ON_VISIBLE** only, then `FIRST_FRAME` | One play when you switch to this face or return from another app overlay; **not** every minute |
| **Ambient** | `boot_ambient.webp` loops while in AOD | Lower motion than full boot; acceptable for short loops |

**Recommended soak test**

1. Charge watch to ~80%+.
2. Set **MU-TH-UR** active; use normally 2–4 h (active + occasional ambient).
3. Optional overnight: ambient-only with face selected; note % drop vs. stock face (informal comparison).

**Red flags:** active-mode boot replaying continuously; device warm on wrist in ambient; unusually high “Watch face” battery in Settings → Battery.

---

## Complications (known gaps)

| Slot | Provider | Status |
|------|----------|--------|
| 0 | `DATE` / SHORT_TEXT | Wired in `watchface.xml` — verify on device |
| 1 | `WATCH_BATTERY` / SHORT_TEXT | Wired — verify on device |
| `line.webp` / `clear.webp` | — | **TODO** — assets present, not triggered in XML |
| Share Tech Mono font | `res/font/share_tech_mono.ttf` | Bundled; `family="share_tech_mono"` on time + complications |

---

## WFF validator (pre-publish)

Not required for sideload testing; run before Play upload:

- [Google watchface tools](https://github.com/google/watchface) — validate `watchface.xml` and memory footprint.

---

## Sign-off

| Area | Tester | Date | Notes |
|------|--------|------|-------|
| Emulator install + active | | | |
| Emulator ambient | | | |
| Pixel Watch 4 | | | |
| OPR / ambient soak | | | |
