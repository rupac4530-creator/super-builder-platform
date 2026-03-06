/**
 * Unified Control Center — Aggregator Route
 * GET /api/control-center/overview
 *
 * Read-only orchestration layer that aggregates status from existing
 * internal endpoints. Does NOT modify, remove, or directly couple to
 * any feature module — navigation only.
 *
 * Versioned v1 response contract.
 */

import { Router, Request, Response } from 'express';
import http from 'http';

const router = Router();

// ─── Config ───────────────────────────────────────────────────────
const INTERNAL_BASE = `http://localhost:${process.env.PORT || 3001}`;
const CALL_TIMEOUT_MS = 3000; // per sub-call timeout

// ─── Types (v1 contract) ──────────────────────────────────────────
interface FeatureEntry {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    navigateTo: string;           // sidebar page id — navigation only
    status: 'online' | 'degraded' | 'offline' | 'unknown';
    badgeText?: string;
}

interface OverviewResponseV1 {
    apiVersion: 'v1';
    timestamp: string;
    platform: string;
    systemHealth: {
        overall: 'healthy' | 'degraded' | 'offline';
        uptime: number;
        gpu: string;
        api: string;
        agents: string;
    };
    features: FeatureEntry[];
    activity: {
        totalProjects: number;
        activeAgents: number;
        pendingJobs: number;
        modelsDeployed: number;
        tasksCompleted: number;
    };
    recentEndpoints: string[];
}

// ─── Helper: fetch internal endpoint with timeout & graceful degradation ──
function fetchInternal(path: string): Promise<any> {
    return new Promise((resolve) => {
        const url = `${INTERNAL_BASE}${path}`;
        const timer = setTimeout(() => {
            resolve(null); // graceful degradation — return null on timeout
        }, CALL_TIMEOUT_MS);

        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                clearTimeout(timer);
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve(null);
                }
            });
            res.on('error', () => {
                clearTimeout(timer);
                resolve(null);
            });
        }).on('error', () => {
            clearTimeout(timer);
            resolve(null); // graceful degradation — return null on network error
        });
    });
}

// ─── Static feature manifest (navigation-only, no direct module imports) ──
function buildFeatureManifest(): Omit<FeatureEntry, 'status'>[] {
    return [
        { id: 'dashboard', title: 'Dashboard', description: 'Platform overview and quick actions', icon: '🏠', category: 'Platform', navigateTo: 'dashboard' },
        { id: 'ai-chat', title: 'AI Assistant', description: 'Chat with Engine Alto AI — build, debug, deploy', icon: '🤖', category: 'Platform', navigateTo: 'ai-chat' },
        { id: 'projects', title: 'Projects', description: 'Create and manage applications and experiments', icon: '📁', category: 'Platform', navigateTo: 'projects' },
        { id: 'training', title: 'Training Studio', description: 'Train AI models on GPU with mixed precision', icon: '🧠', category: 'AI / ML', navigateTo: 'training', badgeText: 'GPU' },
        { id: 'models', title: 'Model Registry', description: 'Manage trained models — deploy, export, version', icon: '📦', category: 'AI / ML', navigateTo: 'models' },
        { id: 'inference', title: 'Inference', description: 'Real-time AI inference endpoints', icon: '⚡', category: 'AI / ML', navigateTo: 'inference' },
        { id: 'game-studio', title: 'Game Studio', description: 'Build games — Unity, Godot, Unreal, or Web', icon: '🎮', category: 'Creator Studios', navigateTo: 'game-studio' },
        { id: 'video-studio', title: 'Video Studio', description: 'AI video generation — text-to-video with styles', icon: '🎬', category: 'Creator Studios', navigateTo: 'video-studio' },
        { id: 'audio-studio', title: 'Audio Studio', description: 'Music composition, voice cloning, denoising', icon: '🎵', category: 'Creator Studios', navigateTo: 'audio-studio' },
        { id: '3d-studio', title: '3D Studio', description: 'Generate 3D models, NeRF reconstruction, GLB', icon: '🧊', category: 'Creator Studios', navigateTo: '3d-studio' },
        { id: 'fashion-studio', title: 'Fashion Studio', description: 'AI garment design — fabrics, patterns, tech packs', icon: '👗', category: 'Creator Studios', navigateTo: 'fashion-studio' },
        { id: 'design-studio', title: 'Design Suite', description: 'Posters, social media, logos, presentations', icon: '🎨', category: 'Creator Studios', navigateTo: 'design-studio' },
        { id: 'robotics-lab', title: 'Robotics Lab', description: 'Multi-backend robotics simulation', icon: '🤖', category: 'Creator Studios', navigateTo: 'robotics-lab' },
        { id: 'agents', title: 'Agent Civilization', description: 'Autonomous AI agents managing the platform', icon: '🌐', category: 'Agents', navigateTo: 'agents' },
        { id: 'jobs', title: 'Job Queue', description: 'Monitor background tasks — training, rendering', icon: '⚙️', category: 'System', navigateTo: 'jobs' },
        { id: 'metrics', title: 'Metrics', description: 'Real-time platform observability', icon: '📊', category: 'System', navigateTo: 'metrics' },
        { id: 'settings', title: 'Settings', description: 'Configure Engine Alto platform', icon: '🔧', category: 'System', navigateTo: 'settings' },
        { id: 'knowledge-brain', title: 'Knowledge Brain', description: 'AI research engine — knowledge graphs, concept maps, explain anything', icon: '🌐', category: 'Innovation Labs', navigateTo: 'knowledge-brain', badgeText: 'NEW' },
        { id: 'ai-memory', title: 'AI Memory', description: 'Persistent memory — remembers conversations, preferences, learning history', icon: '💾', category: 'Innovation Labs', navigateTo: 'ai-memory', badgeText: 'NEW' },
        { id: 'idea-lab', title: 'Idea Lab', description: 'Validate ideas, evolve them, combine concepts, build startups', icon: '💡', category: 'Innovation Labs', navigateTo: 'idea-lab', badgeText: 'NEW' },
        { id: 'code-forge', title: 'Code Forge', description: 'AI debugging, code evolution, screenshot-to-code, auto-refactor', icon: '🔨', category: 'Innovation Labs', navigateTo: 'code-forge', badgeText: 'NEW' },
        { id: 'data-insights', title: 'Data Insights', description: 'Upload data, find patterns, run simulations, predict trends', icon: '📈', category: 'Innovation Labs', navigateTo: 'data-insights', badgeText: 'NEW' },
        { id: 'learning-hub', title: 'Learning Hub', description: 'AI courses, skill builder, debate mode, curiosity engine', icon: '📚', category: 'Innovation Labs', navigateTo: 'learning-hub', badgeText: 'NEW' },
        { id: 'trend-radar', title: 'Trend Radar', description: 'Scan trends, analyze markets, AI decision helper', icon: '📡', category: 'Innovation Labs', navigateTo: 'trend-radar', badgeText: 'NEW' },
        { id: 'collab-space', title: 'Collab Space', description: 'AI collaboration rooms, product designer, team workspace', icon: '👥', category: 'Innovation Labs', navigateTo: 'collab-space', badgeText: 'NEW' },
        { id: 'marketplace', title: 'AI Marketplace', description: 'Browse agents, models, pipelines, plugins, datasets, templates', icon: '🏪', category: 'Innovation Labs', navigateTo: 'marketplace', badgeText: 'NEW' },
        { id: 'self-improve', title: 'Self-Improve', description: 'Platform self-improvement — auto bug detection, optimization, evolution', icon: '🔄', category: 'Innovation Labs', navigateTo: 'self-improve', badgeText: 'NEW' },
        { id: 'agent-hub', title: 'Agent Hub (OpenClaw)', description: 'Autonomous agent system — plan, execute, build, deploy, everything', icon: '🤖', category: 'Agent Hub', navigateTo: 'agent-hub', badgeText: 'NEW' },
        { id: 'agent-tasks', title: 'Task Monitor', description: 'Real-time autonomous task execution — pause, resume, cancel', icon: '⚡', category: 'Agent Hub', navigateTo: 'agent-tasks', badgeText: 'NEW' },
        { id: 'agent-teams', title: 'Agent Teams', description: 'Multi-agent collaboration — specialized AI teams working together', icon: '👥', category: 'Agent Hub', navigateTo: 'agent-teams', badgeText: 'NEW' },
        { id: 'evolution', title: 'Evolution Engine', description: 'Self-improving AI — performance analysis, workflow optimization, learning', icon: '🧬', category: 'Agent Hub', navigateTo: 'evolution', badgeText: 'NEW' },
    ];
}

// ─── GET /api/control-center/overview ─────────────────────────────
router.get('/overview', async (_req: Request, res: Response) => {
    const startMs = Date.now();

    // Fire all internal calls in parallel — each has its own timeout
    const [statusData, agentData, metricsData, projectsData, jobsData] = await Promise.all([
        fetchInternal('/api/status'),
        fetchInternal('/api/agents/stats/overview'),
        fetchInternal('/api/metrics/json'),
        fetchInternal('/api/projects'),
        fetchInternal('/api/jobs'),
    ]);

    // Derive system health with graceful degradation
    const gpuStatus = metricsData?.gpu?.utilization ? 'online' : (statusData ? 'degraded' : 'unknown');
    const apiStatus = statusData ? 'online' : 'unknown';
    const agentStatus = agentData ? 'online' : 'unknown';
    const overallHealth: 'healthy' | 'degraded' | 'offline' =
        (apiStatus === 'online' && agentStatus === 'online') ? 'healthy' :
            (apiStatus === 'unknown' && agentStatus === 'unknown') ? 'offline' : 'degraded';

    // Build features with live status (all online since they're sidebar pages)
    const manifest = buildFeatureManifest();
    const features: FeatureEntry[] = manifest.map((f) => ({
        ...f,
        status: 'online' as const,  // all pages are client-side, always reachable
    }));

    // Enrich badges based on live data
    const agentsFeature = features.find(f => f.id === 'agents');
    if (agentsFeature && agentData?.activeAgents != null) {
        agentsFeature.badgeText = String(agentData.activeAgents);
    }
    const jobsFeature = features.find(f => f.id === 'jobs');
    if (jobsFeature && jobsData?.jobs) {
        const pending = jobsData.jobs.filter((j: any) => j.status === 'pending' || j.status === 'running').length;
        if (pending > 0) jobsFeature.badgeText = String(pending);
    }

    const response: OverviewResponseV1 = {
        apiVersion: 'v1',
        timestamp: new Date().toISOString(),
        platform: 'Engine Alto — Super Builder Platform',
        systemHealth: {
            overall: overallHealth,
            uptime: statusData?.uptime ?? process.uptime(),
            gpu: gpuStatus,
            api: apiStatus,
            agents: agentStatus,
        },
        features,
        activity: {
            totalProjects: projectsData?.projects?.length ?? 0,
            activeAgents: agentData?.activeAgents ?? 0,
            pendingJobs: jobsData?.jobs?.filter((j: any) => j.status === 'pending').length ?? 0,
            modelsDeployed: metricsData?.models?.deployed ?? 0,
            tasksCompleted: agentData?.totalTasksCompleted ?? 0,
        },
        recentEndpoints: [
            '/api/control-center/overview',
            '/api/status',
            '/api/agents',
            '/api/projects',
            '/api/metrics',
            '/api/engine',
            '/api/services',
        ],
    };

    // Attach timing header for performance observability
    res.set('X-Response-Time-Ms', String(Date.now() - startMs));
    res.json(response);
});

// ─── GET /api/control-center/health ───────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', module: 'control-center', timestamp: new Date().toISOString() });
});

export default router;
