# Research Summary: Video Diffusion, NeRF, On-Device LLMs & WebGPU

## 1. Video Diffusion (Sora-class Generation)

### Key Papers & Models
- **Sora (OpenAI, 2024)**: Diffusion transformer generating 1080p video up to 60s with scene-level temporal consistency. Uses spacetime patches and DiT-based architecture.
- **Stable Video Diffusion (Stability AI)**: Multi-frame latent diffusion with optical flow guidance. Open-weight model available.
- **Veo/Veo2 (Google DeepMind)**: High-fidelity video gen with style transfer, longer output durations.
- **CogVideoX (Zhipu AI)**: Open-source text-to-video with 6B parameters.

### Implementation in Super Builder
- **Algorithm**: Temporal latent diffusion with cross-frame attention and optical flow post-processing
- **Key techniques**:
  - Optical flow fusion for motion consistency (RAFT-based)
  - Face/object preservation via ControlNet-style conditioning
  - Keyframe interpolation with learned temporal priors
  - Style presets: cinematic, anime, noir, vaporwave, documentary, music-video, horror
- **Fallback**: CPU inference with reduced resolution (480p), fewer frames, quantized models (INT8)
- **File**: `backend/src/services/media/noise-video.ts`

### Cost Estimate
| Resource | Amount |
|----------|--------|
| GPU hours (A100) | 0.5-2h per 10s 1080p video |
| Cloud cost | ~$2-8 per video |
| Storage | ~500MB per 10s raw frames |

---

## 2. Neural Radiance Fields (NeRF)

### Key Papers & Technologies
- **Instant-NGP (NVIDIA, 2022)**: Real-time NeRF training using multi-resolution hash grids. 5-second training.
- **3D Gaussian Splatting (Kerbl et al., 2023)**: Explicit 3D representation using Gaussians. Faster rendering than NeRF.
- **NeRF Studio (Tancik et al.)**: Modular framework for NeRF research and deployment.
- **Neus2**: Neural surface reconstruction with SDF for better mesh extraction.

### Implementation in Super Builder
- **Algorithm**: Instant-NGP with hash-grid acceleration for training, marching cubes for mesh extraction
- **Pipeline**: Multi-view photos → COLMAP camera estimation → NeRF training → mesh export → PBR texture baking
- **Editing**: Cage-based deformation, material painting, novel view rendering
- **Export**: GLB/PLY/USD with LODs and PBR textures
- **File**: `backend/src/services/3d/nerf-editor.ts`

### Fallback Strategy
- CPU-only: Use photogrammetry (COLMAP + OpenMVS meshing) — slower but no GPU required
- Reduced resolution SDF extraction with fewer training iterations

### Cost Estimate
| Resource | GPU | CPU |
|----------|-----|-----|
| Training | 5-20 min (RTX 4090) | 1-2 hours |
| Mesh extraction | 1-5 min | 10-30 min |
| Storage | 50-200MB per scene | Same |

---

## 3. On-Device LLM Inference

### Key Technologies
- **llama.cpp / ggml**: Quantized inference engine in C/C++. Supports Q4/Q5/Q8 quantization. Runs on CPU, CUDA, Metal, Vulkan.
- **ONNX Runtime**: Cross-platform ML inference. WebGPU backend for browser acceleration.
- **WebLLM (MLC)**: Browser-based LLM using WebGPU. Runs Llama2/3, Phi, Mistral in-browser.
- **MediaPipe (Google)**: On-device ML solutions for mobile (Gemma Nano).

### Recommended Models
| Model | Size (Q4) | RAM | Speed (CPU) |
|-------|-----------|-----|-------------|
| Phi-3 mini (3.8B) | 2.3GB | 3GB | 20-40 tok/s |
| Llama 3.2 (1B) | 700MB | 1.5GB | 40-80 tok/s |
| Llama 3.2 (3B) | 1.8GB | 3GB | 15-30 tok/s |
| Qwen 2.5 (3B) | 1.8GB | 3GB | 15-30 tok/s |
| TinyLlama (1.1B) | 600MB | 1GB | 50-100 tok/s |

### Implementation
- **Backend**: llama.cpp integration via `node-llama-cpp` for local inference when `ENABLE_LOCAL_LLM=true`
- **Browser**: WebGPU-accelerated inference for privacy mode
- **Fallback**: Cloud API (OpenAI/Anthropic) when local models unavailable

---

## 4. WebGPU for Browser Compute

### Specification
- **W3C WebGPU Spec**: Low-level GPU API for the web. Successor to WebGL.
- **Browser support**: Chrome 113+, Edge 113+, Firefox (behind flag), Safari (preview)
- **Capabilities**: Compute shaders, storage buffers, indirect dispatch

### Use Cases in Super Builder
1. **In-browser 3D preview**: Model viewer with PBR rendering using WebGPU compute
2. **Real-time VFX**: Particle systems, post-processing shaders
3. **ML inference**: WebLLM uses WebGPU for transformer acceleration
4. **Audio processing**: GPU-accelerated FFT for spectrograms and effects

### Fallback
- WebGL 2.0 for GPUs without WebGPU support
- CPU fallback for all compute operations

---

## 5. Implementation Priority (for Super Builder)

| Priority | Subsystem | Impact | Complexity |
|----------|-----------|--------|------------|
| 1 | Video Engine (Sora-style) | Very High | High |
| 2 | NeRF 3D Reconstruction | High | Medium |
| 3 | On-Device LLM (llama.cpp) | High | Low |
| 4 | WebGPU Preview | Medium | Medium |
| 5 | Voice Cloning | Medium | Low |
| 6 | Cloth Simulation | Low | High |

---

## References

1. Sora — https://openai.com/sora
2. Stable Video Diffusion — https://stability.ai/stable-video
3. Instant-NGP — https://github.com/NVlabs/instant-ngp
4. 3D Gaussian Splatting — https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/
5. llama.cpp — https://github.com/ggerganov/llama.cpp
6. WebGPU Spec — https://www.w3.org/TR/webgpu/
7. WebLLM — https://github.com/mlc-ai/web-llm
8. CogVideoX — https://github.com/THUDM/CogVideo
