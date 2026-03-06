# Contributing to SuperBuilder

Thank you for your interest in contributing to SuperBuilder! We welcome developers, AI researchers, designers, and engineers from around the world.

## How to Contribute

### Ways You Can Help

- **Improve AI pipelines** — Better model routing, faster inference, smarter orchestration
- **Build new agents** — Add specialized agents (research, analytics, content creation)
- **Create plugins** — Extend the platform with new capabilities
- **Optimize performance** — Make the platform faster on different hardware
- **Fix bugs** — Find and fix issues across the platform
- **Improve documentation** — Better guides, tutorials, and API docs
- **Add AI model support** — Integrate new AI providers and models
- **Improve UI/UX** — Better frontend design and user experience
- **Build creator tools** — New studio features for video, audio, 3D, games
- **Write tests** — Improve test coverage and reliability

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/super-builder-platform.git
   cd super-builder-platform
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
5. **Start the development servers**:
   ```bash
   # Terminal 1 — Backend
   cd backend && npm run dev

   # Terminal 2 — Frontend
   cd platform && npm run dev
   ```
6. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
7. **Make your changes** and test them
8. **Push** your branch and **open a Pull Request**

### Pull Request Guidelines

- Describe what your PR does and why
- Reference any related issues
- Make sure existing features still work (no breaking changes)
- Follow the existing code style (TypeScript, clean architecture)
- Add tests if possible
- Keep PRs focused — one feature or fix per PR

### Code Style

- **Language**: TypeScript (strict mode)
- **Backend**: Express.js with modular route files
- **Frontend**: React / Next.js with functional components
- **Formatting**: Consistent indentation (2 spaces), semicolons, single quotes
- **Architecture**: Modular, add-only approach — never remove existing features

### What We Value

- **Add-only changes** — Do not remove existing features or break compatibility
- **Clean code** — Readable, well-structured, minimal comments (code speaks for itself)
- **Safety first** — Sandboxed execution, no hardcoded secrets, input validation
- **Performance** — Fast endpoints, lazy-loaded UI components, efficient queries

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) when filing issues. Include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)

## Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md). Describe:

- The feature you want
- Why it would be useful
- How it might work

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to a welcoming and inclusive community.

## Recognition

Contributors who make meaningful improvements will be recognized in our [Contributors page](docs/contributors.md). We appreciate every contribution, big or small.

---

**Thank you for helping build the future of AI creation platforms!**
