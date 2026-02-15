# Engine Alto — Training Guide

## Quick Start

### 1. Choose an Architecture

| Architecture | Best For | GPU Memory |
|-------------|---------|------------|
| CNN | Image classification | 2-3 GB |
| ResNet | Deep recognition | 3-4 GB |
| Transformer | Text/sequence | 4-6 GB |
| U-Net | Segmentation | 2-3 GB |
| GAN | Generation | 4-5 GB |

### 2. Via the UI

1. Open http://localhost:3000
2. Click **Training Studio** in sidebar
3. Select architecture 
4. Set hyperparameters
5. Click **Start Training**
6. Watch real-time metrics

### 3. Via API

```bash
# Start training
curl -X POST http://localhost:3001/api/training/start \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "my-classifier",
    "architecture": "resnet",
    "config": {
      "epochs": 50,
      "batchSize": 32,
      "learningRate": 0.001,
      "mixedPrecision": true
    }
  }'

# Check status
curl http://localhost:3001/api/training/jobs/<job-id>

# Stop training
curl -X POST http://localhost:3001/api/training/jobs/<job-id>/stop
```

### 4. Via Python CLI

```bash
# Train on GPU
python ai-training/trainer.py \
  --architecture resnet \
  --epochs 50 \
  --batch-size 32 \
  --learning-rate 0.001 \
  --model-name my-model

# Export to ONNX
python ai-training/trainer.py \
  --architecture cnn \
  --epochs 10 \
  --export-onnx \
  --model-name exported-model
```

## RTX 4050 Optimization

Your GPU has 6GB VRAM. Best practices:

1. **Enable mixed precision** (`--mixed-precision` or `mixedPrecision: true`)
2. **Batch size**: Start with 32, reduce if OOM
3. **Gradient accumulation**: Simulate larger batches without more VRAM
4. **Pin memory**: Faster data transfer
5. **Max ~200M parameters** for Transformer models

## Troubleshooting

| Issue | Solution |
|-------|---------|
| CUDA out of memory | Reduce batch size or enable mixed precision |
| Training too slow | Enable mixed precision, increase num_workers |
| Loss not decreasing | Lower learning rate, check data |
| GPU not detected | Check CUDA installation: `nvidia-smi` |
