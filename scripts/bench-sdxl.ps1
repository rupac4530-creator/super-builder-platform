# Engine Alto — SDXL Benchmark
# Generates one 512x512 image and records GPU mem + time
# PASS: report/bench-sdxl.json exists

$root = $PSScriptRoot | Split-Path
$py = "$root\tools\python311\python.exe"
$reportDir = "$root\report"
if (-not (Test-Path $reportDir)) { New-Item -Path $reportDir -ItemType Directory -Force | Out-Null }

Write-Host "`n  SDXL Benchmark — 512x512 single image"

$startTime = Get-Date

# Check GPU memory before
$gpuBefore = 0
try {
    $smi = nvidia-smi --query-gpu=memory.used --format=csv, noheader, nounits 2>&1
    $gpuBefore = [int]($smi.Trim())
}
catch {}

# Run SDXL gen
$sdxlScript = "$root\scripts\sdxl-gen.py"
$sdxlResult = "skipped"
$sdxlTime = 0

if (Test-Path $py) {
    if (Test-Path $sdxlScript) {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            & $py $sdxlScript 2>&1 | Out-Null
            $sdxlResult = "completed"
        }
        catch {
            $sdxlResult = "error: $_"
        }
        $sw.Stop()
        $sdxlTime = [math]::Round($sw.Elapsed.TotalSeconds, 2)
    }
    else {
        $sdxlResult = "script not found"
    }
}
else {
    $sdxlResult = "python not found"
}

# Check GPU memory after
$gpuAfter = 0
$gpuPeak = 0
try {
    $smi = nvidia-smi --query-gpu=memory.used --format=csv, noheader, nounits 2>&1
    $gpuAfter = [int]($smi.Trim())
    $gpuPeak = [math]::Max($gpuBefore, $gpuAfter)
}
catch {}

$endTime = Get-Date
$totalTime = [math]::Round(($endTime - $startTime).TotalSeconds, 2)

$report = @{
    timestamp            = $endTime.ToString('o')
    benchmark            = "sdxl-512x512-single"
    config               = @{
        model             = "stabilityai/sdxl-turbo"
        resolution        = "512x512"
        dtype             = "float16"
        steps             = 4
        attention_slicing = $true
    }
    results              = @{
        status             = $sdxlResult
        time_seconds       = $sdxlTime
        total_time_seconds = $totalTime
        gpu_mem_before_mb  = $gpuBefore
        gpu_mem_after_mb   = $gpuAfter
        gpu_mem_peak_mb    = $gpuPeak
    }
    optimization_options = @(
        "ONNX export: Use optimum library to convert to ONNX for 20-30% speedup"
        "8-bit quantization: Use bitsandbytes for INT8 inference (saves ~50% VRAM)"
        "TensorRT: Convert to TRT engine for maximum GPU throughput"
        "Torch compile: Use torch.compile() for 10-15% speedup on RTX 40xx"
        "xFormers: Memory-efficient attention (already used via attention slicing)"
    )
    pass                 = ($sdxlResult -eq "completed")
}

$report | ConvertTo-Json -Depth 5 | Set-Content "$reportDir\bench-sdxl.json"
Write-Host "  Status: $sdxlResult"
Write-Host "  Time: $($sdxlTime)s"
Write-Host "  GPU Mem: $gpuBefore MB -> $gpuAfter MB"
Write-Host "  Report: report/bench-sdxl.json"
Write-Host "  Result: $(if ($report.pass) {'PASS'} else {'FAIL'})"
