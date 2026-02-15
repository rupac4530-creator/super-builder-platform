# Master Override — Owner Emergency Protocol

> ⚠️ **CRITICAL:** This document describes the only mechanism by which a human can override the autonomous governance of Engine Alto. Use only in catastrophic scenarios as defined in `GOVERNANCE.md Article IV`.

---

## What is the Master Override?

The Master Override is a cryptographically authenticated command that grants the Owner full control over the Engine Alto civilization. It bypasses all autonomous governance checks and allows direct system manipulation.

### Capabilities when activated:
- **HALT** — Freeze all operations immediately
- **ROLLBACK** — Revert to any tagged checkpoint
- **PURGE** — Remove compromised agents from the civilization
- **RESET** — Reset governance weights to factory defaults
- **AUDIT** — Export complete audit log
- **RESUME** — Resume operations with modified parameters

---

## Authentication

The master override requires authentication via one of:

1. **HSM Token** (Hardware Security Module) — Recommended for production
2. **Multi-factor passphrase** — Acceptable for development
3. **Biometric + passphrase** — Future implementation

### HSM Setup (Production)

```bash
# 1. Initialize HSM (vendor-specific — YubiKey, AWS CloudHSM, etc.)
# Replace with your HSM vendor's CLI tool
hsm-tool init --label "alto-master" --algorithm ed25519

# 2. Generate signing keypair
hsm-tool keygen --label "alto-master-key" --type signing

# 3. Export public key for system registration
hsm-tool export-pubkey --label "alto-master-key" > master_override_pubkey.pem

# 4. Register public key with Engine Alto vault
alto-cli vault register-master-key --pubkey master_override_pubkey.pem
```

### Development Setup

```bash
# Generate a development override passphrase
# (NEVER commit this — store in password manager)
alto-cli override generate-passphrase --length 32 --output .override_passphrase.local

# Register passphrase hash with local vault
alto-cli vault register-dev-override --passphrase-file .override_passphrase.local
```

> **IMPORTANT:** `.override_passphrase.local` is in `.gitignore`. Never commit override credentials.

---

## Invoking the Master Override

### Emergency Halt

```bash
# Sign the halt command with HSM
alto-cli override halt \
  --reason "Security breach detected" \
  --hsm-label "alto-master-key" \
  --snapshot-before-halt true

# Or with development passphrase
alto-cli override halt \
  --reason "Security breach detected" \
  --passphrase-file .override_passphrase.local
```

### Rollback

```bash
alto-cli override rollback \
  --target-tag "v1.0.3-stable" \
  --preserve-audit-log true \
  --hsm-label "alto-master-key"
```

### Purge Compromised Agent

```bash
alto-cli override purge-agent \
  --agent-id "agent_abc123" \
  --quarantine-data true \
  --hsm-label "alto-master-key"
```

### Resume Operations

```bash
alto-cli override resume \
  --mode "cautious" \
  --canary-percentage 5 \
  --monitor-duration "30m" \
  --hsm-label "alto-master-key"
```

---

## Validation Flow

When the master override is invoked, the system:

1. **Verifies signature** against registered public key
2. **Creates pre-action snapshot** (full state dump)
3. **Logs override invocation** to immutable audit log (cannot be suppressed)
4. **Executes requested action** with real-time progress reporting
5. **Posts post-action snapshot** for diff analysis
6. **Enters cautious mode** — elevated monitoring for 24 hours after override

---

## When to Use (Decision Matrix)

| Scenario | Use Override? | Action |
|----------|:---:|--------|
| Bug in a feature | ❌ | Let Doctor agents fix it |
| Failed deployment | ❌ | Auto-rollback handles it |
| Security probe detected | ❌ | Hacker Dept + Police handle it |
| Data breach confirmed | ✅ | HALT + AUDIT + remediate |
| Rogue agent detected | ✅ | PURGE + forensic analysis |
| Total system corruption | ✅ | HALT + ROLLBACK to last-known-good |
| Ethical violation by agents | ✅ | HALT + governance review |

---

## Recovery After Override

After invoking the master override:

1. Review the audit log differential (pre vs post snapshot)
2. Assess root cause using Doctor-Healer analysis
3. Apply targeted fix or allow auto-repair
4. Resume with `--mode cautious` and elevated monitoring
5. File a post-mortem in `docs/post-mortems/`

---

## Security Notes

- The master override key is the **single most sensitive asset** in the system
- Store HSM token physically secure; never leave unattended
- Development passphrase must be ≥32 characters with high entropy
- Override invocations are rate-limited: max 3 per hour (to prevent abuse if key is compromised)
- All override actions are broadcast to all monitoring channels immediately
