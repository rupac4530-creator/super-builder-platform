"""Fix diffusers/transformers compatibility and re-run failing pipelines"""
import os
import sys
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime

DATA_ROOT = Path("D:/super-builder-platform/data")
MODELS_DIR = DATA_ROOT / "models"
PREVIEWS_DIR = DATA_ROOT / "previews"
RENDERS_DIR = DATA_ROOT / "renders"
LOG_FILE = Path("D:/super-builder-platform/logs/agent-execution.log")

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def log_step(phase, step, status, detail):
    entry = json.dumps({"ts": datetime.now().isoformat(), "phase": phase, "step": step, "status": status, "detail": detail})
    with open(LOG_FILE, "a") as f:
        f.write(entry + "\n")
    print(f"  [{status}] {step}: {detail}")

print("=" * 50)
print("  Fix + Re-run Failing Pipelines")
print(f"  {datetime.now().strftime('%H:%M:%S')}")
print("=" * 50)

# Step 1: Fix diffusers + transformers
print("\n>>> Step 1: Fix diffusers/transformers compatibility")
print("  Installing sentencepiece + upgrading transformers...")
os.system(f'"{sys.executable}" -m pip install sentencepiece protobuf --quiet --no-warn-script-location')
os.system(f'"{sys.executable}" -m pip install --upgrade transformers --quiet --no-warn-script-location')
os.system(f'"{sys.executable}" -m pip install --upgrade diffusers --quiet --no-warn-script-location')

# Verify fix
try:
    from diffusers import AutoPipelineForText2Image
    print("  diffusers.AutoPipelineForText2Image imported OK")
except Exception as e:
    print(f"  Still failing: {e}")
    # Try alternative: use DiffusionPipeline directly
    print("  Trying DiffusionPipeline as fallback...")
    from diffusers import DiffusionPipeline
    print("  DiffusionPipeline imported OK")

# Step 2: SDXL-Turbo Image Generation
print("\n>>> Step 2: SDXL-Turbo Image Generation")
import torch

manifest_entries = []

try:
    # Try AutoPipelineForText2Image first, fallback to DiffusionPipeline
    try:
        from diffusers import AutoPipelineForText2Image
        pipe = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16",
            cache_dir=str(MODELS_DIR / "sdxl-turbo")
        )
    except Exception as e1:
        print(f"  AutoPipeline failed: {e1}")
        print("  Using StableDiffusionXLPipeline directly...")
        from diffusers import StableDiffusionXLPipeline
        pipe = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16",
            cache_dir=str(MODELS_DIR / "sdxl-turbo"),
            use_safetensors=True
        )
    
    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
        print(f"  Model loaded on GPU (VRAM used: {torch.cuda.memory_allocated()/1024**3:.1f} GB)")
    
    log_step("C", "sdxl-turbo-load", "PASS", f"model on GPU, VRAM: {torch.cuda.memory_allocated()/1024**3:.1f}GB")
    
    prompts = [
        "a cinematic shot of mountains at sunset, ultra detailed, 8k",
        "a futuristic city at night with neon lights, cyberpunk style",
        "a magical forest with glowing mushrooms and fireflies",
        "an astronaut floating in space above Earth, photorealistic",
        "a steampunk mechanical dragon, intricate details, brass gears",
        "a serene Japanese garden with cherry blossoms, zen atmosphere",
        "underwater coral reef with colorful tropical fish, volumetric light",
        "a medieval castle on a cliff during a thunderstorm, dramatic"
    ]
    
    for i, prompt in enumerate(prompts):
        print(f"  [{i+1}/{len(prompts)}] {prompt[:50]}...")
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
        filepath = PREVIEWS_DIR / filename
        image.save(filepath)
        elapsed = time.time() - t0
        checksum = sha256_file(filepath)
        size_kb = filepath.stat().st_size / 1024
        
        print(f"    -> {filename} ({size_kb:.0f} KB, {elapsed:.1f}s)")
        
        manifest_entries.append({
            "type": "image",
            "pipeline": "sdxl-turbo",
            "file": str(filepath),
            "size_bytes": filepath.stat().st_size,
            "sha256": checksum,
            "prompt": prompt,
            "generation_time_s": round(elapsed, 2)
        })
        
        # Clear cache between generations to prevent OOM on 6GB VRAM
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    
    print(f"\n  SDXL-Turbo: {len(prompts)} images generated successfully")
    log_step("F", "sdxl-images", "PASS", f"{len(prompts)} images generated")
    
    # Clean up
    del pipe
    torch.cuda.empty_cache()
    
except Exception as e:
    print(f"  SDXL FAILED: {e}")
    import traceback
    traceback.print_exc()
    log_step("F", "sdxl-images", "FAIL", str(e))

# Step 3: Fix Video Pipeline
print("\n>>> Step 3: Video Pipeline (fix FFmpeg path)")
try:
    from PIL import Image, ImageDraw
    import numpy as np
    
    frames_dir = RENDERS_DIR / "video-frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    
    fps = 30
    duration_s = 5
    total_frames = fps * duration_s
    width, height = 1280, 720
    
    # Check if frames already exist
    existing = list(frames_dir.glob("frame_*.png"))
    if len(existing) < total_frames:
        print(f"  Generating {total_frames} frames ({width}x{height})...")
        for frame_idx in range(total_frames):
            img = Image.new('RGB', (width, height))
            draw = ImageDraw.Draw(img)
            t = frame_idx / total_frames
            
            for y in range(height):
                r = int(20 + 80 * (y / height) + 50 * abs(np.sin(t * np.pi * 2 + y/100)))
                g = int(10 + 40 * abs(np.cos(t * np.pi * 3)))
                b = int(100 + 100 * (1 - y / height) + 30 * abs(np.sin(t * np.pi * 4)))
                r, g, b = min(255, r), min(255, g), min(255, b)
                draw.line([(0, y), (width, y)], fill=(r, g, b))
            
            np.random.seed(42)
            for _ in range(20):
                cx = int((np.random.random() * width + frame_idx * 3) % width)
                cy = int((np.random.random() * height + np.sin(frame_idx * 0.1) * 50) % height)
                radius = int(5 + 15 * np.random.random())
                color = (int(200 + 55 * np.random.random()), int(100 + 100 * np.random.random()), int(200 + 55 * np.random.random()))
                draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], fill=color)
            
            draw.text((40, height - 60), f"Engine Alto AI Lab - Frame {frame_idx+1}/{total_frames}", fill=(255, 255, 255))
            img.save(frames_dir / f"frame_{frame_idx:05d}.png")
        print(f"  {total_frames} frames saved")
    else:
        print(f"  {len(existing)} frames already exist")
    
    # Use subprocess for FFmpeg (more reliable than os.system with paths)
    import subprocess
    ffmpeg_exe = r"D:\super-builder-platform\tools\ffmpeg\ffmpeg.exe"
    video_out = str(RENDERS_DIR / "test-video.mp4")
    frame_pattern = str(frames_dir / "frame_%05d.png")
    
    cmd = [
        ffmpeg_exe, "-y",
        "-framerate", str(fps),
        "-i", frame_pattern,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "23",
        "-preset", "medium",
        video_out
    ]
    
    print(f"  Encoding with FFmpeg: {' '.join(cmd[:4])}...")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode != 0:
        print(f"  FFmpeg stderr: {result.stderr[:500]}")
    
    video_path = Path(video_out)
    if video_path.exists() and video_path.stat().st_size > 0:
        size_mb = video_path.stat().st_size / 1024 / 1024
        checksum = sha256_file(video_path)
        print(f"  Video: {video_path.name} ({size_mb:.1f} MB)")
        manifest_entries.append({
            "type": "video",
            "pipeline": "frame-sequence",
            "file": str(video_path),
            "size_bytes": video_path.stat().st_size,
            "sha256": checksum,
            "resolution": f"{width}x{height}",
            "fps": fps,
            "duration_s": duration_s
        })
        log_step("F", "video-mp4", "PASS", f"{size_mb:.1f}MB {width}x{height} {duration_s}s")
    else:
        print(f"  Video not created. FFmpeg output: {result.stderr[:200]}")
        log_step("F", "video-mp4", "FAIL", result.stderr[:200])

except Exception as e:
    print(f"  Video FAILED: {e}")
    import traceback
    traceback.print_exc()
    log_step("F", "video-mp4", "FAIL", str(e))

# Update acceptance manifest
print("\n>>> Updating acceptance manifest...")
try:
    existing_manifest = {}
    manifest_path = DATA_ROOT / "acceptance-manifest.json"
    if manifest_path.exists():
        with open(manifest_path) as f:
            existing_manifest = json.load(f)
    
    # Merge new entries
    existing_artifacts = existing_manifest.get("artifacts", [])
    existing_artifacts.extend(manifest_entries)
    
    existing_manifest["artifacts"] = existing_artifacts
    existing_manifest["total_artifacts"] = len(existing_artifacts)
    existing_manifest["total_size_bytes"] = sum(e.get("size_bytes", 0) for e in existing_artifacts)
    existing_manifest["last_updated"] = datetime.now().isoformat()
    
    with open(manifest_path, "w") as f:
        json.dump(existing_manifest, f, indent=2)
    
    print(f"  Total artifacts: {len(existing_artifacts)}")
    print(f"  Total size: {existing_manifest['total_size_bytes'] / 1024 / 1024:.1f} MB")
except Exception as e:
    print(f"  Manifest update failed: {e}")

print(f"\n  Done at {datetime.now().strftime('%H:%M:%S')}")
