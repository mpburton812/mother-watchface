# Build and sideload the MU-TH-UR WFF APK to a connected Wear device or emulator.
# Usage:
#   .\scripts\install-watchface.ps1
#   .\scripts\install-watchface.ps1 -OpenPicker
#   .\scripts\install-watchface.ps1 -SetActive
#   .\scripts\install-watchface.ps1 -SkipBuild

param(
    [switch]$SkipBuild,
    [switch]$OpenPicker,
    [switch]$SetActive
)

$ErrorActionPreference = "Stop"
$PackageId = "com.mpburton812.motherwatchface"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ApkPath = Join-Path $RepoRoot "watchface\build\outputs\apk\debug\watchface-debug.apk"

function Resolve-SdkDir {
    if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
        return $env:ANDROID_HOME
    }
    if ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
        return $env:ANDROID_SDK_ROOT
    }
    $localProps = Join-Path $RepoRoot "local.properties"
    if (Test-Path $localProps) {
        foreach ($line in Get-Content $localProps) {
            if ($line -match '^\s*sdk\.dir=(.+)$') {
                $dir = $Matches[1].Trim().Replace('/', '\')
                if (Test-Path $dir) { return $dir }
            }
        }
    }
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) { return $defaultSdk }
    throw "Android SDK not found. Set ANDROID_HOME or create local.properties with sdk.dir=..."
}

function Resolve-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
        return $env:JAVA_HOME
    }
    $candidates = @(
        "C:\Program Files\Android\Android Studio\jbr",
        "$env:LOCALAPPDATA\Programs\Android\Android Studio\jbr",
        "C:\Program Files\Java\jdk-17",
        "C:\Program Files\Eclipse Adoptium\jdk-17*"
    )
    foreach ($c in $candidates) {
        $resolved = $null
        if ($c -like '*`**') {
            $resolved = (Get-Item $c -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
        } elseif (Test-Path $c) {
            $resolved = $c
        }
        if ($resolved -and (Test-Path (Join-Path $resolved "bin\java.exe"))) {
            return $resolved
        }
    }
    throw "JDK 17+ not found. Set JAVA_HOME or install Android Studio (bundled JBR)."
}

function Resolve-Adb {
    param([string]$SdkDir)
    $adb = Get-Command adb -ErrorAction SilentlyContinue
    if ($adb) { return $adb.Source }
    $sdkAdb = Join-Path $SdkDir "platform-tools\adb.exe"
    if (Test-Path $sdkAdb) { return $sdkAdb }
    throw "adb not found. Install Android SDK platform-tools or add adb to PATH."
}

function Get-AdbDevices {
    param([string]$Adb)
    $lines = & $Adb devices 2>&1 | Where-Object { $_ -match '\t' }
    $ready = @()
    foreach ($line in $lines) {
        if ($line -match '^(\S+)\s+device\s*$') {
            $ready += $Matches[1]
        }
    }
    return $ready
}

Set-Location $RepoRoot

$sdkDir = Resolve-SdkDir
$env:ANDROID_HOME = $sdkDir
$env:ANDROID_SDK_ROOT = $sdkDir
$env:JAVA_HOME = Resolve-JavaHome
$env:PATH = "$env:JAVA_HOME\bin;$sdkDir\platform-tools;$env:PATH"

$adb = Resolve-Adb -SdkDir $sdkDir
$devices = Get-AdbDevices -Adb $adb
if ($devices.Count -eq 0) {
    Write-Error "No adb device in 'device' state. Start a Wear emulator or connect a watch with USB/Wi-Fi debugging."
}
if ($devices.Count -gt 1) {
    Write-Warning "Multiple devices: $($devices -join ', '). Using first: $($devices[0])"
    $env:ANDROID_SERIAL = $devices[0]
}

Write-Host "SDK:     $sdkDir"
Write-Host "JAVA:    $env:JAVA_HOME"
Write-Host "Device:  $($devices[0])"
Write-Host "Package: $PackageId"

if (-not $SkipBuild) {
    Write-Host "Building :watchface:assembleDebug ..."
    & (Join-Path $RepoRoot "gradlew.bat") ":watchface:assembleDebug" --no-daemon
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (-not (Test-Path $ApkPath)) {
    throw "APK missing: $ApkPath (run build first)"
}

Write-Host "Installing $ApkPath ..."
& $adb install -r $ApkPath
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Installed. Package: $PackageId"

if ($SetActive) {
    Write-Host "Setting active watch face (debug broadcast) ..."
    & $adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE `
        --es operation set-watchface --es watchFaceId $PackageId
}

if ($OpenPicker) {
    Write-Host "Opening watch face picker (best-effort on Wear OS 6) ..."
    & $adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SYSUI `
        --es operation show-watchface 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        & $adb shell am start -a android.intent.action.SET_WALLPAPER 2>$null | Out-Null
    }
    Write-Host "If the picker did not open, long-press the current watch face on the device."
}

Write-Host "Done. Select MU-TH-UR in the watch face list if it is not already active."
