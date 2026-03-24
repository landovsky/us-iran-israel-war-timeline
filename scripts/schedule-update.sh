#!/usr/bin/env bash
# Cron wrapper: update events, commit, and push to origin.
#
# Usage:
#   ./scripts/schedule-update.sh
#
# Cron example (daily at 08:00 UTC):
#   0 8 * * * /path/to/repo/scripts/schedule-update.sh >> /var/log/timeline-update.log 2>&1

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "[$(date)] ── Starting timeline update ──"

# Run Claude update
bash "$REPO_ROOT/scripts/update-events.sh"

# Check if events.json changed
if git diff --quiet data/events.json; then
  echo "[$(date)] No new events found. Exiting."
  exit 0
fi

# Commit and push
git add data/events.json
git commit -m "chore: update timeline events $(date +%Y-%m-%d)"
git push origin HEAD

echo "[$(date)] ── Update complete ──"
