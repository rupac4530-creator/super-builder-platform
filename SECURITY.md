# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in SuperBuilder, **do not open a public GitHub issue**.

Please report it privately:

- **GitHub Private Vulnerability Reporting:** https://github.com/rupac4530-creator/super-builder-platform/security/advisories/new
- **Alternative:** Open a [private security issue](https://github.com/rupac4530-creator/super-builder-platform/security/advisories/new) with `[SECURITY]` in the title

We will:
1. Acknowledge your report within **48 hours**
2. Assess the severity and scope
3. Release a fix + security advisory within **7 days** for critical issues
4. Credit you in the advisory (unless you prefer anonymity)

## Scope

| In scope | Out of scope |
|----------|--------------|
| Remote code execution via API | Issues in third-party adapters (report upstream) |
| Authentication/authorization bypass | UI-only cosmetic bugs |
| Secrets/credentials leakage | Theoretical/unproven vulnerabilities |
| Data exfiltration via integrations | Spam, phishing unrelated to the platform |

## Supplying Secrets

- Use **environment variables** (e.g. `OPENAI_API_KEY`, `GITHUB_TOKEN`) or a local `.env` file (never committed).
- For CI/CD, use **GitHub Secrets** or your provider’s secret store; do not put secrets in workflow files.

## Security Best Practices for Contributors

- **Never commit secrets**, API keys, or tokens — use `.env` files (which are in `.gitignore`)
- All integration adapters should run in **sandboxed** processes where possible
- GPU-only adapters must **not** auto-download model weights without explicit user consent
- Community Plugin submissions are **reviewed** before being featured; do not auto-execute untrusted code
- Helper scripts in `scripts/` must never contain hardcoded credentials or personal information
