# LLM Studio Adapter

Connect SuperBuilder to a local [LLM Studio](https://lmstudio.ai) instance for running open-source models locally.

## What is LLM Studio?

LLM Studio is a desktop application that lets you discover, download, and run local LLMs (Llama, Mistral, Phi, Qwen, Gemma, etc.) on your own hardware. It exposes an **OpenAI-compatible API** that this adapter connects to.

## Quick Start

1. **Download LLM Studio** from https://lmstudio.ai
2. **Load a model** (e.g., `lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF`)
3. **Start the local server** (default: `http://localhost:1234`)
4. **Set environment variables:**

```bash
# .env
LLMSTUDIO_URL=http://localhost:1234
LLMSTUDIO_API_KEY=             # optional — leave blank if no auth
```

5. SuperBuilder will auto-detect the LLM Studio adapter and show it in the Integrations Hub.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLMSTUDIO_URL` | `http://localhost:1234` | Base URL of the LLM Studio server |
| `LLMSTUDIO_API_KEY` | *(empty)* | Optional API key if authentication is enabled |

## API Endpoints Used

This adapter uses the standard OpenAI-compatible endpoints:

- `GET /v1/models` — List loaded models (used for health check)
- `POST /v1/chat/completions` — Chat inference

## Notes

- The adapter is a **skeleton** — it connects to your local LLM Studio instance
- No model binaries are downloaded or stored by this adapter
- GPU is recommended but not strictly required (CPU inference is slower)
- Compatible with any OpenAI-compatible local server (Ollama, vLLM, etc.)
