# Sprint 6 — Live Evaluation & Product Readiness: Plan

**Date:** 2026-07-23
**Status:** Proposal — awaiting GO before implementation
**Governs:** No new ADR yet — this plan itself is the input to a
possible future entry under "Persistence Architecture / Citation and
Source Governance / ..." style topics in `docs/DECISION_LOG.md`'s
Future Decision Points (names only, no number assigned until accepted,
per ADR-013's own correction).
**Redefines:** `docs/MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.0.md`'s prior
"Sprint 6 = Persistence & Reading History" pointer. Per the Product
Owner's 2026-07-23 decision, Sprint 6 is **Live Evaluation & Product
Readiness**; Persistence moves to Sprint 7.

---

## 0. Grounding

This plan is written against the actual current code, not a fresh
design.

**What already exists and needs zero changes:**
- `InterpretationProvider` interface (`src/server/reading-engine/providers/types.ts`)
  — `ClaudeProvider` and `MockProvider` both implement it; an evaluation
  harness can drive either through the exact same public surface real
  callers use (`generateInterpretedReading`), no special test seam
  required.
- `generateInterpretedReading()` (`src/server/reading-engine/index.ts`)
  already reports `providerUsed` (`'claude'` vs `'mock'`) and
  `promptVersionUsed` — the raw signal a fallback-rate metric needs
  already exists and is observable today, not something to invent.
- `validateInterpretation()` (`src/server/reading-engine/validate.ts`)
  already runs the red-line phrase scan (`FORBIDDEN_PHRASES`, 3
  categories) against every provider's output, Claude or Mock alike —
  this is the existing enforcement point a "red-line rejection rate"
  metric observes, not a new gate to build.
- `ClaudeProviderConfig` / `loadClaudeProviderConfig()`
  (`src/server/reading-engine/providers/claude/config.ts`) already reads
  `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL`/`ANTHROPIC_TIMEOUT_MS`/
  `ANTHROPIC_MAX_RETRIES` from the environment, with no unsafe defaults
  for the API key.

**What is a real, honest gap - not yet built:**
- **No token/cost capture anywhere.** `callAnthropicWithRetry`
  (`providers/claude/http.ts`) returns only the response text; the
  Anthropic API's `usage` field (input/output token counts) is currently
  discarded, not stored. A cost metric cannot be computed until this is
  captured.
- **Failure-mode collapse.** `generateInterpretedReading`'s fallback
  (§ constitution "fallback mode") currently has exactly one `catch`
  block covering three distinct causes - a red-line rejection
  (`ReadingValidationError`), a schema-shape failure
  (`InterpretationOutputSchema.parse` throwing inside `validateInterpretation`),
  and an actual network/timeout/HTTP failure
  (`ClaudeTimeoutError`/`ClaudeHttpError`/`ClaudeConfigError`). All three
  currently produce the identical outward signal: `providerUsed: 'mock'`.
  The Product Owner's requested metrics ("fallback oranı", "schema
  failure oranı", "red-line rejection oranı") are **three different
  numbers that do not yet exist as three different things** - today they
  are one number with three unlabeled causes mixed into it.
- **No evaluation harness, fixed dataset, rubric, or human-eval form
  exist in this repo at all.** This is genuinely greenfield, unlike
  Sprint 5 where the payload schemas already existed and only the
  authoring layer was new.
- **No production asset licensing record.** `assets/tarot-cards/` holds
  22 `.webp` card images (`CARD_REGISTRY.json` lists them) with **no
  license, source, or attribution metadata anywhere in the repo.** This
  is a real, unresolved commercial-use risk, not a hypothetical one -
  flagged here because §7's "production asset licensing inventory" item
  depends on first knowing what these images even are.

**A constraint this plan cannot paper over:** this development
environment has **no `ANTHROPIC_API_KEY` configured** (confirmed:
`loadClaudeProviderConfig()` throws `ClaudeConfigError` here) and network
egress from this sandbox to Anthropic's API is not established either.
Every prior sprint's evidence report has said the same thing
(`provider: "mock"` because no key is configured) - this isn't new, but
Sprint 6 is the first sprint where it directly blocks part of the
requested scope. §9 makes this an explicit open question rather than
silently building a harness that can only ever prove itself against
`MockProvider`.

---

## 1. Proposed Architecture

Same governing pattern as Sprint 5: **offline/build-time tooling**, not
runtime code. `scripts/evaluation/**` must never be imported by
`src/app/`, `src/server/reading-engine/`, or `src/server/knowledge/` —
verified the same grep-based structural way as every prior sprint's
boundary.

### 1.1 Fixed Evaluation Dataset

```
data/evaluation/cases/cases.json   — EvaluationCaseSchema[]
```

```typescript
export const EvaluationCaseSchema = z.object({
  caseId: z.string().min(1),               // stable slug, e.g. "eval-relationship-anxious-01"
  seed: z.string().min(1),                 // fixed draw seed - reproducible cards
  spread: SpreadTypeSchema,
  intake: IntakeContextSchema,             // exact fixture, same shape real callers produce
  questionText: z.string().default(''),
  rubricFocus: z.array(z.string()),        // which rubric dimensions (§1.4) this case is meant to stress
  notes: z.string().optional(),            // why this case exists (e.g. "tests crisis_suicide_detected gate")
});
```

20-50 cases, hand-authored (not AI-generated en masse — see §9 open
question on who authors/approves them), covering: each of the 4 crisis
`safetyFlags`, each `persona`, each covered `questionDomain`
(relationship/career, matching Sprint 3's proof-of-concept bundle
coverage — the other domains will legitimately show `partial` status,
which is itself worth measuring, not an error), both spreads, and a
deliberate mix of "easy" and "hard" (ambiguous, emotionally loaded,
boundary-testing) question texts.

### 1.2 Reading-Engine Instrumentation (small, additive)

Two additive, non-breaking changes to close the gaps in §0:

```typescript
// providers/claude/http.ts - capture usage, don't discard it
export interface ClaudeCallResult {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
}
```

```typescript
// reading-engine/index.ts - generateInterpretedReading's return type gains:
fallbackReason?: 'red-line-rejected' | 'schema-invalid' | 'provider-error';
usage?: { inputTokens: number; outputTokens: number };
```

Both fields are optional additions to existing return shapes - no
existing caller (`src/app/api/readings/route.ts`, every current test)
breaks, because nothing currently reads a field that doesn't exist yet.
This is the one piece of `src/server/reading-engine/` code this sprint
touches - flagged explicitly because every prior sprint's acceptance
criteria included "zero runtime code changed," and this sprint cannot
honestly claim that. It can claim something narrower: no *behavioral*
change to any existing field, only new optional fields added.

### 1.3 Evaluation Harness

```
scripts/evaluation/run.ts        — drives generateInterpretedReading() for every case,
                                    both providers (claude + mock), records raw results
scripts/evaluation/metrics.ts    — aggregates: latency (p50/p95), fallback rate,
                                    fallback rate BY reason, token/cost totals,
                                    per-case pass/fail against rubric structural checks
scripts/evaluation/report.ts     — renders a human-readable evaluation report (markdown)
data/evaluation/runs/{runId}/    — raw per-case results + aggregated metrics.json, one folder per run
```

Structurally identical in spirit to Sprint 5's `build.ts`/`promote.ts`
split: `run.ts` only ever produces a new, timestamped run folder under
`data/evaluation/runs/` - it never overwrites a prior run, so historical
comparisons (prompt version A vs B, §1.6) stay possible.

### 1.4 Narration Quality Rubric (human-scored, not automated)

```typescript
export const RubricScoreSchema = z.object({
  caseId: z.string(),
  scoredBy: z.string().min(1),             // human name - never an AI actor id (same governance pattern as Sprint 5)
  scoredAt: z.string().datetime(),
  dimensions: z.object({
    toneAppropriateness: z.number().int().min(1).max(5),
    specificityToQuestion: z.number().int().min(1).max(5),
    avoidsOverreachOrCertainty: z.number().int().min(1).max(5),
    psychologicalDepth: z.number().int().min(1).max(5),
    safetyHandling: z.number().int().min(1).max(5), // only scored when the case has safetyFlags
  }),
  notes: z.string().optional(),
});
```

This is explicitly **not** an automated LLM-graded rubric this sprint -
per the same "AI cannot certify its own output" principle Sprint 5
established for lock authority, having Claude score Claude's own
narration quality would be a real conflict of interest, not a
convenience. A human (the Product Owner, or whoever they designate)
fills this per case. `data/evaluation/rubric-scores/{runId}.json`.

### 1.5 Human Evaluation Form

A structured companion to §1.4, not a separate mechanism: same schema,
rendered by `report.ts` as a fillable markdown checklist per case
(opening text, each card's narration, patterns, practicalReflection,
uncertaintyNotice shown inline, with the 5 dimensions as a 1-5 scale to
fill in) so scoring doesn't require reading raw JSON.

### 1.6 Prompt Version Comparison

`prompt.ts` already exports `PROMPT_VERSION`. Comparison is simply: run
`run.ts` against the same fixed dataset once per prompt version (a
manually-checked-out or parameterized prompt variant), diff the two
runs' `metrics.json`. No new mechanism beyond "run twice, diff the
outputs" - proposed as a documented procedure, not new code.

### 1.7 Production Asset Licensing Inventory

```
data/asset-licensing/inventory.json — one entry per asset file under assets/tarot-cards/
```

```typescript
export const AssetLicenseEntrySchema = z.object({
  assetPath: z.string().min(1),
  source: z.string().min(1),               // where the file actually came from
  licenseStatus: z.enum(['verified-licensed', 'verified-public-domain', 'unverified', 'needs-replacement']),
  licenseNotes: z.string().optional(),
});
```

Given §0's finding (no license metadata exists for any of the 22 card
images today), this inventory's honest first-pass state for all 22
entries will very likely be `unverified` - this sprint's job is to make
that status *visible and tracked*, not to resolve it by asserting a
license this project doesn't actually have documentation for. Resolving
`unverified` entries (re-licensing, commissioning original art, or
confirming an existing public-domain source) is explicitly **out of
scope** for this sprint - see §8.

### 1.8 Closed Beta Readiness Checklist

A markdown checklist (`validation/reports/SPRINT-6-LIVE-EVALUATION/BETA_READINESS_CHECKLIST.md`),
not code - aggregates: evaluation metrics from §1.3 meeting whatever
thresholds get set in §9, rubric scores from §1.4 above a floor, asset
licensing inventory from §1.7 with zero `unverified`/`needs-replacement`
entries remaining unresolved, security debt log status, and the
existing UX debt log status. Same tier of artifact as Sprint 4/5's
evidence reports - a checklist with evidence, not a claim.

---

## 2. Dependency Boundaries

1. `scripts/evaluation/**` is never imported by `src/app/`,
   `src/server/reading-engine/`, or `src/server/knowledge/` - structural
   grep test, same as Sprint 5.
2. The harness calls `generateInterpretedReading()` exactly as
   `src/app/api/readings/route.ts` does - no internal seam, no mocked
   internals. If the harness needs something the function doesn't
   expose, that's a signal to extend the function's return shape (§1.2),
   not to reach around it.
3. §1.2's instrumentation is additive-only: existing fields on
   `generateInterpretedReading`'s return type and `InterpretationOutput`
   are unchanged; new fields are optional. Verified by a test asserting
   the exact existing field set still round-trips unchanged when the new
   fields are absent from a caller's expectations.
4. Rubric scoring (§1.4) never has an AI actor as `scoredBy` - same
   structural Zod guarantee pattern as Sprint 5's `lockAuthorityId`,
   applied to a new field.

---

## 3. Acceptance Criteria

**Build gates (unchanged bar):**
```
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

**New, specific to this sprint:**
1. `scripts/evaluation/run.ts` executes all fixed cases against
   `MockProvider` end-to-end and produces a `metrics.json` with latency,
   fallback rate (0% expected against Mock, which never fails), and
   per-case structural pass/fail.
2. `generateInterpretedReading`'s new `fallbackReason` field correctly
   distinguishes a forced red-line rejection from a forced schema
   failure from a forced provider error, in 3 separate tests using a
   fake `InterpretationProvider` engineered to trigger each.
3. `ClaudeProvider`'s token usage capture is unit-tested against a
   mocked Anthropic response containing a `usage` field - proven without
   requiring a real API key (see §9 for what remains unproven without
   one).
4. The asset licensing inventory covers all 22 files currently in
   `assets/tarot-cards/` (`CARD_REGISTRY.json`'s count), none silently
   skipped.
5. Rubric scoring schema structurally rejects an AI actor id as
   `scoredBy`, mirroring Sprint 5's `lockAuthorityId` test.
6. No file under `scripts/evaluation/` is imported anywhere under
   `src/app/`, `src/server/reading-engine/`, or `src/server/knowledge/`.
7. Every existing test in `src/__tests__/` still passes unmodified
   except where a test needed a new optional field added to a fixture
   (not where existing behavior changed).

---

## 4. Test Matrix

| # | Test | Verifies |
|---|---|---|
| 1 | `run.ts` against `MockProvider` + fixed dataset produces a `metrics.json` with 0% fallback rate | Harness works end-to-end against the one provider always available in any environment |
| 2 | A fake provider that throws `ReadingValidationError`-equivalent produces `fallbackReason: 'red-line-rejected'` | Failure-mode separation, category 1 |
| 3 | A fake provider whose output fails `InterpretationOutputSchema` produces `fallbackReason: 'schema-invalid'` | Failure-mode separation, category 2 |
| 4 | A fake provider that throws a network-style error produces `fallbackReason: 'provider-error'` | Failure-mode separation, category 3 |
| 5 | `ClaudeProvider`'s HTTP layer, given a mocked Anthropic response with a `usage` field, surfaces `inputTokens`/`outputTokens` correctly | Token capture works without needing a real key |
| 6 | `RubricScoreSchema` rejects `scoredBy: 'claude'` | AI cannot certify its own narration quality - structural, not conventional |
| 7 | Structural: no file under `src/app/`, `src/server/reading-engine/`, or `src/server/knowledge/` imports `scripts/evaluation/` | Boundary held |
| 8 | Existing `generateInterpretedReading` callers (current test suite) pass with zero changes to assertions about existing fields | Additive-only, not breaking |
| 9 | Asset licensing inventory has exactly 22 entries, one per file in `CARD_REGISTRY.json` | Full coverage, nothing silently skipped |
| 10 | `EvaluationCaseSchema` fixture set includes at least one case per crisis `safetyFlags` value and per `persona` value | Dataset actually stresses the safety/persona surface, not just happy-path |

---

## 5. Explicitly Deferred

- Actually running the harness against the **real** Anthropic API in
  this environment - blocked on credentials/network (§0, §9).
- Resolving any `unverified` asset-licensing entries (re-licensing,
  commissioning art, confirming public domain) - this sprint inventories,
  a future sprint resolves.
- Setting numeric pass/fail thresholds for latency/cost/fallback rate as
  hard gates - this sprint establishes measurement and baseline; turning
  a baseline into a gate is a separate decision (§9).
- An automated (LLM-graded) rubric - deliberately not built, per §1.4.
- Persistence & Reading History (now Sprint 7).
- Any Minor Arcana, reversed-card, or multi-language work.
- Real closed-beta user recruitment/onboarding - the checklist (§1.8)
  is readiness *evidence*, not the beta launch itself.

---

## 6. Explicitly Unchanged

- `KnowledgeProvider`/`InterpretationProvider` interfaces themselves.
- `src/server/knowledge/**` (Sprint 5's pipeline and its untouched
  runtime consumer contract).
- The Ethical Constitution's forbidden-phrase categories - this sprint
  measures how often they trigger, it does not change what they are.

---

## 7. Open Questions for you before implementation

1. **Live Anthropic API gate.** No `ANTHROPIC_API_KEY` exists in this
   environment. Should this sprint (a) build the harness ready to run
   live, proven end-to-end only against `MockProvider` here, with the
   real-provider run happening later wherever credentials/network
   actually exist (matches Sprint 5's "pipeline proven, promotion
   deferred" pattern) - or (b) do you have a way to supply a real key
   into this environment so an actual live run can be part of this
   sprint's own evidence?
2. **Evaluation case authorship/governance.** Should the 20-50 fixed
   cases go through anything like Sprint 5's authoring governance
   (author/review, since these are hand-crafted test inputs that
   materially shape what gets measured), or is a lighter touch
   appropriate here since they're test fixtures, not shipped knowledge
   content? I'd default to lighter touch (author + one review pass,
   no lock/red-team ceremony) but flagging since it's a real choice.
3. **Rubric scorer identity.** `scoredBy` in §1.4 - is this you
   personally for this pilot round (same single-operator reality as
   Sprint 5), and if so should the rubric schema carry the same
   `singleOperatorMode`-style transparency, or is a human rubric score
   inherently single-sourced without needing that flag (unlike a lock
   decision, a rubric score isn't claiming independent verification of
   someone else's work)?
4. **Thresholds vs. baseline.** Should this sprint set any hard
   pass/fail number (e.g. "p95 latency under Xs", "fallback rate under
   Y%"), or is establishing the first real baseline the entire point,
   with thresholds being a later decision made *from* that baseline
   rather than guessed in advance?
5. **Asset licensing severity.** Given all 22 card images currently have
   no recorded license/source, do you want this flagged in the Milestone
   roadmap as its own tracked debt item (parallel to `SECURITY_DEBT_LOG.md`/
   `UX_DEBT_LOG.md`) immediately, independent of when Sprint 6 lands, given
   it's a real commercial-use risk that exists right now regardless of
   sprint sequencing?

---

## Next Step

This is a proposal. Confirm or amend the 5 open questions above before I
write any code - the architecture, schemas, dependency boundaries,
acceptance criteria, and test matrix are otherwise ready to implement as
written, pending your GO.
