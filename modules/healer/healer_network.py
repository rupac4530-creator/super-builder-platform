"""
Engine Alto — Healer Network (Phase 8)
Self-healing agents that monitor, diagnose, and repair system health.
Implements health checks, auto-recovery, and circuit breakers.
"""

from __future__ import annotations
import asyncio
import time
import uuid
from collections import deque
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


class CircuitState(Enum):
    CLOSED = "closed"       # Normal operation
    OPEN = "open"           # Failing, reject requests
    HALF_OPEN = "half_open" # Testing recovery


@dataclass
class HealthCheck:
    name: str
    check_fn: Callable
    interval_seconds: float = 30.0
    timeout_seconds: float = 5.0
    last_status: HealthStatus = HealthStatus.UNKNOWN
    last_check: Optional[float] = None
    consecutive_failures: int = 0
    details: str = ""


@dataclass
class HealingAction:
    id: str = field(default_factory=lambda: f"heal-{uuid.uuid4().hex[:8]}")
    target: str = ""
    action: str = ""
    timestamp: float = field(default_factory=time.time)
    success: bool = False
    details: str = ""


class CircuitBreaker:
    """Prevents cascading failures by opening on consecutive errors."""

    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time: Optional[float] = None
        self._success_count = 0

    def record_success(self) -> None:
        self._failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= 3:  # 3 consecutive successes to close
                self.state = CircuitState.CLOSED
                self._success_count = 0

    def record_failure(self) -> None:
        self._failure_count += 1
        self._last_failure_time = time.time()
        self._success_count = 0
        if self._failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def allow_request(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
        if self.state == CircuitState.OPEN:
            if self._last_failure_time and (time.time() - self._last_failure_time) >= self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                return True
            return False
        return True  # HALF_OPEN: allow probe requests

    @property
    def stats(self) -> Dict[str, Any]:
        return {
            "state": self.state.value,
            "failure_count": self._failure_count,
            "threshold": self.failure_threshold,
        }


class HealerNetwork:
    """Self-healing system that monitors and auto-recovers components."""

    def __init__(self):
        self._checks: Dict[str, HealthCheck] = {}
        self._circuit_breakers: Dict[str, CircuitBreaker] = {}
        self._healing_log: List[HealingAction] = []
        self._recovery_handlers: Dict[str, Callable] = {}

    def register_check(self, name: str, check_fn: Callable,
                       interval: float = 30.0, timeout: float = 5.0) -> None:
        self._checks[name] = HealthCheck(
            name=name, check_fn=check_fn,
            interval_seconds=interval, timeout_seconds=timeout,
        )
        self._circuit_breakers[name] = CircuitBreaker()

    def register_recovery(self, name: str, recovery_fn: Callable) -> None:
        self._recovery_handlers[name] = recovery_fn

    def run_check(self, name: str) -> HealthStatus:
        check = self._checks.get(name)
        if not check:
            return HealthStatus.UNKNOWN

        cb = self._circuit_breakers.get(name)
        try:
            result = check.check_fn()
            check.last_check = time.time()

            if result:
                check.last_status = HealthStatus.HEALTHY
                check.consecutive_failures = 0
                check.details = "OK"
                if cb:
                    cb.record_success()
            else:
                check.consecutive_failures += 1
                check.last_status = HealthStatus.DEGRADED if check.consecutive_failures < 3 else HealthStatus.UNHEALTHY
                check.details = f"Failed ({check.consecutive_failures} consecutive)"
                if cb:
                    cb.record_failure()

                # Auto-heal if handler exists
                if check.consecutive_failures >= 3 and name in self._recovery_handlers:
                    self._attempt_healing(name)

        except Exception as e:
            check.consecutive_failures += 1
            check.last_status = HealthStatus.UNHEALTHY
            check.details = f"Exception: {e}"
            check.last_check = time.time()
            if cb:
                cb.record_failure()
            if check.consecutive_failures >= 3 and name in self._recovery_handlers:
                self._attempt_healing(name)

        return check.last_status

    def _attempt_healing(self, name: str) -> HealingAction:
        handler = self._recovery_handlers.get(name)
        action = HealingAction(target=name, action="auto_recovery")
        try:
            if handler:
                handler()
                action.success = True
                action.details = "Recovery handler executed successfully"
                # Reset failure count on successful healing
                check = self._checks.get(name)
                if check:
                    check.consecutive_failures = 0
                    check.last_status = HealthStatus.DEGRADED
        except Exception as e:
            action.success = False
            action.details = f"Recovery failed: {e}"
        self._healing_log.append(action)
        return action

    def run_all_checks(self) -> Dict[str, HealthStatus]:
        results = {}
        for name in self._checks:
            results[name] = self.run_check(name)
        return results

    def overall_status(self) -> HealthStatus:
        if not self._checks:
            return HealthStatus.UNKNOWN
        statuses = [c.last_status for c in self._checks.values()]
        if all(s == HealthStatus.HEALTHY for s in statuses):
            return HealthStatus.HEALTHY
        if any(s == HealthStatus.UNHEALTHY for s in statuses):
            return HealthStatus.UNHEALTHY
        return HealthStatus.DEGRADED

    def stats(self) -> Dict[str, Any]:
        return {
            "overall": self.overall_status().value,
            "checks": {
                name: {
                    "status": c.last_status.value,
                    "failures": c.consecutive_failures,
                    "circuit": self._circuit_breakers.get(name, CircuitBreaker()).stats,
                }
                for name, c in self._checks.items()
            },
            "healing_actions": len(self._healing_log),
            "successful_heals": sum(1 for a in self._healing_log if a.success),
        }
