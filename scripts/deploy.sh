#!/usr/bin/env bash
set -euo pipefail

# Super Builder Platform — Deploy Script
# Usage: ./scripts/deploy.sh [local|docker|k8s]

MODE="${1:-docker}"
echo "🚀 Super Builder Platform — Deploy ($MODE)"
echo "================================================"

check_deps() {
  local missing=0
  for cmd in "$@"; do
    if ! command -v "$cmd" &>/dev/null; then
      echo "❌ Missing: $cmd"
      missing=1
    else
      echo "✅ Found: $cmd ($(${cmd} --version 2>/dev/null | head -1))"
    fi
  done
  return $missing
}

create_data_dirs() {
  echo "📁 Creating data directories..."
  mkdir -p data/projects data/exports data/previews data/models data/audio data/jobs
  echo "✅ Data directories ready"
}

deploy_local() {
  echo "🔧 Deploying locally..."
  check_deps node npm || { echo "Install Node.js first"; exit 1; }
  
  create_data_dirs

  echo "📦 Installing dependencies..."
  npm install
  cd backend && npm install && cd ..
  cd platform && npm install && cd ..

  echo "🔨 Building backend..."
  cd backend && npm run build && cd ..

  echo ""
  echo "✅ Build complete! Start with:"
  echo "  Terminal 1: cd backend && npm run dev"
  echo "  Terminal 2: cd platform && npm run dev"
  echo "  Terminal 3: cd backend && npm run start:worker"
  echo ""
  echo "  Backend:  http://localhost:3001"
  echo "  Frontend: http://localhost:3000"
}

deploy_docker() {
  echo "🐳 Deploying with Docker Compose..."
  check_deps docker || { echo "Install Docker first"; exit 1; }
  
  create_data_dirs

  if command -v docker compose &>/dev/null; then
    docker compose up --build -d
  else
    docker-compose up --build -d
  fi

  echo ""
  echo "✅ Docker deploy complete!"
  echo "  Backend:  http://localhost:3001"
  echo "  Frontend: http://localhost:3000"
  echo ""
  echo "  Logs: docker compose logs -f"
  echo "  Stop: docker compose down"
}

deploy_k8s() {
  echo "☸️  Deploying to Kubernetes..."
  check_deps kubectl || { echo "Install kubectl first"; exit 1; }

  echo "Applying manifests..."
  kubectl apply -f kubernetes/deployment.yml
  kubectl apply -f infra/autoscaler/hpa.yaml

  echo ""
  echo "✅ Kubernetes deploy complete!"
  echo "  Check: kubectl get pods"
  echo "  Logs:  kubectl logs -l app=superbuilder -f"
}

verify_health() {
  echo ""
  echo "🔍 Verifying health..."
  sleep 3
  
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend healthy"
  else
    echo "⚠️  Backend not responding yet (may still be starting)"
  fi

  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend healthy"
  else
    echo "⚠️  Frontend not responding yet (may still be starting)"
  fi
}

case "$MODE" in
  local)  deploy_local ;;
  docker) deploy_docker ;;
  k8s)    deploy_k8s ;;
  *)
    echo "Usage: $0 [local|docker|k8s]"
    exit 1
    ;;
esac

verify_health
echo ""
echo "🎉 Deploy finished!"
