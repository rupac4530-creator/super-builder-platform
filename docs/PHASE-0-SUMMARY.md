# Phase 0 — Sovereign Foundation Summary

## What Was Done

Phase 0 establishes the immutable foundation for the Engine Alto autonomous civilization.

### Files Created

| File | Purpose |
|------|---------|
| `GOVERNANCE.md` | Immutable constitution (7 articles) |
| `MASTER_OVERRIDE_README.md` | Owner emergency protocol + HSM setup |
| `CONTRIBUTION_POLICY.md` | Autonomous contribution pipeline |
| `governance/agents/schema/governance_agents.json` | Agent interfaces for all 3 branches |
| `apps/hello-alto/main.py` | Phase 0 acceptance test demo |
| `scripts/build_and_run_demo.sh` | Linux/macOS demo runner |
| `scripts/build_and_run_demo.ps1` | Windows demo runner |

### Governance Structure

```
Legislative Branch          Judicial Branch            Executive Branch
├── Builder agents          ├── Auditor agents         ├── Deploy agents
├── Researcher agents       ├── Security (Hacker Dept) ├── Doctor agents
├── Growth agents           ├── Contrarian testers     └── Performance trackers
└── SASN (Strategic)        └── Doctor-Healers
```

### How to Run Locally

```bash
# Linux/macOS
chmod +x scripts/build_and_run_demo.sh
./scripts/build_and_run_demo.sh

# Windows
powershell -ExecutionPolicy Bypass -File scripts\build_and_run_demo.ps1
```

### Acceptance Criteria

- [x] `GOVERNANCE.md` contains immutable clauses and governance flow
- [x] `MASTER_OVERRIDE_README.md` documents HSM setup and override commands
- [x] `apps/hello-alto/main.py` prints "ALTO READY" and exits 0
- [x] Agent schemas define legislative/judicial/executive interfaces
- [x] Build scripts validate output and capture failure logs

### What's Next

→ **Phase 1:** Engine Kernel — asyncio job system, plugin API, worker pools, and CLI demo
