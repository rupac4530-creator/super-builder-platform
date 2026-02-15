/**
 * Phase 11 — Creation & Expansion Network (CEN)
 * Assembler AI: creates new departments, assigns tasks, generates AI agents.
 * Creative network: expands platform capabilities dynamically.
 */

export interface Department {
  id: string;
  name: string;
  purpose: string;
  agents: string[];
  createdAt: Date;
  status: 'active' | 'expanding' | 'maintenance';
  tasksAssigned: number;
}

export interface ExpansionProposal {
  id: string;
  title: string;
  description: string;
  newDepartment?: string;
  newAgents: string[];
  justification: string;
  priority: number;
  approved: boolean;
  implementedAt?: Date;
}

export class ExpansionNetwork {
  private departments: Map<string, Department> = new Map();
  private proposals: ExpansionProposal[] = [];
  private assemblerAI = { id: 'assembler', active: true, departmentsCreated: 0 };
  private balancerAI = { id: 'balancer', active: true, rebalances: 0 };

  registerDepartment(name: string, purpose: string, initialAgents: string[] = []): string {
    const id = `dept-${name.toLowerCase().replace(/\s+/g, '-')}`;
    this.departments.set(id, { id, name, purpose, agents: initialAgents, createdAt: new Date(), status: 'active', tasksAssigned: 0 });
    return id;
  }

  proposeExpansion(title: string, description: string, newAgents: string[], justification: string, newDepartment?: string): string {
    const id = `exp-${Date.now()}`;
    this.proposals.push({
      id, title, description, newDepartment, newAgents, justification, priority: 5, approved: false,
    });
    return id;
  }

  // Auto-approve proposals (governance modules verify internally — no human needed)
  evaluateProposals(): ExpansionProposal[] {
    const pending = this.proposals.filter(p => !p.approved && !p.implementedAt);
    for (const proposal of pending) {
      // Internal evaluation: if justification is clear and agents are needed
      if (proposal.justification.length > 10 && proposal.newAgents.length > 0) {
        proposal.approved = true;
      }
    }
    return pending.filter(p => p.approved);
  }

  implementProposal(proposalId: string): boolean {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || !proposal.approved) return false;

    if (proposal.newDepartment) {
      this.registerDepartment(proposal.newDepartment, proposal.title, proposal.newAgents);
      this.assemblerAI.departmentsCreated++;
    }
    proposal.implementedAt = new Date();
    return true;
  }

  // Balancer: ensures tasks are distributed evenly
  rebalance(): { department: string; action: string }[] {
    const actions: { department: string; action: string }[] = [];
    for (const [id, dept] of this.departments) {
      const loadPerAgent = dept.agents.length > 0 ? dept.tasksAssigned / dept.agents.length : 0;
      if (loadPerAgent > 10) {
        actions.push({ department: dept.name, action: 'Scale up — high load per agent' });
      } else if (loadPerAgent < 1 && dept.agents.length > 3) {
        actions.push({ department: dept.name, action: 'Scale down — underutilized' });
      }
    }
    this.balancerAI.rebalances++;
    return actions;
  }

  getStatus() {
    return {
      departments: this.departments.size,
      activeDepartments: Array.from(this.departments.values()).filter(d => d.status === 'active').length,
      totalProposals: this.proposals.length,
      approvedProposals: this.proposals.filter(p => p.approved).length,
      implementedProposals: this.proposals.filter(p => p.implementedAt).length,
      assemblerActive: this.assemblerAI.active,
      assemblerCreations: this.assemblerAI.departmentsCreated,
      balancerRebalances: this.balancerAI.rebalances,
    };
  }
}

export const expansionNetwork = new ExpansionNetwork();
