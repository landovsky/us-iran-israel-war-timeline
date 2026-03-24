# App Description — US–Israel–Iran War Timeline 2026

*Written as a basis for design thought experiments. Describes the current state of the interface and how information is encoded and interpreted.*

---

## What the app is

A single-page, static website that tracks every significant event in the 2026 US–Israel–Iran war from its start on 28 February 2026. It loads one JSON file (`data/events.json`, ~100+ events) and renders a chronological timeline entirely in the browser. There is no backend. It is updated manually by adding events to the JSON and pushing to GitHub Pages.

Each event has five fields: `date`, `title`, `direction` (Escalating / De-escalating / Neutral), `description`, `actor` (one or more nations, pipe-separated), and `source` (a URL).

---

## Visual grammar — the core encoding

### The colour axis (most important signal)

The entire interface is built on a single binary axis:

| Colour | Meaning | CSS variable |
|--------|---------|--------------|
| **Red** `#ef4444` | Escalating — strikes, threats, deployments, wider spread | `--esc` |
| **Blue** `#3b82f6` | De-escalating — pauses, proposals, diplomatic moves | `--desc` |
| **Grey** `#9ca3af` | Neutral — context, economic effects, third-party reactions | `--neu` |

This colour is applied to: the spine bar (day view), the flag border ring and glow, the connector dash between text and flag, and the actor summary counters in the spine (week view). The viewer's eye can read the "temperature" of a day or week at a glance before reading any text.

### The butterfly / mirror layout

The timeline has a vertical axis running through the centre of the page. Events fan out symmetrically on either side:

- **Left side** = Escalating events
- **Right side** = De-escalating events
- **Below, full-width** = Neutral / context events (grey, labelled "Context", left-border accent)

This spatial encoding means: a viewer who sees many items on the **left** knows war is deepening; many items on the **right** means de-escalation pressure is visible. A day with equal-length wings is in tension. A day with only left-side events is unambiguously one direction.

---

## Day view

### Spine bar (the colour-weighted centre)

Between the two event columns sits a rounded vertical bar. Its **width** (18–90 px, scaled by total event count) signals intensity — a thin bar = quiet day, a fat bar = busy day. Its **colour** is a weighted RGB blend of the three direction ratios for that day:

```
R = 239·esc_ratio + 59·desc_ratio  + 156·neu_ratio
G = 68·esc_ratio  + 130·desc_ratio + 163·neu_ratio
B = 68·esc_ratio  + 246·desc_ratio + 175·neu_ratio
```

A red bar means mostly strikes and threats that day. A blue bar means diplomatic activity dominated. A purple or teal bar means a mixed day. The bar also has a radial gradient glow (lighter centre, more saturated edge) and a soft box-shadow to give it physical presence against the dark background.

### Event items

Each event is a single horizontal row:

```
[flag(s)] —— [event title text]         (right side / de-escalating)
[event title text] —— [flag(s)]         (left side / escalating)
```

Components:
- **Actor flag(s):** A 20 × 20 px circular country flag from the HatScripts circle-flags CDN. If an event involves multiple actors (e.g. `US|Israel`), up to 3 flags stack with a −7 px left-margin overlap, like overlapping coins. Each flag has a 1.5 px border ring in the direction colour (red glow for escalating, blue glow for de-escalating, faint grey for neutral). On hover the flag group scales to 1.18×; when active (clicked) to 1.22×.
- **Connector dash:** A 16 × 2 px horizontal bar linking flag to text, coloured and translucent (50% opacity), in the direction colour.
- **Event title:** 0.75 rem, medium weight, steel blue (`#b0c4de`), single line with ellipsis truncation. Right-aligned on the left column, left-aligned on the right. Brightens on hover. Turns warm cream on active.

Clicking any event item expands a detail panel below it (max-height transition): a dark card with the full title (larger, brighter), a paragraph of description, an actor badge (colour-coded pill per nation), and a "↗ Source" link.

### Date label

Above each day's event rows, a tiny all-caps monospace label shows the date (e.g. `MAR 22`). Very low contrast (dim blue-grey), it recedes behind the events themselves and functions as a chapter marker rather than a headline.

---

## Week view

The week view collapses multiple days into one block per calendar week (Mon–Sun). It uses the same butterfly layout but replaces the coloured spine bar with an actor summary spine.

### CSS grid layout

The week block uses `display: grid; grid-template-columns: 1fr 96px 1fr`. The two `1fr` columns are the left (escalating) and right (de-escalating) event columns; the fixed 96 px centre column is the actor spine. Within each column, events are grouped per day with the date as a label, and both columns share the same grid rows — so events from the same day are **horizontally aligned** across the axis, making it visually clear when a day had simultaneous opposing moves.

### Actor summary spine

Instead of the colour bar, the spine shows one badge per actor (most active first):

```
[ 🇺🇸 ]    ← 38×38 px circular flag, bordered
  5 · 2 · 1  ← esc (red) · neu (grey) · desc (blue), fixed 3-position row
```

The three counter positions are **always rendered**, even when a count is zero — the zero value is hidden via `visibility: hidden` rather than removed from the DOM. This keeps the alignment stable: the red count is always on the left, grey always in the centre, blue always on the right. A viewer can sweep down the spine and compare actors across a week at a glance: who was striking (high red), who was negotiating (high blue), who was observing (high grey).

The spine also has a thin 1 px vertical line (`::before` pseudo-element) running its full height, matching the global timeline axis.

### Per-day labels in cells

Each day group inside a column has a tiny date label (`Mar 22`, `Mar 23`, etc.) in dim border colour, right-aligned in the left column, left-aligned in the right. These align across the grid row so the viewer can read across the axis: "on Mar 22, Israel struck Natanz (left) while Russia pushed a ceasefire (right)."

---

## Controls and filtering

A **sticky controls bar** (backdrop-blur, semi-transparent) stays fixed at the top during scroll. It contains:

- **Actor filter chips** — one rounded pill per actor in the dataset, toggled on/off. Each chip has an IBM Plex Mono label. Active chips are slightly elevated (surface background, blue border). Toggling a chip hides all events (and entire day blocks) that don't match the active set — affecting both views immediately.
- **Day / Week toggle** — a segmented button pair. Week is the default. Switching between them re-renders the entire timeline in place.
- **▶ Play button** — steps through all visible events oldest-to-newest at 2.5 s intervals, scrolling to each and highlighting it in amber. The button becomes "⏸ Pause" while playing.

---

## Visual design choices

**Dark background** (`#080f1a`, near-black with a blue tint) gives the interface a tactical/intelligence-dashboard feel — events feel like signals in the dark.

**Hero section** has a radial red glow in the top-right corner and a faint blue glow in the lower-right, matching the escalating/de-escalating colour grammar even before any events are shown. A thin gradient separator line bleeds from red to blue.

**Typography:** `Bebas Neue` for the display headline (condensed, high-impact, all-caps). `IBM Plex Mono` for all UI chrome — labels, chips, badges, timestamps. Monospace typeface reinforces the data/intel aesthetic and keeps numeric columns optically aligned. Body copy uses the system sans-serif stack.

**Timestamps:** The last-updated line in the hero reads e.g. `Updated Mar 24 · 14:37` — intentionally minimal, formatted in all-caps dim monospace.

**Animation:** On load, hero elements fade up sequentially (staggered 50–400 ms delays). Event detail panels animate open with a max-height transition. Flag groups scale on hover with a 150 ms ease. The spine bar width transitions over 500 ms on first render.

---

## What a viewer can read from this interface

| Signal | What to look for |
|--------|-----------------|
| **Dominant colour of the day** | Red day-spine = strikes dominated; blue = diplomacy; mixed = tension |
| **Spine width** (day view) | Thicker = more events = more active / intense day |
| **Left vs right event count** | More left events = escalatory pressure outweighs de-escalation |
| **Actor flag presence** | Which nations appear most frequently; multi-flag events = coalition or multi-party incidents |
| **Week spine actor counters** | Red count per actor = who is striking; blue count = who is negotiating |
| **Horizontal alignment across axis** | Events on the same grid row = same day; viewer can read confrontation/counterpart pairs |
| **Neutral row** | Appears below the butterfly on active days; represents the wider world reacting — markets, third parties, energy prices |

The fundamental reading is: **scan top to bottom for time, left-right for balance of force vs. diplomacy, and the spine colour/width for daily intensity.** The actor flags let you track who is *doing* each move without reading the text. Reading the text — and clicking through to the detail panel and source — adds precision.

---

## What the interface does NOT currently show

- Total event count or running totals
- Any kind of graph, chart, or trend line — no aggregated signal across days
- Casualties, territories, or geographic data
- Confidence level or source reliability
- Time-of-day within a single day (events within a day are unordered)
- Relations between events (causality, responses, sequences)
- The gap between events — two adjacent rows might be an hour apart or five days apart within a week view
