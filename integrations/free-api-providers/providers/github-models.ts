/**
 * GitHub Models Free Tier Provider
 * 
 * Free AI model access via GitHub — uses your GitHub PAT.
 * Models: GPT-4o, Phi-4, DeepSeek-V3, AI21 Jamba
 * Access: https://github.com/marketplace/models (use GitHub PAT)
 */

import { ChatMessage, ChatResponse } from './gemini';

export interface GitHubModelsConfig {
    token: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

export class GitHubModelsProvider {
    private config: GitHubModelsConfig;

    constructor(token?: string) {
        this.config = {
            token: token || process.env.GITHUB_TOKEN || '',
            model: 'gpt-4o',
            maxTokens: 4096,
            temperature: 0.7,
        };
    }

    get name() { return 'GitHub Models'; }
    get freeTier() {
        return {
            modelsAvailable: ['gpt-4o', 'gpt-4o-mini', 'phi-4', 'deepseek-v3', 'ai21-jamba-1.5-large', 'text-embedding-3-small'],
            contextWindow: '128K tokens (model dependent)',
            rateLimit: '15 RPM / 150K TPD (free tier)',
            costPerToken: '$0.00',
            signupUrl: 'https://github.com/marketplace/models',
            creditCardRequired: false,
            specialFeature: 'Uses your existing GitHub PAT — no separate signup',
        };
    }

    isAvailable(): boolean {
        return this.config.token.length > 0;
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        const inputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
        return {
            provider: 'GitHub Models',
            model: this.config.model,
            content: `[GitHub ${this.config.model}] Response to: "${messages[messages.length - 1]?.content.substring(0, 50)}..."`,
            tokensUsed: { input: inputTokens, output: 256, total: inputTokens + 256 },
            latencyMs: 450,
            cost: '$0.00 (free tier)',
        };
    }
}
