# Sprint 5 — Knowledge Authoring Pipeline & Source Governance: Plan

**Date:** 2026-07-23
**Status:** APPROVED — GO given, revised below to incorporate 7 binding decisions
**Governs:** `docs/DECISION_LOG.md` ADR-011 (deferral list: pair-relation matrix, NotebookLM pipeline, citation structure, build pipeline, curation/Red Team workflow), ADR-012 (Knowledge Layer boundary, unchanged by this sprint)

## Amendment record

The Product Owner reviewed the original proposal (§10 below preserves the
three open questions as originally asked) and returned a binding decision
resolving all three, plus two additional binding requirements. This
document has been revised in place to reflect that decision. The seven
locked decisions:

1. Pilot output stays a separate artifact first
   (`data/knowledge-builds/pilot/knowledge-bundle.v0.1.0.json`), not the
   live bundle.
2. Promotion to the live bundle path is a separate, atomic gate
   (`npm run knowledge:promote -- --version X`) that reads only locked
   records, produces a checksum, backs up the previous version, writes a
   manifest, runs runtime compatibility tests, and makes zero file changes
   on any failure.
3. Role separation in the single-operator pilot is preserved at the
   *process* level (author/reviewer sessions genuinely separate,
   `singleOperatorMode: true` flag, non-blocking governance warning when
   `authorId === reviewerId`).
4. Claude may act as Red Team (adversarial review only — contradictions,
   weak sourcing, overreach, ethical risk) but can never be lock authority.
5. CSV is the ingestion format only; canonical authoring source of truth
   is JSON (`CSV → strict parser → normalized JSON record → Zod
   validation → canonical authoring store`).
6. Record types stay in separate CSV files, each with common envelope
   columns plus type-specific payload columns; list-valued fields use
   embedded JSON arrays in CSV cells, not comma-flattening.
7. Pilot is limited to 5-8 pair relations.

Plus two additional binding requirements: typed `draftOrigin`/`aiTool`
fields with AI-assisted content barred from skipping human review or
reaching `red-teamed` without per-source verification; and a build
manifest accompanying every build.

§1.2, §2, and §6/§7/§8 below are rewritten to match. §10's original
questions are kept for the record, each annotated with the decision that
resolved it.

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

**Revised per the Product Owner's decision.** The original draft used a
single free-text `authoredBy`/`reviewedBy`/`redTeamedBy`/`lockedBy` set of
fields plus string-marker sniffing (`'notebooklm'`, `'automated'`, ...) to
decide whether an actor was human. That approach cannot express "Claude is
a legitimate Red Team actor but can never be Lock Authority" — a marker
list that blocks `'claude'` everywhere would also block it from Red Team,
which the Product Owner explicitly wants to allow. The revised schema uses
a typed `ActorRole` enum and **separate ID fields per role**, so the rule
that matters — lock authority can never be an AI actor — is checked on
exactly one field, independent of what Red Team's field contains.

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

export const ActorRoleSchema = z.enum(['author', 'reviewer', 'red-team', 'lock-authority']);
export type ActorRole = z.infer<typeof ActorRoleSchema>;

export const DraftOriginSchema = z.enum(['human', 'ai-assisted']);
export type DraftOrigin = z.infer<typeof DraftOriginSchema>;

export const AiToolSchema = z.enum(['notebooklm', 'claude', 'other']);
export type AiTool = z.infer<typeof AiToolSchema>;

// Known non-human actor identifiers. This list is consulted for exactly
// two checks: (a) lockAuthorityId and reviewerId must never match it -
// Lock Authority and human review can never be AI-performed, full stop;
// (b) it is NOT consulted for redTeamActorId, because Claude acting as
// Red Team ("claude") is an explicitly sanctioned identity for that one
// field. The guarantee is field-scoped, not identity-scoped.
const AI_ACTOR_IDS = ['claude', 'notebooklm', 'automated', 'pipeline'] as const;
const isAiActorId = (id: string) =>
  AI_ACTOR_IDS.some((marker) => id.trim().toLowerCase().includes(marker));

export const SourceVerificationSchema = z.object({
  sourceId: z.string().min(1),
  verifiedBy: z.string().min(1), // must be a human id - checked in the cross-field refine below
  verifiedAt: z.string().datetime(),
});
export type SourceVerification = z.infer<typeof SourceVerificationSchema>;

const STATUS_ORDER: LifecycleStatus[] = ['draft', 'reviewed', 'red-teamed', 'locked'];
const reached = (status: LifecycleStatus, gate: LifecycleStatus) =>
  STATUS_ORDER.indexOf(status) >= STATUS_ORDER.indexOf(gate);

export const LifecycleSchema = z.object({
  status: LifecycleStatusSchema,
  authorId: z.string().min(1),
  reviewerId: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  redTeamActorId: z.string().optional(),
  redTeamedAt: z.string().datetime().optional(),
  lockAuthorityId: z.string().optional(),
  lockedAt: z.string().datetime().optional(),
  draftOrigin: DraftOriginSchema,
  aiTool: AiToolSchema.optional(),
  singleOperatorMode: z.boolean().default(false),
}).superRefine((lifecycle, ctx) => {
  if (lifecycle.draftOrigin === 'ai-assisted' && !lifecycle.aiTool) {
    ctx.addIssue({ code: 'custom', path: ['aiTool'], message: 'ai-assisted drafts must name the aiTool used' });
  }
  if (lifecycle.draftOrigin === 'human' && lifecycle.aiTool) {
    ctx.addIssue({ code: 'custom', path: ['aiTool'], message: 'aiTool may only be set when draftOrigin is ai-assisted' });
  }

  if (reached(lifecycle.status, 'reviewed')) {
    if (!lifecycle.reviewerId) {
      ctx.addIssue({ code: 'custom', path: ['reviewerId'], message: 'reviewerId required at reviewed status or beyond' });
    } else if (isAiActorId(lifecycle.reviewerId)) {
      ctx.addIssue({ code: 'custom', path: ['reviewerId'], message: 'reviewerId must be a named human - AI-assisted content requires at least one human review before it can be reviewed' });
    }
    if (!lifecycle.reviewedAt) {
      ctx.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'reviewedAt required at reviewed status or beyond' });
    }
  }

  if (reached(lifecycle.status, 'red-teamed')) {
    if (!lifecycle.redTeamActorId) {
      ctx.addIssue({ code: 'custom', path: ['redTeamActorId'], message: 'redTeamActorId required at red-teamed status or beyond' });
    }
    if (!lifecycle.redTeamedAt) {
      ctx.addIssue({ code: 'custom', path: ['redTeamedAt'], message: 'redTeamedAt required at red-teamed status or beyond' });
    }
  }

  if (reached(lifecycle.status, 'locked')) {
    if (!lifecycle.lockAuthorityId) {
      ctx.addIssue({ code: 'custom', path: ['lockAuthorityId'], message: 'lockAuthorityId required to reach locked status' });
    } else if (isAiActorId(lifecycle.lockAuthorityId)) {
      ctx.addIssue({ code: 'custom', path: ['lockAuthorityId'], message: 'lockAuthorityId can never be an AI actor - locked status can only be granted by a named human, structurally, not by convention' });
    }
    if (!lifecycle.lockedAt) {
      ctx.addIssue({ code: 'custom', path: ['lockedAt'], message: 'lockedAt required to reach locked status' });
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
  recordId: z.string().min(1), // stable slug, e.g. "pair-02-high-priestess-09-hermit"
  sourceRefs: z.array(z.string().min(1)), // sourceId values, must resolve against the registry (§1.4)
  sourceVerifications: z.array(SourceVerificationSchema).default([]),
  lifecycle: LifecycleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).and(RecordPayloadSchema)
  .superRefine((record, ctx) => {
    if (record.lifecycle.status === 'locked' && record.sourceRefs.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['sourceRefs'], message: 'locked records must cite at least one source' });
    }
    // Second binding requirement: AI-assisted content cannot become
    // red-teamed (or locked) until every one of its cited sources has been
    // individually verified by a named human - "kaynakları tek tek
    // doğrulanmadan red-teamed olamasın". This is deliberately build-
    // blocking (a schema issue), unlike the authorId===reviewerId check
    // below, which is deliberately not.
    if (record.lifecycle.draftOrigin === 'ai-assisted' && reached(record.lifecycle.status, 'red-teamed')) {
      const verifiedIds = new Set(
        record.sourceVerifications
          .filter((v) => !isAiActorId(v.verifiedBy))
          .map((v) => v.sourceId),
      );
      const unverified = record.sourceRefs.filter((ref) => !verifiedIds.has(ref));
      if (unverified.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['sourceVerifications'],
          message: `ai-assisted record cannot reach red-teamed/locked status with unverified sources: ${unverified.join(', ')}`,
        });
      }
    }
  });
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

**The one governance check deliberately kept *out* of the schema:** the
Product Owner's `authorId === reviewerId` single-operator warning must be
**non-build-blocking** ("Bu build-blocking olmak zorunda değil, ama açık
bir governance warning olmalı"). Zod's `superRefine` has no concept of a
non-fatal issue — every `ctx.addIssue` call fails `safeParse`. So this
check cannot live in `LifecycleSchema` at all; it lives in
`scripts/knowledge-authoring/validate.ts` as a separate, printed warning
that does not affect the script's exit code, checked only when
`singleOperatorMode: true`.

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

**Revised per decision 1 and 2.** `build.ts` never writes to
`data/knowledge/` at all — not even conditionally. Its only output is a
pilot artifact under `data/knowledge-builds/`. A completely separate
command, `knowledge:promote`, is the only code path that can ever write
`data/knowledge/bundle-v{X}.json` (the file `BUNDLE_PATH` in
`bundle.ts` reads). This pilot never runs `knowledge:promote` — proving
the pipeline is this sprint's job, not shipping content.

```
data/knowledge-authoring/{sources.json, records/*.json}   (source of truth for authoring)
        │
        ▼
scripts/knowledge-authoring/ingest.ts        (CSV/JSON → KnowledgeRecordSchema, status: draft)
        │
        ▼
scripts/knowledge-authoring/validate.ts      (schema validation + citation integrity + non-blocking
        │                                      singleOperatorMode governance warning, §1.4/§4)
        ▼
scripts/knowledge-authoring/check-conflicts.ts  (duplicate/conflict detection, §5)
        │
        ▼
  [ manual review / red-team / lock — human-run via `scripts/knowledge-authoring/transition.ts
    --recordId X --to reviewed|red-teamed|locked --actorId Y`, which still goes through
    KnowledgeRecordSchema validation, so an invalid transition fails the same way an invalid
    ingest does. Claude may run this for --to red-teamed with --actorId claude; nothing may
    run it for --to locked except a named human actorId - enforced by §1.2's schema. ]
        │
        ▼
scripts/knowledge-authoring/build.ts   (locked records only → KnowledgeBundleSchema JSON
        │                                + build manifest, §11)
        ▼
data/knowledge-builds/pilot/knowledge-bundle.v0.1.0.json   (PILOT ARTIFACT - not the live bundle)
data/knowledge-builds/pilot/manifest.json
        │
        │    ═══════════════════════ explicit, separate gate ═══════════════════════
        │    npm run knowledge:promote -- --version X   (NOT run this sprint)
        │    - reads ONLY locked records
        │    - regenerates the bundle, computes a checksum
        │    - backs up the previous data/knowledge/bundle-v*.json
        │    - writes a manifest next to the promoted bundle
        │    - runs runtime compatibility tests (loadKnowledgeBundle + resolveContext)
        │    - on ANY failure: zero files touched, atomic all-or-nothing
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
5. `build.ts` and `promote.ts` are two different files with no shared
   write path: `build.ts` can only ever write under
   `data/knowledge-builds/`, `promote.ts` is the only file in the repo
   permitted to write under `data/knowledge/`. This is checked the same
   way rule 1 is — grep-verified, not just documented — since "which
   script writes where" is exactly the kind of rule that drifts if it's
   only a comment.

---

## 3. Lifecycle Governance Rules (restated plainly)

| Transition | Who can do it | Requirement |
|---|---|---|
| (none) → `draft` | Anyone, including AI-assisted drafting (NotebookLM etc.) | `authorId` recorded; `draftOrigin: 'ai-assisted'` + `aiTool` set if AI-drafted |
| `draft` → `reviewed` | Named human only | `reviewerId` set, not an AI actor id; `reviewedAt` set |
| `reviewed` → `red-teamed` | Named human **or Claude** | `redTeamActorId` set (`'claude'` permitted here specifically); if `draftOrigin: 'ai-assisted'`, every `sourceRefs` entry must have a matching `sourceVerifications` entry verified by a human first |
| `red-teamed` → `locked` | Named human only, never Claude, never any AI actor id | `lockAuthorityId` set, not an AI actor id; `lockedAt` set |
| any status → build eligibility | N/A | Only `locked` records are read by `build.ts` |

Single-operator pilot process note (decision 3): when `authorId ===
reviewerId`, the two transitions must still come from genuinely separate
review sessions/runs (ideally different dates) — the schema cannot check
"was this really a separate sitting," so that discipline is a process
rule the operator follows, surfaced by a non-blocking warning rather than
enforced by validation.

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

1. `KnowledgeRecordSchema` rejects a record with `lifecycle.status: 'locked'` and `lockAuthorityId` missing or matching a known AI actor id.
2. `KnowledgeRecordSchema` rejects a record with `sourceRefs: []` and `lifecycle.status: 'locked'`.
3. `build.ts` output contains only content traceable to `locked` records — verified by comparing every entry in the built `KnowledgeBundleSchema` output against the set of locked `recordId`s, not merely "the counts match."
4. `build.ts` output independently passes `KnowledgeBundleSchema.safeParse` with `success: true`.
5. A `sourceRefs` entry that does not resolve to any `sourceId` in `sources.json` fails `knowledge:validate` with a non-zero exit code.
6. Two `locked` records with conflicting content for the same key (per §5's table) cause `knowledge:build` to fail with a non-zero exit code and a message naming both conflicting `recordId`s.
7. No file under `scripts/knowledge-authoring/` is imported anywhere under `src/app/`, `src/server/reading-engine/`, or `src/server/knowledge/` (structural check, §2 rule 1).
8. `src/server/knowledge/bundle.ts` and `local-json-provider.ts` are byte-identical to their Sprint 3/4 committed state — this sprint changes zero runtime code.
9. `build.ts` writes only under `data/knowledge-builds/`; no file this sprint touches `data/knowledge/bundle-v0.1.0.json` (decision 1) or invokes `knowledge:promote` (decision 2).
10. `build.ts` output is accompanied by a manifest (§12) whose `recordCounts`/`sourceCount`/`lockedRecordCount`/`checksum` are independently recomputable from the same input records.
11. An `ai-assisted` record with an unverified `sourceRefs` entry fails to reach `red-teamed` (schema-level, per §1.2).
12. `validate.ts` prints (not fails on) a governance warning when `singleOperatorMode: true` and `authorId === reviewerId` for a given record.
13. The pilot data package (§7) reaches at least `red-teamed` status through the real lifecycle (not hand-edited) and builds into a valid bundle artifact; final promotion to `locked` is a genuine human Lock Authority decision the Product Owner makes after reviewing the actual pilot content, not something this implementation performs on their behalf (see §7 note).

---

## 7. Small Pilot Data Package — scope, explicitly bounded

Per your instruction, this is proof the pipeline works, not the start of
mass content generation:

- **1 source registry** with 2-3 entries (at least one `original-synthesis`, at least one `ai-assisted-draft` marked entry to prove the category is real, not just declared in a schema).
- **6 new `pairRelation` records** (beyond the 8 already in `bundle-v0.1.0.json`, within the decided 5-8 range), each carried through the real lifecycle with real actor ids: `authorId: 'umit'`, `reviewerId: 'umit'` (separate review run, `singleOperatorMode: true`), `redTeamActorId: 'claude'` (genuine adversarial pass, not a rubber stamp).
- **0 new `positionRule`/`domainModifier`/`personaModifier`/`safetyConstraint` records required** for the pilot to prove the pipeline — the existing 3/2/3/9 entries in `bundle-v0.1.0.json` are sufficient evidence that the pipeline handles all 5 `recordType`s (the schema/build logic is generic across them; the pilot only needs to *exercise* one type end-to-end plus *validate* the others pass through unchanged).
- **Explicitly not attempted:** the full pair-relation matrix (462 relations for all 22×21 ordered pairs), a real external NotebookLM research session, or any citation to an actual published tarot text (the pilot's sources are structurally real but content-wise a placeholder, same spirit as Sprint 4's design-token placeholders).
- **Stops at `red-teamed`, not `locked`.** Per §1.2/§3's own rule, `lockAuthorityId` must be a genuine named human decision — Claude carrying the pilot's 6 records all the way to `locked` on the Product Owner's behalf would be simulating the exact human sign-off this sprint exists to make un-fakeable. The implementation runs the pilot through `draft → reviewed → red-teamed` for real and stops there; locking the reviewed content is a decision left to the Product Owner after reading it, either by running `transition.ts --to locked --actorId umit` themselves or by explicitly directing it be run.

---

## 8. Test Matrix

| # | Test | Verifies |
|---|---|---|
| 1 | `KnowledgeRecordSchema` accepts a valid `draft` record with `draftOrigin: 'ai-assisted', aiTool: 'notebooklm'` | AI-assisted drafting is legitimate at draft stage |
| 2 | `KnowledgeRecordSchema` rejects `status: 'reviewed'` with no `reviewerId` | Review requires a named actor |
| 3 | `KnowledgeRecordSchema` rejects `status: 'locked'` with `lockAuthorityId: 'claude'` | AI actor cannot self-grant locked status - the literal governance rule this sprint was named for |
| 3b | `KnowledgeRecordSchema` **accepts** `status: 'red-teamed'` with `redTeamActorId: 'claude'` | Claude is a sanctioned Red Team actor - the field-scoped rule, not an identity ban |
| 3c | `KnowledgeRecordSchema` rejects an `ai-assisted` record reaching `red-teamed` with a `sourceRefs` entry absent from `sourceVerifications` | Per-source verification gate before red-teamed |
| 4 | `KnowledgeRecordSchema` rejects `status: 'locked'` with `sourceRefs: []` | Citation integrity at lock time |
| 5 | `KnowledgeRecordSchema` accepts `status: 'locked'` with `reviewerId`/`redTeamActorId`/`lockAuthorityId` all set to named humans and non-empty `sourceRefs` | The valid, intended path works |
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
| 17 | End-to-end: pilot's 6 pair relations, run through the real lifecycle to `red-teamed`, produce a pilot artifact that `KnowledgeBundleSchema.safeParse` accepts and `LocalJsonKnowledgeProvider` (unmodified, pointed at the pilot artifact in a test, not at `BUNDLE_PATH`) can resolve context from for a real `DeterministicReading` | Whole pipeline proven against the actual existing consumer, not just its schema |
| 18 | `validate.ts`, run against a fixture with `singleOperatorMode: true` and `authorId === reviewerId`, prints a warning and still exits 0 | Governance warning is visible but non-blocking, per decision 3 |
| 19 | `build.ts`'s manifest, recomputed independently from the same locked records (record counts, source count, checksum), matches the manifest the build step wrote | Manifest isn't just emitted, it's verifiably correct |
| 20 | Structural check: `scripts/knowledge-authoring/promote.ts` is the only file in the repo that writes under `data/knowledge/`; `build.ts` contains no reference to that path | Build/promote separation is structural, per §2 rule 5 |
| 21 | `promote.ts`, pointed at a scratch copy of `data/knowledge/` and fed a build with an intentionally broken record, exits non-zero and leaves the scratch directory byte-identical to before the run | Atomic, all-or-nothing promotion - failure touches nothing |
| 22 | `promote.ts` run this sprint: **never**, against the real `data/knowledge/` - the pilot's evidence is the build artifact and tests 20-21, not a live promotion | Decision 1/2: pilot proves the pipeline, doesn't ship content |

---

## 9. Explicitly Deferred

- Full 462-relation pair matrix
- Real NotebookLM research session / real external source ingestion
- Citation to actual published tarot texts
- Admin UI for authoring/review/lock (this sprint's workflow is file-edit + script, same tier of "functional, not polished" as Sprint 4's shell UI)
- **Actually running** `knowledge:promote` against the real `data/knowledge/` bundle — the command is built and tested this sprint (decision 2), but invoking it to make pilot content live is explicitly out of scope (decision 1)
- Any change to `src/server/knowledge/` or `src/server/reading-engine/` runtime code
- Positional/domain/persona/safety-constraint content expansion beyond what already exists (pilot only adds pair relations, per §7)
- A second human Red Team actor — this pilot uses Claude for Red Team by explicit decision 4; production knowledge sets need a real second person (Product Owner's own long-term note in the decision)
- Locking the pilot's 6 pair relations — reaches `red-teamed`, stops there; `locked` is the Product Owner's own decision (§7 note)

---

## 10. Open Questions — as originally asked, now resolved

1. **Bundle promotion.** *Resolved by decision 1/2:* pilot output stays a separate artifact (`data/knowledge-builds/pilot/knowledge-bundle.v0.1.0.json`); a separate atomic `knowledge:promote` command is the only path to the live bundle, and it is not invoked this sprint.
2. **Reviewer/red-teamer identity for the pilot.** *Resolved by decision 3/4:* `authorId: 'umit'`, `reviewerId: 'umit'` via a genuinely separate review run (`singleOperatorMode: true`, non-blocking warning surfaced), `redTeamActorId: 'claude'` for real adversarial review, `lockAuthorityId` reserved for the Product Owner's own decision, never automated.
3. **CSV format.** *Resolved by decision 5/6:* two-layer column structure (common envelope + per-`recordType` payload columns) in separate files per `recordType`; CSV is ingestion-only, JSON is canonical — see §11.

---

## 11. CSV Ingestion Format (decision 5/6)

CSV is **never** the canonical authoring format — it exists only so a
human editor can work in a spreadsheet. The real flow:

```
pair_relations.csv (etc.)
        │
        ▼
scripts/knowledge-authoring/csv-parser.ts   (strict parser: fixed column set, JSON-array cells)
        │
        ▼
normalized in-memory KnowledgeRecord shape
        │
        ▼
KnowledgeRecordSchema.safeParse()           (same validation as JSON-sourced ingestion)
        │
        ▼
data/knowledge-authoring/records/*.json     (canonical authoring store - CSV is discarded after ingest)
```

One CSV file per `recordType` (not one file trying to hold every shape).
Each file's columns are the common envelope columns plus that type's
payload columns:

**Common envelope columns** (present in every `*.csv` file):
```
record_id, status, author_id, reviewer_id, red_team_actor_id,
lock_authority_id, draft_origin, ai_tool, source_refs, source_verifications,
created_at, reviewed_at, red_teamed_at, locked_at, notes
```

**Payload columns, per file:**
```
pair_relations.csv:    previous_card_id, focus_card_id, relation_type, semantic_effects, warnings
position_rules.csv:    position, spread, emphasis, framing_guidance
domain_modifiers.csv:  domain, emphasis_keywords, caution_notes
persona_modifiers.csv: persona, tone_guidance, depth_guidance
safety_constraints.csv: flag, action, disclaimer_text
```

List-valued cells (`semantic_effects`, `warnings`, `source_refs`,
`source_verifications`, `emphasis_keywords`, `caution_notes`) hold a JSON
array as the cell's text, quoted per CSV escaping rules, e.g.:

```csv
record_id,...,semantic_effects,warnings,...
pair-02-hp-09-hermit,...,"[""İçe dönük bir sezgisel süreç derinleşiyor.""]","[]",...
```

This is uglier than comma-flattening but loses no data — a semantic
effect that itself contains a comma doesn't get silently split. The
parser (`csv-parser.ts`) rejects a cell that fails to parse as valid JSON
for these columns rather than guessing.

---

## 12. Build Manifest (additional binding requirement)

Every artifact `build.ts` (or `promote.ts`) produces ships with a sibling
`manifest.json`:

```json
{
  "knowledgeVersion": "0.1.0",
  "builtAt": "2026-07-23T00:00:00Z",
  "recordCounts": { "pairRelations": 6, "positionRules": 0, "domainModifiers": 0, "personaModifiers": 0, "safetyConstraints": 0 },
  "sourceCount": 4,
  "lockedRecordCount": 0,
  "schemaVersion": "1.0.0",
  "checksum": "sha256:..."
}
```

`checksum` is a SHA-256 of the built bundle JSON's canonical
(key-sorted) serialization — recomputable independently (test 19, §8) so
the manifest is evidence, not just a log line. `lockedRecordCount` for
this pilot's build is whatever count is true at the moment `build.ts`
runs — expected to read 0 until/unless the Product Owner locks records
themselves (§7 note), since `build.ts` only ever reads `locked` records
into the bundle at all.

---

## Next Step

Plan is APPROVED (GO given). Implementation proceeds per the schemas,
pipeline boundaries, CSV format, and manifest above. The one thing
implementation does **not** do on the Product Owner's behalf: set
`lockAuthorityId` on the pilot's 6 pair relations. That is presented back
for a real decision once the red-teamed content exists to review.
