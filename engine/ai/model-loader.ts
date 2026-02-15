/**
 * Engine Alto — Model Loader
 * Load, cache, and manage AI models: ONNX, TensorFlow, PyTorch, GGUF.
 */

export type ModelFormat = 'onnx' | 'tensorflow' | 'pytorch' | 'gguf' | 'safetensors' | 'custom';
export type ModelPrecision = 'f32' | 'f16' | 'int8' | 'int4';

export interface ModelManifest {
  id: string;
  name: string;
  version: string;
  format: ModelFormat;
  precision: ModelPrecision;
  sizeBytes: number;
  inputShape: number[];
  outputShape: number[];
  parameters: number;
  metadata: Record<string, any>;
}

export interface LoadedModel {
  manifest: ModelManifest;
  status: 'loading' | 'ready' | 'error' | 'unloaded';
  loadedAt: Date;
  inferenceCount: number;
  avgInferenceMs: number;
  memoryUsedMB: number;
}

export class ModelLoader {
  private models: Map<string, LoadedModel> = new Map();
  private cache: Map<string, Uint8Array | null> = new Map();
  private maxCacheSizeMB: number = 4096;

  async load(manifest: ModelManifest): Promise<string> {
    if (this.models.has(manifest.id)) return manifest.id;

    const model: LoadedModel = {
      manifest, status: 'loading', loadedAt: new Date(),
      inferenceCount: 0, avgInferenceMs: 0,
      memoryUsedMB: Math.round(manifest.sizeBytes / (1024 * 1024)),
    };

    this.models.set(manifest.id, model);

    try {
      // Simulated loading (real: read file, parse weights, allocate GPU memory)
      await new Promise(r => setTimeout(r, 10));
      model.status = 'ready';
    } catch (err) {
      model.status = 'error';
    }

    return manifest.id;
  }

  unload(modelId: string): boolean {
    const model = this.models.get(modelId);
    if (!model) return false;
    model.status = 'unloaded';
    this.models.delete(modelId);
    this.cache.delete(modelId);
    return true;
  }

  getModel(id: string): LoadedModel | undefined { return this.models.get(id); }

  recordInference(modelId: string, durationMs: number): void {
    const model = this.models.get(modelId);
    if (!model) return;
    model.inferenceCount++;
    model.avgInferenceMs = (model.avgInferenceMs * (model.inferenceCount - 1) + durationMs) / model.inferenceCount;
  }

  listModels(): ModelManifest[] {
    return Array.from(this.models.values()).map(m => m.manifest);
  }

  getStatus() {
    const models = Array.from(this.models.values());
    return {
      loaded: models.filter(m => m.status === 'ready').length,
      total: models.length,
      totalMemoryMB: models.reduce((s, m) => s + m.memoryUsedMB, 0),
      totalInferences: models.reduce((s, m) => s + m.inferenceCount, 0),
      cacheEntries: this.cache.size,
      models: models.map(m => ({
        id: m.manifest.id, name: m.manifest.name, status: m.status,
        format: m.manifest.format, memory: m.memoryUsedMB, inferences: m.inferenceCount,
      })),
    };
  }
}

export const modelLoader = new ModelLoader();
