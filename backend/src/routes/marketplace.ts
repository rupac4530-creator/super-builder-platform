/**
 * AI Marketplace — Publish, discover, fork pipelines, tools, models, datasets.
 * GET  /api/marketplace              — browse marketplace
 * GET  /api/marketplace/:id          — get item details
 * POST /api/marketplace/publish      — publish an item
 * POST /api/marketplace/:id/install  — install item
 */
import { Router, Request, Response } from 'express';
const router = Router();

interface MarketplaceItem {
    id: string; name: string; type: 'pipeline' | 'model' | 'dataset' | 'plugin' | 'theme' | 'agent-template';
    author: string; description: string; price: string; rating: number; reviews: number;
    downloads: number; category: string; tags: string[]; version: string;
    createdAt: string; featured: boolean;
}

const items: MarketplaceItem[] = [
    { id: 'm1', name: 'Ultimate RAG Pipeline', type: 'pipeline', author: 'SuperBuilder Team', description: 'Production-ready RAG pipeline with LlamaIndex + Milvus + LangChain. Includes auto-chunking, hybrid search, and streaming.', price: 'Free', rating: 4.9, reviews: 342, downloads: 5600, category: 'AI', tags: ['RAG', 'LLM', 'production'], version: '2.1.0', createdAt: '2026-01-01', featured: true },
    { id: 'm2', name: 'SDXL Art Studio Pro', type: 'pipeline', author: 'PixelArtist', description: 'Professional image generation workflow with ControlNet, upscaling, style-mixing, and batch processing.', price: 'Free', rating: 4.8, reviews: 218, downloads: 3400, category: 'Creative', tags: ['image-gen', 'SDXL', 'art'], version: '1.5.0', createdAt: '2026-01-15', featured: true },
    { id: 'm3', name: 'Multi-Agent Dev Team', type: 'agent-template', author: 'AlexDev', description: '5-agent team: PM, Architect, Frontend Dev, Backend Dev, QA — automated software development.', price: '$9.99', rating: 4.7, reviews: 156, downloads: 2100, category: 'Development', tags: ['agents', 'coding', 'team'], version: '1.2.0', createdAt: '2026-02-01', featured: true },
    { id: 'm4', name: 'Voice Assistant Kit', type: 'pipeline', author: 'SarahAI', description: 'Complete voice assistant: Whisper (listen) → LLM (think) → TTS (speak). Works offline with local models.', price: 'Free', rating: 4.6, reviews: 134, downloads: 1800, category: 'Audio', tags: ['voice', 'assistant', 'offline'], version: '1.0.0', createdAt: '2026-02-10', featured: false },
    { id: 'm5', name: 'Cyberpunk Dark Theme', type: 'theme', author: 'PixelArtist', description: 'Neon-glow cyberpunk theme for SuperBuilder UI with animated particles and glassmorphism.', price: 'Free', rating: 4.9, reviews: 567, downloads: 8900, category: 'UI', tags: ['theme', 'dark', 'cyberpunk'], version: '3.0.0', createdAt: '2026-01-20', featured: true },
    { id: 'm6', name: 'Medical AI Dataset Pack', type: 'dataset', author: 'DataNinja', description: 'Curated medical imaging datasets (X-ray, MRI, CT) with labels for training diagnostic models.', price: '$29.99', rating: 4.5, reviews: 89, downloads: 450, category: 'Healthcare', tags: ['medical', 'imaging', 'training'], version: '1.1.0', createdAt: '2026-02-20', featured: false },
    { id: 'm7', name: 'LLM Fine-Tuning Template', type: 'model', author: 'SuperBuilder Team', description: 'Ready-to-use LoRA fine-tuning pipeline with QLoRA, gradient checkpointing, and WandB logging.', price: 'Free', rating: 4.8, reviews: 234, downloads: 3200, category: 'ML', tags: ['fine-tuning', 'LoRA', 'LLM'], version: '2.0.0', createdAt: '2026-01-25', featured: true },
    { id: 'm8', name: 'Autonomous Drone Controller', type: 'plugin', author: 'RoboKid', description: 'PX4/ArduPilot integration with path planning, obstacle avoidance, and mission editor.', price: '$14.99', rating: 4.4, reviews: 67, downloads: 280, category: 'Robotics', tags: ['drone', 'autonomous', 'PX4'], version: '1.0.0', createdAt: '2026-03-01', featured: false },
];

router.get('/', (_req: Request, res: Response) => {
    const category = _req.query.category as string | undefined;
    const type = _req.query.type as string | undefined;
    let filtered = items;
    if (category) filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
    if (type) filtered = filtered.filter(i => i.type === type);
    const categories = [...new Set(items.map(i => i.category))];
    const types = [...new Set(items.map(i => i.type))];
    const featured = items.filter(i => i.featured);
    res.json({ total: filtered.length, categories, types, featured: featured.length, items: filtered });
});

router.get('/:id', (req: Request, res: Response) => {
    const item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
});

router.post('/publish', (req: Request, res: Response) => {
    const { name, type, description, category, tags, price } = req.body;
    const item: MarketplaceItem = { id: `m${Date.now()}`, name: name || 'Untitled', type: type || 'plugin', author: 'You', description: description || '', price: price || 'Free', rating: 0, reviews: 0, downloads: 0, category: category || 'General', tags: tags || [], version: '1.0.0', createdAt: new Date().toISOString(), featured: false };
    items.push(item);
    res.json({ success: true, item });
});

router.post('/:id/install', (req: Request, res: Response) => {
    const item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.downloads++;
    res.json({ success: true, message: `${item.name} installed successfully`, item });
});

export default router;
