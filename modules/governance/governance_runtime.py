"""
Engine Alto — Governance Runtime (Phase 10)
Runs the legislative, judicial, and executive branches at runtime.
Proposal voting, dispute resolution, and policy enforcement.
"""

from __future__ import annotations
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class ProposalStatus(Enum):
    DRAFT = "draft"
    VOTING = "voting"
    APPROVED = "approved"
    REJECTED = "rejected"
    ENACTED = "enacted"
    VETOED = "vetoed"


class DisputeStatus(Enum):
    FILED = "filed"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    ESCALATED = "escalated"


@dataclass
class Vote:
    voter: str
    approve: bool
    reason: str = ""
    timestamp: float = field(default_factory=time.time)


@dataclass
class Proposal:
    id: str = field(default_factory=lambda: f"prop-{uuid.uuid4().hex[:8]}")
    title: str = ""
    description: str = ""
    author: str = ""
    status: ProposalStatus = ProposalStatus.DRAFT
    votes: List[Vote] = field(default_factory=list)
    quorum: int = 3
    created_at: float = field(default_factory=time.time)
    enacted_at: Optional[float] = None

    @property
    def approve_count(self) -> int:
        return sum(1 for v in self.votes if v.approve)

    @property
    def reject_count(self) -> int:
        return sum(1 for v in self.votes if not v.approve)

    @property
    def has_quorum(self) -> bool:
        return len(self.votes) >= self.quorum

    @property
    def passes(self) -> bool:
        return self.has_quorum and self.approve_count > self.reject_count


@dataclass
class Dispute:
    id: str = field(default_factory=lambda: f"dispute-{uuid.uuid4().hex[:8]}")
    plaintiff: str = ""
    defendant: str = ""
    description: str = ""
    status: DisputeStatus = DisputeStatus.FILED
    ruling: Optional[str] = None
    filed_at: float = field(default_factory=time.time)
    resolved_at: Optional[float] = None


@dataclass
class Policy:
    name: str
    rule: str
    enforced: bool = True
    created_at: float = field(default_factory=time.time)


class GovernanceRuntime:
    """Runs the three branches of Engine Alto governance."""

    def __init__(self):
        self._proposals: Dict[str, Proposal] = {}
        self._disputes: Dict[str, Dispute] = {}
        self._policies: Dict[str, Policy] = {}
        self._enact_handlers: Dict[str, Callable] = {}

    # Legislative branch
    def submit_proposal(self, title: str, description: str, author: str, quorum: int = 3) -> Proposal:
        prop = Proposal(title=title, description=description, author=author, quorum=quorum)
        prop.status = ProposalStatus.VOTING
        self._proposals[prop.id] = prop
        return prop

    def cast_vote(self, proposal_id: str, voter: str, approve: bool, reason: str = "") -> bool:
        prop = self._proposals.get(proposal_id)
        if not prop or prop.status != ProposalStatus.VOTING:
            return False
        if any(v.voter == voter for v in prop.votes):
            return False  # Already voted
        prop.votes.append(Vote(voter=voter, approve=approve, reason=reason))
        if prop.has_quorum:
            prop.status = ProposalStatus.APPROVED if prop.passes else ProposalStatus.REJECTED
            if prop.status == ProposalStatus.APPROVED:
                self._enact_proposal(prop)
        return True

    def _enact_proposal(self, prop: Proposal) -> None:
        prop.status = ProposalStatus.ENACTED
        prop.enacted_at = time.time()
        handler = self._enact_handlers.get(prop.title)
        if handler:
            handler(prop)

    def register_enact_handler(self, title: str, handler: Callable) -> None:
        self._enact_handlers[title] = handler

    # Judicial branch
    def file_dispute(self, plaintiff: str, defendant: str, description: str) -> Dispute:
        dispute = Dispute(plaintiff=plaintiff, defendant=defendant, description=description)
        self._disputes[dispute.id] = dispute
        return dispute

    def resolve_dispute(self, dispute_id: str, ruling: str) -> bool:
        dispute = self._disputes.get(dispute_id)
        if not dispute or dispute.status == DisputeStatus.RESOLVED:
            return False
        dispute.status = DisputeStatus.RESOLVED
        dispute.ruling = ruling
        dispute.resolved_at = time.time()
        return True

    # Executive branch
    def add_policy(self, name: str, rule: str) -> Policy:
        policy = Policy(name=name, rule=rule)
        self._policies[name] = policy
        return policy

    def enforce_policy(self, name: str) -> Optional[str]:
        policy = self._policies.get(name)
        if policy and policy.enforced:
            return policy.rule
        return None

    def stats(self) -> Dict[str, Any]:
        return {
            "proposals": len(self._proposals),
            "enacted": sum(1 for p in self._proposals.values() if p.status == ProposalStatus.ENACTED),
            "disputes": len(self._disputes),
            "resolved": sum(1 for d in self._disputes.values() if d.status == DisputeStatus.RESOLVED),
            "policies": len(self._policies),
        }
