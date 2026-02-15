/**
 * Engine Alto — Navigator (Nami)
 * Filters and validates Luffy's and Zoro's findings.
 * Decides: useful vs not useful, suitable vs not suitable for the platform.
 * Passes validated intelligence to governors.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';
import { TechDiscovery } from './luffy';
import { CompetitorAnalysis } from './zoro';

export interface ValidatedIntel {
  id: string;
  source: 'luffy' | 'zoro';
  originalId: string;
  title: string;
  verdict: 'approved' | 'rejected' | 'needs_review';
  reason: string;
  priorityScore: number; // 0-100
  assignedGovernor: string;
  validatedAt: Date;
}

export class NavigatorAgent implements Agent {
  id = 'navigator';
  name = 'Navigator (Nami) — Intelligence Filter & Validator';
  type: 'scout' = 'scout';
  status: 'idle' | 'active' | 'busy' | 'error' = 'active';
  capabilities = ['filter', 'validate', 'prioritize', 'route_intel', 'quality_gate'];

  private validatedIntel: ValidatedIntel[] = [];
  private filterCount: number = 0;

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'filter_discoveries':
          output = this.filterDiscoveries(task.input.discoveries || []);
          break;
        case 'filter_analyses':
          output = this.filterAnalyses(task.input.analyses || []);
          break;
        case 'get_approved':
          output = this.getApprovedIntel();
          break;
        default:
          output = { action: 'awaiting_intel' };
      }

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Navigator filtered: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Navigator error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  /**
   * Filter discoveries from Luffy
   */
  private filterDiscoveries(discoveries: TechDiscovery[]): Record<string, any> {
    const results: ValidatedIntel[] = [];

    for (const disc of discoveries) {
      this.filterCount++;
      const priority = this.calculatePriority(disc.potentialImpact, disc.category);
      const suitable = priority > 30;

      const intel: ValidatedIntel = {
        id: `INTEL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        source: 'luffy',
        originalId: disc.id,
        title: disc.title,
        verdict: suitable ? 'approved' : 'rejected',
        reason: suitable
          ? `High relevance (${priority}) — aligns with platform goals`
          : `Low relevance (${priority}) — not aligned with current priorities`,
        priorityScore: priority,
        assignedGovernor: this.routeToGovernor(disc.category),
        validatedAt: new Date(),
      };

      results.push(intel);
      this.validatedIntel.push(intel);
    }

    return {
      processed: results.length,
      approved: results.filter(r => r.verdict === 'approved').length,
      rejected: results.filter(r => r.verdict === 'rejected').length,
      topPicks: results.filter(r => r.verdict === 'approved').sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3),
    };
  }

  /**
   * Filter analyses from Zoro
   */
  private filterAnalyses(analyses: CompetitorAnalysis[]): Record<string, any> {
    const results: ValidatedIntel[] = [];

    for (const ana of analyses) {
      this.filterCount++;
      const priority = Math.min(100, ana.rating + ana.lessonsForUs.length * 5);

      const intel: ValidatedIntel = {
        id: `INTEL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        source: 'zoro',
        originalId: ana.id,
        title: `Competitor: ${ana.competitor}`,
        verdict: priority > 40 ? 'approved' : 'needs_review',
        reason: `Competitor rated ${ana.rating}/100 with ${ana.lessonsForUs.length} actionable lessons`,
        priorityScore: priority,
        assignedGovernor: this.routeToGovernor(ana.category),
        validatedAt: new Date(),
      };

      results.push(intel);
      this.validatedIntel.push(intel);
    }

    return {
      processed: results.length,
      approved: results.filter(r => r.verdict === 'approved').length,
      needsReview: results.filter(r => r.verdict === 'needs_review').length,
    };
  }

  private getApprovedIntel(): Record<string, any> {
    const approved = this.validatedIntel.filter(i => i.verdict === 'approved');
    return {
      total: approved.length,
      byGovernor: {
        builder: approved.filter(i => i.assignedGovernor === 'builder').length,
        security: approved.filter(i => i.assignedGovernor === 'security').length,
        quality: approved.filter(i => i.assignedGovernor === 'quality').length,
        growth: approved.filter(i => i.assignedGovernor === 'growth').length,
        intelligence: approved.filter(i => i.assignedGovernor === 'intelligence').length,
      },
      topPriority: approved.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5),
    };
  }

  private calculatePriority(impact: string, category: string): number {
    let score = 50;
    if (impact === 'revolutionary') score += 40;
    else if (impact === 'high') score += 25;
    else if (impact === 'medium') score += 10;

    if (['ai_model', 'technique'].includes(category)) score += 10;
    return Math.min(100, score);
  }

  private routeToGovernor(category: string): string {
    const routing: Record<string, string> = {
      framework: 'builder', language: 'builder', tool: 'builder',
      technique: 'intelligence', ai_model: 'intelligence',
      hardware: 'builder', protocol: 'security',
      gaming: 'builder', browser: 'builder',
      security: 'security', platform: 'growth',
    };
    return routing[category] || 'intelligence';
  }

  getStatus() {
    return {
      totalFiltered: this.filterCount,
      approvedIntel: this.validatedIntel.filter(i => i.verdict === 'approved').length,
      rejectedIntel: this.validatedIntel.filter(i => i.verdict === 'rejected').length,
      pendingReview: this.validatedIntel.filter(i => i.verdict === 'needs_review').length,
    };
  }
}

export const navigator = new NavigatorAgent();
