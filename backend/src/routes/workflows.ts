/**
 * Visual Workflow Builder — No-code AI pipeline builder with drag-and-drop nodes.
 * GET  /api/workflows           — list saved workflows
 * GET  /api/workflows/:id       — get workflow details
 * POST /api/workflows           — create/save workflow
 * POST /api/workflows/:id/run   — execute a workflow
 * DELETE /api/workflows/:id     — delete workflow
 * GET  /api/workflows/templates — prebuilt workflow templates
 */
import { Router, Request, Response } from 'express';
const router = Router();

interface WorkflowNode { id: string; type: string; tool: string; config: Record<string, any>; position: { x: number; y: number }; }
interface WorkflowEdge { source: string; target: string; label?: string; }
interface Workflow { id: string; name: string; description: string; nodes: WorkflowNode[]; edges: WorkflowEdge[]; status: 'draft' | 'running' | 'completed' | 'failed'; createdAt: string; lastRun: string | null; runCount: number; }

const workflows: Workflow[] = [
    {
        id: 'wf1', name: 'AI Content Pipeline', description: 'Audio → Transcribe → Summarize → Generate Image → Narrate',
        nodes: [
            { id: 'n1', type: 'input', tool: 'Audio Upload', config: {}, position: { x: 50, y: 200 } },
            { id: 'n2', type: 'process', tool: 'Whisper', config: { model: 'large-v3' }, position: { x: 250, y: 200 } },
            { id: 'n3', type: 'process', tool: 'LangChain', config: { chain: 'summarize' }, position: { x: 450, y: 200 } },
            { id: 'n4', type: 'process', tool: 'Diffusers', config: { model: 'sdxl' }, position: { x: 650, y: 150 } },
            { id: 'n5', type: 'process', tool: 'Coqui TTS', config: { voice: 'default' }, position: { x: 650, y: 280 } },
            { id: 'n6', type: 'output', tool: 'Artifact Export', config: { format: 'zip' }, position: { x: 850, y: 200 } },
        ],
        edges: [{ source: 'n1', target: 'n2' }, { source: 'n2', target: 'n3' }, { source: 'n3', target: 'n4' }, { source: 'n3', target: 'n5' }, { source: 'n4', target: 'n6' }, { source: 'n5', target: 'n6' }],
        status: 'completed', createdAt: new Date().toISOString(), lastRun: new Date().toISOString(), runCount: 15,
    },
];

const templates = [
    { id: 'tmpl1', name: 'RAG Knowledge Assistant', description: 'Index docs → Vector DB → Query → Response', nodes: 4, category: 'AI Agent' },
    { id: 'tmpl2', name: 'Image Generation Studio', description: 'Prompt → SDXL → ControlNet → Upscale → Export', nodes: 5, category: 'Creative' },
    { id: 'tmpl3', name: 'Model Training Pipeline', description: 'Data → Preprocess → Train → Evaluate → Deploy', nodes: 5, category: 'MLOps' },
    { id: 'tmpl4', name: 'Multi-Agent Debate', description: 'Topic → Agent A → Agent B → Judge → Summary', nodes: 5, category: 'AI Agent' },
    { id: 'tmpl5', name: 'Video from Text', description: 'Script → TTS → Image seq → Animate → Export MP4', nodes: 5, category: 'Creative' },
    { id: 'tmpl6', name: 'Auto Code Review', description: 'PR → Lint → Test → AI Review → Report', nodes: 5, category: 'DevOps' },
    { id: 'tmpl7', name: 'Photo to 3D Game Asset', description: 'Photos → NeRF → Mesh → Texture → Godot Import', nodes: 5, category: '3D' },
    { id: 'tmpl8', name: 'Real-time Chat Bot', description: 'Input → LLM → Memory → RAG → Response', nodes: 5, category: 'AI Agent' },
];

router.get('/', (_req: Request, res: Response) => { res.json({ total: workflows.length, workflows }); });
router.get('/templates', (_req: Request, res: Response) => { res.json({ templates }); });
router.get('/:id', (req: Request, res: Response) => {
    const wf = workflows.find(w => w.id === req.params.id);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    res.json(wf);
});
router.post('/', (req: Request, res: Response) => {
    const { name, description, nodes, edges } = req.body;
    const wf: Workflow = { id: `wf${Date.now()}`, name: name || 'Untitled', description: description || '', nodes: nodes || [], edges: edges || [], status: 'draft', createdAt: new Date().toISOString(), lastRun: null, runCount: 0 };
    workflows.push(wf);
    res.json({ success: true, workflow: wf });
});
router.post('/:id/run', (req: Request, res: Response) => {
    const wf = workflows.find(w => w.id === req.params.id);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    wf.status = 'running'; wf.runCount++; wf.lastRun = new Date().toISOString();
    setTimeout(() => { wf.status = 'completed'; }, 3000);
    res.json({ success: true, message: `Workflow "${wf.name}" started`, workflow: wf });
});
router.delete('/:id', (req: Request, res: Response) => {
    const idx = workflows.findIndex(w => w.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Workflow not found' });
    workflows.splice(idx, 1);
    res.json({ success: true, message: 'Workflow deleted' });
});

export default router;
