# Engine Alto — Local Run Runbook

## Prerequisites
- Windows 10/11 with NVIDIA GPU
- Portable tools in `tools/` (Python 3.11, FFmpeg 8.0)
- No admin privileges required

## Quick Start
```powershell
# 1. Bootstrap (one-time)
powershell -ExecutionPolicy Bypass -File scripts/bootstrap-local.ps1

# 2. Start backend
cd backend && npm run dev

# 3. Start frontend (separate terminal)
cd platform && npm run dev
```

## AI Pipeline Commands

### SDXL 512 (fast, ~10s per image)
```powershell
tools\python311\python.exe scripts\sdxl-gen.py
```

### SDXL 1024 Tiling (3x3 tiles, ~3min)
```powershell
tools\python311\python.exe scripts\tiling_gen.py --w 1024 --h 1024
```

### LoRA Fine-Tuning
```powershell
tools\python311\python.exe scripts\train_lora.py --rank 4 --max-steps 100
```

### Local LLM (TinyLlama on CPU)
```powershell
tools\python311\python.exe scripts\llm_local.py --prompt "Explain AI"
```

### NeRF 3D Mesh
```powershell
tools\python311\python.exe scripts\nerf_small.py --resolution 48
```

### Audio Processing (denoise + effects + MP3)
```powershell
tools\python311\python.exe scripts\audio_pipeline.py --mode all
```

### Video Generation (FFmpeg)
```powershell
tools\ffmpeg\ffmpeg.exe -y -f lavfi -i testsrc=duration=5:size=1280x720:rate=30 -c:v libx264 data\outputs\test-video.mp4
```

## Run All Pipelines
```powershell
powershell -ExecutionPolicy Bypass -File scripts\run-pipelines.ps1
```

## Monitoring
- Backend health: `http://localhost:3001/api/health`
- Prometheus metrics: `http://localhost:3001/api/metrics/prom`
- Queue stats: `http://localhost:3001/api/jobs/stats`

## Troubleshooting
| Issue | Fix |
|-------|-----|
| CUDA OOM | Reduce tile-size to 256 or lower batch |
| FFmpeg missing | Check `tools/ffmpeg/ffmpeg.exe` exists |
| Model download fails | Set `HF_HUB_ENABLE_HF_TRANSFER=0` |
| Redis not found | Queue uses in-memory fallback automatically |
| GPU locked | Only 1 GPU job at a time via GpuLockManager |

## Reports
| File | Contents |
|------|----------|
| `report/verify-host.json` | Tool verification |
| `report/blockers.json` | Non-admin blocked items |
| `report/final-status.json` | Final completion status |
| `report/selfheal/` | Crash logs |
| `data/outputs/{jobId}/logs.log` | Per-job logs |
