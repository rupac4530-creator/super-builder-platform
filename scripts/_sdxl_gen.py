
import os, sys, json, time, hashlib, torch
from pathlib import Path
from datetime import datetime

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
    return h.hexdigest()

PREVIEWS = Path("D:/super-builder-platform/data/previews")
MODELS = Path("D:/super-builder-platform/data/models")
PREVIEWS.mkdir(parents=True, exist_ok=True)

print(f"PyTorch: {torch.__version__}, CUDA: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")

try:
    from diffusers import AutoPipelineForText2Image
    PipeClass = AutoPipelineForText2Image
    print("Using AutoPipelineForText2Image")
except:
    from diffusers import DiffusionPipeline
    PipeClass = DiffusionPipeline
    print("Using DiffusionPipeline (fallback)")

print("Loading SDXL-Turbo (fp16)...")
pipe = PipeClass.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float16,
    variant="fp16",
    cache_dir=str(MODELS / "sdxl-turbo")
)
if torch.cuda.is_available():
    pipe = pipe.to("cuda")
print(f"Model loaded. VRAM: {torch.cuda.memory_allocated()/1024**3:.1f} GB")

prompts = [
    "a cinematic shot of mountains at sunset, ultra detailed, 8k",
    "a futuristic city at night with neon lights, cyberpunk style",
    "a magical forest with glowing mushrooms and fireflies",
    "an astronaut floating in space above Earth, photorealistic",
    "a steampunk mechanical dragon, intricate details, brass gears",
    "a serene Japanese garden with cherry blossoms, zen atmosphere",
    "underwater coral reef with colorful tropical fish, volumetric light",
    "a medieval castle on a cliff during thunderstorm, dramatic"
]

manifest = []
for i, prompt in enumerate(prompts):
    print(f"  [{i+1}/{len(prompts)}] {prompt[:50]}...")
    t0 = time.time()
    with torch.no_grad():
        img = pipe(prompt=prompt, num_inference_steps=4, guidance_scale=0.0, width=512, height=512).images[0]
    fp = PREVIEWS / f"sdxl-turbo-{i+1:03d}.png"
    img.save(fp)
    elapsed = time.time() - t0
    sz = fp.stat().st_size
    cs = sha256_file(fp)
    print(f"    -> {fp.name} ({sz/1024:.0f} KB, {elapsed:.1f}s)")
    manifest.append({"file": str(fp), "size": sz, "sha256": cs, "prompt": prompt, "time_s": round(elapsed,2)})
    torch.cuda.empty_cache()

print(f"\nGenerated {len(manifest)} images")
with open(PREVIEWS / "sdxl-manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)
print("Manifest saved to previews/sdxl-manifest.json")
