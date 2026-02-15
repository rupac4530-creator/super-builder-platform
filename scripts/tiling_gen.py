"""
SDXL 1024 Tiling Pipeline — generates 1024x1024 images via
512-tile overlapping + seam blending on RTX 4050 (6GB VRAM)

Usage:
  python scripts/tiling_gen.py --prompt "futuristic city" --w 1024 --h 1024
"""
import os, sys, json, time, hashlib, argparse
from pathlib import Path
from datetime import datetime

os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
    return h.hexdigest()

def parse_args():
    p = argparse.ArgumentParser(description="SDXL 1024 Tiling Generator")
    p.add_argument("--prompt", default="a futuristic city at night, neon lights, cyberpunk, 8k")
    p.add_argument("--w", type=int, default=1024)
    p.add_argument("--h", type=int, default=1024)
    p.add_argument("--tile-size", type=int, default=512)
    p.add_argument("--overlap", type=int, default=64)
    p.add_argument("--steps", type=int, default=4)
    p.add_argument("--model", default="stabilityai/sdxl-turbo")
    p.add_argument("--out", default="D:/super-builder-platform/data/previews")
    p.add_argument("--model-cache", default="D:/super-builder-platform/data/models/sdxl-turbo")
    return p.parse_args()

def blend_seam(canvas, tile_img, x, y, tile_w, tile_h, overlap):
    """Blend tile into canvas with feathered edges at overlap regions"""
    import numpy as np
    tile_arr = np.array(tile_img).astype(float)
    
    # Create alpha mask with feathered edges
    alpha = np.ones((tile_h, tile_w), dtype=float)
    if overlap > 0:
        # Feather left edge
        if x > 0:
            for i in range(min(overlap, tile_w)):
                alpha[:, i] *= i / overlap
        # Feather top edge
        if y > 0:
            for j in range(min(overlap, tile_h)):
                alpha[j, :] *= j / overlap
    
    # Get canvas region
    canvas_region = canvas[y:y+tile_h, x:x+tile_w].astype(float)
    
    # Blend
    alpha_3d = np.stack([alpha]*3, axis=-1)
    blended = tile_arr * alpha_3d + canvas_region * (1 - alpha_3d)
    canvas[y:y+tile_h, x:x+tile_w] = blended.astype(np.uint8)
    return canvas

def main():
    args = parse_args()
    
    print("=" * 50)
    print(f"  SDXL 1024 Tiling Pipeline")
    print(f"  Output: {args.w}x{args.h} via {args.tile_size} tiles")
    print(f"  Overlap: {args.overlap}px, Steps: {args.steps}")
    print(f"  {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 50)
    
    import torch
    import numpy as np
    from PIL import Image
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32
    print(f"\n  Device: {device}, dtype: {dtype}")
    
    # Load model
    print(f"  Loading {args.model}...")
    try:
        from diffusers import AutoPipelineForText2Image
        pipe = AutoPipelineForText2Image.from_pretrained(
            args.model, torch_dtype=dtype, variant="fp16" if dtype == torch.float16 else None,
            cache_dir=args.model_cache
        )
    except:
        from diffusers import DiffusionPipeline
        pipe = DiffusionPipeline.from_pretrained(
            args.model, torch_dtype=dtype, variant="fp16" if dtype == torch.float16 else None,
            cache_dir=args.model_cache
        )
    pipe = pipe.to(device)
    if hasattr(pipe, 'enable_attention_slicing'):
        pipe.enable_attention_slicing()
    
    vram = torch.cuda.memory_allocated()/1024**3 if device == "cuda" else 0
    print(f"  Model loaded. VRAM: {vram:.1f} GB")
    
    # Calculate tile grid
    tile_size = args.tile_size
    overlap = args.overlap
    step = tile_size - overlap
    
    cols = max(1, (args.w - overlap + step - 1) // step)
    rows = max(1, (args.h - overlap + step - 1) // step)
    total_tiles = rows * cols
    
    print(f"\n  Grid: {cols}x{rows} = {total_tiles} tiles")
    print(f"  Tile size: {tile_size}x{tile_size}, step: {step}px")
    
    # Generate tiles and blend
    canvas = np.zeros((args.h, args.w, 3), dtype=np.uint8)
    t0 = time.time()
    
    tile_prompts = []
    for row in range(rows):
        for col in range(cols):
            idx = row * cols + col + 1
            x = min(col * step, args.w - tile_size)
            y = min(row * step, args.h - tile_size)
            
            # Add spatial hints to prompt for coherence
            pos_hint = ""
            if rows > 1 or cols > 1:
                vh = "top" if row == 0 else "bottom" if row == rows-1 else "middle"
                hh = "left" if col == 0 else "right" if col == cols-1 else "center"
                pos_hint = f", {vh} {hh} section"
            
            tile_prompt = f"{args.prompt}{pos_hint}"
            
            print(f"  Tile [{idx}/{total_tiles}] at ({x},{y}) ...", end="", flush=True)
            
            with torch.no_grad():
                result = pipe(
                    prompt=tile_prompt,
                    num_inference_steps=args.steps,
                    guidance_scale=0.0,
                    width=tile_size,
                    height=tile_size
                )
                tile_img = result.images[0]
            
            # Blend tile into canvas
            canvas = blend_seam(canvas, tile_img, x, y, tile_size, tile_size, overlap)
            
            elapsed = time.time() - t0
            print(f" done ({elapsed:.1f}s total)")
            
            if device == "cuda":
                torch.cuda.empty_cache()
    
    # Save final image
    final_img = Image.fromarray(canvas)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"sdxl-tiled-{args.w}x{args.h}-{int(time.time())}.png"
    filepath = out_dir / filename
    final_img.save(filepath, quality=95)
    
    total_time = time.time() - t0
    size_kb = filepath.stat().st_size / 1024
    checksum = sha256_file(filepath)
    
    print(f"\n  Output: {filepath}")
    print(f"  Size: {size_kb:.0f} KB")
    print(f"  Time: {total_time:.1f}s ({total_tiles} tiles)")
    print(f"  SHA256: {checksum[:16]}...")
    
    # Write manifest
    manifest = {
        "pipeline": "sdxl-tiled-1024",
        "prompt": args.prompt,
        "resolution": f"{args.w}x{args.h}",
        "tile_size": tile_size,
        "overlap": overlap,
        "tiles": total_tiles,
        "steps": args.steps,
        "model": args.model,
        "file": str(filepath),
        "size_bytes": filepath.stat().st_size,
        "sha256": checksum,
        "generation_time_s": round(total_time, 2),
        "device": device,
        "timestamp": datetime.now().isoformat()
    }
    
    manifest_path = out_dir / f"tiled-manifest-{int(time.time())}.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    # Progress report
    progress = {
        "phase": "C",
        "step": "sdxl-1024-tiling",
        "status": "COMPLETE",
        "timestamp": datetime.now().isoformat(),
        "artifact": str(filepath),
        "details": manifest
    }
    report_dir = Path("D:/super-builder-platform/report")
    report_dir.mkdir(parents=True, exist_ok=True)
    with open(report_dir / f"progress-{int(time.time())}.json", "w") as f:
        json.dump(progress, f, indent=2)
    
    print(f"\n  Done at {datetime.now().strftime('%H:%M:%S')}")
    
    del pipe
    if device == "cuda":
        torch.cuda.empty_cache()

if __name__ == "__main__":
    main()
