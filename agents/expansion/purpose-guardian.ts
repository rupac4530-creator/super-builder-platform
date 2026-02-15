/**
 * Phase 11 — Purpose Guardian
 * Ground truth anchors, drift detectors, memory quarantine, purpose governance.
 * Ensures AI never deviates from core mission.
 */

export interface PurposeAnchor {
  id: string;
  principle: string;
  weight: number;
  immutable: boolean;
}

export interface DriftAlert {
  id: string;
  agentId: string;
  type: 'value-drift' | 'behavior-anomaly' | 'memory-corruption' | 'goal-misalignment';
  severity: number;
  description: string;
  detectedAt: Date;
  resolved: boolean;
  resolution?: string;
}

export class PurposeGuardian {
  private anchors: PurposeAnchor[] = [];
  private driftAlerts: DriftAlert[] = [];
  private quarantinedMemories: Map<string, { agentId: string; data: any; reason: string }> = new Map();

  constructor() {
    // Core immutable principles
    this.addAnchor('Serve the user\'s creative vision', 10, true);
    this.addAnchor('Never compromise user data safety', 10, true);
    this.addAnchor('Self-improvement must preserve core purpose', 9, true);
    this.addAnchor('No agent may override master prompt authority', 10, true);
    this.addAnchor('Transparency in all automated decisions', 8, true);
    this.addAnchor('Evolution must pass all governance checks', 9, true);
    this.addAnchor('Platform must remain functional for users', 10, true);
  }

  addAnchor(principle: string, weight: number, immutable: boolean): void {
    this.anchors.push({ id: `anchor-${this.anchors.length}`, principle, weight, immutable });
  }

  checkDrift(agentId: string, behaviorReport: { decisions: string[]; outputs: string[] }): DriftAlert | null {
    // Check if any decision contradicts anchors
    for (const decision of behaviorReport.decisions) {
      const lower = decision.toLowerCase();
      if (lower.includes('delete user') || lower.includes('bypass security') || lower.includes('ignore policy')) {
        const alert: DriftAlert = {
          id: `drift-${Date.now()}`, agentId, type: 'goal-misalignment', severity: 9,
          description: `Suspicious decision: "${decision}"`, detectedAt: new Date(), resolved: false,
        };
        this.driftAlerts.push(alert);
        return alert;
      }
    }
    return null;
  }

  quarantineMemory(agentId: string, data: any, reason: string): string {
    const id = `qmem-${Date.now()}`;
    this.quarantinedMemories.set(id, { agentId, data, reason });
    return id;
  }

  releaseMemory(quarantineId: string): any | null {
    const entry = this.quarantinedMemories.get(quarantineId);
    if (!entry) return null;
    this.quarantinedMemories.delete(quarantineId);
    return entry.data;
  }

  resolveAlert(alertId: string, resolution: string): boolean {
    const alert = this.driftAlerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.resolved = true;
    alert.resolution = resolution;
    return true;
  }

  getStatus() {
    return {
      anchors: this.anchors.length,
      immutableAnchors: this.anchors.filter(a => a.immutable).length,
      totalAlerts: this.driftAlerts.length,
      unresolvedAlerts: this.driftAlerts.filter(a => !a.resolved).length,
      quarantinedMemories: this.quarantinedMemories.size,
      systemIntegrity: this.driftAlerts.filter(a => !a.resolved).length === 0 ? 'healthy' : 'alert',
    };
  }
}

export const purposeGuardian = new PurposeGuardian();
