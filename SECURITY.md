# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in SuperBuilder, **please report it privately** instead of opening a public issue.

### How to Report

1. **GitHub Security Advisories** (preferred): Go to the repository's Security tab and create a new security advisory
2. **Email**: Contact the maintainer through their GitHub profile

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response Time

We aim to respond to security reports within 48 hours and provide a fix within 7 days for critical issues.

## Supported Versions

| Version | Supported |
|---|---|
| Latest (main branch) | Yes |
| Older releases | Best effort |

## Security Best Practices for Contributors

- **Never commit API keys, tokens, or secrets** — use `.env` files
- **Never hardcode credentials** in source code
- **Validate all user inputs** on both frontend and backend
- **Use parameterized queries** for database operations
- **Keep dependencies updated** — run `npm audit` regularly
- **Follow the principle of least privilege** for agent permissions

## Security Features in SuperBuilder

- Sandboxed agent execution with resource limits
- Network whitelists for external API calls
- Dry-run mode by default for agent operations
- Role-based access control (RBAC)
- Audit logging for all agent actions
- Input validation on all API endpoints
- Helmet.js security headers
- CORS protection
