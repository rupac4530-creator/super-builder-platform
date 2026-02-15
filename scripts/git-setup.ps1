$ErrorActionPreference = 'Continue'

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

$root = 'D:\super-builder-platform'
Set-Location $root

Write-Output '=== Git Init & LFS Setup ==='

# 1. Git init
if (-not (Test-Path (Join-Path $root '.git'))) {
    Write-Output 'Initializing git repository...'
    & git init 2>&1
    Write-Output ''
}
else {
    Write-Output 'Git already initialized.'
}

# 2. Git LFS
Write-Output 'Installing Git LFS...'
& git lfs install 2>&1
Write-Output ''

# 3. Configure git user (local)
& git config user.email 'bedantachatterjee2007@gmail.com' 2>&1
& git config user.name 'Bedanta Chatterjee' 2>&1
Write-Output 'Git user configured.'

# 4. Create .gitignore
$gitignoreContent = @'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# Artifact vault heavy data (use LFS or external storage)
data/models/**/*.pt
data/models/**/*.safetensors
data/models/**/*.onnx
data/models/**/*.ckpt
data/models/**/*.h5
data/models/**/*.pth
data/datasets/synthetic/
data/renders/
data/checkpoints/
data/backups/*.tar.zst
data/backups/*.zip

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/settings.json
.idea/

# Logs
*.log
logs/

# Testing
coverage/
test-results/
playwright-report/
'@
$gitignoreContent | Out-File -FilePath (Join-Path $root '.gitignore') -Encoding utf8
Write-Output '.gitignore created.'

# 5. Stage safe files only (no node_modules, no data binaries)
Write-Output 'Staging source files...'
& git add .gitattributes .gitignore .env.example package.json tsconfig.json 2>&1
& git add backend/ platform/ engine/ scripts/ report/ e2e/ docs/ agents/ modules/ services/ templates/ 2>&1
& git add .devcontainer/ .github/ governance/ infra/ kubernetes/ monitoring/ research/ tests/ ai-training/ apps/ examples/ 2>&1
& git add data/models-manifest.json data/**/.gitkeep 2>&1
Write-Output ''

# 6. Initial commit
Write-Output 'Creating initial commit...'
& git commit -m 'feat: initial commit - Engine Alto v3.0.0-heaven with artifact vault infrastructure' 2>&1
Write-Output ''

# 7. Create feature branch
Write-Output 'Creating feature branch...'
& git checkout -b feat/artifact-vault-populate 2>&1
Write-Output ''

# 8. Final status
Write-Output '=== Git Status ==='
& git status --short 2>&1
Write-Output ''
& git log --oneline -n 5 2>&1
Write-Output ''
& git branch -a 2>&1
