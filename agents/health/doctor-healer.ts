/**
 * Engine Alto — Doctor-Healer Network
 * 10 Doctor-Healers that specifically monitor and heal the Doctors.
 * Mutual healing pact: Doctors heal Doctor-Healers, Doctor-Healers heal Doctors.
 */

import { Agent, AgentTask, AgentResult } from '../orchestrator';
import { DoctorAgent } from './doctor';

export class DoctorHealer implements Agent {
  id: string;
  name: string;
  type: 'doctor' = 'doctor';
  status: 'idle' | 'active' | 'busy' | 'error' = 'idle';
  capabilities = ['heal_doctor', 'monitor_doctor', 'doctor_health_check'];

  private health: number = 100;
  private healingsDone: number = 0;
  private assignedDoctors: DoctorAgent[] = [];

  constructor(index: number) {
    this.id = `doctor-healer-${index}`;
    this.name = `Doctor-Healer #${index}`;
  }

  async process(task: AgentTask): Promise<AgentResult> {
    this.status = 'busy';
    const start = Date.now();

    try {
      let output: Record<string, any>;

      if (task.type === 'heal_doctor') {
        output = this.healDoctor(task.input.doctorIndex);
      } else if (task.type === 'check_doctors') {
        output = this.checkAllDoctors();
      } else {
        output = { action: 'monitoring_doctors' };
      }

      this.status = 'idle';
      return {
        taskId: task.id, agentId: this.id, success: true, output,
        logs: [`Healer ${this.id}: ${task.type}`], duration: Date.now() - start,
      };
    } catch (error: any) {
      this.status = 'error';
      return {
        taskId: task.id, agentId: this.id, success: false,
        output: { error: error.message },
        logs: [`Healer error: ${error.message}`], duration: Date.now() - start,
      };
    }
  }

  assignDoctors(doctors: DoctorAgent[]): void {
    this.assignedDoctors = doctors;
  }

  private healDoctor(doctorIndex: number): Record<string, any> {
    const doctor = this.assignedDoctors[doctorIndex];
    if (!doctor) return { healed: false, reason: 'Doctor not found' };

    const prevHealth = doctor.getHealth();
    doctor.heal(30);
    this.healingsDone++;

    return {
      healed: true,
      doctorId: doctor.id,
      prevHealth,
      newHealth: doctor.getHealth(),
      healerHealth: this.health,
    };
  }

  private checkAllDoctors(): Record<string, any> {
    const results = this.assignedDoctors.map(d => ({
      id: d.id,
      health: d.getHealth(),
      status: d.status,
      needsHealing: d.getHealth() < 70,
    }));

    return {
      doctorsChecked: results.length,
      needsHealing: results.filter(r => r.needsHealing).length,
      details: results,
    };
  }

  // Mutual healing: doctors can heal us too
  receiveHealing(amount: number): void {
    this.health = Math.min(100, this.health + amount);
    if (this.health > 30 && this.status === 'error') this.status = 'idle';
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) this.status = 'error';
  }

  getHealth(): number { return this.health; }

  getStatus() {
    return { id: this.id, health: this.health, healingsDone: this.healingsDone, assignedDoctors: this.assignedDoctors.length };
  }
}

// Create 10 Doctor-Healers
export const doctorHealers: DoctorHealer[] = Array.from({ length: 10 }, (_, i) => new DoctorHealer(i + 1));
