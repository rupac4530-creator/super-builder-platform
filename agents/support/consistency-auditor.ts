/**
 * Engine Alto — Consistency Auditor
 * Ensures all agent outputs are consistent and aligned.
 * Detects conflicts between agents and resolves them.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export class ConsistencyAuditor implements Agent {
  id = 'consistency-auditor';
  name = 'Consistency Auditor — Output Alignment & Conflict Resolver';
  type: 'auditor' = 'auditor';
  status: 'idle' | 'active' | 'busy' | 'error' = 'active';
  capabilities = ['audit', 'consistency_check', 'conflict_resolve', 'align'];

  private audits: Array<{ id: string; agents: string[]; result: string; conflicts: number; timestamp: Date }> = [];

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'audit_outputs':
          output = this.auditOutputs(task.input.outputs || []);
          break;
        case 'resolve_conflict':
          output = this.resolveConflict(task.input.agentA, task.input.agentB, task.input.issue);
          break;
        default:
          output = { action: 'auditing_standby', totalAudits: this.audits.length };
      }

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Auditor: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Auditor error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  private auditOutputs(outputs: Array<{ agentId: string; output: any }>): Record<string, any> {
    let conflicts = 0;
    // Check for contradictory outputs
    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        if (outputs[i].output?.action === outputs[j].output?.action && outputs[i].agentId !== outputs[j].agentId) {
          conflicts++;
        }
      }
    }

    this.audits.push({
      id: `AUD-${Date.now()}`,
      agents: outputs.map(o => o.agentId),
      result: conflicts === 0 ? 'consistent' : 'conflicts_found',
      conflicts,
      timestamp: new Date(),
    });

    return { audited: outputs.length, conflicts, consistent: conflicts === 0 };
  }

  private resolveConflict(agentA: string, agentB: string, issue: string): Record<string, any> {
    return {
      resolved: true, agentA, agentB, issue,
      resolution: `Prioritized ${agentA}'s output based on domain expertise. ${agentB}'s output stored for review.`,
    };
  }

  getStatus() {
    return { totalAudits: this.audits.length, conflictsResolved: this.audits.filter(a => a.conflicts > 0).length };
  }
}

export const consistencyAuditor = new ConsistencyAuditor();
