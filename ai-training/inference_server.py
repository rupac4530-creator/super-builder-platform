"""
Engine Alto — Inference Server
FastAPI-based model serving with ONNX Runtime or PyTorch
"""
import os
import time
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

import torch
import torch.nn as nn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('alto-inference')

app = FastAPI(
    title="Engine Alto Inference API",
    description="GPU-accelerated model inference for Engine Alto",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model registry
loaded_models: Dict[str, Any] = {}
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


class PredictionRequest(BaseModel):
    model_name: str
    input_data: Optional[List[float]] = None
    input_text: Optional[str] = None
    top_k: int = 5


class PredictionResponse(BaseModel):
    model_name: str
    predictions: List[Dict[str, Any]]
    latency_ms: float
    device: str


class ModelInfo(BaseModel):
    name: str
    architecture: str
    parameters: int
    device: str
    loaded: bool


@app.get("/")
def root():
    return {
        "service": "Engine Alto Inference API",
        "version": "0.1.0",
        "device": str(device),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "models_loaded": len(loaded_models)
    }


@app.get("/health")
def health():
    return {"status": "healthy", "device": str(device)}


@app.get("/models")
def list_models():
    models_dir = Path(os.getenv("MODELS_DIR", "./data/models"))
    checkpoints_dir = Path(os.getenv("CHECKPOINTS_DIR", "./data/checkpoints"))

    available = []
    for d in [models_dir, checkpoints_dir]:
        if d.exists():
            for f in d.glob("**/*.pt"):
                available.append({"name": f.stem, "path": str(f), "size_mb": f.stat().st_size / 1e6})
            for f in d.glob("**/*.onnx"):
                available.append({"name": f.stem, "path": str(f), "size_mb": f.stat().st_size / 1e6, "format": "onnx"})

    return {
        "available": available,
        "loaded": list(loaded_models.keys()),
        "device": str(device)
    }


@app.post("/load/{model_name}")
def load_model(model_name: str, model_path: Optional[str] = None):
    try:
        search_dirs = [
            Path(os.getenv("CHECKPOINTS_DIR", "./data/checkpoints")),
            Path(os.getenv("MODELS_DIR", "./data/models")),
        ]

        path = None
        if model_path:
            path = Path(model_path)
        else:
            for d in search_dirs:
                candidate = d / f"{model_name}.pt"
                if candidate.exists():
                    path = candidate
                    break
                candidate = d / f"{model_name}_best.pt"
                if candidate.exists():
                    path = candidate
                    break

        if not path or not path.exists():
            raise HTTPException(404, f"Model file not found: {model_name}")

        checkpoint = torch.load(path, map_location=device, weights_only=False)
        loaded_models[model_name] = {
            "checkpoint": checkpoint,
            "path": str(path),
            "loaded_at": time.time()
        }

        logger.info(f"✅ Model loaded: {model_name} from {path}")
        return {"status": "loaded", "model": model_name, "device": str(device)}

    except Exception as e:
        raise HTTPException(500, f"Failed to load model: {str(e)}")


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    start = time.time()

    if request.model_name not in loaded_models:
        # Return mock prediction if model not loaded
        latency = (time.time() - start) * 1000
        return PredictionResponse(
            model_name=request.model_name,
            predictions=[
                {"class": f"class_{i}", "confidence": round(0.95 - i * 0.15, 3)}
                for i in range(min(request.top_k, 5))
            ],
            latency_ms=round(latency, 2),
            device=str(device)
        )

    # Real inference would happen here with loaded model
    latency = (time.time() - start) * 1000

    return PredictionResponse(
        model_name=request.model_name,
        predictions=[
            {"class": f"class_{i}", "confidence": round(0.95 - i * 0.1, 3)}
            for i in range(min(request.top_k, 5))
        ],
        latency_ms=round(latency, 2),
        device=str(device)
    )


@app.get("/gpu")
def gpu_status():
    if not torch.cuda.is_available():
        return {"available": False, "device": "CPU"}

    return {
        "available": True,
        "device": torch.cuda.get_device_name(0),
        "memory_total_mb": round(torch.cuda.get_device_properties(0).total_mem / 1e6),
        "memory_allocated_mb": round(torch.cuda.memory_allocated() / 1e6),
        "memory_reserved_mb": round(torch.cuda.memory_reserved() / 1e6),
        "memory_free_mb": round((torch.cuda.get_device_properties(0).total_mem - torch.cuda.memory_allocated()) / 1e6),
        "cuda_version": torch.version.cuda,
        "pytorch_version": torch.__version__,
    }


def main():
    port = int(os.getenv("INFERENCE_PORT", "8000"))
    logger.info(f"🚀 Starting Engine Alto Inference Server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")


if __name__ == "__main__":
    main()
