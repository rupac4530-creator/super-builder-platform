#!/usr/bin/env bash
# Engine Alto — Host Verification Script (Linux/macOS)
# Checks all required tools and produces report/verify-host.json

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
REPORT_DIR="$REPO_DIR/report"
mkdir -p "$REPORT_DIR"

check_cmd() {
  local name="$1" cmd="$2"
  if command -v "$cmd" &>/dev/null; then
    local ver
    ver=$($cmd --version 2>&1 | head -1 || echo "unknown")
    echo "{\"installed\":true,\"version\":\"$ver\"}"
  else
    echo "{\"installed\":false,\"version\":null}"
  fi
}

check_gpu() {
  if command -v nvidia-smi &>/dev/null; then
    local info
    info=$(nvidia-smi --query-gpu=name,driver_version --format=csv,noheader 2>/dev/null || echo "")
    if [ -n "$info" ]; then
      local gpu driver
      gpu=$(echo "$info" | cut -d',' -f1 | xargs)
      driver=$(echo "$info" | cut -d',' -f2 | xargs)
      echo "{\"installed\":true,\"gpu\":\"$gpu\",\"driver\":\"$driver\"}"
      return
    fi
  fi
  echo "{\"installed\":false,\"gpu\":null,\"driver\":null}"
}

echo "========================================"
echo "  Engine Alto — Host Verification"
echo "========================================"

node_check=$(check_cmd "node" "node")
npm_check=$(check_cmd "npm" "npm")
git_check=$(check_cmd "git" "git")
python_check=$(check_cmd "python" "python3")
redis_check=$(check_cmd "redis" "redis-cli")
ffmpeg_check=$(check_cmd "ffmpeg" "ffmpeg")
docker_check=$(check_cmd "docker" "docker")
blender_check=$(check_cmd "blender" "blender")
gpu_check=$(check_gpu)

# Chrome check
chrome_ver=""
for chrome_bin in google-chrome chromium-browser chromium; do
  if command -v "$chrome_bin" &>/dev/null; then
    chrome_ver=$($chrome_bin --version 2>/dev/null | head -1)
    break
  fi
done
if [ -n "$chrome_ver" ]; then
  chrome_check="{\"installed\":true,\"version\":\"$chrome_ver\"}"
else
  chrome_check="{\"installed\":false,\"version\":null}"
fi

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
platform=$(uname -s | tr '[:upper:]' '[:lower:]')

# Determine overall status
missing=()
for tool in git python redis ffmpeg docker; do
  eval "val=\$${tool}_check"
  if echo "$val" | grep -q '"installed":false'; then
    missing+=("$tool")
  fi
done

if [ ${#missing[@]} -eq 0 ]; then
  overall="PASS"
else
  overall="PARTIAL"
fi

cat > "$REPORT_DIR/verify-host.json" <<EOF
{
  "timestamp": "$timestamp",
  "platform": "$platform",
  "checks": {
    "node": $node_check,
    "npm": $npm_check,
    "git": $git_check,
    "python": $python_check,
    "redis": $redis_check,
    "ffmpeg": $ffmpeg_check,
    "docker": $docker_check,
    "nvidia_gpu": $gpu_check,
    "blender": $blender_check,
    "chrome": $chrome_check
  },
  "required_ok": $(echo "$node_check" | grep -q '"installed":true' && echo "$npm_check" | grep -q '"installed":true' && echo "true" || echo "false"),
  "missing_recommended": [$(printf '"%s",' "${missing[@]}" | sed 's/,$//')],
  "overall": "$overall"
}
EOF

echo "Overall: $overall"
echo "Report: $REPORT_DIR/verify-host.json"
[ "$overall" = "PASS" ] && exit 0 || exit 1
