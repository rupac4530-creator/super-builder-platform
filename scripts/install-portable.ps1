$ErrorActionPreference = 'Continue'
$toolsRoot = 'D:\super-builder-platform\tools'

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Engine Alto - Portable Tools Installer' -ForegroundColor Cyan
Write-Host '  (No admin privileges required)' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

if (-not (Test-Path $toolsRoot)) { New-Item -ItemType Directory -Path $toolsRoot -Force | Out-Null }

# ---- 1. PYTHON 3.11 EMBEDDABLE ----
$pyDir = "$toolsRoot\python311"
$pyExe = "$pyDir\python.exe"
if (-not (Test-Path $pyExe)) {
    Write-Host "`n>>> Downloading Python 3.11.9 embeddable..." -ForegroundColor Yellow
    $pyUrl = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
    $pyZip = "$toolsRoot\python-embed.zip"
    & curl.exe -L -o $pyZip $pyUrl --progress-bar 2>&1
    Write-Host '  Extracting...'
    Expand-Archive -Path $pyZip -DestinationPath $pyDir -Force
    Remove-Item $pyZip -Force
    
    # Enable pip in embeddable Python
    $pthFile = Get-ChildItem "$pyDir\python311._pth" -ErrorAction SilentlyContinue
    if ($pthFile) {
        # Uncomment import site
        $content = Get-Content $pthFile.FullName
        $content = $content -replace '#import site', 'import site'
        $content | Set-Content $pthFile.FullName
    }
    
    # Download get-pip.py
    Write-Host '  Installing pip...'
    & curl.exe -L -o "$pyDir\get-pip.py" 'https://bootstrap.pypa.io/get-pip.py' --progress-bar 2>&1
    & "$pyExe" "$pyDir\get-pip.py" --no-warn-script-location 2>&1
    
    Write-Host '  [OK] Python installed' -ForegroundColor Green
}
else {
    Write-Host "`n  [OK] Python already installed at $pyDir" -ForegroundColor Green
}

# Verify Python
$pyVer = & $pyExe --version 2>&1
Write-Host "  Python: $pyVer"

# Add to PATH for this session
$env:Path = "$pyDir;$pyDir\Scripts;$env:Path"

# ---- 2. FFMPEG STATIC BUILD ----
$ffDir = "$toolsRoot\ffmpeg"
$ffExe = "$ffDir\ffmpeg.exe"
if (-not (Test-Path $ffExe)) {
    Write-Host "`n>>> Downloading FFmpeg static build..." -ForegroundColor Yellow
    $ffUrl = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'
    $ffZip = "$toolsRoot\ffmpeg.zip"
    & curl.exe -L -o $ffZip $ffUrl --progress-bar 2>&1
    Write-Host '  Extracting...'
    Expand-Archive -Path $ffZip -DestinationPath "$toolsRoot\ffmpeg-extract" -Force
    # Move bin contents to ffDir
    New-Item -ItemType Directory -Path $ffDir -Force | Out-Null
    $extractedBin = Get-ChildItem "$toolsRoot\ffmpeg-extract" -Recurse -Filter 'ffmpeg.exe' | Select-Object -First 1
    if ($extractedBin) {
        $binDir = Split-Path $extractedBin.FullName
        Copy-Item "$binDir\*" $ffDir -Force
    }
    Remove-Item "$toolsRoot\ffmpeg-extract" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $ffZip -Force -ErrorAction SilentlyContinue
    Write-Host '  [OK] FFmpeg installed' -ForegroundColor Green
}
else {
    Write-Host "`n  [OK] FFmpeg already installed at $ffDir" -ForegroundColor Green
}

# Add to PATH for this session
$env:Path = "$ffDir;$env:Path"

# Verify FFmpeg
try {
    $ffVer = & $ffExe -version 2>&1 | Select-Object -First 1
    Write-Host "  FFmpeg: $ffVer"
}
catch {
    Write-Host '  [FAIL] FFmpeg verification failed' -ForegroundColor Red
}

# ---- 3. NVIDIA GPU CHECK ----
Write-Host "`n>>> Checking NVIDIA GPU..." -ForegroundColor Yellow
try {
    & nvidia-smi 2>&1 | Select-Object -First 12
}
catch {
    Write-Host '  nvidia-smi: NOT FOUND'
}

# ---- 4. INSTALL PYTHON AI PACKAGES ----
Write-Host "`n>>> Installing Python AI packages..." -ForegroundColor Yellow
$pipCmd = "$pyDir\python.exe"
$packages = @(
    'huggingface_hub[cli]',
    'transformers',
    'diffusers[torch]',
    'accelerate',
    'safetensors',
    'Pillow',
    'scipy',
    'soundfile',
    'tqdm'
)

foreach ($pkg in $packages) {
    Write-Host "  Installing $pkg..." -ForegroundColor Gray
    & $pipCmd -m pip install $pkg --quiet --no-warn-script-location 2>&1 | Select-Object -Last 2
}

# PyTorch with CUDA
Write-Host "`n>>> Installing PyTorch with CUDA..." -ForegroundColor Yellow
& $pipCmd -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 --no-warn-script-location 2>&1 | Select-Object -Last 3

# ---- 5. VERIFY TORCH + CUDA ----
Write-Host "`n>>> Verifying PyTorch + CUDA..." -ForegroundColor Yellow
& $pipCmd -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0)}' if torch.cuda.is_available() else 'No CUDA GPU')" 2>&1

# ---- 6. VERIFY HF CLI ----
Write-Host "`n>>> Verifying Hugging Face CLI..." -ForegroundColor Yellow
& $pipCmd -m huggingface_hub.cli.cli version 2>&1

# ---- SUMMARY ----
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host '  INSTALLATION SUMMARY' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host "  Python:  $pyExe"
Write-Host "  FFmpeg:  $ffExe"
Write-Host "  Tools:   $toolsRoot"

# Create env-setup script
$envScript = @"
# Source this to add tools to PATH for current session
`$env:Path = "$pyDir;$pyDir\Scripts;$ffDir;" + `$env:Path
`$env:PYTHON_PATH = "$pyExe"
`$env:FFMPEG_PATH = "$ffExe"
"@
$envScript | Out-File "$toolsRoot\env-setup.ps1" -Encoding utf8
Write-Host "`n  Environment script: $toolsRoot\env-setup.ps1"

# Update .env with tool paths
$envFile = 'D:\super-builder-platform\.env'
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace 'PYTHON_PATH=.*', "PYTHON_PATH=$pyExe"
    $envContent = $envContent -replace 'FFMPEG_PATH=.*', "FFMPEG_PATH=$ffExe"
    $envContent | Set-Content $envFile
    Write-Host '  Updated .env with tool paths'
}

Write-Host "`n  Done at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
