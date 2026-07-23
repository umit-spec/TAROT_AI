# Sprint 5 — Knowledge Authoring Pipeline & Source Governance: Plan

**Date:** 2026-07-23
**Status:** Proposal — awaiting GO before implementation
**Governs:** `docs/DECISION_LOG.md` ADR-011 (deferral list: pair-relation matrix, NotebookLM pipeline, citation structure, build pipeline, curation/Red Team workflow), ADR-012 (Knowledge Layer boundary, unchanged by this sprint)

---

## 0. Grounding

This plan is written against the actual current code, not a fresh design.
Nothing in Sprint 3/4's runtime contract changes:

- `src/types/knowledge.ts` — `KnowledgeBundleSchema`, `PairRelationSchema`,
  `PositionRuleSchema`, `DomainModifierSchema`, `PersonaModifierSchema`,
  `SafetyConstraintSchema` are **reused as-is** as the *payload* shapes this
  sprint's authoring records carry. No new parallel schema is invented for
  "what a pair relation is" — only for "how a pair relation gets authored,
  reviewed, and promoted."
- `src/server/knowledge/bundle.ts` — `loadKnowledgeBundle()` already loads
  and validates a `KnowledgeBundleSchema`-shaped JSON file from a fixed
  path and caches it. This sprint's pipeline produces exactly that shape
  of file as its final output. `LocalJsonKnowledgeProvider` needs **zero
  code changes** — the pipeline's job is to get from raw drafts to a file
  that loader already knows how to read.
- Per your instruction, this pipeline is **not** the 462-relation matrix
  itself. It's the machinery — registry, schema, lifecycle, ingestion,
  validation, conflict detection, citation checks, build, and a small
  pilot package proving the machinery works end to end. Mass content
  generation is explicitly out of scope until this is approved and
  evidenced.
- Per your instruction, NotebookLM (or any AI-assisted drafting tool) may
  produce `draft`-status content but can never itself set `locked` status.
  §3 below makes that a structural rule, not a convention someone has to
  remember — same technique this project already used for "Knowledge
  Layer cannot import `deck.ts`" (Sprint 3) and "UI cannot compute intake"
  (Sprint 4).

This is entirely **offline/build-time tooling** — it runs before a
deployment, not during a request. It must not be importable from
`src/app/` or `src/server/reading-engine/` or `src/server/knowledge/`
(runtime code) at all; the only thing runtime code ever sees is the
`bundle-v*.json` file this pipeline produces, exactly as today.

---

## 1. Proposed Schemas

### 1.1 Source Registry — `src/types/knowledge-authoring.ts`

```typescript
import { z } from 'zod';

export const SourceTypeSchema = z.enum([
  'classic-text',       // published tarot reference work
  'academic',           // psychology/symbolism scholarship
  'original-synthesis', // this project's own reasoning, not a copy of an external source
  'ai-assisted-draft',  // NotebookLM or similar - research/drafting aid only
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const SourceSchema = z.object({
  sourceId: z.string().min(1), // stable slug, e.g. "waite-pictorial-key-1910"
  title: z.string().min(1),
  author: z.string().optional(),
  type: SourceTypeSchema,
  publicationYear: z.number().int().optional(),
  url: z.string().url().optional(),
  notes: z.string().optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const SourceRegistrySchema = z.object({
  version: z.string().min(1),
  sources: z.array(SourceSchema),
});
export type SourceRegistry = z.infer<typeof SourceRegistrySchema>;
```

Stored at `data/knowledge-authoring/sources.json`. A registry, not a free
citation string — every `sourceRef` a record carries (§1.2) must resolve
to a `sourceId` that actually exists here. This is what makes §1.4's
"citation integrity" check possible at all: a citation to nothing
detectable isn't a citation.

**`ai-assisted-draft` is a real, named category, not a workaround.**
NotebookLM output is legitimate as a *source of a draft* — it's just never
a legitimate *sole basis* for a `locked` record on its own authority (see
§3, which enforces this at the lifecycle level, not by hiding the
category).

### 1.2 Knowledge Record Envelope — `src/types/knowledge-authoring.ts`

One envelope type wraps any of Sprint 3's existing payload schemas —
authoring metadata is identical in shape regardless of whether the
content inside is a pair relation, a position rule, a domain modifier, a
persona modifier, or a safety constraint.

```typescript
import { PairRelationSchema, PositionRuleSchema, DomainModifierSchema,
         PersonaModifierSchema, SafetyConstraintSchema } from './knowledge';

export const RecordTypeSchema = z.enum([
  'pairRelation', 'positionRule', 'domainModifier',
  'personaModifier', 'safetyConstraint',
]);
export type RecordType = z.infer<typeof RecordTypeSchema>;

export const LifecycleStatusSchema = z.enum(['draft', 'reviewed', 'red-teamed', 'locked']);
export type LifecycleStatus = z.infer<typeof LifecycleStatusSchema>;

// Reserved authoredBy/reviewedBy/redTeamedBy/lockedBy values that mean
// "an automated or AI-assisted actor, not a named human" - used by the
// refinement below to structurally block AI-authored locks.
const AI_ACTOR_MARKERS = ['notebooklm', 'ai-draft', 'automated', 'pipeline'] as const;
const isHumanActor = (name: string) =>
  name.trim().length > 0 && !AI_ACTOR_MARKERS.some((m) => name.toLowerCase().includes(m));

export const LifecycleSchema = z.object({
  status: LifecycleStatusSchema,
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  redTeamedBy: z.string().optional(),
  redTeamedAt: z.string().datetime().optional(),
  lockedBy: z.string().optional(),
  lockedAt: z.string().datetime().optional(),
}).superRefine((lifecycle, ctx) => {
  if (lifecycle.status === 'reviewed' || lifecycle.status === 'red-teamed' || lifecycle.status === 'locked') {
    if (!lifecycle.reviewedBy || !isHumanActor(lifecycle.reviewedBy)) {
      ctx.addIssue({ code: 'custom', message: 'reviewedBy must be a named human reviewer to reach reviewed status or beyond' });
    }
  }
  if (lifecycle.status === 'red-teamed' || lifecycle.status === 'locked') {
    if (!lifecycle.redTeamedBy || !isHumanActor(lifecycle.redTeamedBy)) {
      ctx.addIssue({ code: 'custom', message: 'redTeamedBy must be a named human red-teamer to reach red-teamed status or beyond' });
    }
  }
  if (lifecycle.status === 'locked') {
    if (!lifecycle.lockedBy || !isHumanActor(lifecycle.lockedBy)) {
      ctx.addIssue({ code: 'custom', message: 'lockedBy must be a named human - locked status can never be granted by an AI-assisted or automated actor' });
    }
  }
});
export type Lifecycle = z.infer<typeof LifecycleSchema>;

const RecordPayloadSchema = z.discriminatedUnion('recordType', [
  z.object({ recordType: z.literal('pairRelation'), payload: PairRelationSchema }),
  z.object({ recordType: z.literal('positionRule'), payload: PositionRuleSchema }),
  z.object({ recordType: z.literal('domainModifier'), payload: DomainModifierSchema }),
  z.object({ recordType: z.literal('personaModifier'), payload: PersonaModifierSchema }),
  z.object({ recordType: z.literal('safetyConstraint'), payload: SafetyConstraintSchema }),
]);

export const KnowledgeRecordSchema = z.object({
  recordId: z.string().min(1), // stable slug, e.g. "pair-00-fool-01-magician"
  authoredBy: z.string().min(1), // human name, or "notebooklm-draft" etc. - draft status only
  sourceRefs: z.array(z.string().min(1)), // sourceId values, must resolve against the registry (§1.4)
  lifecycle: LifecycleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).and(RecordPayloadSchema);
export type KnowledgeRecord = z.infer<typeof KnowledgeRecordSchema>;
```

**Why a `superRefine` on the schema itself, not just a convention in the
lock script:** the same "structural, not conventional" bar this project
has held to since Sprint 3 (KnowledgeProvider can't import `deck.ts`;
Sprint 4: UI can't compute intake). If the guarantee lived only in a CLI
tool's logic, a second script (or a hand-edited JSON file) could still
produce an invalid locked record. Living in the Zod schema means *every*
validation pass — ingestion, the build step, a future admin UI, a test —
enforces it identically, the same reason `sourceRefs` was kept
present-but-empty in Sprint 3 rather than optional.

### 1.3 On-disk layout

```
data/knowledge-authoring/
  sources.json                          # SourceRegistrySchema
  records/
    pairRelations.json                  # KnowledgeRecordSchema[] (recordType: pairRelation)
    positionRules.json
    domainModifiers.json
    personaModifiers.json
    safetyConstraints.json
```

One array-per-`recordType` file rather than one giant file or one
file-per-record: keeps diffs reviewable (a PR touching 3 pair relations
shows a 3-entry diff, not a 700-line one) while staying simple enough for
a pilot-scale dataset. Revisit if/when the full matrix makes a single
file unwieldy — not this sprint's problem to solve.

---

## 2. Pipeline Architecture / Dependency Boundaries

```
data/knowledge-authoring/{sources.json, records/*.json}   (source of truth for authoring)
        │
        ▼
scripts/knowledge-authoring/ingest.ts        (CSV/JSON → KnowledgeRecordSchema, status: draft)
        │
        ▼
scripts/knowledge-authoring/validate.ts      (schema validation + citation integrity, §1.4/§4)
        │
        ▼
scripts/knowledge-authoring/check-conflicts.ts  (duplicate/conflict detection, §5)
        │
        ▼
  [ manual review / red-team / lock — human-run, updates lifecycle fields in the JSON files
    directly or via a small `lock.ts` helper that still goes through KnowledgeRecordSchema
    validation, so an invalid lock attempt fails the same way an invalid ingest does ]
        │
        ▼
scripts/knowledge-authoring/build.ts         (locked records only → KnowledgeBundleSchema JSON)
        │
        ▼
data/knowledge/bundle-v{X}.json              (same shape/location Sprint 3's loader already reads)
        │
        ▼
src/server/knowledge/bundle.ts::loadKnowledgeBundle()   ← UNCHANGED, zero code touched
```

**Hard rules this enforces structurally:**

1. `scripts/knowledge-authoring/**` is never imported by `src/app/`,
   `src/server/reading-engine/`, or `src/server/knowledge/` — verified the
   same way Sprint 3 verified the `deck.ts` import boundary (a grep-based
   structural test, §6).
2. `build.ts` reads only records where `lifecycle.status === 'locked'`.
   `draft`/`reviewed`/`red-teamed` records are structurally invisible to
   the build output — this is the actual enforcement of "NotebookLM/drafts
   never leak into production," not just a naming convention.
3. `build.ts` itself never writes `lifecycle.status`. It only *reads*
   already-locked records. The tool that can move a record to `locked` is
   a separate concern (§1.2's schema-level guarantee) from the tool that
   assembles locked records into a bundle.
4. `LocalJsonKnowledgeProvider` and `loadKnowledgeBundle()` are not
   modified this sprint. The pipeline's output must independently satisfy
   `KnowledgeBundleSchema.safeParse` — proven by a test, not assumed.
5. Promoting a freshly-built `bundle-v{X}.json` to be the file
   `BUNDLE_PATH` actually points at is a **separate, explicit step**, not
   an automatic side effect of running `build.ts` — see Open Question 1.

---

## 3. Lifecycle Governance Rules (restated plainly)

| Transition | Who can do it | Requirement |
|---|---|---|
| (none) → `draft` | Anyone, including AI-assisted drafting (NotebookLM etc.) | `authoredBy` recorded, may be an AI-actor marker |
| `draft` → `reviewed` | Named human only | `reviewedBy` set to a non-AI-marker string |
| `reviewed` → `red-teamed` | Named human only | `redTeamedBy` set to a non-AI-marker string, in addition to `reviewedBy` already set |
| `red-teamed` → `locked` | Named human only | `lockedBy` set to a non-AI-marker string, in addition to both above |
| any status → build eligibility | N/A | Only `locked` records are read by `build.ts` |

No status can be skipped (schema requires the earlier fields present
before a later one validates), and no status can regress silently — a
`locked` record being edited resets to `draft` if its `payload` changes
(handled by `ingest.ts`/`validate.ts` refusing to accept a payload edit on
a locked record without explicitly demoting its status first — a rule
enforced in the ingestion script, since "editing locked content silently"
is a workflow action, not a schema shape).

---

## 4. Citation Integrity

- Every `sourceRefs` entry on every `KnowledgeRecord` must resolve to a
  `sourceId` present in `sources.json` — an unresolvable reference is a
  validation error, not a warning.
- A `locked` record must have at least one `sourceRefs` entry. A record
  authored as the team's own original reasoning still registers a source
  (`type: 'original-synthesis'`) rather than shipping an empty array —
  "no source" and "the source is our own synthesis, named as such" are
  different, and only the second is allowed to lock.
- `sources.json` itself ships in this sprint's pilot package with at
  least one `original-synthesis` entry (covering the pilot's own
  hand-authored content) so the pilot has something real to cite against,
  not a placeholder.

---

## 5. Conflict and Duplicate Detection

`check-conflicts.ts` operates per `recordType`:

| `recordType` | Duplicate key | Conflict condition |
|---|---|---|
| `pairRelation` | `(previousCardId, focusCardId)` | Same key, different `relationType` or `semanticEffect` |
| `positionRule` | `(position, spread)` | Same key, different `emphasis` or `framingGuidance` |
| `domainModifier` | `domain` | Same key, different `emphasisKeywords`/`cautionNotes` |
| `personaModifier` | `persona` | Same key, different `toneGuidance`/`depthGuidance` |
| `safetyConstraint` | `flag` | Same key, different `action`/`disclaimerText` |

- Among `draft`/`reviewed`/`red-teamed` records: conflicts are reported as
  warnings (exit code 0) — authoring is allowed to have competing drafts
  under review.
- Among `locked` records: a conflict is a **build-blocking error** (exit
  code 1) — two locked, contradictory truths about the same card pair (or
  position, domain, persona, flag) must never both ship. `build.ts` runs
  this check before assembling output and refuses to write a bundle file
  if it finds one.
- An exact duplicate (same key, same content) among locked records is not
  an error — it collapses to one entry in the build output — but is
  logged, since it usually means an authoring mistake (double-ingested
  file) worth a human look.

---

## 6. Acceptance Criteria

Sprint 5 closes when all of the following hold:

**Build gates (unchanged bar):**
```
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run knowledge:validate    # new
npm run knowledge:build       # new
```

**Contract guarantees (new, specific to this sprint):**

1. `KnowledgeRecordSchema` rejects a record with `lifecycle.status: 'locked'` and any of `reviewedBy`/`redTeamedBy`/`lockedBy` missing or matching an AI-actor marker.
2. `KnowledgeRecordSchema` rejects a record with `sourceRefs: []` and `lifecycle.status: 'locked'`.
3. `build.ts` output contains only content traceable to `locked` records — verified by comparing every entry in the built `KnowledgeBundleSchema` output against the set of locked `recordId`s, not merely "the counts match."
4. `build.ts` output independently passes `KnowledgeBundleSchema.safeParse` with `success: true`.
5. A `sourceRefs` entry that does not resolve to any `sourceId` in `sources.json` fails `knowledge:validate` with a non-zero exit code.
6. Two `locked` records with conflicting content for the same key (per §5's table) cause `knowledge:build` to fail with a non-zero exit code and a message naming both conflicting `recordId`s.
7. No file under `scripts/knowledge-authoring/` is imported anywhere under `src/app/`, `src/server/reading-engine/`, or `src/server/knowledge/` (structural check, §2 rule 1).
8. `src/server/knowledge/bundle.ts` and `local-json-provider.ts` are byte-identical to their Sprint 3/4 committed state — this sprint changes zero runtime code.
9. The pilot data package (§7) reaches `locked` status through the real lifecycle (not hand-edited to `locked` directly) and builds into a valid bundle.

---

## 7. Small Pilot Data Package — scope, explicitly bounded

Per your instruction, this is proof the pipeline works, not the start of
mass content generation:

- **1 source registry** with 2-3 entries (at least one `original-synthesis`, at least one `ai-assisted-draft` marked entry to prove the category is real, not just declared in a schema).
- **5-8 new `pairRelation` records** (beyond the 8 already in `bundle-v0.1.0.json`), each carried through `draft → reviewed → red-teamed → locked` for real, with real (if this-project-internal) reviewer/red-teamer names.
- **0 new `positionRule`/`domainModifier`/`personaModifier`/`safetyConstraint` records required** for the pilot to prove the pipeline — the existing 3/2/3/9 entries in `bundle-v0.1.0.json` are sufficient evidence that the pipeline handles all 5 `recordType`s (the schema/build logic is generic across them; the pilot only needs to *exercise* one type end-to-end plus *validate* the others pass through unchanged).
- **Explicitly not attempted:** the full pair-relation matrix (462 relations for all 22×21 ordered pairs), a real external NotebookLM research session, or any citation to an actual published tarot text (the pilot's sources are structurally real but content-wise a placeholder, same spirit as Sprint 4's design-token placeholders).

---

## 8. Test Matrix

| # | Test | Verifies |
|---|---|---|
| 1 | `KnowledgeRecordSchema` accepts a valid `draft` record with `authoredBy: 'notebooklm-draft'` | AI-assisted drafting is legitimate at draft stage |
| 2 | `KnowledgeRecordSchema` rejects `status: 'reviewed'` with no `reviewedBy` | Review requires a named actor |
| 3 | `KnowledgeRecordSchema` rejects `status: 'locked'` with `lockedBy: 'notebooklm'` | AI actor cannot self-grant locked status - the literal governance rule this sprint was named for |
| 4 | `KnowledgeRecordSchema` rejects `status: 'locked'` with `sourceRefs: []` | Citation integrity at lock time |
| 5 | `KnowledgeRecordSchema` accepts `status: 'locked'` with all three named-human fields set and non-empty `sourceRefs` | The valid, intended path works |
| 6 | `validate.ts` reports every `sourceRefs` entry that doesn't resolve against `sources.json` | Orphan-citation detection |
| 7 | `check-conflicts.ts` reports a warning (exit 0) for two conflicting `draft` records | Drafts may compete |
| 8 | `check-conflicts.ts` reports a build-blocking error (exit 1) for two conflicting `locked` records | Locked contradictions never both ship |
| 9 | `check-conflicts.ts` collapses two identical `locked` duplicates into one build entry without erroring | Exact duplicates are harmless |
| 10 | `build.ts` output excludes a `reviewed`-but-not-`red-teamed` record | Only `locked` reaches production |
| 11 | `build.ts` output, run through `KnowledgeBundleSchema.safeParse`, succeeds | Pipeline output matches Sprint 3's existing consumer contract |
| 12 | `ingest.ts` on a sample CSV file produces `KnowledgeRecordSchema`-valid `draft` records | CSV path works |
| 13 | `ingest.ts` on a sample JSON file produces `KnowledgeRecordSchema`-valid `draft` records | JSON path works |
| 14 | `ingest.ts` refuses to accept a payload change to an already-`locked` record without an explicit status demotion | No silent edits to locked content |
| 15 | Structural check: no file under `src/app/`, `src/server/reading-engine/`, or `src/server/knowledge/` imports anything from `scripts/knowledge-authoring/` | Pipeline/runtime boundary held |
| 16 | `src/server/knowledge/bundle.ts` and `local-json-provider.ts` diff against their last-committed (Sprint 4) version is empty | Zero runtime code touched, verified not just claimed |
| 17 | End-to-end: pilot's 5-8 pair relations, run through the real lifecycle, produce a `bundle-v{X}.json` that `LocalJsonKnowledgeProvider` (unmodified) can load and resolve context from for a real `DeterministicReading` | Whole pipeline proven against the actual existing consumer, not just its schema |

---

## 9. Explicitly Deferred

- Full 462-relation pair matrix
- Real NotebookLM research session / real external source ingestion
- Citation to actual published tarot texts
- Admin UI for authoring/review/lock (this sprint's workflow is file-edit + script, same tier of "functional, not polished" as Sprint 4's shell UI)
- Promotion automation (see Open Question 1) — the step that makes a freshly-built bundle the one `LocalJsonKnowledgeProvider` actually loads stays a deliberate, separate action this sprint
- Any change to `src/server/knowledge/` or `src/server/reading-engine/` runtime code
- Positional/domain/persona/safety-constraint content expansion beyond what already exists (pilot only adds pair relations, per §7)

---

## 10. Open Questions for you before implementation

1. **Bundle promotion.** `build.ts` writes `data/knowledge/bundle-v{X}.json`. Should this sprint also update `BUNDLE_PATH` in `bundle.ts` to point at the new pilot version (making it the live bundle), or should the pilot build output stay a proven-but-unpromoted artifact, with promotion left as a deliberate follow-up decision? I'd default to **not promoting** this sprint — the pilot's pair relations are placeholder-quality content (same spirit as Sprint 4's placeholder design tokens), and promoting placeholder knowledge content into the live path feels like a different kind of decision than proving the pipeline works. Flagging since it's a real choice, not an implementation detail.
2. **Reviewer/red-teamer identity for the pilot.** Since this is a single-operator project right now, the "named human reviewer" for the pilot's 5-8 records would be you (Product Owner) or me acting under your explicit direction per-record. Confirm that's acceptable for pilot purposes, understanding a real content pipeline later would want distinct reviewer/red-teamer roles (possibly literally different people).
3. **CSV format.** No CSV sample exists yet in this repo. I'd propose one column per `KnowledgeRecordSchema` scalar field (`recordId,recordType,previousCardId,focusCardId,relationType,semanticEffect (semicolon-joined),warnings (semicolon-joined),sourceRefs (semicolon-joined),authoredBy`) — one CSV per `recordType`, since the columns differ by payload shape. Confirm or amend before `ingest.ts` is written against a specific shape.

---

## Next Step

This is a proposal. Confirm or amend the three open questions above before I write any code — everything else in this document (schemas, lifecycle rule, pipeline boundaries, conflict/citation rules, test matrix, pilot scope) is ready to implement as written, pending your GO.
