# Human-Governed Methodology Extraction — Build Evidence Report

**Date:** 2026-07-23
**Branch:** `claude/insight-engine-investor-audit-bkofgr`
**Governed by:** `docs/HUMAN_GOVERNED_METHODOLOGY_EXTRACTION_PROPOSAL_v1.0.md` (APPROVED — "register the book as lineage-only and run extraction in parallel now", Product Owner, 2026-07-23)
**Status:** **IMPLEMENTATION COMPLETE — LESSONS DRAFTED, AWAITING HUMAN REVIEW + PRODUCT-OWNER LOCK.** Not a PASS in the sense of locked knowledge — by design, nothing is locked and nothing is promoted.

---

## 1. Scope delivered (offline authoring pipeline only — no runtime code)

1. **Source rights schema** — `SourceSchema` gains an optional `rights` block (`SourceRightsSchema`: rightsHolder, permissionStatus, permissionEvidence, usageScope, allowsRetrievalStorage). Optional, so the four existing sources are unaffected (test-proven).
2. **Book registered lineage-only** — `data/knowledge-authoring/sources.json` +1 entry `baslangic-tarot-rehberi-2025`, `rights.permissionStatus: "unverified"`, `usageScope: "abstract-principle-lineage-only"`, `allowsRetrievalStorage: false`, with a note recording: no text/image stored/OCR'd/embedded/retrieved/served; never sole backing; Marseille numbering NOT adopted; reversed/Minor/yes-no out of scope; RWS plates never used.
3. **MethodologyLesson schema** — `MethodologyLessonSchema` (+ `PrincipleCategorySchema`, `BookLineageSchema`, `IndependentSourceRefSchema`, `SimilarityReviewSchema`) in `src/types/knowledge-authoring.ts`. Structurally enforces the binding rules (see §3).
4. **Five Claude-authored DRAFT lessons** — `data/knowledge-authoring/lessons/methodologyLessons.json`: non-prophecy framing, intention formation, three-card position logic, user agency, conditional-future language. Each `originalStatement` written from scratch in the project voice; each cites ≥1 independent (non-book) source; book cited as `bookLineage` only.
5. **Lesson loader + validator** — `loadMethodologyLessons()` (io.ts), `lessonsPath()` (paths.ts), `scripts/knowledge-authoring/validate-lessons.ts`, npm script `knowledge:validate-lessons`.
6. **Tests** — `src/__tests__/unit/methodology-lessons.test.ts` (10 tests).

## 2. Acceptance evidence — gates

| Command | Result |
|---|---|
| `npm run lint` | 0 errors |
| `npm run typecheck` | 0 errors |
| `npm run test` | 13 files, **178/178** (168 prior + 10 new), zero regressions |
| `npm run build` | 0 — **same 3 routes** (`/`, `/_not-found`, `ƒ /api/readings`): confirms no runtime change |
| `npm run knowledge:validate-lessons` | 5 lessons validate; all DRAFT; all citations resolve; no lesson relies on the book as sole backing |
| `npm run knowledge:validate` | 6 records + 5 sources still valid (book registration did not break existing validation) |

## 3. Binding rules — how each is enforced (not just asserted)

| Rule | Enforcement |
|---|---|
| 1. No OCR/transcription stored | No such file exists; the schema has **no field that can hold source text**. |
| 2. No embeddings/vector index | None built; none in repo or deps. |
| 3. PDF not available to runtime | No runtime code touched; build unchanged (3 routes); the PDF is not in the repo. |
| 4. No reproduction/close paraphrase | `originalStatement`s written from scratch; a human `similarityReview` (distinctive-phrase + structural overlap) is a hard gate before advancement. |
| 5. Only abstract methodologies | Five lessons are all abstract principles; `principleCategory` constrains scope. |
| 6. Written from scratch, not source structure | Enforced by the similarity-review gate + author discipline; noted per lesson. |
| 7. ≥1 independent source, human-verified | Schema requires ≥1 non-book source; advancement past `draft` requires a human `sourceVerification` of an independent source (test-proven). |
| 8. Book never sole authority | Schema rejects book-only backing; validator re-asserts against the registry (test-proven). |
| 9. Similarity review | `SimilarityReviewSchema`; required + human + `original` verdict at `reviewed`+ (test-proven). |
| 10. AI drafts/red-teams; only PO locks | Shared `LifecycleSchema`: `reviewerId`/`lockAuthorityId` cannot be AI actors; all lessons are `draft`, `authorId: claude`. |
| 11. MVP rules unchanged | No runtime/deck/bundle change; Marseille numbering not imported (canonical RWS ids stand). |
| 12. Illustrations never used | No image extracted; `bookLineage.imageUsed` is a `false` literal. |

## 4. What is deliberately NOT done (honest limitations)

- **No lesson is reviewed, red-teamed, or locked.** All five are `draft`, authored by `claude` (`draftOrigin: ai-assisted`). The similarity review, independent-source verification, and lock are **human/PO actions** and are genuinely pending — not simulated.
- **`independentSources` are proposed corroboration, pending human verification.** `sourceVerifications` is empty on every lesson; the notes say so. Claude did an informal originality pre-screen only — that is not the governed similarity review.
- **No knowledge record created, no bundle change, no promotion.** Lessons are upstream artifacts; converting an approved lesson into a `positionRule`/etc. is later work after human review. The live bundle is untouched.
- **Rights remain `unverified`.** Lineage-only citation of abstract methodology does not reproduce the work, so no license is required for this use — but this is a general framing, and an IP lawyer should review the concrete flow before commercial launch (recorded in the source note and the proposal).

## 5. Next actions (human/PO)

1. A named human verifies each lesson's independent sources actually support its principle (record `sourceVerifications`).
2. A named human performs the governed similarity review (distinctive-phrase + structural overlap) → `original` or `revise`.
3. Claude red-teams; a named human reviews; **the Product Owner locks** approved lessons.
4. Only then: author locked lessons into knowledge records via the existing pipeline, and (separately, atomically) promote.

## 6. Status

**IMPLEMENTATION COMPLETE — LESSONS DRAFTED, AWAITING HUMAN REVIEW + PRODUCT-OWNER LOCK.** No book text or image stored/embedded/retrieved/served; no runtime change; no knowledge locked or promoted; live bundle untouched.
