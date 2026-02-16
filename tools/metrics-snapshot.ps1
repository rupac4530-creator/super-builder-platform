# Engine Alto — Metrics Snapshot
# Captures /metrics endpoint data and saves to report/metrics.snapshot.txt

$root = $PSScriptRoot | Split-Path
$reportDir = "$root\report"
if (-not (Test-Path $reportDir)) { New-Item -Path $reportDir -ItemType Directory -Force | Out-Null }

Write-Host "  Capturing metrics snapshot..."

try {
    # Prometheus text format
    $promMetrics = Invoke-RestMethod -Uri 'http://localhost:3001/api/metrics/prom' -TimeoutSec 5 -ErrorAction Stop
    $promMetrics | Set-Content "$reportDir\metrics.snapshot.txt" -Encoding UTF8
    Write-Host "  [OK] Prometheus metrics saved to report/metrics.snapshot.txt"
}
catch {
    Write-Host "  [WARN] Could not reach /api/metrics/prom: $_"
    "# Metrics snapshot failed at $(Get-Date -Format o)`n# Error: $_" | Set-Content "$reportDir\metrics.snapshot.txt"
}

try {
    # JSON format
    $jsonMetrics = Invoke-RestMethod -Uri 'http://localhost:3001/api/metrics/prom/json' -TimeoutSec 5 -ErrorAction Stop
    $jsonMetrics | ConvertTo-Json -Depth 10 | Set-Content "$reportDir\metrics.snapshot.json" -Encoding UTF8
    Write-Host "  [OK] JSON metrics saved to report/metrics.snapshot.json"
}
catch {
    Write-Host "  [WARN] Could not reach /api/metrics/prom/json: $_"
}

try {
    # Health endpoint
    $health = Invoke-RestMethod -Uri 'http://localhost:3001/api/health' -TimeoutSec 5 -ErrorAction Stop
    $health | ConvertTo-Json -Depth 5 | Set-Content "$reportDir\health.snapshot.json" -Encoding UTF8
    Write-Host "  [OK] Health snapshot saved to report/health.snapshot.json"
}
catch {
    Write-Host "  [WARN] Could not reach /api/health: $_"
}

Write-Host "`n  Done."
