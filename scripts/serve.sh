#!/usr/bin/env bash
# Start a local dev server at http://localhost:8080
# Required because fetch('data/events.json') needs a real HTTP server (CORS/file://)

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "Serving at http://localhost:8080 — Ctrl+C to stop"
python3 -m http.server 8080 --bind 0.0.0.0
