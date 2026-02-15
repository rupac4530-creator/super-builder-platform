"""
GPU Abstraction Layer — hardware-agnostic compute interface.
Supports CUDA, Vulkan, Metal, and CPU fallback.
"""

from __future__ import annotations
import os
import platform
import subprocess
import dataclasses
from enum import Enum
from typing import Optional


class GPUBackend(Enum):
    CUDA = "cuda"
    VULKAN = "vulkan"
    METAL = "metal"
    CPU = "cpu"


@dataclasses.dataclass
class GPUDevice:
    name: str
    backend: GPUBackend
    vram_mb: int
    compute_capability: Optional[str] = None
    driver_version: Optional[str] = None
    is_available: bool = True

    @property
    def is_discrete(self) -> bool:
        return self.backend != GPUBackend.CPU

    def supports_fp16(self) -> bool:
        if self.backend == GPUBackend.CUDA and self.compute_capability:
            major = int(self.compute_capability.split(".")[0])
            return major >= 7
        return self.backend in (GPUBackend.VULKAN, GPUBackend.METAL)

    def supports_raytracing(self) -> bool:
        if self.backend == GPUBackend.CUDA and self.compute_capability:
            major = int(self.compute_capability.split(".")[0])
            return major >= 7  # RTX 20xx+
        return False


def _detect_nvidia() -> Optional[GPUDevice]:
    """Detect NVIDIA GPU via nvidia-smi."""
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,memory.total,driver_version",
             "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            parts = result.stdout.strip().split(",")
            name = parts[0].strip()
            vram = int(float(parts[1].strip())) if len(parts) > 1 else 0
            driver = parts[2].strip() if len(parts) > 2 else None
            # Determine compute capability from name heuristics
            cc = "8.9"  # Default modern
            if "4050" in name or "4060" in name:
                cc = "8.9"
            elif "3060" in name or "3070" in name or "3080" in name or "3090" in name:
                cc = "8.6"
            elif "2060" in name or "2070" in name or "2080" in name:
                cc = "7.5"
            return GPUDevice(
                name=name, backend=GPUBackend.CUDA, vram_mb=vram,
                compute_capability=cc, driver_version=driver
            )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return None


def _detect_metal() -> Optional[GPUDevice]:
    """Detect Apple Metal GPU (macOS only)."""
    if platform.system() != "Darwin":
        return None
    try:
        result = subprocess.run(
            ["system_profiler", "SPDisplaysDataType"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            for line in result.stdout.splitlines():
                if "Chipset Model" in line:
                    name = line.split(":")[1].strip()
                    return GPUDevice(
                        name=name, backend=GPUBackend.METAL,
                        vram_mb=8192  # Unified memory estimate
                    )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return None


def _cpu_fallback() -> GPUDevice:
    """CPU fallback when no GPU is detected."""
    return GPUDevice(
        name=f"CPU ({platform.processor() or platform.machine()})",
        backend=GPUBackend.CPU, vram_mb=0, is_available=True
    )


def detect_gpu() -> GPUDevice:
    """Auto-detect the best available GPU, falling back to CPU."""
    # Try NVIDIA first (most common for compute)
    nvidia = _detect_nvidia()
    if nvidia:
        return nvidia

    # Try Apple Metal
    metal = _detect_metal()
    if metal:
        return metal

    # CPU fallback
    return _cpu_fallback()


class GPUContext:
    """Manages GPU compute context lifecycle."""

    def __init__(self, device: Optional[GPUDevice] = None):
        self.device = device or detect_gpu()
        self._initialized = False

    def initialize(self) -> None:
        self._initialized = True

    def submit_compute(self, kernel_name: str, data: bytes, workgroups: tuple = (1, 1, 1)) -> bytes:
        """Submit a compute workload. Returns result buffer."""
        if not self._initialized:
            raise RuntimeError("GPU context not initialized")
        # Stub — real implementation uses Vulkan/CUDA compute shaders
        return data

    def allocate_buffer(self, size_bytes: int) -> int:
        """Allocate GPU buffer. Returns handle."""
        if not self._initialized:
            raise RuntimeError("GPU context not initialized")
        return id(size_bytes)  # Stub handle

    def release(self) -> None:
        self._initialized = False

    def __enter__(self):
        self.initialize()
        return self

    def __exit__(self, *args):
        self.release()
