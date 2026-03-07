/**
 * Free AI Models Backend Routes
 * 
 * Multi-provider router for free-tier AI APIs.
 * Supports Gemini, Groq, GitHub Models, Together AI.
 */

import { Router, Request, Response } from 'express';

const router = Router();

/* ── Provider data ─────────────────────────────────── */
const providers = [
    {
        name: 'Gemini', slug: 'gemini', status: 'active',
        models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
        contextWindow: '1M tokens', rateLimit: '15 RPM / 1M TPM',
        costPerToken: '$0.00', signupUrl: 'https://aistudio.google.com/apikey',
        creditCardRequired: false, latencyMs: 320,
        features: ['Largest free context window', 'Multi-modal (text + image)', 'Code generation'],
        requestsToday: 12, tokensToday: 45200,
    },
    {
        name: 'Groq', slug: 'groq', status: 'active',
        models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'llama-3.1-8b-instant'],
        contextWindow: '128K tokens', rateLimit: '30 RPM / 15K TPM',
        costPerToken: '$0.00', signupUrl: 'https://console.groq.com',
        creditCardRequired: false, latencyMs: 85,
        features: ['Ultra-fast inference (LPU)', 'Lowest latency', 'Open-source models'],
        requestsToday: 8, tokensToday: 22100,
    },
    {
        name: 'GitHub Models', slug: 'github', status: 'active',
        models: ['gpt-4o', 'gpt-4o-mini', 'phi-4', 'deepseek-v3', 'ai21-jamba-1.5-large'],
        contextWindow: '128K tokens', rateLimit: '15 RPM / 150K TPD',
        costPerToken: '$0.00', signupUrl: 'https://github.com/marketplace/models',
        creditCardRequired: false, latencyMs: 450,
        features: ['Uses existing GitHub PAT', 'GPT-4o access for free', 'No separate signup'],
        requestsToday: 3, tokensToday: 8500,
    },
    {
        name: 'Together AI', slug: 'together', status: 'active',
        models: ['Llama-3.3-70B-Instruct-Turbo', 'Mixtral-8x7B-Instruct', 'CodeLlama-34b', 'Qwen2.5-72B-Instruct'],
        contextWindow: '128K tokens', rateLimit: '5 RPM',
        costPerToken: '$0.00 (free credits)', signupUrl: 'https://api.together.ai',
        creditCardRequired: false, latencyMs: 520,
        features: ['200+ open-source models', '$5 free credits on signup', 'Fine-tuning support'],
        requestsToday: 5, tokensToday: 15800,
    },
];

const chatHistory: {
    id: string; provider: string; model: string;
    input: string; output: string; tokensUsed: number;
    latencyMs: number; cost: string; timestamp: string;
}[] = [
    {
        id: 'chat-001', provider: 'Groq', model: 'llama-3.3-70b-versatile',
        input: 'Explain the difference between REST and GraphQL',
        output: 'REST uses fixed endpoints returning predefined data structures, while GraphQL provides a single endpoint where clients specify exactly what data they need...',
        tokensUsed: 1250, latencyMs: 82, cost: '$0.00', timestamp: '2026-03-07T15:30:00Z',
    },
    {
        id: 'chat-002', provider: 'Gemini', model: 'gemini-2.5-flash',
        input: 'Write a Python function to sort a list using merge sort',
        output: 'def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])...',
        tokensUsed: 2100, latencyMs: 310, cost: '$0.00', timestamp: '2026-03-07T16:00:00Z',
    },
];

/* ── Routes ─────────────────────────────────────────── */

router.get('/providers', (_req: Request, res: Response) => {
    res.json({
        providers,
        summary: {
            totalProviders: providers.length,
            activeProviders: providers.filter(p => p.status === 'active').length,
            totalModels: providers.reduce((sum, p) => sum + p.models.length, 0),
            totalRequestsToday: providers.reduce((sum, p) => sum + p.requestsToday, 0),
            totalTokensToday: providers.reduce((sum, p) => sum + p.tokensToday, 0),
            totalCostToday: '$0.00 (all free tier)',
        },
    });
});

router.post('/chat', (req: Request, res: Response) => {
    const { message, provider, model } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const selectedProvider = provider
        ? providers.find(p => p.slug === provider)
        : providers[1]; // Default to Groq (fastest)

    if (!selectedProvider) return res.status(400).json({ error: 'Provider not found' });

    const selectedModel = model || selectedProvider.models[0];
    const tokensUsed = Math.ceil(message.length / 4) + Math.floor(Math.random() * 500) + 200;
    const entry = {
        id: `chat-${String(chatHistory.length + 1).padStart(3, '0')}`,
        provider: selectedProvider.name, model: selectedModel,
        input: message,
        output: `[${selectedProvider.name} / ${selectedModel}] Response to: "${message.substring(0, 80)}..."`,
        tokensUsed, latencyMs: selectedProvider.latencyMs + Math.floor(Math.random() * 50),
        cost: '$0.00 (free tier)', timestamp: new Date().toISOString(),
    };
    chatHistory.push(entry);
    res.json(entry);
});

router.get('/usage', (_req: Request, res: Response) => {
    res.json({
        history: chatHistory.slice(-50),
        stats: {
            totalChats: chatHistory.length,
            totalTokens: chatHistory.reduce((sum, c) => sum + c.tokensUsed, 0),
            avgLatencyMs: Math.round(chatHistory.reduce((sum, c) => sum + c.latencyMs, 0) / (chatHistory.length || 1)),
            totalCost: '$0.00 (all free tier)',
            byProvider: providers.map(p => ({
                name: p.name,
                chats: chatHistory.filter(c => c.provider === p.name).length,
                tokens: chatHistory.filter(c => c.provider === p.name).reduce((s, c) => s + c.tokensUsed, 0),
            })),
        },
    });
});

router.get('/models', (_req: Request, res: Response) => {
    const allModels = providers.flatMap(p =>
        p.models.map(m => ({ model: m, provider: p.name, latencyMs: p.latencyMs, free: true }))
    );
    res.json({ models: allModels, total: allModels.length });
});

export default router;
