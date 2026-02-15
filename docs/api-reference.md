# Engine Alto — API Reference

## Base URL
```
Development: http://localhost:3001/api
Production:  https://api.enginealto.dev/api
```

---

## Health

### GET `/health`
System health info.

**Response:**
```json
{
  "status": "ok",
  "platform": "Engine Alto",
  "version": "0.1.0",
  "uptime": 1234,
  "memory": { "used": "150MB", "total": "512MB" },
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai": "ready"
  }
}
```

### GET `/health/ready`
Readiness probe for K8s.

---

## Projects

### GET `/projects`
List all projects.

### POST `/projects`
Create a project.

**Body:**
```json
{
  "name": "My App",
  "type": "app",
  "description": "A web application"
}
```

### GET `/projects/:id`

### PUT `/projects/:id`

### DELETE `/projects/:id`

### POST `/projects/:id/generate`
Generate code for a project using AI.

**Body:**
```json
{
  "prompt": "Add a login page with JWT auth"
}
```

---

## AI

### POST `/ai/chat`
Chat with AI assistant.

**Body:**
```json
{
  "message": "Help me build a todo app",
  "context": "optional previous context"
}
```

### POST `/ai/plan`
Generate an implementation plan.

**Body:**
```json
{
  "goal": "Build a real-time chat application",
  "techStack": "Next.js + Socket.IO"
}
```

### POST `/ai/debug`
Debug code.

**Body:**
```json
{
  "code": "function broken() { ... }",
  "error": "TypeError: Cannot read property...",
  "language": "typescript"
}
```

### POST `/ai/generate`
Generate code.

**Body:**
```json
{
  "prompt": "Create a REST API for user management",
  "language": "typescript",
  "framework": "express"
}
```

---

## Training

### POST `/training/start`
Start a training job.

**Body:**
```json
{
  "modelName": "my-classifier",
  "architecture": "resnet",
  "config": {
    "epochs": 50,
    "batchSize": 32,
    "learningRate": 0.001,
    "mixedPrecision": true
  }
}
```

### GET `/training/jobs`
List all training jobs.

### GET `/training/jobs/:id`
Get training job details (metrics, logs, progress).

### POST `/training/jobs/:id/stop`
Stop a running training job.

### GET `/training/architectures`
List supported architectures.

### GET `/training/gpu/status`
GPU utilization, memory, temperature.

---

## Models

### GET `/models`
List all models.

### POST `/models`
Register a new model.

### GET `/models/:id`

### PUT `/models/:id`

### DELETE `/models/:id`

### POST `/models/:id/deploy`
Deploy a model for inference.

### POST `/models/:id/predict`
Run prediction.

**Body:**
```json
{
  "input": [0.1, 0.5, 0.9, 0.2]
}
```

### POST `/models/:id/export`
Export model (ONNX/TorchScript).

**Query:** `?format=onnx`

---

## Agents

### GET `/agents`
List all agents.

### GET `/agents/:id`
Agent details.

### POST `/agents/:id/task`
Assign a task to an agent.

**Body:**
```json
{
  "type": "security_scan",
  "description": "Scan API for vulnerabilities",
  "input": {},
  "priority": "high"
}
```

### POST `/agents/orchestrate`
Run a multi-agent workflow.

**Body:**
```json
{
  "goal": "Train and deploy a sentiment classifier",
  "priority": "high"
}
```

### GET `/agents/stats/overview`
Civilization stats.

---

## Jobs

### GET `/jobs`
List all background jobs.

### POST `/jobs`
Create a job.

**Body:**
```json
{
  "type": "export",
  "data": { "modelId": "model_123", "format": "onnx" }
}
```

### GET `/jobs/:id`
Job status and progress.

### POST `/jobs/:id/cancel`
Cancel a job.

---

## Metrics

### GET `/metrics`
Prometheus-compatible text format.

### GET `/metrics/json`
```json
{
  "uptime": 1234,
  "requests": { "get": 100, "post": 50 },
  "gpu": { "utilization": "45%", "temperature": "65°C" },
  "training": { "active": 1, "completed": 5 },
  "agents": { "total": 12, "active": 10 },
  "models": { "total": 5, "deployed": 2 }
}
```

---

## WebSocket Events

Connect to `ws://localhost:3001`

| Event | Direction | Data |
|-------|-----------|------|
| `training:progress` | Server → Client | `{ jobId, epoch, loss, accuracy, ... }` |
| `training:complete` | Server → Client | `{ jobId, finalMetrics }` |
| `job:update` | Server → Client | `{ jobId, status, progress }` |
| `agent:activity` | Server → Client | `{ agentId, action, result }` |
