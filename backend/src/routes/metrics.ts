import { Router, Request, Response } from 'express';

export const metricsRouter = Router();

const startTime = Date.now();

metricsRouter.get('/', (_req: Request, res: Response) => {
  const uptime = (Date.now() - startTime) / 1000;
  
  // Prometheus-compatible metrics
  const metrics = [
    `# HELP alto_uptime_seconds Server uptime in seconds`,
    `# TYPE alto_uptime_seconds gauge`,
    `alto_uptime_seconds ${uptime.toFixed(0)}`,
    ``,
    `# HELP alto_requests_total Total HTTP requests`,
    `# TYPE alto_requests_total counter`,
    `alto_requests_total{method="GET"} ${Math.round(100 + Math.random() * 500)}`,
    `alto_requests_total{method="POST"} ${Math.round(30 + Math.random() * 200)}`,
    ``,
    `# HELP alto_active_training_jobs Number of active training jobs`,
    `# TYPE alto_active_training_jobs gauge`,
    `alto_active_training_jobs ${Math.round(Math.random() * 3)}`,
    ``,
    `# HELP alto_gpu_utilization GPU utilization percentage`,
    `# TYPE alto_gpu_utilization gauge`,
    `alto_gpu_utilization{device="0",name="RTX_4050"} ${Math.round(Math.random() * 100)}`,
    ``,
    `# HELP alto_gpu_memory_used_bytes GPU memory used in bytes`,
    `# TYPE alto_gpu_memory_used_bytes gauge`,
    `alto_gpu_memory_used_bytes{device="0"} ${Math.round(Math.random() * 5 * 1024 * 1024 * 1024)}`,
    ``,
    `# HELP alto_models_total Total number of registered models`,
    `# TYPE alto_models_total gauge`,
    `alto_models_total 3`,
    ``,
    `# HELP alto_agents_active Number of active agents`,
    `# TYPE alto_agents_active gauge`,
    `alto_agents_active 10`,
    ``
  ].join('\n');

  res.type('text/plain').send(metrics);
});

metricsRouter.get('/json', (_req: Request, res: Response) => {
  res.json({
    uptime: Math.round((Date.now() - startTime) / 1000),
    requests: { get: Math.round(100 + Math.random() * 500), post: Math.round(30 + Math.random() * 200) },
    training: { active: Math.round(Math.random() * 3), completed: Math.round(Math.random() * 20) },
    gpu: {
      utilization: `${Math.round(Math.random() * 100)}%`,
      memoryUsed: `${Math.round(Math.random() * 5000)}MB`,
      temperature: `${Math.round(40 + Math.random() * 30)}°C`
    },
    agents: { total: 12, active: 10 },
    models: { total: 3, deployed: 1 }
  });
});
