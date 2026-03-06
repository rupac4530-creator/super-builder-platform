<# 
.SYNOPSIS
    SuperBuilder Platform — Full System Backup Script
.DESCRIPTION
    Creates timestamped backups of the entire SuperBuilder platform.
    Protects all code, configs, routes, and data from accidental loss.
    Does NOT modify or delete any existing files.
#>

param(
    [string]$BackupRoot = ".\superbuilder-backups",
    [switch]$ArchiveOnly
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = Join-Path $BackupRoot $timestamp

Write-Host "`n=== SuperBuilder Platform Backup ===" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Gray
Write-Host "Backup location: $backupDir" -ForegroundColor Gray

# Create backup directory structure
$dirs = @(
    "$backupDir\backend",
    "$backupDir\platform",
    "$backupDir\scripts",
    "$backupDir\configs"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# Copy backend
Write-Host "`n[1/5] Backing up backend..." -ForegroundColor Yellow
if (Test-Path ".\backend\src") {
    Copy-Item -Path ".\backend\src" -Destination "$backupDir\backend\src" -Recurse -Force
}
if (Test-Path ".\backend\package.json") {
    Copy-Item ".\backend\package.json" "$backupDir\backend\package.json" -Force
}
if (Test-Path ".\backend\tsconfig.json") {
    Copy-Item ".\backend\tsconfig.json" "$backupDir\backend\tsconfig.json" -Force
}

# Copy frontend/platform
Write-Host "[2/5] Backing up platform (frontend)..." -ForegroundColor Yellow
if (Test-Path ".\platform\src") {
    Copy-Item -Path ".\platform\src" -Destination "$backupDir\platform\src" -Recurse -Force
}
if (Test-Path ".\platform\package.json") {
    Copy-Item ".\platform\package.json" "$backupDir\platform\package.json" -Force
}
if (Test-Path ".\platform\tsconfig.json") {
    Copy-Item ".\platform\tsconfig.json" "$backupDir\platform\tsconfig.json" -Force
}
if (Test-Path ".\platform\next.config.mjs") {
    Copy-Item ".\platform\next.config.mjs" "$backupDir\platform\next.config.mjs" -Force
}

# Copy scripts
Write-Host "[3/5] Backing up scripts..." -ForegroundColor Yellow
if (Test-Path ".\scripts") {
    Copy-Item -Path ".\scripts\*" -Destination "$backupDir\scripts" -Recurse -Force
}

# Copy root configs
Write-Host "[4/5] Backing up root configs..." -ForegroundColor Yellow
$rootFiles = @("SYSTEM_STATE.json", "package.json", ".env", ".env.example", "docker-compose.yml", "README.md")
foreach ($f in $rootFiles) {
    if (Test-Path ".\$f") {
        Copy-Item ".\$f" "$backupDir\configs\$f" -Force
    }
}

# Create archive (zip)
Write-Host "[5/5] Creating archive..." -ForegroundColor Yellow
$archiveDir = Join-Path $BackupRoot "archives"
New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
$zipPath = Join-Path $archiveDir "backup_$timestamp.zip"
Compress-Archive -Path "$backupDir\*" -DestinationPath $zipPath -Force

# Write backup log
$logPath = Join-Path $BackupRoot "backup-history.log"
$logEntry = "[$timestamp] Full system backup created -> $zipPath"
Add-Content -Path $logPath -Value $logEntry

# Summary
$fileCount = (Get-ChildItem -Path $backupDir -Recurse -File).Count
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)

Write-Host "`n=== Backup Complete ===" -ForegroundColor Green
Write-Host "Files backed up: $fileCount" -ForegroundColor Gray
Write-Host "Archive: $zipPath ($zipSize MB)" -ForegroundColor Gray
Write-Host "Log: $logPath" -ForegroundColor Gray

if ($ArchiveOnly) {
    Write-Host "Cleaning up uncompressed backup dir..." -ForegroundColor Yellow
    Remove-Item -Path $backupDir -Recurse -Force
}

Write-Host "`nDone. Your platform is protected.`n" -ForegroundColor Cyan
