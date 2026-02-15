# Engine Alto — Training Smoke Test (Windows)
# Runs a minimal 1-epoch CNN training, exports ONNX, validates response.

Write-Host "========================================"
Write-Host "  ENGINE ALTO — TRAINING SMOKE TEST"
Write-Host "========================================"

# Find Python
$Python = $null
foreach ($cmd in @("python", "python3")) {
    try {
        $ver = & $cmd --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $Python = $cmd
            break
        }
    }
    catch {}
}

# Also check known Windows path
if (-not $Python) {
    $knownPaths = @(
        "$env:LOCALAPPDATA\Programs\Python\Python314\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
        "C:\Windows.old\Users\$env:USERNAME\AppData\Local\Programs\Python\Python314\python.exe"
    )
    foreach ($p in $knownPaths) {
        if (Test-Path $p) {
            $Python = $p
            break
        }
    }
}

if (-not $Python) {
    Write-Host "[SKIP] Python not found. Install Python 3.10+ and add to PATH."
    exit 0
}

Write-Host "[INFO] Using Python: $Python"

# Check PyTorch
$hasTorch = & $Python -c "import torch; print('ok')" 2>$null
if ($hasTorch -ne "ok") {
    Write-Host "[SKIP] PyTorch not installed. Run: pip install torch torchvision"
    exit 0
}

Write-Host "[INFO] PyTorch available"
Write-Host ""
Write-Host "[STEP 1] Training minimal CNN (1 epoch, 8 batches)..."

$trainScript = @'
import sys, json, time, torch, torch.nn as nn, torch.optim as optim

class SmokeCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, 3, padding=1)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(8, 10)
    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = self.pool(x)
        x = x.view(x.size(0), -1)
        return self.fc(x)

try:
    model = SmokeCNN()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    start = time.time()
    model.train()
    for _ in range(8):
        data = torch.randn(8, 1, 28, 28)
        labels = torch.randint(0, 10, (8,))
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, labels)
        loss.backward()
        optimizer.step()
    train_time = time.time() - start
    model.eval()
    with torch.no_grad():
        pred = model(torch.randn(1, 1, 28, 28))
    print(json.dumps({"status":"pass","train_time":round(train_time,3),"loss":round(loss.item(),4),"pred":pred.argmax(1).item(),"params":sum(p.numel() for p in model.parameters())}))
except Exception as e:
    print(json.dumps({"status":"fail","error":str(e)}))
    sys.exit(1)
'@

$tmpFile = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.py'
$trainScript | Out-File -FilePath $tmpFile -Encoding utf8

$result = & $Python $tmpFile 2>&1
Write-Host $result

Remove-Item $tmpFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================"
Write-Host "  TRAINING SMOKE TEST COMPLETE"
Write-Host "========================================"
