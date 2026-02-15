<#
.SYNOPSIS
  Backup artifact vault to external path or local snapshot.
.DESCRIPTION
  Creates incremental snapshots of the artifact vault using robocopy
  (Windows equivalent of rsync). Supports bandwidth limiting, verify,
  and timestamped snapshot naming.
.PARAMETER ArtifactRoot
  Source directory to back up
.PARAMETER BackupTarget
  Destination path (external drive, network share, etc.)
.PARAMETER BandwidthMBps
  Bandwidth limit in MB/s (0 = unlimited)
.PARAMETER Verify
  Verify files after copy
.PARAMETER DryRun
  Show what would be copied without doing it
#>

param(
    [string]$ArtifactRoot = $(if ($env:ARTIFACT_ROOT) { $env:ARTIFACT_ROOT } else { 'D:\super-builder-platform\data' }),
    [string]$BackupTarget = $(if ($env:BACKUP_EXTERNAL_PATH) { $env:BACKUP_EXTERNAL_PATH } else { 'D:\super-builder-platform\data\backups' }),
    [int]$BandwidthMBps = 0,
    [switch]$Verify,
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$snapshotName = "snap-$timestamp"
$logPath = Join-Path $ArtifactRoot 'logs\backup-log.txt'

Write-Host "=== Engine Alto — Artifact Backup ===" -ForegroundColor Cyan
Write-Host "Source: $ArtifactRoot"
Write-Host "Target: $BackupTarget\$snapshotName"
Write-Host "Bandwidth limit: $(if($BandwidthMBps -eq 0) {'unlimited'} else {"$BandwidthMBps MB/s"})"
Write-Host "Verify: $Verify"
Write-Host "Dry run: $DryRun"
Write-Host ""

# Ensure log directory
$logDir = Split-Path $logPath -Parent
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

Add-Content -Path $logPath -Value "=== Backup started: $timestamp ==="

# Ensure target exists
$targetPath = Join-Path $BackupTarget $snapshotName
if (-not $DryRun) {
    if (-not (Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    }
}

# Build robocopy command (excludes backups dir to avoid recursive copy)
$excludeDirs = @('backups', 'logs', '.git')
$excludeArgs = $excludeDirs | ForEach-Object { "/XD `"$_`"" }

# Calculate source size
$sourceSize = (Get-ChildItem $ArtifactRoot -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { -not $_.PSIsContainer } |
    Measure-Object -Property Length -Sum).Sum
$sourceGB = [math]::Round($sourceSize / 1073741824, 2)

Write-Host "Source size: $sourceGB GB" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN] Would copy $sourceGB GB from $ArtifactRoot to $targetPath" -ForegroundColor DarkYellow
    Write-Host "[DRY RUN] Excluding directories: $($excludeDirs -join ', ')"

    # List what would be copied
    $dirs = Get-ChildItem $ArtifactRoot -Directory | Where-Object { $_.Name -notin $excludeDirs }
    foreach ($d in $dirs) {
        $dSize = (Get-ChildItem $d.FullName -Recurse -Force -ErrorAction SilentlyContinue |
            Measure-Object -Property Length -Sum).Sum
        $dMB = [math]::Round($dSize / 1048576, 2)
        Write-Host "  $($d.Name): $dMB MB"
    }
}
else {
    Write-Host "Starting robocopy..." -ForegroundColor Yellow

    # Use robocopy for incremental copy
    $robocopyArgs = @(
        "`"$ArtifactRoot`"",
        "`"$targetPath`"",
        '/MIR',         # Mirror mode (incremental)
        '/R:3',         # Retry 3 times
        '/W:5',         # Wait 5 seconds between retries
        '/MT:8',        # 8 threads
        '/NP',          # No progress percentage (cleaner log)
        '/NDL',         # No directory list
        '/NFL'          # No file list (summary only)
    )

    # Add bandwidth limit (robocopy uses /IPG for inter-packet gap)
    if ($BandwidthMBps -gt 0) {
        $ipg = [math]::Round(1000 / $BandwidthMBps, 0)
        $robocopyArgs += "/IPG:$ipg"
    }

    # Add exclude dirs
    foreach ($exDir in $excludeDirs) {
        $robocopyArgs += "/XD `"$(Join-Path $ArtifactRoot $exDir)`""
    }

    $cmdLine = "robocopy $($robocopyArgs -join ' ')"
    Write-Host "  Command: $cmdLine" -ForegroundColor DarkGray

    Invoke-Expression $cmdLine
    $exitCode = $LASTEXITCODE

    # Robocopy exit codes: 0-7 = success/info, 8+ = error
    if ($exitCode -lt 8) {
        Write-Host "Backup completed successfully (exit code: $exitCode)" -ForegroundColor Green
        Add-Content -Path $logPath -Value "  Status: SUCCESS (exit $exitCode), Target: $targetPath"
    }
    else {
        Write-Host "Backup had errors (exit code: $exitCode)" -ForegroundColor Red
        Add-Content -Path $logPath -Value "  Status: ERROR (exit $exitCode)"
    }

    # Verify if requested
    if ($Verify) {
        Write-Host "Verifying backup..." -ForegroundColor Yellow
        $targetSize = (Get-ChildItem $targetPath -Recurse -Force -ErrorAction SilentlyContinue |
            Where-Object { -not $_.PSIsContainer } |
            Measure-Object -Property Length -Sum).Sum
        $targetGB = [math]::Round($targetSize / 1073741824, 2)
        $match = [math]::Abs($sourceGB - $targetGB) -lt 0.01
        if ($match) {
            Write-Host "  VERIFIED: Source ($sourceGB GB) matches target ($targetGB GB)" -ForegroundColor Green
        }
        else {
            Write-Host "  WARNING: Size mismatch — source $sourceGB GB vs target $targetGB GB" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== Backup Complete ===" -ForegroundColor Cyan
Add-Content -Path $logPath -Value "=== Backup ended: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') ==="
