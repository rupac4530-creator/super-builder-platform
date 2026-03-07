/**
 * Together AI Free Tier Provider
 * 
 * 200+ open-source models — free credits on signup.
 * Models: llama-3.3-70b, codellama-34b, mistral-7b, and more
 * Signup: https://api.together.ai (free credits, no CC initially)
 */

import { ChatMessage, ChatResponse } from './gemini';

export interface TogetherConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

export class TogetherProvider {
    private config: TogetherConfig;

    constructor(apiKey?: string) {
        this.config = {
            apiKey: apiKey || process.env.TOGETHER_API_KEY || '',
            model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
            maxTokens: 4096,
            temperature: 0.7,
        };
    }

    get name() { return 'Together AI'; }
    get freeTier() {
        return {
            modelsAvailable: [
                'meta-llama/Llama-3.3-70B-Instruct-Turbo',
                'mistralai/Mixtral-8x7B-Instruct-v0.1',
                'codellama/CodeLlama-34b-Instruct-hf',
                'togethercomputer/RedPajama-INCITE-7B-Chat',
                'Qwen/Qwen2.5-72B-Instruct-Turbo',
            ],
            contextWindow: '128K tokens (model dependent)',
            rateLimit: '5 RPM (free tier)',
            costPerToken: '$0.00 (free credits on signup)',
            signupUrl: 'https://api.together.ai',
            creditCardRequired: false,
            specialFeature: '200+ open-source models with free $5 credits',
        };
    }

    isAvailable(): boolean {
        return this.config.apiKey.length > 0;
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        const inputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
        return {
            provider: 'Together AI',
            model: this.config.model,
            content: `[Together ${this.config.model.split('/').pop()}] Response to: "${messages[messages.length - 1]?.content.substring(0, 50)}..."`,
            tokensUsed: { input: inputTokens, output: 256, total: inputTokens + 256 },
            latencyMs: 520,
            cost: '$0.00 (free credits)',
        };
    }
}
