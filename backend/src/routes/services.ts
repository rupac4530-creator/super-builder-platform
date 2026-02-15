/**
 * API Routes — Services
 * Exposes all 13 service subsystems as REST endpoints.
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Services overview
router.get('/', (_req: Request, res: Response) => {
  const { getServicesStatus } = require('../../services');
  res.json(getServicesStatus());
});

// Video Generation
router.get('/video-gen', (_req: Request, res: Response) => {
  const { videoGenPipeline } = require('../../services/video-gen/pipeline');
  res.json({ subsystem: 'video-generation', ...videoGenPipeline.getStatus() });
});

// Game Factory
router.get('/game-factory', (_req: Request, res: Response) => {
  const { gameFactory } = require('../../services/game-factory/factory');
  res.json({ subsystem: 'game-factory', ...gameFactory.getStatus() });
});

// 3D Pipeline
router.get('/3d-pipeline', (_req: Request, res: Response) => {
  const { threeDPipeline } = require('../../services/3d-pipeline/pipeline');
  res.json({ subsystem: '3d-pipeline', ...threeDPipeline.getStatus() });
});

// Audio Pipeline
router.get('/audio', (_req: Request, res: Response) => {
  const { audioPipeline } = require('../../services/audio/pipeline');
  res.json({ subsystem: 'audio', ...audioPipeline.getStatus() });
});

// VFX Node Editor
router.get('/vfx', (_req: Request, res: Response) => {
  const { vfxNodeEditor } = require('../../services/vfx/node-editor');
  res.json({ subsystem: 'vfx', ...vfxNodeEditor.getStatus() });
});

// Self-Heal
router.get('/self-heal', (_req: Request, res: Response) => {
  const { selfHealSystem } = require('../../services/self-heal/system');
  res.json({ subsystem: 'self-heal', ...selfHealSystem.getStatus() });
});

// Scalability
router.get('/scalability', (_req: Request, res: Response) => {
  const { scalabilityController } = require('../../services/scalability/controller');
  res.json({ subsystem: 'scalability', ...scalabilityController.getStatus() });
});

// Marketplace
router.get('/marketplace', (_req: Request, res: Response) => {
  const { marketplaceSystem } = require('../../services/marketplace/system');
  res.json({ subsystem: 'marketplace', ...marketplaceSystem.getStatus() });
});

// Observability
router.get('/observability', (_req: Request, res: Response) => {
  const { observabilitySystem } = require('../../services/observability/system');
  res.json({ subsystem: 'observability', ...observabilitySystem.getStatus() });
});

// Legal & Moderation
router.get('/legal', (_req: Request, res: Response) => {
  const { legalModerationSystem } = require('../../services/legal/moderation');
  res.json({ subsystem: 'legal', ...legalModerationSystem.getStatus() });
});

// Research Department
router.get('/research', (_req: Request, res: Response) => {
  const { researchDepartment } = require('../../services/research/department');
  res.json({ subsystem: 'research', ...researchDepartment.getStatus() });
});

// Documentation
router.get('/docs', (_req: Request, res: Response) => {
  const { documentationSystem } = require('../../services/docs/documentation');
  res.json({ subsystem: 'documentation', ...documentationSystem.getStatus() });
});

// Testing
router.get('/testing', (_req: Request, res: Response) => {
  const { testFramework } = require('../../services/testing/framework');
  res.json({ subsystem: 'testing', ...testFramework.getStatus() });
});

export default router;
