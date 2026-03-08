# Contributing to SuperBuilder

Thank you for your interest in contributing to SuperBuilder! We welcome all contributions — code, docs, design, testing.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/super-builder-platform.git`
3. **Install** dependencies: `cd backend && npm install && cd ../platform && npm install`
4. **Create a branch**: `git checkout -b feature/my-feature`
5. **Make changes** and **commit** with a descriptive message
6. **Push** and **open a PR** against `main`

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, deps, CI
- `docs:` — documentation only
- `ui:` — UI/UX changes
- `refactor:` — code change that neither fixes a bug nor adds a feature

## Code Style

- **TypeScript** for backend and frontend
- **2-space indentation**
- Run `npm run lint` before committing

## Issues & TODOs

We use GitHub Issues as a development TODO list. Feel free to:
- Comment on existing issues
- Open new issues for bugs or features
- Pick up issues labeled `good first issue`

## Security

- **Never commit secrets** — use `.env` files (in `.gitignore`)
- Helper scripts in `scripts/` must never contain hardcoded credentials
- Report vulnerabilities via [GitHub Private Vulnerability Reporting](https://github.com/rupac4530-creator/super-builder-platform/security/advisories/new)

## Pull Request Process

1. Ensure your code builds and lints clean
2. Update documentation if needed
3. Fill out the PR template with a clear description
4. One approval required to merge

## License

By contributing, you agree that your contributions will be licensed under the project's AGPL-3.0 license.
