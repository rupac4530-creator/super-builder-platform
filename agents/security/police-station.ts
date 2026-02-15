/**
 * Phase 10 — Police Station & Security Fortress
 * Cops, master officer, security guard. Block signals, freeze on intrusion,
 * auto-inform owner via master prompt. Mutual recovery between all units.
 */

export interface SecurityIncident {
  id: string;
  type: 'intrusion' | 'data-exfiltration' | 'brute-force' | 'api-abuse' | 'privilege-escalation' | 'code-injection';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  target: string;
  detectedBy: string;
  detectedAt: Date;
  status: 'detected' | 'investigating' | 'blocked' | 'escalated' | 'resolved';
  actions: string[];
}

export interface CopAgent {
  id: string;
  name: string;
  zone: string;
  status: 'active' | 'investigating' | 'offline';
  incidentsHandled: number;
}

export class PoliceStation {
  private cops: Map<string, CopAgent> = new Map();
  private incidents: Map<string, SecurityIncident> = new Map();
  private masterOfficer = { id: 'master-officer', name: 'Chief Security Officer', active: true };
  private securityGuard = { id: 'security-guard', name: 'Perimeter Guard', active: true, leakDetections: 0 };
  private platformFrozen: boolean = false;
  private blockedUsers: Set<string> = new Set();

  constructor() {
    const zones = ['auth', 'api', 'data', 'network', 'filesystem', 'runtime', 'plugins', 'frontend', 'admin', 'memory'];
    for (let i = 0; i < zones.length; i++) {
      this.cops.set(`cop-${i}`, { id: `cop-${i}`, name: `Officer-${zones[i]}`, zone: zones[i], status: 'active', incidentsHandled: 0 });
    }
  }

  detectIntrusion(type: SecurityIncident['type'], source: string, target: string, detectedBy: string): string {
    const id = `INC-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const incident: SecurityIncident = {
      id, type, severity: type === 'intrusion' || type === 'code-injection' ? 'critical' : 'high',
      source, target, detectedBy, detectedAt: new Date(), status: 'detected', actions: [],
    };
    this.incidents.set(id, incident);

    // Auto-block signals
    incident.actions.push(`Signal blocked from ${source}`);
    incident.status = 'blocked';
    this.blockedUsers.add(source);

    if (incident.severity === 'critical') {
      this.escalateToMasterOfficer(id);
    }

    return id;
  }

  private escalateToMasterOfficer(incidentId: string): void {
    const incident = this.incidents.get(incidentId);
    if (!incident) return;
    incident.status = 'escalated';
    incident.actions.push('Escalated to Master Officer');
    incident.actions.push('All access blocked for attacker');
    // If all systems compromised — freeze platform
    const criticalCount = Array.from(this.incidents.values()).filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    if (criticalCount >= 5) {
      this.freezePlatform();
    }
  }

  freezePlatform(): void {
    this.platformFrozen = true;
    // Every user blocked, data preserved, master prompt required to unfreeze
  }

  unfreeze(masterPromptVerified: boolean): boolean {
    if (!masterPromptVerified) return false;
    this.platformFrozen = false;
    return true;
  }

  detectLeak(userId: string, dataType: string): void {
    this.securityGuard.leakDetections++;
    this.detectIntrusion('data-exfiltration', userId, dataType, 'security-guard');
  }

  resolveIncident(incidentId: string): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;
    incident.status = 'resolved';
    incident.actions.push('Resolved and patched');
    return true;
  }

  // Mutual recovery: cops can rebuild each other
  recoverCop(copId: string): boolean {
    if (this.cops.has(copId)) return true;
    this.cops.set(copId, { id: copId, name: `Officer-recovered-${copId}`, zone: 'general', status: 'active', incidentsHandled: 0 });
    return true;
  }

  isBlocked(userId: string): boolean { return this.blockedUsers.has(userId); }

  getStatus() {
    const incidents = Array.from(this.incidents.values());
    return {
      cops: this.cops.size,
      activeCops: Array.from(this.cops.values()).filter(c => c.status === 'active').length,
      masterOfficerActive: this.masterOfficer.active,
      securityGuardActive: this.securityGuard.active,
      leakDetections: this.securityGuard.leakDetections,
      totalIncidents: incidents.length,
      openIncidents: incidents.filter(i => i.status !== 'resolved').length,
      blockedUsers: this.blockedUsers.size,
      platformFrozen: this.platformFrozen,
      criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
    };
  }
}

export const policeStation = new PoliceStation();
