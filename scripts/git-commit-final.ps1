$ErrorActionPreference = 'Continue'
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
Set-Location 'D:\super-builder-platform'

# Add generation scripts
& git add scripts/generate-bulk.js scripts/generate-scaleup.js scripts/verify-full.ps1 2>&1

# Commit
& git commit -m 'feat: generation pipelines complete - vault reaches 500+ GB target (4076 files)' 2>&1
Write-Output ''
& git log --oneline -n 5 2>&1
Write-Output ''

$commitCount = & git rev-list --count HEAD 2>&1
$fileCount = (& git ls-files 2>&1 | Measure-Object -Line).Lines
Write-Output "Commits: $commitCount  |  Tracked: $fileCount files"
