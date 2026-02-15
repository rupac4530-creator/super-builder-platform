"""
Engine Alto — Global Memory Fabric (Phase 6)
Shared knowledge graph + vector memory for agent collaboration.
Provides episodic, semantic, and procedural memory layers.
"""

from __future__ import annotations
import hashlib
import math
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


class MemoryType(Enum):
    EPISODIC = "episodic"       # Event history
    SEMANTIC = "semantic"       # Facts & knowledge
    PROCEDURAL = "procedural"   # How-to / skills
    SHORT_TERM = "short_term"   # Working memory (TTL)


@dataclass
class MemoryEntry:
    id: str = field(default_factory=lambda: f"mem-{uuid.uuid4().hex[:12]}")
    content: str = ""
    memory_type: MemoryType = MemoryType.SEMANTIC
    embedding: Optional[List[float]] = None
    tags: List[str] = field(default_factory=list)
    source_agent: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    accessed_at: float = field(default_factory=time.time)
    access_count: int = 0
    ttl_seconds: Optional[float] = None  # None = permanent
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_expired(self) -> bool:
        if self.ttl_seconds is None:
            return False
        return (time.time() - self.created_at) > self.ttl_seconds

    def touch(self) -> None:
        self.accessed_at = time.time()
        self.access_count += 1


def _simple_embedding(text: str, dim: int = 64) -> List[float]:
    """Generate a deterministic pseudo-embedding from text (for demo/testing)."""
    h = hashlib.sha256(text.encode()).hexdigest()
    values = []
    for i in range(0, min(len(h), dim * 2), 2):
        values.append((int(h[i:i+2], 16) - 128) / 128.0)
    while len(values) < dim:
        values.append(0.0)
    # Normalize
    norm = math.sqrt(sum(v * v for v in values)) or 1.0
    return [v / norm for v in values[:dim]]


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a)) or 1.0
    norm_b = math.sqrt(sum(x * x for x in b)) or 1.0
    return dot / (norm_a * norm_b)


class MemoryFabric:
    """Global shared memory with vector similarity search."""

    def __init__(self, embedding_dim: int = 64):
        self._memories: Dict[str, MemoryEntry] = {}
        self._embedding_dim = embedding_dim

    def store(
        self, content: str, memory_type: MemoryType = MemoryType.SEMANTIC,
        tags: Optional[List[str]] = None, source_agent: Optional[str] = None,
        ttl_seconds: Optional[float] = None, metadata: Optional[Dict] = None
    ) -> MemoryEntry:
        entry = MemoryEntry(
            content=content, memory_type=memory_type,
            tags=tags or [], source_agent=source_agent,
            ttl_seconds=ttl_seconds, metadata=metadata or {},
            embedding=_simple_embedding(content, self._embedding_dim),
        )
        self._memories[entry.id] = entry
        return entry

    def recall(self, query: str, top_k: int = 5,
               memory_type: Optional[MemoryType] = None,
               tag: Optional[str] = None) -> List[Tuple[MemoryEntry, float]]:
        """Semantic recall — find memories similar to query."""
        self._gc()
        query_emb = _simple_embedding(query, self._embedding_dim)
        candidates = list(self._memories.values())
        if memory_type:
            candidates = [m for m in candidates if m.memory_type == memory_type]
        if tag:
            candidates = [m for m in candidates if tag in m.tags]

        scored = []
        for mem in candidates:
            if mem.embedding:
                sim = _cosine_similarity(query_emb, mem.embedding)
                scored.append((mem, sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        for mem, _ in scored[:top_k]:
            mem.touch()
        return scored[:top_k]

    def get(self, memory_id: str) -> Optional[MemoryEntry]:
        mem = self._memories.get(memory_id)
        if mem and not mem.is_expired:
            mem.touch()
            return mem
        return None

    def forget(self, memory_id: str) -> bool:
        return self._memories.pop(memory_id, None) is not None

    def forget_by_tag(self, tag: str) -> int:
        to_remove = [m.id for m in self._memories.values() if tag in m.tags]
        for mid in to_remove:
            del self._memories[mid]
        return len(to_remove)

    def _gc(self) -> int:
        """Garbage-collect expired short-term memories."""
        expired = [m.id for m in self._memories.values() if m.is_expired]
        for mid in expired:
            del self._memories[mid]
        return len(expired)

    @property
    def size(self) -> int:
        return len(self._memories)

    def stats(self) -> Dict[str, Any]:
        by_type = {}
        for m in self._memories.values():
            by_type[m.memory_type.value] = by_type.get(m.memory_type.value, 0) + 1
        return {
            "total_memories": self.size,
            "by_type": by_type,
            "embedding_dim": self._embedding_dim,
        }
