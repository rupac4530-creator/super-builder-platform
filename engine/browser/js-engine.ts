/**
 * Engine Alto — JS Engine (V8-like)
 * JavaScript execution context, garbage collection, JIT hints.
 */

export interface ExecutionContext {
  id: string;
  global: Record<string, any>;
  callStack: string[];
  heapSizeMB: number;
  gcCycles: number;
  executionCount: number;
}

export interface GCStats {
  totalCollections: number;
  totalPausesMs: number;
  lastPauseMs: number;
  heapUsedMB: number;
  heapLimitMB: number;
}

export class JSEngine {
  private contexts: Map<string, ExecutionContext> = new Map();
  private gcStats: GCStats = {
    totalCollections: 0, totalPausesMs: 0, lastPauseMs: 0,
    heapUsedMB: 0, heapLimitMB: 512,
  };

  createContext(globals: Record<string, any> = {}): string {
    const id = `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.contexts.set(id, {
      id,
      global: {
        console: { log: (...a: any[]) => {}, warn: (...a: any[]) => {}, error: (...a: any[]) => {} },
        setTimeout: () => {}, setInterval: () => {}, clearTimeout: () => {},
        Math, JSON, Date, Array, Object, String, Number, Boolean, Map, Set, Promise,
        ...globals,
      },
      callStack: [], heapSizeMB: 0, gcCycles: 0, executionCount: 0,
    });
    return id;
  }

  async execute(contextId: string, code: string): Promise<any> {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new Error('Context not found');

    ctx.executionCount++;
    ctx.callStack.push(`<eval:${ctx.executionCount}>`);

    try {
      const fn = new Function(...Object.keys(ctx.global), `"use strict"; return (async () => { ${code} })()`);
      const result = await fn(...Object.values(ctx.global));

      this.updateHeap(ctx);
      return result;
    } finally {
      ctx.callStack.pop();
    }
  }

  private updateHeap(ctx: ExecutionContext): void {
    const mem = process.memoryUsage();
    ctx.heapSizeMB = Math.round(mem.heapUsed / (1024 * 1024));
    this.gcStats.heapUsedMB = ctx.heapSizeMB;

    // Auto GC if high
    if (ctx.heapSizeMB > this.gcStats.heapLimitMB * 0.8) {
      this.runGC(ctx);
    }
  }

  private runGC(ctx: ExecutionContext): void {
    const start = Date.now();
    if (global.gc) global.gc();
    const pause = Date.now() - start;
    this.gcStats.totalCollections++;
    this.gcStats.totalPausesMs += pause;
    this.gcStats.lastPauseMs = pause;
    ctx.gcCycles++;
  }

  destroyContext(contextId: string): boolean {
    return this.contexts.delete(contextId);
  }

  getStatus() {
    return {
      contexts: this.contexts.size,
      gc: { ...this.gcStats },
      totalExecutions: Array.from(this.contexts.values()).reduce((s, c) => s + c.executionCount, 0),
    };
  }
}

export const jsEngine = new JSEngine();
