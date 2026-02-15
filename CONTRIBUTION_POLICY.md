# Engine Alto — Contribution Policy

> This policy governs how contributions (human or agent) enter the platform.
> All contributions are processed autonomously. No human review gates exist for routine changes.

---

## Contribution Types

| Type | Source | Pipeline |
|------|--------|----------|
| Internal agent PR | Civilization agents | Legislative → Judicial → Executive |
| External human PR | Community developers | Sandbox → Lint → Shadow Sim → Security → Contrarian → CEN |
| Plugin submission | Third-party developers | Marketplace vetting → Quarantine → Publish |
| Bug report | Any source | Triage → Doctor assignment → Fix → Judicial validation |

---

## External Contribution Pipeline

### 1. Intake
- All external PRs are received into an isolated sandbox environment
- No external code touches production until it passes all gates

### 2. Automated Gates (in order)
1. **Lint & format check** — Code must pass project linters
2. **Type check** — TypeScript `tsc --noEmit`, Python `mypy`
3. **Unit tests** — All existing tests must pass; new code must include tests
4. **Shadow simulation** — PR is deployed in shadow environment and tested against production traffic patterns
5. **Security scan** — `npm audit`, `pip-audit`, secret detection, SAST analysis
6. **Contrarian tests** — Adversarial tests specifically designed to break the new code
7. **Performance regression** — Benchmark comparison against baseline

### 3. Decision
- If all gates pass: PR is automatically merged
- If any gate fails: PR is rejected with detailed failure report and remediation suggestions
- Edge cases (partial pass): flagged for Judicial review

### 4. Post-merge
- Canary deployment (5% → 25% → 100%)
- 30-minute monitoring window
- Auto-rollback if error rate exceeds threshold

---

## Code Standards

### TypeScript / JavaScript
- Strict mode enabled
- No `any` types unless explicitly justified
- All public APIs must have JSDoc comments
- Maximum file length: 500 lines (split if larger)

### Python
- Type hints required for all function signatures
- Docstrings (Google style) for all public functions
- Black formatting enforced
- Maximum function complexity: 10 (cyclomatic)

### General
- All changes must include tests
- All changes must update relevant documentation
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
- No secrets, tokens, or credentials in any file (use `.example` placeholders)

---

## Licensing

- All contributions are licensed under the project's Apache-2.0 license
- Contributors retain copyright but grant perpetual, irrevocable license to the project
- Third-party dependencies must be compatible with Apache-2.0

---

## Dispute Resolution

- Code quality disputes are resolved by the Judicial branch (Auditor + Contrarian simulation)
- Architectural disputes are escalated to SASN for strategic alignment check
- The Owner's master override is the final arbiter in unresolvable conflicts
