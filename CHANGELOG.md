# Changelog

All notable changes to SuperBuilder are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v0.3.0] — Next-Level Platform Features (2026-03-07)

### 🚀 10 Next-Level Features Added

#### AI Discovery Engine
- Auto-scan GitHub, HuggingFace, PapersWithCode for new AI tools
- One-click "Auto-Add" turns any discovered tool into an adapter
- Detects OpenHands, Devika, Qwen2.5, Flux.1, Dify, LobeChat and more

#### Self-Optimizing Smart Agents
- AI agents that learn from usage patterns
- Auto-suggest and auto-create optimized pipelines
- 96% confidence RAG Knowledge Assistant suggestion

#### Visual Workflow Builder
- No-code drag-and-drop AI pipeline builder
- 8 pre-built templates: RAG, Image Studio, Multi-Agent, 3D, FineTuning
- Save, run, monitor pipelines with live status

#### Multi-Cloud Deploy Center
- One-click deploy to AWS, GCP, Azure, Docker, Kubernetes, Edge
- Live deployment cards with uptime indicators and cost tracking
- Supports GPU and non-GPU targets

#### Cross-Integration Intelligence
- Cross-pollinate tools to create novel AI fusions
- 7 built-in fusions: AI Game Generator, Voice-to-3D, Self-Healing Code, etc.
- Novelty scoring system (0-100)

#### AI Testing & Reliability
- 8 automated test suites: Integration Adapters, API, Workflow Engine, Security…
- Health check dashboard: latency, uptime, service status
- 93% average code coverage tracking

#### Community Hub
- Contributor leaderboard with badges and rankings
- Community submissions: adapters, templates, plugins, datasets
- Voting system — top-voted get auto-featured

#### AI Marketplace
- Browse, install, publish: pipelines, models, themes, agent templates
- Featured items, star ratings, download counts
- Items include: Ultimate RAG Pipeline, SDXL Art Studio, Multi-Agent Dev Team, LLM Fine-Tuning Template

#### Real-Time Live Analytics
- Live CPU, GPU, VRAM, memory, network metrics (updates every 5 seconds)
- 30-day historical trend data
- Pipeline health: active, queued, completed, failed counts

#### AI Documentation Engine
- Auto-generate guides, tutorials, and references from code and usage
- Difficulty levels: Beginner / Intermediate / Advanced
- "Generate New Doc" button for on-demand doc creation

---

## [v0.2.0] — Integrations Hub (2026-02-21)

### Added
- `integrations/` directory: 31 open-source adapter files across 9 categories
- `integrations/base-adapter.ts` — abstract base class all adapters extend
- `integrations/registry.ts` — central registry with install/start/stop lifecycle
- `integrations/matrix.md` — compatibility matrix (license, GPU, Docker, maturity)
- Backend route `/api/integrations` — CRUD + health checks + lifecycle management
- Frontend **Integrations Hub** page — search, category filter, enable/disable toggles
- Sidebar nav "Integrations" item with adapter count badge

### Integration Categories
- Agent Orchestration: LangChain, LlamaIndex, AutoGen, MetaGPT, BabyAGI, SuperAGI
- Vector DBs: FAISS, Milvus, Weaviate, Chroma
- Model Runtimes: ONNX Runtime, vLLM, NVIDIA Triton, BentoML, llama.cpp
- Generative Media: Diffusers/SD, ComfyUI, Whisper, Coqui TTS
- 3D/NeRF: Blender, instant-ngp, Nerfstudio
- Game Engine: Godot
- MLOps: MLflow, Apache Airflow
- Serving: KServe, Ray
- Observability: Prometheus, Grafana
- Robotics: ROS 2, CARLA, Gazebo

---

## [v0.1.0] — Initial Platform (2026-01-01)

### Added
- Core Engine Alto platform
- Dashboard with GPU/model/agent health cards
- Basic AI pipelines and model management
- Agent hub, job queue, metrics
- Multi-agent system and evolution framework
