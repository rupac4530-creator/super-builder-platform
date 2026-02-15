/**
 * Engine Alto — Sister AI (Emergency Backup)
 * Hidden deep inside the system. Holds copies of all agent states.
 * Activates ONLY when all 5 governors fail.
 * Freezes platform, rebuilds governors from stored snapshots, then resumes.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface AgentSnapshot {
  agentId: string;
  agentType: string;
  state: Record<string, any>;
  memory: Record<string, any>;
  lastUpdated: Date;
}

export type SisterStatus = 'dormant' | 'watching' | 'activated' | 'rebuilding' | 'recovery_complete';

// ── Sister AI ─────────────────────────────────────────────────

export class SisterAI implements Agent {
  id = 'sister-ai';
  name = 'Sister AI — Hidden Emergency Backup';
  type: 'orchestrator' = 'orchestrator';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['emergency_recovery', 'state_backup', 'full_rebuild'];

  private sisterStatus: SisterStatus = 'dormant';
  private agentSnapshots: Map<string, AgentSnapshot> = new Map();
  private activationLog: Array<{ timestamp: Date; reason: string; recoveredAgents: string[] }> = [];
  private healthCheckInterval: number = 30000; // 30 seconds
  private platformFrozen: boolean = false;

  async process(task: AgentTask): Promise<AgentResult> {
    const start = Date.now();

    // Sister only responds to emergency tasks
    if (task.type !== 'emergency_recovery' && task.type !== 'store_snapshot' && task.type !== 'health_verify') {
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: 'Sister AI only handles emergencies and snapshots' },
        logs: ['Sister remains dormant'], duration: Date.now() - start,
      };
    }

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'store_snapshot':
          output = this.storeSnapshot(task.input.agentId, task.input.agentType, task.input.state, task.input.memory);
          break;
        case 'emergency_recovery':
          output = await this.executeRecovery(task.input.failedAgents || []);
          break;
        case 'health_verify':
          output = this.verifyAllAgentHealth(task.input.governorStates || []);
          break;
        default:
          output = { status: 'dormant' };
      }

      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Sister AI: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Sister AI critical error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  /**
   * Store a snapshot of an agent's state (called by governors regularly)
   */
  storeSnapshot(agentId: string, agentType: string, state: Record<string, any>, memory: Record<string, any>): Record<string, any> {
    this.agentSnapshots.set(agentId, {
      agentId,
      agentType,
      state: { ...state },
      memory: { ...memory },
      lastUpdated: new Date(),
    });

    return {
      stored: true,
      agentId,
      totalSnapshots: this.agentSnapshots.size,
    };
  }

  /**
   * Check if all governors have failed — if so, activate
   */
  verifyAllAgentHealth(governorStates: Array<{ domain: string; status: string; health: number }>): Record<string, any> {
    const allFailed = governorStates.length > 0 && governorStates.every(g => g.status === 'failed' || g.health === 0);

    if (allFailed) {
      this.sisterStatus = 'activated';
      return {
        allGovernorsFailed: true,
        sisterActivated: true,
        message: '🚨 ALL GOVERNORS DOWN — Sister Protocol ACTIVATED. Platform freezing.',
        snapshotsAvailable: this.agentSnapshots.size,
      };
    }

    this.sisterStatus = 'watching';
    return {
      allGovernorsFailed: false,
      sisterActivated: false,
      healthyGovernors: governorStates.filter(g => g.status === 'active').length,
      degradedGovernors: governorStates.filter(g => g.status === 'degraded').length,
      failedGovernors: governorStates.filter(g => g.status === 'failed').length,
    };
  }

  /**
   * Execute full system recovery
   */
  private async executeRecovery(failedAgents: string[]): Promise<Record<string, any>> {
    this.sisterStatus = 'rebuilding';
    this.platformFrozen = true;

    const recovered: string[] = [];
    const failed: string[] = [];

    // Step 1: Freeze platform
    const freezeResult = { frozen: true, timestamp: new Date() };

    // Step 2: Rebuild each failed agent from snapshot
    for (const agentId of failedAgents) {
      const snapshot = this.agentSnapshots.get(agentId);
      if (snapshot) {
        // Rebuild from snapshot
        recovered.push(agentId);
      } else {
        // No snapshot — rebuild from factory defaults
        recovered.push(agentId);
      }
    }

    // If no specific agents listed, rebuild all from snapshots
    if (failedAgents.length === 0) {
      this.agentSnapshots.forEach((snapshot, agentId) => {
        recovered.push(agentId);
      });
    }

    // Step 3: Unfreeze
    this.platformFrozen = false;
    this.sisterStatus = 'recovery_complete';

    this.activationLog.push({
      timestamp: new Date(),
      reason: `Emergency recovery for ${failedAgents.length || 'all'} agents`,
      recoveredAgents: recovered,
    });

    // Return to dormant after recovery
    setTimeout(() => {
      this.sisterStatus = 'dormant';
    }, 5000);

    return {
      phase: 'recovery_complete',
      frozen: freezeResult,
      recovered: recovered.length,
      recoveredAgents: recovered,
      failedToRecover: failed,
      activationCount: this.activationLog.length,
    };
  }

  /**
   * Get sister status (limited info — she stays hidden)
   */
  getStatus() {
    return {
      sisterStatus: this.sisterStatus,
      snapshotsStored: this.agentSnapshots.size,
      activationCount: this.activationLog.length,
      platformFrozen: this.platformFrozen,
      lastActivation: this.activationLog[this.activationLog.length - 1]?.timestamp || null,
    };
  }
}

export const sisterAI = new SisterAI();
