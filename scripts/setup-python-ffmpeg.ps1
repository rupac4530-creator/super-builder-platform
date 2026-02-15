# Future Enhancement Setup Script for Engine Alto
# This script sets up Python and FFmpeg on Windows when they are not properly on PATH
# Usage: powershell -ExecutionPolicy Bypass -File scripts\setup-python-ffmpeg.ps1

$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Engine Alto — Python & FFmpeg Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to check if a command is available
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to add path to system PATH
function Add-SystemPath {
    param([string]$PathToAdd)
    
    # Get current system PATH
    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    
    # Check if path already exists
    if ($currentPath -notlike "*$PathToAdd*") {
        Write-Host "Adding $PathToAdd to system PATH..."
        $newPath = "$currentPath;$PathToAdd"
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
        Write-Host "System PATH updated. You may need to restart your terminal." -ForegroundColor Yellow
        return $true
    } else {
        Write-Host "$PathToAdd already in system PATH" -ForegroundColor Green
        return $false
    }
}

# Check current status
Write-Host "`nChecking current installations..." -ForegroundColor Yellow

$pythonInstalled = $false
$ffmpegInstalled = $false

# Check Python
if (Test-Command "python") {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
    $pythonInstalled = $true
} elseif (Test-Command "python3") {
    $pythonVersion = python3 --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
    $pythonInstalled = $true
} elseif (Test-Command "py") {
    $pythonVersion = py --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
    $pythonInstalled = $true
} else {
    Write-Host "Python NOT found on PATH" -ForegroundColor Red
}

# Check FFmpeg
if (Test-Command "ffmpeg") {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "FFmpeg found: $ffmpegVersion" -ForegroundColor Green
    $ffmpegInstalled = $true
} else {
    Write-Host "FFmpeg NOT found on PATH" -ForegroundColor Red
}

# Install Python if needed
if (-not $pythonInstalled) {
    Write-Host "`nInstalling Python..." -ForegroundColor Yellow
    try {
        winget install Python.Python.3.11 --accept-package-agreements
        Write-Host "Python installation completed" -ForegroundColor Green
        
        # Try to find Python installation path
        $pythonPaths = @(
            "C:\Python311",
            "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311",
            "C:\Program Files\Python311"
        )
        
        foreach ($path in $pythonPaths) {
            if (Test-Path $path) {
                $pythonBinPath = Join-Path $path "Scripts"
                if (Test-Path $pythonBinPath) {
                    Add-SystemPath $pythonBinPath
                    Add-SystemPath $path
                    break
                }
            }
        }
    } catch {
        Write-Host "Failed to install Python: $_" -ForegroundColor Red
    }
}

# Install FFmpeg if needed
if (-not $ffmpegInstalled) {
    Write-Host "`nInstalling FFmpeg..." -ForegroundColor Yellow
    try {
        winget install Gyan.FFmpeg
        Write-Host "FFmpeg installation completed" -ForegroundColor Green
        
        # Try to find FFmpeg installation path
        $ffmpegPaths = @(
            "C:\ffmpeg",
            "C:\Program Files\ffmpeg",
            "C:\ffmpeg\bin"
        )
        
        foreach ($path in $ffmpegPaths) {
            if (Test-Path $path) {
                Add-SystemPath $path
                break
            }
        }
    } catch {
        Write-Host "Failed to install FFmpeg: $_" -ForegroundColor Red
    }
}

# Verify installations
Write-Host "`nVerifying installations..." -ForegroundColor Yellow

$verificationPassed = $true

if (Test-Command "python") {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python verified: $pythonVersion" -ForegroundColor Green
} elseif (Test-Command "python3") {
    $pythonVersion = python3 --version 2>&1
    Write-Host "✓ Python verified: $pythonVersion" -ForegroundColor Green
} elseif (Test-Command "py") {
    $pythonVersion = py --version 2>&1
    Write-Host "✓ Python verified: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python still not found on PATH" -ForegroundColor Red
    $verificationPassed = $false
}

if (Test-Command "ffmpeg") {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "✓ FFmpeg verified: $ffmpegVersion" -ForegroundColor Green
} else {
    Write-Host "✗ FFmpeg still not found on PATH" -ForegroundColor Red
    $verificationPassed = $false
}

# Install Hugging Face CLI if Python is available
if ($verificationPassed) {
    Write-Host "`nInstalling Hugging Face CLI..." -ForegroundColor Yellow
    try {
        python -m pip install huggingface-hub[cli]
        Write-Host "✓ Hugging Face CLI installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to install Hugging Face CLI: $_" -ForegroundColor Red
    }
}

# Final status
Write-Host "`n========================================" -ForegroundColor Cyan
if ($verificationPassed) {
    Write-Host "  Setup completed successfully!" -ForegroundColor Green
    Write-Host "  You may need to restart your terminal for PATH changes to take effect." -ForegroundColor Yellow
    Write-Host "  Run 'scripts\verify_host.ps1' to verify all tools are working." -ForegroundColor Yellow
} else {
    Write-Host "  Setup completed with issues." -ForegroundColor Red
    Write-Host "  Please check the error messages above and try again." -ForegroundColor Red
    Write-Host "  You may need to manually add Python and FFmpeg to your system PATH." -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan

# Exit with appropriate code
if ($verificationPassed) { exit 0 } else { exit 1 }