# Sprint 3 — Knowledge Contract & Product API: Plan

**Date:** 2026-07-22
**Status:** Proposal — awaiting GO before implementation
**Governs:** `docs/DECISION_LOG.md` ADR-012 (ground-truth invariant extends to the Knowledge Layer)

---

## 0. Grounding

This plan is written against the actual current code (`src/types/{card,reading,interpretation,intake}.ts`,
`src/server/reading-engine/index.ts`), not a fresh design — every new schema
either reuses an existing type or extends one, and every new module follows
the `InterpretationProvider` pattern already proven in Sprint 2.

Per your instruction, this document proposes; nothing here has been
implemented yet.

---

## 1. Proposed Schemas

### 1.1 `CardKnowledge` — reused, not duplicated

`CardKnowledge` in your sketch is the existing `CardDataSchema`
(`src/types/card.ts`) — `symbolicMeaning`, `psychologicalReflection`,
`keywords`, `positionMeanings`, `contextualMeanings`, `reflectionQuestions`,
`redFlags`. Proposing a separate, parallel type here would create exactly
the kind of drift this project has caught twice already (the monorepo
scaffold, the persona taxonomy). `KnowledgeBundle.cards` below references
`CardDataSchema` directly.

### 1.2 New types — `src/types/knowledge.ts`

```typescript
import { z } from 'zod';
import { CardDataSchema, CardPositionKeySchema } from './card';
import { QuestionDomainSchema, PersonaSchema, ResponseDepthSchema } from './intake';
import { SpreadTypeSchema } from './reading';

const CardIdSchema = z.string().regex(/^\d{2}-[a-z-]+$/);

export const RelationTypeSchema = z.enum([
  'reinforces', 'contrasts', 'transforms', 'blocks', 'resolves',
]);

export const PairRelationSchema = z.object({
  previousCardId: CardIdSchema,
  focusCardId: CardIdSchema,
  relationType: RelationTypeSchema,
  semanticEffect: z.array(z.string().min(1)),
  warnings: z.array(z.string()),
  sourceRefs: z.array(z.string()), // empty array today - real citations are Milestone 3 (ADR-011)
});
export type PairRelation = z.infer<typeof PairRelationSchema>;

export const PositionRuleSchema = z.object({
  position: CardPositionKeySchema,
  spread: SpreadTypeSchema,
  emphasis: z.enum(['low', 'medium', 'high']),
  framingGuidance: z.string().min(1),
});
export type PositionRule = z.infer<typeof PositionRuleSchema>;

export const DomainModifierSchema = z.object({
  domain: QuestionDomainSchema,
  emphasisKeywords: z.array(z.string()),
  cautionNotes: z.array(z.string()),
});
export type DomainModifier = z.infer<typeof DomainModifierSchema>;

export const PersonaModifierSchema = z.object({
  persona: PersonaSchema,
  toneGuidance: z.string().min(1),
  depthGuidance: ResponseDepthSchema.optional(),
});
export type PersonaModifier = z.infer<typeof PersonaModifierSchema>;

// `flag` values are the same strings the Intake Engine's safetyFlags
// produce (src/server/intake/keywords.ts / safety.ts) - not re-enumerated
// here to avoid a second place that can drift out of sync with the first.
export const SafetyConstraintSchema = z.object({
  flag: z.string().min(1),
  action: z.enum(['block_reading', 'require_disclaimer', 'soften_language']),
  disclaimerText: z.string().optional(),
});
export type SafetyConstraint = z.infer<typeof SafetyConstraintSchema>;

export const KnowledgeBundleSchema = z.object({
  version: z.string().min(1), // e.g. "0.1.0"
  cards: z.array(CardDataSchema).length(22),
  pairRelations: z.array(PairRelationSchema),
  positionRules: z.array(PositionRuleSchema),
  domainModifiers: z.array(DomainModifierSchema),
  personaModifiers: z.array(PersonaModifierSchema),
  safetyConstraints: z.array(SafetyConstraintSchema),
});
export type KnowledgeBundle = z.infer<typeof KnowledgeBundleSchema>;

// The resolved, reading-specific slice actually handed to a provider -
// not the whole bundle. Filtered to what this draw's 3 cards/positions/
// intake actually trigger.
export const KnowledgeContextSchema = z.object({
  knowledgeVersion: z.string(),
  pairRelations: z.array(PairRelationSchema), // 0-2 entries for a 3-card spread (adjacent pairs only)
  positionRules: z.array(PositionRuleSchema), // exactly the 3 positions drawn
  domainModifier: DomainModifierSchema.nullable(),
  personaModifier: PersonaModifierSchema.nullable(),
  safetyConstraints: z.array(SafetyConstraintSchema), // matching intake.safetyFlags, may be empty
});
export type KnowledgeContext = z.infer<typeof KnowledgeContextSchema>;

export const KnowledgeVersionSchema = z.object({
  deck: z.string(),       // data/cards/*.json content version
  algorithm: z.string(),  // deck.ts shuffle/draw algorithm version
  knowledge: z.string(),  // KnowledgeBundle.version
  prompt: z.string(),     // active provider's prompt version, or "n/a" for Mock
});
export type KnowledgeVersion = z.infer<typeof KnowledgeVersionSchema>;
```

**Proposed refinement to your sketch:** `sourceRefs` ships as an always-empty
array for now (no real citations exist yet — that's Milestone 3), rather
than omitting the field. Keeping it present-but-empty means the API/UI
contract doesn't change shape when citations arrive later — only the array
stops being empty.

### 1.3 `KnowledgeProvider` — `src/server/knowledge/`

Mirrors `InterpretationProvider` exactly:

```typescript
// src/server/knowledge/types.ts
export interface KnowledgeProvider {
  readonly name: string;
  readonly version: string; // KnowledgeBundle.version this provider serves
  resolveContext(reading: DeterministicReading, intake: IntakeContext): Promise<KnowledgeContext>;
}
```

`LocalJsonKnowledgeProvider` loads `data/knowledge/bundle-v0.1.0.json`
(validated against `KnowledgeBundleSchema` once, cached — same pattern as
`cards.ts`'s `getAllCards()`), then `resolveContext()`:
- finds `pairRelations` where `(previousCardId, focusCardId)` matches an
  adjacent pair in `reading.cards` (index 0→1, 1→2) — **read-only lookup
  against already-drawn cards, never a selection**
- finds `positionRules` matching `reading.spread` + each drawn position
- finds the `domainModifier` matching `intake.questionDomain` (or `null`
  if the bundle has none for that domain yet — the proof-of-concept data
  won't cover all 4 domains)
- finds the `personaModifier` matching `intake.persona` (or `null`)
- finds `safetyConstraints` whose `flag` appears in `intake.safetyFlags`

`FutureDatabaseKnowledgeProvider` is not built this sprint — its existence
in the interface is what makes swapping possible later, same as
`ClaudeProvider`/`MockProvider` today.

### 1.4 `InterpretationInput` extension

```typescript
// src/types/interpretation.ts — additive change
export const InterpretationInputSchema = z.object({
  reading: DeterministicReadingSchema,
  intake: IntakeContextSchema,
  knowledge: KnowledgeContextSchema, // new
  questionText: z.string().default(''),
});
```

`ClaudeProvider`'s `buildUserMessage()` adds a `knowledgeContext` key
alongside the existing `intakeContext` in `developerInstruction` — Claude
sees the pair relations/position rules/modifiers as more structured ground
truth to narrate, same narration-only rule as today, just richer input.
`MockProvider` needs no code change (it doesn't destructure `knowledge`
today; ignoring it is harmless) — optionally, a follow-up could have it
acknowledge one pair relation deterministically, but that's not required
for this sprint's contract to work.

### 1.5 Product API contract — `POST /api/readings`

**Proposed refinement to your sketch:** your request example nested an
`"intake": {}` object. I'd rather not accept a client-supplied
`IntakeContext` at all — a client could hand the server
`{ persona: "...", confidence: 1.0, safetyFlags: [] }` directly, which
defeats the entire point of running `classifyIntake()` server-side. The
API should accept only raw input and classify it itself:

```typescript
export const ReadingRequestSchema = z.object({
  seed: z.string().min(1),
  question: z.string().default(''),
  topicHint: z.enum(['relationship', 'career', 'self']).optional(),
});

export const ReadingResponseSchema = z.object({
  readingId: z.string().nullable(), // null until persistence exists (Sprint 4+)
  seed: z.string(),
  cards: z.array(DrawnCardSchema),
  intakeContext: IntakeContextSchema,
  knowledgeContext: KnowledgeContextSchema,
  interpretation: InterpretationOutputSchema,
  provider: z.string(),
  versions: KnowledgeVersionSchema,
});
```

Route logic (`src/app/api/readings/route.ts`):
1. Parse request body against `ReadingRequestSchema` — reject (400) on failure.
2. `classifyIntake({ questionText: question, topicHint })` → `IntakeContext`.
3. **If any `intake.safetyFlags` entry starts with `crisis_`, do not call
   the Reading Engine at all** — return the crisis-resource response
   instead (per `docs/02-ETHICAL_CONSTITUTION.md`'s Response Flow). This is
   the first place in the whole system where that gate is actually
   enforced, not just documented as "the caller's job."
4. Otherwise: `generateInterpretedReading({ seed, spread: 'three-card',
   intake, questionText: question, provider, knowledgeProvider })`.
5. Shape the result into `ReadingResponseSchema` and return 200.

---

## 2. Dependency Boundaries

```
drawCards (deck.ts)
   │  (sole source of which 3 cards, what order — unchanged since Sprint 1)
   ▼
DeterministicReading  ◄────────────────────────────┐
   │                                                │ read-only input
   ├──────────────────────────────┐                 │
   ▼                              ▼                 │
buildInterpretations         KnowledgeProvider.resolveContext()
(deterministic.ts,            (new — looks up relations FOR these
 Layer 1, unchanged)            cards, never selects/reorders them)
   │                              │
   └──────────────┬───────────────┘
                  ▼
         InterpretationInput
     { reading, intake, knowledge, questionText }
                  │
                  ▼
         InterpretationProvider.generate()
      (Claude / Mock — narration only, unchanged rule:
       may rephrase knowledge content, may not invent it)
                  │
                  ▼
         validateInterpretation()
      (Zod + red-line scan, unchanged, runs regardless
       of which provider or knowledge source was used)
                  │
                  ▼
      API route (NEW — the only caller that may refuse
      to generate at all, on crisis_* flags)
                  │
                  ▼
              UI shell (NEW — calls the API only,
              never imports the engine directly)
```

**Hard rules this enforces structurally, not just by convention:**

1. `KnowledgeProvider` implementations live in `src/server/knowledge/` and
   do not import `deck.ts` or `drawCards` — there is no import edge for a
   knowledge provider to reach card selection through, same guarantee
   `ClaudeProvider` already has.
2. `KnowledgeContext` is always resolved from an *already-produced*
   `DeterministicReading` — `resolveContext(reading, intake)` takes the
   reading as an argument, it cannot request a different one.
3. `InterpretationProvider` implementations still only receive
   `InterpretationInput` (now including `knowledge`) — none of them import
   `KnowledgeProvider` directly. If `ClaudeProvider` wants richer data
   tomorrow, it changes what `InterpretationInput` carries, not who's
   allowed to call `resolveContext`.
4. The fallback chain (`generateInterpretedReading`'s try/catch) is
   unchanged and still centralized — a `KnowledgeProvider` failure needs
   its own decision (see Open Question below), but an `InterpretationProvider`
   failure still falls back to `MockProvider` exactly as today.
5. The UI shell calls `POST /api/readings` only. It does not import
   `generateInterpretedReading`, `drawCards`, or any provider directly —
   the API route is the only server-side entry point the UI knows about.
6. Crisis gating (`safetyFlags` starting with `crisis_`) is enforced in
   exactly one place: the API route, step 3 above. Neither the Intake
   Engine, the Reading Engine, nor any provider blocks generation itself —
   consistent with the existing "Intake Engine kart seçimine müdahale
   etmesin" rule, now extended to "the engine layer never refuses to run,
   only the route does."

**Open question for you before implementation:** what should
`generateInterpretedReading()` do if `KnowledgeProvider.resolveContext()`
itself throws (e.g. the bundle file is missing/corrupt)? Two options:
(a) treat it like a provider failure — fall back to an empty
`KnowledgeContext` (`pairRelations: [], positionRules: [], domainModifier:
null, personaModifier: null, safetyConstraints: []`) and proceed with
narration based on `reading`+`intake` alone, same spirit as the
Claude-down fallback; or (b) let it propagate and fail the whole request,
since the knowledge bundle is a build artifact that should never be
missing in a working deployment. I'd default to (a) for consistency with
every other "degrade gracefully" decision in this system, but flagging it
since it's a real behavioral choice, not an implementation detail.

---

## 3. Acceptance Criteria

Sprint 3 closes when all of the following hold:

**Build gates (unchanged bar):**
```
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run demo:api     # new — hits the route handler in-process, prints the response
```

**Contract guarantees (new, specific to this sprint):**

1. Same seed → same 3 cards, same order (unchanged Sprint 1 guarantee, re-verified through the new API layer, not just the engine).
2. Same `KnowledgeBundle` version → same resolved `KnowledgeContext` for a given reading + intake (determinism extends to the new layer).
3. Swapping `KnowledgeProvider` implementations does not change `DeterministicReading` — the Reading Engine's output is byte-identical regardless of which `KnowledgeProvider` is passed in.
4. Swapping `InterpretationProvider` implementations does not change `KnowledgeContext` — knowledge resolution is independent of narration.
5. Missing `ANTHROPIC_API_KEY` → API response still succeeds, `provider: "mock"` in the response body (existing fallback, now verified reachable through the HTTP layer).
6. A response that would fail the red-line scan is never returned to the caller — the API falls back to `MockProvider`'s output instead, same as the engine-level guarantee, verified at the HTTP layer.
7. Malformed request body (missing `seed`, wrong types) is rejected with 400 before `classifyIntake` or the Reading Engine ever runs.
8. A request whose `question` produces a `crisis_*` safety flag never reaches `generateInterpretedReading()` — verified by asserting `drawCards`/`generateDeterministicReading` is not called (spy) for such a request.
9. Every successful response includes all four `versions` fields, non-empty.
10. `PairRelation.sourceRefs` is present (possibly empty) on every relation in every response — the shape never omits it.

---

## 4. Test Matrix

| # | Test | Verifies |
|---|---|---|
| 1 | `KnowledgeBundleSchema` rejects a bundle with fewer than 22 cards | Bundle integrity, same discipline as the 22-card checks elsewhere |
| 2 | `LocalJsonKnowledgeProvider.resolveContext()` returns only pair relations for *adjacent* drawn pairs, not all bundle relations | Knowledge Layer doesn't leak unrelated relations into a specific reading |
| 3 | `resolveContext()` returns `positionRules` for exactly the 3 drawn positions, matching `reading.spread` | Position rules are read-only lookups, not generated |
| 4 | `resolveContext()` returns `domainModifier: null` when the bundle has no entry for the given domain | Proof-of-concept data gaps degrade gracefully, don't crash |
| 5 | `resolveContext()` returns `safetyConstraints` matching exactly the flags in `intake.safetyFlags`, none extra | No safety constraint leakage across sessions |
| 6 | Two calls to `resolveContext()` with the same `reading`+`intake` produce byte-identical `KnowledgeContext` | Determinism extends to the Knowledge Layer |
| 7 | `KnowledgeProvider` module has no import of `deck.ts`/`drawCards` (static check, e.g. a lint rule or a simple grep-based test) | Structural enforcement of "Knowledge Layer cannot select cards" |
| 8 | `generateInterpretedReading()` with two different `KnowledgeProvider` instances (one returning empty context, one returning populated context) produces the *same* `DeterministicReading` in both cases | Card draw is independent of knowledge resolution |
| 9 | `InterpretationInput.knowledge` is present and schema-valid in every call `ClaudeProvider`/`MockProvider` receive | Contract is actually wired end-to-end, not just defined in types |
| 10 | `ClaudeProvider`'s `buildUserMessage()` includes `knowledgeContext` in `developerInstruction`, matching the resolved context | Claude actually sees the richer input |
| 11 | `POST /api/readings` with a valid body returns 200 and a response matching `ReadingResponseSchema` | End-to-end contract |
| 12 | `POST /api/readings` with a missing `seed` returns 400, and no engine function was called (spy/mock check) | Input validation happens before any engine work |
| 13 | `POST /api/readings` with crisis-flagged `question` text returns a crisis-resource response, and `drawCards`/`generateDeterministicReading` were never called | Crisis gate is enforced at the route, verifiably, not just documented |
| 14 | `POST /api/readings` with no `ANTHROPIC_API_KEY` set returns 200 with `provider: "mock"` | Fallback reachable over HTTP |
| 15 | `POST /api/readings` where the (mocked) Claude response contains a red-line phrase still returns 200 with `provider: "mock"` and clean output | Red-line gate reachable over HTTP |
| 16 | Two `POST /api/readings` calls with the same `seed` return the same `cards` array | Determinism reachable over HTTP |
| 17 | Response `versions` object has all 4 fields non-empty on every successful response | Versioning contract honored |
| 18 | UI shell's question-submit flow calls `fetch('/api/readings', ...)` and nothing else server-side (no direct import of engine internals in any client/UI file) | UI/API boundary enforced, not just documented |
| 19 | UI shell renders a visibly different state for: loading, success, provider-fallback-used, and error/crisis response | The "yapılandırılmış yorumu göster + hata/fallback durumunu göster" requirement is testable, not just visual |

---

## 5. Explicitly Deferred (per your instruction, restated so it's in the same document as the plan)

- Full pair-relation matrix (only a handful of proof-of-concept relations)
- NotebookLM research pipeline
- Full RAG infrastructure
- User accounts, payments, reading history/persistence
- Mandatory live Anthropic call (mock-HTTP verification remains sufficient, per Sprint 2's precedent)
- Full responsive/premium UI (functional shell only — no Canva/Figma-driven visual design without that prototype being locked first)
- Reversed cards (ADR-002, unchanged)

---

## Next Step

This is a proposal. Confirm or amend before I write any code — in particular the two flagged refinements (§1.5's request-schema change, and §1.2's `sourceRefs`-stays-present-but-empty choice) and the open question in §2 (KnowledgeProvider failure behavior) are real decisions, not settled facts.
