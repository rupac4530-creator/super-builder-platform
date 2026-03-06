# SuperBuilder Setup Guide

## Prerequisites

- **Node.js** 18 or higher (recommended: 20 LTS)
- **npm** 9 or higher
- **Git** for version control
- A code editor (VS Code recommended)

### Optional

- **Docker** for containerized setup
- **PostgreSQL** for persistent database (platform works with in-memory store by default)
- **Ollama** for local AI models
- GPU for AI training and image generation pipelines

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/rupac4530-creator/super-builder-platform.git
cd super-builder-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../platform
npm install
```

### 3. Configure Environment

```bash
# From the project root
cp .env.example .env
```

Edit `.env` and add your API keys. At minimum, the platform runs in mock mode without any API keys.

### 4. Start Development Servers

Open two terminals:

**Terminal 1 — Backend (port 3001)**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 3000)**
```bash
cd platform
npm run dev
```

### 5. Open the Platform

Go to **http://localhost:3000** in your browser.

## Using Docker

```bash
docker-compose up
```

This starts both backend and frontend automatically.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Backend server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `OPENAI_API_KEY` | OpenAI API key for GPT models | No (mock mode) |
| `GEMINI_API_KEY` | Google Gemini API key | No |
| `GROQ_API_KEY` | Groq API key for fast inference | No |
| `OLLAMA_HOST` | Ollama server URL (default: http://localhost:11434) | No |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Workers AI account | No |
| `CLOUDFLARE_AUTH_TOKEN` | Cloudflare Workers AI token | No |
| `OPENROUTER_API_KEY` | OpenRouter multi-model key | No |
| `ENABLE_REAL_AI` | Enable real AI calls (default: false) | No |
| `FEATURE_AGENT_HUB` | Enable Agent Hub features (default: true) | No |
| `DATABASE_URL` | PostgreSQL connection string | No (uses in-memory) |

## Troubleshooting

### Port already in use
Kill existing Node processes and restart:
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

### TypeScript errors
Run type check to find issues:
```bash
cd backend && npx tsc --noEmit
cd platform && npx tsc --noEmit
```

### Frontend not loading
Clear the Next.js cache:
```bash
cd platform
rm -rf .next
npm run dev
```

## Project Structure

See [architecture.md](architecture.md) for detailed architecture documentation.
