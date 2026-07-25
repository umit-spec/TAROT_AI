# 06 — Repository Map

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** repository tree + `package.json` at this commit.

---

## Important folders

| Path | Purpose |
|---|---|
| `src/app/` | Next.js App Router: UI (`page.tsx`, `layout.tsx`), `api/readings/route.ts`, `api/health/route.ts` |
| `src/middleware.ts` | Request-ID middleware (`/api/:path*`) |
| `src/components/` | UI components (consent, question form, shuffle/reveal, reading result, crisis notice, error, disclaimer) |
| `src/lib/` | `constitution-copy.ts`, `persona-mapping.ts` |
| `src/server/intake/` | Server-side intake + crisis flag detection |
| `src/server/knowledge/` | Knowledge layer + `LocalJsonKnowledgeProvider` |
| `src/server/reading-engine/` | Deterministic draw, synthesis, validation, providers (Claude, Mock) |
| `src/server/observability/` | Request-id, structured logging, rate limiting (S3) |
| `src/types/` | Zod schemas: api, card, intake, interpretation, knowledge, knowledge-authoring, reading, evaluation, asset-license |
| `scripts/evaluation/` | Evaluation harness + S2 tooling |
| `scripts/knowledge-authoring/` | Authoring pipeline (validate/build/promote/…) |
| `scripts/assets/` | Production asset gate (S1) |
| `data/cards/` | 22 Major Arcana JSON |
| `data/knowledge/` | Live pilot `KnowledgeBundle` |
| `data/knowledge-authoring/` | Source registry + records |
| `data/evaluation/` | Fixed cases + run artifacts |
| `data/assets/` | Pilot license manifest (S1) |
| `assets/tarot-cards/` | Montage-derived webp (non-production, licensing debt) |
| `docs/` | Constitutions, ADR log, sprint plans, debt logs, proposals |
| `docs/deploy/` | Runbook, staging secrets, Vercel, main-migration checklist (S3) |
| `docs/evaluation/` | Live-run procedure (S2) |
| `docs/visual/` | Visual-direction proposal (S1) |
| `validation/reports/` | Per-sprint build/closure evidence reports |
| `validation/investor-readiness/` | Investor-pack artifacts (asset license manifest) |
| `.github/workflows/` | `validation-gates.yml` (docs), `code-gates.yml` (S3 code gates) |
| `notebooklm-export/` | This knowledge pack |

## Important files (claims → paths)

- Product endpoint: `src/app/api/readings/route.ts`
- Reading orchestration: `src/server/reading-engine/index.ts`
- Deterministic draw: `src/server/reading-engine/deterministic.ts`
- Provider contract: `src/server/reading-engine/providers/types.ts`
- Claude provider (narration-only, no key logging): `src/server/reading-engine/providers/claude/`
- Validation gate: `src/server/reading-engine/validate.ts`
- Crisis + intake: `src/server/intake/`
- Knowledge schemas: `src/types/knowledge.ts`, `src/types/knowledge-authoring.ts`
- Evaluation schemas: `src/types/evaluation.ts`
- Asset gate: `src/types/asset-license.ts`, `scripts/assets/validate-assets.ts`
- ADR log: `docs/DECISION_LOG.md`
- Live bundle: `data/knowledge/bundle-v0.1.0.json`
- Source registry: `data/knowledge-authoring/sources.json`

## npm commands (`package.json`)

- **Gates:** `dev`, `build`, `start`, `lint` (`eslint .`), `typecheck` (`tsc --noEmit`), `test` (`vitest run src/__tests__`), `test:milestone1`.
- **Assets (S1):** `assets:validate`.
- **Knowledge:** `knowledge:ingest`, `knowledge:transition`, `knowledge:validate`, `knowledge:check-conflicts`, `knowledge:build`, `knowledge:promote`.
- **Evaluation:** `evaluation:run`, `evaluation:live-anthropic`, `evaluation:live-preflight`, `evaluation:scrub-artifacts`, `evaluation:compare`, `evaluation:cost`, `evaluation:cleanup-raw`, `evaluation:report`.
- **Demos:** `demo:reading`, `demo:api`. **Format:** `format`, `format:check`.

## Test locations

`src/__tests__/unit/` (15 files, 201 tests): `api-readings`, `asset-license`, `claude-provider`, `evaluation`, `evaluation-s2-tooling`, `intake-engine`, `interpretation-provider`, `knowledge`, `knowledge-authoring`, `observability-s3`, `page-flow`, `persona-mapping`, `reading-engine`, `ui-components`, `zero-tolerance-invariants`. Milestone-1 tests under `tests/` (`test:milestone1`). Setup + helpers under `src/__tests__/`.

## Docs locations

Constitutions `docs/01-*`…`10-*`; ADR log `docs/DECISION_LOG.md`; investor docs `docs/INVESTOR_READY_MVP_*`; sprint plans `docs/SPRINT_*`; proposals `docs/HUMAN_GOVERNED_METHODOLOGY_EXTRACTION_PROPOSAL_v1.0.md`, `docs/BOOK_RAG_INGESTION_PROPOSAL_v1.0.md` (superseded); debt logs `docs/*_DEBT_LOG.md`; backlog `docs/METHODOLOGY_EXTRACTION_BACKLOG.md`.

## Excluded from this export (by policy)

`.env*`, secrets/API keys, raw evaluation payloads (`data/evaluation/runs/**/raw/` — git-ignored), copyrighted book PDFs/transcriptions (never in repo), `node_modules/`, `.next/` build artifacts, generated run/comparison artifacts, database files (none exist).
