/**
 * Engine Alto — AI Streaming Route
 * SSE endpoint for real-time AI text generation.
 */

import { Router, Request, Response } from 'express';
import { aiOrchestrator, ChatMessage } from '../services/ai/orchestrator';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/ai-stream/chat — SSE streaming
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, model, maxTokens, temperature, orgId } = req.body as {
    messages?: ChatMessage[];
    model?: string;
    maxTokens?: number;
    temperature?: number;
    orgId?: string;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    const stream = aiOrchestrator.streamChat({
      messages,
      model,
      maxTokens,
      temperature,
      orgId: orgId || 'default',
    });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Streaming failed';
    logger.error('[AI Stream] Error:', message);
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
    res.end();
  }
});

// GET /api/ai-stream/models — list available models
router.get('/models', (_req: Request, res: Response) => {
  const status = aiOrchestrator.getStatus();
  res.json({
    models: status.models,
    totalCost: status.totalCost,
    totalRequests: status.totalRequests,
  });
});

// GET /api/ai-stream/usage — usage report
router.get('/usage', (_req: Request, res: Response) => {
  res.json(aiOrchestrator.getUsageReport());
});

// POST /api/ai-stream/quota — set org quota
router.post('/quota', (req: Request, res: Response) => {
  const { orgId, maxTokensPerDay, maxCostPerDay } = req.body;
  if (!orgId) return res.status(400).json({ error: 'orgId required' });

  aiOrchestrator.setQuota(
    orgId,
    maxTokensPerDay || 1000000,
    maxCostPerDay || 10,
  );
  res.json({ success: true, orgId });
});

export default router;
