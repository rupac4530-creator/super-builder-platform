/**
 * Engine Alto — Capability Registry
 * Tracks what each agent can do, matches tasks to agents, skill evolution.
 */

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number; // 1-10
  prerequisites: string[];
}

export interface AgentProfile {
  agentId: string;
  name: string;
  department: string;
  capabilities: Map<string, number>; // capabilityId → proficiency level
  tasksCompleted: number;
  tasksFailed: number;
  specializations: string[];
  lastActive: Date;
  availability: 'active' | 'busy' | 'offline' | 'maintenance';
}

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();
  private agents: Map<string, AgentProfile> = new Map();

  registerCapability(name: string, category: string, description: string = '', prerequisites: string[] = []): string {
    const id = `cap-${name.toLowerCase().replace(/\s+/g, '-')}`;
    this.capabilities.set(id, { id, name, description, category, level: 1, prerequisites });
    return id;
  }

  registerAgent(agentId: string, name: string, department: string, capabilityIds: string[] = []): void {
    const caps = new Map<string, number>();
    for (const cid of capabilityIds) caps.set(cid, 5); // default mid-level
    this.agents.set(agentId, {
      agentId, name, department, capabilities: caps,
      tasksCompleted: 0, tasksFailed: 0,
      specializations: [], lastActive: new Date(), availability: 'active',
    });
  }

  findBestAgent(requiredCapabilities: string[], excludeAgents: string[] = []): AgentProfile | null {
    let best: AgentProfile | null = null;
    let bestScore = -1;

    for (const [id, agent] of this.agents) {
      if (excludeAgents.includes(id)) continue;
      if (agent.availability !== 'active') continue;

      let score = 0;
      let hasAll = true;
      for (const cap of requiredCapabilities) {
        const level = agent.capabilities.get(cap);
        if (level === undefined) { hasAll = false; break; }
        score += level;
      }

      if (hasAll && score > bestScore) {
        bestScore = score;
        best = agent;
      }
    }
    return best;
  }

  evolveCapability(agentId: string, capabilityId: string, delta: number): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    const current = agent.capabilities.get(capabilityId) || 0;
    agent.capabilities.set(capabilityId, Math.min(10, Math.max(0, current + delta)));
  }

  recordTaskResult(agentId: string, success: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    if (success) agent.tasksCompleted++;
    else agent.tasksFailed++;
    agent.lastActive = new Date();
  }

  getAgent(id: string): AgentProfile | undefined { return this.agents.get(id); }
  getCapability(id: string): Capability | undefined { return this.capabilities.get(id); }

  getStatus() {
    const agents = Array.from(this.agents.values());
    return {
      capabilities: this.capabilities.size,
      agents: agents.length,
      active: agents.filter(a => a.availability === 'active').length,
      totalCompleted: agents.reduce((s, a) => s + a.tasksCompleted, 0),
      totalFailed: agents.reduce((s, a) => s + a.tasksFailed, 0),
      departments: [...new Set(agents.map(a => a.department))],
    };
  }
}

export const capabilityRegistry = new CapabilityRegistry();
