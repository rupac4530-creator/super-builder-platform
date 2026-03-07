/**
 * Community Hub — Contributors submit adapters, agents, templates; ranked and auto-integrated.
 * GET  /api/community              — community overview
 * GET  /api/community/contributors — top contributors
 * GET  /api/community/submissions  — submitted plugins/adapters
 * POST /api/community/submit       — submit new contribution
 * POST /api/community/:id/vote     — upvote a submission
 */
import { Router, Request, Response } from 'express';
const router = Router();

interface Contributor { id: string; name: string; avatar: string; contributions: number; rank: number; badges: string[]; joinedAt: string; }
interface Submission { id: string; title: string; type: 'adapter' | 'agent' | 'template' | 'plugin' | 'dataset'; author: string; description: string; votes: number; status: 'pending' | 'approved' | 'featured' | 'rejected'; downloadCount: number; createdAt: string; tags: string[]; }

const contributors: Contributor[] = [
    { id: 'c1', name: 'AlexDev', avatar: '👨‍💻', contributions: 47, rank: 1, badges: ['🏆 Top Contributor', '🔧 Core Maintainer', '⭐ 100+ Stars'], joinedAt: '2025-06-15' },
    { id: 'c2', name: 'SarahAI', avatar: '👩‍🔬', contributions: 38, rank: 2, badges: ['🤖 AI Pioneer', '📦 Plugin Expert'], joinedAt: '2025-07-20' },
    { id: 'c3', name: 'RoboKid', avatar: '🤖', contributions: 29, rank: 3, badges: ['🦾 Robotics Guru', '🎮 Game Dev'], joinedAt: '2025-08-10' },
    { id: 'c4', name: 'DataNinja', avatar: '🥷', contributions: 22, rank: 4, badges: ['📊 Data Wizard'], joinedAt: '2025-09-01' },
    { id: 'c5', name: 'PixelArtist', avatar: '🎨', contributions: 18, rank: 5, badges: ['🎨 Creative Genius'], joinedAt: '2025-09-15' },
];

const submissions: Submission[] = [
    { id: 's1', title: 'Gemini Pro Adapter', type: 'adapter', author: 'AlexDev', description: 'Google Gemini Pro integration with multimodal support.', votes: 234, status: 'featured', downloadCount: 1560, createdAt: '2026-01-15', tags: ['LLM', 'multimodal', 'Google'] },
    { id: 's2', title: 'Claude Agent Template', type: 'template', author: 'SarahAI', description: 'Ready-to-use Anthropic Claude agent with tool calling and memory.', votes: 189, status: 'approved', downloadCount: 890, createdAt: '2026-02-01', tags: ['agent', 'Claude', 'Anthropic'] },
    { id: 's3', title: 'Drone Sim Plugin', type: 'plugin', author: 'RoboKid', description: 'PX4-based drone simulation with ROS 2 integration for autonomous flight.', votes: 145, status: 'approved', downloadCount: 340, createdAt: '2026-02-10', tags: ['robotics', 'drone', 'PX4'] },
    { id: 's4', title: 'Financial Data Pipeline', type: 'template', author: 'DataNinja', description: 'Real-time stock data → analysis → prediction → dashboard workflow.', votes: 112, status: 'approved', downloadCount: 560, createdAt: '2026-02-18', tags: ['finance', 'data', 'ML'] },
    { id: 's5', title: 'StyleGAN3 Art Generator', type: 'adapter', author: 'PixelArtist', description: 'Generate high-resolution artwork using StyleGAN3 with style mixing.', votes: 98, status: 'pending', downloadCount: 210, createdAt: '2026-03-01', tags: ['art', 'GAN', 'style-transfer'] },
    { id: 's6', title: 'IoT Sensor Dashboard', type: 'plugin', author: 'AlexDev', description: 'Real-time IoT sensor data visualization with MQTT and InfluxDB.', votes: 76, status: 'pending', downloadCount: 120, createdAt: '2026-03-05', tags: ['IoT', 'MQTT', 'dashboard'] },
];

router.get('/', (_req: Request, res: Response) => {
    res.json({ totalContributors: contributors.length, totalSubmissions: submissions.length, featuredCount: submissions.filter(s => s.status === 'featured').length, totalDownloads: submissions.reduce((s, sub) => s + sub.downloadCount, 0) });
});
router.get('/contributors', (_req: Request, res: Response) => { res.json({ contributors }); });
router.get('/submissions', (_req: Request, res: Response) => {
    const type = _req.query.type as string | undefined;
    const filtered = type ? submissions.filter(s => s.type === type) : submissions;
    res.json({ total: filtered.length, submissions: filtered });
});
router.post('/submit', (req: Request, res: Response) => {
    const { title, type, author, description, tags } = req.body;
    const sub: Submission = { id: `s${Date.now()}`, title: title || 'Untitled', type: type || 'plugin', author: author || 'Anonymous', description: description || '', votes: 0, status: 'pending', downloadCount: 0, createdAt: new Date().toISOString(), tags: tags || [] };
    submissions.push(sub);
    res.json({ success: true, submission: sub });
});
router.post('/:id/vote', (req: Request, res: Response) => {
    const sub = submissions.find(s => s.id === req.params.id);
    if (!sub) return res.status(404).json({ error: 'Not found' });
    sub.votes++;
    if (sub.votes > 200 && sub.status === 'pending') sub.status = 'approved';
    res.json({ success: true, votes: sub.votes, status: sub.status });
});

export default router;
