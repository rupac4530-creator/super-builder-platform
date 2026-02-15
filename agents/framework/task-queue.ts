/**
 * Engine Alto — Agent Task Queue
 * Priority-based task distribution, load balancing, deadlock detection.
 */

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskState = 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  state: TaskState;
  assignedTo?: string;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  retries: number;
  maxRetries: number;
  timeoutMs: number;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = { critical: 4, high: 3, normal: 2, low: 1 };

export class AgentTaskQueue {
  private tasks: Map<string, AgentTask> = new Map();
  private queue: string[] = [];
  private agentLoad: Map<string, number> = new Map();
  private maxConcurrentPerAgent: number = 5;
  private totalProcessed: number = 0;

  enqueue(title: string, description: string, options: Partial<{
    priority: TaskPriority; dependencies: string[]; tags: string[];
    maxRetries: number; timeoutMs: number;
  }> = {}): string {
    const id = `TASK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const task: AgentTask = {
      id, title, description,
      priority: options.priority || 'normal',
      state: 'pending',
      dependencies: options.dependencies || [],
      tags: options.tags || [],
      createdAt: new Date(),
      retries: 0,
      maxRetries: options.maxRetries ?? 3,
      timeoutMs: options.timeoutMs ?? 60000,
    };
    this.tasks.set(id, task);
    this.queue.push(id);
    this.sortQueue();
    return id;
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      const ta = this.tasks.get(a)!;
      const tb = this.tasks.get(b)!;
      return PRIORITY_ORDER[tb.priority] - PRIORITY_ORDER[ta.priority];
    });
  }

  assign(agentId: string): AgentTask | null {
    const currentLoad = this.agentLoad.get(agentId) || 0;
    if (currentLoad >= this.maxConcurrentPerAgent) return null;

    const readyIdx = this.queue.findIndex(id => {
      const t = this.tasks.get(id)!;
      return t.state === 'pending' && t.dependencies.every(dep => {
        const d = this.tasks.get(dep);
        return d && d.state === 'completed';
      });
    });

    if (readyIdx === -1) return null;

    const taskId = this.queue.splice(readyIdx, 1)[0];
    const task = this.tasks.get(taskId)!;
    task.state = 'assigned';
    task.assignedTo = agentId;
    task.startedAt = new Date();
    this.agentLoad.set(agentId, currentLoad + 1);
    return task;
  }

  complete(taskId: string, result?: any): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.state = 'completed';
    task.completedAt = new Date();
    task.result = result;
    if (task.assignedTo) {
      const load = this.agentLoad.get(task.assignedTo) || 1;
      this.agentLoad.set(task.assignedTo, Math.max(0, load - 1));
    }
    this.totalProcessed++;
    return true;
  }

  fail(taskId: string, error: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.retries++;
    if (task.retries < task.maxRetries) {
      task.state = 'pending';
      this.queue.push(taskId);
      this.sortQueue();
    } else {
      task.state = 'failed';
      task.error = error;
    }
    if (task.assignedTo) {
      const load = this.agentLoad.get(task.assignedTo) || 1;
      this.agentLoad.set(task.assignedTo, Math.max(0, load - 1));
    }
    return true;
  }

  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.state === 'running') return false;
    task.state = 'cancelled';
    this.queue = this.queue.filter(id => id !== taskId);
    return true;
  }

  detectDeadlocks(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (id: string, path: string[]): void => {
      if (stack.has(id)) { cycles.push([...path, id]); return; }
      if (visited.has(id)) return;
      visited.add(id); stack.add(id);
      const task = this.tasks.get(id);
      if (task) {
        for (const dep of task.dependencies) {
          dfs(dep, [...path, id]);
        }
      }
      stack.delete(id);
    };

    for (const [id] of this.tasks) dfs(id, []);
    return cycles;
  }

  getStatus() {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.state === 'pending').length,
      assigned: tasks.filter(t => t.state === 'assigned').length,
      running: tasks.filter(t => t.state === 'running').length,
      completed: tasks.filter(t => t.state === 'completed').length,
      failed: tasks.filter(t => t.state === 'failed').length,
      queueLength: this.queue.length,
      totalProcessed: this.totalProcessed,
      agentLoads: Object.fromEntries(this.agentLoad),
      deadlocks: this.detectDeadlocks().length,
    };
  }
}

export const agentTaskQueue = new AgentTaskQueue();
