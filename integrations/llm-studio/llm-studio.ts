/**
 * LLM Studio Integration Adapter
 *
 * Connects SuperBuilder to a local LLM Studio instance (OpenAI-compatible HTTP API).
 * LLM Studio lets you discover, download, and run local LLMs on your machine.
 *
 * ENV:
 *   LLMSTUDIO_URL     — Base URL of the LLM Studio server (default: http://localhost:1234)
 *   LLMSTUDIO_API_KEY — Optional API key if authentication is enabled
 */

import { AbstractAdapter, IntegrationConfig, IntegrationHealth } from '../base-adapter';

const config: IntegrationConfig = {
    enabled: true,
    name: 'LLM Studio',
    version: '1.0.0',
    category: 'model-runtime',
    license: 'MIT',
    description: 'Connect to a local LLM Studio instance — run open-source models (Llama, Mistral, Phi, Qwen, etc.) locally with an OpenAI-compatible API.',
    homepage: 'https://lmstudio.ai',
    repository: 'https://github.com/lmstudio-ai/lms',
    dockerImage: undefined,
    requiresGPU: true,
    ports: [1234],
    envVars: {
        LLMSTUDIO_URL: 'http://localhost:1234',
        LLMSTUDIO_API_KEY: '',
    },
};

export interface LLMStudioModel {
    id: string;
    object: string;
    owned_by: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    model: string;
    choices: {
        index: number;
        message: { role: string; content: string };
        finish_reason: string;
    }[];
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export class LLMStudioAdapter extends AbstractAdapter {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        super(config);
        this.baseUrl = process.env.LLMSTUDIO_URL || 'http://localhost:1234';
        this.apiKey = process.env.LLMSTUDIO_API_KEY || '';
    }

    async install() {
        this._status = 'installed';
        return {
            success: true,
            message: 'LLM Studio adapter ready. Download LLM Studio from https://lmstudio.ai, load a model, and start the local server.',
        };
    }

    async start() {
        this._status = 'running';
        return {
            success: true,
            message: `LLM Studio adapter connected to ${this.baseUrl}. Use /v1/chat/completions for inference.`,
        };
    }

    async stop() {
        this._status = 'stopped';
        return { success: true, message: 'LLM Studio adapter stopped.' };
    }

    async health(): Promise<IntegrationHealth> {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${this.baseUrl}/v1/models`, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                const modelCount = data?.data?.length || 0;
                return {
                    status: 'running',
                    message: `LLM Studio server online — ${modelCount} model(s) loaded`,
                    lastCheck: new Date().toISOString(),
                    metrics: { models: modelCount, url: this.baseUrl },
                };
            }
            return {
                status: 'error',
                message: `LLM Studio returned HTTP ${res.status}`,
                lastCheck: new Date().toISOString(),
            };
        } catch {
            return {
                status: 'stopped',
                message: `Cannot reach LLM Studio at ${this.baseUrl}. Is the server running?`,
                lastCheck: new Date().toISOString(),
            };
        }
    }

    async listModels(): Promise<LLMStudioModel[]> {
        try {
            const res = await fetch(`${this.baseUrl}/v1/models`, {
                headers: this.getHeaders(),
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data?.data || [];
        } catch {
            return [];
        }
    }

    async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse | null> {
        try {
            const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getHeaders(),
                },
                body: JSON.stringify(request),
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {};
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }
}
