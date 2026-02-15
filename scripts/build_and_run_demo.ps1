# Engine Alto — Build & Run Demo (Windows PowerShell)
# Phase 0 acceptance test: runs hello-alto and validates output
# Usage: .\scripts\build_and_run_demo.ps1

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$DemoDir = Join-Path $RootDir "apps\hello-alto"
$OutputDir = Join-Path $RootDir "infra\ci"
$OutputFile = Join-Path $OutputDir "demo_stdout.txt"
$FailureDir = Join-Path $RootDir "infra\ci-failure-logs"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Engine Alto — Phase 0 Demo Runner (Windows)"      -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure output directories exist
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
New-Item -ItemType Directory -Path $FailureDir -Force | Out-Null

# Check Python availability
$PythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $PythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $PythonCmd = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $PythonCmd = "py"
} else {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install Python 3.10+ from https://python.org"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    "FAIL: Python not found at $(Get-Date -Format 'o')" | Out-File (Join-Path $FailureDir "${timestamp}_missing_python.log")
    exit 1
}

Write-Host "Using Python: $PythonCmd"
& $PythonCmd --version
Write-Host ""

# Run the demo
Write-Host "Running hello-alto demo..."
Write-Host ""

try {
    & $PythonCmd (Join-Path $DemoDir "main.py") 2>&1 | Out-File $OutputFile -Encoding utf8
} catch {
    Write-Host "ERROR: Demo execution failed" -ForegroundColor Red
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item $OutputFile (Join-Path $FailureDir "${timestamp}_demo_failure.log") -ErrorAction SilentlyContinue
    Get-Content $OutputFile -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Demo executed successfully."
Write-Host ""

# Validate output
Write-Host "Validating output..."
$content = Get-Content $OutputFile -Raw

if ($content -match "ALTO READY") {
    Write-Host "PASS: 'ALTO READY' found in output" -ForegroundColor Green
} else {
    Write-Host "FAIL: 'ALTO READY' not found in output" -ForegroundColor Red
    Write-Host "--- Output was: ---"
    Get-Content $OutputFile
    Write-Host "---"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item $OutputFile (Join-Path $FailureDir "${timestamp}_validation_failure.log")
    exit 1
}

Write-Host ""
Write-Host "--- Demo Output ---" -ForegroundColor Yellow
Get-Content $OutputFile
Write-Host "--- End ---" -ForegroundColor Yellow
Write-Host ""
Write-Host "Phase 0 Acceptance Test: PASSED" -ForegroundColor Green
Write-Host "Artifact saved: $OutputFile"
exit 0
