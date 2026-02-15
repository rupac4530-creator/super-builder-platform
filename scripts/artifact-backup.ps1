# Engine Alto — Artifact Backup Script
# Phase I: Mirror data to external storage

param(
    [string]$Destination = 'F:\engine-alto-backups',
    [switch]$DryRun,
    [switch]$Full
)

$ErrorActionPreference = 'Continue'
$source = 'D:\super-builder-platform\data'
$logFile = 'D:\super-builder-platform\logs\backup.log'

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Engine Alto Artifact Backup' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# Ensure destination exists
if (-not (Test-Path $Destination)) {
    Write-Host "  Destination not found: $Destination" -ForegroundColor Yellow
    Write-Host "  Creating backup directory..." -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
    catch {
        Write-Host "  Cannot create $Destination - backup to local archive instead" -ForegroundColor Red
        $Destination = 'D:\super-builder-platform\data\backups\local-mirror'
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
}

Write-Host "  Source:      $source"
Write-Host "  Destination: $Destination"

# Priority dirs for backup
$backupDirs = @(
    @{ Name = 'models'; Priority = 'CRITICAL'; Description = 'AI model weights' },
    @{ Name = 'renders'; Priority = 'HIGH'; Description = 'Rendered outputs' },
    @{ Name = 'checkpoints'; Priority = 'HIGH'; Description = 'Training checkpoints' },
    @{ Name = 'datasets'; Priority = 'MEDIUM'; Description = 'Training datasets' },
    @{ Name = 'assets'; Priority = 'MEDIUM'; Description = 'Generated assets' },
    @{ Name = 'previews'; Priority = 'LOW'; Description = 'Preview files' },
    @{ Name = 'exports'; Priority = 'LOW'; Description = 'Export bundles' }
)

$stats = @{
    total_dirs  = 0
    total_files = 0
    total_size  = 0
    errors      = 0
}

foreach ($dir in $backupDirs) {
    $srcPath = Join-Path $source $dir.Name
    $dstPath = Join-Path $Destination $dir.Name
    
    if (-not (Test-Path $srcPath)) {
        Write-Host "  SKIP: $($dir.Name) (not found)" -ForegroundColor Yellow
        continue
    }
    
    $files = Get-ChildItem $srcPath -File -Recurse -ErrorAction SilentlyContinue
    $dirSize = ($files | Measure-Object -Property Length -Sum).Sum
    
    Write-Host "`n  [$($dir.Priority)] $($dir.Name): $($files.Count) files, $([math]::Round($dirSize/1GB, 2)) GB"
    
    if ($DryRun) {
        Write-Host "    DRY RUN - would copy to $dstPath" -ForegroundColor Yellow
    }
    else {
        try {
            # Use robocopy for efficient mirroring
            $roboArgs = @($srcPath, $dstPath, '/MIR', '/MT:4', '/R:2', '/W:5', '/NFL', '/NDL', '/NJH', '/NJS')
            if (-not $Full) {
                # Incremental: only copy newer files
                $roboArgs += '/XO'
            }
            $roboResult = & robocopy @roboArgs 2>&1
            Write-Host "    Backed up to $dstPath" -ForegroundColor Green
        }
        catch {
            Write-Host "    ERROR backing up: $_" -ForegroundColor Red
            $stats.errors++
        }
    }
    
    $stats.total_dirs++
    $stats.total_files += $files.Count
    $stats.total_size += $dirSize
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host '  BACKUP SUMMARY' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host "  Directories: $($stats.total_dirs)"
Write-Host "  Files:       $($stats.total_files)"
Write-Host "  Total size:  $([math]::Round($stats.total_size/1GB, 2)) GB"
Write-Host "  Errors:      $($stats.errors)"
if ($DryRun) { Write-Host "  MODE: DRY RUN" -ForegroundColor Yellow }

$report = @{
    timestamp   = (Get-Date -Format 'o')
    source      = $source
    destination = $Destination
    stats       = $stats
    dry_run     = [bool]$DryRun
}
$report | ConvertTo-Json -Depth 3 | Out-File 'D:\super-builder-platform\report\backup-report.json' -Encoding utf8
Write-Host "  Report: report\backup-report.json" -ForegroundColor Green
