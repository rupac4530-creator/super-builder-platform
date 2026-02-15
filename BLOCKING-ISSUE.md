# BLOCKING-ISSUE — Missing Host Tools

**Date:** 2026-02-15
**Severity:** P0 — Required for production workflows
**Status:** BLOCKING — operator must install tools before P0 steps can fully pass

---

## Missing Tools & Exact Install Commands

### 1. Git (REQUIRED)

Git is needed for version control, branching, PR workflows, and `git-secrets` scanning.

```powershell
# Option A — winget (recommended)
winget install Git.Git

# Option B — choco
choco install git -y

# Option C — manual
# Download from https://git-scm.com/download/win and run installer
```

**Verification:**
```powershell
git --version
# Expected: git version 2.x.x
```

---

### 2. Redis (REQUIRED for production)

Redis is needed for BullMQ job persistence, caching, and pub/sub.

```powershell
# Option A — winget
winget install Redis.Redis

# Option B — WSL2 (recommended for dev)
wsl --install
wsl sudo apt-get update && sudo apt-get install redis-server -y
wsl sudo service redis-server start

# Option C — Docker (requires Docker Desktop first)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Option D — Memurai (native Windows Redis alternative)
# Download from https://www.memurai.com/get-memurai
```

**Verification:**
```powershell
redis-cli ping
# Expected: PONG

# Or via WSL:
wsl redis-cli ping
```

---

### 3. Python 3.10+ (REQUIRED for AI training)

Python is needed for trainer.py, inference_server.py, and alto-core modules.

```powershell
# Option A — winget (recommended)
winget install Python.Python.3.11

# Option B — choco
choco install python311 -y

# Option C — Microsoft Store
# Search "Python 3.11" in Microsoft Store

# IMPORTANT: During install, CHECK "Add Python to PATH"
```

**Verification:**
```powershell
python --version
# Expected: Python 3.11.x (or 3.10+)

pip --version
# Expected: pip 23.x+
```

---

### 4. FFmpeg (REQUIRED for audio/video processing)

FFmpeg is needed for audio denoising, video encoding, voice cloning, and VFX export.

```powershell
# Option A — winget (recommended)
winget install Gyan.FFmpeg

# Option B — choco
choco install ffmpeg -y

# Option C — manual
# Download from https://ffmpeg.org/download.html
# Extract to C:\ffmpeg\ and add C:\ffmpeg\bin to System PATH
```

**Verification:**
```powershell
ffmpeg -version
# Expected: ffmpeg version 6.x or 7.x
```

---

### 5. Docker Desktop (REQUIRED for containerized deployment)

Docker is needed for building images, running docker-compose, and K8s workflows.

```powershell
# Option A — winget
winget install Docker.DockerDesktop

# Option B — choco
choco install docker-desktop -y

# IMPORTANT: After install, restart PC. Enable WSL2 backend in Docker Desktop settings.
```

**Verification:**
```powershell
docker --version
# Expected: Docker version 24.x+

docker compose version
# Expected: Docker Compose version v2.x
```

---

### 6. Blender (OPTIONAL — for 3D retopo/rigging)

Blender is used headless for mesh retopology, UV baking, and auto-rigging.

```powershell
# Option A — winget
winget install BlenderFoundation.Blender

# Option B — choco
choco install blender -y

# Option C — manual
# Download from https://www.blender.org/download/
```

**Verification:**
```powershell
blender --version
# Expected: Blender 4.x
```

---

### 7. Chrome/Chromium (OPTIONAL — for Playwright/Puppeteer)

> Note: Playwright downloads its own Chromium automatically with `npx playwright install`.
> Chrome is only needed if you want to test with system Chrome.

```powershell
npx playwright install chromium
```

---

## One-Command Install (winget — run as Administrator)

```powershell
# Install ALL missing tools in one shot:
winget install Git.Git Python.Python.3.11 Gyan.FFmpeg Docker.DockerDesktop BlenderFoundation.Blender --accept-package-agreements --accept-source-agreements
```

After install, restart your terminal and run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-host.ps1
```

---

## After Resolving

1. Restart your terminal / PowerShell
2. Run `scripts/verify-host.ps1` again
3. Confirm `report/verify-host.json` shows `"overall": "PASS"`
4. Re-run the MASTER VERIFY prompt to continue blocked P0 steps
