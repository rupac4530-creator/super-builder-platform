/**
 * Engine Alto — OpenTelemetry + Prometheus Telemetry Service
 * Traces, spans, metrics, and dashboard data.
 */
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: number;
  duration: number;
  status: 'ok' | 'error';
  attributes: Record<string, string | number>;
  events: { name: string; timestamp: number; attributes?: Record<string, string> }[];
}

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

export class TelemetryService {
  private spans: Span[] = [];
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();

  startSpan(operationName: string, serviceName: string, parentSpanId?: string): Span {
    const span: Span = {
      traceId: `trace_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      spanId: `span_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      parentSpanId, operationName, serviceName,
      startTime: Date.now(), duration: 0, status: 'ok', attributes: {}, events: [],
    };
    return span;
  }

  endSpan(span: Span, status: 'ok' | 'error' = 'ok'): void {
    span.duration = Date.now() - span.startTime;
    span.status = status;
    this.spans.push(span);
    if (this.spans.length > 50000) this.spans = this.spans.slice(-25000);
    this.incrementCounter('spans_total', { service: span.serviceName });
    this.recordHistogram('span_duration_ms', span.duration, { operation: span.operationName });
  }

  incrementCounter(name: string, labels: Record<string, string> = {}, value = 1): void {
    const key = `${name}:${JSON.stringify(labels)}`;
    this.counters.set(key, (this.counters.get(key) || 0) + value);
    this.recordMetric({ name, type: 'counter', value: this.counters.get(key)!, labels, timestamp: Date.now() });
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = `${name}:${JSON.stringify(labels)}`;
    this.gauges.set(key, value);
    this.recordMetric({ name, type: 'gauge', value, labels, timestamp: Date.now() });
  }

  recordHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    this.recordMetric({ name, type: 'histogram', value, labels, timestamp: Date.now() });
  }

  // Prometheus-compatible /metrics endpoint text
  getPrometheusMetrics(): string {
    const lines: string[] = [];
    for (const [key, val] of this.counters) {
      const [name, labelsStr] = key.split(':');
      const labels = JSON.parse(labelsStr || '{}');
      const labelStr = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',');
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name}{${labelStr}} ${val}`);
    }
    for (const [key, val] of this.gauges) {
      const [name, labelsStr] = key.split(':');
      const labels = JSON.parse(labelsStr || '{}');
      const labelStr = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',');
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name}{${labelStr}} ${val}`);
    }
    return lines.join('\n');
  }

  getRecentSpans(limit = 50, serviceName?: string): Span[] {
    let spans = this.spans;
    if (serviceName) spans = spans.filter(s => s.serviceName === serviceName);
    return spans.slice(-limit);
  }

  getDashboardData(): { totalSpans: number; errorRate: number; avgDuration: number; activeServices: string[]; throughput: number } {
    const recent = this.spans.slice(-1000);
    const errors = recent.filter(s => s.status === 'error').length;
    const avgDur = recent.length > 0 ? recent.reduce((s, sp) => s + sp.duration, 0) / recent.length : 0;
    const services = [...new Set(recent.map(s => s.serviceName))];
    return { totalSpans: this.spans.length, errorRate: recent.length > 0 ? errors / recent.length : 0, avgDuration: Math.round(avgDur), activeServices: services, throughput: recent.length };
  }

  private recordMetric(metric: Metric): void {
    if (!this.metrics.has(metric.name)) this.metrics.set(metric.name, []);
    const arr = this.metrics.get(metric.name)!;
    arr.push(metric);
    if (arr.length > 10000) arr.splice(0, 5000);
  }
}

export const telemetryService = new TelemetryService();
export default telemetryService;
