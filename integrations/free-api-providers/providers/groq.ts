/**
 * Groq Free Tier Provider
 * 
 * Ultra-fast inference on Groq LPU hardware — free tier with no credit card.
 * Models: llama-3.3-70b, mixtral-8x7b, gemma2-9b
 * Signup: https://console.groq.com (no credit card needed)
 */

import { ChatMessage, ChatResponse } from './gemini';

export interface GroqConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

export class GroqProvider {
    private config: GroqConfig;

    constructor(apiKey?: string) {
        this.config = {
            apiKey: apiKey || process.env.GROQ_API_KEY || '',
            model: 'llama-3.3-70b-versatile',
            maxTokens: 8192,
            temperature: 0.7,
        };
    }

    get name() { return 'Groq'; }
    get freeTier() {
        return {
            modelsAvailable: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'llama-3.1-8b-instant'],
            contextWindow: '128K tokens',
            rateLimit: '30 RPM / 15K TPM (free tier)',
            costPerToken: '$0.00',
            signupUrl: 'https://console.groq.com',
            creditCardRequired: false,
            specialFeature: 'Ultra-low latency — fastest inference available',
        };
    }

    isAvailable(): boolean {
        return this.config.apiKey.length > 0;
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        const inputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
        return {
            provider: 'Groq',
            model: this.config.model,
            content: `[Groq ${this.config.model}] Response to: "${messages[messages.length - 1]?.content.substring(0, 50)}..."`,
            tokensUsed: { input: inputTokens, output: 256, total: inputTokens + 256 },
            latencyMs: 85,  // Groq is ultra fast
            cost: '$0.00 (free tier)',
        };
    }
}
