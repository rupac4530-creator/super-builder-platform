/**
 * Integrations API — Backend route for managing 31 open-source integrations.
 * GET /api/integrations          — list all integrations
 * GET /api/integrations/:name    — get specific integration details + health
 * POST /api/integrations/:name/install — install an integration
 * POST /api/integrations/:name/start   — start an integration
 * POST /api/integrations/:name/stop    — stop an integration
 * POST /api/integrations/:name/uninstall — uninstall an integration
 * GET /api/integrations/health/all     — health check all integrations
 */

import { Router, Request, Response } from 'express';

const router = Router();

// ── In-memory integration registry (mirrors integrations/ adapters) ──

interface IntegrationEntry {
    name: string;
    category: string;
    license: string;
    description: string;
    homepage: string;
    repository: string;
    requiresGPU: boolean;
    dockerImage?: string;
    ports?: number[];
    status: 'not-installed' | 'installed' | 'running' | 'stopped' | 'error';
    enabled: boolean;
    version: string;
}

const integrations: IntegrationEntry[] = [
    // ── Agent Orchestration ──
    { name: 'LangChain', category: 'Agent Orchestration', license: 'MIT', description: 'LLM orchestration — chains, agents, tools, and memory for AI workflows.', homepage: 'https://langchain.com', repository: 'https://github.com/langchain-ai/langchain', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.1.x' },
    { name: 'LlamaIndex', category: 'Agent Orchestration', license: 'MIT', description: 'RAG framework — data connectors, indexing, query layers for long-term memory.', homepage: 'https://llamaindex.ai', repository: 'https://github.com/run-llama/llama_index', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.10.x' },
    { name: 'AutoGen', category: 'Agent Orchestration', license: 'MIT', description: 'Microsoft multi-agent conversation framework for complex LLM workflows.', homepage: 'https://microsoft.github.io/autogen/', repository: 'https://github.com/microsoft/autogen', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.2.x' },
    { name: 'MetaGPT', category: 'Agent Orchestration', license: 'MIT', description: 'Multi-agent framework — assign roles (PM, architect, engineer) for collaboration.', homepage: 'https://deepwisdom.ai', repository: 'https://github.com/geekan/MetaGPT', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.8.x' },
    { name: 'BabyAGI', category: 'Agent Orchestration', license: 'MIT', description: 'Minimal autonomous agent — task creation, prioritization, and execution loop.', homepage: 'https://github.com/yoheinakajima/babyagi', repository: 'https://github.com/yoheinakajima/babyagi', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.0.0' },
    { name: 'SuperAGI', category: 'Agent Orchestration', license: 'MIT', description: 'Dev-first autonomous agent framework with tools, memory, and concurrent agents.', homepage: 'https://superagi.com', repository: 'https://github.com/TransformerOptimus/SuperAGI', requiresGPU: false, dockerImage: 'superagi/superagi:latest', ports: [3000, 8001], status: 'not-installed', enabled: false, version: '0.1.x' },

    // ── Vector DBs ──
    { name: 'FAISS', category: 'Vector DB', license: 'MIT', description: 'Facebook AI Similarity Search — fast nearest-neighbor for embeddings.', homepage: 'https://faiss.ai', repository: 'https://github.com/facebookresearch/faiss', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.7.x' },
    { name: 'Milvus', category: 'Vector DB', license: 'Apache-2.0', description: 'Scalable vector database for production RAG & similarity search.', homepage: 'https://milvus.io', repository: 'https://github.com/milvus-io/milvus', requiresGPU: false, dockerImage: 'milvusdb/milvus:latest', ports: [19530, 9091], status: 'not-installed', enabled: false, version: '2.3.x' },
    { name: 'Weaviate', category: 'Vector DB', license: 'BSD-3', description: 'AI-native vector database with vectorization modules & semantic search.', homepage: 'https://weaviate.io', repository: 'https://github.com/weaviate/weaviate', requiresGPU: false, dockerImage: 'cr.weaviate.io/semitechnologies/weaviate:latest', ports: [8080], status: 'not-installed', enabled: false, version: '1.23.x' },
    { name: 'Chroma', category: 'Vector DB', license: 'Apache-2.0', description: 'Developer-friendly open-source embedding database for AI apps.', homepage: 'https://trychroma.com', repository: 'https://github.com/chroma-core/chroma', requiresGPU: false, dockerImage: 'chromadb/chroma:latest', ports: [8000], status: 'not-installed', enabled: false, version: '0.4.x' },

    // ── Model Runtimes ──
    { name: 'ONNX Runtime', category: 'Model Runtime', license: 'MIT', description: 'Cross-platform inference engine for ONNX models.', homepage: 'https://onnxruntime.ai', repository: 'https://github.com/microsoft/onnxruntime', requiresGPU: false, status: 'not-installed', enabled: false, version: '1.17.x' },
    { name: 'vLLM', category: 'Model Runtime', license: 'Apache-2.0', description: 'High-throughput LLM serving with PagedAttention — fast GPU inference.', homepage: 'https://vllm.ai', repository: 'https://github.com/vllm-project/vllm', requiresGPU: true, dockerImage: 'vllm/vllm-openai:latest', ports: [8000], status: 'not-installed', enabled: false, version: '0.3.x' },
    { name: 'NVIDIA Triton', category: 'Model Runtime', license: 'BSD-3', description: 'High-performance inference serving for TensorRT, PyTorch, ONNX.', homepage: 'https://developer.nvidia.com/triton-inference-server', repository: 'https://github.com/triton-inference-server/server', requiresGPU: true, dockerImage: 'nvcr.io/nvidia/tritonserver:24.01-py3', ports: [8000, 8001, 8002], status: 'not-installed', enabled: false, version: '24.01' },
    { name: 'BentoML', category: 'Model Runtime', license: 'Apache-2.0', description: 'Unified model serving — package ML models as production API endpoints.', homepage: 'https://bentoml.com', repository: 'https://github.com/bentoml/BentoML', requiresGPU: false, ports: [3000], status: 'not-installed', enabled: false, version: '1.2.x' },
    { name: 'llama.cpp', category: 'Model Runtime', license: 'MIT', description: 'Lightweight C/C++ LLM inference — run models on CPU with GGUF format.', homepage: 'https://github.com/ggerganov/llama.cpp', repository: 'https://github.com/ggerganov/llama.cpp', requiresGPU: false, ports: [8080], status: 'not-installed', enabled: false, version: 'latest' },

    // ── Generative Media ──
    { name: 'Diffusers (Stable Diffusion)', category: 'Generative Media', license: 'Apache-2.0', description: 'Hugging Face diffusion models — SDXL, ControlNet, image generation.', homepage: 'https://huggingface.co/docs/diffusers', repository: 'https://github.com/huggingface/diffusers', requiresGPU: true, status: 'not-installed', enabled: false, version: '0.27.x' },
    { name: 'ComfyUI', category: 'Generative Media', license: 'GPL-3.0', description: 'Node-based visual workflow for Stable Diffusion pipelines.', homepage: 'https://github.com/comfyanonymous/ComfyUI', repository: 'https://github.com/comfyanonymous/ComfyUI', requiresGPU: true, ports: [8188], status: 'not-installed', enabled: false, version: 'latest' },
    { name: 'Whisper', category: 'Generative Media', license: 'MIT', description: 'OpenAI speech-to-text — transcription and translation in 99 languages.', homepage: 'https://openai.com/research/whisper', repository: 'https://github.com/openai/whisper', requiresGPU: false, status: 'not-installed', enabled: false, version: 'v3' },
    { name: 'Coqui TTS', category: 'Generative Media', license: 'MPL-2.0', description: 'Open-source text-to-speech — multi-speaker, voice cloning.', homepage: 'https://coqui.ai', repository: 'https://github.com/coqui-ai/TTS', requiresGPU: false, ports: [5002], status: 'not-installed', enabled: false, version: '0.22.x' },

    // ── 3D / NeRF ──
    { name: 'Blender', category: '3D / NeRF', license: 'GPL-3.0', description: '3D creation suite — headless rendering, modeling, automation via Python.', homepage: 'https://blender.org', repository: 'https://github.com/blender/blender', requiresGPU: true, status: 'not-installed', enabled: false, version: '4.0' },
    { name: 'instant-ngp', category: '3D / NeRF', license: 'NVIDIA', description: 'Instant Neural Radiance Fields — fast 3D reconstruction from photos.', homepage: 'https://nvlabs.github.io/instant-ngp/', repository: 'https://github.com/NVlabs/instant-ngp', requiresGPU: true, status: 'not-installed', enabled: false, version: 'latest' },
    { name: 'Nerfstudio', category: '3D / NeRF', license: 'Apache-2.0', description: 'End-to-end NeRF framework — train, visualize, and export 3D scenes.', homepage: 'https://nerf.studio', repository: 'https://github.com/nerfstudio-project/nerfstudio', requiresGPU: true, ports: [7007], status: 'not-installed', enabled: false, version: '1.0.x' },

    // ── Game Engine ──
    { name: 'Godot Engine', category: 'Game Engine', license: 'MIT', description: 'Open game engine — 2D/3D, GDScript/C#, export to all platforms.', homepage: 'https://godotengine.org', repository: 'https://github.com/godotengine/godot', requiresGPU: true, status: 'not-installed', enabled: false, version: '4.2' },

    // ── MLOps ──
    { name: 'MLflow', category: 'MLOps', license: 'Apache-2.0', description: 'MLOps platform — experiment tracking, model registry, deployment.', homepage: 'https://mlflow.org', repository: 'https://github.com/mlflow/mlflow', requiresGPU: false, ports: [5000], status: 'not-installed', enabled: false, version: '2.10.x' },
    { name: 'Apache Airflow', category: 'MLOps', license: 'Apache-2.0', description: 'Workflow orchestration — DAGs for ML pipelines and scheduling.', homepage: 'https://airflow.apache.org', repository: 'https://github.com/apache/airflow', requiresGPU: false, dockerImage: 'apache/airflow:latest', ports: [8080], status: 'not-installed', enabled: false, version: '2.8.x' },

    // ── Serving ──
    { name: 'KServe', category: 'Serving', license: 'Apache-2.0', description: 'Kubernetes-native model serving — standardized inference protocol.', homepage: 'https://kserve.github.io', repository: 'https://github.com/kserve/kserve', requiresGPU: false, status: 'not-installed', enabled: false, version: '0.12.x' },
    { name: 'Ray', category: 'Serving', license: 'Apache-2.0', description: 'Distributed compute engine — Ray Serve, Ray Train, ray cluster.', homepage: 'https://ray.io', repository: 'https://github.com/ray-project/ray', requiresGPU: false, ports: [8265, 6379], status: 'not-installed', enabled: false, version: '2.9.x' },

    // ── Observability ──
    { name: 'Prometheus + Grafana', category: 'Observability', license: 'Apache-2.0', description: 'Monitoring stack — metrics collection, alerting, and dashboards.', homepage: 'https://prometheus.io', repository: 'https://github.com/prometheus/prometheus', requiresGPU: false, dockerImage: 'prom/prometheus:latest', ports: [9090, 3000], status: 'not-installed', enabled: false, version: '2.49 / 10.x' },

    // ── Robotics ──
    { name: 'ROS 2', category: 'Robotics', license: 'Apache-2.0', description: 'Robot Operating System — middleware and libraries for robotic apps.', homepage: 'https://ros.org', repository: 'https://github.com/ros2/ros2', requiresGPU: false, dockerImage: 'ros:humble', status: 'not-installed', enabled: false, version: 'Humble' },
    { name: 'CARLA Simulator', category: 'Robotics', license: 'MIT', description: 'Autonomous driving simulator — high-fidelity urban environments.', homepage: 'https://carla.org', repository: 'https://github.com/carla-simulator/carla', requiresGPU: true, dockerImage: 'carlasim/carla:latest', ports: [2000, 2001], status: 'not-installed', enabled: false, version: '0.9.15' },
    { name: 'Gazebo', category: 'Robotics', license: 'Apache-2.0', description: '3D robot simulation — physics, sensors, and environments.', homepage: 'https://gazebosim.org', repository: 'https://github.com/gazebosim/gz-sim', requiresGPU: true, status: 'not-installed', enabled: false, version: 'Harmonic' },
];

// ── LIST all integrations ──
router.get('/', (_req: Request, res: Response) => {
    const category = _req.query.category as string | undefined;
    const filtered = category
        ? integrations.filter(i => i.category.toLowerCase().includes(category.toLowerCase()))
        : integrations;

    const categories = [...new Set(integrations.map(i => i.category))];

    res.json({
        total: filtered.length,
        categories,
        integrations: filtered.map(i => ({
            name: i.name, category: i.category, license: i.license,
            description: i.description, homepage: i.homepage, repository: i.repository,
            requiresGPU: i.requiresGPU, status: i.status, enabled: i.enabled, version: i.version,
            ...(i.dockerImage && { dockerImage: i.dockerImage }),
            ...(i.ports && { ports: i.ports }),
        })),
    });
});

// ── GET specific integration ──
router.get('/:name', (req: Request, res: Response) => {
    const integration = integrations.find(i => i.name.toLowerCase() === req.params.name.toLowerCase());
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    res.json(integration);
});

// ── INSTALL ──
router.post('/:name/install', (req: Request, res: Response) => {
    const integration = integrations.find(i => i.name.toLowerCase() === req.params.name.toLowerCase());
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    integration.status = 'installed';
    res.json({ success: true, message: `${integration.name} installed successfully`, status: integration.status });
});

// ── START ──
router.post('/:name/start', (req: Request, res: Response) => {
    const integration = integrations.find(i => i.name.toLowerCase() === req.params.name.toLowerCase());
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    if (integration.status === 'not-installed') return res.status(400).json({ error: 'Install first' });
    integration.status = 'running';
    integration.enabled = true;
    res.json({ success: true, message: `${integration.name} started`, status: integration.status });
});

// ── STOP ──
router.post('/:name/stop', (req: Request, res: Response) => {
    const integration = integrations.find(i => i.name.toLowerCase() === req.params.name.toLowerCase());
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    integration.status = 'stopped';
    integration.enabled = false;
    res.json({ success: true, message: `${integration.name} stopped`, status: integration.status });
});

// ── UNINSTALL ──
router.post('/:name/uninstall', (req: Request, res: Response) => {
    const integration = integrations.find(i => i.name.toLowerCase() === req.params.name.toLowerCase());
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    integration.status = 'not-installed';
    integration.enabled = false;
    res.json({ success: true, message: `${integration.name} uninstalled`, status: integration.status });
});

// ── HEALTH all ──
router.get('/health/all', (_req: Request, res: Response) => {
    const health = integrations.map(i => ({
        name: i.name, category: i.category, status: i.status, enabled: i.enabled,
    }));
    const running = health.filter(h => h.status === 'running').length;
    const installed = health.filter(h => h.status === 'installed').length;
    res.json({ total: health.length, running, installed, integrations: health });
});

export default router;
