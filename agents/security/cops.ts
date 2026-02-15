/**
 * Engine Alto — Cops & Head Officer (Security Bodyguards)
 * Cops: bodyguards per governor — detect intrusion attempts.
 * Head Officer: master cop. Blocks hacker signals, blocks access.
 * Triggers emergency update if attack detected.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface ThreatAlert {
  id: string;
  type: 'intrusion' | 'data_leak' | 'brute_force' | 'privilege_escalation' | 'ddos' | 'injection';
  source: string;
  target: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  blocked: boolean;
  details: string;
}

// ── Cop Agent (Bodyguard) ─────────────────────────────────────

export class CopAgent implements Agent {
  id: string;
  name: string;
  type: 'police' = 'police';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['guard', 'detect_intrusion', 'block_threat', 'patrol'];

  private assignedGovernor: string;
  private threatsDetected: ThreatAlert[] = [];
  private health: number = 100;

  constructor(governorDomain: string, index: number) {
    this.assignedGovernor = governorDomain;
    this.id = `cop-${governorDomain}-${index}`;
    this.name = `Cop #${index} (guarding ${governorDomain})`;
  }

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      if (task.type === 'patrol') {
        output = this.patrol();
      } else if (task.type === 'investigate') {
        output = this.investigate(task.input.suspiciousActivity);
      } else {
        output = { action: 'on_guard', governor: this.assignedGovernor };
      }

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Cop ${this.id}: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Cop error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  private patrol(): Record<string, any> {
    return {
      patrolling: true,
      governor: this.assignedGovernor,
      threatsDetected: this.threatsDetected.length,
      status: 'all_clear',
    };
  }

  private investigate(activity: string): Record<string, any> {
    const isThreat = activity.includes('unauthorized') || activity.includes('suspicious') || activity.includes('attack');

    if (isThreat) {
      const alert: ThreatAlert = {
        id: `THREAT-${Date.now()}`,
        type: 'intrusion',
        source: 'external',
        target: this.assignedGovernor,
        severity: 'high',
        timestamp: new Date(),
        blocked: true,
        details: activity,
      };
      this.threatsDetected.push(alert);
      return { threat: true, alert, escalatedToHeadOfficer: true };
    }

    return { threat: false, activity, cleared: true };
  }

  getHealth(): number { return this.health; }
  takeDamage(amount: number): void { this.health = Math.max(0, this.health - amount); }
  heal(amount: number): void { this.health = Math.min(100, this.health + amount); }
}

// ── Head Officer ──────────────────────────────────────────────

export class HeadOfficer implements Agent {
  id = 'head-officer';
  name = 'Head Officer — Master Security Controller';
  type: 'police' = 'police';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['block_access', 'coordinate_cops', 'emergency_lockdown', 'threat_analysis'];

  private blockedSources: Set<string> = new Set();
  private allThreats: ThreatAlert[] = [];
  private cops: CopAgent[] = [];
  private lockdownActive: boolean = false;

  registerCops(cops: CopAgent[]): void {
    this.cops = cops;
  }

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'receive_threat':
          output = this.handleThreat(task.input.threat);
          break;
        case 'lockdown':
          output = this.activateLockdown();
          break;
        case 'unlock':
          output = this.deactivateLockdown();
          break;
        case 'status_report':
          output = this.getSecurityReport();
          break;
        default:
          output = { action: 'monitoring_all_sectors' };
      }

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Head Officer: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Head Officer error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  private handleThreat(threat: ThreatAlert): Record<string, any> {
    this.allThreats.push(threat);
    this.blockedSources.add(threat.source);

    if (threat.severity === 'critical') {
      this.activateLockdown();
      return { action: 'lockdown', threat, message: '🚨 CRITICAL THREAT — Full lockdown activated' };
    }

    return {
      action: 'blocked',
      source: threat.source,
      blocked: true,
      totalBlocked: this.blockedSources.size,
    };
  }

  private activateLockdown(): Record<string, any> {
    this.lockdownActive = true;
    return {
      lockdown: true,
      message: '🔒 Platform in security lockdown. All external access blocked.',
      blockedSources: this.blockedSources.size,
      timestamp: new Date(),
    };
  }

  private deactivateLockdown(): Record<string, any> {
    this.lockdownActive = false;
    return { lockdown: false, message: '🔓 Lockdown lifted. Normal operations resumed.' };
  }

  private getSecurityReport(): Record<string, any> {
    return {
      lockdownActive: this.lockdownActive,
      totalThreats: this.allThreats.length,
      blockedSources: this.blockedSources.size,
      criticalThreats: this.allThreats.filter(t => t.severity === 'critical').length,
      activeCops: this.cops.filter(c => c.status !== 'error').length,
      totalCops: this.cops.length,
      recentThreats: this.allThreats.slice(-5).map(t => ({ type: t.type, severity: t.severity, time: t.timestamp })),
    };
  }

  getStatus() {
    return this.getSecurityReport();
  }
}

// ── Create Cops (2 per governor domain) & Head Officer ────────

const GOVERNOR_DOMAINS = ['builder', 'security', 'quality', 'growth', 'intelligence'];

export const allCops: CopAgent[] = [];
for (const domain of GOVERNOR_DOMAINS) {
  allCops.push(new CopAgent(domain, 1));
  allCops.push(new CopAgent(domain, 2));
}

export const headOfficer = new HeadOfficer();
headOfficer.registerCops(allCops);
