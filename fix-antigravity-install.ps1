# Fix Antigravity installation - RUN AS ADMINISTRATOR
# Right-click PowerShell -> "Run as administrator", then run: .\fix-antigravity-install.ps1

$ErrorActionPreference = "Stop"
$antigravityPath = "$env:LOCALAPPDATA\Programs\Antigravity"

Write-Host "Antigravity install fix (run as Administrator)" -ForegroundColor Cyan
Write-Host ""

# 1. Stop any Antigravity processes
Write-Host "Stopping Antigravity processes..." -ForegroundColor Yellow
Get-Process -Name "Antigravity*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "unins000" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Done." -ForegroundColor Green

# 2. Remove the installation folder
if (Test-Path $antigravityPath) {
    Write-Host "Removing old installation folder..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $antigravityPath -Recurse -Force
        Write-Host "Folder removed successfully." -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Could not remove folder. Make sure no other program is using it, then run this script again." -ForegroundColor Red
        Write-Host $_.Exception.Message
        exit 1
    }
} else {
    Write-Host "No existing Antigravity folder found (already clean)." -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Right-click Antigravity.exe (your download)"
Write-Host "2. Click 'Run as administrator'"
Write-Host "3. Complete the installation"
Write-Host ""
Write-Host "Done."
