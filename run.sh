#!/usr/bin/env bash
# One-command launcher for macOS / Linux / Git Bash.  Usage:  chmod +x run.sh && ./run.sh
set -e
cd "$(dirname "$0")"
for c in java mvn npm; do command -v "$c" >/dev/null || { echo "[ERROR] '$c' not found. Install JDK 17+, Maven 3.9+ and Node 18+."; exit 1; }; done
[ -d frontend/node_modules ] || (echo "First run: installing frontend packages..." && cd frontend && npm install)
(cd backend && mvn spring-boot:run) & BACK=$!
(cd frontend && npm run dev) & FRONT=$!
trap 'echo; echo "Stopping..."; kill $BACK $FRONT 2>/dev/null; exit 0' INT TERM
echo "Backend  -> http://localhost:8080"
echo "Frontend -> http://localhost:5173   (open this one; press Ctrl+C to stop both)"
sleep 20; (command -v xdg-open >/dev/null && xdg-open http://localhost:5173) || (command -v open >/dev/null && open http://localhost:5173) || true
wait
