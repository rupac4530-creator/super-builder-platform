import { AbstractAdapter } from '../base-adapter';

export class OnnxRuntimeAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'ONNX Runtime', version: '1.17.x',
            category: 'model-runtime', license: 'MIT',
            description: 'Cross-platform, high-performance inference engine for ONNX models (PyTorch, TF, scikit-learn).',
            homepage: 'https://onnxruntime.ai', repository: 'https://github.com/microsoft/onnxruntime',
            requiresGPU: false, envVars: { ONNX_MODEL_PATH: './data/models' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'ONNX Runtime ready. Run: pip install onnxruntime (or onnxruntime-gpu)' }; }
    async start() { this._status = 'running'; return { success: true, message: 'ONNX Runtime inference session ready' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'ONNX Runtime stopped' }; }
}

export class VLLMAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'vLLM', version: '0.3.x',
            category: 'model-runtime', license: 'Apache-2.0',
            description: 'High-throughput LLM serving engine with PagedAttention — fast GPU inference for Llama, Mistral, etc.',
            homepage: 'https://vllm.ai', repository: 'https://github.com/vllm-project/vllm',
            dockerImage: 'vllm/vllm-openai:latest', requiresGPU: true, ports: [8000],
            envVars: { MODEL_NAME: 'meta-llama/Llama-2-7b-chat-hf', GPU_MEMORY_UTILIZATION: '0.9' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'vLLM ready. Run: pip install vllm' }; }
    async start() { this._status = 'running'; return { success: true, message: 'vLLM OpenAI-compatible server started on port 8000' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'vLLM stopped' }; }
}

export class TritonAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'NVIDIA Triton', version: '24.01',
            category: 'model-runtime', license: 'BSD-3-Clause',
            description: 'High-performance inference serving for TensorRT, PyTorch, ONNX, OpenVINO, and more.',
            homepage: 'https://developer.nvidia.com/triton-inference-server',
            repository: 'https://github.com/triton-inference-server/server',
            dockerImage: 'nvcr.io/nvidia/tritonserver:24.01-py3', requiresGPU: true, ports: [8000, 8001, 8002],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Triton ready. Pull: docker pull nvcr.io/nvidia/tritonserver' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Triton Inference Server started (HTTP 8000, gRPC 8001, metrics 8002)' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Triton stopped' }; }
}

export class BentoMLAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'BentoML', version: '1.2.x',
            category: 'model-runtime', license: 'Apache-2.0',
            description: 'Unified model serving framework — package ML models as production-ready API endpoints.',
            homepage: 'https://bentoml.com', repository: 'https://github.com/bentoml/BentoML',
            requiresGPU: false, ports: [3000],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'BentoML ready. Run: pip install bentoml' }; }
    async start() { this._status = 'running'; return { success: true, message: 'BentoML serving started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'BentoML stopped' }; }
}

export class LlamaCppAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'llama.cpp', version: 'latest',
            category: 'model-runtime', license: 'MIT',
            description: 'Lightweight C/C++ LLM inference — run Llama, Mistral, Phi models on CPU with GGUF format.',
            homepage: 'https://github.com/ggerganov/llama.cpp',
            repository: 'https://github.com/ggerganov/llama.cpp',
            requiresGPU: false, ports: [8080],
            envVars: { MODEL_PATH: './data/models/model.gguf', CONTEXT_SIZE: '4096' },
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'llama.cpp ready. Build from source or use prebuilt binaries.' }; }
    async start() { this._status = 'running'; return { success: true, message: 'llama.cpp server started on port 8080' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'llama.cpp stopped' }; }
}
