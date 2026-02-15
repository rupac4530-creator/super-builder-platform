/**
 * Engine Alto — Ethical Hackers Department
 * 15 AI ethical hackers continuously trying to penetrate the system.
 * Reports go to reporter → doctors.
 * Auto-scales: +1 hacker per 10 users.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export interface PenTestResult {
  id: string;
  hackerId: string;
  target: string;
  attackType: string;
  success: boolean; // true = vulnerability found
  vulnerability?: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  recommendation: string;
}

// ── Ethical Hacker Agent ──────────────────────────────────────

export class EthicalHacker implements Agent {
  id: string;
  name: string;
  type: 'security' = 'security';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['penetration_test', 'vulnerability_scan', 'exploit_check', 'injection_test'];

  private testResults: PenTestResult[] = [];
  private vulnerabilitiesFound: number = 0;

  constructor(index: number) {
    this.id = `ethical-hacker-${index}`;
    this.name = `Ethical Hacker #${index}`;
  }

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      const result = this.runPenTest(task.input.target || 'platform', task.input.attackType || 'general');

      this.status = 'active';
      return {
        taskId: task.id, agentId: this.id, success: true,
        output: result,
        logs: [`Hacker ${this.id}: tested ${result.target} with ${result.attackType}`],
        duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Hacker error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  private runPenTest(target: string, attackType: string): PenTestResult {
    // Simulate penetration testing
    const attacks = ['sql_injection', 'xss', 'csrf', 'auth_bypass', 'path_traversal', 'ssrf', 'rce', 'dos'];
    const actualAttack = attacks.includes(attackType) ? attackType : attacks[Math.floor(Math.random() * attacks.length)];

    // Random vulnerability detection (simulated)
    const foundVulnerability = Math.random() < 0.15; // 15% chance of finding something

    const result: PenTestResult = {
      id: `PEN-${Date.now()}-${this.id}`,
      hackerId: this.id,
      target,
      attackType: actualAttack,
      success: foundVulnerability,
      severity: foundVulnerability ? this.randomSeverity() : 'info',
      timestamp: new Date(),
      recommendation: foundVulnerability
        ? `Patch ${actualAttack} vulnerability in ${target}. Apply input sanitization and access controls.`
        : `${target} passed ${actualAttack} test. No issues found.`,
    };

    if (foundVulnerability) {
      result.vulnerability = `Potential ${actualAttack} vector in ${target}`;
      this.vulnerabilitiesFound++;
    }

    this.testResults.push(result);
    return result;
  }

  private randomSeverity(): PenTestResult['severity'] {
    const r = Math.random();
    if (r < 0.1) return 'critical';
    if (r < 0.3) return 'high';
    if (r < 0.6) return 'medium';
    return 'low';
  }

  getStatus() {
    return {
      id: this.id,
      tests: this.testResults.length,
      vulnerabilitiesFound: this.vulnerabilitiesFound,
      lastTest: this.testResults[this.testResults.length - 1]?.timestamp || null,
    };
  }
}

// ── Hacker Department Manager ─────────────────────────────────

export class HackerDepartment {
  private hackers: EthicalHacker[] = [];
  private baseCount: number = 15;
  private allResults: PenTestResult[] = [];

  constructor() {
    for (let i = 1; i <= this.baseCount; i++) {
      this.hackers.push(new EthicalHacker(i));
    }
  }

  /**
   * Scale hackers based on user count (+1 per 10 users)
   */
  scaleForUsers(userCount: number): number {
    const needed = this.baseCount + Math.floor(userCount / 10);
    while (this.hackers.length < needed) {
      this.hackers.push(new EthicalHacker(this.hackers.length + 1));
    }
    return this.hackers.length;
  }

  getHackers(): EthicalHacker[] {
    return this.hackers;
  }

  collectResults(result: PenTestResult): void {
    this.allResults.push(result);
  }

  getStatus() {
    return {
      totalHackers: this.hackers.length,
      activeHackers: this.hackers.filter(h => h.status !== 'error').length,
      totalTests: this.allResults.length,
      vulnerabilities: this.allResults.filter(r => r.success).length,
      criticalFindings: this.allResults.filter(r => r.severity === 'critical').length,
    };
  }
}

export const hackerDepartment = new HackerDepartment();
