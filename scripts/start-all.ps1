# Engine Alto — Start All Services (Windows)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/start-all.ps1
param([switch]$smoke)

$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot | Split-Path

Write-Host "Engine Alto - Start All"

# 1. Check .env
if (-not (Test-Path "$root\.env")) {
    if (Test-Path "$root\.env.example") {
        Copy-Item "$root\.env.example" "$root\.env"
        Write-Host "Created .env"
    }
}

# 2. Redis Check
$env:JOB_QUEUE = 'memory'
try {
    $ping = redis-cli ping 2>&1
    if ($ping -match 'PONG') { $env:JOB_QUEUE = 'redis' }
}
catch {}
Write-Host "Queue: $env:JOB_QUEUE"

# 3. Start Backend
$env:PORT = '3001'
$backendDist = "$root\backend\dist\backend\src\server.js"
if (-not (Test-Path $backendDist)) {
    Write-Host "Rebuilding backend..."
    Push-Location "$root\backend"
    npx tsc
    Pop-Location
}

Write-Host "Starting backend ($backendDist)..."
# Use node directly since we have compiled JS
$backend = Start-Process -FilePath "node" -ArgumentList "$backendDist" -RedirectStandardOutput "$root\logs\backend.log" -RedirectStandardError "$root\logs\backend-err.log" -PassThru -WindowStyle Hidden

# 4. Start Frontend
Write-Host "Starting frontend..."
$frontend = Start-Process -FilePath "cmd" -ArgumentList "/c cd $root\platform && npm run dev > ..\logs\frontend.log 2>&1" -PassThru -WindowStyle Hidden

# 5. Smoke Test
if ($smoke) {
    Write-Host "Waiting 15s for startup..."
    Start-Sleep -Seconds 15
    
    $ok = $false
    try {
        $resp = Invoke-RestMethod -Uri 'http://localhost:3001/api/health' -ErrorAction Stop
        if ($resp.status -eq 'healthy') { $ok = $true }
    }
    catch { Write-Host "Health check failed: $_" }
    
    if ($ok) { 
        Write-Host "SMOKE TEST PASSED"
        
        # Run extra verification scripts if smoke passed
        Write-Host "Running AI QA..."
        powershell -ExecutionPolicy Bypass -File "$root\scripts\qa_ai_endpoints.ps1"
        
        Write-Host "Running Load Gen..."
        node "$root\tools\load-gen.js" --requests 20 --concurrency 2
        
        Write-Host "Running Queue Persistence Test..."
        powershell -ExecutionPolicy Bypass -File "$root\scripts\test-queue-persistence.ps1"
    }
    else { 
        Write-Host "SMOKE TEST FAILED"
        Get-Content "$root\logs\backend-err.log" -Tail 20 -ErrorAction SilentlyContinue
    }
    
    Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -ErrorAction SilentlyContinue
}
else {
    Write-Host "Services started (Background). Backend PID: $($backend.Id)"
}
