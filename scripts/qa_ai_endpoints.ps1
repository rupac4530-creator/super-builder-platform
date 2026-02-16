# Engine Alto — QA AI Endpoints Script
# Tests /api/ai/chat with sample prompts
# PASS: all requests return 200 with valid JSON

$root = $PSScriptRoot | Split-Path
$reportDir = "$root\report"
$baseUrl = "http://localhost:3001"
if (-not (Test-Path $reportDir)) { New-Item -Path $reportDir -ItemType Directory -Force | Out-Null }

Write-Host "`n  QA AI Endpoints Test"
Write-Host "  =====================`n"

$prompts = @(
    "Hello, how are you?",
    "Explain quantum computing in one sentence",
    "Write a haiku about coding",
    "What is the meaning of life?",
    "Describe the color blue",
    "Tell me a joke",
    "What is 2+2?",
    "Summarize machine learning",
    "Write a short poem",
    "Explain gravity simply"
)

$results = @()
$passed = 0
$failed = 0

foreach ($prompt in $prompts) {
    $startMs = (Get-Date).Ticks / 10000
    $entry = @{
        prompt      = $prompt
        status      = "unknown"
        statusCode  = 0
        latencyMs   = 0
        mode        = "unknown"
        hasResponse = $false
    }
    
    try {
        # Fix: Target /api/ai/chat with { message: ... }
        $body = @{ message = $prompt } | ConvertTo-Json
        $resp = Invoke-WebRequest -Uri "$baseUrl/api/ai/chat" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        $entry.statusCode = $resp.StatusCode
        $entry.latencyMs = [math]::Round(((Get-Date).Ticks / 10000 - $startMs), 0)
        
        $json = $resp.Content | ConvertFrom-Json
        $entry.hasResponse = ($null -ne $json)
        $entry.mode = if ($json.model) { $json.model } else { "unknown" }
        
        if ($resp.StatusCode -eq 200 -and $null -ne $json) {
            $entry.status = "PASS"
            $passed++
        }
        else {
            $entry.status = "FAIL"
            $failed++
        }
    }
    catch {
        $entry.latencyMs = [math]::Round(((Get-Date).Ticks / 10000 - $startMs), 0)
        $entry.status = "FAIL"
        $entry.error = $_.Exception.Message
        $failed++
    }
    
    Write-Host "  [$($entry.status)] $prompt (${entry.latencyMs}ms, model: $($entry.mode))"
    $results += $entry
}

$report = @{
    timestamp = (Get-Date).ToString('o')
    endpoint  = "$baseUrl/api/ai/chat"
    total     = $prompts.Count
    passed    = $passed
    failed    = $failed
    pass      = ($failed -eq 0)
    results   = $results
}

$report | ConvertTo-Json -Depth 5 | Set-Content "$reportDir\qa_ai_report.json"

Write-Host "`n  Total: $($prompts.Count), Passed: $passed, Failed: $failed"
Write-Host "  Result: $(if ($report.pass) {'PASS'} else {'FAIL (backend may not be running)'})"
Write-Host "  Report: report/qa_ai_report.json"
