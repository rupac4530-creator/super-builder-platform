/**
 * Engine Alto — AI Cost & Usage Tracker
 * Per-user budgets, monthly limits, token accounting, and usage analytics.
 */

export interface UsageRecord {
  id: string;
  userId: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface UserBudget {
  userId: string;
  monthlyLimitUsd: number;
  currentMonthSpent: number;
  totalSpent: number;
  totalRequests: number;
  lastReset: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
  byModel: Record<string, { requests: number; tokens: number; cost: number }>;
  byDay: Record<string, { requests: number; cost: number }>;
}

export class CostTracker {
  private records: UsageRecord[] = [];
  private budgets: Map<string, UserBudget> = new Map();
  private globalMonthlyLimit: number;
  private counter = 0;

  constructor(globalMonthlyLimitUsd: number = 100) {
    this.globalMonthlyLimit = globalMonthlyLimitUsd;
  }

  /**
   * Record a usage event and return whether it's within budget.
   */
  record(params: Omit<UsageRecord, 'id' | 'timestamp'>): { allowed: boolean; record: UsageRecord; remaining: number } {
    const record: UsageRecord = {
      ...params,
      id: `usage_${++this.counter}_${Date.now()}`,
      timestamp: Date.now(),
    };

    // Get or create user budget
    const budget = this.getOrCreateBudget(params.userId);
    this.maybeResetMonthly(budget);

    // Check limits
    const newTotal = budget.currentMonthSpent + params.cost;
    if (newTotal > budget.monthlyLimitUsd) {
      return {
        allowed: false,
        record,
        remaining: Math.max(0, budget.monthlyLimitUsd - budget.currentMonthSpent),
      };
    }

    // Apply
    budget.currentMonthSpent = newTotal;
    budget.totalSpent += params.cost;
    budget.totalRequests++;
    this.records.push(record);

    return {
      allowed: true,
      record,
      remaining: budget.monthlyLimitUsd - newTotal,
    };
  }

  /**
   * Check remaining budget for user without recording.
   */
  checkBudget(userId: string): { remaining: number; limit: number; spent: number; percentUsed: number } {
    const budget = this.getOrCreateBudget(userId);
    this.maybeResetMonthly(budget);
    return {
      remaining: Math.max(0, budget.monthlyLimitUsd - budget.currentMonthSpent),
      limit: budget.monthlyLimitUsd,
      spent: budget.currentMonthSpent,
      percentUsed: (budget.currentMonthSpent / budget.monthlyLimitUsd) * 100,
    };
  }

  /**
   * Set a user's monthly spending limit.
   */
  setUserLimit(userId: string, limitUsd: number): void {
    const budget = this.getOrCreateBudget(userId);
    budget.monthlyLimitUsd = limitUsd;
  }

  /**
   * Get usage analytics for a time range.
   */
  getStats(userId?: string, fromTimestamp?: number): UsageStats {
    let filtered = this.records;
    if (userId) filtered = filtered.filter(r => r.userId === userId);
    if (fromTimestamp) filtered = filtered.filter(r => r.timestamp >= fromTimestamp);

    const byModel: UsageStats['byModel'] = {};
    const byDay: UsageStats['byDay'] = {};
    let totalTokens = 0;
    let totalCost = 0;

    for (const r of filtered) {
      // By model
      if (!byModel[r.model]) byModel[r.model] = { requests: 0, tokens: 0, cost: 0 };
      byModel[r.model].requests++;
      byModel[r.model].tokens += r.inputTokens + r.outputTokens;
      byModel[r.model].cost += r.cost;

      // By day
      const day = new Date(r.timestamp).toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { requests: 0, cost: 0 };
      byDay[day].requests++;
      byDay[day].cost += r.cost;

      totalTokens += r.inputTokens + r.outputTokens;
      totalCost += r.cost;
    }

    return {
      totalRequests: filtered.length,
      totalTokens,
      totalCost: Math.round(totalCost * 10000) / 10000,
      avgCostPerRequest: filtered.length > 0 ? Math.round((totalCost / filtered.length) * 10000) / 10000 : 0,
      byModel,
      byDay,
    };
  }

  /**
   * Estimate cost before making a request.
   */
  estimateCost(modelId: string, inputTokens: number, expectedOutputTokens: number): number {
    const rates: Record<string, [number, number]> = {
      'gpt-4o': [0.005, 0.015],
      'gpt-4o-mini': [0.00015, 0.0006],
      'claude-4-sonnet': [0.003, 0.015],
      'claude-4-haiku': [0.00025, 0.00125],
      'local-llama': [0, 0],
    };
    const [inRate, outRate] = rates[modelId] || [0.001, 0.003];
    return (inputTokens / 1000) * inRate + (expectedOutputTokens / 1000) * outRate;
  }

  // ── Private ────────────────────────────────────────────────────────

  private getOrCreateBudget(userId: string): UserBudget {
    if (!this.budgets.has(userId)) {
      this.budgets.set(userId, {
        userId,
        monthlyLimitUsd: this.globalMonthlyLimit,
        currentMonthSpent: 0,
        totalSpent: 0,
        totalRequests: 0,
        lastReset: Date.now(),
      });
    }
    return this.budgets.get(userId)!;
  }

  private maybeResetMonthly(budget: UserBudget): void {
    const now = new Date();
    const last = new Date(budget.lastReset);
    if (now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear()) {
      budget.currentMonthSpent = 0;
      budget.lastReset = Date.now();
    }
  }
}

export const costTracker = new CostTracker(
  parseFloat(process.env.AI_COST_LIMIT_USD || '100')
);
export default costTracker;
