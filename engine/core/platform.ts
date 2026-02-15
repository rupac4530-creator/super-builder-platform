/**
 * Engine Alto — Platform Abstraction Layer
 * Cross-platform detection, capability probing, resource management.
 */

export type PlatformOS = 'windows' | 'linux' | 'macos' | 'android' | 'ios' | 'web' | 'unknown';
export type GPUBackend = 'vulkan' | 'directx12' | 'metal' | 'webgpu' | 'opengl' | 'software';

export interface PlatformInfo {
  os: PlatformOS;
  arch: string;
  cpuCores: number;
  totalMemoryMB: number;
  availableMemoryMB: number;
  gpuBackend: GPUBackend;
  gpuName: string;
  gpuMemoryMB: number;
  hasGPU: boolean;
  nodeVersion: string;
  features: string[];
}

export interface ResourceLimits {
  maxMemoryMB: number;
  maxCPUPercent: number;
  maxGPUPercent: number;
  maxDiskMB: number;
  maxConcurrentJobs: number;
}

export class Platform {
  private info: PlatformInfo;
  private limits: ResourceLimits;

  constructor() {
    this.info = this.detect();
    this.limits = this.defaultLimits();
  }

  private detect(): PlatformInfo {
    const os = process.platform;
    const osMap: Record<string, PlatformOS> = {
      win32: 'windows', linux: 'linux', darwin: 'macos',
    };

    const totalMem = Math.round(require('os').totalmem() / (1024 * 1024));
    const freeMem = Math.round(require('os').freemem() / (1024 * 1024));
    const cpus = require('os').cpus();

    return {
      os: osMap[os] || 'unknown',
      arch: process.arch,
      cpuCores: cpus.length,
      totalMemoryMB: totalMem,
      availableMemoryMB: freeMem,
      gpuBackend: this.detectGPU(),
      gpuName: 'Auto-detected',
      gpuMemoryMB: 0,
      hasGPU: true,
      nodeVersion: process.version,
      features: this.detectFeatures(),
    };
  }

  private detectGPU(): GPUBackend {
    switch (this.info?.os || process.platform) {
      case 'windows': return 'directx12';
      case 'macos': return 'metal';
      case 'linux': return 'vulkan';
      default: return 'webgpu';
    }
  }

  private detectFeatures(): string[] {
    const features = ['node', 'async', 'worker_threads', 'streams'];
    try { require('worker_threads'); features.push('worker_threads_available'); } catch { /* */ }
    try { require('crypto'); features.push('crypto'); } catch { /* */ }
    return features;
  }

  private defaultLimits(): ResourceLimits {
    return {
      maxMemoryMB: Math.round(this.info.totalMemoryMB * 0.7),
      maxCPUPercent: 80,
      maxGPUPercent: 90,
      maxDiskMB: 10240,
      maxConcurrentJobs: this.info.cpuCores * 2,
    };
  }

  setLimits(limits: Partial<ResourceLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  canAllocate(memoryMB: number): boolean {
    return this.info.availableMemoryMB > memoryMB;
  }

  getInfo(): PlatformInfo { return { ...this.info }; }
  getLimits(): ResourceLimits { return { ...this.limits }; }

  getStatus() {
    const currentMem = Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
    return {
      platform: this.info.os,
      arch: this.info.arch,
      cpuCores: this.info.cpuCores,
      memoryUsedMB: currentMem,
      memoryTotalMB: this.info.totalMemoryMB,
      memoryPercent: Math.round((currentMem / this.info.totalMemoryMB) * 100),
      gpuBackend: this.info.gpuBackend,
      nodeVersion: this.info.nodeVersion,
      features: this.info.features.length,
    };
  }
}

export const platform = new Platform();
