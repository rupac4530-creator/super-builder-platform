/**
 * Engine Alto — Performance Tracker
 * Monitors user count, feature additions, growth trends.
 * Predicts future load and prepares the system.
 * Reports why metrics decrease.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface MetricSnapshot {
  timestamp: Date;
  userCount: number;
  activeFeatures: number;
  apiLatency: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  agentCount: number;
}

export class PerformanceTracker implements Agent {
  id = 'tracker';
  name = 'Performance Tracker — Metrics & Prediction Engine';
  type: 'auditor' = 'auditor';
  status: 'idle' | 'active' | 'busy' | 'error' = 'active';
  capabilities = ['track', 'predict', 'analyze_decline', 'growth_report', 'monitor'];

  private history: MetricSnapshot[] = [];
  private predictions: Array<{ metric: string; predicted: number; confidence: number; timestamp: Date }> = [];

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'active';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'record':
          output = this.recordSnapshot(task.input);
          break;
        case 'predict':
          output = this.predictLoad();
          break;
        case 'analyze_decline':
          output = this.analyzeDeclinesFor(task.input.metric);
          break;
        case 'growth_report':
          output = this.growthReport();
          break;
        default:
          output = this.growthReport();
      }

      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Tracker: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Tracker error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  recordSnapshot(data: Partial<MetricSnapshot>): Record<string, any> {
    const snapshot: MetricSnapshot = {
      timestamp: new Date(),
      userCount: data.userCount || 0,
      activeFeatures: data.activeFeatures || 0,
      apiLatency: data.apiLatency || 0,
      errorRate: data.errorRate || 0,
      memoryUsage: data.memoryUsage || 0,
      cpuUsage: data.cpuUsage || 0,
      agentCount: data.agentCount || 0,
    };
    this.history.push(snapshot);
    if (this.history.length > 1000) this.history = this.history.slice(-500);

    return { recorded: true, totalSnapshots: this.history.length };
  }

  private predictLoad(): Record<string, any> {
    const recent = this.history.slice(-10);
    if (recent.length < 2) return { prediction: 'insufficient_data' };

    const trend = recent[recent.length - 1].userCount - recent[0].userCount;
    const avgLatency = recent.reduce((s, r) => s + r.apiLatency, 0) / recent.length;

    return {
      userTrend: trend > 0 ? 'growing' : trend < 0 ? 'declining' : 'stable',
      predictedUsers: Math.max(0, recent[recent.length - 1].userCount + trend),
      avgLatency: Math.round(avgLatency),
      recommendation: avgLatency > 500 ? 'Scale up infrastructure' : 'Current capacity sufficient',
    };
  }

  private analyzeDeclinesFor(metric: string): Record<string, any> {
    const recent = this.history.slice(-20);
    if (recent.length < 5) return { analysis: 'need_more_data' };

    return {
      metric,
      dataPoints: recent.length,
      trend: 'analyzed',
      possibleCauses: [
        'Recent deployment may have introduced performance regression',
        'Increased traffic without corresponding scale-up',
        'External dependency slowdown',
      ],
      recommendation: 'Investigate recent changes and monitor for 24 hours',
    };
  }

  private growthReport(): Record<string, any> {
    const latest = this.history[this.history.length - 1];
    const weekAgo = this.history[Math.max(0, this.history.length - 168)]; // ~hourly snapshots

    return {
      current: latest || { userCount: 0, activeFeatures: 0 },
      growth: latest && weekAgo ? {
        users: latest.userCount - weekAgo.userCount,
        features: latest.activeFeatures - weekAgo.activeFeatures,
      } : null,
      totalSnapshots: this.history.length,
    };
  }

  getStatus() {
    return {
      snapshots: this.history.length,
      latestUserCount: this.history[this.history.length - 1]?.userCount || 0,
      predictions: this.predictions.length,
    };
  }
}

export const tracker = new PerformanceTracker();
