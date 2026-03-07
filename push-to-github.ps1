# SuperBuilder — Push Everything to GitHub
# Run this once from PowerShell (as yourself, not as admin)
# It will commit all local changes and push to origin/main
#
# USAGE:
#   cd D:\super-builder-platform
#   .\push-to-github.ps1
#
# REQUIREMENTS: Git for Windows must be installed.
# Download: https://git-scm.com/download/win  (just run the installer, defaults are fine)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── 0. Find git ─────────────────────────────────────────────────────────────
$gitPaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
)
$git = $null
foreach ($p in $gitPaths) {
    if (Test-Path $p) { $git = $p; break }
}
if (-not $git) {
    try { $git = (Get-Command git -ErrorAction Stop).Source } catch {}
}
if (-not $git) {
    Write-Host "❌ Git not found! Please install from https://git-scm.com/download/win then re-run." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git found: $git" -ForegroundColor Green
function Run-Git { param([string[]]$Args) & $git @Args }

# ─── 1. Quick secrets scan ───────────────────────────────────────────────────
Write-Host "`n🔍 Scanning for accidental secrets..." -ForegroundColor Cyan
$secretPattern = "AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{35}|-----BEGIN PRIVATE KEY-----|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}"
$found = Get-ChildItem -Recurse -File -Path . |
Where-Object { $_.Extension -in @('.ts', '.js', '.json', '.env', '.yaml', '.yml', '.md') } |
Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\.git\\" } |
Select-String -Pattern $secretPattern -ErrorAction SilentlyContinue
if ($found) {
    Write-Host "⚠️  Possible secrets found — STOPPING. Please review the lines below and move secrets to .env:" -ForegroundColor Red
    $found | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber) — $($_.Line.Trim())" -ForegroundColor Yellow }
    exit 1
}
Write-Host "✅ No secrets detected." -ForegroundColor Green

# ─── 2. Configure git identity (if not already set) ─────────────────────────
$userEmail = Run-Git @("config", "--get", "user.email") 2>$null
if (-not $userEmail) {
    Run-Git @("config", "user.name", "SuperBuilder Bot")
    Run-Git @("config", "user.email", "rupac4530@gmail.com")
}

# ─── 3. Make sure we are on main and up-to-date ──────────────────────────────
Write-Host "`n📋 Current git status:" -ForegroundColor Cyan
Run-Git @("status", "--short")
$currentBranch = (Run-Git @("rev-parse", "--abbrev-ref", "HEAD") 2>&1).Trim()
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

# ─── 4. Stage & commit all changes ───────────────────────────────────────────
Write-Host "`n📦 Staging all files..." -ForegroundColor Cyan
Run-Git @("add", "-A")

$dateStr = Get-Date -Format "yyyy-MM-dd"

# Commit 1: Integrations framework + 31 adapters
$staged = (Run-Git @("diff", "--cached", "--name-only") 2>&1)
if ($staged) {
    Write-Host "`n💾 Committing all changes..." -ForegroundColor Cyan

    # Group commits by area
    Run-Git @("add", "integrations/")
    try { Run-Git @("commit", "-m", "integrations: add 31 adapter framework, base-adapter, registry, matrix ($dateStr)") } catch {}

    Run-Git @("add", "backend/")
    try { Run-Git @("commit", "-m", "backend: add 10 next-level API routes (discovery, agents, workflows, deploy, analytics, etc)") } catch {}

    Run-Git @("add", "platform/")
    try { Run-Git @("commit", "-m", "frontend: add 10 next-level feature pages + sidebar nav (AI Discovery, Marketplace, etc)") } catch {}

    Run-Git @("add", ".github/", "CHANGELOG.md", "SECURITY.md", "README.md")
    try { Run-Git @("commit", "-m", "chore: add CI workflow, SECURITY.md, CHANGELOG.md, CODEOWNERS") } catch {}

    # Stage anything left
    Run-Git @("add", "-A")
    $remaining = (Run-Git @("diff", "--cached", "--name-only") 2>&1)
    if ($remaining) {
        try { Run-Git @("commit", "-m", "chore: commit all remaining files ($dateStr)") } catch {}
    }
}
else {
    Write-Host "ℹ️  Nothing new to commit." -ForegroundColor Yellow
}

# ─── 5. Push to origin ───────────────────────────────────────────────────────
Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Cyan
try {
    Run-Git @("push", "origin", $currentBranch)
    Write-Host "✅ Pushed successfully to origin/$currentBranch!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Push failed. If you see an auth error, run: gh auth login   OR open GitHub Desktop." -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# ─── 6. Tag a release ────────────────────────────────────────────────────────
$tagName = "v0.3.0-next-level"
Write-Host "`n🏷️  Tagging release $tagName..." -ForegroundColor Cyan
try {
    Run-Git @("tag", "-a", $tagName, "-m", "v0.3.0 — 10 Next-Level Features: AI Discovery, Smart Agents, Workflow Builder, Deploy Center, Cross Intelligence, AI Testing, Community Hub, Marketplace, Live Analytics, AI Docs. Plus 31 integration adapters.")
    Run-Git @("push", "origin", $tagName)
    Write-Host "✅ Tag $tagName pushed!" -ForegroundColor Green
}
catch {
    Write-Host "ℹ️  Tag already exists or push failed — skipping tag." -ForegroundColor Yellow
}

# ─── 7. Summary ──────────────────────────────────────────────────────────────
Write-Host @"

╔══════════════════════════════════════════════════════╗
║  ✅  SUPERBUILD PUSH COMPLETE                        ║
╠══════════════════════════════════════════════════════╣
║  Repo  : https://github.com/rupac4530-creator/       ║
║          super-builder-platform                      ║
║  Branch: $currentBranch                                        ║
║  Tag   : $tagName                               ║
╚══════════════════════════════════════════════════════╝

What was pushed:
  • integrations/  — 31 adapter files + matrix.md
  • backend/       — 10 next-level API routes
  • platform/      — 10 frontend pages + sidebar
  • .github/       — CI workflow (lint + build)
  • CHANGELOG.md   — full release notes
  • SECURITY.md    — security policy
  • CODEOWNERS     — reviewer map

Next steps (optional):
  1. Visit: https://github.com/rupac4530-creator/super-builder-platform/releases
     and edit the release notes for $tagName
  2. Enable Discussions on the repo (Settings → Discussions)
  3. Add branch protection: Settings → Branches → Require PR + CI
"@ -ForegroundColor Green
