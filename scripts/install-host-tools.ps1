# Engine Alto - Host Tools Installer
# Installs Python 3.11, FFmpeg, Redis (Docker), and AI Python packages
# Usage: powershell -ExecutionPolicy Bypass -File scripts\install-host-tools.ps1

$ErrorActionPreference = 'Continue'

function Write-Step { param([string]$msg) Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-Ok { param([string]$msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail { param([string]$msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red }

$results = @{}
$logFile = "d:\super-builder-platform\logs\agent-execution.log"
if (-not (Test-Path (Split-Path $logFile))) { New-Item -ItemType Directory -Path (Split-Path $logFile) -Force | Out-Null }

function Log-Entry {
    param([string]$phase, [string]$step, [string]$status, [string]$detail)
    $entry = @{
        timestamp = (Get-Date -Format 'o')
        phase     = $phase
        step      = $step
        status    = $status
        detail    = $detail
    } | ConvertTo-Json -Compress
    Add-Content -Path $logFile -Value $entry
}

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Engine Alto - Host Tools Installer" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# ---- 1. PYTHON ----
Write-Step "Checking Python..."
$pythonCmd = $null
foreach ($cmd in @('python', 'python3', 'py')) {
    try {
        $ver = & $cmd --version 2>&1
        if ($ver -match 'Python 3') {
            $pythonCmd = $cmd
            Write-Ok "Python found: $ver (command: $cmd)"
            $results['python'] = "PASS: $ver"
            Log-Entry 'A' 'python-check' 'PASS' "$ver"
            break
        }
    }
    catch {}
}

if (-not $pythonCmd) {
    Write-Host "  Python not found. Installing via winget..." -ForegroundColor Yellow
    Log-Entry 'A' 'python-install' 'STARTING' 'winget install'
    try {
        & winget install Python.Python.3.11 --accept-package-agreements --accept-source-agreements --silent 2>&1
        # Refresh PATH after install
        $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
        # Also check common install paths
        $commonPaths = @(
            "$env:LOCALAPPDATA\Programs\Python\Python311",
            "$env:LOCALAPPDATA\Programs\Python\Python311\Scripts",
            "C:\Python311",
            "C:\Python311\Scripts",
            "C:\Program Files\Python311",
            "C:\Program Files\Python311\Scripts"
        )
        foreach ($p in $commonPaths) {
            if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) {
                $env:Path += ";$p"
            }
        }
        foreach ($cmd in @('python', 'python3', 'py')) {
            try {
                $ver = & $cmd --version 2>&1
                if ($ver -match 'Python 3') {
                    $pythonCmd = $cmd
                    Write-Ok "Python installed: $ver"
                    $results['python'] = "PASS: $ver"
                    Log-Entry 'A' 'python-install' 'PASS' "$ver"
                    break
                }
            }
            catch {}
        }
        if (-not $pythonCmd) {
            Write-Fail "Python install completed but not found on PATH"
            $results['python'] = "FAIL: installed but not on PATH"
            Log-Entry 'A' 'python-install' 'FAIL' 'not on PATH after install'
        }
    }
    catch {
        Write-Fail "Python install failed: $_"
        $results['python'] = "FAIL: $($_.Exception.Message)"
        Log-Entry 'A' 'python-install' 'FAIL' "$($_.Exception.Message)"
    }
}

# ---- 2. FFMPEG ----
Write-Step "Checking FFmpeg..."
try {
    $ffVer = & ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Ok "FFmpeg found: $ffVer"
    $results['ffmpeg'] = "PASS: $ffVer"
    Log-Entry 'A' 'ffmpeg-check' 'PASS' "$ffVer"
}
catch {
    Write-Host "  FFmpeg not found. Installing via winget..." -ForegroundColor Yellow
    Log-Entry 'A' 'ffmpeg-install' 'STARTING' 'winget install'
    try {
        & winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements --silent 2>&1
        $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
        # Check common FFmpeg paths
        $ffPaths = @(
            "C:\ffmpeg\bin",
            "C:\Program Files\ffmpeg\bin",
            "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*\bin"
        )
        foreach ($p in $ffPaths) {
            $resolved = Resolve-Path $p -ErrorAction SilentlyContinue
            if ($resolved) {
                foreach ($rp in $resolved) {
                    if ($env:Path -notlike "*$($rp.Path)*") { $env:Path += ";$($rp.Path)" }
                }
            }
        }
        try {
            $ffVer = & ffmpeg -version 2>&1 | Select-Object -First 1
            Write-Ok "FFmpeg installed: $ffVer"
            $results['ffmpeg'] = "PASS: $ffVer"
            Log-Entry 'A' 'ffmpeg-install' 'PASS' "$ffVer"
        }
        catch {
            Write-Fail "FFmpeg installed but not on PATH"
            $results['ffmpeg'] = "FAIL: installed but not on PATH"
            Log-Entry 'A' 'ffmpeg-install' 'FAIL' 'not on PATH'
        }
    }
    catch {
        Write-Fail "FFmpeg install failed: $_"
        $results['ffmpeg'] = "FAIL: $($_.Exception.Message)"
        Log-Entry 'A' 'ffmpeg-install' 'FAIL' "$($_.Exception.Message)"
    }
}

# ---- 3. DOCKER ----
Write-Step "Checking Docker..."
try {
    $dkVer = & docker --version 2>&1
    if ($dkVer -match 'Docker') {
        Write-Ok "Docker found: $dkVer"
        $results['docker'] = "PASS: $dkVer"
        Log-Entry 'A' 'docker-check' 'PASS' "$dkVer"
    }
    else {
        throw "Docker returned unexpected output"
    }
}
catch {
    Write-Fail "Docker not available: $_"
    $results['docker'] = "FAIL: not available"
    Log-Entry 'A' 'docker-check' 'FAIL' "$($_.Exception.Message)"
}

# ---- 4. REDIS (via Docker) ----
Write-Step "Checking Redis..."
try {
    $redisCheck = & docker ps --filter "name=redis" --format "{{.Names}}" 2>&1
    if ($redisCheck -match 'redis') {
        Write-Ok "Redis container running"
        $results['redis'] = "PASS: Docker container running"
        Log-Entry 'A' 'redis-check' 'PASS' 'container running'
    }
    else {
        Write-Host "  Starting Redis via Docker..." -ForegroundColor Yellow
        & docker run -d --name redis -p 6379:6379 redis:7-alpine 2>&1
        Start-Sleep -Seconds 3
        $redisCheck2 = & docker ps --filter "name=redis" --format "{{.Names}}" 2>&1
        if ($redisCheck2 -match 'redis') {
            Write-Ok "Redis started via Docker"
            $results['redis'] = "PASS: started via Docker"
            Log-Entry 'A' 'redis-start' 'PASS' 'started via Docker'
        }
        else {
            Write-Fail "Redis container failed to start"
            $results['redis'] = "FAIL: container not running"
            Log-Entry 'A' 'redis-start' 'FAIL' 'container failed'
        }
    }
}
catch {
    Write-Fail "Redis setup failed: $_"
    $results['redis'] = "FAIL: $($_.Exception.Message)"
    Log-Entry 'A' 'redis-check' 'FAIL' "$($_.Exception.Message)"
}

# ---- 5. GIT + LFS ----
Write-Step "Checking Git and LFS..."
try {
    $gitVer = & git --version 2>&1
    Write-Ok "Git: $gitVer"
    $results['git'] = "PASS: $gitVer"
    & git lfs install 2>&1 | Out-Null
    Write-Ok "Git LFS initialized"
    $results['git_lfs'] = "PASS"
    Log-Entry 'A' 'git-check' 'PASS' "$gitVer"
}
catch {
    Write-Fail "Git issue: $_"
    $results['git'] = "FAIL"
    Log-Entry 'A' 'git-check' 'FAIL' "$($_.Exception.Message)"
}

# ---- 6. NODE ----
Write-Step "Checking Node.js..."
try {
    $nodeVer = & node --version 2>&1
    $npmVer = & npm --version 2>&1
    Write-Ok "Node: $nodeVer | npm: $npmVer"
    $results['node'] = "PASS: $nodeVer"
    $results['npm'] = "PASS: $npmVer"
    Log-Entry 'A' 'node-check' 'PASS' "$nodeVer"
}
catch {
    Write-Fail "Node.js not found"
    $results['node'] = "FAIL"
    Log-Entry 'A' 'node-check' 'FAIL' 'not found'
}

# ---- 7. NVIDIA / CUDA ----
Write-Step "Checking NVIDIA GPU..."
try {
    $nvsmi = & nvidia-smi --query-gpu=name, driver_version, memory.total --format=csv, noheader 2>&1
    Write-Ok "GPU: $nvsmi"
    $results['nvidia'] = "PASS: $nvsmi"
    Log-Entry 'A' 'nvidia-check' 'PASS' "$nvsmi"
}
catch {
    Write-Fail "nvidia-smi not available"
    $results['nvidia'] = "FAIL: nvidia-smi not found"
    Log-Entry 'A' 'nvidia-check' 'FAIL' 'not found'
}

# ---- 8. BLENDER ----
Write-Step "Checking Blender..."
$blenderCmd = $null
$blenderPaths = @(
    'blender',
    'C:\Program Files\Blender Foundation\Blender 4.0\blender.exe',
    'C:\Program Files\Blender Foundation\Blender 3.6\blender.exe',
    'C:\Program Files\Blender Foundation\Blender 4.1\blender.exe',
    'C:\Program Files\Blender Foundation\Blender 4.2\blender.exe'
)
foreach ($bp in $blenderPaths) {
    try {
        $bVer = & $bp --version 2>&1 | Select-Object -First 1
        if ($bVer -match 'Blender') {
            $blenderCmd = $bp
            Write-Ok "Blender: $bVer"
            $results['blender'] = "PASS: $bVer"
            Log-Entry 'A' 'blender-check' 'PASS' "$bVer"
            break
        }
    }
    catch {}
}
if (-not $blenderCmd) {
    Write-Host "  Blender not found. Installing via winget..." -ForegroundColor Yellow
    try {
        & winget install BlenderFoundation.Blender --accept-package-agreements --accept-source-agreements --silent 2>&1
        $results['blender'] = "INSTALLED: may need restart"
        Log-Entry 'A' 'blender-install' 'DONE' 'installed via winget'
    }
    catch {
        Write-Fail "Blender install failed"
        $results['blender'] = "FAIL"
        Log-Entry 'A' 'blender-install' 'FAIL' "$($_.Exception.Message)"
    }
}

# ---- 9. PYTHON PACKAGES ----
if ($pythonCmd) {
    Write-Step "Installing Python AI packages..."
    $packages = @(
        'huggingface_hub[cli]',
        'transformers',
        'diffusers',
        'accelerate',
        'safetensors',
        'Pillow',
        'scipy',
        'soundfile',
        'onnxruntime'
    )
    foreach ($pkg in $packages) {
        try {
            & $pythonCmd -m pip install $pkg --quiet 2>&1 | Out-Null
            Write-Ok "Installed: $pkg"
        }
        catch {
            Write-Fail "Failed: $pkg"
        }
    }
    # PyTorch with CUDA (large download)
    Write-Host "  Installing PyTorch with CUDA support (large download)..." -ForegroundColor Yellow
    try {
        & $pythonCmd -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 --quiet 2>&1
        Write-Ok "PyTorch with CUDA installed"
        $results['pytorch'] = "PASS"
        Log-Entry 'A' 'pytorch-install' 'PASS' 'cu121'
    }
    catch {
        Write-Fail "PyTorch install failed, trying CPU version..."
        & $pythonCmd -m pip install torch torchvision torchaudio --quiet 2>&1
        $results['pytorch'] = "PASS (CPU only)"
        Log-Entry 'A' 'pytorch-install' 'PASS' 'CPU only'
    }
}

# ---- SUMMARY ----
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
foreach ($key in $results.Keys | Sort-Object) {
    $val = $results[$key]
    $color = if ($val -match '^PASS') { 'Green' } elseif ($val -match '^FAIL') { 'Red' } else { 'Yellow' }
    Write-Host "  $($key.PadRight(12)): $val" -ForegroundColor $color
}

# Write verify-host.json
$reportDir = "d:\super-builder-platform\report"
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
$report = @{
    timestamp = (Get-Date -Format 'o')
    tools     = $results
    overall   = if (($results.Values | Where-Object { $_ -match '^FAIL' }).Count -eq 0) { 'ALL_PASS' } else { 'HAS_FAILURES' }
    failures  = ($results.Values | Where-Object { $_ -match '^FAIL' }).Count
}
$report | ConvertTo-Json -Depth 3 | Out-File "$reportDir\verify-host.json" -Encoding utf8
Write-Host "`n  Report saved to: report\verify-host.json" -ForegroundColor Green
