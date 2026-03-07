import { AbstractAdapter } from '../base-adapter';

export class AutoGenAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'AutoGen', version: '0.2.x',
            category: 'agent-orchestration', license: 'MIT',
            description: 'Microsoft multi-agent conversation framework for building complex LLM workflows.',
            homepage: 'https://microsoft.github.io/autogen/', repository: 'https://github.com/microsoft/autogen',
            requiresGPU: false, envVars: { OPENAI_API_KEY: '' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'AutoGen ready. Run: pip install pyautogen' }; }
    async start() { this._status = 'running'; return { success: true, message: 'AutoGen multi-agent orchestrator started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'AutoGen stopped' }; }
}

export class MetaGPTAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'MetaGPT', version: '0.8.x',
            category: 'agent-orchestration', license: 'MIT',
            description: 'Multi-agent framework — assign roles (PM, architect, engineer) and let agents collaborate.',
            homepage: 'https://deepwisdom.ai', repository: 'https://github.com/geekan/MetaGPT',
            requiresGPU: false, envVars: { OPENAI_API_KEY: '' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'MetaGPT ready. Run: pip install metagpt' }; }
    async start() { this._status = 'running'; return { success: true, message: 'MetaGPT multi-role agent started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'MetaGPT stopped' }; }
}

export class BabyAGIAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'BabyAGI', version: '1.0.0',
            category: 'agent-orchestration', license: 'MIT',
            description: 'Minimal autonomous agent — task creation, prioritization, and execution loop.',
            homepage: 'https://github.com/yoheinakajima/babyagi', repository: 'https://github.com/yoheinakajima/babyagi',
            requiresGPU: false, envVars: { OPENAI_API_KEY: '' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'BabyAGI ready' }; }
    async start() { this._status = 'running'; return { success: true, message: 'BabyAGI task loop started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'BabyAGI stopped' }; }
}

export class SuperAGIAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'SuperAGI', version: '0.1.x',
            category: 'agent-orchestration', license: 'MIT',
            description: 'Dev-first autonomous agent framework with tools, memory, and concurrent agents.',
            homepage: 'https://superagi.com', repository: 'https://github.com/TransformerOptimus/SuperAGI',
            dockerImage: 'superagi/superagi:latest', requiresGPU: false, ports: [3000, 8001],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'SuperAGI ready. Run: docker compose up' }; }
    async start() { this._status = 'running'; return { success: true, message: 'SuperAGI agent platform started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'SuperAGI stopped' }; }
}
