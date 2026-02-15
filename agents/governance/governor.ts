/**
 * Engine Alto — Governor System (The 5 Brothers)
 * Each governor owns a domain. Together they form the legislative body.
 * Consensus voting on major decisions. Auto-recovery if one fails.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';
import { constitution } from './constitution';

// ── Governor Domains ──────────────────────────────────────────

export type GovernorDomain = 'builder' | 'security' | 'quality' | 'growth' | 'intelligence';

export interface GovernorState {
  id: string;
  domain: GovernorDomain;
  name: string;
  status: 'active' | 'degraded' | 'failed' | 'recovering';
  health: number; // 0-100
  lastHeartbeat: Date;
  decisionsHandled: number;
  memory: Map<string, any>;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  votes: Map<string, 'approve' | 'reject' | 'abstain'>;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  timestamp: Date;
  executionResult?: any;
}

// ── Governor Agent ────────────────────────────────────────────

export class Governor implements Agent {
  id: string;
  name: string;
  type: 'orchestrator' = 'orchestrator';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities: string[];

  private state: GovernorState;

  constructor(domain: GovernorDomain) {
    const domainConfig = GOVERNOR_CONFIGS[domain];
    this.id = `governor-${domain}`;
    this.name = domainConfig.name;
    this.capabilities = domainConfig.capabilities;
    this.state = {
      id: this.id,
      domain,
      name: domainConfig.name,
      status: 'active',
      health: 100,
      lastHeartbeat: new Date(),
      decisionsHandled: 0,
      memory: new Map(),
    };
  }

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    this.state.lastHeartbeat = new Date();
    const start = Date.now();

    try {
      // Check constitution before acting
      const check = constitution.isPermitted(task.type, 'operation');
      if (!check.permitted) {
        return {
          taskId: task.id,
          agentId: this.id,
          success: false,
          output: { error: `Blocked by constitution: ${check.blockingRule?.title}` },
          logs: [`Constitutional block: ${check.blockingRule?.id}`],
          duration: Date.now() - start,
        };
      }

      // Process based on domain
      const result = await this.handleDomainTask(task);
      this.state.decisionsHandled++;
      this.status = 'idle';

      return {
        taskId: task.id,
        agentId: this.id,
        success: true,
        output: result,
        logs: [`Governor ${this.name} processed: ${task.type}`],
        duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      this.state.status = 'degraded';
      this.state.health = Math.max(0, this.state.health - 20);
      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        output: { error: error.message },
        logs: [`Governor ${this.name} error: ${error.message}`],
        duration: Date.now() - start,
      };
    }
  }

  private async handleDomainTask(task: AgentTask): Promise<Record<string, any>> {
    switch (this.state.domain) {
      case 'builder':
        return this.handleBuilderTask(task);
      case 'security':
        return this.handleSecurityTask(task);
      case 'quality':
        return this.handleQualityTask(task);
      case 'growth':
        return this.handleGrowthTask(task);
      case 'intelligence':
        return this.handleIntelligenceTask(task);
      default:
        return { action: 'delegated', task: task.type };
    }
  }

  private async handleBuilderTask(task: AgentTask): Promise<Record<string, any>> {
    return {
      action: 'build',
      domain: 'builder',
      plan: `Build plan for: ${task.description}`,
      steps: ['analyze', 'design', 'implement', 'test', 'deploy'],
      estimatedAgents: 3,
    };
  }

  private async handleSecurityTask(task: AgentTask): Promise<Record<string, any>> {
    return {
      action: 'security_review',
      domain: 'security',
      threat_level: 'low',
      scans: ['penetration', 'vulnerability', 'access_audit'],
      copsDeployed: 2,
    };
  }

  private async handleQualityTask(task: AgentTask): Promise<Record<string, any>> {
    return {
      action: 'quality_check',
      domain: 'quality',
      checks: ['unit_tests', 'integration_tests', 'health_scan', 'doctor_review'],
      doctorsAssigned: 1,
    };
  }

  private async handleGrowthTask(task: AgentTask): Promise<Record<string, any>> {
    return {
      action: 'growth_initiative',
      domain: 'growth',
      strategies: ['ux_polish', 'user_analytics', 'decorator_update', 'onboarding_improve'],
      trackerActive: true,
    };
  }

  private async handleIntelligenceTask(task: AgentTask): Promise<Record<string, any>> {
    return {
      action: 'intel_gather',
      domain: 'intelligence',
      scouts: ['luffy', 'zoro', 'navigator'],
      searchTargets: ['new_tech', 'competitor_analysis', 'trend_monitoring'],
    };
  }

  // ── Health & Recovery ─────────────────────────────────────

  getState(): GovernorState {
    return { ...this.state, memory: new Map(this.state.memory) };
  }

  heartbeat(): void {
    this.state.lastHeartbeat = new Date();
    if (this.state.health < 100) {
      this.state.health = Math.min(100, this.state.health + 5); // Slow self-heal
    }
    if (this.state.health > 50 && this.state.status === 'degraded') {
      this.state.status = 'active';
      this.status = 'idle';
    }
  }

  takeDamage(amount: number): void {
    this.state.health = Math.max(0, this.state.health - amount);
    if (this.state.health === 0) {
      this.state.status = 'failed';
      this.status = 'error';
    } else if (this.state.health < 50) {
      this.state.status = 'degraded';
    }
  }

  recover(snapshot: Partial<GovernorState>): void {
    this.state.status = 'recovering';
    this.state.health = snapshot.health || 80;
    this.state.decisionsHandled = snapshot.decisionsHandled || this.state.decisionsHandled;
    this.state.status = 'active';
    this.status = 'idle';
  }

  storeMemory(key: string, value: any): void {
    this.state.memory.set(key, value);
  }

  recallMemory(key: string): any {
    return this.state.memory.get(key);
  }
}

// ── Governor Configurations ───────────────────────────────────

const GOVERNOR_CONFIGS: Record<GovernorDomain, { name: string; capabilities: string[] }> = {
  builder: {
    name: 'Builder Governor (Brother 1)',
    capabilities: ['build', 'create', 'implement', 'code', 'feature', 'deploy', 'implementation'],
  },
  security: {
    name: 'Security Governor (Brother 2)',
    capabilities: ['security', 'hack', 'penetration', 'audit', 'scan', 'defense', 'security_scan'],
  },
  quality: {
    name: 'Quality Governor (Brother 3)',
    capabilities: ['test', 'quality', 'fix', 'heal', 'diagnose', 'validate', 'evaluation'],
  },
  growth: {
    name: 'Growth Governor (Brother 4)',
    capabilities: ['growth', 'user', 'analytics', 'decorate', 'ux', 'onboard', 'monitor'],
  },
  intelligence: {
    name: 'Intelligence Governor (Brother 5)',
    capabilities: ['research', 'explore', 'scout', 'analyze', 'discover', 'trend', 'analysis'],
  },
};

// ── Governance Council ────────────────────────────────────────

export class GovernanceCouncil {
  private governors: Map<GovernorDomain, Governor> = new Map();
  private decisions: Decision[] = [];

  constructor() {
    // Create the 5 brothers
    const domains: GovernorDomain[] = ['builder', 'security', 'quality', 'growth', 'intelligence'];
    const ids: string[] = [];

    for (const domain of domains) {
      const gov = new Governor(domain);
      this.governors.set(domain, gov);
      ids.push(gov.id);
    }

    // Register governor IDs with constitution
    constitution.setGovernors(ids);
  }

  getGovernor(domain: GovernorDomain): Governor | undefined {
    return this.governors.get(domain);
  }

  getAllGovernors(): Governor[] {
    return Array.from(this.governors.values());
  }

  /**
   * Propose a decision for voting
   */
  proposeDecision(title: string, description: string, proposedBy: string): Decision {
    const decision: Decision = {
      id: `DEC-${Date.now()}`,
      title,
      description,
      proposedBy,
      votes: new Map(),
      status: 'pending',
      timestamp: new Date(),
    };
    this.decisions.push(decision);
    return decision;
  }

  /**
   * Cast a vote — requires 3/5 to approve
   */
  castVote(decisionId: string, governorDomain: GovernorDomain, vote: 'approve' | 'reject' | 'abstain'): boolean {
    const decision = this.decisions.find(d => d.id === decisionId);
    const governor = this.governors.get(governorDomain);
    if (!decision || !governor || decision.status !== 'pending') return false;

    decision.votes.set(governor.id, vote);

    const approvals = Array.from(decision.votes.values()).filter(v => v === 'approve').length;
    const rejections = Array.from(decision.votes.values()).filter(v => v === 'reject').length;

    if (approvals >= 3) decision.status = 'approved';
    else if (rejections >= 3) decision.status = 'rejected';

    return true;
  }

  /**
   * Auto-recover a failed governor using others' data
   */
  recoverGovernor(domain: GovernorDomain): boolean {
    const failed = this.governors.get(domain);
    if (!failed) return false;

    // Get healthy governors
    const healthy = this.getAllGovernors().filter(g => g.getState().status === 'active');
    if (healthy.length === 0) return false; // Sister protocol needed

    // Rebuild from scratch with stored state
    const newGov = new Governor(domain);
    newGov.recover({ health: 80, decisionsHandled: failed.getState().decisionsHandled });
    this.governors.set(domain, newGov);

    return true;
  }

  /**
   * Check if sister protocol is needed (all governors failed)
   */
  needsSisterProtocol(): boolean {
    return this.getAllGovernors().every(g => g.getState().status === 'failed');
  }

  /**
   * Heartbeat all governors
   */
  heartbeatAll(): void {
    this.governors.forEach(g => g.heartbeat());
  }

  getStatus() {
    return {
      governors: this.getAllGovernors().map(g => ({
        domain: g.getState().domain,
        name: g.name,
        status: g.getState().status,
        health: g.getState().health,
        decisions: g.getState().decisionsHandled,
      })),
      pendingDecisions: this.decisions.filter(d => d.status === 'pending').length,
      totalDecisions: this.decisions.length,
      sisterProtocolNeeded: this.needsSisterProtocol(),
      constitutional: constitution.getStatus(),
    };
  }
}

export const council = new GovernanceCouncil();
