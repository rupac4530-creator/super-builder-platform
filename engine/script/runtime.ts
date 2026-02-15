/**
 * Engine Alto — Scripting Runtime
 * JS execution environment with bindings, module system, and event dispatch.
 */

export interface ScriptModule {
  id: string;
  name: string;
  source: string;
  exports: Record<string, any>;
  loaded: boolean;
  dependencies: string[];
}

export interface ScriptBinding {
  name: string;
  type: 'function' | 'object' | 'constant';
  value: any;
}

export interface ScriptEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export class ScriptRuntime {
  private modules: Map<string, ScriptModule> = new Map();
  private bindings: Map<string, ScriptBinding> = new Map();
  private eventQueue: ScriptEvent[] = [];
  private eventHandlers: Map<string, Array<(data: any) => void>> = new Map();
  private executionCount: number = 0;
  private errors: Array<{ module: string; error: string; timestamp: Date }> = [];

  constructor() {
    this.registerDefaultBindings();
  }

  private registerDefaultBindings(): void {
    this.bind('console', 'object', {
      log: (...args: any[]) => console.log('[Script]', ...args),
      warn: (...args: any[]) => console.warn('[Script]', ...args),
      error: (...args: any[]) => console.error('[Script]', ...args),
    });
    this.bind('platform', 'object', {
      name: 'Engine Alto', version: '3.0.0',
    });
    this.bind('Math', 'object', Math);
  }

  bind(name: string, type: ScriptBinding['type'], value: any): void {
    this.bindings.set(name, { name, type, value });
  }

  loadModule(name: string, source: string, dependencies: string[] = []): string {
    const id = `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.modules.set(id, { id, name, source, exports: {}, loaded: false, dependencies });
    return id;
  }

  async executeModule(moduleId: string): Promise<any> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Module ${moduleId} not found`);

    // Check dependencies
    for (const dep of mod.dependencies) {
      const depMod = Array.from(this.modules.values()).find(m => m.name === dep);
      if (!depMod || !depMod.loaded) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }

    this.executionCount++;

    try {
      // Build execution context with bindings
      const context: Record<string, any> = {};
      for (const [name, binding] of this.bindings) {
        context[name] = binding.value;
      }

      // Inject module exports from dependencies
      for (const dep of mod.dependencies) {
        const depMod = Array.from(this.modules.values()).find(m => m.name === dep);
        if (depMod) context[dep] = depMod.exports;
      }

      // Sandboxed execution (real: V8 isolate)
      const fn = new Function(...Object.keys(context), 'module', mod.source);
      const moduleObj = { exports: {} };
      fn(...Object.values(context), moduleObj);

      mod.exports = moduleObj.exports;
      mod.loaded = true;
      return mod.exports;
    } catch (err: any) {
      this.errors.push({ module: mod.name, error: err.message, timestamp: new Date() });
      throw err;
    }
  }

  emit(type: string, data: any): void {
    this.eventQueue.push({ type, data, timestamp: new Date() });
    const handlers = this.eventHandlers.get(type) || [];
    for (const handler of handlers) {
      try { handler(data); } catch { /* handler error */ }
    }
  }

  on(type: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(type)) this.eventHandlers.set(type, []);
    this.eventHandlers.get(type)!.push(handler);
  }

  getModule(id: string): ScriptModule | undefined { return this.modules.get(id); }

  getStatus() {
    return {
      modules: this.modules.size,
      loaded: Array.from(this.modules.values()).filter(m => m.loaded).length,
      bindings: this.bindings.size,
      executions: this.executionCount,
      errors: this.errors.length,
      eventTypes: this.eventHandlers.size,
    };
  }
}

export const scriptRuntime = new ScriptRuntime();
