/**
 * Engine Alto — Enhanced Workbook Agent
 * Tracks who does what, reminds pending tasks, keeps full records.
 * Enhanced version of the base Workbook in orchestrator.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface WorkRecord {
  agentId: string;
  taskId: string;
  description: string;
  startedAt: Date;
  completedAt: Date | null;
  status: 'active' | 'completed' | 'abandoned';
  output: any;
}

export class WorkbookAgent implements Agent {
  id = 'workbook-agent';
  name = 'Workbook Agent — Full Record Keeper';
  type: 'auditor' = 'auditor';
  status: 'idle' | 'active' | 'busy' | 'error' = 'active';
  capabilities = ['record', 'remind', 'track_work', 'history', 'audit_trail'];

  private records: WorkRecord[] = [];
  private reminders: Array<{ agentId: string; message: string; dueAt: Date; sent: boolean }> = [];

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'record_work':
          output = this.recordWork(task.input.agentId, task.input.taskId, task.input.description);
          break;
        case 'complete_record':
          output = this.completeRecord(task.input.taskId, task.input.output);
          break;
        case 'set_reminder':
          output = this.setReminder(task.input.agentId, task.input.message, task.input.dueAt);
          break;
        case 'check_reminders':
          output = this.checkReminders();
          break;
        case 'get_history':
          output = this.getHistory(task.input.agentId);
          break;
        default:
          output = { totalRecords: this.records.length };
      }

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Workbook: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Workbook error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  private recordWork(agentId: string, taskId: string, description: string): Record<string, any> {
    this.records.push({
      agentId, taskId, description,
      startedAt: new Date(), completedAt: null,
      status: 'active', output: null,
    });
    return { recorded: true, totalActive: this.records.filter(r => r.status === 'active').length };
  }

  private completeRecord(taskId: string, output: any): Record<string, any> {
    const record = this.records.find(r => r.taskId === taskId && r.status === 'active');
    if (record) {
      record.status = 'completed';
      record.completedAt = new Date();
      record.output = output;
      return { completed: true, duration: record.completedAt.getTime() - record.startedAt.getTime() };
    }
    return { completed: false, reason: 'Record not found' };
  }

  private setReminder(agentId: string, message: string, dueAt: string): Record<string, any> {
    this.reminders.push({ agentId, message, dueAt: new Date(dueAt), sent: false });
    return { reminderSet: true, for: agentId, dueAt };
  }

  private checkReminders(): Record<string, any> {
    const now = new Date();
    const due = this.reminders.filter(r => !r.sent && r.dueAt <= now);
    due.forEach(r => r.sent = true);
    return { dueReminders: due.length, details: due.map(r => ({ agent: r.agentId, message: r.message })) };
  }

  private getHistory(agentId?: string): Record<string, any> {
    const filtered = agentId ? this.records.filter(r => r.agentId === agentId) : this.records;
    return {
      records: filtered.length,
      completed: filtered.filter(r => r.status === 'completed').length,
      active: filtered.filter(r => r.status === 'active').length,
    };
  }

  getStatus() {
    return {
      totalRecords: this.records.length,
      activeWork: this.records.filter(r => r.status === 'active').length,
      pendingReminders: this.reminders.filter(r => !r.sent).length,
    };
  }
}

export const workbookAgent = new WorkbookAgent();
