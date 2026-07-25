# 03 — Knowledge System

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `src/types/knowledge.ts`, `src/types/knowledge-authoring.ts`, `src/server/knowledge/`, `scripts/knowledge-authoring/`, `data/knowledge*/`.

---

## KnowledgeBundle design (`src/types/knowledge.ts`)

`KnowledgeBundleSchema` = versioned structured data:
- `cards` (exactly 22 `CardData`), `pairRelations`, `positionRules`, `domainModifiers`, `personaModifiers`, `safetyConstraints`.
- Record types: `PairRelation` (previous→focus card influence + `semanticEffect` + `warnings` + `sourceRefs`), `PositionRule` (position/spread framing), `DomainModifier` (per question domain), `PersonaModifier` (tone/depth per persona), `SafetyConstraint` (flag → block/disclaimer/soften).
- **`KnowledgeContext`** = the resolved, reading-specific slice handed to a provider (adjacent pair relations, drawn-position rules, single domain/persona modifier, matching safety constraints). Provider narrates this; it never invents semantic content (ADR-011/012).
- **Resolution status:** `resolved` / `partial` / `fallback` (`KnowledgeResolutionMeta`); on provider error the orchestrator substitutes `EMPTY_KNOWLEDGE_CONTEXT`.

Live bundle: `data/knowledge/bundle-v0.1.0.json`. Resolved at runtime by `LocalJsonKnowledgeProvider` (`src/server/knowledge/local-json-provider.ts`).

## Source registry (`data/knowledge-authoring/sources.json`)

Six sources at this commit:
1. `tarot-ai-original-synthesis-v1` — the project's own reasoning framework (original-synthesis).
2. `notebooklm-major-arcana-research-2026-07` — ai-assisted-draft aid; **never sole backing**.
3. `waite-pictorial-key-1910` — public-domain classic (Waite, 1910).
4. `pollack-seventy-eight-degrees-1980` — academic (Pollack, 1980).
5. `baslangic-tarot-rehberi-2025` — **lineage-only**, copyrighted-no-ingestion.
6. `modern-klasik-tarot-rehberi-2025` — **lineage-only**, related-edition of #5 (one lineage family).

Schema `SourceSchema` (`src/types/knowledge-authoring.ts`) supports optional `rights` and `governance` blocks; governance restriction booleans are `literal(false)`.

## Authoring lifecycle (`src/types/knowledge-authoring.ts`)

- `KnowledgeRecord` = payload (discriminated by `recordType`) + `sourceRefs` + `sourceVerifications` + `lifecycle` + timestamps.
- `LifecycleSchema`: `status` in `draft → reviewed → red-teamed → locked`; `authorId`, `reviewerId` (human-only past reviewed), `redTeamActorId` (AI allowed), `lockAuthorityId` (human-only), `draftOrigin` (`human` | `ai-assisted`, `aiTool` named when ai-assisted), `singleOperatorMode`.
- **Hard rules:** locked records must cite ≥1 source; ai-assisted records cannot reach red-teamed/locked until every cited source has a human `sourceVerification`; `reviewerId`/`lockAuthorityId` can never be AI actors (`isAiActorId`).

## Validation rules (`scripts/knowledge-authoring/validate.ts`)

- Every record `sourceRef` must resolve in the registry (orphan-citation check).
- Every `governance.relatedSources` reference must resolve (related-source integrity) — added when the second book was registered.
- Standing **lineage warnings** for related editions (dedup required) so the two Bill Store books are never counted as two independent sources.
- Non-blocking governance warning when `authorId === reviewerId` under `singleOperatorMode`.
- Commands: `knowledge:validate`, `knowledge:check-conflicts`, `knowledge:build` (pilot artifact only), `knowledge:promote` (atomic, PO-gated — not run in automation), `knowledge:ingest`, `knowledge:transition`.

## Locked / draft record status (current)

- `data/knowledge-authoring/records/` holds the pilot records; **3 pair relations are locked** (per Sprint 5 human-lock decisions; `knowledge:build` reports "Locked records included: 3"), others revised.
- Governance warnings note `authorId === reviewerId ("umit")` under `singleOperatorMode` — acceptable for pilot, not production.
- **Methodology-extraction lessons:** none on the active line. The pre-G1 draft lessons were quarantined off the active branch (`hold/methodology-extraction-pre-g1`); lesson tooling was reverted. No lesson may be authored on the active line until G1 GO.

## Deferred (ADR-011/012 deferral list, unchanged)

Full card-pair matrix, NotebookLM-based sourced content at scale, citation/source structure for interpretations, SQLite/DB build pipeline, large curation + red-team workflow — all remain Milestone-3+ work, not built.

## What must NOT happen (copyright)

No book text/image is stored, OCR'd, embedded, retrieved, or served; the reference-book PDFs are not in the repo; runtime never queries them. Abstract methodology extraction (original re-writing from memory, independently corroborated) is deferred to **after G1**.
