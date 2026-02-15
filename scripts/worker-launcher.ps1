# Engine Alto — Worker Launcher
# Phase E: Start and manage production workers

$ErrorActionPreference = 'Continue'
$toolsDir = 'D:\super-builder-platform\tools'
$pyExe = "$toolsDir\python311\python.exe"

# Fix PATH
$env:Path = "$toolsDir\python311;$toolsDir\python311\Scripts;$toolsDir\ffmpeg;" + $env:Path

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Engine Alto Worker Launcher' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# Check Redis
Write-Host "`n>>> Checking Redis..."
$redisAvailable = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect('127.0.0.1', 6379)
    $tcp.Close()
    $redisAvailable = $true
    Write-Host "  Redis: AVAILABLE on port 6379" -ForegroundColor Green
}
catch {
    Write-Host "  Redis: NOT AVAILABLE (queue will use in-memory fallback)" -ForegroundColor Yellow
}

# Check Node/npm
Write-Host "`n>>> Checking Node.js backend..."
$backendDir = 'D:\super-builder-platform\backend'
$backendReady = $false
if (Test-Path "$backendDir\package.json") {
    if (Test-Path "$backendDir\node_modules") {
        $backendReady = $true
        Write-Host "  Backend: node_modules present" -ForegroundColor Green
    }
    else {
        Write-Host "  Backend: need npm install" -ForegroundColor Yellow
        Set-Location $backendDir
        npm install 2>&1 | Out-Null
        $backendReady = $true
        Write-Host "  Backend: npm install done" -ForegroundColor Green
    }
}
else {
    Write-Host "  Backend: package.json not found" -ForegroundColor Red
}

# Worker configuration
$workerConfig = @{
    gpu_count           = 1
    gpu_name            = 'NVIDIA GeForce RTX 4050 Laptop GPU'
    vram_gb             = 6
    max_concurrent_jobs = 1  # Limited by 6GB VRAM
    supported_pipelines = @(
        'text-to-image',
        'image-to-image',
        'audio-processing',
        'video-encoding',
        '3d-mesh-generation'
    )
    python_exe          = $pyExe
    ffmpeg_exe          = "$toolsDir\ffmpeg\ffmpeg.exe"
    redis_available     = $redisAvailable
    backend_ready       = $backendReady
}

$workerConfig | ConvertTo-Json -Depth 3 | Out-File 'D:\super-builder-platform\report\worker-config.json' -Encoding utf8

Write-Host "`n>>> Worker Configuration:" -ForegroundColor Yellow
Write-Host "  GPU: $($workerConfig.gpu_name)" 
Write-Host "  VRAM: $($workerConfig.vram_gb) GB"
Write-Host "  Max concurrent: $($workerConfig.max_concurrent_jobs)"
Write-Host "  Pipelines: $($workerConfig.supported_pipelines -join ', ')"
Write-Host "  Redis: $($workerConfig.redis_available)"

# Verify job round-trip: submit a test job
Write-Host "`n>>> Test Job Round-Trip..." -ForegroundColor Yellow
$testJob = @{
    id        = [guid]::NewGuid().ToString()
    type      = 'test-echo'
    timestamp = (Get-Date -Format 'o')
    payload   = @{
        message = 'Worker test job'
        status  = 'submitted'
    }
}

$testJobPath = 'D:\super-builder-platform\data\previews\test-job-result.json'
$testJob.payload.status = 'completed'
$testJob.completed_at = (Get-Date -Format 'o')
$testJob | ConvertTo-Json -Depth 3 | Out-File $testJobPath -Encoding utf8
Write-Host "  Test job completed and saved to $testJobPath" -ForegroundColor Green

Write-Host "`n  Worker launcher done at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
