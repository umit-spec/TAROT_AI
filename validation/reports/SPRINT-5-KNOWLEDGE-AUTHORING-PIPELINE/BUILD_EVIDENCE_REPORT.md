# Sprint 5 Build Evidence Report

**Date:** 2026-07-23
**Branch:** `feat/major-arcana-asset-migration` (implementation history); active development continues on `feat/insight-engine-milestone-3` per ADR-013
**Commit:** `7b2ab68` (implementation), following plan commit `3f67b61`
**Status:** Superseded by `HUMAN_LOCK_REVIEW_PACKET.md` (per-record
review) and `CLOSURE_EVIDENCE_REPORT.md` (final lock/revise decisions,
pilot build evidence). **Sprint 5 closed: PASS WITH DOCUMENTED DEBT** —
see `CLOSURE_EVIDENCE_REPORT.md` for the closing evidence. This document
remains as the original implementation-evidence record; it is kept
unedited below except for this status header.

---

## 1. Scope

**Sprint 5 — Knowledge Authoring Pipeline & Source Governance**

Governed by `docs/SPRINT_5_KNOWLEDGE_AUTHORING_PIPELINE_PLAN.md` (APPROVED
2026-07-23, all 3 original open questions plus 2 additional binding
requirements resolved by the Product Owner's GO decision). Delivers the
authoring/review/lock machinery ADR-011 deferred, not the 462-relation
matrix itself:

1. `src/types/knowledge-authoring.ts` — source registry, `ActorRole`-typed
   lifecycle, `draftOrigin`/`aiTool` provenance tracking, per-source
   verification gating, build manifest schema.
2. `scripts/knowledge-authoring/{ingest,validate,check-conflicts,
   transition,build,promote}.ts` + `lib/{paths,io,conflicts,csv,checksum}.ts`.
3. `data/knowledge-authoring/` — source registry (2 sources) + 6 new
   `pairRelation` records carried through the real lifecycle.
4. `data/knowledge-builds/pilot/` — the pilot build artifact + manifest.
5. 26 new tests, `src/__tests__/unit/knowledge-authoring.test.ts`.

---

## 2. Acceptance Evidence — Build Gates

Re-run from the working tree at commit `7b2ab68`.

| Command | Exit Code | Result |
|---|---|---|
| `npm run lint` | 0 | 0 errors |
| `npm run typecheck` | 0 | 0 type errors |
| `npm run test` | 0 | 10 test files, **132/132** tests passed (106 pre-existing + 26 new) |
| `npm run build` | 0 | Same 3 routes as Sprint 4 (`/`, `/_not-found`, `/api/readings`) — unaffected |
| `tsx scripts/knowledge-authoring/validate.ts` | 0 | 6 records validated against 2 sources; 6 non-blocking governance warnings printed (see §4) |
| `tsx scripts/knowledge-authoring/check-conflicts.ts` | 0 | No build-blocking conflicts |
| `tsx scripts/knowledge-authoring/build.ts --version 0.1.0` | 0 | Pilot artifact written to `data/knowledge-builds/pilot/`; `lockedRecordCount: 0` (correct — see §6) |

---

## 3. Contract Guarantees — Verified Live, Not Just Asserted

| # | Guarantee | Evidence |
|---|---|---|
| 1 | `lockAuthorityId` can never be an AI actor | Ran `transition.ts --recordType pairRelation --recordId pair-02-high-priestess-09-hermit --to locked --actorId claude` against the real authoring store. **Rejected** with `lockAuthorityId can never be an AI actor...`, exit 1, file byte-identical before/after (diffed). |
| 2 | `redTeamActorId: 'claude'` **is** permitted (field-scoped, not identity-scoped) | All 6 pilot records carry `redTeamActorId: "claude"` at `red-teamed` status and pass `KnowledgeRecordSchema.safeParse`. Automated as test `#3b`. |
| 3 | AI-assisted content cannot reach `red-teamed` with an unverified source | Automated tests `#3c` (rejects unverified) and `#3c positive` (accepts once verified). The 2 pilot records with `draftOrigin: "ai-assisted"` each carry a `sourceVerifications` entry dated after their review session, before red-teaming. |
| 4 | `authorId === reviewerId` warns but never blocks | `validate.ts` printed 6 governance warnings (one per pilot record, all `singleOperatorMode: true`) and still exited 0. Automated as part of the sandbox integration suite (`#17/#18`). |
| 5 | `build.ts` never writes under `data/knowledge/` | `git status --short data/knowledge/` empty after every build run this sprint. Structural test greps `build.ts` for any write call (`writeFileSync`/`mkdirSync`/`renameSync`) scoped to `liveKnowledgeDir()` and finds none. |
| 6 | `promote.ts` is atomic — any failure leaves the target untouched | Manual sandbox run: promoted a good build to a scratch `targetDir`, then injected a conflicting locked record and re-ran promote. Second run failed (conflict detected during `build()`), and the scratch bundle file was **byte-identical** before/after (`sha256sum` compared). Automated as test `#21/#22`. |
| 7 | `bundle.ts` / `local-json-provider.ts` are untouched | `git diff --stat` against both files: empty, this sprint and every prior one. |
| 8 | Pipeline code is never imported by runtime code | Structural test walks `src/app/`, `src/server/reading-engine/`, `src/server/knowledge/` and asserts no file matches `scripts/knowledge-authoring`. |
| 9 | Manifest checksum is independently recomputable | `sha256Of` is a pure function over key-sorted JSON; tests confirm order-independence and change-sensitivity. The pilot manifest's checksum was recomputed by re-running `build.ts` twice from the same input and comparing — identical both times. |

---

## 4. Red Team Findings (Claude, adversarial review pass, 2026-07-23)

Per the Product Owner's decision, Claude's role in this pilot was
adversarial review only — contradictions, weak sourcing, overreach,
ethical risk — never lock authority. Reviewing the 6 candidate pair
relations at `reviewed` status surfaced two real issues, both fixed
before marking `red-teamed`:

1. **`17-star → 19-sun` (reinforces)** — original wording asserted hope
   "olgunlaşıyor" (is maturing) into clarity/vitality as if guaranteed.
   Two traditionally "positive" cards paired this way risks reading as a
   promised good outcome — a toxic-positivity/overreach pattern this
   project's ethical constraints exist to avoid. **Revised** to
   "olgunlaşma potansiyeli taşıyor" (carries potential to mature) and
   added an explicit warning against implying a guaranteed happy outcome.
2. **`18-moon → 20-judgement` (resolves)** — original wording implied
   ambiguity/anxiety gets resolved by the Judgement moment. Given the
   Moon's anxiety-adjacent symbolism, "resolves" risks overstating
   psychological resolution for a sensitive topic. **Revised** to "kısmen
   görünür ve ele alınabilir hale gelme potansiyeli" (potential to become
   partly visible/manageable) and added a warning against implying a
   definitive resolution or diagnosis.

The other 4 records (High Priestess→Hermit, Chariot→Strength, Wheel of
Fortune→Hanged Man, Empress→Hierophant) were reviewed and found to
already carry adequate hedging language; no changes were made to them.

This is the literal content of what "Claude as Red Team" produces:
findings that changed the actual text, not a status flip.

---

## 5. Pilot Data Summary

| | |
|---|---|
| New `pairRelation` records | 6 (within the decided 5–8 range) |
| Sources registered | 2 (`tarot-ai-original-synthesis-v1`, `notebooklm-major-arcana-research-2026-07`) |
| `draftOrigin: "ai-assisted"` records | 2 (both individually source-verified before red-teaming) |
| `draftOrigin: "human"` records | 4 |
| Lifecycle stage reached | `red-teamed` for all 6 (see §6 for why not `locked`) |
| Other 4 record types | 0 new records — existing bundle entries pass through unchanged, proving the pipeline is generic across all 5 `recordType`s without requiring new content in each |

---

## 6. What Is Deliberately Not Done This Sprint

- **The 6 pilot records are not `locked`.** `lockAuthorityId` can
  structurally only ever be a named human, never Claude or any automated
  actor. Setting it on the Product Owner's behalf — even under a general
  "proceed with implementation" authorization — would mean this
  implementation simulating the exact human sign-off this sprint exists
  to make unfakeable. The records are at `red-teamed`, reviewed and
  red-team-corrected, ready for the Product Owner to either run
  `npm run knowledge:transition -- --recordType pairRelation --recordId <id> --to locked --actorId umit`
  themselves, or explicitly direct it per record.
- **`knowledge:promote` was never run against the real
  `data/knowledge/` directory.** Every invocation this sprint targeted a
  scratch `--targetDir` (manual verification, §3.6, and the automated
  test). `data/knowledge/bundle-v0.1.0.json` is unchanged — confirmed via
  `git status --short data/knowledge/` returning empty throughout.
- **No promotion decision is requested for this sprint** — decision 1/2
  already resolved this: the pilot proves the pipeline, it does not ship
  content.

---

## 7. Next Step

Sprint 5's machinery is complete and evidenced. What remains is not
implementation work — it is the Product Owner's own review:

1. Read `HUMAN_LOCK_REVIEW_PACKET.md` (same directory) — a per-record
   packet (card order, relation type, semantic effect, warnings, sources,
   what the sources actually support, the Red Team finding and fix made,
   remaining risk, a non-binding recommended decision) for all 6 pilot
   pair relations. That second, checklist-driven pass found one issue
   the first Red Team pass missed (`pair-10-wheel-of-fortune-12-hanged-man`'s
   deterministic tense) — recorded there, not hidden.
2. Decide per record, individually — no batch `--all` lock command
   exists or will be added:
   ```bash
   npm run knowledge:transition -- \
     --recordType pairRelation --recordId <id> \
     --to locked --actorId umit
   ```
3. Once lock decisions are made, a pilot build (`knowledge:build`) from
   the resulting locked records, its checksum, and a runtime
   compatibility check get their own follow-up evidence report — Sprint 5
   closes as PASS WITH DOCUMENTED DEBT only then.
4. Promotion to the real `data/knowledge/` bundle stays a fully separate,
   later checkpoint even after locking — not bundled into this step.
