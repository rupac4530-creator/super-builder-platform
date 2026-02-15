/**
 * Engine Alto — Shader Pipeline
 * SPIR-V compilation, cross-compilation, caching, hot-reload.
 */

export interface ShaderSource {
  id: string;
  name: string;
  language: 'glsl' | 'hlsl' | 'wgsl' | 'spv';
  vertexSource: string;
  fragmentSource: string;
  computeSource?: string;
  uniforms: ShaderUniform[];
  compiled: boolean;
  compiledAt?: Date;
}

export interface ShaderUniform {
  name: string;
  type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat4' | 'sampler2D' | 'int';
  binding: number;
  value?: any;
}

export interface ShaderCache {
  spirvHash: string;
  compiledBinary: Uint8Array | null;
  lastAccess: Date;
}

export class ShaderPipeline {
  private shaders: Map<string, ShaderSource> = new Map();
  private cache: Map<string, ShaderCache> = new Map();
  private hotReloadEnabled: boolean = true;

  create(name: string, vertex: string, fragment: string, uniforms: ShaderUniform[] = []): string {
    const id = `shader-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.shaders.set(id, {
      id, name, language: 'glsl', vertexSource: vertex, fragmentSource: fragment,
      uniforms, compiled: false,
    });
    return id;
  }

  compile(shaderId: string): boolean {
    const shader = this.shaders.get(shaderId);
    if (!shader) return false;

    // Simulated compilation (real: invoke glslang → SPIR-V)
    shader.compiled = true;
    shader.compiledAt = new Date();

    const hash = `spv-${shaderId}-${Date.now()}`;
    this.cache.set(hash, { spirvHash: hash, compiledBinary: null, lastAccess: new Date() });
    return true;
  }

  compileAll(): { compiled: number; failed: number } {
    let compiled = 0, failed = 0;
    for (const [id] of this.shaders) {
      if (this.compile(id)) compiled++;
      else failed++;
    }
    return { compiled, failed };
  }

  setUniform(shaderId: string, uniformName: string, value: any): boolean {
    const shader = this.shaders.get(shaderId);
    if (!shader) return false;
    const uniform = shader.uniforms.find(u => u.name === uniformName);
    if (!uniform) return false;
    uniform.value = value;
    return true;
  }

  getShader(id: string): ShaderSource | undefined { return this.shaders.get(id); }

  // Built-in shaders
  createPBR(): string {
    return this.create('PBR Standard', PBR_VERTEX, PBR_FRAGMENT, [
      { name: 'albedo', type: 'vec4', binding: 0, value: [1, 1, 1, 1] },
      { name: 'metallic', type: 'float', binding: 1, value: 0.0 },
      { name: 'roughness', type: 'float', binding: 2, value: 0.5 },
      { name: 'mvp', type: 'mat4', binding: 3 },
    ]);
  }

  createUnlit(): string {
    return this.create('Unlit', UNLIT_VERTEX, UNLIT_FRAGMENT, [
      { name: 'color', type: 'vec4', binding: 0, value: [1, 1, 1, 1] },
      { name: 'mvp', type: 'mat4', binding: 1 },
    ]);
  }

  getStatus() {
    return {
      totalShaders: this.shaders.size,
      compiled: Array.from(this.shaders.values()).filter(s => s.compiled).length,
      cacheEntries: this.cache.size,
      hotReload: this.hotReloadEnabled,
    };
  }
}

const PBR_VERTEX = `#version 450
layout(binding=3) uniform MVP { mat4 mvp; };
layout(location=0) in vec3 pos;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 uv;
layout(location=0) out vec3 vNormal;
layout(location=1) out vec2 vUV;
void main() { gl_Position = mvp * vec4(pos, 1.0); vNormal = normal; vUV = uv; }`;

const PBR_FRAGMENT = `#version 450
layout(binding=0) uniform Albedo { vec4 albedo; };
layout(binding=1) uniform Metallic { float metallic; };
layout(binding=2) uniform Roughness { float roughness; };
layout(location=0) in vec3 vNormal;
layout(location=1) in vec2 vUV;
layout(location=0) out vec4 outColor;
void main() { float nDotL = max(dot(normalize(vNormal), vec3(0,1,0)), 0.1); outColor = albedo * nDotL; }`;

const UNLIT_VERTEX = `#version 450
layout(binding=1) uniform MVP { mat4 mvp; };
layout(location=0) in vec3 pos;
void main() { gl_Position = mvp * vec4(pos, 1.0); }`;

const UNLIT_FRAGMENT = `#version 450
layout(binding=0) uniform Color { vec4 color; };
layout(location=0) out vec4 outColor;
void main() { outColor = color; }`;

export const shaderPipeline = new ShaderPipeline();
