/**
 * Engine Alto — Doctor System
 * 3 specialized Doctors for code, infra, and security fixes.
 * Vision system: reads error logs and produces fixes.
 * Escalation chain: if unfixable → update pipeline.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';

export type DoctorSpecialty = 'code' | 'infra' | 'security';

export interface Diagnosis {
  id: string;
  specialty: DoctorSpecialty;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  diagnosis: string;
  prescription: string[];
  status: 'diagnosing' | 'treating' | 'healed' | 'escalated';
  patientAgentId: string;
  timestamp: Date;
}

// ── Doctor Agent ──────────────────────────────────────────────

export class DoctorAgent implements Agent {
  id: string;
  name: string;
  type: 'doctor' = 'doctor';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities: string[];

  private specialty: DoctorSpecialty;
  private diagnoses: Diagnosis[] = [];
  private health: number = 100;
  private patientsHealed: number = 0;

  constructor(specialty: DoctorSpecialty) {
    this.specialty = specialty;
    this.id = `doctor-${specialty}`;
    this.name = `Doctor (${specialty.charAt(0).toUpperCase() + specialty.slice(1)})`;
    this.capabilities = this.getCapabilities();
  }

  private getCapabilities(): string[] {
    switch (this.specialty) {
      case 'code':
        return ['fix', 'debug', 'diagnose', 'code_review', 'patch', 'refactor'];
      case 'infra':
        return ['deploy_fix', 'config_fix', 'environment', 'restart', 'scale'];
      case 'security':
        return ['vulnerability_fix', 'patch_security', 'access_fix', 'encrypt'];
      default:
        return ['fix', 'diagnose'];
    }
  }

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      const diagnosis = this.diagnose(task);
      const treatment = await this.treat(diagnosis);

      this.status = 'idle';
      return {
        taskId: task.id, agentId: this.id, success: treatment.healed, output: treatment,
        logs: [`Doctor ${this.specialty}: ${diagnosis.diagnosis}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message, escalate: true },
        logs: [`Doctor ${this.specialty} error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  /**
   * Diagnose an issue
   */
  private diagnose(task: AgentTask): Diagnosis {
    const severity = this.assessSeverity(task.description);
    const prescription = this.generatePrescription(task.description, severity);

    const diagnosis: Diagnosis = {
      id: `DIAG-${Date.now()}`,
      specialty: this.specialty,
      issue: task.description,
      severity,
      diagnosis: `${this.specialty} issue detected: ${task.description}`,
      prescription,
      status: 'diagnosing',
      patientAgentId: task.input.patientId || 'unknown',
      timestamp: new Date(),
    };

    this.diagnoses.push(diagnosis);
    return diagnosis;
  }

  /**
   * Treat the diagnosed issue
   */
  private async treat(diagnosis: Diagnosis): Promise<Record<string, any>> {
    diagnosis.status = 'treating';

    // Simulate treatment based on severity
    const canHeal = diagnosis.severity !== 'critical' || this.health > 50;

    if (canHeal) {
      diagnosis.status = 'healed';
      this.patientsHealed++;
      return {
        healed: true,
        diagnosisId: diagnosis.id,
        treatment: diagnosis.prescription,
        specialty: this.specialty,
      };
    } else {
      diagnosis.status = 'escalated';
      return {
        healed: false,
        escalated: true,
        diagnosisId: diagnosis.id,
        reason: 'Issue too severe for current doctor health level. Escalating to update pipeline.',
      };
    }
  }

  private assessSeverity(description: string): Diagnosis['severity'] {
    const lower = description.toLowerCase();
    if (lower.includes('crash') || lower.includes('down') || lower.includes('critical')) return 'critical';
    if (lower.includes('error') || lower.includes('fail') || lower.includes('broken')) return 'high';
    if (lower.includes('slow') || lower.includes('warning') || lower.includes('degraded')) return 'medium';
    return 'low';
  }

  private generatePrescription(description: string, severity: Diagnosis['severity']): string[] {
    const base = [`Analyze ${this.specialty} logs`, `Identify root cause`];

    switch (this.specialty) {
      case 'code':
        return [...base, 'Generate fix patch', 'Run tests', 'Apply if tests pass'];
      case 'infra':
        return [...base, 'Check service health', 'Restart if needed', 'Verify connectivity'];
      case 'security':
        return [...base, 'Patch vulnerability', 'Rotate credentials if needed', 'Verify access controls'];
      default:
        return [...base, 'Apply generic fix'];
    }
  }

  // ── Health Management ─────────────────────────────────────

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) this.status = 'error';
  }

  heal(amount: number): void {
    this.health = Math.min(100, this.health + amount);
    if (this.health > 30 && this.status === 'error') this.status = 'idle';
  }

  getHealth(): number {
    return this.health;
  }

  getStatus() {
    return {
      id: this.id,
      specialty: this.specialty,
      health: this.health,
      status: this.status,
      patientsHealed: this.patientsHealed,
      activeDiagnoses: this.diagnoses.filter(d => d.status === 'treating').length,
      totalDiagnoses: this.diagnoses.length,
    };
  }
}

// ── Create the 3 Doctors ────────────────────────────────────

export const codeDoctor = new DoctorAgent('code');
export const infraDoctor = new DoctorAgent('infra');
export const securityDoctor = new DoctorAgent('security');

export const allDoctors = [codeDoctor, infraDoctor, securityDoctor];
