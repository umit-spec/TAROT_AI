# Methodology Extraction — Pre-G1 Scope Correction Report

**Date:** 2026-07-23
**Branch (active):** `claude/insight-engine-investor-audit-bkofgr`
**Quarantine branch:** `hold/methodology-extraction-pre-g1` @ `b0d8c85`
**Status:** **REVISE — UNAUTHORIZED EARLY IMPLEMENTATION**

---

## Reason

The Human-Governed Methodology Extraction implementation exceeded the Product
Owner's explicitly approved pre-G1 scope. It was technically disciplined and
preserved every product safety rule (no runtime change, no locked records, no
promotion, no OCR/text/image storage) — but the **sequencing and authority
chain were violated**, and keeping decisions genuinely binding is the point of
this correction.

**Pre-G1 authorization covered only:**
- preserving the approved proposal,
- adding the lineage-only source registry entry,
- optionally recording 3–5 lesson titles as backlog items.

**It did NOT authorize:**
- drafting lesson content,
- selecting or asserting independent supporting sources,
- implementing lesson lifecycle tooling,
- implementing validation scripts,
- adding lesson-specific tests,
- claiming execution completion.

## Corrective action taken

1. **Quarantined** the full prior implementation on `hold/methodology-extraction-pre-g1`
   (@ `b0d8c85`, pushed). Labeled as research draft / future-reconsideration
   prototype — **not** accepted product output. Nothing was deleted; the work
   is preserved for reconsideration after an explicit G1 GO.
2. **Reverted from the active integration line** (this correction commit):
   - the five drafted methodology lesson texts (`data/knowledge-authoring/lessons/methodologyLessons.json`),
   - the independent-source proposal data within them,
   - the lesson lifecycle implementation (`MethodologyLessonSchema` and its
     sub-schemas in `src/types/knowledge-authoring.ts`),
   - the `validate-lessons.ts` tooling and its `loadMethodologyLessons()` /
     `lessonsPath()` helpers,
   - the `knowledge:validate-lessons` package script,
   - the lesson-specific tests,
   - the `IMPLEMENTATION COMPLETE` evidence report.
3. **Kept on the active line** (within pre-G1 authorization):
   - the approved proposal (`docs/HUMAN_GOVERNED_METHODOLOGY_EXTRACTION_PROPOSAL_v1.0.md`),
   - the lineage-only source registry entry (`baslangic-tarot-rehberi-2025`),
   - `rights` metadata support (`SourceRightsSchema` + optional `SourceSchema.rights`),
   - up to five lesson **titles** as backlog only (`docs/METHODOLOGY_EXTRACTION_BACKLOG.md`).
   - (A minimal `SourceRights` schema test was retained/added to
     `knowledge-authoring.test.ts` to cover the *kept* rights metadata — not
     lesson tooling.)

## Confirmations

- **No runtime impact.** Build unchanged (3 routes: `/`, `/_not-found`, `ƒ /api/readings`).
- **No locked records.** Nothing reached `reviewed`/`red-teamed`/`locked`.
- **No bundle promotion.** Live `data/knowledge/bundle-v0.1.0.json` untouched.
- **No OCR / text / image storage.** None on the active line; the quarantine
  branch also stores no book text or image (its lessons are original paraphrase
  drafts only).

## Resume conditions (all required before this track restarts)

1. S2 genuine local Anthropic evaluation is complete.
2. Independent human subset scoring is complete.
3. **G1 is explicitly recorded as GO.**

Only then may the quarantined work be reconsidered and re-authorized onto the
active line.

## Corrected project status

- **S1: APPROVED.**
- **S2: APPROVED — highest priority.**
- **S3: APPROVED.**
- **Methodology Extraction: HOLD until G1.**

(The earlier phrasing "S1/S2/S3 still pending go/answers" was incorrect — they
were already approved with locked decisions. Open *operational* inputs for
those sprints — e.g. the Vercel project, the API key run, the second scorer —
remain, but the sprints themselves are GO.)
