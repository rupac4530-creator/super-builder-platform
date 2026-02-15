# Release Checklist — Super Builder Platform v3.0

## Pre-Release

### Environment
- [ ] Node.js 20+ LTS installed
- [ ] npm 10+ installed
- [ ] Python 3.11+ installed
- [ ] Redis 7+ running (or allow in-memory fallback)
- [ ] FFmpeg installed (for audio/video processing)
- [ ] Docker & Docker Compose installed (for containerized deploy)

### Configuration
- [ ] Copy `.env.example` → `.env`
- [ ] Set `DATABASE_URL` (PostgreSQL connection)
- [ ] Set `REDIS_URL` (defaults to `redis://127.0.0.1:6379`)
- [ ] Set `OPENAI_API_KEY` if using real AI (optional)
- [ ] Set `ELEVENLABS_API_KEY` if using real voice cloning (optional)
- [ ] Set `ENABLE_REAL_AI=true` to use real AI (defaults to mock)

### Build
- [ ] `npm install` at repo root
- [ ] `cd backend && npm install && npm run build`
- [ ] `cd platform && npm install && npm run build`
- [ ] `npx tsc --noEmit` in backend — expect 0 errors
- [ ] `python tests/test_civilization_boot.py` — expect 25/25 pass

---

## Deploy

### Option A: Local Development
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd platform && npm run dev

# Terminal 3 (optional)
cd backend && npm run start:worker
```

### Option B: Docker Compose
```bash
docker compose up --build
```

### Option C: Kubernetes
```bash
kubectl apply -f kubernetes/deployment.yml
kubectl apply -f infra/autoscaler/hpa.yaml
```

### Option D: AWS (Terraform)
```bash
cd infra/terraform
terraform init
terraform apply -auto-approve
```

---

## Post-Deploy Verification

- [ ] `curl http://localhost:3001/api/health` → `{ "status": "ok" }`
- [ ] `curl http://localhost:3001/api/status` → shows feature status
- [ ] `curl http://localhost:3001/api/metrics` → Prometheus metrics
- [ ] Open http://localhost:3000 → Dashboard loads
- [ ] Navigate to Creator Studios → all 7 studios render
- [ ] Run smoke tests: `bash scripts/run-smoke-tests.sh`

---

## E2E Tests

```bash
cd platform
npx playwright install
npx playwright test
```

Expected results: 5 test files, all pass or skip with documented reason.

---

## Rollback

### Docker
```bash
docker compose down
docker compose up -d --no-build  # uses previous images
```

### Kubernetes
```bash
kubectl rollout undo deployment/superbuilder
```

### Terraform
```bash
terraform plan -destroy
terraform destroy -auto-approve  # CAUTION: destroys all cloud resources
```

---

## Sign-Off

- [ ] All smoke tests pass
- [ ] E2E tests pass (or skip with reason)
- [ ] Backend builds with 0 TypeScript errors
- [ ] Python integration tests: 25/25 pass
- [ ] Performance acceptable (API <200ms, pages <3s)
- [ ] Security: no secrets in code, sandbox verified
- [ ] Documentation updated (API reference, architecture)

**RELEASE APPROVED BY**: _______________  
**DATE**: _______________  
**VERSION**: v3.0.0-heaven
