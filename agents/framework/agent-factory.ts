/**
 * Engine Alto — Agent Factory
 * Creates, clones, destroys, and scales agents dynamically.
 * Mother AI creates new agents; factory handles the mechanics.
 */

export interface AgentBlueprint {
  id: string;
  name: string;
  department: string;
  role: string;
  capabilities: string[];
  config: Record<string, any>;
  createdAt: Date;
}

export interface LiveAgent {
  blueprint: AgentBlueprint;
  instanceId: string;
  status: 'booting' | 'active' | 'paused' | 'error' | 'terminated';
  memory: Map<string, any>;
  startedAt: Date;
  heartbeat: Date;
  tasksProcessed: number;
}

export class AgentFactory {
  private blueprints: Map<string, AgentBlueprint> = new Map();
  private instances: Map<string, LiveAgent> = new Map();
  private maxInstances: number = 200;
  private totalCreated: number = 0;
  private totalDestroyed: number = 0;

  registerBlueprint(name: string, department: string, role: string, capabilities: string[] = [], config: Record<string, any> = {}): string {
    const id = `bp-${department}-${name.toLowerCase().replace(/\s+/g, '-')}`;
    this.blueprints.set(id, { id, name, department, role, capabilities, config, createdAt: new Date() });
    return id;
  }

  spawn(blueprintId: string, overrides: Record<string, any> = {}): string | null {
    if (this.instances.size >= this.maxInstances) return null;
    const bp = this.blueprints.get(blueprintId);
    if (!bp) return null;

    const instanceId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const agent: LiveAgent = {
      blueprint: { ...bp, config: { ...bp.config, ...overrides } },
      instanceId, status: 'booting', memory: new Map(),
      startedAt: new Date(), heartbeat: new Date(), tasksProcessed: 0,
    };

    this.instances.set(instanceId, agent);
    this.totalCreated++;

    // Auto-activate after boot
    setTimeout(() => {
      const a = this.instances.get(instanceId);
      if (a && a.status === 'booting') a.status = 'active';
    }, 100);

    return instanceId;
  }

  clone(sourceInstanceId: string): string | null {
    const source = this.instances.get(sourceInstanceId);
    if (!source) return null;
    const newId = this.spawn(source.blueprint.id);
    if (newId) {
      const clone = this.instances.get(newId)!;
      // Copy memory
      for (const [k, v] of source.memory) clone.memory.set(k, v);
    }
    return newId;
  }

  terminate(instanceId: string): boolean {
    const agent = this.instances.get(instanceId);
    if (!agent) return false;
    agent.status = 'terminated';
    this.instances.delete(instanceId);
    this.totalDestroyed++;
    return true;
  }

  scaleByDepartment(department: string, targetCount: number): { spawned: number; terminated: number } {
    const deptAgents = Array.from(this.instances.values()).filter(a => a.blueprint.department === department && a.status !== 'terminated');
    const current = deptAgents.length;
    let spawned = 0, terminated = 0;

    if (current < targetCount) {
      const bp = Array.from(this.blueprints.values()).find(b => b.department === department);
      if (bp) {
        for (let i = 0; i < targetCount - current; i++) {
          if (this.spawn(bp.id)) spawned++;
        }
      }
    } else if (current > targetCount) {
      const toTerminate = deptAgents.slice(targetCount);
      for (const agent of toTerminate) {
        if (this.terminate(agent.instanceId)) terminated++;
      }
    }

    return { spawned, terminated };
  }

  heartbeat(instanceId: string): void {
    const agent = this.instances.get(instanceId);
    if (agent) agent.heartbeat = new Date();
  }

  checkHealth(): Array<{ instanceId: string; issue: string }> {
    const issues: Array<{ instanceId: string; issue: string }> = [];
    const now = Date.now();
    for (const [id, agent] of this.instances) {
      if (agent.status === 'error') issues.push({ instanceId: id, issue: 'Agent in error state' });
      if (now - agent.heartbeat.getTime() > 60000) issues.push({ instanceId: id, issue: 'No heartbeat for 60s' });
    }
    return issues;
  }

  getInstance(id: string): LiveAgent | undefined { return this.instances.get(id); }
  getBlueprint(id: string): AgentBlueprint | undefined { return this.blueprints.get(id); }

  getStatus() {
    const instances = Array.from(this.instances.values());
    return {
      blueprints: this.blueprints.size,
      liveAgents: instances.length,
      active: instances.filter(a => a.status === 'active').length,
      booting: instances.filter(a => a.status === 'booting').length,
      errored: instances.filter(a => a.status === 'error').length,
      totalCreated: this.totalCreated,
      totalDestroyed: this.totalDestroyed,
      maxInstances: this.maxInstances,
      departments: [...new Set(instances.map(a => a.blueprint.department))],
      healthIssues: this.checkHealth().length,
    };
  }
}

export const agentFactory = new AgentFactory();
