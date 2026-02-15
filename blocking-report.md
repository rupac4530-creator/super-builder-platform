# Engine Alto — Blocking Report

**Version:** v1.0-rc1
**Date:** 2026-02-15

---

## Blocking Item 1: Docker Not Available

**Severity:** Medium
**Impact:** Cannot build/test Docker images, cannot run docker-compose E2E, cannot validate K8s deployment workflow.

### Reproduction
```powershell
docker --version
# Error: 'docker' is not recognized as a command
```

### Root Cause
Docker Desktop is not installed on the development machine.

### Remediation Options

**Option A — Install Docker Desktop (Low-risk, ~30 min)**
```powershell
# Download Docker Desktop for Windows
winget install Docker.DockerDesktop
# Restart, enable WSL2 backend
# Verify: docker --version
```
Estimated effort: 30 minutes

**Option B — Use GitHub Actions only (Zero local risk)**
Docker images are already built in CI (`.github/workflows/ci.yml` docker-build job). Accept that Docker validation happens only in CI. Add a note in README.
Estimated effort: 5 minutes

---

## Blocking Item 2: Python Not in System PATH

**Severity:** Medium
**Impact:** Cannot run `verify_host.sh` demo, `trainer.py`, or Phase 1 `alto-core` tests from terminal.

### Reproduction
```powershell
python --version
# Error: 'python' is not recognized
where.exe python
# INFO: Could not find files
```

### Root Cause
Python may be installed but not added to system PATH, or only accessible via Windows Store alias.

### Remediation Options

**Option A — Add Python to PATH (Low-risk, ~5 min)**
```powershell
# Find Python installation
Get-ChildItem "C:\Users\BEDANTA\AppData\Local\Programs\Python" -Recurse -Filter "python.exe" -ErrorAction SilentlyContinue
Get-ChildItem "C:\Python*" -ErrorAction SilentlyContinue

# Add to PATH (adjust path as needed):
$env:PATH += ";C:\Users\BEDANTA\AppData\Local\Programs\Python\Python311"
# Or use the Windows Settings → Environment Variables → Add to PATH
```
Estimated effort: 5 minutes

**Option B — Use `py` launcher (Zero-risk)**
```powershell
py --version    # Windows Python launcher
py -m pytest    # Run tests via launcher
py apps/hello-alto/main.py
```
Estimated effort: 2 minutes

---

## Blocking Item 3: FFmpeg Not Available

**Severity:** Low
**Impact:** Cannot generate the 10s 1080p demo video artifact for the release package.

### Reproduction
```powershell
ffmpeg -version
# Error: 'ffmpeg' is not recognized
```

### Remediation Options

**Option A — Install FFmpeg (Low-risk, ~10 min)**
```powershell
winget install Gyan.FFmpeg
# Or download from https://ffmpeg.org/download.html
# Add to PATH
```
Estimated effort: 10 minutes

**Option B — Skip video artifact (Zero-risk)**
Document as "pending" in release notes. The FFmpeg job processor in `queue.ts` already has a mock fallback. Real video generation can be validated post-install.
Estimated effort: 2 minutes

---

## Blocking Item 4: Blender Not Available

**Severity:** Low
**Impact:** Cannot generate GLB model preview artifact for the release package.

### Reproduction
```powershell
blender --version
# Error: 'blender' is not recognized
```

### Remediation Options

**Option A — Install Blender (Low-risk, ~15 min)**
```powershell
winget install BlenderFoundation.Blender
```
Estimated effort: 15 minutes

**Option B — Use a pre-built GLB (Zero-risk)**
Include a minimal `.glb` file (e.g., a colored cube) generated programmatically or downloaded from a CC0 source. Skip Blender-dependent workflows.
Estimated effort: 5 minutes

---

## Summary

| Item | Recommended Fix | Effort |
|------|----------------|--------|
| Docker | Option B (CI-only) | 5 min |
| Python | Option B (`py` launcher) | 2 min |
| FFmpeg | Option A (install) or B (skip) | 10 min |
| Blender | Option B (pre-built GLB) | 5 min |

**Total blocking items: 4**
**Critical blockers: 0** (all have viable workarounds)
