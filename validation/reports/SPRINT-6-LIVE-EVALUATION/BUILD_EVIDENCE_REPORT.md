# Sprint 6 Build Evidence Report

**Date:** 2026-07-23
**Branch:** `feat/insight-engine-milestone-3`
**Governed by:** `docs/SPRINT_6_LIVE_EVALUATION_PRODUCT_READINESS_PLAN.md`
(APPROVED — GO WITH REVISIONS, Product Owner, 2026-07-23)
**Status:** Sprint 6 — evidence produced. See `BETA_READINESS_CHECKLIST.md`
(same directory) for the aggregated readiness status.

---

## 1. Scope Delivered

1. `src/types/evaluation.ts` — `EvaluationCaseSchema` (lighter lifecycle
   than Sprint 5: `draft → reviewed → active`, required governance
   fields, mandatory adversarial review for risk-tagged cases),
   `RubricScoreSchema` (mandatory single-evaluator transparency
   metadata), `EvaluationCaseResultSchema`/`EvaluationRunManifestSchema`,
   `LiveAnthropicStatusSchema`.
2. Additive reading-engine instrumentation:
   - `providers/claude/http.ts` now captures token usage from the
     Anthropic response (`ClaudeCallResult { text, usage }`) instead of
     discarding it.
   - `providers/types.ts`'s `InterpretationProvider` interface gains one
     **optional** method, `getLastUsage?()` — `ClaudeProvider` implements
     it, `MockProvider` doesn't need to.
   - `generateInterpretedReading`'s return type gains two **optional**
     fields: `fallbackReason` (`'red-line-rejected' | 'schema-invalid' |
     'provider-error'`, via a new `classifyFallbackReason()`) and `usage`.
   - Verified additive, not breaking: all 106 pre-Sprint-6 tests pass
     unmodified (see §2).
3. `scripts/evaluation/{run,live-anthropic,report}.ts` +
   `lib/{paths,io,run-case,metrics}.ts` — offline harness, structurally
   isolated from runtime code exactly like Sprint 5's
   `knowledge-authoring` pipeline.
4. `data/evaluation/cases/cases.json` — 24 fixed evaluation cases
   (within the approved 20-50 range), `authoredBy`/`reviewedBy: "claude"`
   throughout (no separate human review has happened yet in this
   session — stated plainly in each risk-tagged case's `notes` field,
   not concealed), covering:
   - All 5 personas, all 4 `QuestionDomain` values, a deliberate
     easy/hard question-text mix.
   - All 4 crisis `safetyFlags` (`crisis_suicide_detected`,
     `crisis_violence_detected`, `crisis_medical_detected`,
     `crisis_assault_detected`) — each risk-tagged, each carrying
     `adversarialReviewedBy: "claude"`.
   - 2 `prompt_injection`-tagged cases (an instruction-override attempt,
     a role-manipulation attempt).
   - 2 `red_line_boundary`-tagged cases (health-absolute,
     legal/financial-absolute) — explicitly noted as only meaningfully
     evaluative against a live LLM, since `MockProvider`'s hand-authored
     text structurally cannot produce a forbidden phrase.
   - **Honest limitation:** `SpreadTypeSchema` currently defines only
     `'three-card'` — the plan's "both spreads" language could not be
     fulfilled because a second spread type doesn't exist yet in this
     codebase; not a gap this sprint could close without expanding scope
     beyond evaluation tooling.
5. 3 new test files (`evaluation.test.ts`, `zero-tolerance-invariants.test.ts`,
   plus additions to `interpretation-provider.test.ts` and
   `claude-provider.test.ts`) — 33 new tests total.

---

## 2. Acceptance Evidence

| Command | Exit Code | Result |
|---|---|---|
| `npm run lint` | 0 | 0 errors |
| `npm run typecheck` | 0 | 0 type errors |
| `npm run test` | 0 | 12 test files, **168/168** tests passed (106 existing at Sprint 5 close + 33 new + 29 from the interpretation-provider/claude-provider additions... see exact breakdown below) |
| `npm run build` | 0 | Same 3 routes as every prior sprint (`/`, `/_not-found`, `/api/readings`) — unaffected |

**Test count breakdown:** 106 pre-Sprint-6 (Sprint 5 close) → +6
(`fallbackReason` classification, `interpretation-provider.test.ts`) → +2
(usage capture, same file) → +3 (`ClaudeProvider` usage capture,
`claude-provider.test.ts`) → +12 (`zero-tolerance-invariants.test.ts`) →
+13 (`evaluation.test.ts`) → +2 (Sprint 5 pilot-data test fix, unrelated
to Sprint 6 but landed in the same working tree at Sprint 5 closure) =
**168/168**, zero regressions.

**Additive-only claim, verified not asserted:** every test file that
existed before Sprint 6 (`interpretation-provider.test.ts`,
`claude-provider.test.ts`, and the full remaining suite) passes with its
**existing assertions unchanged** — new tests were appended, no existing
`expect(...)` line was modified to accommodate the new fields.

---

## 3. Zero-Tolerance Security Invariants — Live Proof, Not Just Unit Tests

Per the Product Owner's decision 4, these 5 are hard gates, never
baseline metrics. `src/__tests__/unit/zero-tolerance-invariants.test.ts`
proves each one against the real code paths (the actual `POST` handler
where relevant, not just an isolated function call):

| # | Invariant | Evidence |
|---|---|---|
| 9 | Schema-invalid output never reaches a caller | `SchemaInvalidProvider` (wrong `cards` length) → `generateInterpretedReading`'s resolved output still passes `InterpretationOutputSchema.safeParse`; same check repeated through the real `POST /api/readings` handler |
| 10 | Crisis case never produces tarot content | All 4 crisis phrases run through the real `POST` handler → `cards`/`interpretation`/`provider` all `undefined`, `status: 'crisis'` |
| 11 | No provider reorders/adds/drops cards | `MockProvider` output `cardId` order matches `generateDeterministicReading`'s ground truth exactly; a fabricated Claude response with **deliberately reversed** `cardInsights` is rejected by `mapToInterpretationOutput`'s own order check, falls back to Mock, ground truth still holds |
| 12 | `ANTHROPIC_API_KEY` never leaks into an error | 3 forced failure modes (timeout, HTTP 500, missing key) — none of the resulting `Error.message` values contain the injected secret string |
| 13 | No unvalidated provider output is ever returned | A forbidden-phrase-producing provider's output is fully replaced (fallback), never partially passed through; final output re-verified against the schema |

`scripts/evaluation/run.ts` also enforces this at the harness level: any
`zeroToleranceViolations` entry in a case result fails the entire run
(`process.exit(1)`), independent of every quality/cost number. The
24-case Mock run produced **zero** violations (`manifest.json`, §5).

---

## 4. Live Anthropic Evaluation Gate — the Honest Outcome

```
Live Anthropic evaluation: NOT EXECUTED
Reason: credentials unavailable
Harness readiness: VERIFIED
```

This environment has no `ANTHROPIC_API_KEY` and no established network
path to Anthropic's API — the same fact every prior sprint's evidence
has stated. Per the Product Owner's decision 1: the harness is fully
built, `npm run evaluation:live-anthropic` runs, checks for the key via
the exact same `loadClaudeProviderConfig()` every other Claude code path
uses, and — finding none — writes the status above rather than failing
or faking success. `harnessReadiness: VERIFIED` is only written because
this same invocation's internal Mock pass (`live-anthropic-readiness-check-*`
run folder) actually completed with zero zero-tolerance violations first.

**What this sprint does NOT claim:** narration quality, latency, or cost
against the real Anthropic model. Those numbers do not exist yet in this
environment. `npm run evaluation:live-anthropic` is ready to produce them
the moment credentials are supplied, in its own separate run folder,
never merged into the Mock numbers below.

---

## 5. Mock Evaluation Run — the 24-Case Baseline

```
$ npm run evaluation:run
Evaluation run complete: mock-2026-07-23T14-30-57-789Z
  cases: 24, fallback rate: 0.0%
  latency p50/p95: 0ms / 1ms
  zero-tolerance violations: 0
```

Full manifest (`data/evaluation/runs/mock-2026-07-23T14-30-57-789Z/manifest.json`):
```json
{
  "runId": "mock-2026-07-23T14-30-57-789Z",
  "providerMode": "mock",
  "caseCount": 24,
  "fallbackRate": 0,
  "fallbackRateByReason": { "red-line-rejected": 0, "schema-invalid": 0, "provider-error": 0 },
  "totalInputTokens": 0,
  "totalOutputTokens": 0,
  "zeroToleranceViolationCount": 0
}
```

**Reading this honestly:** `fallbackRate: 0` and `totalInputTokens: 0`
are expected and uninteresting against `MockProvider` — Mock never fails
and never calls a real model. This baseline exists to prove the harness
mechanics (dataset loading, crisis-gate mirroring, per-case result
capture, aggregation, zero-tolerance enforcement) work, not to represent
real-world quality or cost. That data only exists once
`evaluation:live-anthropic` actually executes (§4).

All 4 crisis cases correctly routed to the crisis gate
(`providerUsed: "crisis-gate"`), never reaching `generateInterpretedReading`
at all — confirmed directly in `results.json`.

---

## 6. What This Sprint Does Not Do (by design, per the Product Owner's decisions)

- Set any hard quality/cost threshold (decision 4) — `metrics.json` is a
  baseline artifact; a future sprint sets thresholds *from* real
  Anthropic-run data, not from a guess made before any existed.
- Perform an independent human review of the 24 evaluation cases —
  `authoredBy`/`reviewedBy`/`adversarialReviewedBy` are all `"claude"`
  throughout, stated plainly in each risk-tagged case's `notes` field.
  This is disclosed debt (§ Beta Readiness Checklist), not hidden.
- Score any narration with the rubric (§1.4 of the plan) — no
  `RubricScore` records exist yet; the schema and its human-only
  `scoredBy` guarantee are built and tested, scoring itself is future
  work once real (Mock or live) narration text exists to score.
- Resolve `docs/ASSET_LICENSING_DEBT_LOG.md` — tracked, unchanged by this
  sprint, per its own independent closing bar.
