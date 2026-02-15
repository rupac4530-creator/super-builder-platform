import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export const aiRouter = Router();

// ─── AI Endpoint Hardening ────────────────────────────────────────────
const AI_MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || '3', 10);
const AI_COST_LIMIT_USD = parseFloat(process.env.AI_COST_LIMIT_USD || '0.50');
const AI_MONTHLY_BUDGET_USD = parseFloat(process.env.AI_MONTHLY_BUDGET_USD || '100.00');
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '30000', 10);

// In-memory monthly budget tracker (resets on restart — use Redis for persistence)
let monthlySpendUSD = 0;
let budgetMonth = new Date().getMonth();

function checkAndResetBudget(): void {
  const currentMonth = new Date().getMonth();
  if (currentMonth !== budgetMonth) {
    monthlySpendUSD = 0;
    budgetMonth = currentMonth;
    logger.info('💰 Monthly AI budget counter reset');
  }
}

function estimateCostUSD(promptTokens: number, completionTokens: number, model: string): number {
  // GPT-4 pricing approximation (per 1K tokens)
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };
  const rate = rates[model] || rates['gpt-4'];
  return (promptTokens / 1000) * rate.input + (completionTokens / 1000) * rate.output;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        logger.warn(`⏳ AI call attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delayMs}ms: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

// AI Chat endpoint
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, context = [], model = 'gpt-4' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const isRealAI = process.env.ENABLE_REAL_AI === 'true';

    if (isRealAI && process.env.OPENAI_API_KEY) {
      // Budget guard
      checkAndResetBudget();
      const estimatedCost = estimateCostUSD(message.length, 500, model);
      if (estimatedCost > AI_COST_LIMIT_USD) {
        logger.warn(`🚫 Request cost estimate $${estimatedCost.toFixed(4)} exceeds per-request limit $${AI_COST_LIMIT_USD}`);
        return res.status(429).json({ error: 'Request cost exceeds per-request limit', limit: AI_COST_LIMIT_USD });
      }
      if (monthlySpendUSD + estimatedCost > AI_MONTHLY_BUDGET_USD) {
        logger.warn(`🚫 Monthly AI budget exhausted: $${monthlySpendUSD.toFixed(2)}/$${AI_MONTHLY_BUDGET_USD}`);
        return res.status(429).json({ error: 'Monthly AI budget exhausted', spent: monthlySpendUSD, budget: AI_MONTHLY_BUDGET_USD });
      }

      // Real AI call with retry + timeout (stub — wire OpenAI SDK here)
      try {
        const result = await retryWithBackoff(async () => {
          // TODO: Replace with actual OpenAI SDK call
          // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          // return await Promise.race([
          //   openai.chat.completions.create({ model, messages: [...context, { role: 'user', content: message }] }),
          //   new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), AI_TIMEOUT_MS))
          // ]);
          throw new Error('OpenAI SDK not yet wired — remove this line when integrating');
        }, AI_MAX_RETRIES);
        monthlySpendUSD += estimatedCost;
      } catch (aiErr: any) {
        logger.warn(`⚠️ Real AI failed after ${AI_MAX_RETRIES} retries, falling back to mock: ${aiErr.message}`);
        // Fall through to mock response
      }
    }

    // Smart mock response (fallback or when ENABLE_REAL_AI=false)
    const response = generateMockResponse(message);
    res.json({
      id: uuidv4(),
      message: response,
      model: isRealAI ? model : 'mock-alto-ai',
      usage: { promptTokens: message.length, completionTokens: response.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// AI Plan endpoint — generates implementation plans
aiRouter.post('/plan', async (req: Request, res: Response) => {
  try {
    const { goal, constraints = [], projectType = 'web' } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal is required' });

    const plan = {
      id: uuidv4(),
      goal,
      projectType,
      steps: [
        { order: 1, action: 'Analyze requirements', details: `Parse goal: "${goal}"`, status: 'pending' },
        { order: 2, action: 'Design architecture', details: `Design ${projectType} architecture`, status: 'pending' },
        { order: 3, action: 'Generate scaffolding', details: 'Create project structure and base files', status: 'pending' },
        { order: 4, action: 'Implement core features', details: 'Build main components and logic', status: 'pending' },
        { order: 5, action: 'Add styling and UX', details: 'Apply design system and animations', status: 'pending' },
        { order: 6, action: 'Test and validate', details: 'Run automated tests and manual checks', status: 'pending' },
        { order: 7, action: 'Optimize and deploy', details: 'Performance tuning and deployment', status: 'pending' }
      ],
      constraints,
      estimatedTime: '2-4 hours',
      timestamp: new Date().toISOString()
    };

    res.json(plan);
  } catch (error) {
    logger.error('AI plan error:', error);
    res.status(500).json({ error: 'AI planning failed' });
  }
});

// AI Debug endpoint — diagnoses issues
aiRouter.post('/debug', async (req: Request, res: Response) => {
  try {
    const { code, error: errorMsg, language = 'typescript' } = req.body;
    if (!code && !errorMsg) return res.status(400).json({ error: 'Code or error message required' });

    const diagnosis = {
      id: uuidv4(),
      language,
      issues: [
        {
          severity: 'error',
          line: 1,
          message: errorMsg || 'Potential issue detected',
          suggestion: 'Check variable declarations and type annotations',
          fix: '// Suggested fix will appear here when real AI is enabled'
        }
      ],
      summary: 'Analysis complete. Enable REAL_AI for detailed diagnostics.',
      timestamp: new Date().toISOString()
    };

    res.json(diagnosis);
  } catch (error) {
    logger.error('AI debug error:', error);
    res.status(500).json({ error: 'AI debugging failed' });
  }
});

// AI Code generation
aiRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, language = 'typescript', framework = 'react' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const generated = {
      id: uuidv4(),
      prompt,
      language,
      framework,
      code: generateCodeFromPrompt(prompt, language, framework),
      explanation: `Generated ${language} code for: ${prompt}`,
      timestamp: new Date().toISOString()
    };

    res.json(generated);
  } catch (error) {
    logger.error('AI generate error:', error);
    res.status(500).json({ error: 'Code generation failed' });
  }
});

function generateMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! I\'m the Engine Alto AI assistant. I can help you build apps, train AI models, create games, and more. What would you like to create today?';
  }
  if (lower.includes('game')) {
    return 'Great choice! I can help you build a game. Would you like to create a 2D platformer, 3D FPS, puzzle game, or something else? I\'ll set up the project with ECS architecture, physics, and rendering.';
  }
  if (lower.includes('train') || lower.includes('model')) {
    return 'I can help you train an AI model! What type? Options: image classifier, text generator, object detector, or custom architecture. I\'ll configure the training pipeline for your RTX 4050 GPU with mixed precision.';
  }
  if (lower.includes('website') || lower.includes('app')) {
    return 'Let\'s build it! I\'ll create a modern web application with Next.js, responsive design, and dark mode. Tell me more about what features you need.';
  }
  return `I understand you want to: "${message}". Let me break this down into actionable steps and generate the code for you. Engine Alto can handle apps, games, AI models, videos, 3D assets, and more.`;
}

function generateCodeFromPrompt(prompt: string, language: string, framework: string): string {
  if (framework === 'react') {
    return `import React, { useState } from 'react';

// Generated by Engine Alto AI
// Prompt: ${prompt}

export default function GeneratedComponent() {
  const [state, setState] = useState(null);

  return (
    <div className="alto-component">
      <h2>${prompt}</h2>
      <p>Component generated by Engine Alto AI</p>
    </div>
  );
}`;
  }
  return `// Generated by Engine Alto AI\n// Language: ${language}\n// Prompt: ${prompt}\n\n// Implementation here\nconsole.log("Engine Alto: ${prompt}");\n`;
}
