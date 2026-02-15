<#
.SYNOPSIS
  Creates the full artifact vault directory scaffold.
.DESCRIPTION
  Creates all required directories under ARTIFACT_ROOT for the Engine Alto
  artifact vault. Safe to run multiple times (idempotent).
#>

param(
    [string]$ArtifactRoot = $env:ARTIFACT_ROOT
)

if (-not $ArtifactRoot) {
    $ArtifactRoot = 'D:\super-builder-platform\data'
}

Write-Host "=== Engine Alto — Artifact Vault Scaffold ===" -ForegroundColor Cyan
Write-Host "ARTIFACT_ROOT: $ArtifactRoot"
Write-Host ""

$dirs = @(
    'models',
    'models\llm',
    'models\diffusion',
    'models\audio',
    'models\video',
    'models\nerf',
    'models\voice-clone',
    'datasets',
    'datasets\images',
    'datasets\video',
    'datasets\audio',
    'datasets\text',
    'datasets\3d',
    'assets',
    'assets\3d',
    'assets\textures',
    'assets\motion-capture',
    'assets\hdri',
    'renders',
    'renders\video',
    'renders\frames',
    'renders\nerf',
    'renders\blender',
    'previews',
    'previews\video',
    'previews\3d',
    'previews\audio',
    'checkpoints',
    'checkpoints\lora',
    'checkpoints\fine-tune',
    'exports',
    'exports\games',
    'exports\packages',
    'backups',
    'logs',
    'logs\pipelines',
    'logs\downloads',
    'logs\generation'
)

$created = 0
foreach ($d in $dirs) {
    $path = Join-Path $ArtifactRoot $d
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "  [+] $d" -ForegroundColor Green
        $created++
    }
    else {
        Write-Host "  [=] $d (exists)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Created $created new directories." -ForegroundColor Cyan
Write-Host "Total structure: $($dirs.Count) directories under $ArtifactRoot"

# Create .gitkeep files so empty dirs are tracked
foreach ($d in $dirs) {
    $keepFile = Join-Path $ArtifactRoot "$d\.gitkeep"
    if (-not (Test-Path $keepFile)) {
        New-Item -ItemType File -Path $keepFile -Force | Out-Null
    }
}

Write-Host 'Done. All .gitkeep files placed.' -ForegroundColor Green
