---
name: war-timeline-update
description: Search for new events in the US-Israel-Iran 2026 war and update data/events.json. Use this skill whenever the user says "update events", "find new events", "fresh data", "search for war news", "Again please", or any variation of wanting new war timeline data added to the database. This is the primary skill for maintaining the war timeline at /home/tomas/git/us-israel-iran-war-timeline/.
---

# War Timeline Event Updater

This skill searches the web for new events in the US-Israel-Iran 2026 war (started Feb 28, 2026), deduplicates against existing data, and inserts new events into `data/events.json`.

## Project context

- **Repo**: `/home/tomas/git/us-israel-iran-war-timeline/`
- **Data file**: `data/events.json` — array of event objects, newest first
- **Live site**: GitHub Pages (commit + push to publish)

## Step 1: Orient yourself

Read the last 20-30 events from `data/events.json` (the top of the file — it's newest-first). Note:
- The most recent event dates already in the DB
- Any developing stories that might have updates
- Actor names and event titles to use as dedup references

## Step 2: Search (48-hour window only)

Today's date is injected into your context. Only capture events from the past **48 hours**. Events older than that should already be in the DB.

### Pass 1 — Core searches (run all in parallel)

1. `Iran war latest news [today's date] 2026`
2. `Israel Iran strikes [today's date] 2026`
3. `US Iran ceasefire talks [today's date] 2026`
4. `Hormuz Strait closure update [today's date]`
5. `Iran Hezbollah Lebanon [today's date] 2026`
6. `82nd Airborne Kharg Island [today's date]`
7. `Iran nuclear war [today's date] 2026`
8. `Houthis Red Sea Iran war [today's date]`

### Pass 2 — Wider net (run after Pass 1, also in parallel)

These catch events that don't surface in the main military/diplomatic searches:

9. `Iran domestic protests executions [today's date] 2026`
10. `Iran war Gulf states UAE Kuwait Bahrain [today's date] 2026`
11. `Iran war Europe NATO alliance [today's date] 2026`
12. `Iran war energy fuel crisis rationing [today's date] 2026`
13. `Iran war Russia China diplomacy [today's date] 2026`
14. `Iran war civilian casualties infrastructure [today's date] 2026`
15. `Iran war tech companies data centers [today's date] 2026`
16. `IDF Lebanon ground fighting casualties [today's date] 2026`

For each result, **fetch the full article** — don't rely on search snippets alone. Snippets often omit the key facts (casualty numbers, exact quotes, actor names).

## Step 3: Extract facts — not prose

For each potential event, record:

- **Exact date** (and time if available). Convert all timestamps to UTC. If an article says "yesterday" or uses a timezone like EST/BST/IST, convert precisely. Use ISO date `YYYY-MM-DD`. If only approximate, use the most specific date supported by evidence.
- **Who** did **what** specifically — named actors, named locations, named operations
- **Concrete numbers**: casualties, distances, quantities, dollar amounts, percentages
- **Direct quotes** when available and short (under 30 words)
- **Source URL**: the specific article, not the homepage

Discard: opinion, prediction, hedged language ("analysts say", "could potentially"), general background, events already covered.

## Step 4: Deduplicate

Before inserting, check each candidate event against the existing DB:

- Same core action by same actor on same date → **skip** (even if the new source has more detail — update the existing entry's description instead if warranted)
- Same event but new **development** (e.g., death toll rises, ceasefire breaks down) → **new entry** referencing the development
- Reported by multiple sources but the event itself is new → **one entry**, use the most authoritative source

If an existing entry is materially incomplete and the new source adds crucial facts (casualty count, official confirmation), update the existing entry rather than adding a duplicate.

## Step 5: Format as events.json entries

Each event object:

```json
{
  "date": "2026-03-26",
  "title": "Short, factual, present-tense headline — 10 words max",
  "direction": "Escalating",
  "description": "2-4 sentences of concrete facts. Named actors. Exact numbers. Direct quotes where possible. No passive voice ('was struck' → 'Israel struck'). No hedging.",
  "source": "https://specific-article-url.com/path",
  "actor": "Iran"
}
```

**direction values**: `Escalating` / `De-escalating` / `Neutral`

**actor values** (use exactly these, pipe-separated for multiple):
`US`, `Israel`, `Iran`, `Russia`, `France`, `NATO`, `UK`, `Saudi Arabia`, `Pakistan`, `Lebanon`, `Turkey`, `Qatar`, `UAE`, `Iraq`, `Kuwait`, `Other`

Multiple actors: `"actor": "US|Israel"` — only when both are primary agents of the same event.

**Title style**: Factual, telegraphic, present tense. Include actor name unless obvious. Include key numbers or names.
- Good: `"Iran fires 3 ballistic missiles at Tel Aviv; Iron Dome intercepts 2"`
- Bad: `"Tensions escalate as Iran strikes Israel again"`

**Description style**: Write like a wire service dispatch. Prioritize: who, what, where, when, how many. End with context only if it changes the significance of the event.

## Step 6: Insert and validate

Insert new events at the **top** of the array in `data/events.json` (before the first `{`), sorted newest-first within the new batch.

After inserting, validate the JSON:
```bash
python3 -c "import json; d=json.load(open('data/events.json')); print('valid,', len(d), 'events')"
```

## Step 7: Update briefings if needed

After inserting events, check if the daily and weekly briefings in `data/summaries.json` need updating.

The file has structure: `{ "daily": { "YYYY-MM-DD": "text", ... }, "weekly": { "YYYY-MM-DD": "text", ... } }`
- Daily keys are event dates (e.g. `"2026-03-29"`)
- Weekly keys are Monday week-start dates (e.g. `"2026-03-23"`)

**When to update:**
- If you added events for a date that has **no daily summary** → generate one
- If you added events for a date that **already has a daily summary** but the new events substantially change the picture → regenerate it
- If you added events to a week whose **weekly summary** is now materially incomplete → regenerate the weekly summary
- The current (most recent) week's weekly summary should always be regenerated when new events are added, since it's inherently incomplete

**Briefing style:** Interpretive analysis, not just a list of facts. Read between the lines. Written for someone who wants to understand *what the day/week meant* without reading every event. 3-5 sentences for daily. Weekly summaries should be ~1500 characters max (hard cap: 1800), structured as 2-3 short paragraphs separated by `\n\n`. Focus on the 3-4 most consequential developments, not an exhaustive recap.

**How to update:**
1. Read the existing `data/summaries.json`
2. Read all events for the relevant date(s)/week(s) from `data/events.json`
3. Generate or regenerate the summary text
4. Write the updated `data/summaries.json`
5. Validate: `python3 -c "import json; d=json.load(open('data/summaries.json')); print('valid:', len(d['daily']), 'daily,', len(d['weekly']), 'weekly')"`

## Step 8: Update meta.json timestamp

Update `data/meta.json` with the current UTC timestamp so the site's "Updated at" display stays current:

```bash
python3 -c "import json,datetime; m={'lastUpdated': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}; json.dump(m, open('data/meta.json','w'), indent=2); print('meta updated:', m['lastUpdated'])"
```

## Step 9: Commit and push

```bash
git add data/events.json data/summaries.json data/meta.json
git commit -m "Add N events [date range]: [brief topic list]

via [HAPI](https://hapi.run)

Co-Authored-By: HAPI <noreply@hapi.run>"
git push
```

Commit message format: `Add N events [date range]: [2-3 topic keywords]`

## Quality bar

Before inserting an event, ask: **Would a historian reading this in 2030 find this factually useful?** If the answer is "it's vague" or "it duplicates something already there," don't add it.

Prefer 5 precise events over 15 vague ones.
