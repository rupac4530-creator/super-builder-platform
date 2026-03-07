/**
 * OpenClaw Backend Routes
 * 
 * Manages OpenClaw agents, skills, and task execution.
 */

import { Router, Request, Response } from 'express';

const router = Router();

/* ── Mock Data ─────────────────────────────────────────── */
const agents = [
    {
        id: 'ag-001', name: 'CodeAssistant', model: 'gemini-2.5-pro',
        personality: 'A precise, senior software engineer who writes clean, tested code.',
        skills: ['Memory', 'Code Writer', 'File Manager', 'Git Operations'],
        memory: { type: 'long-term', entries: 245 },
        status: 'active', createdAt: '2026-03-01T10:00:00Z',
    },
    {
        id: 'ag-002', name: 'ResearchBot', model: 'llama-3.3-70b',
        personality: 'A thorough researcher who cites sources and provides balanced analysis.',
        skills: ['Memory', 'Perplexity Search'],
        memory: { type: 'long-term', entries: 89 },
        status: 'active', createdAt: '2026-03-03T14:30:00Z',
    },
    {
        id: 'ag-003', name: 'BlogGenius', model: 'gemini-2.5-flash',
        personality: 'An SEO expert who writes engaging, keyword-optimized blog posts.',
        skills: ['Memory', 'Perplexity Search', 'Blog Generator'],
        memory: { type: 'short-term', entries: 12 },
        status: 'paused', createdAt: '2026-03-05T09:15:00Z',
    },
];

const skills = [
    { id: 'sk-001', name: 'Memory', description: 'Long-term conversation memory using embeddings', author: 'openclaw-core', verified: true, category: 'core', installed: true },
    { id: 'sk-002', name: 'Perplexity Search', description: 'Web search via Perplexity API for real-time info', author: 'openclaw-core', verified: true, category: 'search', installed: true },
    { id: 'sk-003', name: 'Code Writer', description: 'Write, edit, and refactor code across languages', author: 'openclaw-core', verified: true, category: 'dev-tools', installed: true },
    { id: 'sk-004', name: 'File Manager', description: 'Create, read, update, and delete files', author: 'openclaw-core', verified: true, category: 'system', installed: true },
    { id: 'sk-005', name: 'Git Operations', description: 'Commit, push, pull, branch management', author: 'openclaw-core', verified: true, category: 'dev-tools', installed: true },
    { id: 'sk-006', name: 'Browser Pilot', description: 'Automated browser control via Playwright', author: 'community', verified: true, category: 'automation', installed: false },
    { id: 'sk-007', name: 'Blog Generator', description: 'SEO-optimized blog writing with keyword research', author: 'community', verified: true, category: 'content', installed: false },
    { id: 'sk-008', name: 'Email Automator', description: 'Read, compose, and send emails automatically', author: 'community', verified: false, category: 'automation', installed: false },
    { id: 'sk-009', name: 'Airtable Sync', description: 'Read/write data to Airtable bases', author: 'community', verified: true, category: 'integrations', installed: false },
    { id: 'sk-010', name: 'Screenshot OCR', description: 'Capture screenshots and extract text via OCR', author: 'community', verified: true, category: 'vision', installed: false },
];

const tasks = [
    {
        taskId: 'task-001', agentId: 'ag-001', agentName: 'CodeAssistant', status: 'completed',
        input: 'Create a REST API endpoint for user authentication with JWT tokens',
        output: 'Created auth.ts with login/register/refresh endpoints, JWT middleware, and bcrypt password hashing. All tests passing.',
        tokensUsed: 4520, costEstimate: '$0.00 (free tier)',
        startedAt: '2026-03-07T10:00:00Z', completedAt: '2026-03-07T10:02:30Z',
    },
    {
        taskId: 'task-002', agentId: 'ag-002', agentName: 'ResearchBot', status: 'completed',
        input: 'Research the top 5 open-source LLM hosting solutions for production',
        output: '1) vLLM (best throughput), 2) TGI (HuggingFace native), 3) Ollama (easiest), 4) llama.cpp (lowest resources), 5) TensorRT-LLM (NVIDIA GPUs).',
        tokensUsed: 8200, costEstimate: '$0.00 (free tier)',
        startedAt: '2026-03-07T11:30:00Z', completedAt: '2026-03-07T11:35:00Z',
    },
];

/* ── Routes ─────────────────────────────────────────── */

router.get('/status', (_req: Request, res: Response) => {
    res.json({
        connected: true,
        version: '0.10.0',
        host: process.env.OPENCLAW_HOST || 'http://localhost:3100',
        agents: agents.length,
        skills: skills.filter(s => s.installed).length,
        uptime: '4h 23m',
    });
});

router.get('/agents', (_req: Request, res: Response) => {
    res.json({ agents, total: agents.length });
});

router.post('/agents', (req: Request, res: Response) => {
    const { name, model, personality, skills: agentSkills } = req.body;
    const newAgent = {
        id: `ag-${String(agents.length + 1).padStart(3, '0')}`,
        name: name || 'New Agent',
        model: model || 'gemini-2.5-flash',
        personality: personality || 'A helpful AI assistant.',
        skills: agentSkills || ['Memory'],
        memory: { type: 'short-term' as const, entries: 0 },
        status: 'active' as const, createdAt: new Date().toISOString(),
    };
    agents.push(newAgent);
    res.status(201).json(newAgent);
});

router.get('/skills', (_req: Request, res: Response) => {
    res.json({
        skills,
        installed: skills.filter(s => s.installed).length,
        available: skills.filter(s => !s.installed).length,
    });
});

router.post('/skills/:id/install', (req: Request, res: Response) => {
    const skill = skills.find(s => s.id === req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    skill.installed = true;
    res.json({ success: true, message: `Skill "${skill.name}" installed`, skill });
});

router.post('/run', (req: Request, res: Response) => {
    const { agentId, input } = req.body;
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    const task = {
        taskId: `task-${String(tasks.length + 1).padStart(3, '0')}`,
        agentId, agentName: agent.name, status: 'completed' as const,
        input, output: `[${agent.name}] Task completed: ${input.substring(0, 100)}`,
        tokensUsed: Math.floor(Math.random() * 10000) + 500,
        costEstimate: '$0.00 (free tier)',
        startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    };
    tasks.push(task);
    res.status(201).json(task);
});

router.get('/tasks', (_req: Request, res: Response) => {
    res.json({ tasks: tasks.slice(-20), total: tasks.length });
});

export default router;
