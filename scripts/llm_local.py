"""
Local LLM Inference via transformers (TinyLlama or similar)
Runs on CPU when GPU is occupied by SDXL

Usage:
  python scripts/llm_local.py --prompt "Explain quantum computing"
  python scripts/llm_local.py --prepare
"""
import os, sys, json, argparse, time
from pathlib import Path
from datetime import datetime

os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"
MODELS_DIR = Path("D:/super-builder-platform/data/models/llm")
REPORT_DIR = Path("D:/super-builder-platform/report")

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--prompt", default="Explain what a GPU does in simple terms.")
    p.add_argument("--model", default="TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    p.add_argument("--max-tokens", type=int, default=256)
    p.add_argument("--temperature", type=float, default=0.7)
    p.add_argument("--prepare", action="store_true")
    p.add_argument("--cache-dir", default=str(MODELS_DIR))
    return p.parse_args()

def main():
    args = parse_args()
    print("=" * 50)
    print("  Local LLM Inference Pipeline")
    print("  Model:", args.model)
    print("  " + datetime.now().strftime("%H:%M:%S"))
    print("=" * 50)

    import torch
    device = "cpu"  # Use CPU for LLM to leave GPU free for diffusion
    dtype = torch.float32
    print("\n  Device:", device)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer

        print("  Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            args.model, cache_dir=args.cache_dir, trust_remote_code=True
        )

        print("  Loading model (CPU, float32)...")
        model = AutoModelForCausalLM.from_pretrained(
            args.model, cache_dir=args.cache_dir, torch_dtype=dtype,
            low_cpu_mem_usage=True, trust_remote_code=True
        )
        model.eval()
        print("  Model loaded on CPU")

        if args.prepare:
            print("  Model cached successfully. Exiting.")
            result = {"status": "cached", "model": args.model}
            with open(MODELS_DIR / "llm-cache-report.json", "w") as f:
                json.dump(result, f, indent=2)
            return

        # Build input
        prompt_text = "User: " + args.prompt + "\nAssistant:"
        inputs = tokenizer(prompt_text, return_tensors="pt")

        print("\n  Generating response...")
        t0 = time.time()
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=args.max_tokens,
                temperature=args.temperature,
                do_sample=True,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id
            )
        elapsed = time.time() - t0

        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract just the assistant response
        if "Assistant:" in response:
            response = response.split("Assistant:")[-1].strip()

        tokens_generated = outputs.shape[1] - inputs["input_ids"].shape[1]
        tokens_per_sec = tokens_generated / max(elapsed, 0.01)

        print("\n  --- Response ---")
        print(" ", response[:500])
        print("  --- End ---")
        print(f"\n  Tokens: {tokens_generated}")
        print(f"  Time: {elapsed:.1f}s ({tokens_per_sec:.1f} tok/s)")

        result = {
            "pipeline": "local-llm",
            "model": args.model,
            "prompt": args.prompt,
            "response": response[:1000],
            "tokens_generated": tokens_generated,
            "time_s": round(elapsed, 2),
            "tokens_per_sec": round(tokens_per_sec, 1),
            "device": device,
            "timestamp": datetime.now().isoformat()
        }

        with open(MODELS_DIR / "llm-inference-result.json", "w") as f:
            json.dump(result, f, indent=2)

        progress = {"phase": "E", "step": "local-llm", "status": "COMPLETE",
                     "timestamp": datetime.now().isoformat(), "details": result}
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        with open(REPORT_DIR / "progress-llm-{}.json".format(int(time.time())), "w") as f:
            json.dump(progress, f, indent=2)

        del model
        print("\n  Done at", datetime.now().strftime("%H:%M:%S"))

    except Exception as e:
        print("  ERROR:", str(e))
        # Create fallback report
        result = {
            "pipeline": "local-llm",
            "model": args.model,
            "status": "FAILED",
            "error": str(e),
            "fallback": "Model download may be needed. Run with --prepare first.",
            "timestamp": datetime.now().isoformat()
        }
        with open(MODELS_DIR / "llm-error-report.json", "w") as f:
            json.dump(result, f, indent=2)

if __name__ == "__main__":
    main()
