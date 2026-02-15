"""
Capability-based Sandbox — isolates untrusted code execution.
Each script runs within a policy that defines what it can access.
"""

from __future__ import annotations
import time
from enum import Flag, auto
from dataclasses import dataclass, field
from typing import Set, Dict, Any, Optional, List


class Capability(Flag):
    """Granular capabilities that can be granted to sandboxed code."""
    NONE = 0
    FILE_READ = auto()
    FILE_WRITE = auto()
    NETWORK = auto()
    SUBPROCESS = auto()
    GPU_COMPUTE = auto()
    MEMORY_LARGE = auto()   # > 512MB allocation
    SYSTEM_INFO = auto()
    PLUGIN_LOAD = auto()
    DATABASE = auto()
    SECRETS = auto()

    # Presets
    @classmethod
    def READ_ONLY(cls) -> "Capability":
        return cls.FILE_READ | cls.SYSTEM_INFO

    @classmethod
    def STANDARD(cls) -> "Capability":
        return cls.FILE_READ | cls.FILE_WRITE | cls.SYSTEM_INFO | cls.GPU_COMPUTE

    @classmethod
    def FULL(cls) -> "Capability":
        result = cls.NONE
        for member in cls:
            result |= member
        return result


@dataclass
class SandboxPolicy:
    """Defines execution constraints for a sandbox."""
    name: str
    capabilities: Capability = Capability.NONE
    max_memory_mb: int = 512
    max_cpu_seconds: float = 30.0
    max_file_size_mb: int = 100
    allowed_paths: List[str] = field(default_factory=list)
    denied_paths: List[str] = field(default_factory=lambda: [
        "/etc/shadow", "/etc/passwd", "C:\\Windows\\System32",
    ])
    allowed_hosts: List[str] = field(default_factory=list)
    max_open_files: int = 50
    allow_eval: bool = False

    def allows(self, cap: Capability) -> bool:
        return bool(self.capabilities & cap)


@dataclass
class ViolationRecord:
    capability: Capability
    timestamp: float
    description: str
    script_name: str


class Sandbox:
    """Isolated execution environment with capability enforcement."""

    def __init__(self, policy: SandboxPolicy):
        self.policy = policy
        self._violations: List[ViolationRecord] = []
        self._resource_usage: Dict[str, Any] = {
            "memory_mb": 0, "cpu_seconds": 0.0,
            "files_opened": 0, "network_calls": 0,
        }
        self._active = False
        self._start_time: Optional[float] = None

    def enter(self) -> "Sandbox":
        self._active = True
        self._start_time = time.time()
        return self

    def exit(self) -> None:
        self._active = False
        if self._start_time:
            self._resource_usage["cpu_seconds"] = time.time() - self._start_time

    def check_capability(self, cap: Capability, description: str = "") -> bool:
        if not self.policy.allows(cap):
            self._violations.append(ViolationRecord(
                capability=cap, timestamp=time.time(),
                description=description or f"Access denied: {cap.name}",
                script_name=self.policy.name,
            ))
            return False
        return True

    def check_path(self, path: str) -> bool:
        for denied in self.policy.denied_paths:
            if path.startswith(denied):
                self._violations.append(ViolationRecord(
                    capability=Capability.FILE_READ,
                    timestamp=time.time(),
                    description=f"Path denied: {path}",
                    script_name=self.policy.name,
                ))
                return False
        if self.policy.allowed_paths:
            for allowed in self.policy.allowed_paths:
                if path.startswith(allowed):
                    return True
            self._violations.append(ViolationRecord(
                capability=Capability.FILE_READ,
                timestamp=time.time(),
                description=f"Path not in allowlist: {path}",
                script_name=self.policy.name,
            ))
            return False
        return True

    def check_host(self, host: str) -> bool:
        if not self.policy.allows(Capability.NETWORK):
            self._violations.append(ViolationRecord(
                capability=Capability.NETWORK,
                timestamp=time.time(),
                description=f"Network denied: {host}",
                script_name=self.policy.name,
            ))
            return False
        if self.policy.allowed_hosts and host not in self.policy.allowed_hosts:
            self._violations.append(ViolationRecord(
                capability=Capability.NETWORK,
                timestamp=time.time(),
                description=f"Host not in allowlist: {host}",
                script_name=self.policy.name,
            ))
            return False
        return True

    def check_memory(self, requested_mb: int) -> bool:
        total = self._resource_usage["memory_mb"] + requested_mb
        if total > self.policy.max_memory_mb:
            self._violations.append(ViolationRecord(
                capability=Capability.MEMORY_LARGE,
                timestamp=time.time(),
                description=f"Memory limit exceeded: {total}MB > {self.policy.max_memory_mb}MB",
                script_name=self.policy.name,
            ))
            return False
        self._resource_usage["memory_mb"] = total
        return True

    @property
    def violations(self) -> List[ViolationRecord]:
        return list(self._violations)

    @property
    def violation_count(self) -> int:
        return len(self._violations)

    @property
    def is_clean(self) -> bool:
        return len(self._violations) == 0

    def stats(self) -> Dict[str, Any]:
        return {
            "policy": self.policy.name,
            "active": self._active,
            "violations": self.violation_count,
            "resource_usage": dict(self._resource_usage),
        }

    def __enter__(self):
        return self.enter()

    def __exit__(self, *args):
        self.exit()
