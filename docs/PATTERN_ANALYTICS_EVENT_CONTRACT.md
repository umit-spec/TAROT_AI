# Pattern Analytics — Event Contract (docs-only)

**Status:** CONTRACT — NOT IMPLEMENTED
**Scope:** Documentation only. Defines two funnel events for the S-UX-4 pattern flow. **No runtime analytics system is added here.** A repository check (this change) confirmed there is no client analytics/event system today — only the server-side redacted structured logs `logReading` / `logPreview` (`src/server/observability/log.ts`). Per the Product Owner's instruction, no new analytics system is stood up; this contract governs the two events **when** analytics is later wired.
**Aligns with:** `docs/08-ANALYTICS_CONSTITUTION.md`, `docs/AŞAMA_2_FUNNEL_EVENT_MAP.md` (this pair maps to the new-flow equivalents of Event 10 "First Insight Displayed" and Event 11 "Detailed Synthesis Viewed").
**Branch verified:** `claude/insight-engine-investor-audit-bkofgr` (HEAD `8054ff2`).

---

## 1. Events

### `pattern_viewed`
Fires when the `PatternArrival` screen is shown (`UX_FLOW_V2.md` §3.5) — the first interpretation destination after the user reveals all three cards.

Allowed payload — **derived, non-sensitive signals only**:

| field | type | notes |
|---|---|---|
| `requestId` | string | correlation id already on the response header; not user content |
| `questionDomain` | enum | `relationship \| career \| self \| general` — a category, never the question text |
| `patternCount` | integer | `interpretation.patterns.length` (a count, not the pattern text) |
| `hasPatterns` | boolean | whether supporting cues were shown |
| `reducedMotion` | boolean | optional; client display preference |

### `card_details_opened`
Fires when the user takes the explicit "Kartların ayrıntılarını gör" action from the pattern screen to open the full `ReadingResult` details.

Allowed payload — **derived, non-sensitive signals only**:

| field | type | notes |
|---|---|---|
| `requestId` | string | correlation id |
| `questionDomain` | enum | category only |
| `narrationFallback` | boolean | whether `providerUsed === 'mock'` (a quality signal, not user text) |

---

## 2. Hard exclusions (never in any payload)

- The raw **question text** (or any substring of it).
- Any **card narration text** — `opening`, per-card `symbolicMeaning` / `relevanceToQuestion` / `reflection`, `practicalReflection`, `patterns[]` strings, `uncertaintyNotice`.
- Any **crisis content** — crisis messages, resources, or the fact-detail of a crisis classification beyond a count.
- Raw `IntakeContext` internals as free values: `persona` enum, `confidence`, `safetyFlags` contents (a `safetyFlagCount` integer is the most that may ever appear, consistent with `logReading`).
- Card **identities/ids**, `seed`, or anything that could reconstruct the specific draw.

The rule mirrors the existing logging guarantee (`src/server/observability/log.ts`): payloads carry derived, non-free-text signals only, by construction.

## 3. When implemented (guidance, not a mandate to build now)

- Prefer emitting through the **same redaction-safe primitives** as `logReading` / `logPreview` (their own event types), or a first-party analytics sink that enforces the §2 exclusions at the boundary.
- `pattern_viewed` and `card_details_opened` are **distinct events** and must not be merged into a reading-completion count — the same separation reason as `logPreview` vs `logReading` (a viewed pattern is not a completed reading).
- No client-side call may carry any §2-excluded value, even transiently.

## 4. Not in scope

No SDK, no event bus, no client tracker, no schema change, no runtime wiring is added by this document.
