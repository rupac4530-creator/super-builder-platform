$ErrorActionPreference = 'Continue'

Write-Host '=== Fixing Choco + Installing Tools ===' -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')"

# Fix choco temp directory issue
if (-not (Test-Path 'E:\Temp')) {
    Write-Host 'Creating E:\Temp for Chocolatey...'
    try {
        New-Item -ItemType Directory -Path 'E:\Temp' -Force | Out-Null
        New-Item -ItemType Directory -Path 'E:\Temp\chocolatey' -Force | Out-Null
        Write-Host '  Created E:\Temp\chocolatey' -ForegroundColor Green
    }
    catch {
        # If E: does not exist, override TEMP for choco
        Write-Host '  E: drive issue, overriding TEMP...'
        $env:TEMP = 'C:\Temp'
        $env:TMP = 'C:\Temp'
        if (-not (Test-Path 'C:\Temp')) { New-Item -ItemType Directory -Path 'C:\Temp' -Force | Out-Null }
    }
}

# Test choco is working now
Write-Host ''
Write-Host '--- Testing Chocolatey ---'
$chocoVer = & choco --version 2>&1
Write-Host "Choco version: $chocoVer"

# Install Python
Write-Host ''
Write-Host '--- Installing Python 3.11 ---' -ForegroundColor Yellow
& choco install python311 -y --no-progress 2>&1
Write-Host ''

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

# Check Python
Write-Host '--- Verifying Python ---'
foreach ($cmd in @('python', 'python3', 'py')) {
    try {
        $ver = & $cmd --version 2>&1
        Write-Host "  $cmd -> $ver" -ForegroundColor Green
    }
    catch {
        Write-Host "  $cmd -> NOT FOUND"
    }
}

# Install FFmpeg
Write-Host ''
Write-Host '--- Installing FFmpeg ---' -ForegroundColor Yellow
& choco install ffmpeg -y --no-progress 2>&1
Write-Host ''

# Refresh PATH again
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

# Check FFmpeg
Write-Host '--- Verifying FFmpeg ---'
try {
    $ffVer = & ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "  ffmpeg -> $ffVer" -ForegroundColor Green
}
catch {
    Write-Host '  ffmpeg -> NOT FOUND'
}

# Install Docker Desktop
Write-Host ''
Write-Host '--- Installing Docker ---' -ForegroundColor Yellow
& choco install docker-desktop -y --no-progress 2>&1
Write-Host ''

# Install Blender
Write-Host ''
Write-Host '--- Installing Blender ---' -ForegroundColor Yellow
& choco install blender -y --no-progress 2>&1

# Full check for nvidia-smi
Write-Host ''
Write-Host '--- NVIDIA GPU ---'
try {
    & nvidia-smi 2>&1 | Select-Object -First 15
}
catch {
    Write-Host 'nvidia-smi: NOT FOUND'
}

Write-Host ''
Write-Host '=== Installation Complete ===' -ForegroundColor Green
Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')"
