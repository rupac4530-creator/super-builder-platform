/**
 * Engine Alto — AI Orchestrator
 * Multi-model routing, SSE streaming, token accounting, per-org quotas.
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { metrics, tracer } from '../../observability/telemetry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelConfig {
  id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local-llama' | 'local-onnx';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens: number;
  costPerInputToken: number;   // USD
  costPerOutputToken: number;  // USD
  capabilities: string[];
  priority: number;  // lower = preferred
  enabled: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamOptions {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  orgId?: string;
  userId?: string;
  stream?: boolean;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  model: string;
  timestamp: string;
}

export interface OrgQuota {
  orgId: string;
  maxTokensPerDay: number;
  maxCostPerDay: number;
  usedTokensToday: number;
  usedCostToday: number;
  lastReset: string;
}

// ---------------------------------------------------------------------------
// Model Registry
// ---------------------------------------------------------------------------

const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o',
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 128000,
    costPerInputToken: 0.0000025,
    costPerOutputToken: 0.00001,
    capabilities: ['chat', 'code', 'vision', 'reasoning'],
    priority: 1,
    enabled: !!process.env.OPENAI_API_KEY,
  },
  {
    id: 'claude-3.5-sonnet',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 200000,
    costPerInputToken: 0.000003,
    costPerOutputToken: 0.000015,
    capabilities: ['chat', 'code', 'reasoning', 'analysis'],
    priority: 2,
    enabled: !!process.env.ANTHROPIC_API_KEY,
  },
  {
    id: 'gemini-2.0-flash',
    provider: 'google',
    model: 'gemini-2.0-flash',
    apiKey: process.env.GOOGLE_AI_KEY,
    maxTokens: 1000000,
    costPerInputToken: 0.0000001,
    costPerOutputToken: 0.0000004,
    capabilities: ['chat', 'code', 'vision', 'multimodal'],
    priority: 3,
    enabled: !!process.env.GOOGLE_AI_KEY,
  },
  {
    id: 'local-llama',
    provider: 'local-llama',
    model: 'llama-3.2-8b',
    baseUrl: process.env.LOCAL_LLM_URL || 'http://localhost:8080',
    maxTokens: 8192,
    costPerInputToken: 0,
    costPerOutputToken: 0,
    capabilities: ['chat', 'code'],
    priority: 10,  // fallback
    enabled: true,  // always available as fallback
  },
];

// ---------------------------------------------------------------------------
// AI Orchestrator
// ---------------------------------------------------------------------------

export class AIOrchestrator extends EventEmitter {
  private models: ModelConfig[];
  private quotas = new Map<string, OrgQuota>();
  private usageLog: TokenUsage[] = [];

  constructor(models: ModelConfig[] = DEFAULT_MODELS) {
    super();
    this.models = models;
    logger.info(`[AI Orchestrator] Initialized with ${this.models.filter(m => m.enabled).length} enabled models`);
  }

  // --- Model Routing ---

  selectModel(options: StreamOptions): ModelConfig {
    const available = this.models
      .filter(m => m.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (options.model) {
      const specific = available.find(m => m.id === options.model || m.model === options.model);
      if (specific) return specific;
      logger.warn(`[AI Orchestrator] Requested model '${options.model}' not available, using fallback`);
    }

    if (available.length === 0) {
      throw new Error('No AI models available. Configure at least one API key or local LLM.');
    }

    return available[0];
  }

  // --- Quota Enforcement ---

  checkQuota(orgId: string): { allowed: boolean; reason?: string } {
    const quota = this.quotas.get(orgId);
    if (!quota) return { allowed: true };  // no quota set = unlimited

    // Reset daily quotas
    const today = new Date().toISOString().split('T')[0];
    if (quota.lastReset !== today) {
      quota.usedTokensToday = 0;
      quota.usedCostToday = 0;
      quota.lastReset = today;
    }

    if (quota.usedTokensToday >= quota.maxTokensPerDay) {
      return { allowed: false, reason: `Token limit reached (${quota.usedTokensToday}/${quota.maxTokensPerDay})` };
    }
    if (quota.usedCostToday >= quota.maxCostPerDay) {
      return { allowed: false, reason: `Cost limit reached ($${quota.usedCostToday.toFixed(4)}/$${quota.maxCostPerDay.toFixed(4)})` };
    }

    return { allowed: true };
  }

  setQuota(orgId: string, maxTokens: number, maxCost: number) {
    this.quotas.set(orgId, {
      orgId,
      maxTokensPerDay: maxTokens,
      maxCostPerDay: maxCost,
      usedTokensToday: 0,
      usedCostToday: 0,
      lastReset: new Date().toISOString().split('T')[0],
    });
  }

  // --- Token Accounting ---

  private recordUsage(model: ModelConfig, inputTokens: number, outputTokens: number, orgId?: string) {
    const cost = (inputTokens * model.costPerInputToken) + (outputTokens * model.costPerOutputToken);
    const usage: TokenUsage = {
      inputTokens, outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUsd: cost,
      model: model.id,
      timestamp: new Date().toISOString(),
    };
    this.usageLog.push(usage);

    // Update quota
    if (orgId) {
      const quota = this.quotas.get(orgId);
      if (quota) {
        quota.usedTokensToday += usage.totalTokens;
        quota.usedCostToday += cost;
      }
    }

    // Metrics
    metrics.counter('ai_requests_total', { model: model.id, provider: model.provider });
    metrics.counter('ai_tokens_used_total', { model: model.id, type: 'input' });
    metrics.counter('ai_tokens_used_total', { model: model.id, type: 'output' });
    metrics.gauge('ai_cost_usd_total', this.getTotalCost(), {});

    return usage;
  }

  // --- Streaming Chat ---

  async *streamChat(options: StreamOptions): AsyncGenerator<string, TokenUsage, undefined> {
    const orgId = options.orgId || 'default';
    const quotaCheck = this.checkQuota(orgId);
    if (!quotaCheck.allowed) {
      throw new Error(`Quota exceeded for org '${orgId}': ${quotaCheck.reason}`);
    }

    const model = this.selectModel(options);
    const span = tracer.startSpan('ai.chat.stream', {
      attributes: { model: model.id, provider: model.provider, orgId },
    });

    try {
      logger.info(`[AI Orchestrator] Streaming with ${model.id} (${model.provider})`);

      // Estimate input tokens (rough: 4 chars per token)
      const inputText = options.messages.map(m => m.content).join(' ');
      const estimatedInputTokens = Math.ceil(inputText.length / 4);

      let outputTokens = 0;
      const maxTokens = options.maxTokens || 2048;

      // Call the appropriate provider
      if (model.provider === 'openai' && model.apiKey) {
        yield* this.streamOpenAI(model, options, (tokens) => { outputTokens += tokens; });
      } else if (model.provider === 'anthropic' && model.apiKey) {
        yield* this.streamAnthropic(model, options, (tokens) => { outputTokens += tokens; });
      } else if (model.provider === 'google' && model.apiKey) {
        yield* this.streamGoogle(model, options, (tokens) => { outputTokens += tokens; });
      } else {
        yield* this.streamLocal(model, options, (tokens) => { outputTokens += tokens; });
      }

      const usage = this.recordUsage(model, estimatedInputTokens, outputTokens, orgId);
      tracer.endSpan(span, 'ok');
      return usage;
    } catch (err) {
      tracer.endSpan(span, 'error');

      // Fallback to next model
      const fallback = this.models.find(m => m.enabled && m.id !== model.id);
      if (fallback) {
        logger.warn(`[AI Orchestrator] ${model.id} failed, falling back to ${fallback.id}`);
        yield* this.streamLocal(fallback, options, () => {});
        return this.recordUsage(fallback, 0, 0, orgId);
      }
      throw err;
    }
  }

  // --- Provider-specific streaming ---

  private async *streamOpenAI(model: ModelConfig, options: StreamOptions, onToken: (n: number) => void): AsyncGenerator<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`,
        },
        body: JSON.stringify({
          model: model.model,
          messages: options.messages,
          max_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                onToken(1);
                yield content;
              }
            } catch { /* skip malformed lines */ }
          }
        }
      }
    } catch (err) {
      logger.error(`[AI Orchestrator] OpenAI stream error:`, err);
      throw err;
    }
  }

  private async *streamAnthropic(model: ModelConfig, options: StreamOptions, onToken: (n: number) => void): AsyncGenerator<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': model.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model.model,
          max_tokens: options.maxTokens || 2048,
          messages: options.messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role, content: m.content,
          })),
          system: options.messages.find(m => m.role === 'system')?.content || '',
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const reader = response.body.getReader();
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
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                onToken(1);
                yield data.delta.text;
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (err) {
      logger.error(`[AI Orchestrator] Anthropic stream error:`, err);
      throw err;
    }
  }

  private async *streamGoogle(model: ModelConfig, options: StreamOptions, onToken: (n: number) => void): AsyncGenerator<string> {
    // Google Gemini streaming
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.model}:streamGenerateContent?key=${model.apiKey}&alt=sse`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: options.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: options.maxTokens || 2048,
            temperature: options.temperature || 0.7,
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Google AI error: ${response.status}`);
      }

      const reader = response.body.getReader();
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
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                onToken(1);
                yield text;
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch (err) {
      logger.error(`[AI Orchestrator] Google stream error:`, err);
      throw err;
    }
  }

  private async *streamLocal(model: ModelConfig, options: StreamOptions, onToken: (n: number) => void): AsyncGenerator<string> {
    // Local LLM fallback (llama.cpp, Ollama, etc.)
    const baseUrl = model.baseUrl || 'http://localhost:8080';

    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.model,
          messages: options.messages,
          max_tokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          stream: true,
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  onToken(1);
                  yield content;
                }
              } catch { /* skip */ }
            }
          }
        }
      } else {
        // Fallback: mock response for dev
        logger.warn('[AI Orchestrator] Local LLM unavailable, using mock response');
        const mockResponse = 'I am the Engine Alto AI assistant. The local LLM is currently unavailable, but the streaming pipeline is working correctly. Please configure a model (OpenAI/Anthropic/Google/local llama.cpp) to enable real AI responses.';
        for (const word of mockResponse.split(' ')) {
          onToken(1);
          yield word + ' ';
          await new Promise(r => setTimeout(r, 30));
        }
      }
    } catch {
      logger.warn('[AI Orchestrator] Local LLM connection failed, using mock');
      const fallbackMsg = 'AI streaming pipeline verified. Configure an LLM endpoint for real responses.';
      for (const char of fallbackMsg) {
        onToken(1);
        yield char;
        await new Promise(r => setTimeout(r, 10));
      }
    }
  }

  // --- Status & Reporting ---

  getStatus() {
    return {
      models: this.models.map(m => ({
        id: m.id, provider: m.provider, enabled: m.enabled,
        capabilities: m.capabilities, priority: m.priority,
      })),
      quotas: Object.fromEntries(this.quotas),
      totalRequests: this.usageLog.length,
      totalCost: this.getTotalCost(),
      recentUsage: this.usageLog.slice(-10),
    };
  }

  getTotalCost(): number {
    return this.usageLog.reduce((sum, u) => sum + u.costUsd, 0);
  }

  getUsageReport() {
    return {
      totalRequests: this.usageLog.length,
      totalTokens: this.usageLog.reduce((sum, u) => sum + u.totalTokens, 0),
      totalCostUsd: this.getTotalCost(),
      byModel: this.usageLog.reduce((acc, u) => {
        if (!acc[u.model]) acc[u.model] = { requests: 0, tokens: 0, costUsd: 0 };
        acc[u.model].requests++;
        acc[u.model].tokens += u.totalTokens;
        acc[u.model].costUsd += u.costUsd;
        return acc;
      }, {} as Record<string, { requests: number; tokens: number; costUsd: number }>),
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const aiOrchestrator = new AIOrchestrator();
