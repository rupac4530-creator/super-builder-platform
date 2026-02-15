# Engine Alto — Host Tool Verification (Windows PowerShell)
# Checks all required and optional tools, prints versions, exits 0 if critical tools present.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\verify_host.ps1

$Pass = 0
$Fail = 0
$Warn = 0

function Check-Tool {
    param(
        [string]$Name,
        [string]$Command,
        [bool]$Required = $true
    )

    $display = $Name.PadRight(20)

    try {
        $cmd = Get-Command $Command -ErrorAction Stop
        $version = ""

        switch ($Command) {
            "node"       { $version = & node --version 2>$null }
            "python"     { $version = & python --version 2>$null }
            "python3"    { $version = & python3 --version 2>$null }
            "py"         { $version = & py --version 2>$null }
            "git"        { $version = & git --version 2>$null }
            "docker"     { $version = & docker --version 2>$null }
            "ffmpeg"     { $version = (& ffmpeg -version 2>$null | Select-Object -First 1) }
            "blender"    { $version = (& blender --version 2>$null | Select-Object -First 1) }
            "nvidia-smi" { $version = & nvidia-smi --query-gpu=name,driver_version --format=csv,noheader 2>$null }
            default      { $version = "found" }
        }

        Write-Host "${display} " -NoNewline
        Write-Host "OK $version" -ForegroundColor Green
        $script:Pass++
    }
    catch {
        Write-Host "${display} " -NoNewline
        if ($Required) {
            Write-Host "NOT FOUND (REQUIRED)" -ForegroundColor Red
            $script:Fail++
        } else {
            Write-Host "NOT FOUND (optional)" -ForegroundColor Yellow
            $script:Warn++
        }
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Engine Alto — Host Tool Verification (Windows)"   -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "--- Required Tools ---"
Check-Tool -Name "Node.js" -Command "node" -Required $true
Check-Tool -Name "Git" -Command "git" -Required $true
Check-Tool -Name "Docker" -Command "docker" -Required $false

Write-Host ""
Write-Host "--- Python (one required) ---"
$pythonFound = $false
foreach ($cmd in @("python", "python3", "py")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Check-Tool -Name "Python ($cmd)" -Command $cmd -Required $true
        $pythonFound = $true
        break
    }
}
if (-not $pythonFound) {
    Write-Host "Python".PadRight(20) -NoNewline
    Write-Host " NOT FOUND (REQUIRED)" -ForegroundColor Red
    $Fail++
}

Write-Host ""
Write-Host "--- Media & GPU Tools ---"
Check-Tool -Name "FFmpeg" -Command "ffmpeg" -Required $false
Check-Tool -Name "Blender" -Command "blender" -Required $false
Check-Tool -Name "NVIDIA SMI" -Command "nvidia-smi" -Required $false

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Results: $Pass passed | $Fail failed | $Warn optional missing"
Write-Host "==================================================" -ForegroundColor Cyan

if ($Fail -gt 0) {
    Write-Host ""
    Write-Host "VERIFICATION FAILED — $Fail required tools missing" -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "All required tools present. Platform is ready." -ForegroundColor Green
    exit 0
}
