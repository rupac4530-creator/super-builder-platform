"""
Engine Alto — Agent Framework, Workbook & Load Balancer (Phase 5)
Multi-agent orchestration with task routing, load balancing, and workbooks.
"""

from __future__ import annotations
import asyncio
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class AgentRole(Enum):
    BUILDER = "builder"
    REVIEWER = "reviewer"
    TESTER = "tester"
    PLANNER = "planner"
    SECURITY = "security"
    DEPLOYER = "deployer"
    RESEARCHER = "researcher"
    HEALER = "healer"


class AgentStatus(Enum):
    IDLE = "idle"
    BUSY = "busy"
    OFFLINE = "offline"
    ERROR = "error"


@dataclass
class AgentProfile:
    id: str = field(default_factory=lambda: f"agent-{uuid.uuid4().hex[:8]}")
    name: str = ""
    role: AgentRole = AgentRole.BUILDER
    status: AgentStatus = AgentStatus.IDLE
    capabilities: List[str] = field(default_factory=list)
    max_concurrent_tasks: int = 3
    current_tasks: int = 0
    total_completed: int = 0
    total_failed: int = 0
    last_heartbeat: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def load(self) -> float:
        return self.current_tasks / max(self.max_concurrent_tasks, 1)

    @property
    def is_available(self) -> bool:
        return self.status == AgentStatus.IDLE and self.current_tasks < self.max_concurrent_tasks


@dataclass
class WorkbookEntry:
    id: str = field(default_factory=lambda: f"wb-{uuid.uuid4().hex[:8]}")
    task_description: str = ""
    assigned_agent: Optional[str] = None
    status: str = "pending"
    priority: int = 5
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None
    result: Any = None
    error: Optional[str] = None


class BaseAgent(ABC):
    """Abstract base for all Engine Alto agents."""

    def __init__(self, profile: AgentProfile):
        self.profile = profile

    @abstractmethod
    async def execute(self, task: WorkbookEntry) -> Any:
        """Execute a task and return result."""

    async def heartbeat(self) -> Dict[str, Any]:
        self.profile.last_heartbeat = time.time()
        return {"agent_id": self.profile.id, "status": self.profile.status.value, "load": self.profile.load}


class LoadBalancer:
    """Routes tasks to agents using least-loaded strategy."""

    def __init__(self):
        self._agents: Dict[str, AgentProfile] = {}

    def register(self, agent: AgentProfile) -> None:
        self._agents[agent.id] = agent

    def unregister(self, agent_id: str) -> bool:
        return self._agents.pop(agent_id, None) is not None

    def select(self, role: Optional[AgentRole] = None, capability: Optional[str] = None) -> Optional[AgentProfile]:
        candidates = [a for a in self._agents.values() if a.is_available]
        if role:
            candidates = [a for a in candidates if a.role == role]
        if capability:
            candidates = [a for a in candidates if capability in a.capabilities]
        if not candidates:
            return None
        return min(candidates, key=lambda a: a.load)

    def agents_by_role(self, role: AgentRole) -> List[AgentProfile]:
        return [a for a in self._agents.values() if a.role == role]

    @property
    def total_agents(self) -> int:
        return len(self._agents)

    @property
    def available_agents(self) -> int:
        return sum(1 for a in self._agents.values() if a.is_available)

    def stats(self) -> Dict[str, Any]:
        return {
            "total": self.total_agents,
            "available": self.available_agents,
            "by_role": {role.value: len(self.agents_by_role(role)) for role in AgentRole},
            "avg_load": sum(a.load for a in self._agents.values()) / max(len(self._agents), 1),
        }


class Workbook:
    """Task backlog with priority queue and agent assignment."""

    def __init__(self, balancer: LoadBalancer):
        self.balancer = balancer
        self._entries: Dict[str, WorkbookEntry] = {}
        self._completed: List[WorkbookEntry] = []

    def add_task(self, description: str, priority: int = 5) -> WorkbookEntry:
        entry = WorkbookEntry(task_description=description, priority=priority)
        self._entries[entry.id] = entry
        return entry

    def assign_next(self, role: Optional[AgentRole] = None) -> Optional[WorkbookEntry]:
        pending = sorted(
            [e for e in self._entries.values() if e.status == "pending"],
            key=lambda e: e.priority, reverse=True
        )
        if not pending:
            return None
        agent = self.balancer.select(role=role)
        if not agent:
            return None
        entry = pending[0]
        entry.assigned_agent = agent.id
        entry.status = "assigned"
        agent.current_tasks += 1
        return entry

    def complete_task(self, entry_id: str, result: Any = None, error: Optional[str] = None) -> bool:
        entry = self._entries.get(entry_id)
        if not entry:
            return False
        entry.status = "failed" if error else "completed"
        entry.result = result
        entry.error = error
        entry.completed_at = time.time()
        if entry.assigned_agent:
            agent = self.balancer._agents.get(entry.assigned_agent)
            if agent:
                agent.current_tasks = max(0, agent.current_tasks - 1)
                if error:
                    agent.total_failed += 1
                else:
                    agent.total_completed += 1
        self._completed.append(entry)
        del self._entries[entry_id]
        return True

    @property
    def pending_count(self) -> int:
        return sum(1 for e in self._entries.values() if e.status == "pending")

    def stats(self) -> Dict[str, Any]:
        return {
            "pending": self.pending_count,
            "assigned": sum(1 for e in self._entries.values() if e.status == "assigned"),
            "completed": len(self._completed),
            "balancer": self.balancer.stats(),
        }
