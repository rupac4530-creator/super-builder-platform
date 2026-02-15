$ErrorActionPreference = 'Continue'
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
Set-Location 'D:\super-builder-platform'

# Add remaining files
& git add .gitattributes .gitignore .env.example docker-compose.yml package-lock.json playwright.config.ts 2>&1
& git add README.md LICENSE CHANGELOG.md CONTRIBUTING.md SECURITY.md GOVERNANCE.md 2>&1
& git add BLOCKING-ISSUE.md CONTRIBUTION_POLICY.md MASTER_OVERRIDE_README.md THIRD_PARTY_NOTICES.md 2>&1
& git add audit-report.json audit-report.txt blocking-report.md release-checklist.md release-readiness.md 2>&1
& git add data/models-manifest.json 2>&1

# Commit on feature branch
& git commit -m 'feat: add vault infrastructure - scripts, gitattributes, manifest, lifecycle, backup, API routes' 2>&1
Write-Output ''

# Status
& git log --oneline -n 5 2>&1
Write-Output ''
& git status --short 2>&1
