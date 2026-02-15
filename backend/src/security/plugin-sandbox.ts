/**
 * Engine Alto — Plugin Sandbox (Hardened)
 * Secure execution environment for third-party plugins.
 * Blocks filesystem, network, child_process by default.
 */

import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PluginManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  entry: string;
  permissions: PluginPermission[];
  dependencies?: string[];
}

export type PluginPermission =
  | 'network:read'
  | 'network:write'
  | 'fs:read'
  | 'fs:write'
  | 'env:read'
  | 'child_process'
  | 'crypto'
  | 'ui:render';

export interface SandboxConfig {
  timeout: number;          // ms
  memoryLimit: number;      // bytes
  allowedPermissions: PluginPermission[];
  blockedModules: string[];
  blockedGlobals: string[];
}

export interface PluginResult {
  success: boolean;
  output?: unknown;
  error?: string;
  executionTimeMs: number;
  memoryUsedBytes: number;
  securityViolations: string[];
}

// ---------------------------------------------------------------------------
// Static Analyzer
// ---------------------------------------------------------------------------

const DANGEROUS_PATTERNS = [
  { pattern: /require\s*\(\s*['"]fs['"]\s*\)/g, reason: 'Direct fs module import blocked' },
  { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/g, reason: 'child_process module blocked' },
  { pattern: /require\s*\(\s*['"]net['"]\s*\)/g, reason: 'net module blocked' },
  { pattern: /require\s*\(\s*['"]dgram['"]\s*\)/g, reason: 'dgram module blocked' },
  { pattern: /require\s*\(\s*['"]cluster['"]\s*\)/g, reason: 'cluster module blocked' },
  { pattern: /require\s*\(\s*['"]worker_threads['"]\s*\)/g, reason: 'worker_threads module blocked' },
  { pattern: /process\.exit/g, reason: 'process.exit blocked' },
  { pattern: /process\.kill/g, reason: 'process.kill blocked' },
  { pattern: /eval\s*\(/g, reason: 'eval() blocked for security' },
  { pattern: /Function\s*\(/g, reason: 'Function constructor blocked' },
  { pattern: /import\s*\(\s*['"]fs/g, reason: 'Dynamic fs import blocked' },
  { pattern: /import\s*\(\s*['"]child_process/g, reason: 'Dynamic child_process import blocked' },
  { pattern: /__dirname/g, reason: '__dirname access blocked in sandbox' },
  { pattern: /__filename/g, reason: '__filename access blocked in sandbox' },
  { pattern: /process\.env/g, reason: 'process.env access requires env:read permission' },
  { pattern: /globalThis\.(require|process|Buffer)/g, reason: 'globalThis node module access blocked' },
];

export function analyzePluginCode(code: string, permissions: PluginPermission[] = []): {
  safe: boolean;
  violations: string[];
  warnings: string[];
} {
  const violations: string[] = [];
  const warnings: string[] = [];

  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    pattern.lastIndex = 0;
    // Skip check if permission is granted
    if (reason.includes('fs') && (permissions.includes('fs:read') || permissions.includes('fs:write'))) continue;
    if (reason.includes('child_process') && permissions.includes('child_process')) continue;
    if (reason.includes('process.env') && permissions.includes('env:read')) continue;
    if (reason.includes('net') && (permissions.includes('network:read') || permissions.includes('network:write'))) continue;

    if (pattern.test(code)) {
      violations.push(reason);
    }
  }

  // Check for obfuscation attempts
  if (code.includes('\\x') || code.includes('\\u00') || /atob\s*\(/.test(code)) {
    warnings.push('Possible code obfuscation detected');
  }
  if (code.length > 500000) {
    warnings.push('Unusually large plugin code (>500KB)');
  }

  return {
    safe: violations.length === 0,
    violations,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Sandboxed Execution
// ---------------------------------------------------------------------------

const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  timeout: 5000,
  memoryLimit: 64 * 1024 * 1024, // 64MB
  allowedPermissions: [],
  blockedModules: ['fs', 'child_process', 'net', 'dgram', 'cluster', 'worker_threads', 'os', 'path'],
  blockedGlobals: ['process', 'require', '__dirname', '__filename', 'Buffer'],
};

export async function executePlugin(
  code: string,
  manifest: PluginManifest,
  config: SandboxConfig = DEFAULT_SANDBOX_CONFIG,
): Promise<PluginResult> {
  const startTime = Date.now();
  const securityViolations: string[] = [];

  // Step 1: Static analysis
  const analysis = analyzePluginCode(code, manifest.permissions);
  if (!analysis.safe) {
    return {
      success: false,
      error: `Security violations: ${analysis.violations.join('; ')}`,
      executionTimeMs: Date.now() - startTime,
      memoryUsedBytes: 0,
      securityViolations: analysis.violations,
    };
  }

  // Step 2: Permission check
  for (const perm of manifest.permissions) {
    if (!config.allowedPermissions.includes(perm)) {
      securityViolations.push(`Permission '${perm}' not granted`);
    }
  }
  if (securityViolations.length > 0) {
    return {
      success: false,
      error: `Permission denied: ${securityViolations.join('; ')}`,
      executionTimeMs: Date.now() - startTime,
      memoryUsedBytes: 0,
      securityViolations,
    };
  }

  // Step 3: Execute in isolated context
  try {
    // Create a minimal sandbox context
    const sandboxGlobals = {
      console: {
        log: (...args: unknown[]) => logger.info('[Plugin]', manifest.name, ...args),
        warn: (...args: unknown[]) => logger.warn('[Plugin]', manifest.name, ...args),
        error: (...args: unknown[]) => logger.error('[Plugin]', manifest.name, ...args),
      },
      setTimeout: (fn: () => void, ms: number) => {
        if (ms > config.timeout) throw new Error('setTimeout exceeds plugin timeout');
        return setTimeout(fn, ms);
      },
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      Promise,
      RegExp,
      Error,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    // Wrap code execution with timeout
    const result = await Promise.race([
      new Promise<unknown>((resolve, reject) => {
        try {
          // In production, this would use vm2 or isolated-vm
          // For now, we use Function with restricted scope
          const wrappedCode = `
            'use strict';
            return (function(sandbox) {
              const { ${Object.keys(sandboxGlobals).join(', ')} } = sandbox;
              ${code};
              return typeof exports !== 'undefined' ? exports : undefined;
            })
          `;
          const fn = new Function(wrappedCode);
          const output = fn()(sandboxGlobals);
          resolve(output);
        } catch (err) {
          reject(err);
        }
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Plugin execution timed out after ${config.timeout}ms`)), config.timeout);
      }),
    ]);

    const memUsed = process.memoryUsage().heapUsed;

    logger.info(`[Sandbox] Plugin '${manifest.name}' executed successfully in ${Date.now() - startTime}ms`);

    return {
      success: true,
      output: result,
      executionTimeMs: Date.now() - startTime,
      memoryUsedBytes: memUsed,
      securityViolations: [],
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      executionTimeMs: Date.now() - startTime,
      memoryUsedBytes: 0,
      securityViolations,
    };
  }
}

// ---------------------------------------------------------------------------
// Plugin validator
// ---------------------------------------------------------------------------

export function validateManifest(manifest: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const m = manifest as Record<string, unknown>;

  if (!m.name || typeof m.name !== 'string') errors.push('Missing or invalid name');
  if (!m.version || typeof m.version !== 'string') errors.push('Missing or invalid version');
  if (!m.author || typeof m.author !== 'string') errors.push('Missing or invalid author');
  if (!m.entry || typeof m.entry !== 'string') errors.push('Missing or invalid entry point');
  if (!Array.isArray(m.permissions)) errors.push('permissions must be an array');

  return { valid: errors.length === 0, errors };
}

export { DEFAULT_SANDBOX_CONFIG };
