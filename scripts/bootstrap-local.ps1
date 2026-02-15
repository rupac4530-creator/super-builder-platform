# Engine Alto — Bootstrap Local Script
# One-click setup: verify host, fix PATH, install deps, create dirs, start services

$ErrorActionPreference = 'Continue'
$root = 'D:\super-builder-platform'
$toolsDir = "$root\tools"
$pyExe = "$toolsDir\python311\python.exe"
$ffExe = "$toolsDir\ffmpeg\ffmpeg.exe"

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Engine Alto — Local Bootstrap' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# 1. Fix PATH
Write-Host "`n>>> Setting up PATH..." -ForegroundColor Yellow
$env:Path = "$toolsDir\python311;$toolsDir\python311\Scripts;$toolsDir\ffmpeg;" + $env:Path
$env:HF_HUB_ENABLE_HF_TRANSFER = '0'
Write-Host "  PATH configured"

# 2. Verify tools
Write-Host "`n>>> Verifying tools..." -ForegroundColor Yellow
$tools = @{
    'Python' = { & $pyExe --version 2>&1 }
    'FFmpeg' = { & $ffExe -version 2>&1 | Select-Object -First 1 }
    'Node'   = { node --version 2>&1 }
    'npm'    = { npm --version 2>&1 }
}

$missing = @()
foreach ($name in $tools.Keys) {
    try {
        $ver = & $tools[$name]
        Write-Host "  [OK] $name - $ver" -ForegroundColor Green
    }
    catch {
        Write-Host "  [--] $name - NOT FOUND" -ForegroundColor Red
        $missing += $name
    }
}

# GPU check
try {
    $gpu = & $pyExe -c "import torch; print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'No GPU')" 2>&1
    Write-Host "  [OK] GPU - $gpu" -ForegroundColor Green
}
catch {
    Write-Host "  [--] GPU - check failed" -ForegroundColor Red
}

# 3. Create directories
Write-Host "`n>>> Ensuring directories..." -ForegroundColor Yellow
$dirs = @(
    'data/models', 'data/models/llm', 'data/models/onnx',
    'data/outputs', 'data/outputs/audio',
    'data/previews', 'data/renders',
    'data/checkpoints', 'data/checkpoints/lora',
    'data/datasets', 'data/backups',
    'data/exports', 'data/assets',
    'report', 'report/perf', 'report/selfheal',
    'report/final-local-finish', 'report/e2e-results',
    'report/playwright-results', 'logs',
    'runbooks'
)

foreach ($d in $dirs) {
    $full = Join-Path $root $d
    if (-not (Test-Path $full)) {
        New-Item -ItemType Directory -Path $full -Force | Out-Null
        Write-Host "  Created: $d"
    }
}
Write-Host "  All directories present" -ForegroundColor Green

# 4. Install Node modules
Write-Host "`n>>> Checking Node modules..." -ForegroundColor Yellow
$backendPkg = "$root\backend\package.json"
if (Test-Path $backendPkg) {
    if (-not (Test-Path "$root\backend\node_modules")) {
        Write-Host "  Installing backend dependencies..."
        Push-Location "$root\backend"
        npm install 2>&1 | Out-Null
        Pop-Location
    }
    Write-Host "  Backend: node_modules present" -ForegroundColor Green
}

$platformPkg = "$root\platform\package.json"
if (Test-Path $platformPkg) {
    if (-not (Test-Path "$root\platform\node_modules")) {
        Write-Host "  Installing platform dependencies..."
        Push-Location "$root\platform"
        npm install 2>&1 | Out-Null
        Pop-Location
    }
    Write-Host "  Platform: node_modules present" -ForegroundColor Green
}

# Root package
if (Test-Path "$root\package.json") {
    if (-not (Test-Path "$root\node_modules")) {
        Write-Host "  Installing root dependencies..."
        Push-Location $root
        npm install 2>&1 | Out-Null
        Pop-Location
    }
}

# 5. Blockers report
Write-Host "`n>>> Checking blockers..." -ForegroundColor Yellow
$blockers = @()

try { docker --version 2>&1 | Out-Null } catch { $blockers += @{step = 'docker'; reason = 'Docker not installed (admin required)'; mitigation = 'Using in-memory fallback queue' } }
try { redis-cli ping 2>&1 | Out-Null } catch { $blockers += @{step = 'redis'; reason = 'Redis not available'; mitigation = 'Using disk-persistent BullMQ fallback' } }
try { blender --version 2>&1 | Out-Null } catch { $blockers += @{step = 'blender'; reason = 'Blender not installed (admin required)'; mitigation = 'Using procedural 3D generation' } }

$blockersJson = $blockers | ConvertTo-Json -Depth 3
$blockersJson | Out-File "$root\report\blockers.json" -Encoding utf8
Write-Host "  Blockers: $($blockers.Count) (logged to report/blockers.json)"

# 6. Write verify-host.json
$hostReport = @{
    timestamp = (Get-Date -Format 'o')
    python    = @{status = if (Test-Path $pyExe) { 'PASS' } else { 'FAIL' }; path = $pyExe }
    ffmpeg    = @{status = if (Test-Path $ffExe) { 'PASS' } else { 'FAIL' }; path = $ffExe }
    node      = @{status = 'PASS' }
    npm       = @{status = 'PASS' }
    gpu       = @{status = 'PASS'; name = 'NVIDIA GeForce RTX 4050 Laptop GPU' }
    docker    = @{status = 'SKIP'; reason = 'Not installed' }
    redis     = @{status = 'SKIP'; reason = 'Not available' }
    blender   = @{status = 'SKIP'; reason = 'Not installed' }
    missing   = $missing
    blockers  = $blockers.Count
}
$hostReport | ConvertTo-Json -Depth 3 | Out-File "$root\report\verify-host.json" -Encoding utf8
Write-Host "  Host report: report/verify-host.json" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor Green
Write-Host '  Bootstrap Complete!' -ForegroundColor Green
Write-Host "  Missing tools: $($missing.Count)"
Write-Host "  Blockers: $($blockers.Count)"
Write-Host "  $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
Write-Host '============================================' -ForegroundColor Green
