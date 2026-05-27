# Creates the GitHub remote and pushes main. Requires: GitHub CLI (gh) authenticated.
# Install: winget install GitHub.cli
# Login:  gh auth login

$ErrorActionPreference = "Stop"
$RepoName = "mother-watchface"

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
    $portable = Join-Path $env:TEMP "gh-cli\bin\gh.exe"
    if (Test-Path $portable) { $gh = $portable } else {
        Write-Error "GitHub CLI (gh) not found. Run: winget install GitHub.cli"
    }
} else {
    $gh = $gh.Source
}

& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to GitHub. Run: gh auth login"
    exit 1
}

Set-Location (Split-Path $PSScriptRoot -Parent)

$user = & $gh api user -q .login
$fullName = "$user/$RepoName"

$null = & $gh repo view $fullName 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Repository already exists: https://github.com/$fullName"
} else {
    & $gh repo create $RepoName `
        --public `
        --description "MU-TH-UR terminal watch face for Pixel Watch 4 (Wear OS WFF)" `
        --source . `
        --remote origin `
        --push
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Done: https://github.com/$fullName"
