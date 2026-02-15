#!/bin/bash
# Engine Alto — Host Tool Verification
# Checks all required and optional tools, prints versions, exits 0 if critical tools present.
# Usage: ./scripts/verify_host.sh

set -uo pipefail

PASS=0
FAIL=0
WARN=0

check_tool() {
    local name="$1"
    local cmd="$2"
    local required="${3:-true}"

    printf "%-20s " "$name"

    if command -v "$cmd" &>/dev/null; then
        local version
        case "$cmd" in
            node)     version=$($cmd --version 2>/dev/null) ;;
            python3)  version=$($cmd --version 2>/dev/null) ;;
            python)   version=$($cmd --version 2>/dev/null) ;;
            git)      version=$($cmd --version 2>/dev/null) ;;
            docker)   version=$($cmd --version 2>/dev/null) ;;
            ffmpeg)   version=$($cmd -version 2>/dev/null | head -1) ;;
            blender)  version=$($cmd --version 2>/dev/null | head -1) ;;
            redis-cli) version=$($cmd --version 2>/dev/null) ;;
            psql)     version=$($cmd --version 2>/dev/null) ;;
            nvidia-smi) version=$($cmd --query-gpu=driver_version --format=csv,noheader 2>/dev/null | head -1) ;;
            *)        version="found" ;;
        esac
        echo "✅ $version"
        PASS=$((PASS + 1))
    else
        if [ "$required" = "true" ]; then
            echo "❌ NOT FOUND (REQUIRED)"
            FAIL=$((FAIL + 1))
        else
            echo "⚠️  NOT FOUND (optional)"
            WARN=$((WARN + 1))
        fi
    fi
}

echo "=================================================="
echo "  Engine Alto — Host Tool Verification"
echo "=================================================="
echo ""
echo "--- Required Tools ---"
check_tool "Node.js"     "node"     true
check_tool "Git"         "git"      true
check_tool "Docker"      "docker"   true

echo ""
echo "--- Python (one required) ---"
if command -v python3 &>/dev/null; then
    check_tool "Python 3" "python3" true
elif command -v python &>/dev/null; then
    check_tool "Python"   "python"  true
else
    printf "%-20s ❌ NOT FOUND (REQUIRED)\n" "Python"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "--- Database & Cache ---"
check_tool "PostgreSQL"  "psql"      false
check_tool "Redis CLI"   "redis-cli" false

echo ""
echo "--- Media Tools ---"
check_tool "FFmpeg"      "ffmpeg"   false
check_tool "Blender"     "blender"  false

echo ""
echo "--- GPU ---"
check_tool "NVIDIA SMI"  "nvidia-smi" false

echo ""
echo "=================================================="
echo "  Results: ✅ $PASS passed | ❌ $FAIL failed | ⚠️  $WARN optional missing"
echo "=================================================="

if [ $FAIL -gt 0 ]; then
    echo ""
    echo "❌ VERIFICATION FAILED — $FAIL required tools missing"
    echo "Install missing tools before proceeding to production."
    exit 1
else
    echo ""
    echo "✅ All required tools present. Platform is ready."
    exit 0
fi
