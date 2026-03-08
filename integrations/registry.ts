/**
 * Integration Registry — Central registry for all integration adapters.
 * Manages lifecycle (install, start, stop, health) for all integrations.
 */

import { BaseAdapter, IntegrationCategory, IntegrationHealth, IntegrationStatus } from './base-adapter';

// Import all adapters
import { LangChainAdapter } from './agents/langchain';
import { LlamaIndexAdapter } from './agents/llamaindex';
import { AutoGenAdapter } from './agents/autogen';
import { MetaGPTAdapter } from './agents/metagpt';
import { BabyAGIAdapter } from './agents/babyagi';
import { SuperAGIAdapter } from './agents/superagi';
import { FAISSAdapter } from './vector-db/faiss';
import { MilvusAdapter } from './vector-db/milvus';
import { WeaviateAdapter } from './vector-db/weaviate';
import { ChromaAdapter } from './vector-db/chroma';
import { OnnxRuntimeAdapter } from './model-runtime/onnx-runtime';
import { VLLMAdapter } from './model-runtime/vllm';
import { TritonAdapter } from './model-runtime/triton';
import { BentoMLAdapter } from './model-runtime/bentoml';
import { LlamaCppAdapter } from './model-runtime/llama-cpp';
import { DiffusersAdapter } from './generative-media/diffusers';
import { ComfyUIAdapter } from './generative-media/comfyui';
import { WhisperAdapter } from './generative-media/whisper';
import { CoquiTTSAdapter } from './generative-media/coqui-tts';
import { BlenderAdapter } from './3d-nerf/blender';
import { InstantNGPAdapter } from './3d-nerf/instant-ngp';
import { NerfstudioAdapter } from './3d-nerf/nerfstudio';
import { GodotAdapter } from './game-engine/godot';
import { MLflowAdapter } from './mlops/mlflow';
import { AirflowAdapter } from './mlops/airflow';
import { KServeAdapter } from './serving/kserve';
import { RayAdapter } from './serving/ray';
import { PrometheusGrafanaAdapter } from './observability/prometheus-grafana';
import { ROS2Adapter } from './robotics/ros2';
import { CARLAAdapter } from './robotics/carla';
import { GazeboAdapter } from './robotics/gazebo';
import { LLMStudioAdapter } from './llm-studio/llm-studio';

export class IntegrationRegistry {
    private adapters: Map<string, BaseAdapter> = new Map();

    constructor() {
        this.registerAll();
    }

    private registerAll() {
        const all: BaseAdapter[] = [
            // Agent Orchestration
            new LangChainAdapter(), new LlamaIndexAdapter(), new AutoGenAdapter(),
            new MetaGPTAdapter(), new BabyAGIAdapter(), new SuperAGIAdapter(),
            // Vector DBs
            new FAISSAdapter(), new MilvusAdapter(), new WeaviateAdapter(), new ChromaAdapter(),
            // Model Runtimes
            new OnnxRuntimeAdapter(), new VLLMAdapter(), new TritonAdapter(),
            new BentoMLAdapter(), new LlamaCppAdapter(),
            // Generative Media
            new DiffusersAdapter(), new ComfyUIAdapter(), new WhisperAdapter(), new CoquiTTSAdapter(),
            // 3D / NeRF
            new BlenderAdapter(), new InstantNGPAdapter(), new NerfstudioAdapter(),
            // Game Engine
            new GodotAdapter(),
            // MLOps
            new MLflowAdapter(), new AirflowAdapter(),
            // Serving
            new KServeAdapter(), new RayAdapter(),
            // Observability
            new PrometheusGrafanaAdapter(),
            // Robotics
            new ROS2Adapter(), new CARLAAdapter(), new GazeboAdapter(),
            // Local Model Runtimes
            new LLMStudioAdapter(),
        ];

        for (const adapter of all) {
            this.adapters.set(adapter.config.name, adapter);
        }
    }

    getAll(): { name: string; config: BaseAdapter['config']; status: IntegrationStatus }[] {
        return Array.from(this.adapters.entries()).map(([name, adapter]) => ({
            name,
            config: adapter.config,
            status: adapter.getStatus(),
        }));
    }

    getByCategory(category: IntegrationCategory) {
        return this.getAll().filter(a => a.config.category === category);
    }

    get(name: string): BaseAdapter | undefined {
        return this.adapters.get(name);
    }

    async install(name: string) {
        const adapter = this.adapters.get(name);
        if (!adapter) return { success: false, message: `Integration "${name}" not found` };
        return adapter.install();
    }

    async start(name: string) {
        const adapter = this.adapters.get(name);
        if (!adapter) return { success: false, message: `Integration "${name}" not found` };
        return adapter.start();
    }

    async stop(name: string) {
        const adapter = this.adapters.get(name);
        if (!adapter) return { success: false, message: `Integration "${name}" not found` };
        return adapter.stop();
    }

    async health(name: string): Promise<IntegrationHealth | null> {
        const adapter = this.adapters.get(name);
        if (!adapter) return null;
        return adapter.health();
    }

    async healthAll(): Promise<Record<string, IntegrationHealth>> {
        const results: Record<string, IntegrationHealth> = {};
        for (const [name, adapter] of this.adapters) {
            results[name] = await adapter.health();
        }
        return results;
    }
}

export const integrationRegistry = new IntegrationRegistry();
