/**
 * Engine Alto — Mother AI
 * Produces new agents on demand when departments expand.
 * Monitors all agent health. Detects misbehavior.
 * Can spawn specialized agents per-department.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface SpawnRecord {
  agentId: string;
  agentType: string;
  department: string;
  spawnedAt: Date;
  reason: string;
  status: 'active' | 'terminated';
}

export interface HealthReport {
  agentId: string;
  health: number;
  status: string;
  lastChecked: Date;
  issues: string[];
}

// ── Mother AI ─────────────────────────────────────────────────

export class MotherAI implements Agent {
  id = 'mother-ai';
  name = 'Mother AI — Agent Producer & Health Monitor';
  type: 'orchestrator' = 'orchestrator';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['spawn', 'health_monitor', 'misbehavior_detect', 'agent_management'];

  private spawnedAgents: SpawnRecord[] = [];
  private healthReports: Map<string, HealthReport> = new Map();
  private misbehaviorLog: Array<{ agentId: string; issue: string; timestamp: Date; resolved: boolean }> = [];
  private agentTemplates: Map<string, () => Agent> = new Map();

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      if (task.type === 'spawn') {
        output = this.spawnAgent(task.input.agentType, task.input.department, task.input.reason);
      } else if (task.type === 'health_check') {
        output = this.runHealthCheck();
      } else if (task.type === 'misbehavior_scan') {
        output = this.detectMisbehavior();
      } else {
        output = { action: 'monitor', status: 'watching_all_children' };
      }

      this.status = 'idle';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Mother AI processed: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Mother AI error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  /**
   * Register a template for spawning agents of a type
   */
  registerTemplate(type: string, factory: () => Agent): void {
    this.agentTemplates.set(type, factory);
  }

  /**
   * Spawn a new agent for a department
   */
  spawnAgent(agentType: string, department: string, reason: string): Record<string, any> {
    const factory = this.agentTemplates.get(agentType);
    const agentId = `${agentType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const record: SpawnRecord = {
      agentId,
      agentType,
      department,
      spawnedAt: new Date(),
      reason,
      status: 'active',
    };

    this.spawnedAgents.push(record);

    return {
      spawned: true,
      agentId,
      agentType,
      department,
      reason,
      templateAvailable: !!factory,
      totalSpawned: this.spawnedAgents.filter(s => s.status === 'active').length,
    };
  }

  /**
   * Record a health report for an agent
   */
  receiveHealthReport(report: HealthReport): void {
    this.healthReports.set(report.agentId, report);

    // Auto-detect critical health
    if (report.health < 30) {
      this.misbehaviorLog.push({
        agentId: report.agentId,
        issue: `Critical health: ${report.health}%`,
        timestamp: new Date(),
        resolved: false,
      });
    }
  }

  /**
   * Run health check across all known agents
   */
  private runHealthCheck(): Record<string, any> {
    const reports = Array.from(this.healthReports.values());
    const critical = reports.filter(r => r.health < 30);
    const degraded = reports.filter(r => r.health >= 30 && r.health < 70);
    const healthy = reports.filter(r => r.health >= 70);

    return {
      total: reports.length,
      healthy: healthy.length,
      degraded: degraded.length,
      critical: critical.length,
      criticalAgents: critical.map(r => r.agentId),
    };
  }

  /**
   * Detect misbehaving agents
   */
  private detectMisbehavior(): Record<string, any> {
    const unresolved = this.misbehaviorLog.filter(m => !m.resolved);
    return {
      misbehavingAgents: unresolved.length,
      details: unresolved.map(m => ({ agent: m.agentId, issue: m.issue })),
    };
  }

  /**
   * Terminate a misbehaving agent
   */
  terminateAgent(agentId: string): boolean {
    const record = this.spawnedAgents.find(s => s.agentId === agentId && s.status === 'active');
    if (record) {
      record.status = 'terminated';
      return true;
    }
    return false;
  }

  getStatus() {
    return {
      activeSpawned: this.spawnedAgents.filter(s => s.status === 'active').length,
      totalSpawned: this.spawnedAgents.length,
      healthReportsReceived: this.healthReports.size,
      unresolvedIssues: this.misbehaviorLog.filter(m => !m.resolved).length,
      templates: Array.from(this.agentTemplates.keys()),
    };
  }
}

export const motherAI = new MotherAI();
