/**
 * Phase 9 — Evolution Engine
 * Autonomous self-update: agents research new tech, evaluate, adopt improvements.
 */

export interface EvolutionCycle {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  discoveries: TechDiscovery[];
  adoptedChanges: string[];
  rejectedChanges: string[];
  status: 'scanning' | 'evaluating' | 'applying' | 'completed';
}

export interface TechDiscovery {
  source: string;
  title: string;
  category: 'ai-model' | 'framework' | 'security' | 'performance' | 'ux' | 'infrastructure';
  relevanceScore: number;
  riskScore: number;
  recommendation: 'adopt' | 'evaluate' | 'reject';
  details: string;
}

export class EvolutionEngine {
  private cycles: EvolutionCycle[] = [];
  private intervalDays: number = 4; // Update every 4 days
  private lastCycleDate: Date = new Date(0);

  shouldRunCycle(): boolean {
    const daysSinceLastCycle = (Date.now() - this.lastCycleDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastCycle >= this.intervalDays;
  }

  startCycle(): string {
    const id = `evo-${Date.now()}`;
    const cycle: EvolutionCycle = {
      id, startedAt: new Date(), discoveries: [], adoptedChanges: [], rejectedChanges: [], status: 'scanning',
    };
    this.cycles.push(cycle);
    return id;
  }

  addDiscovery(cycleId: string, discovery: Omit<TechDiscovery, 'recommendation'>): void {
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (!cycle || cycle.status !== 'scanning') return;

    const recommendation: TechDiscovery['recommendation'] =
      discovery.relevanceScore > 7 && discovery.riskScore < 4 ? 'adopt' :
      discovery.relevanceScore > 5 ? 'evaluate' : 'reject';

    cycle.discoveries.push({ ...discovery, recommendation });
  }

  evaluate(cycleId: string): { toAdopt: TechDiscovery[]; toReject: TechDiscovery[] } {
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (!cycle) return { toAdopt: [], toReject: [] };
    cycle.status = 'evaluating';

    const toAdopt = cycle.discoveries.filter(d => d.recommendation === 'adopt');
    const toReject = cycle.discoveries.filter(d => d.recommendation === 'reject');
    return { toAdopt, toReject };
  }

  applyChanges(cycleId: string, adoptedTitles: string[], rejectedTitles: string[]): void {
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (!cycle) return;
    cycle.status = 'applying';
    cycle.adoptedChanges = adoptedTitles;
    cycle.rejectedChanges = rejectedTitles;
    cycle.status = 'completed';
    cycle.completedAt = new Date();
    this.lastCycleDate = new Date();
  }

  getStatus() {
    const completed = this.cycles.filter(c => c.status === 'completed');
    return {
      totalCycles: this.cycles.length,
      completedCycles: completed.length,
      lastCycleDate: this.lastCycleDate.toISOString(),
      intervalDays: this.intervalDays,
      totalDiscoveries: this.cycles.reduce((s, c) => s + c.discoveries.length, 0),
      totalAdopted: completed.reduce((s, c) => s + c.adoptedChanges.length, 0),
      nextCycleDue: this.shouldRunCycle(),
    };
  }
}

export const evolutionEngine = new EvolutionEngine();
