# Engine Alto — Download Models Script
# Phase C/H: Download all licensed AI model weights

param(
    [switch]$SmallOnly,  # Only download models that fit in 6GB VRAM
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'
$pyExe = 'D:\super-builder-platform\tools\python311\python.exe'
$modelsDir = 'D:\super-builder-platform\data\models'

$env:HF_HUB_ENABLE_HF_TRANSFER = '0'  # Disable broken xet transport

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  Engine Alto Model Downloader' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# Model registry with licenses and VRAM requirements
$models = @(
    @{
        id          = 'stabilityai/sdxl-turbo'
        type        = 'text-to-image'
        license     = 'openrail++'
        vram_gb     = 4
        size_gb     = 3.5
        description = 'Fast SDXL text-to-image (4 steps)'
        variant     = 'fp16'
        status      = 'downloaded'
    },
    @{
        id          = 'openai/whisper-tiny'
        type        = 'speech-to-text'
        license     = 'MIT'
        vram_gb     = 1
        size_gb     = 0.15
        description = 'Speech recognition (tiny model)'
        variant     = ''
        status      = 'pending'
    },
    @{
        id          = 'facebook/musicgen-small'
        type        = 'text-to-music'
        license     = 'CC-BY-NC-4.0'
        vram_gb     = 2
        size_gb     = 1.8
        description = 'Music generation from text'
        variant     = ''
        status      = 'pending'
    },
    @{
        id          = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0'
        type        = 'text-generation'
        license     = 'Apache-2.0'
        vram_gb     = 2
        size_gb     = 2.2
        description = 'Small LLM for text generation'
        variant     = ''
        status      = 'pending'
    }
)

Write-Host "`n>>> Available models:"
foreach ($model in $models) {
    $statusIcon = if ($model.status -eq 'downloaded') { 'OK' } else { '--' }
    Write-Host "  [$statusIcon] $($model.id) ($($model.type), $($model.size_gb)GB, $($model.license))"
}

if ($DryRun) {
    Write-Host "`n  DRY RUN - no downloads performed" -ForegroundColor Yellow
    exit 0
}

# Download pending models
foreach ($model in $models) {
    if ($model.status -eq 'downloaded') {
        Write-Host "`n  SKIP: $($model.id) (already downloaded)" -ForegroundColor Green
        continue
    }
    
    if ($SmallOnly -and $model.vram_gb -gt 4) {
        Write-Host "`n  SKIP: $($model.id) (requires $($model.vram_gb)GB VRAM, -SmallOnly mode)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`n  Downloading: $($model.id) ($($model.size_gb) GB)..." -ForegroundColor Yellow
    $cacheDir = Join-Path $modelsDir ($model.id -replace '/', '_')
    
    $downloadScript = @"
import os
os.environ['HF_HUB_ENABLE_HF_TRANSFER'] = '0'
from huggingface_hub import snapshot_download
snapshot_download('$($model.id)', cache_dir=r'$cacheDir', ignore_patterns=['*.bin', '*.h5', 'flax_model*'])
print('Download complete')
"@
    
    $downloadScript | Out-File "$env:TEMP\dl_model.py" -Encoding utf8
    & $pyExe "$env:TEMP\dl_model.py" 2>&1 | ForEach-Object {
        if ($_ -match 'complete|error|Download') { Write-Host "    $_" -ForegroundColor Gray }
    }
}

Write-Host "`n  Done at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
