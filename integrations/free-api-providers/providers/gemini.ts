/**
 * Gemini Free Tier Provider
 * 
 * Google Gemini API — generous free tier with 1M token context.
 * Models: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite
 * Signup: https://aistudio.google.com/apikey (no credit card needed)
 */

export interface GeminiConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponse {
    provider: string;
    model: string;
    content: string;
    tokensUsed: { input: number; output: number; total: number };
    latencyMs: number;
    cost: string;
}

export class GeminiProvider {
    private config: GeminiConfig;

    constructor(apiKey?: string) {
        this.config = {
            apiKey: apiKey || process.env.GEMINI_API_KEY || '',
            model: 'gemini-2.5-flash',
            maxTokens: 8192,
            temperature: 0.7,
        };
    }

    get name() { return 'Gemini'; }
    get freeTier() {
        return {
            modelsAvailable: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
            contextWindow: '1M tokens',
            rateLimit: '15 RPM / 1M TPM (free tier)',
            costPerToken: '$0.00',
            signupUrl: 'https://aistudio.google.com/apikey',
            creditCardRequired: false,
        };
    }

    isAvailable(): boolean {
        return this.config.apiKey.length > 0;
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        // Mock response — in production, call https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
        const inputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
        return {
            provider: 'Gemini',
            model: this.config.model,
            content: `[Gemini ${this.config.model}] Response to: "${messages[messages.length - 1]?.content.substring(0, 50)}..."`,
            tokensUsed: { input: inputTokens, output: 256, total: inputTokens + 256 },
            latencyMs: 320,
            cost: '$0.00 (free tier)',
        };
    }
}
