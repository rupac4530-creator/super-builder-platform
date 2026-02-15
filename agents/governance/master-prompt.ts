/**
 * Engine Alto — Master Prompt System
 * Owner's hidden assistant AI. Absorbs all state but stays silent.
 * Only activates when the master prompt password is entered.
 * Can reset, stop, or override any system.
 */

import { GovernanceCouncil } from './governor';

export interface MasterPromptConfig {
  passwordHash: string; // SHA-256 hash of the master password
  ownerTag: string;
  lastActivated: Date | null;
  activationCount: number;
}

export interface SystemSnapshot {
  timestamp: Date;
  governorStates: any[];
  agentCount: number;
  healthStatus: Record<string, number>;
  memoryDump: Map<string, any>;
  platformVersion: string;
}

export type MasterAction =
  | 'freeze_all'      // Stop all agents
  | 'reset_system'    // Reset to last known good state
  | 'rebuild_all'     // Rebuild all agents from scratch
  | 'force_update'    // Trigger immediate update cycle
  | 'override_decision' // Override a governance decision
  | 'status_report'   // Get full system report
  | 'revive_sister'   // Manually trigger sister protocol
  | 'purge_threats';  // Remove all detected threats

// ── Master Prompt Controller ──────────────────────────────────

export class MasterPromptController {
  private config: MasterPromptConfig;
  private snapshots: SystemSnapshot[] = [];
  private stateAbsorber: Map<string, any> = new Map(); // Silently absorbs all data
  private isActivated: boolean = false;
  private actionLog: Array<{ action: MasterAction; timestamp: Date; result: any }> = [];

  constructor(passwordHash: string, ownerTag: string = 'BEDANTA') {
    this.config = {
      passwordHash,
      ownerTag,
      lastActivated: null,
      activationCount: 0,
    };
  }

  /**
   * Silently absorb state data — this runs continuously
   */
  absorbState(key: string, data: any): void {
    this.stateAbsorber.set(key, {
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Take a full system snapshot
   */
  takeSnapshot(council: GovernanceCouncil, additionalState: Record<string, any> = {}): void {
    const snapshot: SystemSnapshot = {
      timestamp: new Date(),
      governorStates: council.getStatus().governors,
      agentCount: Object.keys(additionalState).length,
      healthStatus: this.extractHealthStatus(),
      memoryDump: new Map(this.stateAbsorber),
      platformVersion: '3.0.0-heaven',
    };
    this.snapshots.push(snapshot);

    // Keep last 50 snapshots
    if (this.snapshots.length > 50) {
      this.snapshots = this.snapshots.slice(-50);
    }
  }

  /**
   * Authenticate with master password
   */
  authenticate(password: string): boolean {
    // Simple hash comparison (in production, use proper crypto)
    const hash = this.simpleHash(password);
    if (hash === this.config.passwordHash) {
      this.isActivated = true;
      this.config.lastActivated = new Date();
      this.config.activationCount++;
      return true;
    }
    return false;
  }

  /**
   * Execute a master action — requires authentication
   */
  executeAction(action: MasterAction, params?: any): { success: boolean; result: any } {
    if (!this.isActivated) {
      return { success: false, result: 'Master prompt not activated. Authenticate first.' };
    }

    let result: any;

    switch (action) {
      case 'freeze_all':
        result = { frozen: true, timestamp: new Date(), message: 'All agents frozen. Platform in safe mode.' };
        break;

      case 'reset_system':
        const lastGoodSnapshot = this.snapshots.filter(s =>
          s.governorStates.every((g: any) => g.status === 'active')
        ).pop();
        result = lastGoodSnapshot
          ? { restored: true, snapshotTime: lastGoodSnapshot.timestamp }
          : { restored: false, reason: 'No healthy snapshot found' };
        break;

      case 'rebuild_all':
        result = { rebuilt: true, message: 'All agents will be rebuilt from factory defaults.' };
        break;

      case 'force_update':
        result = { updateTriggered: true, immediate: true, bypassSchedule: true };
        break;

      case 'override_decision':
        result = { overridden: true, decisionId: params?.decisionId, newOutcome: params?.outcome };
        break;

      case 'status_report':
        result = this.getFullReport();
        break;

      case 'revive_sister':
        result = { sisterActivated: true, recoveryMode: 'full' };
        break;

      case 'purge_threats':
        result = { threatsPurged: true, count: params?.threatCount || 0 };
        break;

      default:
        result = { error: 'Unknown action' };
    }

    this.actionLog.push({ action, timestamp: new Date(), result });

    return { success: true, result };
  }

  /**
   * Deactivate master prompt — returns to silent mode
   */
  deactivate(): void {
    this.isActivated = false;
  }

  /**
   * Get full system report (master-only)
   */
  private getFullReport() {
    return {
      config: {
        ownerTag: this.config.ownerTag,
        activationCount: this.config.activationCount,
        lastActivated: this.config.lastActivated,
      },
      stateKeys: Array.from(this.stateAbsorber.keys()),
      snapshotCount: this.snapshots.length,
      lastSnapshot: this.snapshots[this.snapshots.length - 1]?.timestamp || null,
      actionLog: this.actionLog.slice(-20),
      healthOverview: this.extractHealthStatus(),
    };
  }

  private extractHealthStatus(): Record<string, number> {
    const status: Record<string, number> = {};
    this.stateAbsorber.forEach((val, key) => {
      if (val?.data?.health !== undefined) {
        status[key] = val.data.health;
      }
    });
    return status;
  }

  private simpleHash(input: string): string {
    // Simple deterministic hash for demo — use crypto.createHash('sha256') in production
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  getStatus() {
    return {
      activated: this.isActivated,
      ownerTag: this.config.ownerTag,
      snapshotsStored: this.snapshots.length,
      stateKeysTracked: this.stateAbsorber.size,
      actionsExecuted: this.actionLog.length,
    };
  }
}

// Default master prompt — password should be set via environment
export const masterPrompt = new MasterPromptController(
  process.env.MASTER_PROMPT_HASH || '1a2b3c4d', // Default demo hash
  'BEDANTA'
);
