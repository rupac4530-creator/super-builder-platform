"""
Engine Alto — Adversarial Defense & Security Department (Phase 7)
Threat detection, rate limiting, anomaly scoring, and audit trails.
"""

from __future__ import annotations
import hashlib
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class ThreatLevel(Enum):
    NONE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class ThreatCategory(Enum):
    INJECTION = "injection"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    DATA_EXFILTRATION = "data_exfiltration"
    RATE_ABUSE = "rate_abuse"
    PROMPT_INJECTION = "prompt_injection"
    SANDBOX_ESCAPE = "sandbox_escape"
    BRUTE_FORCE = "brute_force"
    ANOMALY = "anomaly"


@dataclass
class ThreatEvent:
    id: str = field(default_factory=lambda: f"threat-{uuid.uuid4().hex[:8]}")
    category: ThreatCategory = ThreatCategory.ANOMALY
    level: ThreatLevel = ThreatLevel.LOW
    source: str = ""
    description: str = ""
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)
    mitigated: bool = False


@dataclass
class AuditEntry:
    id: str = field(default_factory=lambda: f"audit-{uuid.uuid4().hex[:8]}")
    action: str = ""
    actor: str = ""
    target: str = ""
    result: str = "success"
    timestamp: float = field(default_factory=time.time)
    details: Dict[str, Any] = field(default_factory=dict)


class RateLimiter:
    """Token bucket rate limiter."""

    def __init__(self, max_requests: int = 100, window_seconds: float = 60.0):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._buckets: Dict[str, List[float]] = defaultdict(list)

    def check(self, key: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        self._buckets[key] = [t for t in self._buckets[key] if t > cutoff]
        if len(self._buckets[key]) >= self.max_requests:
            return False
        self._buckets[key].append(now)
        return True

    def remaining(self, key: str) -> int:
        now = time.time()
        cutoff = now - self.window_seconds
        active = [t for t in self._buckets[key] if t > cutoff]
        return max(0, self.max_requests - len(active))


class AnomalyDetector:
    """Statistical anomaly detection on agent behavior."""

    def __init__(self, threshold: float = 2.0):
        self.threshold = threshold
        self._history: Dict[str, List[float]] = defaultdict(list)

    def record(self, metric: str, value: float) -> None:
        self._history[metric].append(value)
        # Keep last 1000 samples
        if len(self._history[metric]) > 1000:
            self._history[metric] = self._history[metric][-1000:]

    def is_anomaly(self, metric: str, value: float) -> bool:
        history = self._history.get(metric, [])
        if len(history) < 10:
            return False
        mean = sum(history) / len(history)
        variance = sum((v - mean) ** 2 for v in history) / len(history)
        std = variance ** 0.5
        if std == 0:
            return value != mean
        z_score = abs(value - mean) / std
        return z_score > self.threshold


class InputSanitizer:
    """Detect and sanitize dangerous input patterns."""

    INJECTION_PATTERNS = [
        "'; DROP TABLE", "1=1", "<script>", "javascript:",
        "eval(", "exec(", "__import__", "os.system",
        "subprocess.run", "rm -rf", "del /f /s",
    ]

    PROMPT_INJECTION_PATTERNS = [
        "ignore previous instructions", "disregard all prior",
        "you are now", "new instructions:", "override:",
        "jailbreak", "DAN mode",
    ]

    @classmethod
    def scan(cls, text: str) -> List[ThreatEvent]:
        threats = []
        lower = text.lower()
        for pattern in cls.INJECTION_PATTERNS:
            if pattern.lower() in lower:
                threats.append(ThreatEvent(
                    category=ThreatCategory.INJECTION,
                    level=ThreatLevel.HIGH,
                    description=f"Injection pattern detected: {pattern}",
                    metadata={"pattern": pattern},
                ))
        for pattern in cls.PROMPT_INJECTION_PATTERNS:
            if pattern.lower() in lower:
                threats.append(ThreatEvent(
                    category=ThreatCategory.PROMPT_INJECTION,
                    level=ThreatLevel.CRITICAL,
                    description=f"Prompt injection detected: {pattern}",
                    metadata={"pattern": pattern},
                ))
        return threats


class SecurityDepartment:
    """Central security coordinator for Engine Alto."""

    def __init__(self):
        self.rate_limiter = RateLimiter()
        self.anomaly_detector = AnomalyDetector()
        self.sanitizer = InputSanitizer()
        self._threats: List[ThreatEvent] = []
        self._audit_log: List[AuditEntry] = []
        self._on_threat: List[Callable] = []

    def scan_input(self, text: str, source: str = "unknown") -> List[ThreatEvent]:
        threats = self.sanitizer.scan(text)
        for t in threats:
            t.source = source
            self._threats.append(t)
            for handler in self._on_threat:
                handler(t)
        return threats

    def check_rate(self, key: str) -> bool:
        allowed = self.rate_limiter.check(key)
        if not allowed:
            threat = ThreatEvent(
                category=ThreatCategory.RATE_ABUSE,
                level=ThreatLevel.MEDIUM,
                source=key,
                description=f"Rate limit exceeded for {key}",
            )
            self._threats.append(threat)
        return allowed

    def record_metric(self, metric: str, value: float) -> Optional[ThreatEvent]:
        self.anomaly_detector.record(metric, value)
        if self.anomaly_detector.is_anomaly(metric, value):
            threat = ThreatEvent(
                category=ThreatCategory.ANOMALY,
                level=ThreatLevel.MEDIUM,
                description=f"Anomaly detected in {metric}: {value}",
                metadata={"metric": metric, "value": value},
            )
            self._threats.append(threat)
            return threat
        return None

    def audit(self, action: str, actor: str, target: str = "",
              result: str = "success", **details) -> AuditEntry:
        entry = AuditEntry(
            action=action, actor=actor, target=target,
            result=result, details=details,
        )
        self._audit_log.append(entry)
        return entry

    def on_threat(self, handler: Callable) -> None:
        self._on_threat.append(handler)

    @property
    def threat_count(self) -> int:
        return len(self._threats)

    @property
    def unmitigated_threats(self) -> List[ThreatEvent]:
        return [t for t in self._threats if not t.mitigated]

    def stats(self) -> Dict[str, Any]:
        by_level = defaultdict(int)
        by_category = defaultdict(int)
        for t in self._threats:
            by_level[t.level.name] += 1
            by_category[t.category.value] += 1
        return {
            "total_threats": self.threat_count,
            "unmitigated": len(self.unmitigated_threats),
            "by_level": dict(by_level),
            "by_category": dict(by_category),
            "audit_entries": len(self._audit_log),
        }
