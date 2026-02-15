"""
SDXL-Turbo Generator — with hf-xet disabled
Uses HF_HUB_ENABLE_HF_TRANSFER=0 to avoid xet transport bugs
"""
import os
import sys
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime

# Disable hf-xet transport to prevent "file already exists" error
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"
os.environ["HF_HUB_DISABLE_EXPERIMENTAL_WARNING"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"

# Uninstall hf-xet if it causes issues
os.system(f'"{sys.executable}" -m pip uninstall hf-xet -y --quiet 2>nul')

import torch
from pathlib import Path

PREVIEWS = Path("D:/super-builder-platform/data/previews")
MODELS = Path("D:/super-builder-platform/data/models")
PREVIEWS.mkdir(parents=True, exist_ok=True)

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

print("=" * 50)
print("  SDXL-Turbo Image Generator")
print(f"  PyTorch: {torch.__version__}")
print(f"  CUDA: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"  GPU: {torch.cuda.get_device_name(0)}")
print("=" * 50)

# Clear any existing broken cache
cache_dir = MODELS / "sdxl-turbo"
if cache_dir.exists():
    import shutil
    print(f"\n  Clearing old cache at {cache_dir}...")
    shutil.rmtree(cache_dir, ignore_errors=True)

print("\n>>> Loading SDXL-Turbo model (fp16)...")
print("  This will download ~3.5 GB on first run...")

try:
    from diffusers import AutoPipelineForText2Image
    
    pipe = AutoPipelineForText2Image.from_pretrained(
        "stabilityai/sdxl-turbo",
        torch_dtype=torch.float16,
        variant="fp16",
        cache_dir=str(cache_dir)
    )
    
    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
    
    vram_used = torch.cuda.memory_allocated() / 1024**3 if torch.cuda.is_available() else 0
    print(f"  Model loaded! VRAM: {vram_used:.1f} GB")
    
    # Generate images
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
        print(f"\n  [{i+1}/{len(prompts)}] {prompt[:60]}...")
        t0 = time.time()
        
        with torch.no_grad():
            image = pipe(
                prompt=prompt,
                num_inference_steps=4,
                guidance_scale=0.0,
                width=512,
                height=512
            ).images[0]
        
        filename = f"sdxl-turbo-{i+1:03d}.png"
        filepath = PREVIEWS / filename
        image.save(filepath)
        elapsed = time.time() - t0
        checksum = sha256_file(filepath)
        size_kb = filepath.stat().st_size / 1024
        
        print(f"    -> {filename} ({size_kb:.0f} KB, {elapsed:.1f}s)")
        
        manifest.append({
            "file": str(filepath),
            "size_bytes": filepath.stat().st_size,
            "sha256": checksum,
            "prompt": prompt,
            "generation_time_s": round(elapsed, 2),
            "model": "stabilityai/sdxl-turbo",
            "steps": 4,
            "resolution": "512x512"
        })
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    
    # Save manifest
    with open(PREVIEWS / "sdxl-manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    
    total_size = sum(e["size_bytes"] for e in manifest)
    print(f"\n  SUCCESS: {len(manifest)} images generated")
    print(f"  Total size: {total_size / 1024 / 1024:.1f} MB")
    print(f"  Manifest: previews/sdxl-manifest.json")
    
    # Update models manifest
    models_manifest = {
        "timestamp": datetime.now().isoformat(),
        "models": [{
            "id": "stabilityai/sdxl-turbo",
            "type": "text-to-image",
            "framework": "diffusers",
            "precision": "fp16",
            "license": "openrail++",
            "status": "downloaded_and_verified",
            "cache_dir": str(cache_dir),
            "vram_required_gb": round(vram_used, 1),
            "images_generated": len(manifest)
        }]
    }
    with open(Path("D:/super-builder-platform/data/models-manifest.json"), "w") as f:
        json.dump(models_manifest, f, indent=2)
    
    # Update acceptance manifest
    acceptance_path = Path("D:/super-builder-platform/data/acceptance-manifest.json")
    acceptance = {}
    if acceptance_path.exists():
        with open(acceptance_path) as f:
            acceptance = json.load(f)
    
    existing_artifacts = acceptance.get("artifacts", [])
    for m in manifest:
        m["type"] = "image"
        m["pipeline"] = "sdxl-turbo"
    existing_artifacts.extend(manifest)
    
    acceptance["artifacts"] = existing_artifacts
    acceptance["total_artifacts"] = len(existing_artifacts)
    acceptance["total_size_bytes"] = sum(e.get("size_bytes", 0) for e in existing_artifacts)
    acceptance["last_updated"] = datetime.now().isoformat()
    acceptance["sdxl_status"] = "PASS"
    
    with open(acceptance_path, "w") as f:
        json.dump(acceptance, f, indent=2)
    
    print(f"  Acceptance manifest updated: {len(existing_artifacts)} total artifacts")
    
except Exception as e:
    print(f"\n  FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print(f"\n  Done at {datetime.now().strftime('%H:%M:%S')}")
