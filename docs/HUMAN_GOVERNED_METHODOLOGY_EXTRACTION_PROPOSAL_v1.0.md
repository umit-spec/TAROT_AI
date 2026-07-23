# Human-Governed Methodology Extraction — Proposal v1.0

**Date:** 2026-07-23
**Status:** PROPOSAL (docs-only). **No runtime code, no ingestion, no OCR, no embeddings, no vector store, no retrieval over the PDF.**
**Supersedes:** `docs/BOOK_RAG_INGESTION_PROPOSAL_v1.0.md` (Book-RAG track withdrawn by the Product Owner).
**Governed by:** ADR-011, ADR-012, Sprint 5 Knowledge Authoring Pipeline (`data/knowledge-authoring/**`, `src/types/knowledge-authoring.ts`).
**Legal framing (Product Owner):** copyright protects the *expression*, not the abstract idea/method. Humans may read the book and derive **abstract principles**; those may be **independently researched, re-written from scratch, multi-source-verified**, and submitted to the existing knowledge lifecycle. The book's *text* never enters storage, retrieval, or runtime. This is a general framing, not a legal opinion — before commercial launch, an IP lawyer should review the concrete flow.

---

## 0. What changed from v1.0, and why

The prior proposal treated the book as a **RAG source** (OCR → chunks → embeddings → retrieval). The Product Owner has withdrawn that: reproduction/adaptation/digital-storage rights belong to the author, and even an "independent product built by processing the author's text" can fall under the adaptation (*işleme*) right. So the model changes from **"ingest the book"** to **"a human learns from the book and writes original product principles."** The unit of work is no longer a *chunk of the book*; it is a **Lesson** — an abstract principle in the project's own words, standing on independent sources.

## 1. Binding rules (all 12, restated as the contract this proposal implements)

1. **No OCR or page transcription is stored.** No `.txt`, no chunk store, no raw-text ref anywhere in the repo.
2. **No embeddings / vector index** built from the book.
3. **The PDF is never made available to the runtime model.** The model does not query, receive, or cite the PDF.
4. **No reproduction or close paraphrase** of card entries, chapter structures, slogans, "Kart der ki/fısıldar" lines, or distinctive expressive passages.
5. **Extract only abstract methodologies** — reflective intention formation, Past/Present/Possible-Direction spread logic, user agency, non-prophecy framing (and similar general principles).
6. **Every Lesson written from scratch**, not following the source's paragraph structure or order.
7. **Each Lesson checked against ≥1 independent source.**
8. **The book may never be the sole authority** for a locked record.
9. **A similarity review** checks distinctive-phrase and structural overlap.
10. **AI may draft and red-team; only the Product Owner may lock.**
11. **MVP rules unchanged:** Major Arcana only, upright only, no yes/no verdicts, no reversed meanings, canonical card IDs, Reading Engine is the sole draw authority.
12. **Book illustrations (the RWS plates) are never extracted or used.**

## 2. The Lesson — extraction schema (proposed, docs-only)

A new upstream governance artifact, `data/knowledge-authoring/lessons/*.json`, distinct from and feeding the existing `KnowledgeRecord` pipeline. It stores **the project's original principle**, never book text.

```jsonc
{
  "lessonId": "lesson-non-prophecy-framing-001",
  "principleCategory": "non-prophecy-framing",   // intention-formation | spread-position-logic | user-agency | non-prophecy-framing | other
  "abstractPrinciple": "One-line statement of the general idea, in the project's own words.",
  "originalStatement": "The full product principle, written from scratch — the artifact that will inform a knowledge record. Must not track the book's wording or structure.",
  "independentSources": [                          // >= 1 REQUIRED, independent of the book
    { "sourceId": "waite-pictorial-key-1910", "note": "how this source supports the principle" }
  ],
  "bookLineage": {                                 // OPTIONAL, transparency only, never sole backing
    "sourceId": "baslangic-tarot-rehberi-2025",
    "extractionType": "abstract-principle-only",   // asserts: no text stored, no structure copied
    "storedText": false,
    "imageUsed": false
  },
  "similarityReview": {                            // §5, human-performed
    "reviewedBy": "<named human>",
    "reviewedAt": "<iso8601>",
    "distinctivePhraseOverlap": "none",            // none | flagged
    "structuralOverlap": "none",                   // none | flagged
    "verdict": "original"                          // original | revise
  },
  "targetRecordType": "safetyConstraint",          // which knowledge record this will inform, if any
  "lifecycle": { "...": "reuses LifecycleSchema — draft→reviewed→red-teamed→locked" },
  "createdAt": "...", "updatedAt": "..."
}
```

**Validator rules (proposed):** a Lesson cannot advance past `draft` unless (a) `independentSources.length >= 1` with a human `sourceVerification`, (b) `similarityReview.verdict === "original"`, (c) if `bookLineage` is present, it is **never the only entry backing the eventual record** (rule 8), and (d) `storedText:false`/`imageUsed:false` are asserted. There is deliberately **no field that can hold book text** — the schema makes rule 1 structural, not a promise.

## 3. Human note-taking workflow

1. **Read (human, offline).** A person reads the relevant book section on their own device. No extraction tooling touches the PDF; the repo gains no file derived from it.
2. **Identify an abstract principle.** The human records *the idea*, not the sentence (e.g., "the future position should be framed as conditional possibility, not a verdict").
3. **Set the book aside; write from scratch.** The `originalStatement` is composed without the book open, in the product's voice, not mirroring its paragraph flow (rule 6). This "close the book, then write" step is the practical guard against subconscious paraphrase.
4. **Corroborate independently (§4).**
5. **Similarity/originality review (§5).**
6. **Author into a knowledge record** via the existing Sprint 5 lifecycle (§6).
7. **Product Owner lock (§6).**

No step produces a stored copy of book text or images. Claude may assist at steps 2/3 (drafting) and act as Red Team at step 5's adversarial pass, but the *reading* and the human `verifiedBy`/`reviewedBy`/lock identities are humans (schema-enforced via `isAiActorId`).

## 4. Independent-source verification

- Each Lesson must be corroborated by **≥1 source independent of the book** — e.g., the already-registered public-domain `waite-pictorial-key-1910`, the academic `pollack-seventy-eight-degrees-1980`, or `tarot-ai-original-synthesis-v1`.
- Corroboration is recorded as a `SourceVerification` (`verifiedBy` a named human, `verifiedAt`), reusing the existing mechanism.
- **Rationale:** very general tarot meanings ("the Hermit relates to introspection," "the Star relates to hope/renewal") are common across the tradition and are *not* unique to this book — so they should be evidenced from an independent/primary source, which also removes any dependence on the book's expression. If a principle can *only* be sourced to this book, that is a red flag that it may be book-specific expression, and it does not proceed.

## 5. Originality and similarity review

A human review (Claude may pre-screen, human decides) that checks, before a Lesson can inform a locked record:
- **Distinctive-phrase overlap:** the `originalStatement` shares no distinctive wording, metaphors, or "Kart der ki/fısıldar"-style slogans with the book. General domain terms ("introspection," "renewal") are fine; distinctive turns of phrase are not.
- **Structural overlap:** the statement does not replicate the book's per-card template or its chapter/section ordering (rule 6).
- **Verdict:** `original` (proceed) or `revise` (rewrite further from the source). Recorded in `similarityReview`.
- A lightweight assistive check (n-gram/phrase overlap between the `originalStatement` and *the human's private notes*, never against stored book text) may support the reviewer, but the decision is human. No book text is stored to run this against — the check operates on the project's own drafts.

## 6. Governance lifecycle

Unchanged from Sprint 5, applied to Lessons and the records they inform:
- `draft → reviewed → red-teamed → locked`.
- `reviewerId` and `lockAuthorityId` must be **named humans** (schema-enforced).
- **Only the Product Owner authorizes `locked`.** Claude may author drafts (`draftOrigin: ai-assisted`, `aiTool: claude`) and serve as Red Team (`redTeamActorId: "claude"` — the one sanctioned AI field).
- AI-assisted origin **blocks red-teamed/locked** until every cited source is human-verified (existing rule) — this forces §4 before anything locks.
- **Book never sole backing** (rule 8): if `bookLineage` is the only citation, the record cannot lock; an independent source must carry the evidentiary weight.
- Locked records feed a **candidate knowledge build**, promoted to the live bundle only by an atomic, PO-gated step (Sprint 5) — never edited into the live bundle directly.

## 7. Allowed vs prohibited (examples)

| # | Prohibited (do NOT do) | Allowed (original product principle) |
|---|---|---|
| A | Reproducing or lightly editing the book's own sentence stating that tarot does not tell the future and the cards help you see your thoughts/feelings. | "A reading is not a verdict about the future; it is a symbolic thinking exercise that helps the user weigh their current conditions, options, and areas of agency." (Different purpose, structure, and wording; independently corroborated.) |
| B | Rewriting each card's entry paragraph-by-paragraph following the book's template. | Authoring a `positionRule`/`personaModifier` in original language, grounded in an independent/primary source + project synthesis, with no per-card template copied. |
| C | Using "Kart der ki…/fısıldar…" slogans with minor changes. | No slogan cloning at all; reflective prompts are written fresh in the product's own voice. |
| D | Systematically reproducing the book's 78-card content. | Staying Major-Arcana-only, upright-only; deriving only abstract methodology, never a card-by-card reproduction. |
| E | Adopting the book's Marseille numbering (Justice 8 / Strength 11). | Keeping the project's canonical RWS ids (`08-strength`, `11-justice`); the book's numbering is not adopted. |

> Note: the prohibited column is described, not quoted — this proposal deliberately does not reprint the book's sentences, consistent with the rules it sets.

## 8. Evidence required before a record may be locked

All of the following, or it stays unlocked:
1. `originalStatement` written from scratch, similarity review verdict `original` (no distinctive-phrase/structural overlap).
2. ≥1 **independent** source, human-`verified`, carrying the evidentiary weight (book never sole).
3. Red-team pass (Claude permitted) with the crisis/red-line/non-prophecy checks.
4. **Product Owner lock** (`lockAuthorityId` = the PO, a named human).
5. Assertions on file: `storedText:false`, `imageUsed:false` — no book text or image anywhere in the repo or pipeline.
6. MVP-conformance: Major-Arcana-only, upright-only, no yes/no, canonical ids (rule 11).

## 9. Repository impact (proposed, not built)

- **New:** `data/knowledge-authoring/lessons/*.json` (original principles only); a `MethodologyLesson` schema in `src/types/knowledge-authoring.ts`; validator extensions (independent-source, similarity-verdict, no-sole-book, storedText/imageUsed assertions); optionally register the book in `sources.json` **for lineage transparency only** with `rights.permissionStatus` noted and `abstract-principle-only` usage.
- **Explicitly NOT added:** any OCR script, chunk store, embedding index, vector DB, retrieval code, or PDF-serving path. (v1.0's `book-ingest` scripts and `book-chunks` store are **withdrawn**.)
- **Unchanged/guaranteed:** runtime narration-only, upright-only, Major-Arcana-only, Reading Engine draw authority, crisis routing, live bundle until PO promotion.

## 10. Evaluation plan

Add cases to the Sprint 6 harness (kept separate from S2's pending live-run evidence) asserting: the model never emits reversed meanings, Minor Arcana, yes/no verdicts, or dates; never reproduces book-distinctive phrasing (a red-team probe); and uses canonical card identity, not the book's numbering. Cases carry honest `authoredBy: "claude"` disclosure until human-reviewed.

## 11. Rollback plan

Lessons and derived records land unlocked, in a candidate build, never in the live bundle until PO promotion. Rollback = don't promote / revert the candidate. Because **no book text or image is ever stored**, there is nothing to purge if the approach is abandoned — only the project's own original principles exist, each standing on independent sources.

---

## Open Product-Owner decisions

1. **Register the book at all?** List it in `sources.json` as `bookLineage` (transparency, `abstract-principle-only`), or keep it entirely off-repo as private background reading and cite only independent sources? (Recommendation: register with clear rights/usage notes, for honest lineage — but never as sole backing.)
2. **Adopt the `MethodologyLesson` schema** as proposed, or keep lessons as plain reviewed notes feeding existing record types without a new schema?
3. **Who reads + verifies + reviews** — Selin Naz Çokyaşar (pending agreement) or a named alternative? (Reading and the human review identities cannot be AI.)
4. **Sequencing:** independent of S1/S2/S3; begin after the G1 gate, or run the (low-risk, book-text-free) lesson extraction in parallel now?
5. Confirm the standing constraints (recommended): book numbering **not** adopted; reversed/Minor **out of runtime**; illustrations **never** used; book **never** sole authority.

## Status

**NOT EXECUTED** — proposal only. No book text or image is stored, embedded,
retrieved, or served; no runtime code; live bundle untouched.
