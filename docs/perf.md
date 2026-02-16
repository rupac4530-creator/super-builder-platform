# Performance Optimization Guide — Engine Alto

## Current Configuration (RTX 4050 6GB VRAM)

| Setting | Value | Impact |
|---------|-------|--------|
| `torch_dtype` | `torch.float16` | ~50% VRAM reduction |
| `attention_slicing` | Enabled | ~30% VRAM reduction |
| `VAE slicing` | Enabled | Allows large images |
| Batch size | 1 | Required for 6GB VRAM |
| Inference steps | 4 (SDXL-Turbo) | ~10s per 512x512 |
| 1024x1024 tiling | 3x3 grid, 512 tiles | ~233s (9 tiles) |

## Optimization Options

### 1. ONNX Runtime (20-30% speedup)
```bash
pip install optimum[onnxruntime-gpu]
optimum-cli export onnx --model stabilityai/sdxl-turbo sdxl-turbo-onnx/
```
Use `ORTStableDiffusionXLPipeline` instead of `StableDiffusionXLPipeline`.

### 2. 8-bit Quantization (~50% VRAM savings)
```bash
pip install bitsandbytes
# Load model with load_in_8bit=True
```
Allows running larger models on 6GB VRAM.

### 3. TensorRT (maximum throughput)
```bash
pip install torch-tensorrt
# Export and optimize for RTX 40xx architecture
```
Best for production with fixed input sizes.

### 4. torch.compile() (10-15% speedup)
```python
pipe.unet = torch.compile(pipe.unet, mode="reduce-overhead", fullgraph=True)
```
One-time compilation cost, then faster inference.

### 5. xFormers (memory-efficient attention)
```bash
pip install xformers
pipe.enable_xformers_memory_efficient_attention()
```
Already partially achieved via `attention_slicing`.

## GPU Memory Budget

| Operation | Estimated VRAM |
|-----------|---------------|
| SDXL-Turbo fp16 | ~4.5 GB |
| LoRA adapter | +0.1 GB |
| 512x512 inference | ~5.0 GB peak |
| 1024x1024 tiled | ~5.0 GB (per tile) |
| TinyLlama 1.1B | ~2.2 GB (use CPU) |
| NeRF training | ~3.0 GB |

## Recommendation
- Use SDXL-Turbo fp16 for dev (current)
- Deploy ONNX for production inference
- Use 8-bit for larger models
- Run LLM on CPU to keep GPU free for diffusion
