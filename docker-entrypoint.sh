#!/bin/sh
set -e

echo "=== SuperBuilder Platform ==="
echo "Starting backend on port 3001..."
cd /app/backend && npx tsx src/server.ts &

echo "Starting frontend on port 3000..."
cd /app/platform && npx next start -p 3000 &

echo ""
echo "SuperBuilder is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""

wait
