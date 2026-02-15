/**
 * Engine Alto — Civilization API Routes
 * REST endpoints for full civilization status, agent hierarchy, health checks, governance.
 */

import { Router, Request, Response } from 'express';

// Governance
import { constitution } from '../../../agents/governance/constitution';
import { council } from '../../../agents/governance/governor';
import { masterPrompt } from '../../../agents/governance/master-prompt';

// Family
import { motherAI } from '../../../agents/family/mother';
import { fatherAI } from '../../../agents/family/father';
import { sisterAI } from '../../../agents/family/sister';

// Health
import { allDoctors } from '../../../agents/health/doctor';
import { doctorHealers } from '../../../agents/health/doctor-healer';
import { homeHealerNetwork } from '../../../agents/health/home-healer';
import { caretakerAI } from '../../../agents/health/caretaker';

// Security
import { headOfficer, allCops } from '../../../agents/security/cops';
import { hackerDepartment } from '../../../agents/security/ethical-hackers';
import { hackerTrainer } from '../../../agents/security/hacker-trainer';

// Exploration
import { luffy } from '../../../agents/exploration/luffy';
import { zoro } from '../../../agents/exploration/zoro';
import { navigator } from '../../../agents/exploration/navigator';

// Support
import { tracker } from '../../../agents/support/tracker';
import { decorator } from '../../../agents/support/decorator';
import { reporter } from '../../../agents/support/reporter';
import { workbookAgent } from '../../../agents/support/workbook-agent';
import { motorReminder } from '../../../agents/support/motor-reminder';
import { modernizer } from '../../../agents/support/modernizer';
import { consistencyAuditor } from '../../../agents/support/consistency-auditor';

// Memory
import { memoryFabric } from '../../../agents/memory/memory-fabric';
import { updatePipeline } from '../../../agents/memory/update-pipeline';

// Types
import { DoctorAgent } from '../../../agents/health/doctor';
import { DoctorHealer } from '../../../agents/health/doctor-healer';
import { CopAgent } from '../../../agents/security/cops';

const router = Router();

// ── Full Civilization Status ──────────────────────────────────

router.get('/', (_req: Request, res: Response) => {
  const totalAgents = 
    5 + // governors
    3 + // family
    3 + allDoctors.length + doctorHealers.length + // health
    allCops.length + 1 + hackerDepartment.getHackers().length + 1 + // security
    3 + // exploration
    7 + // support
    1;  // master prompt (hidden)

  res.json({
    name: 'Engine Alto — AI Civilization',
    version: '3.0.0-heaven',
    status: 'SOVEREIGN',
    totalAgents,
    departments: {
      governance: council.getStatus(),
      family: {
        mother: motherAI.getStatus(),
        father: fatherAI.getStatus(),
        sister: sisterAI.getStatus(),
      },
      health: {
        doctors: allDoctors.map((d: DoctorAgent) => d.getStatus()),
        healers: doctorHealers.map((h: DoctorHealer) => h.getStatus()),
        homeHealer: homeHealerNetwork.getStatus(),
        caretaker: caretakerAI.getStatus(),
      },
      security: {
        headOfficer: headOfficer.getStatus(),
        cops: allCops.length,
        hackers: hackerDepartment.getStatus(),
        trainer: hackerTrainer.getStatus(),
      },
      exploration: {
        luffy: luffy.getStatus(),
        zoro: zoro.getStatus(),
        navigator: navigator.getStatus(),
      },
      support: {
        tracker: tracker.getStatus(),
        decorator: decorator.getStatus(),
        reporter: reporter.getStatus(),
        workbook: workbookAgent.getStatus(),
        motor: motorReminder.getStatus(),
        modernizer: modernizer.getStatus(),
        auditor: consistencyAuditor.getStatus(),
      },
      memory: memoryFabric.getStatus(),
      updatePipeline: updatePipeline.getStatus(),
    },
    masterPrompt: masterPrompt.getStatus(), // limited info only
  });
});

// ── Governance Endpoints ──────────────────────────────────────

router.get('/governance', (_req: Request, res: Response) => {
  res.json({
    constitution: constitution.getStatus(),
    rules: constitution.getAllRules(),
    council: council.getStatus(),
    amendments: constitution.getAmendments(),
  });
});

router.post('/governance/propose', (req: Request, res: Response) => {
  const { title, description, proposedBy } = req.body;
  const decision = council.proposeDecision(title, description, proposedBy);
  res.json({ proposed: true, decision });
});

router.post('/governance/vote', (req: Request, res: Response) => {
  const { decisionId, governor, vote } = req.body;
  const success = council.castVote(decisionId, governor, vote);
  res.json({ voted: success });
});

// ── Health Endpoints ──────────────────────────────────────────

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    doctors: allDoctors.map((d: DoctorAgent) => d.getStatus()),
    healers: doctorHealers.map((h: DoctorHealer) => h.getStatus()),
    homeHealer: homeHealerNetwork.getStatus(),
    caretaker: caretakerAI.getStatus(),
  });
});

// ── Security Endpoints ────────────────────────────────────────

router.get('/security', (_req: Request, res: Response) => {
  res.json({
    headOfficer: headOfficer.getStatus(),
    hackers: hackerDepartment.getStatus(),
    trainer: hackerTrainer.getStatus(),
    copsActive: allCops.filter((c: CopAgent) => c.status !== 'error').length,
  });
});

// ── Exploration Endpoints ─────────────────────────────────────

router.get('/exploration', (_req: Request, res: Response) => {
  res.json({
    luffy: luffy.getStatus(),
    zoro: zoro.getStatus(),
    navigator: navigator.getStatus(),
  });
});

// ── Family Endpoints ──────────────────────────────────────────

router.get('/family', (_req: Request, res: Response) => {
  res.json({
    mother: motherAI.getStatus(),
    father: fatherAI.getStatus(),
    sister: sisterAI.getStatus(),
  });
});

// ── Update Pipeline ───────────────────────────────────────────

router.get('/updates', (_req: Request, res: Response) => {
  res.json(updatePipeline.getStatus());
});

router.post('/updates/queue', (req: Request, res: Response) => {
  const { source, title, description, priority } = req.body;
  const item = updatePipeline.queueUpdate(source, title, description, priority);
  res.json({ queued: true, item });
});

router.post('/updates/execute', async (_req: Request, res: Response) => {
  try {
    const run = await updatePipeline.execute();
    res.json({ executed: true, run });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ── Memory ────────────────────────────────────────────────────

router.get('/memory', (_req: Request, res: Response) => {
  res.json(memoryFabric.getStatus());
});

// ── Master Prompt (requires auth) ─────────────────────────────

router.post('/master/auth', (req: Request, res: Response) => {
  const { password } = req.body;
  const success = masterPrompt.authenticate(password);
  res.json({ authenticated: success });
});

router.post('/master/action', (req: Request, res: Response) => {
  const { action, params } = req.body;
  const result = masterPrompt.executeAction(action, params);
  res.json(result);
});

export default router;
