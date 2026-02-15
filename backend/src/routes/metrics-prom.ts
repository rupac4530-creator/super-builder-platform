/**
 * Engine Alto — Prometheus Metrics + Observability Route
 * Exposes /api/metrics in Prometheus text format and /api/metrics/json.
 */

import { Router, Request, Response } from 'express';
import { metrics, tracer } from '../observability/telemetry';
import { jobQueue } from '../queue/manager';

const router = Router();

// Prometheus text-format endpoint
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Collect queue metrics
    const queueStats = await jobQueue.getQueueStats();
    metrics.gauge('job_queue_waiting', queueStats.waiting, {});
    metrics.gauge('job_queue_active', queueStats.active, {});
    metrics.gauge('job_queue_completed', queueStats.completed, {});
    metrics.gauge('job_queue_failed', queueStats.failed, {});

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics.toPrometheus());
  } catch (err) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

// JSON format for internal dashboards
router.get('/json', async (_req: Request, res: Response) => {
  try {
    const queueStats = await jobQueue.getQueueStats();
    res.json({
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      queue: queueStats,
      metrics: metrics.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

// Traces endpoint (Jaeger-compatible)
router.get('/traces', (_req: Request, res: Response) => {
  res.json(tracer.toJaeger());
});

// Recent spans
router.get('/traces/recent', (_req: Request, res: Response) => {
  const limit = parseInt((_req.query as any).limit || '50', 10);
  res.json(tracer.getRecentSpans(limit));
});

export default router;
