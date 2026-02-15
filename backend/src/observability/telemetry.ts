/**
 * Engine Alto — OpenTelemetry + Prometheus Observability
 * Provides distributed tracing, metrics collection, and health monitoring.
 */

import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Metrics collector
// ---------------------------------------------------------------------------

interface MetricEntry {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

class MetricsCollector {
  private metrics: Map<string, MetricEntry> = new Map();
  private histograms: Map<string, number[]> = new Map();

  counter(name: string, labels: Record<string, string> = {}) {
    const key = `${name}:${JSON.stringify(labels)}`;
    const existing = this.metrics.get(key);
    this.metrics.set(key, {
      name, type: 'counter',
      value: (existing?.value || 0) + 1,
      labels, timestamp: Date.now(),
    });
  }

  gauge(name: string, value: number, labels: Record<string, string> = {}) {
    const key = `${name}:${JSON.stringify(labels)}`;
    this.metrics.set(key, { name, type: 'gauge', value, labels, timestamp: Date.now() });
  }

  histogram(name: string, value: number, labels: Record<string, string> = {}) {
    const key = `${name}:${JSON.stringify(labels)}`;
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    this.histograms.get(key)!.push(value);
    // Store p50, p95, p99
    const sorted = [...this.histograms.get(key)!].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    this.metrics.set(key, {
      name, type: 'histogram', value: p50, labels: { ...labels, p50: String(p50), p95: String(p95), p99: String(p99) },
      timestamp: Date.now(),
    });
  }

  // Prometheus text format export
  toPrometheus(): string {
    const lines: string[] = [];
    const grouped = new Map<string, MetricEntry[]>();

    for (const entry of this.metrics.values()) {
      if (!grouped.has(entry.name)) grouped.set(entry.name, []);
      grouped.get(entry.name)!.push(entry);
    }

    for (const [name, entries] of grouped) {
      lines.push(`# TYPE ${name} ${entries[0].type}`);
      for (const entry of entries) {
        const labelStr = Object.entries(entry.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',');
        lines.push(`${name}{${labelStr}} ${entry.value}`);
      }
    }
    return lines.join('\n');
  }

  toJSON() {
    return Object.fromEntries(this.metrics);
  }
}

// ---------------------------------------------------------------------------
// Distributed Tracer (OpenTelemetry-compatible spans)
// ---------------------------------------------------------------------------

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  service: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error' | 'unset';
  attributes: Record<string, string | number | boolean>;
  events: Array<{ name: string; timestamp: number; attributes?: Record<string, unknown> }>;
}

class Tracer {
  private spans: Span[] = [];
  private maxSpans = 10000;

  startSpan(name: string, options: { parentSpanId?: string; service?: string; attributes?: Record<string, string | number | boolean> } = {}): Span {
    const span: Span = {
      traceId: this.generateId(32),
      spanId: this.generateId(16),
      parentSpanId: options.parentSpanId,
      name,
      service: options.service || 'engine-alto',
      startTime: Date.now(),
      status: 'unset',
      attributes: options.attributes || {},
      events: [],
    };
    return span;
  }

  endSpan(span: Span, status: 'ok' | 'error' = 'ok') {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    this.spans.push(span);
    if (this.spans.length > this.maxSpans) {
      this.spans = this.spans.slice(-this.maxSpans / 2);
    }
  }

  getRecentSpans(limit = 100): Span[] {
    return this.spans.slice(-limit);
  }

  getSpansByTrace(traceId: string): Span[] {
    return this.spans.filter(s => s.traceId === traceId);
  }

  // Jaeger-compatible export format
  toJaeger() {
    return {
      data: this.spans.map(span => ({
        traceID: span.traceId,
        spans: [{
          traceID: span.traceId,
          spanID: span.spanId,
          parentSpanID: span.parentSpanId || '',
          operationName: span.name,
          references: span.parentSpanId ? [{ refType: 'CHILD_OF', traceID: span.traceId, spanID: span.parentSpanId }] : [],
          startTime: span.startTime * 1000,  // microseconds
          duration: (span.duration || 0) * 1000,
          tags: Object.entries(span.attributes).map(([key, value]) => ({ key, type: typeof value, value })),
          logs: span.events.map(e => ({ timestamp: e.timestamp * 1000, fields: [{ key: 'event', type: 'string', value: e.name }] })),
          processID: 'p1',
        }],
        processes: { p1: { serviceName: span.service, tags: [] } },
      })),
    };
  }

  private generateId(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// System metrics collector (auto-updating)
// ---------------------------------------------------------------------------

function collectSystemMetrics(metrics: MetricsCollector) {
  const mem = process.memoryUsage();
  metrics.gauge('process_heap_used_bytes', mem.heapUsed, { service: 'engine-alto' });
  metrics.gauge('process_heap_total_bytes', mem.heapTotal, { service: 'engine-alto' });
  metrics.gauge('process_rss_bytes', mem.rss, { service: 'engine-alto' });
  metrics.gauge('process_uptime_seconds', process.uptime(), { service: 'engine-alto' });

  const cpuUsage = process.cpuUsage();
  metrics.gauge('process_cpu_user_microseconds', cpuUsage.user, { service: 'engine-alto' });
  metrics.gauge('process_cpu_system_microseconds', cpuUsage.system, { service: 'engine-alto' });
}

// ---------------------------------------------------------------------------
// Singleton exports
// ---------------------------------------------------------------------------

export const metrics = new MetricsCollector();
export const tracer = new Tracer();

// Auto-collect system metrics every 15 seconds
setInterval(() => collectSystemMetrics(metrics), 15000);
collectSystemMetrics(metrics);

logger.info('[Observability] Metrics collector and tracer initialized');

export { MetricsCollector, Tracer, Span, MetricEntry };
