#!/bin/bash
# Engine Alto — AI Endpoints QA Script
# Sends 10 prompts to /api/ai/chat and records pass/fail + latencies
# Usage: bash scripts/qa_ai_endpoints.sh [BASE_URL]
# Output: qa_ai_report.json

set -uo pipefail

BASE_URL="${1:-http://localhost:3001}"
REPORT_FILE="qa_ai_report.json"
MAX_LATENCY_MS=5000

PROMPTS=(
    "Hello, how are you?"
    "How do I train a CNN model?"
    "Build me a game"
    "Create a website for my portfolio"
    "What AI architectures do you support?"
    "Debug this code: const x = undefined; x.length"
    "Generate a React component for a dashboard"
    "How do I deploy to production?"
    "Explain transformers in simple terms"
    "What GPU optimizations are available?"
)

echo "=================================================="
echo "  Engine Alto — AI Endpoints QA"
echo "  Target: $BASE_URL/api/ai/chat"
echo "=================================================="
echo ""

PASS=0
FAIL=0
RESULTS="["

for i in "${!PROMPTS[@]}"; do
    prompt="${PROMPTS[$i]}"
    index=$((i + 1))
    printf "Test %2d/10: %-45s " "$index" "\"${prompt:0:40}...\""

    START_MS=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))")

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/ai/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$prompt\"}" \
        --max-time 10 2>/dev/null)

    END_MS=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    LATENCY_MS=$((END_MS - START_MS))

    STATUS="pass"
    if [ "$HTTP_CODE" != "200" ]; then
        STATUS="fail"
        FAIL=$((FAIL + 1))
        printf "❌ HTTP %s (%dms)\n" "$HTTP_CODE" "$LATENCY_MS"
    elif [ "$LATENCY_MS" -gt "$MAX_LATENCY_MS" ]; then
        STATUS="fail"
        FAIL=$((FAIL + 1))
        printf "❌ SLOW (%dms > %dms)\n" "$LATENCY_MS" "$MAX_LATENCY_MS"
    else
        PASS=$((PASS + 1))
        printf "✅ OK (%dms)\n" "$LATENCY_MS"
    fi

    [ "$i" -gt 0 ] && RESULTS="$RESULTS,"
    RESULTS="$RESULTS{\"test\":$index,\"prompt\":\"${prompt}\",\"status\":\"$STATUS\",\"http_code\":$HTTP_CODE,\"latency_ms\":$LATENCY_MS}"
done

RESULTS="$RESULTS]"

# Write report
cat > "$REPORT_FILE" <<EOF
{
  "timestamp": "$(date -Iseconds 2>/dev/null || python3 -c "import datetime; print(datetime.datetime.now().isoformat())")",
  "target": "$BASE_URL/api/ai/chat",
  "total_tests": 10,
  "passed": $PASS,
  "failed": $FAIL,
  "max_latency_threshold_ms": $MAX_LATENCY_MS,
  "results": $RESULTS
}
EOF

echo ""
echo "=================================================="
echo "  Results: ✅ $PASS passed | ❌ $FAIL failed"
echo "  Report saved: $REPORT_FILE"
echo "=================================================="

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
