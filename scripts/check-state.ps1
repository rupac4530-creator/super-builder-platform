$ErrorActionPreference = 'Continue'
Write-Host '=== SYSTEM STATE CHECK ===' -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Tools dir
$toolsDir = 'D:\super-builder-platform\tools'
Write-Host "`n--- Tools Directory ---"
if (Test-Path $toolsDir) {
    Get-ChildItem $toolsDir -Directory | ForEach-Object { Write-Host "  DIR: $($_.Name)" }
    Get-ChildItem $toolsDir -File | ForEach-Object { Write-Host "  FILE: $($_.Name) ($([math]::Round($_.Length/1MB,1)) MB)" }
}
else {
    Write-Host '  tools/ directory does not exist'
}

# Check portable Python
Write-Host "`n--- Python ---"
$pyExe = "$toolsDir\python311\python.exe"
if (Test-Path $pyExe) {
    $v = & $pyExe --version 2>&1
    Write-Host "  Portable: $v at $pyExe" -ForegroundColor Green
    # Check pip
    $pipCheck = & $pyExe -m pip --version 2>&1
    Write-Host "  pip: $pipCheck"
    # Check installed packages
    Write-Host "  Installed packages:"
    & $pyExe -m pip list --format=columns 2>&1 | Select-Object -First 20
}
else {
    Write-Host "  Portable Python NOT found at $pyExe" -ForegroundColor Red
    # Check system python
    foreach ($cmd in @('python', 'python3', 'py')) {
        try { $v = & $cmd --version 2>&1; Write-Host "  System $cmd : $v" -ForegroundColor Green } catch {}
    }
}

# Check FFmpeg
Write-Host "`n--- FFmpeg ---"
$ffExe = "$toolsDir\ffmpeg\ffmpeg.exe"
if (Test-Path $ffExe) {
    $v = & $ffExe -version 2>&1 | Select-Object -First 1
    Write-Host "  Portable: $v" -ForegroundColor Green
}
else {
    Write-Host "  Portable FFmpeg NOT found at $ffExe" -ForegroundColor Red
    try { $v = ffmpeg -version 2>&1 | Select-Object -First 1; Write-Host "  System: $v" } catch {}
}

# Check other tools
Write-Host "`n--- Other Tools ---"
try { $v = git --version 2>&1; Write-Host "  Git: $v" -ForegroundColor Green } catch { Write-Host '  Git: NOT FOUND' -ForegroundColor Red }
try { $v = node --version 2>&1; Write-Host "  Node: $v" -ForegroundColor Green } catch { Write-Host '  Node: NOT FOUND' -ForegroundColor Red }
try { $v = npm --version 2>&1; Write-Host "  npm: $v" -ForegroundColor Green } catch { Write-Host '  npm: NOT FOUND' -ForegroundColor Red }
try { $v = docker --version 2>&1; Write-Host "  Docker: $v" } catch { Write-Host '  Docker: NOT FOUND' -ForegroundColor Red }

# NVIDIA GPU
Write-Host "`n--- NVIDIA GPU ---"
try {
    & nvidia-smi 2>&1 | Select-Object -First 15
}
catch {
    Write-Host '  nvidia-smi: NOT FOUND' -ForegroundColor Red
}

# Data directory
Write-Host "`n--- Data Directory ---"
$dataDir = 'D:\super-builder-platform\data'
if (Test-Path $dataDir) {
    $stats = Get-ChildItem $dataDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
    Write-Host "  Total files: $($stats.Count)"
    Write-Host "  Total size: $([math]::Round($stats.Sum/1GB, 2)) GB"
    # Per subdirectory
    Get-ChildItem $dataDir -Directory | ForEach-Object {
        $sub = Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
        Write-Host "  $($_.Name): $($sub.Count) files, $([math]::Round($sub.Sum/1GB, 2)) GB"
    }
}
else {
    Write-Host '  data/ directory does not exist' -ForegroundColor Red
}

# Git status
Write-Host "`n--- Git ---"
try {
    $branch = git -C 'D:\super-builder-platform' branch --show-current 2>&1
    Write-Host "  Branch: $branch"
    $commits = git -C 'D:\super-builder-platform' log --oneline -5 2>&1
    Write-Host "  Recent commits:"
    $commits | ForEach-Object { Write-Host "    $_" }
}
catch {
    Write-Host '  Git repo issue'
}

Write-Host "`n=== CHECK COMPLETE ===" -ForegroundColor Cyan
