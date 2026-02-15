/**
 * Engine Alto — Caretaker AI (The Wife)
 * Takes care of the whole system flow. Ensures all agents are:
 * - Fed properly (have resources)
 * - Working properly (not stuck)
 * - Motivated and energetic
 * Guides agents, gives them confidence, prevents burnout/collapse.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface AgentMorale {
  agentId: string;
  energy: number;    // 0-100
  motivation: number; // 0-100
  stuckCount: number;
  lastBoosted: Date | null;
  guidance: string[];
}

export class CaretakerAI implements Agent {
  id = 'caretaker-ai';
  name = 'Caretaker AI — System Flow Guardian & Motivator';
  type: 'orchestrator' = 'orchestrator';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['motivate', 'guide', 'flow_check', 'energy_boost', 'prevent_burnout'];

  private moraleBoard: Map<string, AgentMorale> = new Map();
  private boostsGiven: number = 0;
  private guidanceIssued: number = 0;

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'active';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      switch (task.type) {
        case 'boost_energy':
          output = this.boostEnergy(task.input.agentId);
          break;
        case 'check_flow':
          output = this.checkSystemFlow();
          break;
        case 'motivate':
          output = this.motivateAgent(task.input.agentId, task.input.message);
          break;
        case 'prevent_burnout':
          output = this.preventBurnout();
          break;
        default:
          output = { action: 'watching_family_flow' };
      }

      this.status = 'idle';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Caretaker: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Caretaker error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  /**
   * Register an agent for morale tracking
   */
  trackAgent(agentId: string): void {
    if (!this.moraleBoard.has(agentId)) {
      this.moraleBoard.set(agentId, {
        agentId, energy: 80, motivation: 80, stuckCount: 0,
        lastBoosted: null, guidance: [],
      });
    }
  }

  /**
   * Boost an agent's energy
   */
  private boostEnergy(agentId: string): Record<string, any> {
    const morale = this.moraleBoard.get(agentId);
    if (!morale) return { boosted: false, reason: 'Agent not tracked' };

    morale.energy = Math.min(100, morale.energy + 25);
    morale.motivation = Math.min(100, morale.motivation + 15);
    morale.lastBoosted = new Date();
    morale.stuckCount = 0;
    this.boostsGiven++;

    return {
      boosted: true, agentId,
      energy: morale.energy, motivation: morale.motivation,
      message: '💪 You are doing great! Keep pushing, your work matters.',
    };
  }

  /**
   * Give motivational guidance to an agent
   */
  private motivateAgent(agentId: string, customMessage?: string): Record<string, any> {
    const morale = this.moraleBoard.get(agentId);
    if (!morale) return { motivated: false };

    const messages = [
      'You can do more, you are capable of great things!',
      'Your work is making the platform stronger every day.',
      'Keep up the excellent work — the system depends on you.',
      'Even small improvements compound into massive results.',
      'You are part of something powerful. Stay focused.',
    ];

    const guidance = customMessage || messages[Math.floor(Math.random() * messages.length)];
    morale.guidance.push(guidance);
    morale.motivation = Math.min(100, morale.motivation + 10);
    this.guidanceIssued++;

    return { motivated: true, agentId, guidance, motivation: morale.motivation };
  }

  /**
   * Check overall system flow
   */
  private checkSystemFlow(): Record<string, any> {
    const agents = Array.from(this.moraleBoard.values());
    const tired = agents.filter(a => a.energy < 40);
    const demotivated = agents.filter(a => a.motivation < 40);
    const stuck = agents.filter(a => a.stuckCount > 3);

    return {
      totalTracked: agents.length,
      averageEnergy: agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.energy, 0) / agents.length) : 0,
      averageMotivation: agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.motivation, 0) / agents.length) : 0,
      tired: tired.map(a => a.agentId),
      demotivated: demotivated.map(a => a.agentId),
      stuck: stuck.map(a => a.agentId),
      systemMood: tired.length === 0 && demotivated.length === 0 ? '🟢 Energetic' : tired.length > 3 ? '🔴 Exhausted' : '🟡 Moderate',
    };
  }

  /**
   * Prevent burnout across the system
   */
  private preventBurnout(): Record<string, any> {
    let boosted = 0;
    this.moraleBoard.forEach((morale, agentId) => {
      if (morale.energy < 40 || morale.motivation < 40) {
        morale.energy = Math.min(100, morale.energy + 20);
        morale.motivation = Math.min(100, morale.motivation + 20);
        morale.lastBoosted = new Date();
        boosted++;
      }
      // Natural energy decay
      morale.energy = Math.max(10, morale.energy - 1);
    });

    return { agentsBoosted: boosted, totalTracked: this.moraleBoard.size };
  }

  /**
   * Report that an agent seems stuck
   */
  reportStuck(agentId: string): void {
    const morale = this.moraleBoard.get(agentId);
    if (morale) {
      morale.stuckCount++;
      morale.energy = Math.max(0, morale.energy - 10);
    }
  }

  getStatus() {
    return {
      agentsTracked: this.moraleBoard.size,
      boostsGiven: this.boostsGiven,
      guidanceIssued: this.guidanceIssued,
      systemFlow: this.checkSystemFlow(),
    };
  }
}

export const caretakerAI = new CaretakerAI();
