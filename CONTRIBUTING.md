# Contributing to Engine Alto

Thank you for contributing! Follow these guidelines:

## Getting Started
1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/my-feature`

## Development
- Backend: `cd backend && npm run dev`
- Frontend: `cd platform && npm run dev`
- AI Training: `cd ai-training && python trainer.py`
- Full stack: `docker compose up`

## Pull Requests
- Keep PRs focused and small
- Include tests for new features
- Update documentation as needed
- All PRs must pass CI checks

## Code Style
- TypeScript: ESLint + Prettier
- Python: Black + isort + mypy
- C++: clang-format (Google style)

## Commit Messages
Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
