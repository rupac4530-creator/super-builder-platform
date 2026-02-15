/**
 * Engine Alto — Motor Reminder
 * Scheduling: reminds about pending features, future tasks, update reminders.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface ScheduledTask {
  id: string;
  title: string;
  dueAt: Date;
  assignedTo: string;
  status: 'scheduled' | 'reminded' | 'completed' | 'overdue';
  priority: 'low' | 'normal' | 'high';
}

export class MotorReminder implements Agent {
  id = 'motor-reminder';
  name = 'Motor Reminder — Task Scheduler & Nudger';
  type: 'orchestrator' = 'orchestrator';
  status: 'idle' | 'active' | 'busy' | 'error' = 'active';
  capabilities = ['schedule', 'remind', 'nudge', 'deadline_track'];

  private scheduled: ScheduledTask[] = [];

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'schedule':
          output = this.scheduleTask(task.input.title, task.input.dueAt, task.input.assignedTo, task.input.priority);
          break;
        case 'check_due':
          output = this.checkDueTasks();
          break;
        case 'mark_complete':
          output = this.markComplete(task.input.taskId);
          break;
        default:
          output = { scheduledTasks: this.scheduled.length };
      }

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Motor: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Motor error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  private scheduleTask(title: string, dueAt: string, assignedTo: string, priority: string = 'normal'): Record<string, any> {
    const task: ScheduledTask = {
      id: `SCHED-${Date.now()}`,
      title,
      dueAt: new Date(dueAt),
      assignedTo,
      status: 'scheduled',
      priority: (priority as ScheduledTask['priority']) || 'normal',
    };
    this.scheduled.push(task);
    return { scheduled: true, taskId: task.id };
  }

  private checkDueTasks(): Record<string, any> {
    const now = new Date();
    const due = this.scheduled.filter(t => t.status === 'scheduled' && t.dueAt <= now);
    const overdue = this.scheduled.filter(t => t.status === 'scheduled' && t.dueAt < new Date(now.getTime() - 86400000));

    due.forEach(t => t.status = 'reminded');
    overdue.forEach(t => t.status = 'overdue');

    return { dueTasks: due.length, overdueTasks: overdue.length, upcoming: this.scheduled.filter(t => t.status === 'scheduled').length };
  }

  private markComplete(taskId: string): Record<string, any> {
    const task = this.scheduled.find(t => t.id === taskId);
    if (task) { task.status = 'completed'; return { completed: true }; }
    return { completed: false };
  }

  getStatus() {
    return {
      scheduled: this.scheduled.filter(t => t.status === 'scheduled').length,
      overdue: this.scheduled.filter(t => t.status === 'overdue').length,
      completed: this.scheduled.filter(t => t.status === 'completed').length,
    };
  }
}

export const motorReminder = new MotorReminder();
