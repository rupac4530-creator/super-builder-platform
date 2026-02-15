#!/bin/bash
# Engine Alto — Build & Run Demo
# Phase 0 acceptance test: runs hello-alto and validates output
# Usage: ./scripts/build_and_run_demo.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEMO_DIR="$ROOT_DIR/apps/hello-alto"
OUTPUT_FILE="$ROOT_DIR/infra/ci/demo_stdout.txt"
FAILURE_DIR="$ROOT_DIR/infra/ci-failure-logs"

echo "=================================================="
echo "  Engine Alto — Phase 0 Demo Runner"
echo "=================================================="
echo ""

# Ensure output directories exist
mkdir -p "$ROOT_DIR/infra/ci"
mkdir -p "$FAILURE_DIR"

# Check Python availability
PYTHON_CMD=""
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ ERROR: Python is not installed or not in PATH"
    echo "Install Python 3.10+ and ensure it is accessible via 'python' or 'python3'"
    echo "$(date -Iseconds) FAIL: Python not found" > "$FAILURE_DIR/$(date +%Y%m%d_%H%M%S)_missing_python.log"
    exit 1
fi

echo "Using Python: $($PYTHON_CMD --version)"
echo ""

# Run the demo
echo "Running hello-alto demo..."
echo ""

if $PYTHON_CMD "$DEMO_DIR/main.py" > "$OUTPUT_FILE" 2>&1; then
    echo "Demo executed successfully."
else
    echo "❌ ERROR: Demo execution failed"
    cp "$OUTPUT_FILE" "$FAILURE_DIR/$(date +%Y%m%d_%H%M%S)_demo_failure.log"
    cat "$OUTPUT_FILE"
    exit 1
fi

# Validate output
echo ""
echo "Validating output..."

if grep -q "ALTO READY" "$OUTPUT_FILE"; then
    echo "✅ PASS: 'ALTO READY' found in output"
else
    echo "❌ FAIL: 'ALTO READY' not found in output"
    echo "--- Output was: ---"
    cat "$OUTPUT_FILE"
    echo "---"
    cp "$OUTPUT_FILE" "$FAILURE_DIR/$(date +%Y%m%d_%H%M%S)_validation_failure.log"
    exit 1
fi

echo ""
echo "--- Demo Output ---"
cat "$OUTPUT_FILE"
echo "--- End ---"
echo ""
echo "✅ Phase 0 Acceptance Test: PASSED"
echo "Artifact saved: $OUTPUT_FILE"
exit 0
