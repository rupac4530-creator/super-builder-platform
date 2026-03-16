# Contributing to SuperBuilder Platform

Thanks for your interest in contributing! Here's how to get started.

## Quick Setup

```bash
# 1. Clone the repo
git clone https://github.com/rupac4530-creator/super-builder-platform.git
cd super-builder-platform

# 2. Copy environment template
cp .env.example .env
# Edit .env and add your API keys (see .env.example for details)

# 3. Install dependencies
cd platform && npm install && cd ..
cd backend && npm install && cd ..

# 4. Start the platform
cd platform && npm run dev
# Open http://localhost:3000
```

## Project Structure

```
super-builder-platform/
├── platform/          # Next.js frontend (all studios, UI)
│   └── src/app/
│       └── page.tsx   # Main application (all studios in one file)
├── backend/           # Express API server
│   └── src/
│       └── routes/    # API endpoints
├── agents/            # Autonomous AI agents
├── engine/            # Core engine (ECS, physics, rendering)
├── config/            # Pipeline and model configs
├── docs/              # Documentation
└── .env.example       # Environment template
```

## How to Contribute

1. **Fork** the repository
2. **Create a branch** from `release/phase1-finalize-complete`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** — follow the coding style in existing files
4. **Test** your changes locally:
   ```bash
   cd platform && npm run dev    # Check UI works
   cd backend && npm test         # Run backend tests
   ```
5. **Commit** with clear messages:
   ```
   feat(studio): add export button to Design Suite
   fix(audio): correct waveform rendering on Safari
   docs: update API integration guide
   ```
6. **Push** and open a **Pull Request**

## API Keys for Development

The platform uses 6 external API integrations. All are optional — the platform works without them, using built-in fallbacks:

| Service | Free Tier | Get Key At |
|---------|-----------|------------|
| Google Gemini | ✅ Free 1.5 Flash | [aistudio.google.com](https://aistudio.google.com/apikey) |
| Minimax | ✅ Free tier | [minimax.chat](https://www.minimax.chat) |
| Figma | ✅ Free tier | [figma.com/developers](https://www.figma.com/developers) |
| Runway | Trial credits | [dev.runwayml.com](https://dev.runwayml.com) |
| Reddit | ✅ 100 req/min free | [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) |
| HeyGen | Trial available | [heygen.com/developers](https://www.heygen.com/developers) |

## Coding Guidelines

- **TypeScript** for all new code
- **React** functional components with hooks
- **Inline styles** for UI components (the platform uses inline styles, not CSS classes)
- **Human-readable** commit messages using conventional commits
- **No secrets** in code — use environment variables or localStorage

## Need Help?

- Open an [Issue](https://github.com/rupac4530-creator/super-builder-platform/issues)
- Check existing [Discussions](https://github.com/rupac4530-creator/super-builder-platform/discussions)

## License

This project is open-source. See the [LICENSE](./LICENSE) file for details.
