# Changelog

All notable changes to the Super Builder Platform.

## [3.0.0-heaven] - 2026-02-15

### Added

#### Core Platform
- 16 Python engine modules covering entire civilization framework (26 phases)
- 16 backend TypeScript services with production patterns and mock fallbacks
- 7 Creator Studio frontend pages (Game, Video, Audio, 3D, Fashion, Design, Robotics)

#### AI & Intelligence
- Multi-model AI orchestrator (GPT-4o, Claude 3.5 Sonnet, local LLMs via llama.cpp)
- Streaming SSE chat endpoints at `/api/ai/stream`
- Agent playbooks for multi-step AI workflows (planner → generator → debugger → deployer)
- Token and cost tracking with per-user budgets and monthly limits
- Model selector UI with cost estimates

#### Media Engine
- Sora-style noise video generation with temporal consistency
- Frame-by-frame diffusion with keyframe control and 7 style presets
- Enhanced GLB generator with PBR materials, auto-rigging, LODs
- NeRF 3D reconstruction from multi-view photos

#### Game Development
- AI-powered game project generator for Unity/Godot/Unreal/Web
- Procedural terrain, NPC behavior trees, dialogue generators
- Playable HTML5 prototypes with iframe preview
- Game templates for platformer, RPG, FPS, open-world genres

#### Audio
- AI music composer with real WAV synthesis, 10 styles, stem separation
- Voice cloning (ElevenLabs + mock fallback)
- RNNoise-based audio denoising via FFmpeg
- Adaptive game music with intensity variations

#### Creative Studios
- Fashion Studio: garment design, 9 fabrics, measurements, tech packs
- Design Suite: Canva-class vector editor, 6 templates, SVG/PDF export
- Robotics Lab: PyBullet/Isaac Sim/MuJoCo simulation, 4 robot types

#### Enterprise
- RBAC with 5 roles, 18 permissions, audit logging
- OpenTelemetry tracing + Prometheus metrics
- Terraform for AWS (EKS + GPU nodes + Redis + RDS + S3)
- Kubernetes manifests with HPA autoscaling
- Docker Compose for local development

#### Plugin System
- Plugin SDK with TypeScript support
- Sandboxed execution (WASM + vm2)
- Permission system and lifecycle management

#### E2E Testing
- Playwright tests for AI debug, jobs, admin dashboard, video gen, game studio

### Changed
- Expanded `page.tsx` with 7 new Creator Studio pages
- Updated sidebar navigation with Creator Studios section

## [2.0.0-ultimate] - 2026-01-25

### Added
- Initial AI orchestrator and cost tracking
- Media engine with noise video and GLB generation
- Game templates (platformer, webapp, ML experiment)
- Plugin SDK scaffolding
- K8s autoscaler HPA
- Onboarding bot and model selector UX

## [1.0.0] - 2026-01-25

### Added
- Core platform with backend API (Express) and frontend (Next.js)
- 8 API routes (health, ai, jobs, metrics, projects, training, agents, models)
- Job queue with BullMQ/Redis and in-memory fallback
- Docker Compose and Kubernetes deployment
- CI/CD GitHub Actions workflow
- Basic monitoring and Prometheus metrics

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
