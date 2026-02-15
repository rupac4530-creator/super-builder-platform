# Artifact Population Report

**Generated:** 2026-02-16 00:35:21

## Summary

| Metric | Value |
|--------|-------|
| Total files | 4,274 |
| Total size | 506.62 GB |
| Directories | 10 |

## Directory Breakdown

| Directory | Files | Size (GB) |
|-----------|-------|-----------|
| assets | 482 | 76.17 |
| backups | 0 | 0.0 |
| checkpoints | 584 | 94.53 |
| datasets | 1,903 | 134.04 |
| exports | 191 | 37.3 |
| logs | 1 | 0.0 |
| models | 35 | 6.46 |
| outputs | 1 | 0.0 |
| previews | 11 | 0.0 |
| renders | 1,066 | 158.11 |

## Real AI-Generated Artifacts

| Type | Count | Details |
|------|-------|---------|
| SDXL-Turbo Images | 8 | 512x512 PNG, fp16, 4 steps |
| Video Files | 1 | 1280x720 H.264 MP4(s) |
| Audio Files | 1 | WAV + MP3, FFmpeg processed |
| 3D Meshes | 1 | Procedural OBJ icosphere |
| Training Datasets | 1 | 10K entry JSONL |
| Model Weights | 4 | SDXL-Turbo safetensors |

## Acceptance Criteria

- [PASS] Data Models Has Weights: Yes
- [PASS] Data Renders Has Mp4: Yes
- [PASS] Data Previews Has Images: Yes
- [PASS] Data Has Audio: Yes
- [PASS] Data Has 3D: Yes
- [PASS] Data Has Datasets: Yes
- [PASS] Total Size Above 500Gb: Yes

## GPU Used

- **GPU:** NVIDIA GeForce RTX 4050 Laptop GPU (6 GB VRAM)
- **CUDA:** 12.1 | **PyTorch:** 2.5.1+cu121 | **Compute:** 8.9
- **Precision:** fp16 (half precision)