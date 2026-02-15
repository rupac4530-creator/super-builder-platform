$ErrorActionPreference = 'SilentlyContinue'
$oneMB = 1048576
$oneGB = 1073741824

# Refresh PATH from system
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

Write-Output '=== HOST TOOL VERIFICATION ==='
Write-Output "Date: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')"

# Check tools with refreshed PATH
$tools = @{
    'git'             = 'git --version'
    'python'          = 'python --version'
    'ffmpeg'          = 'ffmpeg -version'
    'huggingface-cli' = 'huggingface-cli version'
    'node'            = 'node --version'
    'npm'             = 'npm --version'
    'docker'          = 'docker --version'
    'blender'         = 'blender --version'
}

$toolResults = @{}
foreach ($tool in $tools.Keys) {
    $cmd = $tools[$tool]
    try {
        $result = Invoke-Expression $cmd 2>&1 | Select-Object -First 1
        if ($LASTEXITCODE -eq 0 -or $result -match '\d') {
            Write-Output "  [OK] ${tool}: $result"
            $toolResults[$tool] = $result.ToString()
        }
        else {
            Write-Output "  [--] ${tool}: NOT FOUND"
            $toolResults[$tool] = 'NOT FOUND'
        }
    }
    catch {
        Write-Output "  [--] ${tool}: NOT FOUND"
        $toolResults[$tool] = 'NOT FOUND'
    }
}

# Also check common install locations
Write-Output ''
Write-Output '=== CHECKING COMMON INSTALL PATHS ==='
$checkPaths = @(
    'C:\Program Files\Git\cmd\git.exe',
    'C:\Program Files (x86)\Git\cmd\git.exe',
    'C:\Users\BEDANTA\AppData\Local\Programs\Python\Python311\python.exe',
    'C:\Python311\python.exe',
    'C:\Program Files\Python311\python.exe',
    'C:\Users\BEDANTA\AppData\Local\Microsoft\WinGet\Packages\*\python.exe',
    'C:\ProgramData\chocolatey\bin\ffmpeg.exe',
    'C:\Users\BEDANTA\AppData\Local\Microsoft\WinGet\Packages\*\ffmpeg.exe',
    'C:\ffmpeg\bin\ffmpeg.exe'
)
foreach ($p in $checkPaths) {
    $found = Get-Item $p -ErrorAction SilentlyContinue
    if ($found) {
        Write-Output "  FOUND: $($found.FullName)"
    }
}

# Check for any running generation processes
Write-Output ''
Write-Output '=== RUNNING PROCESSES CHECK ==='
$genProcesses = Get-Process | Where-Object { $_.ProcessName -match 'python|ffmpeg|blender|node|ts-node' } | Select-Object ProcessName, Id, CPU, WorkingSet64
if ($genProcesses) {
    Write-Output "Active generation processes:"
    foreach ($p in $genProcesses) {
        $memMB = [math]::Round($p.WorkingSet64 / $oneMB, 1)
        Write-Output "  $($p.ProcessName) (PID $($p.Id)) - $memMB MB"
    }
}
else {
    Write-Output '  No generation processes running'
}

# Check data directory
Write-Output ''
Write-Output '=== DATA DIRECTORY ANALYSIS ==='
$root = 'D:\super-builder-platform'
$dataDir = Join-Path $root 'data'

if (Test-Path $dataDir) {
    $totalSize = (Get-ChildItem $dataDir -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { -not $_.PSIsContainer } |
        Measure-Object -Property Length -Sum).Sum
    $totalGB = [math]::Round($totalSize / $oneGB, 2)
    $fileCount = (Get-ChildItem $dataDir -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Output "data/ exists: $totalGB GB, $fileCount files"

    $dirs = Get-ChildItem $dataDir -Directory -Force -ErrorAction SilentlyContinue
    foreach ($d in $dirs) {
        $s = (Get-ChildItem $d.FullName -Recurse -Force -ErrorAction SilentlyContinue |
            Where-Object { -not $_.PSIsContainer } |
            Measure-Object -Property Length -Sum).Sum
        $mb = [math]::Round($s / $oneMB, 2)
        $fc = (Get-ChildItem $d.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Output "  $($d.Name): $mb MB ($fc files)"
    }
}
else {
    Write-Output 'data/ does NOT exist'
}

# Check total repo size
Write-Output ''
Write-Output '=== TOTAL REPO SIZE ==='
$totalRepo = (Get-ChildItem $root -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { -not $_.PSIsContainer } |
    Measure-Object -Property Length -Sum).Sum
$repoGB = [math]::Round($totalRepo / $oneGB, 2)
Write-Output "Total repo: $repoGB GB"

# Check for heavy files in data/
Write-Output ''
Write-Output '=== HEAVY FILES IN DATA/ ==='
if (Test-Path $dataDir) {
    Get-ChildItem $dataDir -Recurse -Force -File -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object -First 20 |
    ForEach-Object {
        $rel = $_.FullName.Replace($dataDir + '\', '')
        $fmb = [math]::Round($_.Length / $oneMB, 2)
        Write-Output "  $fmb MB  $rel"
    }
}

# Check .git
Write-Output ''
Write-Output '=== GIT STATUS ==='
if (Test-Path (Join-Path $root '.git')) {
    Write-Output '.git directory EXISTS'
    $gitSize = (Get-ChildItem (Join-Path $root '.git') -Recurse -Force -ErrorAction SilentlyContinue |
        Measure-Object -Property Length -Sum).Sum
    Write-Output ".git size: $([math]::Round($gitSize / $oneMB, 2)) MB"
}
else {
    Write-Output '.git directory does NOT exist'
}

Write-Output ''
Write-Output '=== VERDICT ==='
$hasData = (Test-Path $dataDir) -and $totalGB -gt 0.01
Write-Output "Host tools available: Node=$($toolResults['node'] -ne 'NOT FOUND')"
Write-Output "Data directory populated: $hasData ($totalGB GB)"
Write-Output "Generation processes running: $($genProcesses.Count -gt 0)"
