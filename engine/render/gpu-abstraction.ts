/**
 * Engine Alto — GPU Abstraction Layer
 * Backend-agnostic GPU interface: Vulkan, DX12, Metal, WebGPU, software fallback.
 */

export type GPUBackendType = 'vulkan' | 'directx12' | 'metal' | 'webgpu' | 'opengl' | 'software';

export interface GPUBuffer {
  id: string;
  size: number;
  usage: 'vertex' | 'index' | 'uniform' | 'storage';
  mapped: boolean;
}

export interface GPUTexture {
  id: string;
  width: number;
  height: number;
  format: 'rgba8' | 'rgba16f' | 'depth24' | 'bc7';
  mipLevels: number;
}

export interface GPUShader {
  id: string;
  type: 'vertex' | 'fragment' | 'compute';
  compiled: boolean;
  source: string;
}

export interface RenderPass {
  id: string;
  colorAttachments: string[];
  depthAttachment?: string;
  clearColor: [number, number, number, number];
}

export class GPUAbstraction {
  private backend: GPUBackendType;
  private buffers: Map<string, GPUBuffer> = new Map();
  private textures: Map<string, GPUTexture> = new Map();
  private shaders: Map<string, GPUShader> = new Map();
  private passes: Map<string, RenderPass> = new Map();
  private frameCount: number = 0;
  private initialized: boolean = false;

  constructor(preferred?: GPUBackendType) {
    this.backend = preferred || this.autoDetect();
  }

  private autoDetect(): GPUBackendType {
    const p = process.platform;
    if (p === 'win32') return 'directx12';
    if (p === 'darwin') return 'metal';
    if (p === 'linux') return 'vulkan';
    return 'software';
  }

  async init(): Promise<boolean> {
    // Simulated GPU initialization
    this.initialized = true;
    return true;
  }

  createBuffer(usage: GPUBuffer['usage'], size: number): string {
    const id = `buf-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.buffers.set(id, { id, size, usage, mapped: false });
    return id;
  }

  createTexture(width: number, height: number, format: GPUTexture['format'] = 'rgba8', mips: number = 1): string {
    const id = `tex-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.textures.set(id, { id, width, height, format, mipLevels: mips });
    return id;
  }

  compileShader(type: GPUShader['type'], source: string): string {
    const id = `shader-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.shaders.set(id, { id, type, compiled: true, source });
    return id;
  }

  createRenderPass(colorAttachments: string[], depthAttachment?: string): string {
    const id = `pass-${Date.now()}`;
    this.passes.set(id, { id, colorAttachments, depthAttachment, clearColor: [0, 0, 0, 1] });
    return id;
  }

  beginFrame(): void { this.frameCount++; }
  endFrame(): void { /* present / swap */ }
  destroy(resourceId: string): void {
    this.buffers.delete(resourceId);
    this.textures.delete(resourceId);
    this.shaders.delete(resourceId);
  }

  getStatus() {
    return {
      backend: this.backend, initialized: this.initialized,
      buffers: this.buffers.size, textures: this.textures.size,
      shaders: this.shaders.size, passes: this.passes.size,
      frameCount: this.frameCount,
    };
  }
}

export const gpu = new GPUAbstraction();
