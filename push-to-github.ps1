# push-to-github.ps1 — Local helper script (SAFE DEFAULTS)
# Purpose: Local convenience script for committing changes and pushing to origin.
# NOTE: This script is for local development only. It will NOT run unattended in CI.
# WARNING: Do NOT hardcode credentials, tokens, or personal emails in this file.
#          Remove before publishing if you have any local modifications.
#
# USAGE:
#   cd D:\super-builder-platform
#   .\push-to-github.ps1
#   .\push-to-github.ps1 -Message "feat: my changes"
#   .\push-to-github.ps1 -SkipIfNoEmail
#
# REQUIREMENTS: Git for Windows must be installed.
# Download: https://git-scm.com/download/win

param(
    [string]$Message = "chore: local changes",
    [switch]$SkipIfNoEmail
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── 0. Find git ─────────────────────────────────────────────────────────────
$gitPaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
    "D:\git-portable\cmd\git.exe"
)
$git = $null
foreach ($p in $gitPaths) {
    if (Test-Path $p) { $git = $p; break }
}
if (-not $git) {
    try { $git = (Get-Command git -ErrorAction Stop).Source } catch {}
}
if (-not $git) {
    Write-Host "Git not found! Please install from https://git-scm.com/download/win then re-run." -ForegroundColor Red
    exit 1
}
Write-Host "Git found: $git" -ForegroundColor Green
function Run-Git { param([string[]]$Args) & $git @Args }

# ─── 1. Quick secrets scan ───────────────────────────────────────────────────
Write-Host "`nScanning for accidental secrets..." -ForegroundColor Cyan
$secretPattern = "AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{35}|-----BEGIN PRIVATE KEY-----|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}"
$found = Get-ChildItem -Recurse -File -Path . |
Where-Object { $_.Extension -in @('.ts', '.js', '.json', '.env', '.yaml', '.yml', '.ps1') } |
Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\.git\\" -and $_.Name -ne "push-to-github.ps1" } |
Select-String -Pattern $secretPattern -ErrorAction SilentlyContinue
if ($found) {
    Write-Host "STOP — Possible secrets found. Please review and move to .env:" -ForegroundColor Red
    $found | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber) — $($_.Line.Trim().Substring(0, [Math]::Min(80, $_.Line.Trim().Length)))" -ForegroundColor Yellow }
    exit 1
}
Write-Host "No secrets detected." -ForegroundColor Green

# ─── 2. Configure git identity (interactive — never hardcoded) ───────────────
$userEmail = Run-Git @("config", "--get", "user.email") 2>$null
if (-not $userEmail) {
    if ($SkipIfNoEmail) {
        Write-Host "Git user.email not set; skipping identity configuration." -ForegroundColor Yellow
    } else {
        Write-Host "Git user.email is not set. Enter an email to configure (or press Enter to abort):" -ForegroundColor Yellow
        $inputEmail = Read-Host "Email"
        if ($inputEmail) {
            Run-Git @("config", "user.name", "SuperBuilder Local")
            Run-Git @("config", "user.email", $inputEmail)
            Write-Host "Set git identity: SuperBuilder Local <$inputEmail>" -ForegroundColor Green
        } else {
            Write-Host "No email provided. Configure git globally first, or run with -SkipIfNoEmail." -ForegroundColor Red
            exit 1
        }
    }
}

# ─── 3. Show current status ──────────────────────────────────────────────────
Write-Host "`nCurrent git status:" -ForegroundColor Cyan
Run-Git @("status", "--short")
$currentBranch = (Run-Git @("rev-parse", "--abbrev-ref", "HEAD") 2>&1).Trim()
Write-Host "Branch: $currentBranch" -ForegroundColor Cyan

# ─── 4. Stage & commit ───────────────────────────────────────────────────────
Write-Host "`nStaging all files..." -ForegroundColor Cyan
Run-Git @("add", "-A")

$staged = (Run-Git @("diff", "--cached", "--name-only") 2>&1)
if ($staged) {
    Write-Host "Committing..." -ForegroundColor Cyan
    Run-Git @("commit", "-m", $Message)
    Write-Host "Committed." -ForegroundColor Green
} else {
    Write-Host "Nothing new to commit." -ForegroundColor Yellow
}

# ─── 5. Push ──────────────────────────────────────────────────────────────────
Write-Host "`nPushing to origin/$currentBranch..." -ForegroundColor Cyan
try {
    Run-Git @("push", "origin", $currentBranch)
    Write-Host "Pushed successfully to origin/$currentBranch!" -ForegroundColor Green
}
catch {
    Write-Host "Push failed. Check authentication: run 'gh auth login' or configure a credential helper." -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# ─── 6. Summary ──────────────────────────────────────────────────────────────
Write-Host @"

============================================
  PUSH COMPLETE
  Branch: $currentBranch
  Repo:   https://github.com/rupac4530-creator/super-builder-platform
============================================

Remember: never commit secrets or tokens to this repo.
"@ -ForegroundColor Green
