/**
 * Engine Alto — Home Healer Network
 * 24/7 health monitoring for ALL agents in the civilization.
 * Checks: memory OK, not overworked, functioning properly.
 * Reports issues to doctors immediately.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface AgentHealthSnapshot {
  agentId: string;
  health: number;
  isOverworked: boolean;
  memoryUsage: number; // 0-100
  lastActive: Date;
  issues: string[];
}

export class HomeHealerNetwork implements Agent {
  id = 'home-healer-network';
  name = 'Home Healer Network — 24/7 Civilization Monitor';
  type: 'doctor' = 'doctor';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['health_monitor', 'agent_check', '24x7_watch', 'memory_check'];

  private healthSnapshots: Map<string, AgentHealthSnapshot> = new Map();
  private alertQueue: Array<{ agentId: string; issue: string; severity: string; timestamp: Date }> = [];
  private checksPerformed: number = 0;
  private issuesDetected: number = 0;

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'active';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      if (task.type === 'full_scan') {
        output = this.performFullScan();
      } else if (task.type === 'check_agent') {
        output = this.checkAgent(task.input.agentId, task.input.health, task.input.memoryUsage);
      } else {
        output = this.getOverview();
      }

      this.status = 'idle';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Home Healer: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Home Healer error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  checkAgent(agentId: string, health: number, memoryUsage: number = 50): Record<string, any> {
    this.checksPerformed++;
    const issues: string[] = [];

    if (health < 30) issues.push('critical_health');
    if (health < 60) issues.push('degraded_health');
    if (memoryUsage > 80) issues.push('high_memory');
    if (memoryUsage > 95) issues.push('memory_overflow_risk');

    const snapshot: AgentHealthSnapshot = {
      agentId, health,
      isOverworked: memoryUsage > 80 || health < 40,
      memoryUsage, lastActive: new Date(), issues,
    };
    this.healthSnapshots.set(agentId, snapshot);

    if (issues.length > 0) {
      this.issuesDetected += issues.length;
      issues.forEach(issue => {
        this.alertQueue.push({
          agentId, issue,
          severity: health < 30 ? 'critical' : 'warning',
          timestamp: new Date(),
        });
      });
    }

    return { agentId, health, issues, needsDoctorAttention: issues.length > 0 };
  }

  private performFullScan(): Record<string, any> {
    const results = Array.from(this.healthSnapshots.values());
    return {
      totalAgents: results.length,
      healthy: results.filter(r => r.health >= 70 && !r.isOverworked).length,
      degraded: results.filter(r => r.health >= 30 && r.health < 70).length,
      critical: results.filter(r => r.health < 30).length,
      overworked: results.filter(r => r.isOverworked).length,
      pendingAlerts: this.alertQueue.length,
    };
  }

  private getOverview(): Record<string, any> {
    return {
      checksPerformed: this.checksPerformed,
      issuesDetected: this.issuesDetected,
      agentsMonitored: this.healthSnapshots.size,
      pendingAlerts: this.alertQueue.length,
      status: 'watching_24x7',
    };
  }

  drainAlerts(): Array<{ agentId: string; issue: string; severity: string; timestamp: Date }> {
    const alerts = [...this.alertQueue];
    this.alertQueue = [];
    return alerts;
  }

  getStatus() {
    return this.getOverview();
  }
}

export const homeHealerNetwork = new HomeHealerNetwork();
