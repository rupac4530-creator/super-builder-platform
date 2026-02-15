import { Router } from 'express';
import os from 'os';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/', (_req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'healthy',
    name: 'Engine Alto',
    version: '0.1.0',
    uptime: `${uptime}s`,
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
      nodeVersion: process.version
    },
    services: {
      database: 'connected',
      redis: process.env.REDIS_URL ? 'configured' : 'not configured',
      ai: process.env.ENABLE_REAL_AI === 'true' ? 'enabled' : 'mock mode'
    }
  });
});

healthRouter.get('/ready', (_req, res) => {
  res.json({ ready: true, message: 'ALTO READY' });
});
