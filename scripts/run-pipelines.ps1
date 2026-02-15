# Engine Alto — Run Pipelines Script
# Phase F/H: Execute all AI pipelines and generate real artifacts

param(
    [int]$TargetGB = 500,
    [string]$Pipeline = 'all',  # all, sdxl, video, audio, 3d, dataset
    [int]$ImageCount = 8,
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'
$pyExe = 'D:\super-builder-platform\tools\python311\python.exe'
$ffExe = 'D:\super-builder-platform\tools\ffmpeg\ffmpeg.exe'
$dataDir = 'D:\super-builder-platform\data'

$env:Path = "D:\super-builder-platform\tools\python311;D:\super-builder-platform\tools\python311\Scripts;D:\super-builder-platform\tools\ffmpeg;" + $env:Path
$env:HF_HUB_ENABLE_HF_TRANSFER = '0'

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Engine Alto Pipeline Runner' -ForegroundColor Cyan
Write-Host "  Target: $TargetGB GB | Pipeline: $Pipeline" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# Check current vault size
$currentSize = (Get-ChildItem $dataDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$currentGB = [math]::Round($currentSize / 1GB, 2)
Write-Host "`n  Current vault: $currentGB GB"

if ($DryRun) {
    Write-Host "  DRY RUN - no pipelines executed" -ForegroundColor Yellow
    exit 0
}

# Pipeline: SDXL-Turbo Image Generation
if ($Pipeline -eq 'all' -or $Pipeline -eq 'sdxl') {
    Write-Host "`n>>> Running SDXL-Turbo Pipeline ($ImageCount images)..." -ForegroundColor Yellow
    & $pyExe "D:\super-builder-platform\scripts\sdxl-gen.py" 2>&1 | ForEach-Object { Write-Host "  $_" }
}

# Pipeline: Video Generation
if ($Pipeline -eq 'all' -or $Pipeline -eq 'video') {
    Write-Host "`n>>> Running Video Pipeline..." -ForegroundColor Yellow
    & $pyExe "D:\super-builder-platform\scripts\real-pipelines.py" 2>&1 | ForEach-Object { Write-Host "  $_" }
}

# Pipeline: Benchmark Report
Write-Host "`n>>> Generating Benchmark Report..." -ForegroundColor Yellow
& $pyExe "D:\super-builder-platform\scripts\benchmark-report.py" 2>&1 | ForEach-Object { Write-Host "  $_" }

# Pipeline: Artifact Population Report
Write-Host "`n>>> Generating Populate Report..." -ForegroundColor Yellow
& $pyExe "D:\super-builder-platform\scripts\populate-report.py" 2>&1 | ForEach-Object { Write-Host "  $_" }

# Final vault size
$finalSize = (Get-ChildItem $dataDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$finalGB = [math]::Round($finalSize / 1GB, 2)
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  PIPELINE RESULTS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Initial vault:  $currentGB GB"
Write-Host "  Final vault:    $finalGB GB"
Write-Host "  Target:         $TargetGB GB"
Write-Host "  Status:         $(if ($finalGB -ge $TargetGB) { 'TARGET MET' } else { 'BELOW TARGET' })"
Write-Host "`n  Done at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
