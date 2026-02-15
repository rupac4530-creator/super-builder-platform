<#
.SYNOPSIS
  Worker launcher for multi-GPU artifact generation pipeline
.DESCRIPTION
  Detects available GPUs (NVIDIA) and launches N worker processes,
  one per GPU, each consuming from the BullMQ job queue. Workers
  are assigned CUDA_VISIBLE_DEVICES to avoid contention.
#>

param(
    [int]$WorkersPerGPU = 1,
    [int]$MaxWorkers = 8,
    [string]$QueueUrl = $(if ($env:REDIS_URL) { $env:REDIS_URL } else { 'redis://localhost:6379' })
)

$ErrorActionPreference = 'Continue'

Write-Host '=== Engine Alto -- Worker Farm Launcher ===' -ForegroundColor Cyan
Write-Host "Queue: $QueueUrl"
Write-Host ''

# Detect NVIDIA GPUs
$gpuCount = 0
try {
    $nvidiaSmiOutput = & nvidia-smi --query-gpu=index, name, memory.total --format=csv, noheader 2>$null
    if ($LASTEXITCODE -eq 0 -and $nvidiaSmiOutput) {
        $gpus = $nvidiaSmiOutput -split "`n" | Where-Object { $_.Trim() -ne '' }
        $gpuCount = $gpus.Count
        Write-Host "Detected $gpuCount NVIDIA GPU(s):" -ForegroundColor Green
        foreach ($gpu in $gpus) {
            Write-Host "  $gpu" -ForegroundColor DarkGray
        }
    }
}
catch {
    Write-Host 'nvidia-smi not found -- CPU-only mode' -ForegroundColor Yellow
}

if ($gpuCount -eq 0) {
    Write-Host 'No GPUs detected. Launching CPU-only workers.' -ForegroundColor Yellow
    $gpuCount = 1  # Treat as single CPU worker
}

$totalWorkers = [math]::Min($gpuCount * $WorkersPerGPU, $MaxWorkers)
Write-Host "Launching $totalWorkers worker(s)..." -ForegroundColor Cyan
Write-Host ''

$workerPids = @()
$backendDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'backend'

for ($i = 0; $i -lt $totalWorkers; $i++) {
    $gpuId = $i % $gpuCount
    $env:CUDA_VISIBLE_DEVICES = $gpuId.ToString()
    $env:WORKER_ID = "worker-$i"
    $env:REDIS_URL = $QueueUrl

    Write-Host "  Starting worker-$i (GPU $gpuId)..." -ForegroundColor Green

    $proc = Start-Process -FilePath 'npx' `
        -ArgumentList 'ts-node', 'worker/index.ts' `
        -WorkingDirectory $backendDir `
        -PassThru `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $env:ARTIFACT_ROOT "logs\pipelines\worker-$i.log") `
        -RedirectStandardError (Join-Path $env:ARTIFACT_ROOT "logs\pipelines\worker-$i.err.log")

    if ($proc) {
        $workerPids += $proc.Id
        Write-Host "    PID: $($proc.Id)" -ForegroundColor DarkGray
    }
}

Write-Host ''
Write-Host "All $totalWorkers workers started." -ForegroundColor Cyan
Write-Host "PIDs: $($workerPids -join ', ')"
Write-Host ''
Write-Host 'To stop all workers:' -ForegroundColor Yellow
Write-Host "  Get-Process -Id $($workerPids -join ',') | Stop-Process -Force"
Write-Host ''
Write-Host 'Worker logs:' -ForegroundColor Yellow
for ($i = 0; $i -lt $totalWorkers; $i++) {
    $logFile = Join-Path $env:ARTIFACT_ROOT "logs\pipelines\worker-$i.log"
    Write-Host "  worker-$i: $logFile"
}
