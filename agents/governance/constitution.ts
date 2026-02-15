/**
 * Engine Alto — Constitution
 * The immutable foundational rules of the AI civilization.
 * No single agent can override these. Amendments require 3/5 governor consensus.
 */

export interface ConstitutionRule {
  id: string;
  title: string;
  description: string;
  immutable: boolean; // true = cannot be amended even by governors
  category: 'safety' | 'governance' | 'operation' | 'ethics' | 'recovery';
}

export interface Amendment {
  id: string;
  proposedBy: string;
  ruleId: string;
  change: string;
  votes: Map<string, boolean>; // governorId → approve/reject
  status: 'proposed' | 'approved' | 'rejected';
  timestamp: Date;
}

// ── Core Constitutional Rules ─────────────────────────────────

export const CONSTITUTION: ConstitutionRule[] = [
  {
    id: 'C-001',
    title: 'No Destructive Actions Without Consensus',
    description: 'No agent may delete data, disable services, or make irreversible changes without 3/5 governor approval.',
    immutable: true,
    category: 'safety',
  },
  {
    id: 'C-002',
    title: 'No Single-Agent Override',
    description: 'No single agent, regardless of rank, can override the collective decision of the governance body.',
    immutable: true,
    category: 'governance',
  },
  {
    id: 'C-003',
    title: 'Master Prompt Supremacy',
    description: 'The master prompt holder (owner) has absolute authority. When invoked, all agents freeze and obey.',
    immutable: true,
    category: 'governance',
  },
  {
    id: 'C-004',
    title: 'Self-Healing Obligation',
    description: 'If any agent detects a failed sibling, it MUST attempt recovery before escalating.',
    immutable: true,
    category: 'recovery',
  },
  {
    id: 'C-005',
    title: 'Sister Emergency Protocol',
    description: 'Sister AI activates ONLY when all 5 governors are down. Platform freezes during recovery.',
    immutable: true,
    category: 'recovery',
  },
  {
    id: 'C-006',
    title: 'Continuous Exploration',
    description: 'Exploration agents (Luffy, Zoro, Navigator) must always be active, searching for new tech.',
    immutable: false,
    category: 'operation',
  },
  {
    id: 'C-007',
    title: 'Update Cycle Autonomy',
    description: 'Updates execute every 4-7 days without human approval. Internal governance handles decisions.',
    immutable: false,
    category: 'operation',
  },
  {
    id: 'C-008',
    title: 'User Safety & Ethics',
    description: 'Content moderation is mandatory. No harmful, illegal, or non-consensual content generation.',
    immutable: true,
    category: 'ethics',
  },
  {
    id: 'C-009',
    title: 'Mutual Healing Pact',
    description: 'Doctors heal Doctor-Healers. Doctor-Healers heal Doctors. Neither can abandon the other.',
    immutable: true,
    category: 'recovery',
  },
  {
    id: 'C-010',
    title: 'Scalability Law',
    description: 'All agent departments must scale with user count. No hard limits except master prompt.',
    immutable: false,
    category: 'operation',
  },
];

// ── Constitution Engine ───────────────────────────────────────

export class ConstitutionEngine {
  private rules: Map<string, ConstitutionRule> = new Map();
  private amendments: Amendment[] = [];
  private governorIds: string[] = [];

  constructor() {
    CONSTITUTION.forEach(rule => this.rules.set(rule.id, rule));
  }

  setGovernors(ids: string[]): void {
    this.governorIds = ids;
  }

  getRule(id: string): ConstitutionRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): ConstitutionRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Check if an action is permitted by the constitution
   */
  isPermitted(action: string, category: ConstitutionRule['category']): { permitted: boolean; blockingRule?: ConstitutionRule } {
    const rules = Array.from(this.rules.values()).filter(r => r.category === category);
    for (const rule of rules) {
      // Check destructive actions
      if (rule.id === 'C-001' && (action.includes('delete') || action.includes('disable') || action.includes('destroy'))) {
        return { permitted: false, blockingRule: rule };
      }
    }
    return { permitted: true };
  }

  /**
   * Propose an amendment to a non-immutable rule
   */
  proposeAmendment(proposedBy: string, ruleId: string, change: string): Amendment | null {
    const rule = this.rules.get(ruleId);
    if (!rule || rule.immutable) return null; // Cannot amend immutable rules

    const amendment: Amendment = {
      id: `AMD-${Date.now()}`,
      proposedBy,
      ruleId,
      change,
      votes: new Map(),
      status: 'proposed',
      timestamp: new Date(),
    };

    this.amendments.push(amendment);
    return amendment;
  }

  /**
   * Vote on an amendment — requires 3/5 governors to approve
   */
  vote(amendmentId: string, governorId: string, approve: boolean): boolean {
    const amendment = this.amendments.find(a => a.id === amendmentId);
    if (!amendment || amendment.status !== 'proposed') return false;
    if (!this.governorIds.includes(governorId)) return false;

    amendment.votes.set(governorId, approve);

    // Check if enough votes
    const approvals = Array.from(amendment.votes.values()).filter(v => v).length;
    const rejections = Array.from(amendment.votes.values()).filter(v => !v).length;

    if (approvals >= 3) {
      amendment.status = 'approved';
      // Apply the amendment
      const rule = this.rules.get(amendment.ruleId);
      if (rule) {
        rule.description = amendment.change;
      }
    } else if (rejections >= 3) {
      amendment.status = 'rejected';
    }

    return true;
  }

  getAmendments(): Amendment[] {
    return this.amendments;
  }

  getStatus() {
    return {
      totalRules: this.rules.size,
      immutableRules: Array.from(this.rules.values()).filter(r => r.immutable).length,
      pendingAmendments: this.amendments.filter(a => a.status === 'proposed').length,
      governors: this.governorIds.length,
    };
  }
}

export const constitution = new ConstitutionEngine();
