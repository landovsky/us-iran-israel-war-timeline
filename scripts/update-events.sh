#!/usr/bin/env bash
# Invokes Claude CLI to add new events and deduplicate data/events.json
# Usage: ./scripts/update-events.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EVENTS_FILE="$REPO_ROOT/data/events.json"
TODAY="$(date +%Y-%m-%d)"

if [[ ! -f "$EVENTS_FILE" ]]; then
  echo "ERROR: $EVENTS_FILE not found." >&2
  exit 1
fi

PROMPT="You are a geopolitical news researcher tracking the US-Israel-Iran conflict (and related actors: US, Israel, Iran, France, NATO, Iraq, UAE, Kuwait, Qatar).

Your task:
1. Read the current events array below (in data/events.json)
2. Research news events that occurred AFTER the most recent date in the file, up to today ($TODAY)
3. For each new event add an entry with EXACTLY these fields:
   - date: ISO format YYYY-MM-DD
   - title: concise headline (max 80 chars)
   - direction: one of \"Escalating\" | \"De-escalating\" | \"Neutral\"
   - description: 1-3 sentence factual summary
   - source: URL of a credible news source
   - actor: primary actor (US | Israel | Iran | France | NATO | Iraq | UAE | Kuwait | Qatar | Other)
4. Remove exact or near-duplicate events (same date + substantially same event)
5. Sort the final array by date descending (newest first)
6. Output ONLY the valid JSON array — no markdown fences, no extra text, no comments

Only add events you are confident actually occurred. Do not fabricate sources.

Current events.json:
$(cat "$EVENTS_FILE")

Output the updated JSON array now:"

echo "[$(date)] Querying Claude for new events since latest date in events.json..."
RESULT="$(claude --print "$PROMPT")"

# Validate that the result looks like a JSON array
if ! echo "$RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); assert isinstance(data, list)" 2>/dev/null; then
  echo "ERROR: Claude did not return a valid JSON array. Output was:" >&2
  echo "$RESULT" >&2
  exit 1
fi

# Write back
echo "$RESULT" > "$EVENTS_FILE"
echo "[$(date)] events.json updated ($(echo "$RESULT" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" ) events)."
