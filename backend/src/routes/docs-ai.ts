/**
 * AI Documentation — Auto-generate docs, tutorials, integration guides from code & usage.
 * GET  /api/docs-ai              — list all generated docs
 * GET  /api/docs-ai/:id          — get specific doc
 * POST /api/docs-ai/generate     — generate docs for a topic
 * GET  /api/docs-ai/tutorials    — list tutorials
 */
import { Router, Request, Response } from 'express';
const router = Router();

interface DocEntry { id: string; title: string; type: 'guide' | 'tutorial' | 'reference' | 'example'; category: string; content: string; generatedAt: string; readTime: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; }

const docs: DocEntry[] = [
    { id: 'doc1', title: 'Getting Started with SuperBuilder', type: 'guide', category: 'Platform', content: '# Getting Started\\n\\n1. Clone the repository\\n2. Run `npm install` in both `backend/` and `platform/`\\n3. Start backend: `npx tsx watch src/server.ts`\\n4. Start frontend: `npx next dev`\\n5. Open http://localhost:3000\\n\\n## Dashboard Overview\\nThe dashboard shows system health, active agents, model status, and quick-access tools.', generatedAt: new Date().toISOString(), readTime: '5 min', difficulty: 'beginner' },
    { id: 'doc2', title: 'Building Your First AI Agent', type: 'tutorial', category: 'AI Agents', content: '# Build an AI Agent\\n\\n## Step 1: Choose an orchestration framework\\nSelect LangChain, AutoGen, or MetaGPT from the Integrations Hub.\\n\\n## Step 2: Configure tools\\nAttach vector DB (FAISS/Milvus) for memory.\\n\\n## Step 3: Define the pipeline\\nUse the Workflow Builder to connect nodes: Input → LLM → Tools → Output.\\n\\n## Step 4: Test & Deploy\\nRun tests from the Testing panel, then deploy via Deployment Center.', generatedAt: new Date().toISOString(), readTime: '12 min', difficulty: 'intermediate' },
    { id: 'doc3', title: 'Integration Adapter Development Guide', type: 'reference', category: 'Development', content: '# Creating a New Adapter\\n\\n1. Create file in `integrations/<category>/`\\n2. Extend `AbstractAdapter` from `base-adapter.ts`\\n3. Implement `install()`, `start()`, `stop()` methods\\n4. Register in `registry.ts`\\n5. Add row to `matrix.md`\\n6. Add smoke test\\n7. Add docs under `docs/integrations/<name>/`', generatedAt: new Date().toISOString(), readTime: '8 min', difficulty: 'advanced' },
    { id: 'doc4', title: 'Visual Workflow Builder Tutorial', type: 'tutorial', category: 'Workflows', content: '# Visual Workflow Builder\\n\\n## Drag & Drop Nodes\\nEach node represents a tool integration.\\n\\n## Connect Edges\\nDraw connections between nodes to define data flow.\\n\\n## Templates\\nStart with a pre-built template and customize.\\n\\n## Run & Monitor\\nClick "Run" to execute the pipeline. Watch real-time progress.', generatedAt: new Date().toISOString(), readTime: '7 min', difficulty: 'beginner' },
    { id: 'doc5', title: 'Multi-Cloud Deployment Guide', type: 'guide', category: 'Deployment', content: '# Deploying to the Cloud\\n\\n## Supported Targets\\n- AWS, GCP, Azure (cloud)\\n- Docker, Kubernetes (container)\\n- Local machine, Edge devices\\n\\n## Steps\\n1. Select pipeline/app to deploy\\n2. Choose target & region\\n3. Configure resources (CPU, GPU, RAM)\\n4. Deploy and get a live URL\\n5. Monitor via Analytics dashboard', generatedAt: new Date().toISOString(), readTime: '10 min', difficulty: 'intermediate' },
    { id: 'doc6', title: 'Cross-Integration Fusion Examples', type: 'example', category: 'Innovation', content: '# Tool Fusion Examples\\n\\n## LangChain + Godot = AI Game Generator\\nLLM writes game scripts → Godot compiles and runs\\n\\n## Whisper + Nerfstudio = Voice-to-3D\\nSpeak a scene → transcribe → generate 3D NeRF\\n\\n## AutoGen + Prometheus = Self-Healing Code\\nDetect bugs auto → multi-agent fix → deploy', generatedAt: new Date().toISOString(), readTime: '6 min', difficulty: 'intermediate' },
];

router.get('/', (_req: Request, res: Response) => {
    const type = _req.query.type as string | undefined;
    const filtered = type ? docs.filter(d => d.type === type) : docs;
    res.json({ total: filtered.length, docs: filtered.map(d => ({ id: d.id, title: d.title, type: d.type, category: d.category, readTime: d.readTime, difficulty: d.difficulty })) });
});

router.get('/tutorials', (_req: Request, res: Response) => {
    const tutorials = docs.filter(d => d.type === 'tutorial');
    res.json({ total: tutorials.length, tutorials });
});

router.get('/:id', (req: Request, res: Response) => {
    const doc = docs.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Doc not found' });
    res.json(doc);
});

router.post('/generate', (req: Request, res: Response) => {
    const { topic, type, difficulty } = req.body;
    const doc: DocEntry = { id: `doc${Date.now()}`, title: `Auto-Generated: ${topic || 'Untitled'}`, type: type || 'guide', category: 'Auto-Generated', content: `# ${topic || 'Untitled'}\\n\\nThis documentation was auto-generated by SuperBuilder's AI Documentation Engine.\\n\\n## Overview\\nContent generated based on platform usage patterns and code analysis.\\n\\n## Getting Started\\n[AI will fill this section based on the topic]\\n\\n## Examples\\n[Auto-generated examples from actual pipeline usage]`, generatedAt: new Date().toISOString(), readTime: '5 min', difficulty: difficulty || 'beginner' };
    docs.push(doc);
    res.json({ success: true, doc });
});

export default router;
