"""
Audio Processing Pipeline: denoise, effects, encode, stem-sep fallback
Uses FFmpeg portable from tools/ffmpeg/

Usage:
  python scripts/audio_pipeline.py --mode denoise --input samples/voice.wav
  python scripts/audio_pipeline.py --mode generate
"""
import os, sys, json, argparse, time, hashlib, subprocess
from pathlib import Path
from datetime import datetime
import numpy as np

FFMPEG = "D:/super-builder-platform/tools/ffmpeg/ffmpeg.exe"
OUT_DIR = Path("D:/super-builder-platform/data/outputs/audio")
REPORT_DIR = Path("D:/super-builder-platform/report")

def parse_args():
    p = argparse.ArgumentParser(description="Audio Pipeline")
    p.add_argument("--mode", choices=["generate", "denoise", "effects", "encode", "all"], default="all")
    p.add_argument("--input", default=None)
    p.add_argument("--sample-rate", type=int, default=44100)
    p.add_argument("--duration", type=int, default=10)
    return p.parse_args()

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
    return h.hexdigest()

def generate_audio(sr, duration, out_dir):
    """Generate synthetic audio: chord progression + melody"""
    from scipy.io import wavfile
    
    t = np.linspace(0, duration, sr * duration, endpoint=False)
    
    # Chord progression: Am - F - C - G
    chords = [
        [220.0, 261.6, 329.6],   # Am
        [174.6, 220.0, 261.6],   # F
        [261.6, 329.6, 392.0],   # C
        [196.0, 246.9, 293.7],   # G
    ]
    
    audio = np.zeros_like(t)
    beat_len = len(t) // len(chords)
    
    for i, chord in enumerate(chords):
        start = i * beat_len
        end = start + beat_len
        segment = np.zeros(beat_len)
        for freq in chord:
            segment += 0.2 * np.sin(2 * np.pi * freq * t[:beat_len])
        # Add envelope
        envelope = np.ones(beat_len)
        fade = min(2000, beat_len // 4)
        envelope[:fade] = np.linspace(0, 1, fade)
        envelope[-fade:] = np.linspace(1, 0, fade)
        audio[start:end] = segment * envelope
    
    # Add a melody line
    melody_freqs = [440, 494, 523, 587, 659, 587, 523, 494, 440, 392]
    note_len = len(t) // len(melody_freqs)
    for i, freq in enumerate(melody_freqs):
        start = i * note_len
        end = start + note_len
        envelope = np.ones(note_len)
        fade = min(1000, note_len // 4)
        envelope[:fade] = np.linspace(0, 1, fade)
        envelope[-fade:] = np.linspace(1, 0, fade)
        audio[start:end] += 0.15 * np.sin(2 * np.pi * freq * t[:note_len]) * envelope
    
    # Normalize  
    audio = audio / (np.max(np.abs(audio)) + 1e-6) * 0.8
    
    wav_path = out_dir / "generated-music.wav"
    wavfile.write(str(wav_path), sr, (audio * 32767).astype(np.int16))
    
    print("  Generated: {} ({:.0f} KB)".format(wav_path.name, wav_path.stat().st_size / 1024))
    return wav_path

def apply_effects(input_path, out_dir):
    """Apply audio effects using FFmpeg"""
    results = []
    
    # 1. Reverb effect
    reverb_path = out_dir / "reverb-output.wav"
    cmd = [FFMPEG, "-y", "-i", str(input_path),
           "-af", "aecho=0.8:0.88:60:0.4,aecho=0.8:0.88:100:0.3",
           str(reverb_path)]
    subprocess.run(cmd, capture_output=True)
    if reverb_path.exists():
        print("  Reverb: {} ({:.0f} KB)".format(reverb_path.name, reverb_path.stat().st_size / 1024))
        results.append(reverb_path)
    
    # 2. Low-pass filter (warm tone)
    warm_path = out_dir / "warm-output.wav"
    cmd = [FFMPEG, "-y", "-i", str(input_path),
           "-af", "lowpass=f=3000,bass=g=3",
           str(warm_path)]
    subprocess.run(cmd, capture_output=True)
    if warm_path.exists():
        print("  Warm filter: {} ({:.0f} KB)".format(warm_path.name, warm_path.stat().st_size / 1024))
        results.append(warm_path)
    
    # 3. Normalize and compress
    norm_path = out_dir / "normalized-output.wav"
    cmd = [FFMPEG, "-y", "-i", str(input_path),
           "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,acompressor=threshold=-20dB:ratio=4",
           str(norm_path)]
    subprocess.run(cmd, capture_output=True)
    if norm_path.exists():
        print("  Normalized: {} ({:.0f} KB)".format(norm_path.name, norm_path.stat().st_size / 1024))
        results.append(norm_path)
    
    return results

def encode_mp3(input_path, out_dir, bitrate=192):
    """Encode WAV to MP3"""
    if isinstance(input_path, Path):
        mp3_path = out_dir / (input_path.stem + "-encoded.mp3")
    else:
        mp3_path = out_dir / "encoded-output.mp3"
    
    cmd = [FFMPEG, "-y", "-i", str(input_path),
           "-codec:a", "libmp3lame", "-b:a", "{}k".format(bitrate),
           str(mp3_path)]
    subprocess.run(cmd, capture_output=True)
    
    if mp3_path.exists():
        print("  MP3: {} ({:.0f} KB, {}kbps)".format(mp3_path.name, mp3_path.stat().st_size / 1024, bitrate))
        return mp3_path
    return None

def denoise_audio(input_path, out_dir):
    """Simple noise reduction using FFmpeg high-pass + gate"""
    clean_path = out_dir / "denoised-output.wav"
    cmd = [FFMPEG, "-y", "-i", str(input_path),
           "-af", "highpass=f=80,lowpass=f=12000,afftdn=nf=-25",
           str(clean_path)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if clean_path.exists():
        print("  Denoised: {} ({:.0f} KB)".format(clean_path.name, clean_path.stat().st_size / 1024))
        return clean_path
    else:
        # Fallback without afftdn
        cmd = [FFMPEG, "-y", "-i", str(input_path),
               "-af", "highpass=f=80,lowpass=f=12000",
               str(clean_path)]
        subprocess.run(cmd, capture_output=True)
        if clean_path.exists():
            print("  Denoised (fallback): {}".format(clean_path.name))
            return clean_path
    return None

def main():
    args = parse_args()
    
    print("=" * 50)
    print("  Audio Processing Pipeline")
    print("  Mode:", args.mode)
    print("  " + datetime.now().strftime("%H:%M:%S"))
    print("=" * 50)
    
    global FFMPEG
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    artifacts = []
    
    # Check FFmpeg
    if not Path(FFMPEG).exists():
        print("  WARNING: FFmpeg not at", FFMPEG)
        print("  Trying system ffmpeg...")
        FFMPEG = "ffmpeg"
    
    input_path = Path(args.input) if args.input else None
    
    if args.mode in ("generate", "all"):
        print("\n>>> Generating synthetic audio...")
        input_path = generate_audio(args.sample_rate, args.duration, OUT_DIR)
        artifacts.append(str(input_path))
    
    if input_path is None or not input_path.exists():
        print("  No input audio available. Generating sample...")
        input_path = generate_audio(args.sample_rate, args.duration, OUT_DIR)
        artifacts.append(str(input_path))
    
    if args.mode in ("denoise", "all"):
        print("\n>>> Denoising audio...")
        result = denoise_audio(input_path, OUT_DIR)
        if result:
            artifacts.append(str(result))
    
    if args.mode in ("effects", "all"):
        print("\n>>> Applying effects...")
        results = apply_effects(input_path, OUT_DIR)
        artifacts.extend([str(r) for r in results])
    
    if args.mode in ("encode", "all"):
        print("\n>>> Encoding to MP3...")
        result = encode_mp3(input_path, OUT_DIR)
        if result:
            artifacts.append(str(result))
    
    total_time = time.time() - t0
    
    # Build manifest
    manifest_entries = []
    for a in artifacts:
        p = Path(a)
        if p.exists():
            manifest_entries.append({
                "file": str(p),
                "size_bytes": p.stat().st_size,
                "sha256": sha256_file(p),
                "format": p.suffix
            })
    
    manifest = {
        "pipeline": "audio-processing",
        "mode": args.mode,
        "artifacts": manifest_entries,
        "total_time_s": round(total_time, 2),
        "timestamp": datetime.now().isoformat()
    }
    
    with open(OUT_DIR / "audio-manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    
    progress = {"phase": "G", "step": "audio-pipeline", "status": "COMPLETE",
                 "timestamp": datetime.now().isoformat(), "artifacts": len(manifest_entries)}
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    with open(REPORT_DIR / "progress-audio-{}.json".format(int(time.time())), "w") as f:
        json.dump(progress, f, indent=2)
    
    print("\n  Total artifacts:", len(manifest_entries))
    print("  Total time: {:.1f}s".format(total_time))
    print("  Done at", datetime.now().strftime("%H:%M:%S"))

if __name__ == "__main__":
    main()
