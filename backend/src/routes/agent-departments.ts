/**
 * API Routes — Agent Departments (Complete)
 * Exposes ALL 10 agent departments as REST endpoints.
 */

import { Router, Request, Response } from 'express';

const router = Router();

// ALL departments overview
router.get('/', (_req: Request, res: Response) => {
  const { getAgentsStatus } = require('../../agents');
  res.json(getAgentsStatus());
});

// ── Phase 0 Departments ──────────────────────────────────────

router.get('/governance', (_req: Request, res: Response) => {
  const { getGovernanceStatus } = require('../../agents/governance');
  res.json(getGovernanceStatus());
});

router.get('/health', (_req: Request, res: Response) => {
  const { getHealthStatus } = require('../../agents/health');
  res.json(getHealthStatus());
});

router.get('/exploration', (_req: Request, res: Response) => {
  const { getExplorationStatus } = require('../../agents/exploration');
  res.json(getExplorationStatus());
});

router.get('/family', (_req: Request, res: Response) => {
  const { getFamilyStatus } = require('../../agents/family');
  res.json(getFamilyStatus());
});

router.get('/memory', (_req: Request, res: Response) => {
  const { getMemoryStatus } = require('../../agents/memory');
  res.json(getMemoryStatus());
});

router.get('/support', (_req: Request, res: Response) => {
  const { getSupportStatus } = require('../../agents/support');
  res.json(getSupportStatus());
});

// ── Phase 8-11 Departments ───────────────────────────────────

router.get('/framework', (_req: Request, res: Response) => {
  const { getAgentFrameworkStatus } = require('../../agents/framework');
  res.json(getAgentFrameworkStatus());
});

router.get('/training', (_req: Request, res: Response) => {
  const { getTrainingStatus } = require('../../agents/training');
  res.json(getTrainingStatus());
});

router.get('/security', (_req: Request, res: Response) => {
  const { getSecurityStatus } = require('../../agents/security');
  res.json(getSecurityStatus());
});

router.get('/expansion', (_req: Request, res: Response) => {
  const { getExpansionStatus } = require('../../agents/expansion');
  res.json(getExpansionStatus());
});

export default router;
