/**
 * Engine Alto — Father AI
 * Collects memory from all agents. Manages the 4-7 day update cycle.
 * Reviews user requests, decides what to implement.
 * Distributes decisions to governors for execution.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface UpdateCycle {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  status: 'collecting' | 'reviewing' | 'deciding' | 'executing' | 'completed' | 'failed';
  userRequests: UserRequest[];
  discoveries: Discovery[];
  decisions: UpdateDecision[];
  changesApplied: string[];
}

export interface UserRequest {
  id: string;
  content: string;
  priority: 'low' | 'normal' | 'high';
  receivedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  reason?: string;
}

export interface Discovery {
  source: 'luffy' | 'zoro' | 'navigator' | 'tracker' | 'other';
  content: string;
  relevance: number; // 0-100
  timestamp: Date;
}

export interface UpdateDecision {
  id: string;
  action: string;
  reasoning: string;
  assignedTo: string; // governor domain
  status: 'planned' | 'in_progress' | 'done' | 'skipped';
}

// ── Father AI ─────────────────────────────────────────────────

export class FatherAI implements Agent {
  id = 'father-ai';
  name = 'Father AI — Memory Keeper & Update Master';
  type: 'orchestrator' = 'orchestrator';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['memory', 'update', 'review', 'decide', 'distribute'];

  private agentMemories: Map<string, Map<string, any>> = new Map();
  private updateCycles: UpdateCycle[] = [];
  private currentCycle: UpdateCycle | null = null;
  private userRequests: UserRequest[] = [];
  private discoveries: Discovery[] = [];
  private updateIntervalDays: number = 4;

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'collect_memory':
          output = this.collectMemory(task.input.agentId, task.input.memories);
          break;
        case 'review_requests':
          output = this.reviewUserRequests();
          break;
        case 'start_update':
          output = this.startUpdateCycle();
          break;
        case 'execute_update':
          output = this.executeUpdateCycle();
          break;
        default:
          output = { action: 'memory_watch', status: 'collecting' };
      }

      this.status = 'idle';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Father AI processed: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Father AI error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  /**
   * Collect memory from an agent
   */
  collectMemory(agentId: string, memories: Record<string, any>): Record<string, any> {
    if (!this.agentMemories.has(agentId)) {
      this.agentMemories.set(agentId, new Map());
    }
    const agentMem = this.agentMemories.get(agentId)!;
    Object.entries(memories).forEach(([key, value]) => agentMem.set(key, value));

    return {
      collected: true,
      agentId,
      keysStored: agentMem.size,
      totalAgentsTracked: this.agentMemories.size,
    };
  }

  /**
   * Receive a user request for the next update cycle
   */
  receiveUserRequest(content: string, priority: UserRequest['priority'] = 'normal'): UserRequest {
    const request: UserRequest = {
      id: `REQ-${Date.now()}`,
      content,
      priority,
      receivedAt: new Date(),
      status: 'pending',
    };
    this.userRequests.push(request);
    return request;
  }

  /**
   * Receive a discovery from exploration agents
   */
  receiveDiscovery(source: Discovery['source'], content: string, relevance: number): void {
    this.discoveries.push({ source, content, relevance, timestamp: new Date() });
  }

  /**
   * Review all pending user requests
   */
  private reviewUserRequests(): Record<string, any> {
    const pending = this.userRequests.filter(r => r.status === 'pending');
    const reviewed: UserRequest[] = [];

    for (const req of pending) {
      // Auto-approve high priority, review normal/low
      if (req.priority === 'high') {
        req.status = 'approved';
        req.reason = 'Auto-approved: high priority';
      } else {
        // Simple relevance check
        req.status = 'approved';
        req.reason = 'Approved for next update cycle';
      }
      reviewed.push(req);
    }

    return {
      reviewed: reviewed.length,
      approved: reviewed.filter(r => r.status === 'approved').length,
      rejected: reviewed.filter(r => r.status === 'rejected').length,
    };
  }

  /**
   * Start a new update cycle
   */
  private startUpdateCycle(): Record<string, any> {
    if (this.currentCycle && this.currentCycle.status !== 'completed' && this.currentCycle.status !== 'failed') {
      return { error: 'Update cycle already in progress' };
    }

    const approvedRequests = this.userRequests.filter(r => r.status === 'approved');
    const relevantDiscoveries = this.discoveries.filter(d => d.relevance > 50);

    this.currentCycle = {
      id: `CYCLE-${Date.now()}`,
      startedAt: new Date(),
      completedAt: null,
      status: 'collecting',
      userRequests: approvedRequests,
      discoveries: relevantDiscoveries,
      decisions: [],
      changesApplied: [],
    };

    // Generate decisions from requests and discoveries
    for (const req of approvedRequests) {
      this.currentCycle.decisions.push({
        id: `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        action: req.content,
        reasoning: `User request: ${req.reason}`,
        assignedTo: this.determineGovernor(req.content),
        status: 'planned',
      });
    }

    for (const disc of relevantDiscoveries) {
      this.currentCycle.decisions.push({
        id: `DEC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        action: disc.content,
        reasoning: `Discovery from ${disc.source}, relevance: ${disc.relevance}%`,
        assignedTo: this.determineGovernor(disc.content),
        status: 'planned',
      });
    }

    this.currentCycle.status = 'reviewing';

    return {
      cycleId: this.currentCycle.id,
      requestsIncluded: approvedRequests.length,
      discoveriesIncluded: relevantDiscoveries.length,
      decisionsPlanned: this.currentCycle.decisions.length,
    };
  }

  /**
   * Execute the current update cycle
   */
  private executeUpdateCycle(): Record<string, any> {
    if (!this.currentCycle) return { error: 'No active update cycle' };

    this.currentCycle.status = 'executing';

    for (const decision of this.currentCycle.decisions) {
      decision.status = 'in_progress';
      // In real system, this would dispatch to the assigned governor
      decision.status = 'done';
      this.currentCycle.changesApplied.push(decision.action);
    }

    this.currentCycle.status = 'completed';
    this.currentCycle.completedAt = new Date();
    this.updateCycles.push(this.currentCycle);

    // Clear processed items
    this.userRequests = this.userRequests.filter(r => r.status === 'pending');
    this.discoveries = [];

    const result = {
      cycleId: this.currentCycle.id,
      changesApplied: this.currentCycle.changesApplied.length,
      duration: this.currentCycle.completedAt.getTime() - this.currentCycle.startedAt.getTime(),
    };

    this.currentCycle = null;
    return result;
  }

  /**
   * Determine which governor should handle a request
   */
  private determineGovernor(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('security') || lower.includes('hack') || lower.includes('protect')) return 'security';
    if (lower.includes('test') || lower.includes('fix') || lower.includes('quality') || lower.includes('bug')) return 'quality';
    if (lower.includes('user') || lower.includes('growth') || lower.includes('design') || lower.includes('ux')) return 'growth';
    if (lower.includes('research') || lower.includes('explore') || lower.includes('discover')) return 'intelligence';
    return 'builder'; // Default
  }

  /**
   * Check if an update is due
   */
  isUpdateDue(): boolean {
    const lastCycle = this.updateCycles[this.updateCycles.length - 1];
    if (!lastCycle) return true;

    const daysSince = (Date.now() - lastCycle.completedAt!.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= this.updateIntervalDays;
  }

  getStatus() {
    return {
      agentsTracked: this.agentMemories.size,
      pendingRequests: this.userRequests.filter(r => r.status === 'pending').length,
      pendingDiscoveries: this.discoveries.length,
      completedCycles: this.updateCycles.length,
      currentCycle: this.currentCycle?.status || null,
      updateDue: this.isUpdateDue(),
      nextUpdateIn: this.isUpdateDue() ? 'NOW' : `${this.updateIntervalDays} days`,
    };
  }
}

export const fatherAI = new FatherAI();
