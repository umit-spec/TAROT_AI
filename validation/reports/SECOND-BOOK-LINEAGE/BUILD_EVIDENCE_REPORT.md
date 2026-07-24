# Second Book — Lineage-Only Registration — Evidence Report

**Date:** 2026-07-23
**Book:** *Modern Klasik Tarot Rehberi — 78 Kartın Yolculuğu*, The Bill Store, 2025 (uploaded PDF, 96 pages).
**Governed by:** the Human-Governed Methodology Extraction policy already approved for the first book (`docs/HUMAN_GOVERNED_METHODOLOGY_EXTRACTION_PROPOSAL_v1.0.md`), plus the Product Owner's binding decision for this second book.
**Status:** **REGISTERED AS LINEAGE-ONLY RELATED EDITION — METHODOLOGY EXTRACTION DEFERRED UNTIL AFTER G1.**

---

## 1. New lineage-only source registry entry

`data/knowledge-authoring/sources.json` +1 entry `modern-klasik-tarot-rehberi-2025`:
- `type: classic-text`, `rights` (rightsHolder The Bill Store, `permissionStatus: unverified`, `allowsRetrievalStorage: false`).
- `governance`: `sourceRole: human-background-lineage-only`, `usageScope: abstract-methodology-learning-only`, `runtimeEligible/soleAuthorityAllowed/storedText/embeddingAllowed/imageUseAllowed` **all `false`** (schema-`literal(false)` — they cannot be flipped true), `rightsStatus: copyrighted-no-ingestion`.
- (Source id aligned to the existing registry convention — no `book-` prefix — so cross-references resolve; the Product Owner's illustrative `book-` prefix was an example.)

## 2. Relationship to the first book

Reciprocal `governance.relatedSources` entries link the two books:
`related-edition`, `contentOverlapStatus: high-overlap-confirmed`, `deduplicationRequired: true` — on **both** `modern-klasik-tarot-rehberi-2025` and `baslangic-tarot-rehberi-2025`.

## 3. Duplicate / overlap warning (verified, not assumed)

Confirmed by visually reading only the front matter (nothing stored):
- **Same publisher** (The Bill Store), **same year** (2025).
- **Same Ministry of Culture registration number: `2025/14830`** — identical to the first book.
- **Identical table-of-contents structure** (Önsöz / Tarihçe / Niyet–Tek kart–Üç kart / Majör 12 / Minör 35) and **same Marseille numbering** (Justice/Adalet 24, Strength/Güç 21 by folio).
- **Near-identical preface** ("Tarot bir aynadır…").

→ The two books are **one lineage family**, not two independent sources. `npm run knowledge:validate` now prints a standing `[lineage warning]` for each, and a principle appearing in both **still requires ≥1 genuinely independent external source** before it may enter the authoring lifecycle after G1.

## 4. Confirmation — no OCR / text / image storage

- **No** OCR into storage, **no** page transcriptions, **no** chunks, **no** embeddings, **no** vector index, **no** runtime PDF access, **no** illustration extraction, **no** shipped book text, **no** user-facing citations.
- The PDF is **not** in the repo (`find` for `*modern*klasik*`/`*ekitap*` → none). Front matter was read only to verify the legal claim + overlap; nothing was written to the repo.
- Book illustrations are **not** approved production assets and are never cropped/extracted/embedded/used — including as references for S1's fully-original deck (S1 originality requirement stands).

## 5. Confirmation — no runtime change

- Only `src/types/knowledge-authoring.ts` (authoring schema: `SourceGovernanceSchema` + `SourceRelationshipSchema` + optional `governance` on `SourceSchema`), `data/knowledge-authoring/sources.json`, `scripts/knowledge-authoring/validate.ts` (related-source integrity + lineage warning), and docs/tests changed.
- **No** runtime code, **no** live `KnowledgeBundle` change, **no** lesson bodies drafted, **no** lifecycle records, **no** promotion. Build unchanged (routes + `/api/health` + Middleware, same as S3).

## 6. Clean validation gates

| Command | Result |
|---|---|
| `npm run knowledge:validate` | 6 sources, all citations resolve, related-source references resolve, lineage warnings printed |
| `npm run lint` | 0 errors |
| `npm run typecheck` | 0 errors |
| `npm run test` | 15 files, **201/201** (199 prior + 2 new governance/lineage tests) |
| `npm run build` | 0 — no runtime change |

## 7. MVP conflicts unchanged

Major-Arcana-only, upright-only, three-card Past/Present/Possible-Direction, no yes/no, no repeated-question divination, canonical RWS ids (`08-strength`, `11-justice` — book's numbering not adopted), Reading Engine sole draw authority. The book's Minor Arcana, reversed meanings, yes/no, single-card daily method, and alternative numbering remain outside runtime.

## 8. Deferred (post-G1 only)

A human may read the book and write abstract principles from memory in original product language **only after** a genuine S2 live evaluation, independent human subset scoring, and an explicit **G1 GO** — under the unchanged rules (close the book before writing, no close paraphrase, no chapter-structure copying, no "Kart der ki/fısıldar" imitation, no distinctive-phrase reuse, book never sole backing, ≥1 genuinely independent source, human similarity review, AI red-team only, Product-Owner lock only).

**Status: REGISTERED AS LINEAGE-ONLY RELATED EDITION — METHODOLOGY EXTRACTION DEFERRED UNTIL AFTER G1.**
