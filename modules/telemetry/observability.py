"""
Engine Alto — Telemetry, Observability & Metrics (Phase 13-14)
Distributed tracing, metrics collection, alerting, and dashboards.
"""

from __future__ import annotations
import time
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class MetricType(Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"


class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class Metric:
    name: str
    type: MetricType
    value: float = 0.0
    labels: Dict[str, str] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)


@dataclass
class Span:
    id: str = field(default_factory=lambda: f"span-{uuid.uuid4().hex[:12]}")
    trace_id: str = ""
    name: str = ""
    parent_id: Optional[str] = None
    start_time: float = field(default_factory=time.time)
    end_time: Optional[float] = None
    tags: Dict[str, str] = field(default_factory=dict)
    status: str = "ok"

    @property
    def duration_ms(self) -> float:
        if self.end_time:
            return (self.end_time - self.start_time) * 1000
        return (time.time() - self.start_time) * 1000

    def finish(self, status: str = "ok") -> None:
        self.end_time = time.time()
        self.status = status


@dataclass
class Alert:
    id: str = field(default_factory=lambda: f"alert-{uuid.uuid4().hex[:8]}")
    name: str = ""
    severity: AlertSeverity = AlertSeverity.WARNING
    condition: str = ""
    message: str = ""
    triggered_at: float = field(default_factory=time.time)
    acknowledged: bool = False


class MetricsCollector:
    """Collects and stores time-series metrics."""

    def __init__(self, max_history: int = 1000):
        self._metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_history))
        self._counters: Dict[str, float] = defaultdict(float)

    def increment(self, name: str, value: float = 1.0, **labels) -> None:
        self._counters[name] += value
        self._metrics[name].append(Metric(name=name, type=MetricType.COUNTER,
                                          value=self._counters[name], labels=labels))

    def gauge(self, name: str, value: float, **labels) -> None:
        self._metrics[name].append(Metric(name=name, type=MetricType.GAUGE, value=value, labels=labels))

    def timer(self, name: str, duration_ms: float, **labels) -> None:
        self._metrics[name].append(Metric(name=name, type=MetricType.TIMER, value=duration_ms, labels=labels))

    def get_latest(self, name: str) -> Optional[Metric]:
        if name in self._metrics and self._metrics[name]:
            return self._metrics[name][-1]
        return None

    def get_series(self, name: str, limit: int = 100) -> List[Metric]:
        return list(self._metrics.get(name, []))[-limit:]

    def all_metric_names(self) -> List[str]:
        return list(self._metrics.keys())


class Tracer:
    """Distributed tracing with spans."""

    def __init__(self):
        self._traces: Dict[str, List[Span]] = defaultdict(list)

    def start_trace(self, name: str) -> Span:
        trace_id = f"trace-{uuid.uuid4().hex[:12]}"
        span = Span(trace_id=trace_id, name=name)
        self._traces[trace_id].append(span)
        return span

    def start_span(self, name: str, parent: Span) -> Span:
        span = Span(trace_id=parent.trace_id, name=name, parent_id=parent.id)
        self._traces[parent.trace_id].append(span)
        return span

    def get_trace(self, trace_id: str) -> List[Span]:
        return self._traces.get(trace_id, [])


class AlertManager:
    """Manages alert rules and notifications."""

    def __init__(self):
        self._alerts: List[Alert] = []
        self._rules: Dict[str, Callable] = {}
        self._handlers: List[Callable] = []

    def add_rule(self, name: str, check_fn: Callable) -> None:
        self._rules[name] = check_fn

    def on_alert(self, handler: Callable) -> None:
        self._handlers.append(handler)

    def check_rules(self, metrics: MetricsCollector) -> List[Alert]:
        fired = []
        for name, check_fn in self._rules.items():
            try:
                result = check_fn(metrics)
                if result:
                    alert = Alert(name=name, message=str(result),
                                  severity=AlertSeverity.WARNING)
                    self._alerts.append(alert)
                    fired.append(alert)
                    for handler in self._handlers:
                        handler(alert)
            except Exception:
                pass
        return fired

    @property
    def unacknowledged(self) -> List[Alert]:
        return [a for a in self._alerts if not a.acknowledged]


class Observability:
    """Unified observability facade."""

    def __init__(self):
        self.metrics = MetricsCollector()
        self.tracer = Tracer()
        self.alerts = AlertManager()

    def stats(self) -> Dict[str, Any]:
        return {
            "metrics_count": len(self.metrics.all_metric_names()),
            "active_alerts": len(self.alerts.unacknowledged),
            "total_alerts": len(self.alerts._alerts),
        }
