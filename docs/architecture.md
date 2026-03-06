# SuperBuilder Architecture

## Overview

SuperBuilder is a monorepo containing a backend API server and a frontend web application, connected through REST APIs and WebSocket.

## Directory Structure

```
super-builder-platform/
├── backend/              # Express + TypeScript API server
│   └── src/
│       ├── routes/       # API route handlers
│       ├── services/     # Business logic
│       ├── database/     # Database initialization
│       └── utils/        # Shared utilities (logger, etc.)
├── platform/             # Next.js frontend application
│   └── src/
│       └── app/          # React pages and components
├── scripts/              # Automation and utility scripts
├── docs/                 # Project documentation
├── .github/              # GitHub Actions, templates
└── assets/               # Screenshots, diagrams
```

## Backend

- **Framework**: Express.js with TypeScript
- **Port**: 3001 (default)
- **API Structure**: Modular routes, each feature has its own route file
- **Key routes**:
  - `/api/health` — Health check
  - `/api/ai` — AI orchestration
  - `/api/projects` — Project management
  - `/api/agents` — Agent civilization
  - `/api/agent-hub` — Autonomous agent system (OpenClaw)
  - `/api/evolution` — Self-improving AI engine
  - `/api/innovation` — Innovation labs modules
  - `/api/control-center` — Unified control center aggregator
  - `/api/engine` — Core engine capabilities
  - `/api/services` — Platform services (video, audio, 3D, etc.)

## Frontend

- **Framework**: Next.js 14 with React
- **Port**: 3000 (default)
- **Architecture**: Single-page app with sidebar navigation and dynamic page rendering
- **State**: React hooks (useState, useEffect)
- **API calls**: fetch() to backend REST endpoints

## AI Orchestration

The platform routes AI requests to the best available model based on task type:

- **Reasoning**: OpenAI GPT-5, DeepSeek-R1
- **Fast tasks**: Groq (Llama 3.3 70B), Gemini Flash
- **Code**: GPT-4o, DeepSeek-R1
- **Vision**: Llama-3.2-90B-Vision
- **Embeddings**: OpenAI text-embedding-3-small
- **Local/free**: Ollama, Cloudflare Workers AI
- **Multi-model**: OpenRouter

## Agent System

The Agent Hub implements autonomous task execution:

1. **Planner** receives a goal and generates a step-by-step plan
2. **Orchestrator** assigns steps to specialized agents
3. **Executor** runs steps in sandboxed environments
4. **Memory** stores context for future reference
5. **Evolution Engine** analyzes performance and optimizes workflows

## Data Flow

```
User → Frontend (Next.js) → Backend API (Express)
                                ↓
                         AI Orchestrator → AI Providers
                                ↓
                         Job Queue → Workers → Artifact Vault
                                ↓
                         Agent Hub → Plans → Tasks → Execution
```

## Design Principles

1. **Add-only**: New features are added without removing existing ones
2. **Modular**: Each feature is self-contained in its own route/component
3. **Safe defaults**: Sandbox mode, dry-run, feature flags
4. **Observable**: Structured logging, Prometheus metrics
5. **Graceful degradation**: If a service is down, others continue working
