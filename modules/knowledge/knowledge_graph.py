"""
Engine Alto — Knowledge Graph & Reasoning (Phases 21-22)
Semantic knowledge graph with entity-relation storage, querying, and inference.
"""

from __future__ import annotations
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class Entity:
    id: str = field(default_factory=lambda: f"ent-{uuid.uuid4().hex[:8]}")
    name: str = ""
    entity_type: str = "concept"
    properties: Dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)


@dataclass
class Relation:
    id: str = field(default_factory=lambda: f"rel-{uuid.uuid4().hex[:8]}")
    source_id: str = ""
    target_id: str = ""
    relation_type: str = ""
    weight: float = 1.0
    properties: Dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)


class KnowledgeGraph:
    """Semantic knowledge graph with entity-relation storage and traversal."""

    def __init__(self):
        self._entities: Dict[str, Entity] = {}
        self._relations: List[Relation] = []
        self._adjacency: Dict[str, List[Relation]] = defaultdict(list)
        self._reverse_adjacency: Dict[str, List[Relation]] = defaultdict(list)
        self._by_type: Dict[str, List[str]] = defaultdict(list)

    def add_entity(self, name: str, entity_type: str = "concept",
                   **properties) -> Entity:
        entity = Entity(name=name, entity_type=entity_type, properties=properties)
        self._entities[entity.id] = entity
        self._by_type[entity_type].append(entity.id)
        return entity

    def add_relation(self, source_id: str, target_id: str,
                     relation_type: str, weight: float = 1.0,
                     **properties) -> Optional[Relation]:
        if source_id not in self._entities or target_id not in self._entities:
            return None
        rel = Relation(source_id=source_id, target_id=target_id,
                       relation_type=relation_type, weight=weight,
                       properties=properties)
        self._relations.append(rel)
        self._adjacency[source_id].append(rel)
        self._reverse_adjacency[target_id].append(rel)
        return rel

    def get_entity(self, entity_id: str) -> Optional[Entity]:
        return self._entities.get(entity_id)

    def find_by_name(self, name: str) -> List[Entity]:
        return [e for e in self._entities.values() if name.lower() in e.name.lower()]

    def find_by_type(self, entity_type: str) -> List[Entity]:
        return [self._entities[eid] for eid in self._by_type.get(entity_type, [])
                if eid in self._entities]

    def outgoing(self, entity_id: str, relation_type: Optional[str] = None) -> List[Relation]:
        rels = self._adjacency.get(entity_id, [])
        if relation_type:
            rels = [r for r in rels if r.relation_type == relation_type]
        return rels

    def incoming(self, entity_id: str, relation_type: Optional[str] = None) -> List[Relation]:
        rels = self._reverse_adjacency.get(entity_id, [])
        if relation_type:
            rels = [r for r in rels if r.relation_type == relation_type]
        return rels

    def neighbors(self, entity_id: str, depth: int = 1) -> Set[str]:
        visited: Set[str] = {entity_id}
        frontier = {entity_id}
        for _ in range(depth):
            next_frontier: Set[str] = set()
            for eid in frontier:
                for rel in self._adjacency.get(eid, []):
                    if rel.target_id not in visited:
                        visited.add(rel.target_id)
                        next_frontier.add(rel.target_id)
                for rel in self._reverse_adjacency.get(eid, []):
                    if rel.source_id not in visited:
                        visited.add(rel.source_id)
                        next_frontier.add(rel.source_id)
            frontier = next_frontier
        visited.discard(entity_id)
        return visited

    def shortest_path(self, start_id: str, end_id: str) -> Optional[List[str]]:
        """BFS shortest path between two entities."""
        if start_id not in self._entities or end_id not in self._entities:
            return None
        if start_id == end_id:
            return [start_id]
        visited = {start_id}
        queue = [(start_id, [start_id])]
        while queue:
            current, path = queue.pop(0)
            for rel in self._adjacency.get(current, []):
                if rel.target_id == end_id:
                    return path + [end_id]
                if rel.target_id not in visited:
                    visited.add(rel.target_id)
                    queue.append((rel.target_id, path + [rel.target_id]))
        return None

    def infer(self, entity_id: str, relation_chain: List[str]) -> List[Entity]:
        """Follow a chain of relations to infer connected entities."""
        current_ids = {entity_id}
        for rel_type in relation_chain:
            next_ids: Set[str] = set()
            for eid in current_ids:
                for rel in self.outgoing(eid, rel_type):
                    next_ids.add(rel.target_id)
            current_ids = next_ids
        return [self._entities[eid] for eid in current_ids if eid in self._entities]

    def stats(self) -> Dict[str, Any]:
        return {
            "entities": len(self._entities),
            "relations": len(self._relations),
            "entity_types": {t: len(ids) for t, ids in self._by_type.items()},
        }
