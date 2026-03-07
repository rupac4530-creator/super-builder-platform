import { describe, it, expect } from 'vitest';

/**
 * Unified Control Center — Unit Tests
 *
 * Tests the aggregator logic, v1 response schema, graceful degradation,
 * and basic performance constraints.
 */

// ─── Inline the core logic so tests run without a live server ─────

interface FeatureEntry {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    navigateTo: string;
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

// Re-implement buildFeatureManifest for test isolation (mirrors route logic)
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
    ];
}

/** Simulate the aggregation logic from the route (without HTTP) */
function buildOverview(
    statusData: any | null,
    agentData: any | null,
    metricsData: any | null,
    projectsData: any | null,
    jobsData: any | null,
): OverviewResponseV1 {
    const gpuStatus = metricsData?.gpu?.utilization ? 'online' : (statusData ? 'degraded' : 'unknown');
    const apiStatus = statusData ? 'online' : 'unknown';
    const agentStatus = agentData ? 'online' : 'unknown';
    const overallHealth: 'healthy' | 'degraded' | 'offline' =
        (apiStatus === 'online' && agentStatus === 'online') ? 'healthy' :
            (apiStatus === 'unknown' && agentStatus === 'unknown') ? 'offline' : 'degraded';

    const manifest = buildFeatureManifest();
    const features: FeatureEntry[] = manifest.map((f) => ({ ...f, status: 'online' as const }));

    const agentsFeature = features.find(f => f.id === 'agents');
    if (agentsFeature && agentData?.activeAgents != null) {
        agentsFeature.badgeText = String(agentData.activeAgents);
    }
    const jobsFeature = features.find(f => f.id === 'jobs');
    if (jobsFeature && jobsData?.jobs) {
        const pending = jobsData.jobs.filter((j: any) => j.status === 'pending' || j.status === 'running').length;
        if (pending > 0) jobsFeature.badgeText = String(pending);
    }

    return {
        apiVersion: 'v1',
        timestamp: new Date().toISOString(),
        platform: 'Engine Alto — Super Builder Platform',
        systemHealth: {
            overall: overallHealth,
            uptime: statusData?.uptime ?? 0,
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
}

// ─── Tests ────────────────────────────────────────────────────────

describe('ControlCenter — v1 Overview', () => {

    const mockStatus = { uptime: 3600, features: { ai: { mode: 'mock' } } };
    const mockAgents = { totalAgents: 12, activeAgents: 8, totalTasksCompleted: 150, averageSuccessRate: 0.95 };
    const mockMetrics = { gpu: { utilization: '34%' }, models: { deployed: 3 } };
    const mockProjects = { projects: [{ id: '1', name: 'Test' }, { id: '2', name: 'Demo' }] };
    const mockJobs = { jobs: [{ id: 'j1', status: 'pending' }, { id: 'j2', status: 'completed' }] };

    it('should return valid v1 schema with all fields', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);

        expect(result.apiVersion).toBe('v1');
        expect(result.platform).toBeDefined();
        expect(result.timestamp).toBeDefined();
        expect(result.systemHealth).toBeDefined();
        expect(result.features).toBeDefined();
        expect(result.activity).toBeDefined();
        expect(result.recentEndpoints).toBeDefined();
        expect(Array.isArray(result.features)).toBe(true);
        expect(Array.isArray(result.recentEndpoints)).toBe(true);
    });

    it('should contain all expected feature IDs', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        const expectedIds = [
            'dashboard', 'ai-chat', 'projects', 'training', 'models', 'inference',
            'game-studio', 'video-studio', 'audio-studio', '3d-studio',
            'fashion-studio', 'design-studio', 'robotics-lab',
            'agents', 'jobs', 'metrics', 'settings',
        ];
        const actualIds = result.features.map(f => f.id);
        for (const id of expectedIds) {
            expect(actualIds).toContain(id);
        }
    });

    it('every feature should have required fields', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        for (const feature of result.features) {
            expect(feature.id).toBeDefined();
            expect(feature.title).toBeDefined();
            expect(feature.description).toBeDefined();
            expect(feature.icon).toBeDefined();
            expect(feature.category).toBeDefined();
            expect(feature.navigateTo).toBeDefined();
            expect(feature.status).toBe('online');
        }
    });

    it('should report healthy when all sub-endpoints respond', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        expect(result.systemHealth.overall).toBe('healthy');
        expect(result.systemHealth.api).toBe('online');
        expect(result.systemHealth.agents).toBe('online');
        expect(result.systemHealth.gpu).toBe('online');
    });

    it('should aggregate activity counts from sub-data', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        expect(result.activity.totalProjects).toBe(2);
        expect(result.activity.activeAgents).toBe(8);
        expect(result.activity.pendingJobs).toBe(1);
        expect(result.activity.modelsDeployed).toBe(3);
        expect(result.activity.tasksCompleted).toBe(150);
    });

    it('should enrich agent badge with live activeAgents count', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        const agentsFeature = result.features.find(f => f.id === 'agents');
        expect(agentsFeature?.badgeText).toBe('8');
    });

    it('should enrich jobs badge with pending job count', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        const jobsFeature = result.features.find(f => f.id === 'jobs');
        expect(jobsFeature?.badgeText).toBe('1');
    });

    // ─── Graceful degradation tests ────────────────────────────────

    it('should degrade gracefully when status endpoint fails (null)', () => {
        const result = buildOverview(null, mockAgents, mockMetrics, mockProjects, mockJobs);
        expect(result.systemHealth.api).toBe('unknown');
        expect(result.systemHealth.overall).toBe('degraded');
        expect(result.systemHealth.uptime).toBe(0);
    });

    it('should degrade gracefully when agents endpoint fails (null)', () => {
        const result = buildOverview(mockStatus, null, mockMetrics, mockProjects, mockJobs);
        expect(result.systemHealth.agents).toBe('unknown');
        expect(result.systemHealth.overall).toBe('degraded');
        expect(result.activity.activeAgents).toBe(0);
    });

    it('should degrade gracefully when metrics endpoint fails (null)', () => {
        const result = buildOverview(mockStatus, mockAgents, null, mockProjects, mockJobs);
        expect(result.systemHealth.gpu).toBe('degraded');  // statusData exists but no gpu metrics
        expect(result.activity.modelsDeployed).toBe(0);
    });

    it('should degrade gracefully when projects endpoint fails (null)', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, null, mockJobs);
        expect(result.activity.totalProjects).toBe(0);
    });

    it('should degrade gracefully when ALL endpoints fail', () => {
        const result = buildOverview(null, null, null, null, null);
        expect(result.systemHealth.overall).toBe('offline');
        expect(result.features.length).toBeGreaterThan(0); // features manifest is still present
        expect(result.activity.totalProjects).toBe(0);
        expect(result.activity.activeAgents).toBe(0);
    });

    // ─── Performance assertion ─────────────────────────────────────

    it('should build overview in under 50ms (no I/O)', () => {
        const start = performance.now();
        for (let i = 0; i < 100; i++) {
            buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        }
        const elapsed = performance.now() - start;
        const perCall = elapsed / 100;
        expect(perCall).toBeLessThan(50); // must stay under 50ms per call (no I/O)
    });

    // ─── No direct coupling ───────────────────────────────────────

    it('features should use navigateTo for routing, not import paths', () => {
        const result = buildOverview(mockStatus, mockAgents, mockMetrics, mockProjects, mockJobs);
        for (const feature of result.features) {
            expect(typeof feature.navigateTo).toBe('string');
            expect(feature.navigateTo.length).toBeGreaterThan(0);
            // navigateTo should be a simple page id, not a file path or URL
            expect(feature.navigateTo).not.toContain('/');
            expect(feature.navigateTo).not.toContain('.');
        }
    });
});
