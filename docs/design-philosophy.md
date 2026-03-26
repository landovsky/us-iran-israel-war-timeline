# Design Philosophy — US–Israel–Iran War Timeline

*A record of intent, discussion, and direction. Written to preserve the thinking behind the interface and guide future decisions.*

---

## Why this exists

The war started February 28, 2026. Within days the volume of news was overwhelming — too many events, too much context, too much noise. The timeline was built because no existing tool answered the simplest question: **looking back at the last week, what actually happened and in which direction was the conflict moving?**

The ambition is not to be a news aggregator. It is to be a **map of the conflict's shape** — something you look at and feel before you read. The interface should make it impossible to miss whether a week was mostly war or mostly diplomacy. It should make the rhythm of the conflict visible.

---

## The core tension in design

Every design decision lives somewhere on this spectrum:

```
LISTING DATA POINTS  ←————————————→  PAINTING A STORY
```

A spreadsheet of events is complete and queryable but tells you nothing. A painted portrait tells you something but tells you nothing precise. The goal is to live toward the right of this line while keeping the left side intact — meaning: every mark on the interface should correspond to a real, specific, sourced event, but the *arrangement, size, colour, and weight* of those marks should form a picture that can be felt at a glance.

This is why the interface has:
- Colour before text (you feel the day before you read it)
- Spatial axis (left = war, right = diplomacy — a geography of intent)
- A spine (a literal centre of gravity the events orbit around)
- Flags instead of nation names (iconic, faster, denser)

And why it resists:
- Summary statistics, percentages, trend graphs (they collapse the individual events into abstraction)
- Uniform-size items (all events are not equal)
- Chronological listing without spatial arrangement (you'd have to count to perceive balance)

---

## Events are not equal

The most important insight in the whole project: **events have magnitude**.

A precision strike on a submarine development center is not the same weight as a diplomatic immunity grant. A second hit on Bushehr Nuclear Power Plant is not the same weight as a White House press briefing. A ceasefire proposal that gets publicly rejected in a day is not the same weight as a ceasefire proposal that holds.

The current interface treats all events the same size. This is the single biggest gap between what the interface is and what it should be.

An event is:
- **An action** by a named actor — not vague, not passive voice
- **A cause or effect** — it sits in a chain, not in isolation
- **A magnitude** — its strategic weight, its scale, its novelty relative to what came before
- **A vector** — escalating, de-escalating, or holding

The interface should eventually show all four of these dimensions simultaneously. Right now it shows actor, vector, and date — but not magnitude, and not causality.

---

## Intensity scoring — the methodology

To encode magnitude, a 1–5 intensity score was developed:

### Formula

```
Intensity = Strategic Weight (1–3) + Scale (1–3) + Novelty (0–1), clamped to 1–5
```

### Strategic Weight (1–3)
Measures the decision-making level required and the lasting effect:
- **1** — diplomatic statement, routine patrol, economic sanction update
- **2** — limited strike on military infrastructure, ceasefire proposal, major troop deployment order
- **3** — strike on nuclear infrastructure, assassination of national leadership, Strait closure, ground invasion

### Scale (1–3)
Measures physical magnitude:
- **1** — single facility, single aircraft, single statement
- **2** — multi-site strike package, battalion-level deployment, coalition involvement
- **3** — mass casualty event, fleet-level naval action, city-scale bombardment

### Novelty (0–1)
Bonus for crossing a threshold not crossed before in this conflict:
- +1 if this is the **first time** this type of event has occurred (first nuclear plant strike, first ground troops ordered, first ceasefire proposal)
- +0 otherwise

### Resulting scale
| Score | Meaning | Examples |
|-------|---------|---------|
| 1 | Minor / routine | Diplomatic statement, sanction adjustment |
| 2 | Significant | Limited strike, proposal, deployment order |
| 3 | Major | Multi-site strike, international response, naval action |
| 4 | Critical | Nuclear facility hit, leadership assassination, Strait closure |
| 5 | Threshold-crossing | First ground assault, mass civilian casualty event, nuclear detonation |

Intensity scoring is not yet implemented in the main interface. It is prototyped in `docs/prototype-a.html`.

---

## Design directions explored

### Current state: the butterfly

The live interface (`index.html`) uses a **butterfly layout** — a vertical spine with escalating events on the left, de-escalating on the right. Events are uniform in size; their weight is encoded only through colour and position.

This works well for:
- Scanning direction balance at a glance
- Following a specific actor across days using filter chips
- Reading the "temperature" of a day from the spine colour

It does not work for:
- Perceiving which events were *significant*
- Seeing which events were responses to other events
- Understanding the *rhythm* of the conflict (a quiet week vs. an explosive one look different in total count but similar in density)

### Prototype A: nodes on a spine

`docs/prototype-a.html` implements a different visual grammar:

Instead of uniform event rows, **events become circles (nodes) on a spine**. Circle size encodes intensity (1–5). The circles sit directly on the spine line — they can overlap, just as events in reality overlap and collide. A connector runs from each circle outward to a flag (the actor), and from the flag outward to the text title.

This changes what you see:
- A column of large overlapping red circles = rapid, heavy escalation
- A single small blue circle at the end of a de-escalation day = a lone diplomatic gesture in a sea of strikes
- The spine itself becomes a density map — thick with circles = intense week, sparse = lull

The key visual insight: **the circles are not navigation elements. They are marks. They exist to form a picture. You read the picture before you read the words.**

#### Prototype A visual details
- **Spine**: thin 1.5 px vertical line running the full height of the day column
- **Nodes**: circles of sizes `[20, 30, 45, 65, 90]` px for intensity 1–5, centered on the spine (`translateX(±50%)`)
- **Gradient**: each circle is a radial gradient orb — light highlight at upper-left, full saturated mid, deep dark at lower-right — giving the impression of a three-dimensional sphere
- **Connector**: a single tapered line from node to flag, fading from node color outward to transparent
- **Flag**: the actor's circular country flag, positioned at the outer end of the connector (aligned in a consistent vertical lane, not floating mid-connector)
- **Text**: title at the outermost end, right-aligned (left side) or left-aligned (right side)

Prototype A shows intensity-scored **dummy events** for visual testing. It is not connected to `events.json`.

---

## The layered vision

A two-phase approach to enriching the interface was outlined:

### Layer 1: Intensity
Encode magnitude visually — the size of the mark should match the weight of the event. This is Prototype A's central idea. Once intensity scores are assigned to events in the JSON, the butterfly layout itself could use variable-size spine bars, or the prototype-A node layout could replace the current layout entirely.

### Layer 2: Causality
Events don't happen in isolation. A strike causes a counter-strike. A ceasefire proposal causes a rejection which causes a renewed bombardment. Encoding these **cause-effect chains** would let the viewer follow a thread — not just a chronology.

Possible encodings:
- A thin arc or dashed line between two events that are causally linked
- A `causes` / `caused_by` field in the JSON pointing to another event's ID
- A "thread" view that traces a single chain (e.g. "the Bushehr sequence") across all its linked events

This is the more ambitious layer. It requires editorial work (assigning causality is a judgment call) and a more complex layout. But it would transform the interface from a timeline into something closer to a **map of consequence** — which is the original intent.

---

## What the interface should make you feel

Looking at a week of this war, you should feel:
- **The weight** — not just "things happened" but "big things happened"
- **The balance** — whether the week tilted toward war or toward exit
- **The rhythm** — was this relentless, or punctuated by pauses?
- **The actors** — whose flags appear repeatedly, who was absent

And then, zooming in on a day:
- **The sequence** — what came first, what responded to what
- **The magnitude** — which event was the threshold-crossing one
- **The text** — the precise facts, the names, the numbers

This is a fundamentally different ambition than "show me the news." It is: **show me the shape of the war.**

---

## Open questions

1. **Should intensity scoring be editorial or algorithmic?** Algorithmic is consistent but misses context. Editorial is accurate but requires ongoing judgment. Likely: a formula as a baseline, with manual override for obvious outliers.

2. **Prototype A vs. current butterfly — replace or parallel?** The two layouts encode different things. Prototype A is better for perceiving the week's shape; the current butterfly is better for reading individual events. They could coexist as view modes.

3. **Causality — data model?** Adding a `causes` field to the JSON is simple. The hard part is the UI — how to show a link between two events without cluttering the layout. SVG arcs? A separate "thread" view? A hover-reveal?

4. **Intensity in JSON?** Adding an `intensity` field (1–5 integer) to each event in `events.json` is a near-term step. It would unlock Prototype A's layout for real events immediately.

5. **The gap problem** — two adjacent events in week view might be 2 hours apart or 5 days apart. The interface does not show this. A time-proportional layout (events positioned by actual time, not just day) would change the reading significantly — a 5-day silence between escalations would look like a 5-day silence.
