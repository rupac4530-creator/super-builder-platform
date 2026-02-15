<#
.SYNOPSIS
  Artifact lifecycle manager — compress, prune, and retain vault artifacts.
.DESCRIPTION
  Manages the lifecycle of generated artifacts under ARTIFACT_ROOT:
  - Compresses old renders/checkpoints to backups/ (tar+gzip or zip)
  - Prunes temporary intermediate files
  - Enforces retention policies (configurable days)
  - DRY_RUN mode for safety preview
.PARAMETER ArtifactRoot
  Root directory for artifacts
.PARAMETER DryRun
  Show what would happen without actually modifying files
.PARAMETER CheckpointRetentionDays
  Keep training checkpoints for N days (default: 90)
.PARAMETER ExportRetentionDays
  Keep export archives for N days (default: 365)
.PARAMETER RenderRetentionDays
  Keep raw render frames for N days before archiving (default: 30)
#>

param(
    [string]$ArtifactRoot = $(if ($env:ARTIFACT_ROOT) { $env:ARTIFACT_ROOT } else { 'D:\super-builder-platform\data' }),
    [switch]$DryRun,
    [int]$CheckpointRetentionDays = $(if ($env:RETENTION_CHECKPOINTS_DAYS) { [int]$env:RETENTION_CHECKPOINTS_DAYS } else { 90 }),
    [int]$ExportRetentionDays = $(if ($env:RETENTION_EXPORTS_DAYS) { [int]$env:RETENTION_EXPORTS_DAYS } else { 365 }),
    [int]$RenderRetentionDays = 30
)

$ErrorActionPreference = 'Continue'
$now = Get-Date
$logPath = Join-Path $ArtifactRoot 'logs\lifecycle-log.txt'

Write-Host "=== Engine Alto — Artifact Lifecycle Manager ===" -ForegroundColor Cyan
Write-Host "ARTIFACT_ROOT: $ArtifactRoot"
Write-Host "DRY_RUN: $DryRun"
Write-Host "Checkpoint retention: $CheckpointRetentionDays days"
Write-Host "Export retention: $ExportRetentionDays days"
Write-Host "Render retention: $RenderRetentionDays days"
Write-Host ""

$logDir = Split-Path $logPath -Parent
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

Add-Content -Path $logPath -Value "=== Lifecycle run: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') DryRun=$DryRun ==="

$totalFreed = 0
$totalArchived = 0

# --- Archive old renders ---
Write-Host "--- Archiving old renders ---" -ForegroundColor Yellow
$rendersDir = Join-Path $ArtifactRoot 'renders'
$backupsDir = Join-Path $ArtifactRoot 'backups'
if (Test-Path $rendersDir) {
    $cutoff = $now.AddDays(-$RenderRetentionDays)
    $oldRenders = Get-ChildItem $rendersDir -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $cutoff }

    if ($oldRenders -and $oldRenders.Count -gt 0) {
        $archiveName = "renders-archive-$(Get-Date -Format 'yyyyMMdd').zip"
        $archivePath = Join-Path $backupsDir $archiveName
        $totalSize = ($oldRenders | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($totalSize / 1048576, 2)

        Write-Host "  Found $($oldRenders.Count) files older than $RenderRetentionDays days ($sizeMB MB)" -ForegroundColor DarkYellow
        if (-not $DryRun) {
            if (-not (Test-Path $backupsDir)) { New-Item -ItemType Directory -Path $backupsDir -Force | Out-Null }
            Compress-Archive -Path $oldRenders.FullName -DestinationPath $archivePath -Force -ErrorAction SilentlyContinue
            if (Test-Path $archivePath) {
                Write-Host "  Archived to: $archiveName" -ForegroundColor Green
                $totalArchived += $totalSize
                # Remove originals after successful archive
                $oldRenders | Remove-Item -Force -ErrorAction SilentlyContinue
                $totalFreed += $totalSize
            }
        }
        else {
            Write-Host "  [DRY RUN] Would archive $($oldRenders.Count) files ($sizeMB MB) to $archiveName"
        }
    }
    else {
        Write-Host "  No renders older than $RenderRetentionDays days" -ForegroundColor DarkGray
    }
}

# --- Prune old checkpoints ---
Write-Host "--- Pruning old checkpoints ---" -ForegroundColor Yellow
$checkpointsDir = Join-Path $ArtifactRoot 'checkpoints'
if (Test-Path $checkpointsDir) {
    $cutoff = $now.AddDays(-$CheckpointRetentionDays)
    $oldCheckpoints = Get-ChildItem $checkpointsDir -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $cutoff }

    if ($oldCheckpoints -and $oldCheckpoints.Count -gt 0) {
        $totalSize = ($oldCheckpoints | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($totalSize / 1048576, 2)

        Write-Host "  Found $($oldCheckpoints.Count) checkpoints older than $CheckpointRetentionDays days ($sizeMB MB)" -ForegroundColor DarkYellow
        if (-not $DryRun) {
            # Keep last 3 checkpoints per subdirectory
            $groups = $oldCheckpoints | Group-Object DirectoryName
            foreach ($g in $groups) {
                $toDelete = $g.Group | Sort-Object LastWriteTime -Descending | Select-Object -Skip 3
                $toDelete | Remove-Item -Force -ErrorAction SilentlyContinue
                $deletedSize = ($toDelete | Measure-Object -Property Length -Sum).Sum
                $totalFreed += $deletedSize
            }
            Write-Host "  Pruned (kept last 3 per directory)" -ForegroundColor Green
        }
        else {
            Write-Host "  [DRY RUN] Would prune $($oldCheckpoints.Count) files ($sizeMB MB), keeping last 3 per dir"
        }
    }
    else {
        Write-Host "  No checkpoints older than $CheckpointRetentionDays days" -ForegroundColor DarkGray
    }
}

# --- Clean temporary files ---
Write-Host "--- Cleaning temporary files ---" -ForegroundColor Yellow
$tempPatterns = @('*.tmp', '*.partial', '*.lock', '*.log.old', 'thumbs.db', '.ds_store')
$tempCount = 0
$tempSize = 0
foreach ($pattern in $tempPatterns) {
    $tempFiles = Get-ChildItem $ArtifactRoot -Recurse -Filter $pattern -Force -ErrorAction SilentlyContinue
    if ($tempFiles) {
        $tempCount += $tempFiles.Count
        $tempSize += ($tempFiles | Measure-Object -Property Length -Sum).Sum
        if (-not $DryRun) {
            $tempFiles | Remove-Item -Force -ErrorAction SilentlyContinue
        }
    }
}
if ($tempCount -gt 0) {
    $sizeMB = [math]::Round($tempSize / 1048576, 2)
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would remove $tempCount temp files ($sizeMB MB)" -ForegroundColor DarkYellow
    }
    else {
        Write-Host "  Removed $tempCount temp files ($sizeMB MB)" -ForegroundColor Green
        $totalFreed += $tempSize
    }
}
else {
    Write-Host "  No temporary files found" -ForegroundColor DarkGray
}

# --- Summary ---
Write-Host ""
Write-Host "=== Lifecycle Summary ===" -ForegroundColor Cyan
$freedMB = [math]::Round($totalFreed / 1048576, 2)
$archivedMB = [math]::Round($totalArchived / 1048576, 2)
Write-Host "Space freed: $freedMB MB" -ForegroundColor Green
Write-Host "Data archived: $archivedMB MB" -ForegroundColor Green

# Current vault size
$currentSize = (Get-ChildItem $ArtifactRoot -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { -not $_.PSIsContainer } |
    Measure-Object -Property Length -Sum).Sum
$currentGB = [math]::Round($currentSize / 1073741824, 2)
Write-Host "Current vault size: $currentGB GB" -ForegroundColor Cyan

Add-Content -Path $logPath -Value "  Freed: $freedMB MB, Archived: $archivedMB MB, Vault: $currentGB GB"
