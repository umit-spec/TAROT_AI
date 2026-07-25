# NotebookLM Export — Manifest

**Generated:** 2026-07-24
**Commit SHA:** `5e0a5bb` (`5e0a5bbbed30031a656ab8b40ac46a92d034c569`)
**Branch:** `claude/insight-engine-investor-audit-bkofgr`
**Repository:** `umit-spec/TAROT_AI`
**Confidentiality classification (whole pack):** **Internal** — no secrets, no `.env`, no API keys, no raw evaluation payloads, no copyrighted book text/PDFs/transcriptions, no `node_modules`, no build artifacts, no database files, no generated/production assets.

This pack is a NotebookLM-safe, repository-grounded synthesis. It distinguishes **current state** (exists at this commit) from **planned state** (proposed/approved, not built). Each document carries the generated date and commit SHA and stays well under ~8,000 words.

---

## Exported documents

| # | File | Purpose | Primary source repository paths | Confidentiality |
|---|---|---|---|---|
| 0 | `00_PROJECT_OVERVIEW.md` | Vision, MVP scope, status, user flow, built-vs-not-built | `docs/DECISION_LOG.md`, `docs/02-ETHICAL_CONSTITUTION.md`, `src/app/`, `src/server/`, `docs/INVESTOR_READY_MVP_GAP_ANALYSIS_v1.0.md` | Internal |
| 1 | `01_ARCHITECTURE.md` | Next.js structure, reading engine, provider interface, deterministic draw, validation, API routes, file paths | `package.json`, `src/app/`, `src/server/reading-engine/`, `src/server/intake/`, `src/server/knowledge/`, `src/server/observability/`, `src/middleware.ts`, `src/types/` | Internal |
| 2 | `02_PRODUCT_GOVERNANCE.md` | ADR summaries, MVP constraints, lock authority, source governance, copyright, HOLD/BLOCKED tracks | `docs/DECISION_LOG.md`, `docs/0X-*.md`, `src/types/knowledge-authoring.ts`, `data/knowledge-authoring/sources.json`, `docs/*_DEBT_LOG.md` | Internal |
| 3 | `03_KNOWLEDGE_SYSTEM.md` | KnowledgeBundle design, source registry, authoring lifecycle, validation rules, locked/draft status | `src/types/knowledge.ts`, `src/types/knowledge-authoring.ts`, `src/server/knowledge/`, `scripts/knowledge-authoring/`, `data/knowledge*/` | Internal |
| 4 | `04_EVALUATION_AND_SAFETY.md` | Eval corpus, Mock results, live-run status (Anthropic; OpenAI not used), crisis routing, red-lines, zero-tolerance invariants | `scripts/evaluation/`, `src/types/evaluation.ts`, `data/evaluation/`, `src/__tests__/unit/zero-tolerance-invariants.test.ts`, `src/server/intake/` | Internal |
| 5 | `05_SPRINT_STATUS.md` | S0–S9 roadmap, S1/S2/S3 status, G1 conditions, blocked work, next actions | `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md`, `docs/SPRINT_S*_*.md`, `validation/reports/` | Internal |
| 6 | `06_REPOSITORY_MAP.md` | Folders, files, npm commands, test/docs locations, exclusions | repository tree, `package.json` | Internal |
| 7 | `07_DECISION_LOG_DIGEST.md` | Accepted ADRs, superseded, unresolved decisions | `docs/DECISION_LOG.md` | Internal |
| 8 | `08_INVESTOR_READINESS.md` | Classification, evidence completed/missing, technical/legal/product risks | `docs/INVESTOR_READY_MVP_*`, `validation/reports/`, `validation/investor-readiness/` | Internal |
| 9 | `09_CHANGELOG_RECENT.md` | Recent meaningful commits, what/why changed, clean-gate results | `git log`, `validation/reports/` | Internal |
| — | `MANIFEST.md` | This manifest | — | Internal |

## Deliberate exclusions (policy)

- **Secrets / `.env*` / API keys** — never in repo; excluded.
- **Raw evaluation payloads** — `data/evaluation/runs/**/raw/` (git-ignored, local-only, opt-in `--retain-raw`, 7-day cleanup).
- **Copyrighted book PDFs / OCR / transcriptions** — `Başlangıç Tarot Rehberi` and `Modern Klasik Tarot Rehberi` (The Bill Store, 2025): governed lineage-only; **not in the repo**; no text/image reproduced here.
- **`node_modules/`, `.next/` build artifacts, generated run/comparison artifacts, database files** (none exist).
- **Deprecated duplicate documents** referenced by name only (e.g. superseded Book-RAG proposal) — not re-exported.

## Verification at generation

`lint` 0 · `typecheck` 0 · `test` 201/201 · `build` 0 · `knowledge:validate` OK (6 sources). Working tree clean; all sources committed at `5e0a5bb`.

## Regeneration note

This pack is a point-in-time snapshot at `5e0a5bb`. Regenerate after material commits; update the SHA/date headers in every file and this manifest.
