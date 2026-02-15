/**
 * Engine Alto — API Routes
 * REST endpoints for engine status, subsystems, and operations.
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Lazy imports to avoid circular dependencies at route registration time
function getEngine() {
  const engine = require('../../engine');
  return engine;
}

// GET /api/engine — Full engine status
router.get('/', (_req: Request, res: Response) => {
  try {
    const { getEngineStatus } = getEngine();
    res.json(getEngineStatus());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engine/core — Core subsystem status
router.get('/core', (_req: Request, res: Response) => {
  try {
    const { jobSystem, pluginAPI, platform, logger } = getEngine();
    res.json({
      subsystem: 'core',
      jobSystem: jobSystem.getStatus(),
      pluginAPI: pluginAPI.getStatus(),
      platform: platform.getStatus(),
      logger: logger.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engine/render
router.get('/render', (_req: Request, res: Response) => {
  try {
    const { gpu, shaderPipeline, sceneGraph } = getEngine();
    res.json({
      subsystem: 'render',
      gpu: gpu.getStatus(),
      shaders: shaderPipeline.getStatus(),
      scene: sceneGraph.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engine/script
router.get('/script', (_req: Request, res: Response) => {
  try {
    const { scriptRuntime, scriptSandbox, moduleLoader } = getEngine();
    res.json({
      subsystem: 'script',
      runtime: scriptRuntime.getStatus(),
      sandbox: scriptSandbox.getStatus(),
      modules: moduleLoader.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engine/browser
router.get('/browser', (_req: Request, res: Response) => {
  try {
    const { layoutEngine, jsEngine } = getEngine();
    res.json({
      subsystem: 'browser',
      layout: layoutEngine.getStatus(),
      jsEngine: jsEngine.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engine/build
router.get('/build', (_req: Request, res: Response) => {
  try {
    const { buildPipeline, hotReload } = getEngine();
    res.json({
      subsystem: 'build',
      pipeline: buildPipeline.getStatus(),
      hotReload: hotReload.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engine/network
router.get('/network', (_req: Request, res: Response) => {
  try {
    const { httpClient, wsManager, protocolHandler } = getEngine();
    res.json({
      subsystem: 'network',
      http: httpClient.getStatus(),
      websocket: wsManager.getStatus(),
      protocols: protocolHandler.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engine/ai
router.get('/ai', (_req: Request, res: Response) => {
  try {
    const { tensorOps, modelLoader } = getEngine();
    res.json({
      subsystem: 'ai',
      tensors: tensorOps.getStatus(),
      models: modelLoader.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
