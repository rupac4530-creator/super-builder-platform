# Engine Alto — Architecture Documentation

## System Overview

Engine Alto is a unified AI-first creator platform, designed as a self-governing civilization of autonomous agents that can build apps, train models, deploy services, and maintain themselves.

## Core Principles

1. **Autonomy-First** — Agents operate without human approval by default
2. **Safety-Critical** — Master Override available for emergency recovery
3. **Auditable** — Every action is logged to immutable audit trail
4. **Sandboxed** — All code execution runs in isolation
5. **Resilient** — Self-healing agents detect and fix issues automatically

## Architecture Layers

```
┌───────────────────────────────────────────────────┐
│               Presentation Layer                  │
│          Next.js  •  React  •  WebSocket          │
├───────────────────────────────────────────────────┤
│                 API Gateway                       │
│        Express  •  REST  •  Socket.IO             │
├─────────┬─────────┬─────────┬─────────────────────┤
│ Project │ AI/ML   │ Agent   │ Job Queue           │
│ Service │ Service │ Service │ BullMQ / In-Memory   │
├─────────┴─────────┴─────────┴─────────────────────┤
│              Agent Orchestrator                    │
│    Workbook  •  Balancer  •  Governance            │
├───────────────────────────────────────────────────┤
│              Data & Infrastructure                 │
│    PostgreSQL  •  Redis  •  S3  •  Docker          │
└───────────────────────────────────────────────────┘
```

## Service Map

| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| Frontend | 3000 | Next.js | Platform UI |
| Backend API | 3001 | Express | REST + WebSocket |
| Inference Server | 8000 | FastAPI | Model serving |
| PostgreSQL | 5432 | Postgres 16 | Persistent data |
| Redis | 6379 | Redis 7 | Job queue + cache |

## Agent Civilization

The platform runs 12 autonomous agents organized into governance branches:

### Executive Branch
- **Orchestrator** — Central coordinator, task decomposition
- **DeployAgent** — Deployment pipelines

### Data & Training Branch
- **DataAgent** — Dataset curation and preprocessing
- **TrainerAgent** — Hyperparameter optimization, AutoML

### Defensive Branch
- **DebugAgent** — Diagnose and fix failures
- **SecurityAgent** — Ethical hacking, vulnerability scanning
- **PoliceAgent** — Containment of rogue processes

### Support Branch
- **DoctorAgent** — Self-healing, recovery
- **AuditorAgent** — Compliance, consistency checking
- **DecoratorAgent** — UX polish, UI improvements
- **GrowthAgent** — User acquisition optimization
- **ScoutAgent** — Technology scanning, emerging trends

## Data Flow

```
User Request → API Gateway → Agent Orchestrator
                                   ↓
                            Task Decomposition
                                   ↓
                        ┌──────────┼──────────┐
                        ↓          ↓          ↓
                   DataAgent  TrainerAgent DeployAgent
                        ↓          ↓          ↓
                   Dataset    Model      Deployment
                   Prepared   Trained    Complete
                        ↓          ↓          ↓
                        └──────────┼──────────┘
                                   ↓
                          Audit Log Updated
                                   ↓
                          Result → User / UI
```

## GPU Training Pipeline

1. **Configuration** — Architecture, hyperparameters, dataset
2. **Data Preparation** — DataAgent preprocesses, augments, splits
3. **Training** — PyTorch with mixed precision on GPU
4. **Monitoring** — Real-time metrics via WebSocket
5. **Evaluation** — Accuracy, loss, confusion matrix
6. **Export** — PyTorch (.pt) or ONNX (.onnx)
7. **Deployment** — FastAPI inference server

## Security Model

- **Sandbox**: All agent code runs in isolated environments
- **Audit Trail**: Immutable logging of all actions
- **Ethical Hacking**: SecurityAgent proactively scans for vulnerabilities
- **Canary Deploy**: New changes rolled out 10% at a time
- **Master Override**: Emergency stop for all autonomous operations
- **Input Validation**: All API inputs sanitized and size-limited

## API Design

All API routes follow RESTful conventions:
- `GET /api/resource` — List all
- `GET /api/resource/:id` — Get one
- `POST /api/resource` — Create
- `PUT /api/resource/:id` — Update
- `DELETE /api/resource/:id` — Delete

Real-time updates via Socket.IO events:
- `training:progress` — Training metrics
- `job:update` — Job status changes
- `agent:activity` — Agent actions

## Deployment Options

| Target | Command | Notes |
|--------|---------|-------|
| Local Dev | `npm run dev` | Frontend + Backend |
| Docker | `docker compose up` | Full stack |
| Kubernetes | `kubectl apply -f kubernetes/` | Production |
| AWS | `terraform apply` | Terraform infra |
