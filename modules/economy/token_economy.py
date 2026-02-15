"""
Engine Alto — Token Economy & Marketplace (Phase 9)
Internal resource credits, agent compensation, and marketplace for skills/tools.
"""

from __future__ import annotations
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class TransactionType(Enum):
    EARN = "earn"
    SPEND = "spend"
    TRANSFER = "transfer"
    REWARD = "reward"
    PENALTY = "penalty"


@dataclass
class Transaction:
    id: str = field(default_factory=lambda: f"tx-{uuid.uuid4().hex[:10]}")
    sender: str = "system"
    receiver: str = ""
    amount: float = 0.0
    tx_type: TransactionType = TransactionType.EARN
    reason: str = ""
    timestamp: float = field(default_factory=time.time)


@dataclass
class MarketplaceListing:
    id: str = field(default_factory=lambda: f"listing-{uuid.uuid4().hex[:8]}")
    seller: str = ""
    title: str = ""
    description: str = ""
    category: str = "skill"
    price: float = 0.0
    active: bool = True
    created_at: float = field(default_factory=time.time)
    purchases: int = 0


class TokenLedger:
    """Manages agent token balances and transaction history."""

    def __init__(self, initial_balance: float = 100.0):
        self._balances: Dict[str, float] = defaultdict(lambda: initial_balance)
        self._transactions: List[Transaction] = []

    def balance(self, agent_id: str) -> float:
        return self._balances[agent_id]

    def credit(self, agent_id: str, amount: float, reason: str = "") -> Transaction:
        tx = Transaction(receiver=agent_id, amount=amount, tx_type=TransactionType.EARN, reason=reason)
        self._balances[agent_id] += amount
        self._transactions.append(tx)
        return tx

    def debit(self, agent_id: str, amount: float, reason: str = "") -> Optional[Transaction]:
        if self._balances[agent_id] < amount:
            return None
        tx = Transaction(sender=agent_id, amount=amount, tx_type=TransactionType.SPEND, reason=reason)
        self._balances[agent_id] -= amount
        self._transactions.append(tx)
        return tx

    def transfer(self, sender: str, receiver: str, amount: float, reason: str = "") -> Optional[Transaction]:
        if self._balances[sender] < amount:
            return None
        tx = Transaction(sender=sender, receiver=receiver, amount=amount,
                         tx_type=TransactionType.TRANSFER, reason=reason)
        self._balances[sender] -= amount
        self._balances[receiver] += amount
        self._transactions.append(tx)
        return tx

    def reward(self, agent_id: str, amount: float, reason: str = "") -> Transaction:
        tx = Transaction(receiver=agent_id, amount=amount, tx_type=TransactionType.REWARD, reason=reason)
        self._balances[agent_id] += amount
        self._transactions.append(tx)
        return tx

    def history(self, agent_id: Optional[str] = None, limit: int = 50) -> List[Transaction]:
        txs = self._transactions
        if agent_id:
            txs = [t for t in txs if t.sender == agent_id or t.receiver == agent_id]
        return txs[-limit:]

    def stats(self) -> Dict[str, Any]:
        return {
            "total_agents": len(self._balances),
            "total_supply": sum(self._balances.values()),
            "total_transactions": len(self._transactions),
        }


class Marketplace:
    """Agent skill and tool marketplace."""

    def __init__(self, ledger: TokenLedger):
        self.ledger = ledger
        self._listings: Dict[str, MarketplaceListing] = {}

    def list_skill(self, seller: str, title: str, description: str,
                   price: float, category: str = "skill") -> MarketplaceListing:
        listing = MarketplaceListing(seller=seller, title=title, description=description,
                                     price=price, category=category)
        self._listings[listing.id] = listing
        return listing

    def purchase(self, buyer: str, listing_id: str) -> Optional[Transaction]:
        listing = self._listings.get(listing_id)
        if not listing or not listing.active:
            return None
        tx = self.ledger.transfer(buyer, listing.seller, listing.price,
                                  reason=f"Purchase: {listing.title}")
        if tx:
            listing.purchases += 1
        return tx

    def search(self, query: str = "", category: str = "") -> List[MarketplaceListing]:
        results = [l for l in self._listings.values() if l.active]
        if query:
            results = [l for l in results if query.lower() in l.title.lower() or query.lower() in l.description.lower()]
        if category:
            results = [l for l in results if l.category == category]
        return results

    def stats(self) -> Dict[str, Any]:
        active = [l for l in self._listings.values() if l.active]
        return {"total_listings": len(active), "total_purchases": sum(l.purchases for l in active)}
