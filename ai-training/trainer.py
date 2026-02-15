"""
Engine Alto — AI Model Training Engine
GPU-accelerated training with PyTorch, optimized for RTX 4050 (6GB VRAM)
"""
import os
import sys
import json
import time
import logging
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional, Dict, Any, List

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split
from torch.cuda.amp import autocast, GradScaler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(), logging.FileHandler('training.log')]
)
logger = logging.getLogger('alto-trainer')


@dataclass
class TrainingConfig:
    """Training configuration optimized for RTX 4050"""
    model_name: str = 'alto-model'
    architecture: str = 'cnn'
    epochs: int = 10
    batch_size: int = 32
    learning_rate: float = 0.001
    optimizer: str = 'adam'
    scheduler: str = 'cosine'
    mixed_precision: bool = True
    gradient_accumulation: int = 1
    gradient_clipping: float = 1.0
    weight_decay: float = 0.01
    warmup_steps: int = 100
    save_every: int = 5
    eval_every: int = 1
    early_stopping_patience: int = 5
    max_gpu_memory_mb: int = 5500
    num_workers: int = 4
    seed: int = 42
    output_dir: str = './data/checkpoints'
    export_format: str = 'onnx'

    @classmethod
    def from_dict(cls, d: dict) -> 'TrainingConfig':
        valid = {k: v for k, v in d.items() if k in cls.__dataclass_fields__}
        return cls(**valid)


# ========== MODEL ARCHITECTURES ==========

class SimpleCNN(nn.Module):
    """Lightweight CNN for image classification"""
    def __init__(self, num_classes: int = 10, in_channels: int = 3):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(in_channels, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(128, 256, 3, padding=1), nn.BatchNorm2d(256), nn.ReLU(), nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.classifier(self.features(x))


class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.BatchNorm2d(channels),
            nn.ReLU(),
            nn.Conv2d(channels, channels, 3, padding=1),
            nn.BatchNorm2d(channels),
        )
        self.relu = nn.ReLU()

    def forward(self, x):
        return self.relu(self.block(x) + x)


class AltoResNet(nn.Module):
    """Custom ResNet for Engine Alto"""
    def __init__(self, num_classes: int = 10, in_channels: int = 3):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(in_channels, 64, 7, stride=2, padding=3), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(3, stride=2, padding=1)
        )
        self.layer1 = nn.Sequential(ResidualBlock(64), ResidualBlock(64))
        self.layer2 = self._make_downsample(64, 128)
        self.layer3 = self._make_downsample(128, 256)
        self.head = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(256, num_classes))

    def _make_downsample(self, in_c, out_c):
        return nn.Sequential(
            nn.Conv2d(in_c, out_c, 3, stride=2, padding=1), nn.BatchNorm2d(out_c), nn.ReLU(),
            ResidualBlock(out_c), ResidualBlock(out_c)
        )

    def forward(self, x):
        x = self.stem(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        return self.head(x)


class AltoTransformer(nn.Module):
    """Simple Transformer for text tasks"""
    def __init__(self, vocab_size: int = 30000, d_model: int = 256, nhead: int = 8,
                 num_layers: int = 4, num_classes: int = 10, max_len: int = 512):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = nn.Embedding(max_len, d_model)
        encoder_layer = nn.TransformerEncoderLayer(d_model, nhead, d_model * 4, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers)
        self.classifier = nn.Linear(d_model, num_classes)

    def forward(self, x):
        seq_len = x.size(1)
        pos = torch.arange(seq_len, device=x.device).unsqueeze(0)
        x = self.embedding(x) + self.pos_encoding(pos)
        x = self.transformer(x)
        x = x.mean(dim=1)
        return self.classifier(x)


class AltoUNet(nn.Module):
    """U-Net for image segmentation"""
    def __init__(self, in_channels: int = 3, out_channels: int = 1):
        super().__init__()
        self.enc1 = self._block(in_channels, 64)
        self.enc2 = self._block(64, 128)
        self.enc3 = self._block(128, 256)
        self.bottleneck = self._block(256, 512)
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = self._block(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = self._block(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = self._block(128, 64)
        self.final = nn.Conv2d(64, out_channels, 1)
        self.pool = nn.MaxPool2d(2)

    def _block(self, in_c, out_c):
        return nn.Sequential(
            nn.Conv2d(in_c, out_c, 3, padding=1), nn.BatchNorm2d(out_c), nn.ReLU(),
            nn.Conv2d(out_c, out_c, 3, padding=1), nn.BatchNorm2d(out_c), nn.ReLU()
        )

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        b = self.bottleneck(self.pool(e3))
        d3 = self.dec3(torch.cat([self.up3(b), e3], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))
        return self.final(d1)


class AltoGAN(nn.Module):
    """GAN for image generation"""
    def __init__(self, latent_dim: int = 100, img_channels: int = 3, img_size: int = 64):
        super().__init__()
        self.latent_dim = latent_dim

        self.generator = nn.Sequential(
            nn.Linear(latent_dim, 256 * (img_size // 8) * (img_size // 8)),
            nn.Unflatten(1, (256, img_size // 8, img_size // 8)),
            nn.ConvTranspose2d(256, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.ConvTranspose2d(128, 64, 4, 2, 1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.ConvTranspose2d(64, img_channels, 4, 2, 1), nn.Tanh()
        )
        self.discriminator = nn.Sequential(
            nn.Conv2d(img_channels, 64, 4, 2, 1), nn.LeakyReLU(0.2),
            nn.Conv2d(64, 128, 4, 2, 1), nn.BatchNorm2d(128), nn.LeakyReLU(0.2),
            nn.Conv2d(128, 256, 4, 2, 1), nn.BatchNorm2d(256), nn.LeakyReLU(0.2),
            nn.Flatten(),
            nn.Linear(256 * (img_size // 8) * (img_size // 8), 1), nn.Sigmoid()
        )

    def forward(self, z):
        return self.generator(z)


# ========== MODEL FACTORY ==========

ARCHITECTURES = {
    'cnn': SimpleCNN,
    'resnet': AltoResNet,
    'transformer': AltoTransformer,
    'unet': AltoUNet,
    'gan': AltoGAN,
}

def create_model(architecture: str, **kwargs) -> nn.Module:
    if architecture not in ARCHITECTURES:
        raise ValueError(f"Unknown architecture: {architecture}. Available: {list(ARCHITECTURES.keys())}")
    return ARCHITECTURES[architecture](**kwargs)


# ========== SYNTHETIC DATASET (for demo) ==========

class SyntheticImageDataset(Dataset):
    def __init__(self, num_samples: int = 1000, num_classes: int = 10, img_size: int = 32):
        self.data = torch.randn(num_samples, 3, img_size, img_size)
        self.labels = torch.randint(0, num_classes, (num_samples,))

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]


# ========== TRAINER ==========

class AltoTrainer:
    """GPU-optimized trainer for Engine Alto models"""

    def __init__(self, config: TrainingConfig):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.scaler = GradScaler() if config.mixed_precision and self.device.type == 'cuda' else None
        self.best_val_loss = float('inf')
        self.patience_counter = 0
        self.history: List[Dict] = []

        # Set seed
        torch.manual_seed(config.seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(config.seed)

        # Create output dir
        Path(config.output_dir).mkdir(parents=True, exist_ok=True)

        logger.info(f"🚀 Alto Trainer initialized")
        logger.info(f"   Device: {self.device}")
        if torch.cuda.is_available():
            logger.info(f"   GPU: {torch.cuda.get_device_name(0)}")
            logger.info(f"   VRAM: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")
        logger.info(f"   Mixed Precision: {config.mixed_precision}")

    def train(self, model: nn.Module, train_loader: DataLoader, val_loader: Optional[DataLoader] = None):
        model = model.to(self.device)
        criterion = nn.CrossEntropyLoss()

        # Optimizer
        if self.config.optimizer == 'adam':
            optimizer = optim.AdamW(model.parameters(), lr=self.config.learning_rate, weight_decay=self.config.weight_decay)
        elif self.config.optimizer == 'sgd':
            optimizer = optim.SGD(model.parameters(), lr=self.config.learning_rate, momentum=0.9, weight_decay=self.config.weight_decay)
        else:
            optimizer = optim.Adam(model.parameters(), lr=self.config.learning_rate)

        # Scheduler
        if self.config.scheduler == 'cosine':
            scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=self.config.epochs)
        elif self.config.scheduler == 'step':
            scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=self.config.epochs // 3, gamma=0.1)
        else:
            scheduler = None

        logger.info(f"📊 Model parameters: {sum(p.numel() for p in model.parameters()):,}")
        logger.info(f"🏋️ Starting training for {self.config.epochs} epochs...")

        for epoch in range(1, self.config.epochs + 1):
            # Train
            model.train()
            train_loss, train_correct, train_total = 0.0, 0, 0

            for batch_idx, (data, target) in enumerate(train_loader):
                data, target = data.to(self.device), target.to(self.device)

                if self.scaler:
                    with autocast():
                        output = model(data)
                        loss = criterion(output, target)
                    self.scaler.scale(loss).backward()
                    if (batch_idx + 1) % self.config.gradient_accumulation == 0:
                        self.scaler.unscale_(optimizer)
                        nn.utils.clip_grad_norm_(model.parameters(), self.config.gradient_clipping)
                        self.scaler.step(optimizer)
                        self.scaler.update()
                        optimizer.zero_grad()
                else:
                    output = model(data)
                    loss = criterion(output, target)
                    loss.backward()
                    if (batch_idx + 1) % self.config.gradient_accumulation == 0:
                        nn.utils.clip_grad_norm_(model.parameters(), self.config.gradient_clipping)
                        optimizer.step()
                        optimizer.zero_grad()

                train_loss += loss.item() * data.size(0)
                _, predicted = output.max(1)
                train_total += target.size(0)
                train_correct += predicted.eq(target).sum().item()

            train_loss /= train_total
            train_acc = train_correct / train_total

            # Validate
            val_loss, val_acc = 0.0, 0.0
            if val_loader and epoch % self.config.eval_every == 0:
                val_loss, val_acc = self._evaluate(model, val_loader, criterion)

            if scheduler:
                scheduler.step()

            # Log
            lr = optimizer.param_groups[0]['lr']
            gpu_mem = torch.cuda.memory_allocated() / 1e6 if torch.cuda.is_available() else 0
            record = {
                'epoch': epoch, 'train_loss': round(train_loss, 4), 'train_acc': round(train_acc, 4),
                'val_loss': round(val_loss, 4), 'val_acc': round(val_acc, 4),
                'lr': lr, 'gpu_memory_mb': round(gpu_mem, 1)
            }
            self.history.append(record)

            logger.info(
                f"  Epoch {epoch}/{self.config.epochs} | "
                f"loss: {train_loss:.4f} | acc: {train_acc:.4f} | "
                f"val_loss: {val_loss:.4f} | val_acc: {val_acc:.4f} | "
                f"lr: {lr:.6f} | GPU: {gpu_mem:.0f}MB"
            )

            # Save checkpoint
            if epoch % self.config.save_every == 0:
                self._save_checkpoint(model, optimizer, epoch)

            # Early stopping
            if val_loader and val_loss < self.best_val_loss:
                self.best_val_loss = val_loss
                self.patience_counter = 0
                self._save_checkpoint(model, optimizer, epoch, best=True)
            elif val_loader:
                self.patience_counter += 1
                if self.patience_counter >= self.config.early_stopping_patience:
                    logger.info(f"⏹️ Early stopping at epoch {epoch}")
                    break

        # Final save
        self._save_checkpoint(model, optimizer, epoch, final=True)
        self._save_history()

        logger.info(f"✅ Training complete! Best val_loss: {self.best_val_loss:.4f}")
        return self.history

    def _evaluate(self, model, loader, criterion):
        model.eval()
        loss, correct, total = 0.0, 0, 0
        with torch.no_grad():
            for data, target in loader:
                data, target = data.to(self.device), target.to(self.device)
                output = model(data)
                loss += criterion(output, target).item() * data.size(0)
                _, predicted = output.max(1)
                total += target.size(0)
                correct += predicted.eq(target).sum().item()
        return loss / total, correct / total

    def _save_checkpoint(self, model, optimizer, epoch, best=False, final=False):
        tag = 'best' if best else ('final' if final else f'epoch_{epoch}')
        path = os.path.join(self.config.output_dir, f'{self.config.model_name}_{tag}.pt')
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'config': asdict(self.config),
            'history': self.history
        }, path)
        logger.info(f"💾 Checkpoint saved: {path}")

    def _save_history(self):
        path = os.path.join(self.config.output_dir, f'{self.config.model_name}_history.json')
        with open(path, 'w') as f:
            json.dump(self.history, f, indent=2)

    def export_onnx(self, model: nn.Module, input_shape=(1, 3, 32, 32)):
        model.eval()
        model = model.to(self.device)
        dummy = torch.randn(*input_shape).to(self.device)
        path = os.path.join(self.config.output_dir, f'{self.config.model_name}.onnx')
        torch.onnx.export(model, dummy, path, opset_version=17, input_names=['input'], output_names=['output'])
        logger.info(f"📦 ONNX model exported: {path}")
        return path


# ========== CLI ENTRY POINT ==========

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Engine Alto Model Trainer')
    parser.add_argument('--model-name', default='alto-demo', help='Model name')
    parser.add_argument('--architecture', default='cnn', choices=list(ARCHITECTURES.keys()))
    parser.add_argument('--epochs', type=int, default=10)
    parser.add_argument('--batch-size', type=int, default=32)
    parser.add_argument('--lr', type=float, default=0.001)
    parser.add_argument('--mixed-precision', action='store_true', default=True)
    parser.add_argument('--num-samples', type=int, default=5000, help='Synthetic dataset size')
    parser.add_argument('--export', action='store_true', help='Export to ONNX after training')
    args = parser.parse_args()

    config = TrainingConfig(
        model_name=args.model_name,
        architecture=args.architecture,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        mixed_precision=args.mixed_precision
    )

    # Create model
    if args.architecture in ('transformer',):
        model = create_model(args.architecture, vocab_size=1000, num_classes=10)
    else:
        model = create_model(args.architecture, num_classes=10)

    # Create synthetic dataset
    dataset = SyntheticImageDataset(num_samples=args.num_samples, num_classes=10)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=config.batch_size, shuffle=False, num_workers=0)

    # Train
    trainer = AltoTrainer(config)
    history = trainer.train(model, train_loader, val_loader)

    # Export
    if args.export:
        trainer.export_onnx(model)

    print(f"\n🎉 Training complete! History saved to {config.output_dir}")
    print(f"   Final accuracy: {history[-1]['train_acc']:.4f}")


if __name__ == '__main__':
    main()
