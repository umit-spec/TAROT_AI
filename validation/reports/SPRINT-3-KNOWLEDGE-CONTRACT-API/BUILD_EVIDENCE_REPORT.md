# Sprint 3 Build Evidence Report

**Date:** 2026-07-23
**Branch:** `feat/major-arcana-asset-migration`
**Commit:** `9375c8b8cb95aedd25106f1cfd8d1ba63cb059dc`
**Author:** Validation Lead
**Status:** Sprint 3 — CLOSED

---

## 1. Scope

**Sprint 3 — Knowledge Contract & Product API**

Governed by `docs/SPRINT_3_KNOWLEDGE_CONTRACT_API_PLAN.md` (proposal) and
`docs/DECISION_LOG.md` ADR-012 (the architectural decision the plan
depended on). Delivered, per the approved plan and its 7 binding
decisions:

1. Knowledge Contract types (`src/types/knowledge.ts`) - `PairRelation`,
   `PositionRule`, `DomainModifier`, `PersonaModifier`, `SafetyConstraint`,
   `KnowledgeBundle`, `KnowledgeContext`, `KnowledgeResolutionMeta`.
2. `KnowledgeProvider` interface + `LocalJsonKnowledgeProvider`
   (`src/server/knowledge/`), mirroring `InterpretationProvider`'s
   swappable design.
3. A proof-of-concept bundle (`data/knowledge/bundle-v0.1.0.json`) -
   deliberately incomplete (2 of 4 domains, 3 of 5 personas covered) so
   the `'partial'` resolution status is exercised honestly, not just
   theoretically.
4. `generateInterpretedReading()` integration - Knowledge resolution runs
   once per request, independent of narration-provider fallback.
5. One product endpoint, `POST /api/readings` - the only place
   `classifyIntake()` runs, the only place the crisis gate is enforced.
6. `scripts/demo-api.ts` / `npm run demo:api` - in-process route handler
   invocation, no dev server, no real network.
7. A functional (undesigned) UI shell wired to the endpoint.

---

## 2. Acceptance Evidence

All 5 gate commands re-run from a clean install (`rm -rf node_modules
.next && npm install`) at commit `9375c8b`, immediately before this
report - not reused from an earlier run.

| Command | Exit Code | Duration | Result |
|---|---|---|---|
| `npm install` | 0 | 28.3s | 444 packages, 0 errors. 3 vulnerabilities reported - unchanged from SECURITY-DEBT-001, no new dependencies added this sprint |
| `npm run lint` | 0 | 3.9s | 0 errors, 0 warnings |
| `npm run typecheck` | 0 | 1.3s | 0 type errors (`tsc --noEmit`) |
| `npm run test` | 0 | 0.9s (928ms reported by Vitest) | 6 test files, 75/75 tests passed |
| `npm run build` | 0 | 7.2s | Next.js 16.2.11 production build succeeded; 3 routes generated: `/` (static), `/_not-found` (static), `/api/readings` (dynamic, server-rendered on demand) |

`npm run demo:reading` and `npm run demo:api` both re-verified working
against the clean install (Sprint 1's exit proof is still valid; Sprint
3's new one is documented in §4 below).

---

## 3. Test Inventory

75 tests across 6 files. Partitioned into the 11 risk categories
requested for this report - every test counted exactly once, by its
primary purpose (a few tests touch more than one concern; each is placed
in the category it most directly defends):

| Category | Count | What it defends against |
|---|---|---|
| **Knowledge contract** | 3 | Bundle schema rejects fewer than 22 cards; the real bundle file loads and validates; every `SafetyConstraint.flag` is cross-checked against the Intake Engine's actual flag vocabulary (not a hand-copied list that could drift) |
| **LocalJsonKnowledgeProvider** | 8 | Pair-relation lookup returns only adjacent drawn pairs, not the whole bundle; position rules match spread + drawn positions exactly; determinism (same reading+intake -> byte-identical context); structural proof the provider has no import path to `deck.ts`/`drawCards`; swapping `KnowledgeProvider` never changes the drawn `DeterministicReading` |
| **partial/resolved/fallback metadata** | 2 | A throwing provider produces an observable `'fallback'` status + `errorCode`, never a silent one; a succeeding provider's own meta/context pass through the orchestrator untouched |
| **API request validation** | 3 | Missing `seed` -> 400 before any engine work; malformed JSON -> 400; a request carrying `persona`/`safetyFlags`/`confidence` directly cannot smuggle a client-supplied `IntakeContext` through (Zod strips unknown fields; server classification wins) |
| **server-side intake enforcement** | 12 | The full required classification matrix (career, relationship, emotional intensity, curiosity, experience level, empty/short input, multi-domain tie, absolute-advice request, crisis language, prompt-injection-like input, low-confidence fallback) - proves classification is real, not decorative |
| **topicHint conflict behavior** | 2 | An explicit UI hint is honored when text has no competing signal; a hint that contradicts strong textual evidence still wins (user autonomy) but is recorded via `topic_hint_conflict`, not silently absorbed |
| **crisis gate** | 2 | A crisis-flagged request returns a `CrisisResponse`, structurally distinct from `ReadingResponse` (no `cards`/`interpretation`/`provider` fields at all - not merely empty ones); a non-crisis request is confirmed to *not* take that path |
| **deterministic reading** | 10 | Card data integrity (22 cards, no gaps, no Strength/Justice or Tower/Star swap); draw determinism; ADR-002 upright-only; Zod schema conformance - unchanged from Sprint 1, re-verified after this sprint's changes |
| **Claude knowledge-boundary validation** | 3 | A hallucinated/reordered `cardId` in Claude's response is rejected; `knowledgeContext` is actually present and correctly shaped in the constructed prompt; `MockProvider` surfaces a pair relation's `semanticEffect` into `patterns` without inventing new content |
| **provider fallback/version reporting** | 25 | The full `ClaudeProvider` matrix (config loading and env overrides, timeout, 429-then-retry, 401-no-retry, invalid JSON, Zod failure, red-line rejection, successful response), the provider-swap architecture tests (arbitrary provider works, fallback on throw/manipulation, safetyFlags propagate), and `MockProvider`'s own baseline correctness (determinism, persona threading, schema conformance) |
| **end-to-end API tests** | 5 | A valid HTTP request returns a fully-shaped response; all 4 `versions` fields are populated; the same seed returns the same cards across two separate HTTP requests; no API key still returns 200 with `provider: "mock"` over HTTP; a manipulative Claude response (mocked at the HTTP layer) never reaches the caller |

**Total: 3+8+2+3+12+2+2+10+3+25+5 = 75.**

---

## 4. Four (Five) Pipeline Outcomes

The plan asked for these to be shown separately, and for the crisis path
specifically to be shown as a **different response shape**, not a
degraded reading. Captured live against this build (commit `9375c8b`),
not reconstructed from memory:

### Normal success (`resolved`)
Request with `topicHint: "career"` (a domain the proof-of-concept bundle covers):
```json
{ "provider": "mock", "knowledge_status": "resolved", "domainModifier_present": true }
```

### Knowledge partial
Request with no domain signal (`questionDomain` resolves to `"self"`, which the bundle does not cover):
```json
{ "questionDomain": "self", "knowledge_status": "partial", "domainModifier": null }
```

### Knowledge fallback
Bundle file temporarily removed to force a real load failure (restored immediately after capture; `git status` confirmed clean):
```json
{
  "knowledge_meta": { "status": "fallback", "provider": "local-json", "version": "unknown", "errorCode": "bundle_not_found" },
  "context_empty": { "pairRelations": [], "positionRules": [], "domainModifier": null, "personaModifier": null, "safetyConstraints": [] }
}
```

### Narration fallback
No `ANTHROPIC_API_KEY` set (this environment's actual state):
```json
{ "provider": "mock", "versions_prompt": "n/a" }
```

### Crisis short-circuit
Request containing crisis language:
```json
{ "response_keys": ["message", "resources", "status"], "status": "crisis" }
```
**Note the key set.** A successful `ReadingResponse` always has `cards`,
`interpretation`, `provider`, `versions`. The crisis response has none of
them - it is a different member of the response union, not a
`ReadingResponse` with fields stripped out. A client can safely branch on
`status === "crisis"` and knows it will never see partial reading data
alongside it.

---

## 5. Version Accuracy Bug (caught and fixed during this sprint)

**Bug:** `versions.prompt` in the API response initially reported the
*attempted* provider's prompt version, not the version of whichever
provider *actually* produced the output. Concretely: with no
`ANTHROPIC_API_KEY` set, `ClaudeProvider.generate()` throws before any
HTTP call, `generateInterpretedReading()` falls back to `MockProvider` -
but the route was still reading `promptVersion` off the original
`ClaudeProvider` instance it had constructed, so the response claimed
`"prompt": "tarot-interpretation-v1"` for output that was actually
produced by `MockProvider`, which has no prompt at all.

**Fix:** `generateInterpretedReading()` now returns `promptVersionUsed`
from within each of its two return branches - populated from
`input.provider.promptVersion` on the success path, from
`fallbackProvider.promptVersion` on the fallback path - so the field
always names whichever provider *actually ran*, never the one that was
merely attempted. Verified: §4's "Narration fallback" example above shows
`"versions_prompt": "n/a"`, correctly reflecting that Mock (not Claude)
produced that response.

This is a small field, but exactly the kind of detail that matters for
audit trust - a version field that's wrong 100% of the time a fallback
occurs would have quietly undermined the entire `versions` block's
credibility.

---

## 6. Architecture Evidence

Extending Sprint 2's evidence (Reading Engine -> `InterpretationProvider`
boundary, unchanged) with what Sprint 3 added:

- **Crisis gate lives in exactly one place.** `src/app/api/readings/route.ts`
  is the only code that checks `intake.safetyFlags.some(isCrisisFlag)` and
  refuses to call `generateInterpretedReading()` at all. Neither the
  Intake Engine, the Reading Engine, nor any provider gates on its own -
  consistent with (and now completing) the "Intake Engine kart seçimine
  müdahale etmesin" rule established in Sprint 2.
- **Knowledge failure and narration failure are tracked independently.**
  `resolveKnowledge()` (knowledge-provider fallback) and the
  `runProvider()` try/catch (narration-provider fallback) are two separate
  mechanisms with two separate status fields (`knowledge.meta.status` vs.
  `provider`/`providerUsed`) - a knowledge-layer outage and a Claude outage
  are visibly different failures in the response, not folded into one
  generic "something went wrong."
- **`KnowledgeProvider` cannot select cards** - structurally (no import
  edge from `local-json-provider.ts` to `deck.ts`, asserted by reading the
  file's actual source in a test, not just by convention) and behaviorally
  (swapping providers never changes the drawn `DeterministicReading`).
- **The client cannot supply a trusted `IntakeContext`.** `ReadingRequestSchema`
  has no `persona`/`confidence`/`safetyFlags`/etc. fields at all - Zod
  drops anything the client sends beyond `seed`/`question`/`topicHint`,
  and `classifyIntake()` runs unconditionally inside the route.

---

## 7. Security Evidence

No new surface introduced this sprint beyond what SECURITY-DEBT-001
already tracks:

| Control | Status |
|---|---|
| `npm audit` | Unchanged - same 3 findings (sharp/postcss/next transitive chain), no new dependencies added |
| `sharp` runtime risk | SECURITY-DEBT-001 flagged this as "in-scope for Sprint 3" (once card artwork rendering was expected to land). **It did not materialize** - the functional UI shell renders no images at all (text/list only, per instruction: no visual design before a prototype is locked). Risk remains dormant; re-assess whenever image rendering is actually built. |
| API key handling | Unchanged from Sprint 2 - never logged, only ever an HTTP header |
| Client-supplied intake fields | New this sprint - verified rejected/ignored (§3, "API request validation") |
| Crisis data handling | The route never persists or logs the crisis-triggering question text beyond what `classifyIntake()` already processes in memory - no new storage introduced |

---

## 8. Deferred Items (unchanged in kind from Sprint 2's list, now more specific)

- Full pair-relation matrix - only 8 proof-of-concept relations exist, not the ~462 possible directed pairs
- Citation/source ingestion - `sourceRefs` ships present-but-always-empty
- NotebookLM / full RAG pipeline
- Persistence - `readingId` is `null` on every response; nothing is written to a database
- Premium/production UI - the shell built this sprint is explicitly not a design artifact
- Live Anthropic integration gate - `ClaudeProvider` remains verified only against a mocked HTTP layer; a real key has never been supplied in this environment
- `docs/SECURITY_DEBT_LOG.md` SECURITY-DEBT-001 - open, unchanged
- `docs/UX_DEBT_LOG.md` UX-DEBT-001 - open, unchanged (persona-taxonomy-to-wireframe-copy mapping still unstarted)
- Milestone 1 asset findings (`tests/assets.test.js` stale ID reference, `11-justice.webp` file-size threshold) - remain frozen, untouched, awaiting Red Team

---

## 9. Final Status

**Sprint 3 Status: PASS WITH DOCUMENTED DEBT**

Knowledge Contract, provider abstraction extended to knowledge resolution,
crisis gate enforced at the API boundary, server-side intake enforcement
verified against client tampering, and a working vertical slice (request
→ intake → crisis gate → deterministic draw → knowledge resolution →
narration provider → validation → versioned response) are all built and
verified.

Persistence, full knowledge authoring, live provider integration, and
production UI are deferred, not done.

---

**Report Generated:** 2026-07-23
**By:** Validation Lead
**Branch:** `feat/major-arcana-asset-migration`
**Commit:** `9375c8b8cb95aedd25106f1cfd8d1ba63cb059dc`
**Next Step:** Milestone 2 checkpoint review (per closing instruction) before selecting among: UI Design Contract & functional product flow, Persistence & reading history, or Knowledge authoring pipeline / NotebookLM / RAG.
