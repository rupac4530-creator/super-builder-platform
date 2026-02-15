"""
Shader Pipeline — compile, cache, and hot-reload shaders.
Supports GLSL, HLSL, WGSL, and compute shaders.
"""

from __future__ import annotations
import hashlib
import time
from enum import Enum
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Callable


class ShaderStage(Enum):
    VERTEX = "vertex"
    FRAGMENT = "fragment"
    COMPUTE = "compute"
    GEOMETRY = "geometry"
    TESSELLATION = "tessellation"


class ShaderLanguage(Enum):
    GLSL = "glsl"
    HLSL = "hlsl"
    WGSL = "wgsl"
    SPIRV = "spirv"


@dataclass
class CompiledShader:
    name: str
    stage: ShaderStage
    language: ShaderLanguage
    source_hash: str
    bytecode: bytes
    compiled_at: float = field(default_factory=time.time)
    uniforms: List[str] = field(default_factory=list)

    @property
    def age_seconds(self) -> float:
        return time.time() - self.compiled_at


class ShaderPipeline:
    """Manages shader compilation, caching, and hot-reload."""

    def __init__(self):
        self._cache: Dict[str, CompiledShader] = {}
        self._watchers: List[Callable] = []

    def compile(
        self, name: str, source: str, stage: ShaderStage,
        language: ShaderLanguage = ShaderLanguage.GLSL,
        uniforms: Optional[List[str]] = None
    ) -> CompiledShader:
        """Compile shader source to bytecode (stub — uses hash as mock SPIR-V)."""
        source_hash = hashlib.sha256(source.encode()).hexdigest()[:16]

        # Check cache
        if name in self._cache and self._cache[name].source_hash == source_hash:
            return self._cache[name]

        # Mock compilation (real impl: glslc / dxc / naga)
        bytecode = hashlib.sha256(source.encode()).digest()

        shader = CompiledShader(
            name=name, stage=stage, language=language,
            source_hash=source_hash, bytecode=bytecode,
            uniforms=uniforms or []
        )
        self._cache[name] = shader

        # Notify watchers (for hot-reload)
        for watcher in self._watchers:
            watcher(shader)

        return shader

    def get(self, name: str) -> Optional[CompiledShader]:
        return self._cache.get(name)

    def invalidate(self, name: str) -> bool:
        if name in self._cache:
            del self._cache[name]
            return True
        return False

    def invalidate_all(self) -> int:
        count = len(self._cache)
        self._cache.clear()
        return count

    def on_recompile(self, callback: Callable) -> None:
        self._watchers.append(callback)

    @property
    def cached_count(self) -> int:
        return len(self._cache)

    def stats(self) -> dict:
        return {
            "cached": self.cached_count,
            "shaders": {
                name: {
                    "stage": s.stage.value,
                    "language": s.language.value,
                    "age_s": round(s.age_seconds, 1),
                    "uniforms": s.uniforms,
                }
                for name, s in self._cache.items()
            },
        }
