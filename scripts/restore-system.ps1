<#
.SYNOPSIS
    SuperBuilder Platform — Restore from Backup
.DESCRIPTION
    Restores the platform from a timestamped backup archive.
    Does NOT delete anything — extracts backup alongside current files.
.PARAMETER ArchivePath
    Full path to the backup .zip archive to restore from.
.PARAMETER TargetDir
    Directory to restore into (default: .\restored)
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ArchivePath,
    [string]$TargetDir = ".\restored"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ArchivePath)) {
    Write-Host "ERROR: Archive not found at $ArchivePath" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== SuperBuilder Platform Restore ===" -ForegroundColor Cyan
Write-Host "Archive: $ArchivePath" -ForegroundColor Gray
Write-Host "Target: $TargetDir" -ForegroundColor Gray

New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
Expand-Archive -Path $ArchivePath -DestinationPath $TargetDir -Force

$fileCount = (Get-ChildItem -Path $TargetDir -Recurse -File).Count
Write-Host "`n=== Restore Complete ===" -ForegroundColor Green
Write-Host "Files restored: $fileCount" -ForegroundColor Gray
Write-Host "Location: $TargetDir" -ForegroundColor Gray
Write-Host "`nTo use the restored version, copy files from $TargetDir back to your project root.`n" -ForegroundColor Yellow
