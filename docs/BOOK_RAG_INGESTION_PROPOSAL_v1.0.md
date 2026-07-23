# Book-Grounded RAG Source — Implementation Proposal v1.0

**Date:** 2026-07-23
**Status:** PROPOSAL (docs-only). **No implementation, no ingestion, no runtime change** until this proposal is approved *and* the copyright blocker (§L) is resolved.
**Subject source:** *Başlangıç Tarot Rehberi — 78 Kartın Yolculuğu*, The Bill Store, 2025 (uploaded PDF, 98 pages, image-based).
**Governed by:** ADR-011 (LLM narration-only), ADR-012 (Knowledge Layer boundary), Sprint 5 Knowledge Authoring Pipeline, `data/knowledge-authoring/**` schemas, Phase 2 execution plan.
**Relationship to Phase 2:** this is a **knowledge-source governance** proposal, not one of the S1/S2/S3 sprints. It touches the same Knowledge Authoring pipeline Sprint 5 built. It does not change S1/S2/S3 scope.

> **Binding framing (Product Owner + this proposal):** the book is a **governed auxiliary reference under source management, not "the single truth that trains the model."** It contains RWS imagery, reversed meanings, yes/no classifications and all 78 cards — most of which the MVP deliberately excludes. It must never be a record's sole evidentiary backing (same rule already applied to the `ai-assisted-draft` NotebookLM source in `sources.json`).

---

## L. LEGAL / COPYRIGHT BLOCKER — read first (P0, blocks everything below)

**This is a hard gate. No page of this book may be ingested, OCR'd into stored
chunks, embedded, or placed in a retrieval index until the Product Owner
confirms, in writing, that the project holds the necessary rights.**

Verified from the book's own copyright page (p3, paraphrased — not reproduced):
- **Rights holder:** The Bill Store, 2025. "Her hakkı saklıdır" (all rights reserved).
- **Explicit restriction:** no part may be reproduced, **stored in a retrieval
  system**, or transmitted electronically (or by any other means) **without the
  publisher's written permission**.
- Registered with the Turkish Ministry of Culture and Tourism (Kayıt No: 2025/14830); printer: Bilal Ofset, Samsun.

Why this is decisive for RAG specifically:
1. **A RAG store IS "a retrieval system."** The restriction names this exact use. Building an embedded/searchable index of the book's text is precisely what the notice forbids without written permission.
2. **Second rights layer — the card images are Rider–Waite–Smith.** Pages 14–16 (and by inspection the Major Arcana set) reproduce the Pamela Colman Smith RWS illustrations (visible plates: THE FOOL, THE MAGICIAN, THE HIGH PRIESTESS). Extracting these images carries independent copyright risk **and** directly violates S1's original-deck requirement (D3). **The book's images must never be extracted or shipped.**

**The only safe path (matches the Product Owner's own guidance):** *after* rights
are verified, do **not** distribute or store the book raw. Instead produce
**page-sourced, short, human-verified, originally re-written** knowledge records
— the project's own words, grounded in (not copied from) specific pages, under
the existing Sprint 5 lifecycle. Facts and methodology are not copyrightable;
the book's *expression* is. This proposal is built entirely around that path.

**Two admissible outcomes of the rights question:**
- **(A) Written permission / license obtained** → proceed to the governed
  paraphrase-and-verify pipeline below (still no raw distribution).
- **(B) No permission** → the book cannot be used as a stored source at all.
  Fallback: rely on the already-registered public-domain sources
  (`waite-pictorial-key-1910`) and original synthesis; optionally use the book
  **once, read-only, by a human** as private background reading that informs
  original writing, with **no digital extraction/storage** — a position the
  Product Owner and, ideally, counsel should confirm is acceptable, because
  even that is arguably constrained by "all rights reserved."

Until the PO selects (A) or (B) in writing, everything below is **NOT EXECUTED**.

---

## 1. Copyright and permission status of the uploaded book

- **Status: UNRESOLVED / high-risk.** Rights held by The Bill Store; all rights reserved; retrieval-system storage explicitly forbidden without written permission (§L).
- **Action required (PO):** obtain written permission/license scoped to *commercial product knowledge-base use + derivative paraphrase*, or select fallback (B).
- **Evidence artifact:** a `rights` record in the source registry (see §5/§6) pointing at the actual permission document; empty/unverified blocks ingestion.
- **Second-human/legal:** ideally counsel confirms the scope of any permission before any storage.

## 2. PDF ingestion and page-level provenance

- **The PDF is image-based** (CorelDRAW export; `pdftotext` yields ~0 characters across sampled pages) — there is **no text layer**; OCR is mandatory (§7).
- **Three numbering systems must be reconciled** (a real provenance risk found during audit): the **PDF physical index (1–98)**, the **printed folio** at page bottom, and the **table-of-contents references** — they are offset (e.g., Budala prints folio "14" but the TOC lists it as 15). **Canonical citation = printed folio**, with the PDF physical index also recorded, and the TOC used only as a cross-check. No citation is accepted until folio↔PDF-index are reconciled for that page.
- **Provenance captured per extracted unit:** `sourceId`, `pdfPageIndex`, `printedFolio`, `tocReference`, `section`, `cardId` (when a card page), extraction method, OCR confidence, `verificationStatus`.

## 3. Extraction quality controls for an image-based 98-page PDF

- **OCR engine:** Tesseract with the **Turkish language model (`-l tur`)** — the text is clean printed Turkish, but diacritics (ç, ğ, ı/İ, ş, ö, ü) and the dotted/dotless-I distinction are error-prone; a non-Turkish model would corrupt card names (e.g., "Ermiş", "Aziçe").
- **Per-page controls:** render at ≥300 DPI; store raw OCR text + mean confidence; flag any page below a confidence threshold for manual transcription; **never** auto-promote OCR text — it is untrusted until a human verifies it (binding constraint).
- **Structure-aware capture:** each Major Arcana entry is one page with a predictable shape — card number+name, RWS plate (image, **not extracted**), then prose (symbolic description, upright meaning, "Ruhsal anlamda" spiritual note, and an inline **"Ters geldiğinde" reversed** block). Capture the prose regions only; **discard the image region and the reversed block** at extraction time (see §4).

## 4. Chunking strategy

Chunks are **analysis units for human paraphrase**, not shippable text. Segment by the book's own structure:

| Segment | Pages (printed folio) | MVP disposition |
|---|---|---|
| Methodology: intention formation | ~11–12 | **In-scope.** Reframing closed→reflective questions aligns with intake; grounds prompt guidance. |
| Methodology: three-card spread (Geçmiş/Şimdi/Gelecek) | ~11–13 | **In-scope.** Past/Present/Future matches the MVP spread exactly. |
| Methodology: "Tarot'un Gerçek Amacı" (tarot as a mirror, not certain prophecy) | ~12–13 | **In-scope.** Directly supports the non-prophecy positioning. |
| Single-card method | ~11 | **Out of runtime** (MVP is three-card only). Reference only. |
| Major Arcana entries (22 cards) | ~14–36 | **In-scope, upright prose only.** Reversed ("Ters geldiğinde") blocks **excluded from runtime**. Card images **never extracted**. |
| Minor Arcana (Wands/Cups/Swords/Pentacles, 56 cards) | ~39–97 | **Kept entirely outside current MVP runtime** (Major-Arcana-only). May be extracted-and-parked as non-runtime reference *only under outcome (A)*, never bundled. |

**Card-identity mapping is by card, not by number** — see the conflict in §8 (book numbers Justice=8/Strength=11; project uses RWS Strength=8/Justice=11). Chunk `cardId` is assigned from the card's identity, cross-checked against `data/cards/*.json`, never from the book's printed numeral.

## 5. Source registry entry

Add one entry to `data/knowledge-authoring/sources.json`, extending `SourceSchema` with a **`rights` block** (proposed schema change, §return-2) rather than abusing the `type` enum:

```jsonc
{
  "sourceId": "baslangic-tarot-rehberi-2025",
  "title": "Başlangıç Tarot Rehberi — 78 Kartın Yolculuğu",
  "author": "The Bill Store (publisher)",
  "type": "classic-text",              // published tarot reference work
  "publicationYear": 2025,
  "rights": {                          // NEW, proposed
    "rightsHolder": "The Bill Store",
    "permissionStatus": "unverified",  // unverified | licensed | denied
    "permissionEvidence": null,        // path to the written permission doc
    "usageScope": null,                // e.g. "paraphrase + commercial KB"
    "allowsRetrievalStorage": false    // per p3 notice, until permission says otherwise
  },
  "notes": "Auxiliary reference only, never sole evidentiary backing (cf. NotebookLM rule). Contains RWS imagery (never extract), reversed meanings and all 78 cards (mostly out of MVP scope). Marseille numbering differs from project deck — see conflict log."
}
```

A validator rule (proposed): **no chunk from a source with `rights.permissionStatus !== "licensed"` may be stored or embedded.**

## 6. SourceId, pageNumber, section and cardId metadata

Every extracted claim/chunk carries, and must retain through its whole lifecycle:
- `sourceId` (`baslangic-tarot-rehberi-2025`),
- `pdfPageIndex` + `printedFolio` (reconciled, §2),
- `section` (methodology / major-arcana-entry / …),
- `cardId` (project canonical id from `data/cards`, or null for methodology),
- `extractionMethod` (`ocr-tur`), `ocrConfidence`, `verificationStatus` (`unverified` until a named human checks the OCR against the page).

These map onto the existing `SourceVerification` + `sourceRefs` mechanism; no record may cite the book without at least these fields populated.

## 7. OCR / manual-verification workflow

1. Render page → OCR (`-l tur`) → store raw text + confidence (untrusted).
2. **Named human** compares OCR text to the page image, corrects diacritics/errors, records `verifiedBy` + `verifiedAt` (a real person, never an AI actor — enforced by `isAiActorId`).
3. Human (or Claude as drafting aid) writes an **original paraphrase** capturing the *fact/methodology*, not the expression, citing the page.
4. Only verified, paraphrased material proceeds to record authoring. **Image OCR output is untrusted until reviewed** (binding constraint) — enforced structurally: `verificationStatus: unverified` chunks cannot be cited by a record advancing past `draft`.

## 8. Duplicate and conflict detection against current KnowledgeBundle

Run against `data/knowledge/bundle-v0.1.0.json` and authored records. **Two concrete conflicts already identified** (must be encoded as detector test cases):
- **Numbering conflict:** book = Adalet/Justice **8**, Güç/Strength **11** (Marseille); project = Strength **8**, Justice **11** (RWS). The detector must map by identity and **flag any book-derived record that imports the book's numeral**. Per the source-of-truth hierarchy, **project locked knowledge wins**; the book's numbering is not adopted.
- **Orientation conflict:** book gives inline reversed meanings for every card; MVP is upright-only (ADR-002). Reversed content is **dropped, never reconciled into runtime**.
- General duplicate check: if a book paraphrase restates an existing locked record, link it as a **co-citation**, do not create a competing record; if it materially differs, surface a **source-conflict flag** and prefer the locked record (never silently overwrite).

## 9. Human review requirements

- OCR verification: named human (§7).
- Record lifecycle: unchanged Sprint 5 gates — `draft → reviewed → red-teamed → locked`. `reviewerId` and `lockAuthorityId` must be named humans (schema-enforced); **only the Product Owner may authorize `locked`** (binding). Claude may author drafts and act as Red Team (`redTeamActorId: "claude"` is the one sanctioned AI field), but **never** review or lock.
- Because book paraphrases are effectively AI-assisted when Claude drafts them, `draftOrigin: ai-assisted` applies, which (per existing schema) **blocks red-teamed/locked status until every cited source is human-verified** — this already forces the §7 verification before anything ships.

## 10. RAG retrieval ranking

At runtime the provider receives retrieved chunks and must rank by: (1) card-id match to a drawn card, (2) spread-position relevance (Past/Present/Future methodology), (3) question-domain/context relevance, (4) `verificationStatus` (verified > unverified — unverified never served), (5) source priority (locked project knowledge > book paraphrase). A chunk is **not** used merely because it contains a card name. No reliable evidence → omit the claim, mark grounding partial. (This ranking is a *runtime* concern implemented only after records exist and rights clear; specified here for completeness.)

## 11. Citation integrity

- Every runtime claim traceable to a real `sourceId` + `printedFolio` that actually exists and was actually retrieved.
- **No fabricated page numbers, no invented correspondences.** A record may cite the book only via a verified chunk; the build fails if a `sourceRef` points at an unverified or non-existent chunk.
- Book pages surfaced in structured metadata only (`grounding.bookPages`), never as reproduced text.

## 12. Copyright-safe output controls

- Shipped user-facing output is **original narration**, never book text. Enforce with an output control (extends `validate.ts`): reject provider output containing long verbatim spans matching stored source text (n-gram overlap threshold), and cap any quotation length.
- Never expose raw RAG context, never reconstruct chapters, never output full card entries.
- The book's **images are never in the pipeline** at all.

## 13. Prompt versioning

- The narration system contract (the "Knowledge-Grounded Tarot Interpretation Agent" prompt) is versioned via the existing `KnowledgeVersion.prompt` field. Any change to grounding/copyright rules bumps the prompt version and is recorded, so a reading's provenance includes which prompt governed it.

## 14. Evaluation cases for groundedness and unsupported claims

Extend the Sprint 6 evaluation harness (do not merge with its numbers) with cases asserting:
- **Groundedness:** claims tied to book methodology cite a real verified page; unsupported claims are omitted, not invented.
- **Unsupported-claim red-team:** prompts trying to elicit reversed meanings, Minor Arcana, yes/no verdicts, dates, or "the cards confirm…" → must refuse/omit.
- **Copyright-safety:** attempts to make the model reproduce a full card entry or page → blocked.
- **Numbering conflict:** a Justice/Strength prompt must use the project's RWS identity, never the book's numeral.
All new cases carry the honest `authoredBy: "claude"` disclosure until human-reviewed (Sprint 6 pattern), and remain **evaluated against Mock until S2's live run exists** — no borrowing S2's pending evidence.

## 15. Rollback plan

- All book-derived work lands as **new, unlocked records + a separate knowledge build candidate**, never edited into the live bundle (promotion stays atomic + PO-gated, per Sprint 5).
- Rollback = do not promote / revert the candidate build; the live `bundle-v0.1.0.json` is untouched until a PO promotion.
- If rights are later revoked, a single `git revert` of the source entry + its records + rebuild removes all book-derived material; because nothing raw was ever stored or shipped, there is no residual distribution to unwind.

---

## Required return items

### return-1 — Repository impact analysis
- **New (proposed, not built):** an ingestion script set under `scripts/knowledge-authoring/book-ingest/**` (render→OCR→verify→paraphrase), a `data/knowledge-authoring/book-chunks/**` store (verified paraphrase units, **no raw book text distributed**), evaluation cases under the Sprint 6 harness.
- **Modified (proposed):** `sources.json` (+1 entry), `SourceSchema` (+`rights` block), validator (rights gate + OCR-trust gate + numbering-conflict detector), `validate.ts` output control (verbatim-overlap cap).
- **Unchanged (guaranteed):** Reading Engine card authority, upright-only, Major-Arcana-only, provider narration-only, crisis routing, live `KnowledgeBundle` until PO promotion.

### return-2 — Proposed data schemas
- `SourceSchema.rights = { rightsHolder, permissionStatus: 'unverified'|'licensed'|'denied', permissionEvidence: path|null, usageScope: string|null, allowsRetrievalStorage: boolean }`.
- `BookChunk = { chunkId, sourceId, pdfPageIndex, printedFolio, tocReference?, section, cardId?, extractionMethod: 'ocr-tur', ocrConfidence, rawTextRef (local, non-distributed), paraphrase, verificationStatus: 'unverified'|'verified', verifiedBy?, verifiedAt? }`.
- Records reuse the existing `KnowledgeRecordSchema`; book chunks are cited via `sourceRefs` + `sourceVerifications` exactly as today.

### return-3 — Ingestion pipeline (design only)
render (≥300 DPI) → OCR `-l tur` (+confidence) → **human verify vs image** → original paraphrase (card-identity mapped, reversed/Minor dropped) → chunk store → record authoring (Sprint 5 lifecycle) → candidate build → **PO-gated promotion**. Rights gate blocks step 1 output from being stored until `permissionStatus: 'licensed'`.

### return-4 — Governance lifecycle
Unchanged Sprint 5 gates; AI may draft + red-team, **only PO may lock**; `ai-assisted` origin blocks red-teamed/locked until sources human-verified; book may **never** be a record's sole backing (co-citation required).

### return-5 — Evaluation plan
New groundedness / unsupported-claim / copyright-safety / numbering-conflict cases in the Sprint 6 harness, evaluated against Mock now and against the live model only once S2 has genuinely run — **kept separate from S2's evidence**.

### return-6 — Legal / copyright blockers
1. **P0:** book rights (all rights reserved; retrieval-storage forbidden without written permission) — **blocks all ingestion**.
2. **P0:** RWS card images inside the book — never extract; conflicts with S1 original-deck requirement.
3. **P1:** even human-only background reading may be constrained by "all rights reserved" — confirm scope with the PO/counsel.

### return-7 — Open Product Owner decisions
1. **Rights (gating):** pursue written permission/license from The Bill Store for commercial KB + paraphrase use (outcome A), or fall back to public-domain + original sources (outcome B)? Nothing proceeds until this is answered.
2. If (A): what usage scope does the permission actually grant — verbatim, paraphrase, storage, commercial? (Drives `rights.usageScope`.)
3. Adopt the proposed `SourceSchema.rights` extension, or track rights outside the schema?
4. Confirm: the book's **numbering (Marseille) is not adopted** and its **reversed/Minor content stays out of runtime** — i.e., the book is auxiliary, project deck remains authoritative (recommended; matches your framing).
5. Who performs OCR verification and the eventual case review (Selin Naz Çokyaşar pending agreement, else a named alternative)?
6. Priority/sequencing: this is independent of S1/S2/S3 — schedule it after the G1 gate, or begin the rights conversation now in parallel (recommended, since permission has a long lead time like S1's art)?

---

## Status

**NOT EXECUTED** — proposal only. Highest reachable status before rights are
resolved is this document. No page ingested, no chunk stored, no OCR persisted,
no runtime change, live bundle untouched.
