$ErrorActionPreference = 'Continue'
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
Set-Location 'D:\super-builder-platform'

# Add updated reports
& git add report/verify-host.json report/artifact-populate-report.md report/models-inventory.csv 2>&1
& git add scripts/verify-state.ps1 scripts/git-setup.ps1 scripts/git-add-remaining.ps1 2>&1

# Commit
& git commit -m 'feat: add verified host report and updated populate report with honest findings' 2>&1
Write-Output ''

# Final log
& git log --oneline -n 5 2>&1
Write-Output ''
& git branch -a 2>&1
Write-Output ''

# Summary stats
$commitCount = (& git rev-list --count HEAD 2>&1)
$fileCount = (& git ls-files 2>&1 | Measure-Object -Line).Lines
Write-Output "Branch: $(& git branch --show-current 2>&1)"
Write-Output "Commits: $commitCount"
Write-Output "Tracked files: $fileCount"
