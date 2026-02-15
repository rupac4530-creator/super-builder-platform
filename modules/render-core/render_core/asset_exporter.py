"""
Asset Exporter — export 3D assets, textures, and scenes.
Supports glTF/GLB, OBJ, FBX (via adapters), and image formats.
"""

from __future__ import annotations
import json
import struct
import time
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


class ExportFormat(Enum):
    GLTF = "gltf"
    GLB = "glb"
    OBJ = "obj"
    FBX = "fbx"
    PNG = "png"
    EXR = "exr"


@dataclass
class Vertex:
    position: tuple  # (x, y, z)
    normal: tuple = (0.0, 1.0, 0.0)
    uv: tuple = (0.0, 0.0)


@dataclass
class Mesh:
    name: str
    vertices: List[Vertex] = field(default_factory=list)
    indices: List[int] = field(default_factory=list)
    material: Optional[str] = None


@dataclass
class Scene:
    name: str
    meshes: List[Mesh] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


class AssetExporter:
    """Export 3D scenes and assets to various formats."""

    def __init__(self):
        self._exporters = {
            ExportFormat.GLTF: self._export_gltf,
            ExportFormat.GLB: self._export_glb,
            ExportFormat.OBJ: self._export_obj,
        }

    def export(self, scene: Scene, fmt: ExportFormat) -> bytes:
        exporter = self._exporters.get(fmt)
        if not exporter:
            raise ValueError(f"Unsupported export format: {fmt.value}")
        return exporter(scene)

    def export_to_file(self, scene: Scene, fmt: ExportFormat, path: str) -> str:
        data = self.export(scene, fmt)
        with open(path, "wb") as f:
            f.write(data)
        return path

    def _export_gltf(self, scene: Scene) -> bytes:
        """Export as glTF 2.0 JSON."""
        gltf = {
            "asset": {"version": "2.0", "generator": "EngineAlto-RenderCore"},
            "scene": 0,
            "scenes": [{"name": scene.name, "nodes": list(range(len(scene.meshes)))}],
            "nodes": [],
            "meshes": [],
        }
        for i, mesh in enumerate(scene.meshes):
            gltf["nodes"].append({"name": mesh.name, "mesh": i})
            gltf["meshes"].append({
                "name": mesh.name,
                "primitives": [{
                    "attributes": {"POSITION": 0},
                    "material": 0 if mesh.material else None,
                }],
            })
        return json.dumps(gltf, indent=2).encode("utf-8")

    def _export_glb(self, scene: Scene) -> bytes:
        """Export as binary GLB (glTF + embedded buffers)."""
        json_data = self._export_gltf(scene)
        # Pad JSON to 4-byte boundary
        json_padded = json_data + b" " * ((4 - len(json_data) % 4) % 4)

        # GLB header: magic + version + length
        header = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(json_padded))
        # JSON chunk
        json_chunk = struct.pack("<II", len(json_padded), 0x4E4F534A) + json_padded
        return header + json_chunk

    def _export_obj(self, scene: Scene) -> bytes:
        """Export as Wavefront OBJ."""
        lines = [f"# Engine Alto Render Core", f"# Scene: {scene.name}", ""]
        vertex_offset = 0
        for mesh in scene.meshes:
            lines.append(f"o {mesh.name}")
            for v in mesh.vertices:
                lines.append(f"v {v.position[0]} {v.position[1]} {v.position[2]}")
            for v in mesh.vertices:
                lines.append(f"vn {v.normal[0]} {v.normal[1]} {v.normal[2]}")
            # Faces (triangles)
            for i in range(0, len(mesh.indices), 3):
                if i + 2 < len(mesh.indices):
                    a = mesh.indices[i] + vertex_offset + 1
                    b = mesh.indices[i + 1] + vertex_offset + 1
                    c = mesh.indices[i + 2] + vertex_offset + 1
                    lines.append(f"f {a}//{a} {b}//{b} {c}//{c}")
            vertex_offset += len(mesh.vertices)
            lines.append("")
        return "\n".join(lines).encode("utf-8")

    @staticmethod
    def create_cube(name: str = "Cube", size: float = 1.0) -> Mesh:
        """Helper: create a unit cube mesh."""
        s = size / 2
        vertices = [
            Vertex((-s, -s, -s)), Vertex((s, -s, -s)),
            Vertex((s, s, -s)), Vertex((-s, s, -s)),
            Vertex((-s, -s, s)), Vertex((s, -s, s)),
            Vertex((s, s, s)), Vertex((-s, s, s)),
        ]
        indices = [
            0, 1, 2, 2, 3, 0,  # front
            1, 5, 6, 6, 2, 1,  # right
            5, 4, 7, 7, 6, 5,  # back
            4, 0, 3, 3, 7, 4,  # left
            3, 2, 6, 6, 7, 3,  # top
            4, 5, 1, 1, 0, 4,  # bottom
        ]
        return Mesh(name=name, vertices=vertices, indices=indices)
