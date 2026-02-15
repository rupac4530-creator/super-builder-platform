$ErrorActionPreference = 'SilentlyContinue'
$root = 'd:\super-builder-platform'
$oneMB = 1048576
$oneGB = 1073741824

Write-Output "=== ENGINE ALTO REPO AUDIT ==="
Write-Output "Date: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
Write-Output "OS: $([System.Environment]::OSVersion.VersionString)"
Write-Output "User: $(whoami)"
Write-Output ""

# Disk
$drive = Get-PSDrive D
$usedGB = [math]::Round($drive.Used / $oneGB, 2)
$freeGB = [math]::Round($drive.Free / $oneGB, 2)
Write-Output "D: Drive -- Used: $usedGB GB, Free: $freeGB GB"
Write-Output ""

# Total repo size
$totalSize = (Get-ChildItem $root -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$totalMB = [math]::Round($totalSize / $oneMB, 2)
$totalGB = [math]::Round($totalSize / $oneGB, 2)
Write-Output "Total repo size: $totalMB MB ($totalGB GB)"
Write-Output ""

# Directory sizes
Write-Output "=== DIRECTORY SIZES ==="
$dirs = Get-ChildItem $root -Directory -Force
foreach ($d in $dirs) {
    $s = (Get-ChildItem $d.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $mb = [math]::Round($s / $oneMB, 2)
    Write-Output ("{0,-30} {1,10} MB" -f $d.Name, $mb)
}
Write-Output ""

# Top 50 largest files
Write-Output "=== TOP 50 LARGEST FILES ==="
Get-ChildItem $root -Recurse -Force -File -ErrorAction SilentlyContinue |
Sort-Object Length -Descending |
Select-Object -First 50 |
ForEach-Object {
    $rel = $_.FullName.Replace($root + '\', '')
    $fmb = [math]::Round($_.Length / $oneMB, 2)
    Write-Output ("{0,10} MB  {1}" -f $fmb, $rel)
}
Write-Output ""

# Heavy file search
Write-Output "=== HEAVY FILE SEARCH ==="
$exts = @('*.pt', '*.onnx', '*.safetensors', '*.ckpt', '*.h5', '*.glb', '*.fbx', '*.mp4', '*.mov', '*.mkv', '*.zip', '*.tar', '*.bin', '*.pkl', '*.pth', '*.weights')
foreach ($ext in $exts) {
    $files = Get-ChildItem $root -Recurse -Filter $ext -Force -ErrorAction SilentlyContinue
    if ($files) {
        $totalExtSize = ($files | Measure-Object -Property Length -Sum).Sum
        $extMB = [math]::Round($totalExtSize / $oneMB, 2)
        Write-Output ("  {0,-20} {1} file(s), {2} MB total" -f $ext, $files.Count, $extMB)
        foreach ($f in ($files | Sort-Object Length -Descending | Select-Object -First 5)) {
            $rel = $f.FullName.Replace($root + '\', '')
            $fmb = [math]::Round($f.Length / $oneMB, 2)
            Write-Output ("    {0,10} MB  {1}" -f $fmb, $rel)
        }
    }
}
Write-Output ""

# node_modules
Write-Output "=== NODE_MODULES ==="
$nmPaths = @("$root\node_modules", "$root\backend\node_modules", "$root\platform\node_modules")
foreach ($nm in $nmPaths) {
    if (Test-Path $nm) {
        $nmSize = (Get-ChildItem $nm -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $relNm = $nm.Replace($root + '\', '')
        $nmMB = [math]::Round($nmSize / $oneMB, 2)
        Write-Output ("  {0}: {1} MB" -f $relNm, $nmMB)
    }
    else {
        $relNm = $nm.Replace($root + '\', '')
        Write-Output ("  {0}: NOT PRESENT" -f $relNm)
    }
}
Write-Output ""

# data and assets directories
Write-Output "=== DATA AND ASSETS DIRECTORIES ==="
$checkDirs = @("data", "assets", "data\models", "data\previews", "data\outputs", "data\exports", "data\datasets")
foreach ($cd in $checkDirs) {
    $p = Join-Path $root $cd
    if (Test-Path $p) {
        $count = (Get-ChildItem $p -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
        $sz = (Get-ChildItem $p -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $szMB = [math]::Round($sz / $oneMB, 2)
        Write-Output ("  {0,-25} EXISTS  {1} files, {2} MB" -f $cd, $count, $szMB)
    }
    else {
        Write-Output ("  {0,-25} MISSING" -f $cd)
    }
}
Write-Output ""

# .git and LFS
Write-Output "=== GIT AND LFS ==="
if (Test-Path "$root\.git") {
    $gitSize = (Get-ChildItem "$root\.git" -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $gitMB = [math]::Round($gitSize / $oneMB, 2)
    Write-Output ".git exists: $gitMB MB"
    if (Test-Path "$root\.gitattributes") {
        Write-Output ".gitattributes found:"
        Get-Content "$root\.gitattributes" | ForEach-Object { Write-Output "  $_" }
    }
    else {
        Write-Output ".gitattributes: NOT FOUND"
    }
    if (Test-Path "$root\.git\lfs") {
        $lfsSize = (Get-ChildItem "$root\.git\lfs" -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $lfsMB = [math]::Round($lfsSize / $oneMB, 2)
        Write-Output "Git LFS: CONFIGURED ($lfsMB MB)"
    }
    else {
        Write-Output "Git LFS: NOT CONFIGURED"
    }
}
else {
    Write-Output ".git: NOT FOUND (no git repo initialized)"
}
Write-Output ""

# .env flags
Write-Output "=== ENV FLAGS ==="
if (Test-Path "$root\.env") {
    $envContent = Get-Content "$root\.env"
    $flags = $envContent | Select-String -Pattern "ENABLE_|MOCK_|REAL_|GPU_|CUDA"
    if ($flags) {
        $flags | ForEach-Object { Write-Output "  $_" }
    }
    else {
        Write-Output "  No ENABLE_/MOCK_/REAL_/GPU_ flags found in .env"
    }
}
else {
    Write-Output "  .env NOT PRESENT"
}
Write-Output ""

# Missing artifacts analysis
Write-Output "=== MISSING ARTIFACTS ANALYSIS ==="
$missing = @()

# AI models
$modelExts = @('*.pt', '*.onnx', '*.safetensors', '*.ckpt', '*.h5', '*.pth', '*.weights')
$modelCount = 0
foreach ($me in $modelExts) {
    $found = Get-ChildItem $root -Recurse -Filter $me -Force -ErrorAction SilentlyContinue
    if ($found) { $modelCount += $found.Count }
}
if ($modelCount -eq 0) {
    $missing += "AI model weights (*.pt *.onnx *.safetensors *.ckpt *.h5)"
    Write-Output "  [MISSING] AI model weights -- no trained model files found"
}
else {
    Write-Output "  [FOUND] AI model weights: $modelCount files"
}

# 3D exports
$threeDCount = 0
foreach ($te in @('*.glb', '*.fbx', '*.obj', '*.blend')) {
    $found = Get-ChildItem $root -Recurse -Filter $te -Force -ErrorAction SilentlyContinue
    if ($found) { $threeDCount += $found.Count }
}
if ($threeDCount -eq 0) {
    $missing += "3D exports (*.glb *.fbx *.obj)"
    Write-Output "  [MISSING] 3D model exports -- no GLB/FBX/OBJ files found"
}
else {
    Write-Output "  [FOUND] 3D exports: $threeDCount files"
}

# Video outputs
$videoCount = 0
foreach ($ve in @('*.mp4', '*.mov', '*.mkv', '*.webm')) {
    $found = Get-ChildItem $root -Recurse -Filter $ve -Force -ErrorAction SilentlyContinue
    if ($found) { $videoCount += $found.Count }
}
if ($videoCount -eq 0) {
    $missing += "Video outputs (*.mp4 *.mov *.mkv *.webm)"
    Write-Output "  [MISSING] Video outputs -- no rendered video files found"
}
else {
    Write-Output "  [FOUND] Video outputs: $videoCount files"
}

# Datasets
$datasetCount = 0
foreach ($de in @('*.csv', '*.jsonl', '*.parquet', '*.arrow')) {
    $found = Get-ChildItem "$root\data" -Recurse -Filter $de -Force -ErrorAction SilentlyContinue
    if ($found) { $datasetCount += $found.Count }
}
if ((-not (Test-Path "$root\data\datasets")) -and $datasetCount -eq 0) {
    $missing += "Datasets (data/datasets/ or *.csv *.parquet files)"
    Write-Output "  [MISSING] Datasets -- no dataset directory or data files found"
}
else {
    Write-Output "  [FOUND] Dataset files: $datasetCount files"
}

# Archives
$archiveCount = 0
foreach ($ae in @('*.zip', '*.tar', '*.7z')) {
    $found = Get-ChildItem $root -Recurse -Filter $ae -Force -ErrorAction SilentlyContinue
    if ($found) { $archiveCount += $found.Count }
}
if ($archiveCount -eq 0) {
    $missing += "Export archives (*.zip *.tar.gz)"
    Write-Output "  [MISSING] Export archives -- no zip/tar files found"
}
else {
    Write-Output "  [FOUND] Archives: $archiveCount files"
}

Write-Output ""
Write-Output "=== RECOMMENDATION ==="
if ($missing.Count -gt 0) {
    Write-Output "MISSING HEAVY ARTIFACTS: YES"
    Write-Output "The following artifact types are NOT on disk:"
    foreach ($m in $missing) { Write-Output "  - $m" }
    Write-Output ""
    Write-Output "This explains the small repo size (~$totalMB MB)."
    Write-Output "The codebase is source-code-only. All heavy artifacts (trained models,"
    Write-Output "rendered videos, 3D exports, datasets) must be generated at runtime or"
    Write-Output "pulled from external storage (S3/GCS/Azure Blob) or Git LFS."
}
else {
    Write-Output "MISSING HEAVY ARTIFACTS: NO -- all expected artifact types found."
}
