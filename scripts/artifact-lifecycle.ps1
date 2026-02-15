# Engine Alto — Artifact Lifecycle & Retention Policy
# Phase I: Manages artifact retention, cleanup, and archival

param(
    [int]$HotRetentionDays = 30,
    [int]$WarmRetentionDays = 90,
    [int]$ColdRetentionDays = 365,
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = 'Continue'
$dataRoot = 'D:\super-builder-platform\data'
$logFile = 'D:\super-builder-platform\logs\lifecycle.log'

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Artifact Lifecycle Manager' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# Tier definitions
$tiers = @{
    hot       = @{
        dirs           = @('previews', 'exports')
        retention_days = $HotRetentionDays
        action         = 'keep'
    }
    warm      = @{
        dirs           = @('renders', 'checkpoints')
        retention_days = $WarmRetentionDays
        action         = 'compress_then_archive'
    }
    cold      = @{
        dirs           = @('datasets', 'assets')
        retention_days = $ColdRetentionDays
        action         = 'archive_to_external'
    }
    permanent = @{
        dirs           = @('models')
        retention_days = -1  # Never delete
        action         = 'keep'
    }
}

$stats = @{
    scanned          = 0
    kept             = 0
    would_archive    = 0
    would_delete     = 0
    total_size_freed = 0
}

foreach ($tierName in $tiers.Keys) {
    $tier = $tiers[$tierName]
    Write-Host "`n>>> Tier: $tierName (retention: $($tier.retention_days) days)" -ForegroundColor Yellow
    
    foreach ($dirName in $tier.dirs) {
        $dir = Join-Path $dataRoot $dirName
        if (-not (Test-Path $dir)) { continue }
        
        $files = Get-ChildItem $dir -File -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $stats.scanned++
            $age = (Get-Date) - $file.LastWriteTime
            
            if ($tier.retention_days -eq -1) {
                $stats.kept++
                continue
            }
            
            if ($age.TotalDays -gt $tier.retention_days) {
                $stats.would_archive++
                $stats.total_size_freed += $file.Length
                
                if ($Verbose) {
                    Write-Host "    ARCHIVE: $($file.Name) (age: $([math]::Round($age.TotalDays))d, size: $([math]::Round($file.Length/1MB, 1))MB)"
                }
                
                if (-not $DryRun) {
                    # Archive to backup location
                    $archivePath = Join-Path $dataRoot "backups\archived\$dirName"
                    if (-not (Test-Path $archivePath)) { New-Item -ItemType Directory -Path $archivePath -Force | Out-Null }
                    # Move to archive (in real deployment, this would go to external storage)
                    # Move-Item $file.FullName $archivePath -Force
                }
            }
            else {
                $stats.kept++
            }
        }
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host '  LIFECYCLE SUMMARY' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host "  Files scanned:    $($stats.scanned)"
Write-Host "  Files kept:       $($stats.kept)"
Write-Host "  Would archive:    $($stats.would_archive)"
Write-Host "  Space to free:    $([math]::Round($stats.total_size_freed/1GB, 2)) GB"
if ($DryRun) { Write-Host "  MODE: DRY RUN (no changes made)" -ForegroundColor Yellow }

$result = @{
    timestamp           = (Get-Date -Format 'o')
    hot_retention_days  = $HotRetentionDays
    warm_retention_days = $WarmRetentionDays
    cold_retention_days = $ColdRetentionDays
    stats               = $stats
    dry_run             = [bool]$DryRun
}
$result | ConvertTo-Json -Depth 3 | Out-File "$dataRoot\..\report\lifecycle-report.json" -Encoding utf8
Write-Host "  Report: report\lifecycle-report.json" -ForegroundColor Green
