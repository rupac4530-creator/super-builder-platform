/**
 * Phase 18 — Scalability & Cost Controls
 * Worker autoscaler, per-user quotas, cost metering, spot GPU warm-start.
 */

export interface WorkerPool {
  id: string;
  type: 'cpu' | 'gpu' | 'inference';
  currentWorkers: number;
  minWorkers: number;
  maxWorkers: number;
  queueLength: number;
  avgLatencyMs: number;
}

export interface UserQuota {
  userId: string;
  jobsPerDay: number;
  jobsUsedToday: number;
  gpuMinutesPerDay: number;
  gpuMinutesUsedToday: number;
  tokensPerDay: number;
  tokensUsedToday: number;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface CostMeter {
  totalCpuMinutes: number;
  totalGpuMinutes: number;
  totalTokens: number;
  totalStorageMb: number;
  costPerCpuMinute: number;
  costPerGpuMinute: number;
  costPerToken: number;
  costPerStorageMbMonth: number;
}

export class ScalabilityController {
  private pools: Map<string, WorkerPool> = new Map();
  private quotas: Map<string, UserQuota> = new Map();
  private costMeter: CostMeter = {
    totalCpuMinutes: 0, totalGpuMinutes: 0, totalTokens: 0, totalStorageMb: 0,
    costPerCpuMinute: 0.001, costPerGpuMinute: 0.05, costPerToken: 0.00001, costPerStorageMbMonth: 0.0001,
  };
  private scaleEvents: { timestamp: Date; pool: string; action: string; from: number; to: number }[] = [];

  constructor() {
    this.pools.set('cpu-general', { id: 'cpu-general', type: 'cpu', currentWorkers: 4, minWorkers: 2, maxWorkers: 50, queueLength: 0, avgLatencyMs: 100 });
    this.pools.set('gpu-render', { id: 'gpu-render', type: 'gpu', currentWorkers: 1, minWorkers: 0, maxWorkers: 10, queueLength: 0, avgLatencyMs: 500 });
    this.pools.set('gpu-inference', { id: 'gpu-inference', type: 'inference', currentWorkers: 1, minWorkers: 0, maxWorkers: 8, queueLength: 0, avgLatencyMs: 300 });
  }

  autoScale(): { pool: string; action: 'scale-up' | 'scale-down'; newCount: number }[] {
    const actions: { pool: string; action: 'scale-up' | 'scale-down'; newCount: number }[] = [];
    for (const [id, pool] of this.pools) {
      const loadPerWorker = pool.currentWorkers > 0 ? pool.queueLength / pool.currentWorkers : pool.queueLength;
      if (loadPerWorker > 5 && pool.currentWorkers < pool.maxWorkers) {
        const from = pool.currentWorkers;
        pool.currentWorkers = Math.min(pool.maxWorkers, pool.currentWorkers + Math.ceil(loadPerWorker / 3));
        actions.push({ pool: id, action: 'scale-up', newCount: pool.currentWorkers });
        this.scaleEvents.push({ timestamp: new Date(), pool: id, action: 'scale-up', from, to: pool.currentWorkers });
      } else if (loadPerWorker < 1 && pool.currentWorkers > pool.minWorkers) {
        const from = pool.currentWorkers;
        pool.currentWorkers = Math.max(pool.minWorkers, pool.currentWorkers - 1);
        actions.push({ pool: id, action: 'scale-down', newCount: pool.currentWorkers });
        this.scaleEvents.push({ timestamp: new Date(), pool: id, action: 'scale-down', from, to: pool.currentWorkers });
      }
    }
    return actions;
  }

  setUserQuota(userId: string, tier: UserQuota['tier']): void {
    const limits = { free: { jobs: 10, gpu: 5, tokens: 10000 }, pro: { jobs: 100, gpu: 60, tokens: 500000 }, enterprise: { jobs: 10000, gpu: 1440, tokens: 50000000 } };
    const l = limits[tier];
    this.quotas.set(userId, {
      userId, tier, jobsPerDay: l.jobs, jobsUsedToday: 0,
      gpuMinutesPerDay: l.gpu, gpuMinutesUsedToday: 0,
      tokensPerDay: l.tokens, tokensUsedToday: 0,
    });
  }

  checkQuota(userId: string): { allowed: boolean; reason?: string } {
    const quota = this.quotas.get(userId);
    if (!quota) return { allowed: true }; // No quota = no limit
    if (quota.jobsUsedToday >= quota.jobsPerDay) return { allowed: false, reason: 'Daily job limit reached' };
    if (quota.gpuMinutesUsedToday >= quota.gpuMinutesPerDay) return { allowed: false, reason: 'GPU minute limit reached' };
    return { allowed: true };
  }

  recordUsage(userId: string, cpuMinutes: number = 0, gpuMinutes: number = 0, tokens: number = 0): void {
    this.costMeter.totalCpuMinutes += cpuMinutes;
    this.costMeter.totalGpuMinutes += gpuMinutes;
    this.costMeter.totalTokens += tokens;
    const quota = this.quotas.get(userId);
    if (quota) {
      quota.jobsUsedToday++;
      quota.gpuMinutesUsedToday += gpuMinutes;
      quota.tokensUsedToday += tokens;
    }
  }

  getTotalCost(): number {
    return this.costMeter.totalCpuMinutes * this.costMeter.costPerCpuMinute +
      this.costMeter.totalGpuMinutes * this.costMeter.costPerGpuMinute +
      this.costMeter.totalTokens * this.costMeter.costPerToken +
      this.costMeter.totalStorageMb * this.costMeter.costPerStorageMbMonth;
  }

  getStatus() {
    return {
      pools: Object.fromEntries(Array.from(this.pools.entries()).map(([k, v]) => [k, { workers: v.currentWorkers, queue: v.queueLength }])),
      activeQuotas: this.quotas.size,
      scaleEvents: this.scaleEvents.length,
      totalCost: this.getTotalCost().toFixed(4),
      costMeter: this.costMeter,
    };
  }
}

export const scalabilityController = new ScalabilityController();
