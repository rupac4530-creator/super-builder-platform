import { Router, Request, Response } from 'express';

const router = Router();

/**
 * SSE Streaming Chat Endpoint
 * POST /api/ai/stream
 *
 * Streams AI responses as Server-Sent Events.
 * Supports multiple models with automatic fallback.
 */
router.post('/stream', async (req: Request, res: Response) => {
  const { message, model = 'gpt-4o-mini', systemPrompt, maxTokens = 2048 } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const enableRealAI = process.env.ENABLE_REAL_AI === 'true';
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    if (enableRealAI && apiKey) {
      // Real AI streaming via OpenAI-compatible API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: message },
          ],
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
            } else {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  res.write(`data: ${JSON.stringify({ type: 'token', content })}\n\n`);
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
      }
    } else {
      // Mock streaming — simulate AI response character by character
      const mockResponse = generateMockResponse(message);
      const words = mockResponse.split(' ');

      res.write(`data: ${JSON.stringify({ type: 'start', model: 'mock' })}\n\n`);

      for (const word of words) {
        await sleep(30 + Math.random() * 50);
        res.write(`data: ${JSON.stringify({ type: 'token', content: word + ' ' })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
    }
  } catch (error: any) {
    res.write(
      `data: ${JSON.stringify({ type: 'error', error: error.message || 'Stream error' })}\n\n`
    );
  } finally {
    res.end();
  }
});

/**
 * Non-streaming chat endpoint
 * POST /api/ai/chat
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message, model = 'gpt-4o-mini' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  const enableRealAI = process.env.ENABLE_REAL_AI === 'true';
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    if (enableRealAI && apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 2048,
        }),
      });

      const data: any = await response.json();
      return res.json({
        mode: 'real',
        model,
        response: data.choices?.[0]?.message?.content || 'No response',
        usage: data.usage,
      });
    }

    // Mock response
    return res.json({
      mode: 'mock',
      model: 'mock',
      response: generateMockResponse(message),
      usage: { prompt_tokens: message.length, completion_tokens: 150, total_tokens: message.length + 150 },
    });
  } catch (error: any) {
    return res.json({
      mode: 'mock',
      model: 'mock-fallback',
      response: generateMockResponse(message),
      warning: `Real AI failed: ${error.message}`,
    });
  }
});

// ── Helpers ──────────────────────────────────────────────────

function generateMockResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('debug') || lower.includes('error') || lower.includes('fix')) {
    return "I've analyzed the code and found the issue. The error occurs because the variable is being accessed before initialization. Try moving the declaration above the usage, or add a null check. Here's the corrected approach: ensure proper initialization order and add error boundaries for graceful handling.";
  }

  if (lower.includes('game') || lower.includes('build')) {
    return "Great idea! I'll help you build that. Let's start by setting up the project structure with the game engine components. We'll need a player controller, physics system, and basic UI. I recommend starting with a prototype to validate core mechanics before adding polish.";
  }

  if (lower.includes('video') || lower.includes('generate')) {
    return "I'll set up the video generation pipeline. The system will use temporal diffusion with optical flow consistency to produce smooth frames. Style presets are available: cinematic, anime, noir, vaporwave. Processing time varies by resolution and style complexity.";
  }

  return "I understand your request. Let me analyze this and provide a comprehensive solution. The approach involves breaking down the problem into manageable components, implementing each with proper error handling, and testing thoroughly. I'll start with the core logic and build outward.";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default router;
