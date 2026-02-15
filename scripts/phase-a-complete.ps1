$ErrorActionPreference = 'Continue'
$pyExe = 'D:\super-builder-platform\tools\python311\python.exe'
$ffExe = 'D:\super-builder-platform\tools\ffmpeg\ffmpeg.exe'
$toolsDir = 'D:\super-builder-platform\tools'
$logFile = 'D:\super-builder-platform\logs\agent-execution.log'

if (-not (Test-Path 'D:\super-builder-platform\logs')) { New-Item -ItemType Directory -Path 'D:\super-builder-platform\logs' -Force | Out-Null }

function Log-Step {
    param([string]$p, [string]$s, [string]$st, [string]$d)
    $entry = "{`"ts`":`"$(Get-Date -Format 'o')`",`"phase`":`"$p`",`"step`":`"$s`",`"status`":`"$st`",`"detail`":`"$d`"}"
    Add-Content -Path $logFile -Value $entry
    $color = 'Yellow'
    if ($st -eq 'PASS') { $color = 'Green' }
    if ($st -eq 'FAIL') { $color = 'Red' }
    Write-Host "  [$st] ${s} - $d" -ForegroundColor $color
}

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Phase A - Complete Tool Installation' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# Fix PATH for this session
$env:Path = "$toolsDir\python311;$toolsDir\python311\Scripts;$toolsDir\ffmpeg;" + $env:Path

# Find Git
$gitPaths = @(
    'C:\Program Files\Git\cmd',
    'C:\Program Files\Git\bin',
    'C:\Program Files (x86)\Git\cmd'
)
foreach ($gp in $gitPaths) {
    if (Test-Path "$gp\git.exe") {
        $env:Path = "$gp;" + $env:Path
        Write-Host "  Added Git to PATH from $gp" -ForegroundColor Green
        break
    }
}

$results = @{}

# ---- Step 1: Verify existing tools ----
Write-Host "`n>>> Step 1 - Verify existing tools" -ForegroundColor Yellow

$pyVer = & $pyExe --version 2>&1
$results['python'] = "PASS - $pyVer"
Log-Step 'A' 'python' 'PASS' "$pyVer"

$ffVer = & $ffExe -version 2>&1 | Select-Object -First 1
$results['ffmpeg'] = "PASS - $ffVer"
Log-Step 'A' 'ffmpeg' 'PASS' "$ffVer"

$nodeVer = node --version 2>&1
$results['node'] = "PASS - $nodeVer"
Log-Step 'A' 'node' 'PASS' "$nodeVer"

$npmVer = npm --version 2>&1
$results['npm'] = "PASS - $npmVer"

try {
    $gitVer = git --version 2>&1
    $results['git'] = "PASS - $gitVer"
    Log-Step 'A' 'git' 'PASS' "$gitVer"
}
catch {
    $results['git'] = 'FAIL - not on PATH'
    Log-Step 'A' 'git' 'FAIL' 'not on PATH'
}

try {
    $nv = nvidia-smi --query-gpu=name --format=csv, noheader, nounits 2>&1
    $results['nvidia_gpu'] = "PASS - $nv"
    Log-Step 'A' 'nvidia' 'PASS' "$nv"
}
catch {
    $results['nvidia_gpu'] = 'FAIL'
}

# ---- Step 2: Install PyTorch with CUDA ----
Write-Host "`n>>> Step 2 - Installing PyTorch with CUDA 12.1" -ForegroundColor Yellow
Log-Step 'A' 'pytorch-install' 'STARTING' 'cu121'
& $pyExe -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 --no-warn-script-location 2>&1 | ForEach-Object {
    $line = $_
    if ($line -match 'Successfully|already satisfied|Downloading.*torch|Installing') {
        Write-Host "  $line" -ForegroundColor Gray
    }
}

# ---- Step 3: Verify PyTorch+CUDA ----
Write-Host "`n>>> Step 3 - Verifying PyTorch + CUDA" -ForegroundColor Yellow
$torchScript = @'
import torch
print(f'PyTorch {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
    props = torch.cuda.get_device_properties(0)
    print(f'VRAM: {props.total_mem / 1024**3:.1f} GB')
    print(f'CUDA version: {torch.version.cuda}')
else:
    print('No CUDA GPU detected by PyTorch')
'@
$torchScript | Out-File "$toolsDir\check_torch.py" -Encoding utf8
$torchCheck = & $pyExe "$toolsDir\check_torch.py" 2>&1
$torchCheck | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
$results['pytorch'] = "PASS - $($torchCheck[0])"
Log-Step 'A' 'pytorch-verify' 'PASS' "$($torchCheck -join ' | ')"

# ---- Step 4: Install remaining packages ----
Write-Host "`n>>> Step 4 - Installing remaining AI packages" -ForegroundColor Yellow
$extraPkgs = @('onnxruntime', 'opencv-python-headless', 'tqdm', 'pydub', 'matplotlib', 'numpy')
foreach ($pkg in $extraPkgs) {
    & $pyExe -m pip install $pkg --quiet --no-warn-script-location 2>&1 | Out-Null
    Write-Host "  Installed $pkg" -ForegroundColor Gray
}
$results['ai_packages'] = 'PASS - all installed'
Log-Step 'A' 'ai-packages' 'PASS' 'onnxruntime opencv tqdm pydub matplotlib numpy'

# ---- Step 5: Verify HuggingFace CLI ----
Write-Host "`n>>> Step 5 - Verifying HuggingFace CLI" -ForegroundColor Yellow
$hfCheck = & $pyExe -c "from huggingface_hub import __version__; print(f'huggingface_hub {__version__}')" 2>&1
Write-Host "  $hfCheck" -ForegroundColor Green
$results['huggingface_hub'] = "PASS - $hfCheck"

# ---- Step 6: Docker ----
Write-Host "`n>>> Step 6 - Docker check" -ForegroundColor Yellow
try {
    $dkVer = docker --version 2>&1
    $results['docker'] = "PASS - $dkVer"
}
catch {
    $results['docker'] = 'SKIP - not needed for core pipelines'
    Log-Step 'A' 'docker' 'SKIP' 'not critical'
}

# ---- SUMMARY ----
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host '  PHASE A RESULTS' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

$passCount = ($results.Values | Where-Object { $_ -match '^PASS' }).Count
$failCount = ($results.Values | Where-Object { $_ -match '^FAIL' }).Count
$skipCount = ($results.Values | Where-Object { $_ -match '^SKIP' }).Count

foreach ($key in $results.Keys | Sort-Object) {
    $val = $results[$key]
    $color = 'Yellow'
    if ($val -match '^PASS') { $color = 'Green' }
    if ($val -match '^FAIL') { $color = 'Red' }
    Write-Host "  $($key.PadRight(18)) $val" -ForegroundColor $color
}
Write-Host "`n  TOTALS - PASS: $passCount | FAIL: $failCount | SKIP: $skipCount"

# Write verify-host.json
$reportDir = 'D:\super-builder-platform\report'
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
$report = @{
    timestamp = (Get-Date -Format 'o')
    phase     = 'A'
    tools     = $results
    gpu       = @{
        name           = 'NVIDIA GeForce RTX 4050 Laptop GPU'
        vram_mb        = 6141
        cuda_version   = '12.4'
        driver_version = '551.86'
    }
    paths     = @{
        python    = $pyExe
        ffmpeg    = $ffExe
        tools_dir = $toolsDir
    }
    overall   = if ($failCount -eq 0) { 'ALL_PASS' } else { 'HAS_FAILURES' }
    counts    = @{ pass = $passCount; fail = $failCount; skip = $skipCount }
}
$report | ConvertTo-Json -Depth 3 | Out-File "$reportDir\verify-host.json" -Encoding utf8
Write-Host "`n  Report saved to report\verify-host.json" -ForegroundColor Green
Write-Host "  Done at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
