/**
 * Engine Alto — Reporter Agent
 * Tracks all changes, system size, reports to hackers and governors.
 * Messenger between departments.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface SystemReport {
  id: string;
  type: 'change' | 'size' | 'security' | 'health' | 'full';
  content: Record<string, any>;
  recipients: string[];
  createdAt: Date;
}

export class ReporterAgent implements Agent {
  id = 'reporter';
  name = 'Reporter — Inter-Department Messenger & Logger';
  type: 'auditor' = 'auditor';
  status: 'idle' | 'active' | 'busy' | 'error' = 'active';
  capabilities = ['report', 'message', 'log_change', 'broadcast', 'track_changes'];

  private reports: SystemReport[] = [];
  private messageLog: Array<{ from: string; to: string; message: string; timestamp: Date }> = [];

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'create_report':
          output = this.createReport(task.input.type, task.input.content, task.input.recipients);
          break;
        case 'send_message':
          output = this.sendMessage(task.input.from, task.input.to, task.input.message);
          break;
        case 'broadcast':
          output = this.broadcast(task.input.message);
          break;
        default:
          output = { action: 'reporting_standby', totalReports: this.reports.length };
      }

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Reporter: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Reporter error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  createReport(type: SystemReport['type'], content: Record<string, any>, recipients: string[] = []): Record<string, any> {
    const report: SystemReport = {
      id: `RPT-${Date.now()}`,
      type,
      content,
      recipients: recipients.length ? recipients : ['all_governors'],
      createdAt: new Date(),
    };
    this.reports.push(report);

    return { reportId: report.id, type, sentTo: report.recipients, totalReports: this.reports.length };
  }

  sendMessage(from: string, to: string, message: string): Record<string, any> {
    this.messageLog.push({ from, to, message, timestamp: new Date() });
    return { sent: true, from, to, message };
  }

  broadcast(message: string): Record<string, any> {
    this.messageLog.push({ from: 'reporter', to: 'all', message, timestamp: new Date() });
    return { broadcast: true, message, recipients: 'all_departments' };
  }

  getStatus() {
    return { totalReports: this.reports.length, messagesSent: this.messageLog.length };
  }
}

export const reporter = new ReporterAgent();
