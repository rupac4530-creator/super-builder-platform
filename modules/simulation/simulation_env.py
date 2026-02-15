"""
Engine Alto — Simulation Environment & Digital Twin (Phases 23-24)
Virtual environment for testing agent behavior before production deployment.
"""

from __future__ import annotations
import copy
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class SimulationState(Enum):
    CREATED = "created"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class SimulationEvent:
    tick: int
    event_type: str
    data: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)


@dataclass
class SimulationConfig:
    name: str = "default"
    max_ticks: int = 1000
    tick_rate_hz: float = 60.0
    seed: int = 42
    parameters: Dict[str, Any] = field(default_factory=dict)


class SimulationEnvironment:
    """Virtual sandbox environment for testing agent behavior."""

    def __init__(self, config: Optional[SimulationConfig] = None):
        self.id = f"sim-{uuid.uuid4().hex[:8]}"
        self.config = config or SimulationConfig()
        self.state = SimulationState.CREATED
        self.tick = 0
        self._world_state: Dict[str, Any] = {}
        self._event_log: List[SimulationEvent] = []
        self._tick_handlers: List[Callable] = []
        self._entity_states: Dict[str, Dict[str, Any]] = {}
        self._checkpoints: Dict[int, Dict[str, Any]] = {}
        self._metrics: Dict[str, List[float]] = {}

    def register_tick_handler(self, handler: Callable) -> None:
        self._tick_handlers.append(handler)

    def spawn_entity(self, entity_id: str, initial_state: Dict[str, Any]) -> None:
        self._entity_states[entity_id] = initial_state
        self._emit_event("entity_spawned", {"entity_id": entity_id})

    def get_entity_state(self, entity_id: str) -> Optional[Dict[str, Any]]:
        return self._entity_states.get(entity_id)

    def update_entity(self, entity_id: str, updates: Dict[str, Any]) -> None:
        if entity_id in self._entity_states:
            self._entity_states[entity_id].update(updates)

    def set_world(self, key: str, value: Any) -> None:
        self._world_state[key] = value

    def get_world(self, key: str, default: Any = None) -> Any:
        return self._world_state.get(key, default)

    def step(self) -> bool:
        """Advance simulation by one tick."""
        if self.state != SimulationState.RUNNING:
            return False
        if self.tick >= self.config.max_ticks:
            self.state = SimulationState.COMPLETED
            return False

        self.tick += 1
        for handler in self._tick_handlers:
            try:
                handler(self)
            except Exception as e:
                self._emit_event("handler_error", {"error": str(e)})

        return True

    def run(self, ticks: Optional[int] = None) -> int:
        """Run simulation for N ticks (or to completion)."""
        self.state = SimulationState.RUNNING
        max_ticks = ticks or self.config.max_ticks
        executed = 0
        while executed < max_ticks and self.step():
            executed += 1
        if self.tick >= self.config.max_ticks:
            self.state = SimulationState.COMPLETED
        return executed

    def pause(self) -> None:
        self.state = SimulationState.PAUSED

    def checkpoint(self) -> int:
        self._checkpoints[self.tick] = {
            "world_state": copy.deepcopy(self._world_state),
            "entity_states": copy.deepcopy(self._entity_states),
        }
        return self.tick

    def restore(self, checkpoint_tick: int) -> bool:
        cp = self._checkpoints.get(checkpoint_tick)
        if not cp:
            return False
        self._world_state = copy.deepcopy(cp["world_state"])
        self._entity_states = copy.deepcopy(cp["entity_states"])
        self.tick = checkpoint_tick
        return True

    def record_metric(self, name: str, value: float) -> None:
        if name not in self._metrics:
            self._metrics[name] = []
        self._metrics[name].append(value)

    def _emit_event(self, event_type: str, data: Dict[str, Any]) -> None:
        self._event_log.append(SimulationEvent(tick=self.tick, event_type=event_type, data=data))

    def stats(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "state": self.state.value,
            "tick": self.tick,
            "max_ticks": self.config.max_ticks,
            "entities": len(self._entity_states),
            "events": len(self._event_log),
            "checkpoints": len(self._checkpoints),
        }


class DigitalTwin:
    """Creates and manages digital twins of production systems for testing."""

    def __init__(self):
        self._twins: Dict[str, SimulationEnvironment] = {}

    def create_twin(self, source_name: str, config: Optional[SimulationConfig] = None) -> SimulationEnvironment:
        cfg = config or SimulationConfig(name=f"twin-{source_name}")
        sim = SimulationEnvironment(config=cfg)
        self._twins[source_name] = sim
        return sim

    def get_twin(self, source_name: str) -> Optional[SimulationEnvironment]:
        return self._twins.get(source_name)

    def run_experiment(self, source_name: str, ticks: int = 100) -> Dict[str, Any]:
        twin = self._twins.get(source_name)
        if not twin:
            return {"error": "Twin not found"}
        executed = twin.run(ticks)
        return {"source": source_name, "ticks_executed": executed, "stats": twin.stats()}

    def stats(self) -> Dict[str, Any]:
        return {
            "twins": {name: sim.stats() for name, sim in self._twins.items()},
            "total": len(self._twins),
        }
