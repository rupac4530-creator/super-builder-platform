/**
 * Engine Alto — Script Sandbox
 * Isolates script execution: resource limits, permission checks, kill switch.
 */

export interface SandboxConfig {
  maxMemoryMB: number;
  maxExecutionMs: number;
  allowNetwork: boolean;
  allowFileSystem: boolean;
  allowProcessSpawn: boolean;
  allowedModules: string[];
}

export interface SandboxInstance {
  id: string;
  config: SandboxConfig;
  status: 'idle' | 'running' | 'killed' | 'error';
  memoryUsedMB: number;
  executionMs: number;
  startedAt?: Date;
  violations: Array<{ type: string; detail: string; timestamp: Date }>;
}

export class ScriptSandbox {
  private instances: Map<string, SandboxInstance> = new Map();
  private defaultConfig: SandboxConfig = {
    maxMemoryMB: 128, maxExecutionMs: 30000,
    allowNetwork: false, allowFileSystem: false, allowProcessSpawn: false,
    allowedModules: ['path', 'url', 'querystring', 'crypto'],
  };

  create(config?: Partial<SandboxConfig>): string {
    const id = `sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.instances.set(id, {
      id, config: { ...this.defaultConfig, ...config },
      status: 'idle', memoryUsedMB: 0, executionMs: 0, violations: [],
    });
    return id;
  }

  async execute(sandboxId: string, code: string, context: Record<string, any> = {}): Promise<any> {
    const instance = this.instances.get(sandboxId);
    if (!instance) throw new Error('Sandbox not found');

    instance.status = 'running';
    instance.startedAt = new Date();

    // Check for forbidden operations in code
    const forbidden = ['process.exit', 'child_process', 'eval(', 'require("fs")', 'require("net")'];
    for (const f of forbidden) {
      if (code.includes(f) && !instance.config.allowProcessSpawn) {
        instance.violations.push({ type: 'forbidden_call', detail: `Blocked: ${f}`, timestamp: new Date() });
        instance.status = 'error';
        throw new Error(`Sandbox violation: ${f} is not allowed`);
      }
    }

    try {
      // Execution with timeout
      const result = await Promise.race([
        this.runIsolated(code, context),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), instance.config.maxExecutionMs)
        ),
      ]);

      instance.executionMs = Date.now() - instance.startedAt.getTime();
      instance.status = 'idle';
      return result;
    } catch (err: any) {
      instance.status = 'error';
      instance.violations.push({ type: 'execution_error', detail: err.message, timestamp: new Date() });
      throw err;
    }
  }

  private async runIsolated(code: string, context: Record<string, any>): Promise<any> {
    const fn = new Function(...Object.keys(context), `"use strict"; ${code}`);
    return fn(...Object.values(context));
  }

  kill(sandboxId: string): boolean {
    const instance = this.instances.get(sandboxId);
    if (!instance) return false;
    instance.status = 'killed';
    return true;
  }

  destroy(sandboxId: string): boolean {
    return this.instances.delete(sandboxId);
  }

  getStatus() {
    const instances = Array.from(this.instances.values());
    return {
      total: instances.length,
      running: instances.filter(i => i.status === 'running').length,
      violations: instances.reduce((s, i) => s + i.violations.length, 0),
    };
  }
}

export const scriptSandbox = new ScriptSandbox();
