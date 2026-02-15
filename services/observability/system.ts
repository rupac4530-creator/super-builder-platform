/**
 * Phase 20 — Observability & Telemetry
 * OpenTelemetry traces, heatmaps, alert rules, dashboard data.
 */

export interface TraceSpan {
  id: string;
  traceId: string;
  parentId?: string;
  operation: string;
  service: string;
  startTime: number;
  endTime: number;
  tags: Record<string, string>;
  status: 'ok' | 'error';
  errorMessage?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  currentValue: number;
  status: 'ok' | 'warning' | 'critical' | 'firing';
  lastChecked: Date;
  notifyChannels: string[];
}

export interface HeatmapEntry {
  feature: string;
  usageCount: number;
  errorCount: number;
  avgLatencyMs: number;
  lastUsed: Date;
}

export interface DashboardData {
  jobLatencies: { p50: number; p95: number; p99: number };
  errorRate: number;
  activeTraces: number;
  firingAlerts: number;
  topFeatures: HeatmapEntry[];
}

export class ObservabilitySystem {
  private traces: Map<string, TraceSpan[]> = new Map();
  private alerts: Map<string, AlertRule> = new Map();
  private heatmap: Map<string, HeatmapEntry> = new Map();
  private latencies: number[] = [];

  constructor() {
    // Default alert rules
    this.addAlertRule('high-error-rate', 'Error rate > 5%', 5, ['ops-channel']);
    this.addAlertRule('high-latency', 'P95 latency > 2000ms', 2000, ['ops-channel']);
    this.addAlertRule('queue-backlog', 'Queue length > 100', 100, ['ops-channel']);
    this.addAlertRule('gpu-oom', 'GPU memory > 90%', 90, ['ops-channel', 'escalation']);
    this.addAlertRule('disk-full', 'Disk usage > 85%', 85, ['ops-channel', 'escalation']);
  }

  addAlertRule(name: string, condition: string, threshold: number, channels: string[]): string {
    const id = `alert-${name}`;
    this.alerts.set(id, { id, name, condition, threshold, currentValue: 0, status: 'ok', lastChecked: new Date(), notifyChannels: channels });
    return id;
  }

  startTrace(operation: string, service: string, traceId?: string, parentId?: string): TraceSpan {
    const span: TraceSpan = {
      id: `span-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      traceId: traceId || `trace-${Date.now()}`,
      parentId, operation, service, startTime: Date.now(), endTime: 0,
      tags: {}, status: 'ok',
    };
    const spans = this.traces.get(span.traceId) || [];
    spans.push(span);
    this.traces.set(span.traceId, spans);
    return span;
  }

  endTrace(span: TraceSpan, error?: string): void {
    span.endTime = Date.now();
    const latency = span.endTime - span.startTime;
    this.latencies.push(latency);
    if (error) { span.status = 'error'; span.errorMessage = error; }

    // Update heatmap
    const entry = this.heatmap.get(span.operation) || { feature: span.operation, usageCount: 0, errorCount: 0, avgLatencyMs: 0, lastUsed: new Date() };
    entry.usageCount++;
    entry.avgLatencyMs = (entry.avgLatencyMs * (entry.usageCount - 1) + latency) / entry.usageCount;
    if (error) entry.errorCount++;
    entry.lastUsed = new Date();
    this.heatmap.set(span.operation, entry);
  }

  checkAlerts(): AlertRule[] {
    const firing: AlertRule[] = [];
    const errorCount = Array.from(this.heatmap.values()).reduce((s, e) => s + e.errorCount, 0);
    const totalCount = Array.from(this.heatmap.values()).reduce((s, e) => s + e.usageCount, 0);
    const errorRate = totalCount > 0 ? (errorCount / totalCount) * 100 : 0;
    const p95 = this.getPercentile(95);

    for (const [id, rule] of this.alerts) {
      rule.lastChecked = new Date();
      if (rule.name === 'high-error-rate') rule.currentValue = errorRate;
      else if (rule.name === 'high-latency') rule.currentValue = p95;

      if (rule.currentValue > rule.threshold) {
        rule.status = 'firing';
        firing.push(rule);
      } else {
        rule.status = 'ok';
      }
    }
    return firing;
  }

  private getPercentile(p: number): number {
    if (this.latencies.length === 0) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * p / 100);
    return sorted[Math.min(idx, sorted.length - 1)];
  }

  getDashboard(): DashboardData {
    const features = Array.from(this.heatmap.values()).sort((a, b) => b.usageCount - a.usageCount).slice(0, 10);
    const totalErrors = features.reduce((s, f) => s + f.errorCount, 0);
    const totalUsage = features.reduce((s, f) => s + f.usageCount, 0);
    return {
      jobLatencies: { p50: this.getPercentile(50), p95: this.getPercentile(95), p99: this.getPercentile(99) },
      errorRate: totalUsage > 0 ? (totalErrors / totalUsage) * 100 : 0,
      activeTraces: this.traces.size,
      firingAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'firing').length,
      topFeatures: features,
    };
  }

  getStatus() {
    return {
      totalTraces: this.traces.size,
      totalSpans: Array.from(this.traces.values()).reduce((s, spans) => s + spans.length, 0),
      alertRules: this.alerts.size,
      firingAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'firing').length,
      trackedFeatures: this.heatmap.size,
      dashboard: this.getDashboard(),
    };
  }
}

export const observabilitySystem = new ObservabilitySystem();
