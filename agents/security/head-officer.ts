/**
 * Phase 0 — Head Officer (Master Cop)
 * Central security coordinator: blocks signals from attackers, triggers emergency updates,
 * filters security reports (like Navigator but for security).
 */

export interface SecuritySignal {
  id: string;
  source: string;
  type: 'intrusion' | 'brute-force' | 'data-exfil' | 'privilege-escalation' | 'api-abuse' | 'dos' | 'injection';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  data: Record<string, any>;
  blocked: boolean;
}

export interface SecurityReport {
  id: string;
  from: string;
  type: 'pen-test' | 'vulnerability' | 'incident' | 'audit' | 'compliance';
  priority: number;
  summary: string;
  actionRequired: boolean;
  assignedTo?: string;
  status: 'unread' | 'triaged' | 'dispatched' | 'resolved';
  createdAt: Date;
}

export class HeadOfficer {
  readonly name = 'HeadOfficer';
  readonly role = 'Master Cop — Central Security Coordinator';
  private status: 'active' | 'alert' | 'emergency' = 'active';
  private blockedSignals: SecuritySignal[] = [];
  private reports: SecurityReport[] = [];
  private blockedSources: Set<string> = new Set();
  private emergencyUpdatesTriggered: number = 0;
  private totalSignalsProcessed: number = 0;
  private totalSignalsBlocked: number = 0;

  // Process incoming signal — block if from known attacker or suspicious
  processSignal(signal: SecuritySignal): { blocked: boolean; reason?: string } {
    this.totalSignalsProcessed++;

    // Block if source is already blacklisted
    if (this.blockedSources.has(signal.source)) {
      signal.blocked = true;
      this.blockedSignals.push(signal);
      this.totalSignalsBlocked++;
      return { blocked: true, reason: `Source ${signal.source} is blacklisted` };
    }

    // Auto-block critical severity signals
    if (signal.severity === 'critical') {
      signal.blocked = true;
      this.blockedSources.add(signal.source);
      this.blockedSignals.push(signal);
      this.totalSignalsBlocked++;
      this.status = 'alert';

      // Auto-trigger emergency update on critical attack
      this.triggerEmergencyUpdate(signal);
      return { blocked: true, reason: `Critical attack blocked, source blacklisted` };
    }

    // Block high-severity injection/privilege-escalation
    if (signal.severity === 'high' && ['injection', 'privilege-escalation', 'data-exfil'].includes(signal.type)) {
      signal.blocked = true;
      this.blockedSources.add(signal.source);
      this.blockedSignals.push(signal);
      this.totalSignalsBlocked++;
      return { blocked: true, reason: `High-severity ${signal.type} blocked` };
    }

    signal.blocked = false;
    return { blocked: false };
  }

  // Trigger emergency update — notifies all departments
  private triggerEmergencyUpdate(signal: SecuritySignal): void {
    this.emergencyUpdatesTriggered++;
    this.status = 'emergency';
    // In production: would trigger update-pipeline emergency patch cycle
  }

  // Filter reports like Navigator does for intelligence — triage and dispatch
  triageReport(report: SecurityReport): SecurityReport {
    report.status = 'triaged';

    // Critical/high → dispatch to doctors immediately
    if (report.priority >= 8) {
      report.assignedTo = 'SecurityDoctor';
      report.status = 'dispatched';
    } else if (report.priority >= 5) {
      report.assignedTo = 'CopPatrol';
      report.status = 'dispatched';
    }
    // Low-priority → acknowledged but not dispatched

    this.reports.push(report);
    return report;
  }

  // Submit a pen-test report from ethical hackers
  receivePenTestReport(hackerId: string, summary: string, priority: number): string {
    const id = `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const report: SecurityReport = {
      id, from: hackerId, type: 'pen-test', priority, summary,
      actionRequired: priority >= 7, status: 'unread', createdAt: new Date(),
    };
    return this.triageReport(report).id;
  }

  // Manual blacklist
  blacklistSource(source: string): void {
    this.blockedSources.add(source);
  }

  // Unblock after investigation
  unblockSource(source: string): boolean {
    return this.blockedSources.delete(source);
  }

  // Reset from emergency to active (requires master prompt verification)
  resetEmergency(): void {
    this.status = 'active';
  }

  getStatus() {
    return {
      name: this.name,
      role: this.role,
      status: this.status,
      totalSignalsProcessed: this.totalSignalsProcessed,
      totalSignalsBlocked: this.totalSignalsBlocked,
      blockedSources: this.blockedSources.size,
      pendingReports: this.reports.filter(r => r.status === 'unread' || r.status === 'triaged').length,
      dispatchedReports: this.reports.filter(r => r.status === 'dispatched').length,
      resolvedReports: this.reports.filter(r => r.status === 'resolved').length,
      emergencyUpdatesTriggered: this.emergencyUpdatesTriggered,
    };
  }
}

export const headOfficer = new HeadOfficer();
