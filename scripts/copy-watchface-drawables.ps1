# Copy committed WebPs from assets-src/webp to watchface drawable-nodpi (WFF resource names).
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$src = Join-Path $root "assets-src\webp"
$dest = Join-Path $root "watchface\src\main\res\drawable-nodpi"

$map = @{
  "boot.webp"          = "boot.webp"
  "boot-ambient.webp"  = "boot_ambient.webp"
  "computer-text.webp" = "computer_text.webp"
  "time-decode.webp"   = "time_decode.webp"
  "line.webp"          = "line.webp"
  "clear.webp"         = "clear.webp"
}

New-Item -ItemType Directory -Force -Path $dest | Out-Null

foreach ($entry in $map.GetEnumerator()) {
  $from = Join-Path $src $entry.Key
  $to = Join-Path $dest $entry.Value
  if (-not (Test-Path $from)) {
    Write-Warning "Skip missing: $from"
    continue
  }
  Copy-Item -Force $from $to
  Write-Host "Copied $($entry.Key) -> $($entry.Value)"
}
