"""
Fix diffusers version and generate SDXL-Turbo images
Step 1: Pin diffusers==0.31.0 + transformers==4.44.0 (known compatible)
Step 2: Clear broken cache
Step 3: Download and run SDXL-Turbo
"""
import os
import sys
import subprocess

pyExe = sys.executable
print("=" * 50)
print("  Fixing Dependencies for SDXL-Turbo")
print("=" * 50)

# Step 1: Pin compatible versions
print("\n>>> Step 1: Installing compatible diffusers + transformers")
packages = [
    "diffusers==0.31.0",
    "transformers==4.44.0",
    "sentencepiece",
    "protobuf",
    "safetensors",
    "accelerate"
]
for pkg in packages:
    print(f"  Installing {pkg}...")
    subprocess.run([pyExe, "-m", "pip", "install", pkg, "--quiet", "--no-warn-script-location"], 
                   capture_output=True, timeout=120)

# Step 2: Clear broken HF cache
print("\n>>> Step 2: Clearing broken HF cache")
cache_dir = r"D:\super-builder-platform\data\models\sdxl-turbo"
if os.path.exists(cache_dir):
    import shutil
    shutil.rmtree(cache_dir, ignore_errors=True)
    print(f"  Cleared {cache_dir}")

# Step 3: Test import
print("\n>>> Step 3: Testing imports")
try:
    import importlib
    # Need to reload since we changed versions
    if 'diffusers' in sys.modules:
        # Force reimport by clearing all diffusers modules
        to_remove = [k for k in sys.modules.keys() if 'diffusers' in k or 'transformers' in k]
        for k in to_remove:
            del sys.modules[k]
    
    from diffusers import AutoPipelineForText2Image
    print("  AutoPipelineForText2Image: OK")
except Exception as e:
    print(f"  AutoPipelineForText2Image failed: {e}")
    try:
        from diffusers import StableDiffusionXLPipeline
        print("  StableDiffusionXLPipeline: OK (fallback)")
    except Exception as e2:
        print(f"  All imports failed: {e2}")
        print("  Will launch in subprocess...")

# Step 4: Run SDXL in a fresh subprocess (avoids cached module issues)
print("\n>>> Step 4: Running SDXL-Turbo in fresh subprocess")
sdxl_script = r'''
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
'''

script_path = r"D:\super-builder-platform\scripts\_sdxl_gen.py"
with open(script_path, "w") as f:
    f.write(sdxl_script)

result = subprocess.run([pyExe, script_path], capture_output=False, timeout=600)
print(f"\n  Subprocess exit code: {result.returncode}")
print(f"  Done at {__import__('datetime').datetime.now().strftime('%H:%M:%S')}")
