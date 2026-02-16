# Host Verify (Simple)
$root = $PSScriptRoot | Split-Path
$report = @{ timestamp = (Get-Date).ToString('o'); platform = 'windows'; checks = @{} }

function Check($cmd) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) { return @{ installed = $true } }
    return @{ installed = $false }
}

$report.checks.node = Check "node"
$report.checks.npm = Check "npm"
$report.checks.git = Check "git"
$report.checks.python = Check "python"
$report.checks.docker = Check "docker"
$report.checks.redis = Check "redis-cli"
$report.checks.ffmpeg = Check "ffmpeg"

try {
    $gpu = nvidia-smi --query-gpu=name --format=csv, noheader 2>&1
    if ($LASTEXITCODE -eq 0) { $report.checks.gpu = @{ installed = $true; name = "$gpu".Trim() } }
    else { $report.checks.gpu = @{ installed = $false } }
}
catch { $report.checks.gpu = @{ installed = $false } }

$json = $report | ConvertTo-Json -Depth 4
$json | Set-Content "$root\report\verify-host.json" -Encoding UTF8
Write-Host $json
