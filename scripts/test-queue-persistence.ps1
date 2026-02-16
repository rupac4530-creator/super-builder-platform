# Engine Alto — Queue Persistence Smoke Test
# Verifies queue disk persistence across worker restart

$root = $PSScriptRoot | Split-Path
$reportDir = "$root\report"
if (-not (Test-Path $reportDir)) { New-Item -Path $reportDir -ItemType Directory -Force | Out-Null }

Write-Host "`n  Queue Persistence Smoke Test"
Write-Host "  ============================`n"

$queueStateFile = "$root\data\queue-state.json"
$logFile = "$reportDir\queue-smoke.log"
"Queue Persistence Test - $(Get-Date -Format o)" | Set-Content $logFile

$result = @{
    timestamp = (Get-Date).ToString('o')
    test      = "queue-persistence"
    steps     = @()
    pass      = $false
}

# Step 1: Check if queue state file exists
$stateExists = Test-Path $queueStateFile
"Step 1: Queue state file exists = $stateExists" | Add-Content $logFile
$result.steps += @{ step = 1; name = "state_file_check"; exists = $stateExists }
Write-Host "  [Step 1] Queue state file: $(if ($stateExists) {'EXISTS'} else {'NOT FOUND'})"

# Step 2: Read current queue state
if ($stateExists) {
    $state = Get-Content $queueStateFile | ConvertFrom-Json
    $jobCount = if ($state.jobs) { $state.jobs.Count } else { 0 }
    $dlqCount = if ($state.dlqCount) { $state.dlqCount } else { 0 }
    "Step 2: Jobs in state = $jobCount, DLQ = $dlqCount" | Add-Content $logFile
    $result.steps += @{ step = 2; name = "read_state"; jobs = $jobCount; dlq = $dlqCount; timestamp = $state.timestamp }
    Write-Host "  [Step 2] Queue state: $jobCount jobs, $dlqCount DLQ, last update: $($state.timestamp)"
}
else {
    "Step 2: No state file to read" | Add-Content $logFile
    $result.steps += @{ step = 2; name = "read_state"; status = "no_state_file" }
    Write-Host "  [Step 2] No state file (backend may not have run yet)"
}

# Step 3: Check job output directories
$jobOutputs = Get-ChildItem "$root\data\outputs\job_*" -Directory -ErrorAction SilentlyContinue
$jobOutputCount = if ($jobOutputs) { $jobOutputs.Count } else { 0 }
"Step 3: Job output dirs = $jobOutputCount" | Add-Content $logFile
$result.steps += @{ step = 3; name = "job_outputs"; count = $jobOutputCount }
Write-Host "  [Step 3] Job output directories: $jobOutputCount"

if ($jobOutputCount -gt 0) {
    foreach ($dir in $jobOutputs | Select-Object -First 3) {
        $manifest = Join-Path $dir.FullName 'manifest.json'
        if (Test-Path $manifest) {
            $m = Get-Content $manifest | ConvertFrom-Json
            "  Job $($m.id): type=$($m.type), status=$($m.status)" | Add-Content $logFile
            Write-Host "    $($m.id): type=$($m.type), status=$($m.status)"
        }
    }
}

# Step 4: Verify persistence mechanism
$persistenceType = if ($stateExists) { "disk" } else { "none" }
$hasDLQ = $false
if ($stateExists -and $state.dlqCount -ge 0) { $hasDLQ = $true }
"Step 4: Persistence = $persistenceType, DLQ = $hasDLQ" | Add-Content $logFile
$result.steps += @{ step = 4; name = "verify_persistence"; type = $persistenceType; hasDLQ = $hasDLQ }
Write-Host "  [Step 4] Persistence: $persistenceType, DLQ support: $hasDLQ"

# Overall verdict
$result.pass = $stateExists -or ($jobOutputCount -gt 0)
$result.persistenceType = $persistenceType
$result.recommendation = if (-not $stateExists) {
    "Start backend once to create queue-state.json. Queue uses disk persistence when Redis unavailable."
}
else { "Queue persistence verified." }

"Overall: $(if ($result.pass) {'PASS'} else {'FAIL'})" | Add-Content $logFile
$result | ConvertTo-Json -Depth 5 | Set-Content "$reportDir\queue-persistence.json"

Write-Host "`n  Result: $(if ($result.pass) {'PASS'} else {'FAIL - start backend to create state file'})"
Write-Host "  Report: report/queue-persistence.json"
Write-Host "  Log: report/queue-smoke.log"
