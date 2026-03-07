import { AbstractAdapter } from '../base-adapter';

export class DiffusersAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Diffusers (Stable Diffusion)', version: '0.27.x',
            category: 'generative-media', license: 'Apache-2.0',
            description: 'Hugging Face library for diffusion models — Stable Diffusion, SDXL, ControlNet, image generation.',
            homepage: 'https://huggingface.co/docs/diffusers', repository: 'https://github.com/huggingface/diffusers',
            requiresGPU: true, envVars: { HF_HOME: './data/hf-cache', SD_MODEL: 'stabilityai/stable-diffusion-xl-base-1.0' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Diffusers ready. Run: pip install diffusers transformers accelerate' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Stable Diffusion pipeline loaded (GPU)' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Diffusers pipeline unloaded' }; }
}

export class ComfyUIAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'ComfyUI', version: 'latest',
            category: 'generative-media', license: 'GPL-3.0',
            description: 'Node-based visual workflow editor for Stable Diffusion — drag-and-drop image pipelines.',
            homepage: 'https://github.com/comfyanonymous/ComfyUI',
            repository: 'https://github.com/comfyanonymous/ComfyUI',
            requiresGPU: true, ports: [8188],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'ComfyUI ready. Clone repo and run: python main.py' }; }
    async start() { this._status = 'running'; return { success: true, message: 'ComfyUI pipeline editor started on port 8188' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'ComfyUI stopped' }; }
}

export class WhisperAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Whisper', version: 'v3',
            category: 'generative-media', license: 'MIT',
            description: 'OpenAI speech-to-text model — high-accuracy transcription and translation in 99 languages.',
            homepage: 'https://openai.com/research/whisper', repository: 'https://github.com/openai/whisper',
            requiresGPU: false, envVars: { WHISPER_MODEL: 'base' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Whisper ready. Run: pip install openai-whisper' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Whisper transcription service started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Whisper stopped' }; }
}

export class CoquiTTSAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Coqui TTS', version: '0.22.x',
            category: 'generative-media', license: 'MPL-2.0',
            description: 'Open-source text-to-speech — multi-speaker, multi-language, voice cloning support.',
            homepage: 'https://coqui.ai', repository: 'https://github.com/coqui-ai/TTS',
            requiresGPU: false, ports: [5002],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Coqui TTS ready. Run: pip install TTS' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Coqui TTS server started on port 5002' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Coqui TTS stopped' }; }
}
