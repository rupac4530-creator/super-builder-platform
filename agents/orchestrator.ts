/**
 * Engine Alto — Agent Orchestrator
 * Central coordination system for the AI agent civilization.
 * Decomposes tasks, assigns to specialist agents, and tracks outcomes.
 */

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: 'idle' | 'active' | 'busy' | 'error';
  capabilities: string[];
  process: (task: AgentTask) => Promise<AgentResult>;
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  input: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  assignedAgent?: string;
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  createdAt: Date;
}

export interface AgentResult {
  taskId: string;
  agentId: string;
  success: boolean;
  output: Record<string, any>;
  logs: string[];
  duration: number;
}

export type AgentType =
  | 'orchestrator' | 'data' | 'trainer' | 'debugger' | 'deployer'
  | 'security' | 'doctor' | 'growth' | 'scout' | 'police'
  | 'auditor' | 'decorator';

/**
 * Workbook — centralized task database and audit trail
 */
class Workbook {
  private tasks: Map<string, AgentTask> = new Map();
  private auditLog: Array<{ timestamp: Date; action: string; details: any }> = [];

  addTask(task: AgentTask): void {
    this.tasks.set(task.id, task);
    this.audit('task_created', { taskId: task.id, type: task.type });
  }

  updateTask(taskId: string, updates: Partial<AgentTask>): void {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
      this.audit('task_updated', { taskId, updates });
    }
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  getPendingTasks(): AgentTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  getAuditLog(): Array<{ timestamp: Date; action: string; details: any }> {
    return this.auditLog;
  }

  private audit(action: string, details: any): void {
    this.auditLog.push({ timestamp: new Date(), action, details });
  }
}

/**
 * Balancer — assigns tasks to agents based on capability and availability
 */
class Balancer {
  private agents: Map<string, Agent> = new Map();

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  findBestAgent(task: AgentTask): Agent | null {
    const available = Array.from(this.agents.values())
      .filter(a => a.status !== 'busy' && a.status !== 'error')
      .filter(a => a.capabilities.some(c => task.type.includes(c) || c.includes(task.type)));

    if (available.length === 0) return null;

    // Prefer idle over active
    const idle = available.filter(a => a.status === 'idle');
    return idle.length > 0 ? idle[0] : available[0];
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}

/**
 * Orchestrator — the brain of the agent civilization
 */
export class AgentOrchestrator {
  private workbook: Workbook;
  private balancer: Balancer;
  private results: Map<string, AgentResult> = new Map();

  constructor() {
    this.workbook = new Workbook();
    this.balancer = new Balancer();
  }

  registerAgent(agent: Agent): void {
    this.balancer.registerAgent(agent);
  }

  /**
   * Decompose a high-level goal into sub-tasks
   */
  decompose(goal: string, context?: Record<string, any>): AgentTask[] {
    const tasks: AgentTask[] = [];
    const baseId = `task_${Date.now()}`;

    // Smart decomposition based on goal keywords
    const lower = goal.toLowerCase();

    if (lower.includes('train') || lower.includes('model')) {
      tasks.push(
        this.createTask(`${baseId}_1`, 'data_prep', `Prepare data for: ${goal}`, 'high'),
        this.createTask(`${baseId}_2`, 'training', `Train model: ${goal}`, 'high'),
        this.createTask(`${baseId}_3`, 'evaluation', `Evaluate results: ${goal}`, 'normal'),
        this.createTask(`${baseId}_4`, 'deployment', `Deploy if passes thresholds`, 'normal')
      );
    } else if (lower.includes('fix') || lower.includes('bug') || lower.includes('debug')) {
      tasks.push(
        this.createTask(`${baseId}_1`, 'diagnosis', `Diagnose issue: ${goal}`, 'high'),
        this.createTask(`${baseId}_2`, 'fix', `Implement fix: ${goal}`, 'high'),
        this.createTask(`${baseId}_3`, 'test', `Validate fix`, 'normal')
      );
    } else if (lower.includes('deploy') || lower.includes('ship')) {
      tasks.push(
        this.createTask(`${baseId}_1`, 'security_scan', `Security audit before deploy`, 'critical'),
        this.createTask(`${baseId}_2`, 'build', `Build production artifacts`, 'high'),
        this.createTask(`${baseId}_3`, 'deploy', `Deploy: ${goal}`, 'high'),
        this.createTask(`${baseId}_4`, 'monitor', `Monitor health post-deploy`, 'normal')
      );
    } else {
      tasks.push(
        this.createTask(`${baseId}_1`, 'analysis', `Analyze: ${goal}`, 'normal'),
        this.createTask(`${baseId}_2`, 'implementation', `Implement: ${goal}`, 'normal'),
        this.createTask(`${baseId}_3`, 'validation', `Validate: ${goal}`, 'normal')
      );
    }

    tasks.forEach(t => this.workbook.addTask(t));
    return tasks;
  }

  /**
   * Execute a task by assigning it to the best available agent
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    const agent = this.balancer.findBestAgent(task);

    if (!agent) {
      return {
        taskId: task.id,
        agentId: 'none',
        success: false,
        output: { error: 'No available agent for task type: ' + task.type },
        logs: ['No agent available'],
        duration: 0
      };
    }

    task.assignedAgent = agent.id;
    task.status = 'running';
    this.workbook.updateTask(task.id, { status: 'running', assignedAgent: agent.id });

    const start = Date.now();

    try {
      const result = await agent.process(task);
      task.status = 'completed';
      this.workbook.updateTask(task.id, { status: 'completed' });
      this.results.set(task.id, result);
      return result;
    } catch (error: any) {
      const result: AgentResult = {
        taskId: task.id,
        agentId: agent.id,
        success: false,
        output: { error: error.message },
        logs: [`Error: ${error.message}`],
        duration: Date.now() - start
      };
      task.status = 'failed';
      this.workbook.updateTask(task.id, { status: 'failed' });
      this.results.set(task.id, result);
      return result;
    }
  }

  /**
   * Run the full autonomous pipeline for a goal
   */
  async run(goal: string): Promise<AgentResult[]> {
    const tasks = this.decompose(goal);
    const results: AgentResult[] = [];

    for (const task of tasks) {
      const result = await this.execute(task);
      results.push(result);

      // Stop on critical failure
      if (!result.success && task.priority === 'critical') {
        break;
      }
    }

    return results;
  }

  getStatus() {
    return {
      agents: this.balancer.getAgents().map(a => ({ id: a.id, name: a.name, type: a.type, status: a.status })),
      pendingTasks: this.workbook.getPendingTasks().length,
      completedResults: this.results.size,
      auditLog: this.workbook.getAuditLog().slice(-20)
    };
  }

  private createTask(id: string, type: string, description: string, priority: AgentTask['priority']): AgentTask {
    return {
      id, type, description, priority,
      input: {},
      status: 'pending',
      createdAt: new Date()
    };
  }
}

// Export singleton
export const orchestrator = new AgentOrchestrator();
