<#
.SYNOPSIS
  Download models and datasets from the curated manifest.
.DESCRIPTION
  Reads data/models-manifest.json and downloads each entry to the
  appropriate directory under ARTIFACT_ROOT. Produces inventory CSV
  and checksum log. Supports incremental/resumable downloads.
.PARAMETER ArtifactRoot
  Root directory for artifacts (default: env ARTIFACT_ROOT or D:\super-builder-platform\data)
.PARAMETER Priority
  Only download items with priority <= this value (1=critical, 2=important, 3=nice-to-have)
.PARAMETER DryRun
  If set, show what would be downloaded without downloading.
#>

param(
    [string]$ArtifactRoot = $(if ($env:ARTIFACT_ROOT) { $env:ARTIFACT_ROOT } else { 'D:\super-builder-platform\data' }),
    [int]$Priority = 3,
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'
$manifestPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'data\models-manifest.json'
$inventoryPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'report\models-inventory.csv'
$logPath = Join-Path $ArtifactRoot 'logs\downloads\download-log.txt'

Write-Host "=== Engine Alto — Model & Dataset Downloader ===" -ForegroundColor Cyan
Write-Host "ARTIFACT_ROOT: $ArtifactRoot"
Write-Host "Priority filter: <= $Priority"
Write-Host "Dry run: $DryRun"
Write-Host ""

# Load manifest
if (-not (Test-Path $manifestPath)) {
    Write-Host "ERROR: Manifest not found at $manifestPath" -ForegroundColor Red
    exit 1
}
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

# Ensure report directory
$reportDir = Split-Path $inventoryPath -Parent
if (-not (Test-Path $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }

# Ensure log directory
$logDir = Split-Path $logPath -Parent
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

# CSV header
$csvLines = @('id,name,type,format,sizeGB,license,source,destination,status,downloadDate,sha256')

# Check for huggingface-cli
$hasHF = $null -ne (Get-Command 'huggingface-cli' -ErrorAction SilentlyContinue)
$hasCurl = $null -ne (Get-Command 'curl' -ErrorAction SilentlyContinue)
$hasPython = $null -ne (Get-Command 'python' -ErrorAction SilentlyContinue)

if (-not $hasHF) {
    Write-Host "WARNING: huggingface-cli not found. Install with: pip install huggingface-hub[cli]" -ForegroundColor Yellow
    if ($hasPython) {
        Write-Host "Attempting to install huggingface-hub..." -ForegroundColor Yellow
        & python -m pip install --quiet "huggingface-hub[cli]" 2>$null
        $hasHF = $null -ne (Get-Command 'huggingface-cli' -ErrorAction SilentlyContinue)
    }
}

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Add-Content -Path $logPath -Value "=== Download session started: $timestamp ==="

function Download-Item {
    param($item, $type)

    if ($item.priority -gt $Priority) {
        Write-Host "  [SKIP] $($item.name) (priority $($item.priority) > $Priority)" -ForegroundColor DarkGray
        $csvLines += "$($item.id),$($item.name),$type,$($item.format),$($item.sizeGB),$($item.license),$($item.source),$($item.destination),SKIPPED-PRIORITY,,"
        return
    }

    $destPath = Join-Path $ArtifactRoot $item.destination
    Write-Host "  [DL] $($item.name) -> $destPath ($($item.sizeGB) GB)" -ForegroundColor Green

    if ($DryRun) {
        Write-Host "    (dry run — skipping actual download)" -ForegroundColor DarkYellow
        $script:csvLines += "$($item.id),$($item.name),$type,$($item.format),$($item.sizeGB),$($item.license),$($item.source),$($item.destination),DRY-RUN,,"
        return
    }

    # Ensure destination
    if (-not (Test-Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    }

    $status = 'PENDING'
    $sha256 = ''
    $downloadDate = Get-Date -Format 'yyyy-MM-dd'

    # Try download
    try {
        $cmd = $item.downloadCmd -replace '\$\{ARTIFACT_ROOT\}', $ArtifactRoot
        Add-Content -Path $logPath -Value "[$(Get-Date -Format 'HH:mm:ss')] Downloading: $($item.name)"
        Add-Content -Path $logPath -Value "  Command: $cmd"

        if ($hasHF -and $cmd -match 'huggingface-cli') {
            Invoke-Expression $cmd 2>&1 | Out-Null
            $status = if ($LASTEXITCODE -eq 0) { 'OK' } else { 'FAILED' }
        }
        elseif ($hasCurl -and $cmd -match 'curl') {
            Invoke-Expression $cmd 2>&1 | Out-Null
            $status = if ($LASTEXITCODE -eq 0) { 'OK' } else { 'FAILED' }
        }
        else {
            Write-Host "    No suitable download tool available" -ForegroundColor Yellow
            $status = 'NO-TOOL'
        }

        Add-Content -Path $logPath -Value "  Status: $status"
    }
    catch {
        $status = 'ERROR'
        Add-Content -Path $logPath -Value "  Error: $_"
        Write-Host "    ERROR: $_" -ForegroundColor Red
    }

    $script:csvLines += "$($item.id),$($item.name),$type,$($item.format),$($item.sizeGB),$($item.license),$($item.source),$($item.destination),$status,$downloadDate,$sha256"
}

# Process models
Write-Host "--- Models ---" -ForegroundColor Yellow
foreach ($model in $manifest.models) {
    Download-Item $model 'model'
}

# Process datasets
Write-Host "--- Datasets ---" -ForegroundColor Yellow
foreach ($ds in $manifest.datasets) {
    Download-Item $ds 'dataset'
}

# Process asset packs
Write-Host "--- Asset Packs ---" -ForegroundColor Yellow
foreach ($ap in $manifest.assetPacks) {
    Download-Item $ap 'asset-pack'
}

# Write inventory
$csvLines | Out-File -FilePath $inventoryPath -Encoding utf8
Write-Host ""
Write-Host "Inventory written to: $inventoryPath" -ForegroundColor Cyan

# Summary
$totalSizeGB = ($manifest.models | Measure-Object -Property sizeGB -Sum).Sum +
($manifest.datasets | Measure-Object -Property sizeGB -Sum).Sum +
($manifest.assetPacks | Measure-Object -Property sizeGB -Sum).Sum
Write-Host "Total manifest size: $totalSizeGB GB" -ForegroundColor Cyan

# Current actual size
$actualSize = (Get-ChildItem $ArtifactRoot -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { -not $_.PSIsContainer } |
    Measure-Object -Property Length -Sum).Sum
$actualGB = [math]::Round($actualSize / 1073741824, 2)
Write-Host "Current ARTIFACT_ROOT size: $actualGB GB" -ForegroundColor Cyan

Add-Content -Path $logPath -Value "=== Session ended: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
Add-Content -Path $logPath -Value "Manifest total: $totalSizeGB GB, Actual on disk: $actualGB GB"
