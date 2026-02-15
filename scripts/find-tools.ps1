$ErrorActionPreference = 'Continue'
# Check package managers
Write-Host '--- Package Managers ---'
try { $v = choco --version 2>&1; Write-Host "choco: $v" } catch { Write-Host 'choco: NOT FOUND' }
try { $v = scoop --version 2>&1; Write-Host "scoop: $v" } catch { Write-Host 'scoop: NOT FOUND' }
try { $v = winget --version 2>&1; Write-Host "winget: $v" } catch { Write-Host 'winget: NOT FOUND' }

# Check GPU
Write-Host '--- GPU ---'
try {
    $q = nvidia-smi --query-gpu=name, memory.total --format=csv, noheader 2>&1
    Write-Host "GPU: $q"
}
catch { Write-Host 'nvidia-smi: NOT FOUND' }

# Search for Python
Write-Host '--- Python Search ---'
$searchPaths = @(
    'C:\Python*',
    'C:\Program Files\Python*',
    'C:\Program Files (x86)\Python*',
    "$env:LOCALAPPDATA\Programs\Python\Python*",
    "$env:APPDATA\Python\Python*",
    'C:\Users\BEDANTA\AppData\Local\Programs\Python\Python*'
)
foreach ($sp in $searchPaths) {
    $found = Get-Item $sp -ErrorAction SilentlyContinue
    foreach ($f in $found) {
        $pyExe = Join-Path $f.FullName 'python.exe'
        if (Test-Path $pyExe) { Write-Host "FOUND: $pyExe" }
    }
}

# Search for FFmpeg
Write-Host '--- FFmpeg Search ---'
$ffPaths = @(
    'C:\ffmpeg*',
    'C:\Program Files\ffmpeg*',
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg*"
)
foreach ($sp in $ffPaths) {
    $found = Get-Item $sp -ErrorAction SilentlyContinue
    foreach ($f in $found) { Write-Host "FOUND dir: $($f.FullName)" }
}

# Search for Docker
Write-Host '--- Docker Search ---'
$dkPaths = @(
    'C:\Program Files\Docker\Docker\resources\bin\docker.exe',
    'C:\Program Files\Docker\Docker\docker.exe',
    "$env:LOCALAPPDATA\Docker\resources\bin\docker.exe",
    "$env:ProgramFiles\Docker Desktop\docker.exe"
)
foreach ($dp in $dkPaths) {
    if (Test-Path $dp) { Write-Host "FOUND: $dp" }
}

# Check if Chocolatey can be installed
Write-Host '--- Alternate Install Methods ---'
Write-Host "PowerShell version: $($PSVersionTable.PSVersion)"
Write-Host "OS: $([System.Runtime.InteropServices.RuntimeInformation]::OSDescription)"
Write-Host "Invoke-WebRequest available: $((Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue) -ne $null)"
Write-Host "curl available: $((Get-Command curl.exe -ErrorAction SilentlyContinue) -ne $null)"
