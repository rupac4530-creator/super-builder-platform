# Scripts

Helper scripts for local development. These are **optional** and **interactive** — they prompt for any input needed.

> **WARNING**: Do not run these scripts blindly. Review them first. Never add secrets or personal information to any script in this directory.

## push-to-github.ps1

Local convenience script for committing and pushing changes.

**What it does:**
1. Scans for accidental secrets (stops if found)
2. Checks git identity — prompts for email if not configured (never hardcodes one)
3. Stages all changes, commits with your message, and pushes to current branch

**Usage:**
```powershell
cd D:\super-builder-platform
.\push-to-github.ps1
.\push-to-github.ps1 -Message "feat: my changes"
.\push-to-github.ps1 -SkipIfNoEmail  # skip identity prompt
```

**Requirements:** Git for Windows installed and on PATH.

## Safety Rules

- Scripts must never contain hardcoded tokens, PATs, API keys, or personal emails.
- Scripts must prompt interactively for any identity or credential information.
- The secrets scan pattern checks for: AWS keys (`AKIA`), Google keys (`AIza`), GitHub tokens (`ghp_`, `gho_`, `github_pat_`), and private keys.