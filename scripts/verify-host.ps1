<#
.SYNOPSIS
  Engine Alto — Host Verification Script (Windows PowerShell)
.DESCRIPTION
  Checks all required host tools and produces report/verify-host.json
#>

$ErrorActionPreference = 'SilentlyContinue'

function Test-Command($cmd) {
    $result = @{ installed = $false; version = $null }
    try {
        $out = & $cmd --version 2>&1 | Select-Object -First 1
        if ($LASTEXITCODE -eq 0 -or $out -match '\d+\.\d+') {
            $result.installed = $true
            $result.version = ($out -replace '^\s+', '').Trim()
        }
    }
    catch { }
    return $result
}

function Test-NvidiaSmi {
    $result = @{ installed = $false; gpu = $null; driver = $null }
    try {
        $out = & nvidia-smi --query-gpu=name, driver_version --format=csv, noheader 2>&1
        if ($out -match ',') {
            $parts = $out -split ','
            $result.installed = $true
            $result.gpu = $parts[0].Trim()
            $result.driver = $parts[1].Trim()
        }
    }
    catch { }
    return $result
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Engine Alto — Host Verification"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$checks = @{}

# Node.js
$node = Test-Command "node"
$checks["node"] = $node
Write-Host "Node.js:    $(if ($node.installed) { '✅ ' + $node.version } else { '❌ NOT FOUND' })"

# npm
$npm = Test-Command "npm"
$checks["npm"] = $npm
Write-Host "npm:        $(if ($npm.installed) { '✅ ' + $npm.version } else { '❌ NOT FOUND' })"

# Git
$git = Test-Command "git"
$checks["git"] = $git
Write-Host "Git:        $(if ($git.installed) { '✅ ' + $git.version } else { '❌ NOT FOUND' })"

# Python
$python = Test-Command "python"
if (-not $python.installed) { $python = Test-Command "py" }
if (-not $python.installed) { $python = Test-Command "python3" }
$checks["python"] = $python
Write-Host "Python:     $(if ($python.installed) { '✅ ' + $python.version } else { '❌ NOT FOUND' })"

# Redis
$redis = Test-Command "redis-cli"
if (-not $redis.installed) { $redis = Test-Command "redis-server" }
$checks["redis"] = $redis
Write-Host "Redis:      $(if ($redis.installed) { '✅ ' + $redis.version } else { '❌ NOT FOUND' })"

# FFmpeg
$ffmpeg = Test-Command "ffmpeg"
$checks["ffmpeg"] = $ffmpeg
Write-Host "FFmpeg:     $(if ($ffmpeg.installed) { '✅ ' + $ffmpeg.version } else { '❌ NOT FOUND' })"

# Docker
$docker = Test-Command "docker"
$checks["docker"] = $docker
Write-Host "Docker:     $(if ($docker.installed) { '✅ ' + $docker.version } else { '❌ NOT FOUND' })"

# NVIDIA GPU
$gpu = Test-NvidiaSmi
$checks["nvidia_gpu"] = $gpu
Write-Host "NVIDIA GPU: $(if ($gpu.installed) { '✅ ' + $gpu.gpu + ' (driver ' + $gpu.driver + ')' } else { '❌ NOT FOUND' })"

# Blender
$blender = Test-Command "blender"
$checks["blender"] = $blender
Write-Host "Blender:    $(if ($blender.installed) { '✅ ' + $blender.version } else { '❌ NOT FOUND (optional)' })"

# Chromium / Chrome (for Puppeteer)
$chrome = @{ installed = $false; version = $null }
$chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromeExe) {
    $chrome.installed = $true
    $chrome.version = (Get-Item $chromeExe).VersionInfo.FileVersion
}
$checks["chrome"] = $chrome
Write-Host "Chrome:     $(if ($chrome.installed) { '✅ ' + $chrome.version } else { '⚠️  NOT FOUND (Puppeteer will download)' })"

Write-Host ""

# Summary
$required = @("node", "npm")
$recommended = @("git", "python", "redis", "ffmpeg", "docker")
$optional = @("nvidia_gpu", "blender", "chrome")

$requiredOk = ($required | ForEach-Object { $checks[$_].installed }) -notcontains $false
$missingRecommended = $recommended | Where-Object { -not $checks[$_].installed }

$report = @{
    timestamp           = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    platform            = "windows"
    checks              = $checks
    required_ok         = $requiredOk
    missing_recommended = @($missingRecommended)
    overall             = if ($requiredOk -and $missingRecommended.Count -eq 0) { "PASS" } else { "PARTIAL" }
}

# Ensure report directory exists
$reportDir = Join-Path $PSScriptRoot "..\report"
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }

$jsonPath = Join-Path $reportDir "verify-host.json"
$report | ConvertTo-Json -Depth 4 | Set-Content -Path $jsonPath -Encoding UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Overall: $($report.overall)"
Write-Host "  Report: $jsonPath"
Write-Host "========================================" -ForegroundColor Cyan

if ($report.overall -ne "PASS") {
    Write-Host ""
    Write-Host "Missing recommended tools: $($missingRecommended -join ', ')" -ForegroundColor Yellow
    Write-Host "See BLOCKING-ISSUE.md for install commands." -ForegroundColor Yellow
    exit 1
}

exit 0
