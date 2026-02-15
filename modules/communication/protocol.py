"""
Engine Alto — Communication Protocol & Federation (Phases 15-17)
Inter-agent messaging, federation with external systems, and protocol negotiation.
"""

from __future__ import annotations
import asyncio
import json
import time
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class MessagePriority(Enum):
    LOW = 0
    NORMAL = 1
    HIGH = 2
    URGENT = 3


class ChannelType(Enum):
    BROADCAST = "broadcast"
    DIRECT = "direct"
    TOPIC = "topic"
    REQUEST_REPLY = "request_reply"


@dataclass
class Message:
    id: str = field(default_factory=lambda: f"msg-{uuid.uuid4().hex[:10]}")
    sender: str = ""
    receiver: str = ""   # Empty for broadcast
    channel: str = "default"
    payload: Any = None
    priority: MessagePriority = MessagePriority.NORMAL
    timestamp: float = field(default_factory=time.time)
    reply_to: Optional[str] = None
    ttl_seconds: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_expired(self) -> bool:
        if self.ttl_seconds is None:
            return False
        return (time.time() - self.timestamp) > self.ttl_seconds


class MessageBus:
    """Pub/Sub message bus for inter-agent communication."""

    def __init__(self, max_queue_size: int = 10000):
        self._subscriptions: Dict[str, List[Callable]] = defaultdict(list)
        self._queue: deque = deque(maxlen=max_queue_size)
        self._delivered: int = 0
        self._dropped: int = 0

    def subscribe(self, channel: str, handler: Callable) -> None:
        self._subscriptions[channel].append(handler)

    def unsubscribe(self, channel: str, handler: Callable) -> bool:
        if channel in self._subscriptions:
            try:
                self._subscriptions[channel].remove(handler)
                return True
            except ValueError:
                pass
        return False

    def publish(self, message: Message) -> int:
        if message.is_expired:
            self._dropped += 1
            return 0
        self._queue.append(message)
        handlers = self._subscriptions.get(message.channel, [])
        # Also deliver to wildcard subscribers
        handlers += self._subscriptions.get("*", [])
        delivered = 0
        for handler in handlers:
            try:
                handler(message)
                delivered += 1
            except Exception:
                pass
        self._delivered += delivered
        return delivered

    def send_direct(self, sender: str, receiver: str, payload: Any,
                    priority: MessagePriority = MessagePriority.NORMAL) -> Message:
        msg = Message(sender=sender, receiver=receiver, channel=f"direct:{receiver}",
                      payload=payload, priority=priority)
        self.publish(msg)
        return msg

    def broadcast(self, sender: str, channel: str, payload: Any) -> Message:
        msg = Message(sender=sender, channel=channel, payload=payload)
        self.publish(msg)
        return msg

    def stats(self) -> Dict[str, Any]:
        return {
            "channels": len(self._subscriptions),
            "total_subscribers": sum(len(h) for h in self._subscriptions.values()),
            "queue_size": len(self._queue),
            "delivered": self._delivered,
            "dropped": self._dropped,
        }


@dataclass
class FederationNode:
    id: str = field(default_factory=lambda: f"node-{uuid.uuid4().hex[:8]}")
    name: str = ""
    endpoint: str = ""
    protocol: str = "alto-v1"
    trusted: bool = False
    connected: bool = False
    last_seen: Optional[float] = None
    capabilities: List[str] = field(default_factory=list)


class Federation:
    """Manages connections to external Alto instances."""

    def __init__(self, local_id: str = ""):
        self.local_id = local_id or f"alto-{uuid.uuid4().hex[:8]}"
        self._nodes: Dict[str, FederationNode] = {}
        self._bus = MessageBus()

    def register_node(self, name: str, endpoint: str, trusted: bool = False,
                     capabilities: Optional[List[str]] = None) -> FederationNode:
        node = FederationNode(name=name, endpoint=endpoint, trusted=trusted,
                              capabilities=capabilities or [])
        self._nodes[node.id] = node
        return node

    def connect(self, node_id: str) -> bool:
        node = self._nodes.get(node_id)
        if node:
            node.connected = True
            node.last_seen = time.time()
            return True
        return False

    def disconnect(self, node_id: str) -> bool:
        node = self._nodes.get(node_id)
        if node:
            node.connected = False
            return True
        return False

    def send(self, node_id: str, payload: Any) -> Optional[Message]:
        node = self._nodes.get(node_id)
        if not node or not node.connected:
            return None
        return self._bus.send_direct(self.local_id, node_id, payload, MessagePriority.HIGH)

    @property
    def connected_nodes(self) -> List[FederationNode]:
        return [n for n in self._nodes.values() if n.connected]

    def stats(self) -> Dict[str, Any]:
        return {
            "local_id": self.local_id,
            "total_nodes": len(self._nodes),
            "connected": len(self.connected_nodes),
            "bus": self._bus.stats(),
        }
