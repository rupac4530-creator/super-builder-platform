# SuperBuilder Integrations

This directory contains **31 open-source integration adapters** that extend SuperBuilder with powerful AI, 3D, robotics, and infrastructure capabilities.

## Categories

| Category | Adapters | Description |
|----------|----------|-------------|
| **Agent Orchestration** | LangChain, LlamaIndex, AutoGen, MetaGPT, BabyAGI, SuperAGI | Multi-agent workflows, RAG, autonomous task chains |
| **Vector DBs** | FAISS, Milvus, Weaviate, Chroma | Embedding search, semantic memory, RAG backends |
| **Model Runtimes** | ONNX Runtime, vLLM, NVIDIA Triton, BentoML, llama.cpp | Local & GPU inference, model serving APIs |
| **Generative Media** | Diffusers/SD, ComfyUI, Whisper, Coqui TTS | Image generation, speech recognition, text-to-speech |
| **3D / NeRF** | Blender, instant-ngp, Nerfstudio | 3D modeling, neural radiance fields, headless rendering |
| **Game Engines** | Godot | Open game engine for embedding generated games |
| **MLOps** | MLflow, Apache Airflow | Experiment tracking, pipeline orchestration |
| **Serving** | KServe, Ray | Kubernetes model serving, distributed compute |
| **Observability** | Prometheus + Grafana | Metrics, dashboards, alerting |
| **Robotics** | ROS 2, CARLA, Gazebo | Robot middleware, autonomous driving sim, physics sim |

## Usage

```typescript
import { integrationRegistry } from './registry';

// List all integrations
const all = integrationRegistry.getAll();

// Get by category
const agents = integrationRegistry.getByCategory('agent-orchestration');

// Install and start one
await integrationRegistry.install('LangChain');
await integrationRegistry.start('LangChain');

// Health check
const health = await integrationRegistry.health('LangChain');
```

## Architecture

```
integrations/
├── base-adapter.ts          # Interface + abstract base class
├── registry.ts              # Central registry (manages all adapters)
├── matrix.md                # Compatibility matrix
├── agents/                  # Agent orchestration adapters
├── vector-db/               # Vector database adapters
├── model-runtime/           # LLM / model inference adapters
├── generative-media/        # Image / audio / video adapters
├── 3d-nerf/                 # 3D and NeRF adapters
├── game-engine/             # Game engine adapters
├── mlops/                   # MLOps & pipeline adapters
├── serving/                 # Model serving adapters
├── observability/           # Monitoring adapters
└── robotics/                # Robotics & simulation adapters
```

## Adding a New Integration

1. Create a new file in the appropriate category directory
2. Extend `AbstractAdapter` from `base-adapter.ts`
3. Implement `install()`, `start()`, `stop()` methods
4. Register in `registry.ts`
5. Add a row to `matrix.md`
