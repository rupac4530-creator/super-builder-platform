/**
 * Engine Alto — Logger
 * Structured logging with levels, namespaces, rotation, and export.
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  namespace: string;
  message: string;
  data?: any;
  traceId?: string;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5,
};

export class Logger {
  private entries: LogEntry[] = [];
  private maxEntries: number = 10000;
  private minLevel: LogLevel = 'info';
  private listeners: Array<(entry: LogEntry) => void> = [];

  constructor(private namespace: string = 'alto') {}

  setLevel(level: LogLevel): void { this.minLevel = level; }

  child(name: string): Logger {
    const child = new Logger(`${this.namespace}:${name}`);
    child.minLevel = this.minLevel;
    child.listeners = this.listeners;
    child.entries = this.entries; // shared buffer
    return child;
  }

  private log(level: LogLevel, message: string, data?: any, traceId?: string): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;

    const entry: LogEntry = {
      timestamp: new Date(), level, namespace: this.namespace, message, data, traceId,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-Math.round(this.maxEntries * 0.8));
    }

    for (const listener of this.listeners) {
      try { listener(entry); } catch { /* listener error */ }
    }
  }

  trace(msg: string, data?: any): void { this.log('trace', msg, data); }
  debug(msg: string, data?: any): void { this.log('debug', msg, data); }
  info(msg: string, data?: any): void { this.log('info', msg, data); }
  warn(msg: string, data?: any): void { this.log('warn', msg, data); }
  error(msg: string, data?: any): void { this.log('error', msg, data); }
  fatal(msg: string, data?: any): void { this.log('fatal', msg, data); }

  onLog(listener: (entry: LogEntry) => void): void {
    this.listeners.push(listener);
  }

  query(options: { level?: LogLevel; namespace?: string; since?: Date; limit?: number }): LogEntry[] {
    let results = this.entries;
    if (options.level) {
      const minOrder = LEVEL_ORDER[options.level];
      results = results.filter(e => LEVEL_ORDER[e.level] >= minOrder);
    }
    if (options.namespace) results = results.filter(e => e.namespace.includes(options.namespace!));
    if (options.since) results = results.filter(e => e.timestamp >= options.since!);
    if (options.limit) results = results.slice(-options.limit);
    return results;
  }

  export(): string {
    return this.entries.map(e =>
      `[${e.timestamp.toISOString()}] [${e.level.toUpperCase()}] [${e.namespace}] ${e.message}${e.data ? ' ' + JSON.stringify(e.data) : ''}`
    ).join('\n');
  }

  getStatus() {
    return {
      namespace: this.namespace,
      totalEntries: this.entries.length,
      errors: this.entries.filter(e => e.level === 'error' || e.level === 'fatal').length,
      warnings: this.entries.filter(e => e.level === 'warn').length,
      minLevel: this.minLevel,
    };
  }
}

export const logger = new Logger('alto');
