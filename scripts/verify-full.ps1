$ErrorActionPreference = 'SilentlyContinue'
$oneMB = 1048576
$oneGB = 1073741824

# Refresh PATH from system
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')

Write-Output '========================================'
Write-Output '  ENGINE ALTO FULL STATE VERIFICATION'
Write-Output "  $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')"
Write-Output '========================================'
Write-Output ''

# ===== 1. TOOLS =====
Write-Output '--- 1. HOST TOOLS ---'
$toolStatus = @{}

# Git
$gitVer = & git --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Output "  [OK] git: $gitVer"
    $toolStatus['git'] = 'OK'
}
else {
    # Search common paths
    $gitPaths = @(
        'C:\Program Files\Git\cmd\git.exe',
        'C:\Program Files (x86)\Git\cmd\git.exe',
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )
    $found = $false
    foreach ($gp in $gitPaths) {
        if (Test-Path $gp) {
            $gitVer = & $gp --version 2>&1
            Write-Output "  [OK] git: $gitVer (at $gp)"
            $toolStatus['git'] = 'OK'
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Output '  [FAIL] git: NOT FOUND'
        $toolStatus['git'] = 'FAIL'
    }
}

# Python
$pyVer = & python --version 2>&1
if ($LASTEXITCODE -eq 0 -and $pyVer -match 'Python') {
    Write-Output "  [OK] python: $pyVer"
    $toolStatus['python'] = 'OK'
}
else {
    $pyVer = & python3 --version 2>&1
    if ($LASTEXITCODE -eq 0 -and $pyVer -match 'Python') {
        Write-Output "  [OK] python3: $pyVer"
        $toolStatus['python'] = 'OK'
    }
    else {
        # Search common paths
        $pyPaths = @(
            "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
            "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
            'C:\Python311\python.exe',
            'C:\Python312\python.exe',
            "$env:LOCALAPPDATA\Microsoft\WindowsApps\python.exe"
        )
        $found = $false
        foreach ($pp in $pyPaths) {
            if (Test-Path $pp) {
                $pyVer = & $pp --version 2>&1
                Write-Output "  [OK] python: $pyVer (at $pp)"
                $toolStatus['python'] = 'OK'
                $found = $true
                break
            }
        }
        if (-not $found) {
            Write-Output '  [FAIL] python: NOT FOUND anywhere'
            $toolStatus['python'] = 'FAIL'
        }
    }
}

# FFmpeg
$ffVer = & ffmpeg -version 2>&1 | Select-Object -First 1
if ($LASTEXITCODE -eq 0 -and $ffVer -match 'ffmpeg') {
    Write-Output "  [OK] ffmpeg: $ffVer"
    $toolStatus['ffmpeg'] = 'OK'
}
else {
    $ffPaths = @(
        'C:\ffmpeg\bin\ffmpeg.exe',
        "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\*\ffmpeg.exe",
        'C:\ProgramData\chocolatey\bin\ffmpeg.exe'
    )
    $found = $false
    foreach ($fp in $ffPaths) {
        $items = Get-Item $fp -ErrorAction SilentlyContinue
        if ($items) {
            $ffVer = & $items[0].FullName -version 2>&1 | Select-Object -First 1
            Write-Output "  [OK] ffmpeg: $ffVer (at $($items[0].FullName))"
            $toolStatus['ffmpeg'] = 'OK'
            $found = $true
            break
        }
    }
    if (-not $found) {
        Write-Output '  [FAIL] ffmpeg: NOT FOUND anywhere'
        $toolStatus['ffmpeg'] = 'FAIL'
    }
}

# HuggingFace CLI
$hfVer = & huggingface-cli version 2>&1
if ($hfVer -match '\d+\.\d+') {
    Write-Output "  [OK] huggingface-cli: $hfVer"
    $toolStatus['hf'] = 'OK'
}
else {
    Write-Output '  [FAIL] huggingface-cli: NOT FOUND'
    $toolStatus['hf'] = 'FAIL'
}

# Node
$nodeVer = & node --version 2>&1
Write-Output "  [OK] node: $nodeVer"

# Docker
$dkVer = & docker --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Output "  [OK] docker: $dkVer"
    $toolStatus['docker'] = 'OK'
}
else {
    Write-Output '  [FAIL] docker: NOT FOUND'
    $toolStatus['docker'] = 'FAIL'
}

# Blender
$blVer = & blender --version 2>&1 | Select-Object -First 1
if ($LASTEXITCODE -eq 0 -and $blVer -match 'Blender') {
    Write-Output "  [OK] blender: $blVer"
    $toolStatus['blender'] = 'OK'
}
else {
    Write-Output '  [FAIL] blender: NOT FOUND'
    $toolStatus['blender'] = 'FAIL'
}

Write-Output ''

# ===== 2. RUNNING PROCESSES =====
Write-Output '--- 2. RUNNING GENERATION PROCESSES ---'
$genProcs = Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -match 'python|ffmpeg|blender|ts-node' -or
    ($_.ProcessName -eq 'powershell' -and $_.MainWindowTitle -match 'pipeline|generate|synthetic')
}
if ($genProcs -and $genProcs.Count -gt 0) {
    Write-Output "  Active processes: $($genProcs.Count)"
    foreach ($p in $genProcs) {
        $memMB = [math]::Round($p.WorkingSet64 / $oneMB, 1)
        Write-Output "    $($p.ProcessName) (PID $($p.Id)) - $memMB MB"
    }
}
else {
    Write-Output '  No generation processes running'
}
Write-Output ''

# ===== 3. DATA DIRECTORY =====
Write-Output '--- 3. DATA DIRECTORY ANALYSIS ---'
$root = 'D:\super-builder-platform'
$dataDir = Join-Path $root 'data'

if (Test-Path $dataDir) {
    $totalSize = (Get-ChildItem $dataDir -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { -not $_.PSIsContainer } |
        Measure-Object -Property Length -Sum).Sum
    $totalGB = [math]::Round($totalSize / $oneGB, 2)
    $fileCount = (Get-ChildItem $dataDir -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Output "  Total data/ size: $totalGB GB ($fileCount files)"
    Write-Output ''

    $dirs = Get-ChildItem $dataDir -Directory -Force -ErrorAction SilentlyContinue
    foreach ($d in $dirs) {
        $s = (Get-ChildItem $d.FullName -Recurse -Force -ErrorAction SilentlyContinue |
            Where-Object { -not $_.PSIsContainer } |
            Measure-Object -Property Length -Sum).Sum
        $mb = [math]::Round($s / $oneMB, 2)
        $fc = (Get-ChildItem $d.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Output ("  {0,-20} {1,10} MB  ({2} files)" -f $d.Name, $mb, $fc)
    }
    Write-Output ''

    # Check specific subdirectories
    $subDirs = @('datasets\synthetic', 'models\llm', 'models\diffusion', 'models\audio', 'renders\video', 'assets\3d')
    foreach ($sd in $subDirs) {
        $p = Join-Path $dataDir $sd
        if (Test-Path $p) {
            $sc = (Get-ChildItem $p -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
            $ss = (Get-ChildItem $p -Recurse -Force -ErrorAction SilentlyContinue |
                Where-Object { -not $_.PSIsContainer } |
                Measure-Object -Property Length -Sum).Sum
            $smb = [math]::Round($ss / $oneMB, 2)
            Write-Output ("  subdir {0,-25} {1,10} MB  ({2} files)" -f $sd, $smb, $sc)
        }
    }
}
else {
    Write-Output '  data/ directory does NOT exist'
}
Write-Output ''

# ===== 4. TOP 15 LARGEST FILES =====
Write-Output '--- 4. TOP 15 LARGEST FILES IN DATA ---'
if (Test-Path $dataDir) {
    Get-ChildItem $dataDir -Recurse -Force -File -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object -First 15 |
    ForEach-Object {
        $rel = $_.FullName.Replace($dataDir + '\', '')
        $fmb = [math]::Round($_.Length / $oneMB, 2)
        Write-Output ("  {0,10} MB  {1}" -f $fmb, $rel)
    }
}
Write-Output ''

# ===== 5. FILE TYPE INVENTORY =====
Write-Output '--- 5. FILE TYPES IN DATA ---'
if (Test-Path $dataDir) {
    $allFiles = Get-ChildItem $dataDir -Recurse -File -Force -ErrorAction SilentlyContinue
    $byExt = $allFiles | Group-Object { $_.Extension.ToLower() } | Sort-Object Count -Descending | Select-Object -First 15
    foreach ($g in $byExt) {
        $extSize = ($g.Group | Measure-Object -Property Length -Sum).Sum
        $extMB = [math]::Round($extSize / $oneMB, 2)
        Write-Output ("  {0,-12} {1,6} files  {2,10} MB" -f $g.Name, $g.Count, $extMB)
    }
}
Write-Output ''

# ===== 6. GIT STATUS =====
Write-Output '--- 6. GIT STATUS ---'
if (Test-Path (Join-Path $root '.git')) {
    $branch = & git -C $root branch --show-current 2>&1
    $commitCount = & git -C $root rev-list --count HEAD 2>&1
    $lastCommit = & git -C $root log --oneline -1 2>&1
    Write-Output "  Branch: $branch"
    Write-Output "  Commits: $commitCount"
    Write-Output "  Latest: $lastCommit"
}
else {
    Write-Output '  .git NOT found'
}
Write-Output ''

# ===== 7. TOTAL REPO SIZE =====
Write-Output '--- 7. TOTAL REPO SIZE ---'
$totalRepo = (Get-ChildItem $root -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { -not $_.PSIsContainer } |
    Measure-Object -Property Length -Sum).Sum
$repoGB = [math]::Round($totalRepo / $oneGB, 2)
Write-Output "  Total repo: $repoGB GB"

# ===== 8. DISK SPACE =====
Write-Output '--- 8. DISK SPACE ---'
$drive = Get-PSDrive D -ErrorAction SilentlyContinue
if ($drive) {
    $usedGB = [math]::Round($drive.Used / $oneGB, 2)
    $freeGB = [math]::Round($drive.Free / $oneGB, 2)
    Write-Output "  D: Used=$usedGB GB  Free=$freeGB GB"
}
Write-Output ''
Write-Output '========================================'
Write-Output '  VERIFICATION COMPLETE'
Write-Output '========================================'
