# Insight Engine — Repository Knowledge Pack (Combined)

**Single-file NotebookLM/Drive upload.** Generated 2026-07-24 · Commit `5e0a5bb` · Branch `claude/insight-engine-investor-audit-bkofgr` · Repository `umit-spec/TAROT_AI` · Confidentiality: Internal.

This file concatenates the 10 knowledge-pack documents plus the manifest, in order. Each section retains its own generated-date/commit header. No secrets, no `.env`, no API keys, no raw evaluation payloads, no copyrighted book text/PDFs, no build artifacts.

## Contents
1. Manifest
2. 00 Project Overview
3. 01 Architecture
4. 02 Product Governance
5. 03 Knowledge System
6. 04 Evaluation and Safety
7. 05 Sprint Status
8. 06 Repository Map
9. 07 Decision Log Digest
10. 08 Investor Readiness
11. 09 Recent Changelog


---

<!-- ===== SOURCE FILE: MANIFEST.md ===== -->

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


---

<!-- ===== SOURCE FILE: 00_PROJECT_OVERVIEW.md ===== -->

# 00 — Project Overview

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` (`5e0a5bbbed30031a656ab8b40ac46a92d034c569`) · **Branch:** `claude/insight-engine-investor-audit-bkofgr` · **Confidentiality:** Internal
**Grounding:** repository-only. Claims cite source paths. "Current" = exists in the repo at this commit; "Planned" = proposed/approved but not built.

---

## Product vision

**Insight Engine** — "a personal insight system that helps users structure reflection at meaningful life thresholds." Tarot is the **first module**, not the whole product. Positioning is deliberately **reflection, not fortune-telling** (see `docs/DECISION_LOG.md` ADR-014, `docs/02-ETHICAL_CONSTITUTION.md`). Potential future modules (journaling, weekly summaries, dream/symbol analysis) are **direction, not built**.

The accepted cadence model (ADR-014, `docs/DECISION_LOG.md`) — **an MVP hypothesis, not validated behavior**:
- **Daily** = lightweight reflection (not tarot).
- **Weekly** = theme/pattern summary.
- **Threshold** = the deep three-card tarot reflection, reserved for named meaningful events.
Guardrails: no compulsive daily divination; no repeated same-question readings.

## Current MVP scope (built and enforced)

- **Major Arcana only** (22 cards) — ADR-001.
- **Upright only** (no reversed) — ADR-002.
- **Deterministic three-card spread**: Past / Present / Future — `src/server/reading-engine/`.
- Contexts: relationship / career / self-reflection where covered.
- Reflective guidance, **no certain prophecy**, no yes/no verdicts.
- Reading Engine is the **sole** card-selection authority; providers narrate only (ADR-011/012).

## Current status (this commit)

- **Working product spine, end-to-end**: consent → question → server-side intake → crisis gate → deterministic draw → knowledge resolution → narration provider → schema + red-line validation → versioned API → rendered browser UI.
- **All engineering gates green**: `npm run lint` 0, `npm run typecheck` 0, `npm run test` **201/201** (15 files), `npm run build` 0.
- **Classification (Phase-1 audit, `docs/INVESTOR_READY_MVP_GAP_ANALYSIS_v1.0.md`): Functional product prototype** — past a technical prototype, short of closed-beta-ready MVP.
- Phase-2 execution plan approved (`docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md`); sprints S0–S3 executed to their honest ceilings (see `05_SPRINT_STATUS.md`).

## User flow (as coded)

1. **Consent** modal (`src/components/ConsentModal.tsx`).
2. **Question** form with optional topic hint (`src/components/QuestionForm.tsx`).
3. Client POSTs `{seed, question, topicHint}` to `/api/readings` (`src/app/page.tsx`, `src/app/api/readings/route.ts`).
4. Server **recomputes intake** (never trusts client) → `classifyIntake` (`src/server/intake/`).
5. **Crisis gate**: any crisis flag → returns a crisis-support response with Türkiye resources; **no draw, no provider call** (`src/app/api/readings/route.ts`).
6. Otherwise: deterministic draw → knowledge resolution → narration provider (Claude or Mock) → Zod + red-line validation → versioned response.
7. UI renders shuffle/reveal + reading, or crisis notice, or error (`src/components/`).

## What is built vs. not built

**Built (current):**
- Reading engine, intake, crisis gate, knowledge layer, provider interface (Claude + Mock), validation, versioned API, functional UI.
- Knowledge authoring pipeline (draft→reviewed→red-teamed→locked) + pilot bundle (`scripts/knowledge-authoring/`, `data/knowledge/bundle-v0.1.0.json`).
- Evaluation harness (24 fixed cases, Mock baseline, live-Anthropic harness, zero-tolerance invariants) — `scripts/evaluation/`.
- **S1**: visual-direction proposal + production asset gate (`docs/visual/`, `scripts/assets/`).
- **S2**: safe local-run evaluation tooling (preflight, scrubber, blind compare, cost) — `scripts/evaluation/`.
- **S3**: CI code gates, Vercel preview config, request IDs, redacted logging, rate limiting, health endpoint (`.github/workflows/code-gates.yml`, `src/middleware.ts`, `src/server/observability/`, `src/app/api/health/`).

**Not built (planned/pending):**
- Persistence, accounts, saved readings, deletion (S4 — **not started**, blocked on G1).
- Real Anthropic evaluation result (harness ready; **no live run yet** — no key in the dev environment).
- Analytics/funnel instrumentation (S6).
- Deployed staging environment (S3 code ready; Vercel project + `main` migration are Product-Owner actions).
- Original licensed card art (S1 direction proposed; art not produced; montage assets are non-production).
- Any real user, retention, or willingness-to-pay evidence.

## Non-negotiables (enforced in code/governance)

Reading Engine sole draw authority · intake server-side · crisis short-circuits tarot · provider output always through Zod + red-line validation · no API key in any artifact · no monorepo, no second backend · Drizzle (not Prisma) is the accepted ORM direction · upright-only · deterministic reproducibility.


---

<!-- ===== SOURCE FILE: 01_ARCHITECTURE.md ===== -->

# 01 — Architecture

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** repository source at this commit.

---

## Stack (from `package.json`)

- **Runtime deps only 4:** `next` ^16, `react` ^19, `react-dom` ^19, `zod` ^3.23. No DB/ORM/auth/analytics runtime deps.
- **Dev:** TypeScript ^5 (strict), Vitest ^4, ESLint 9, Testing Library, Tailwind, tsx, prettier.
- **Single Next.js 16 application** — no monorepo, no separate backend (ADR-003). App Router.

## Next.js structure (`src/`)

```
src/
  app/
    layout.tsx, page.tsx, globals.css     # client orchestrator UI
    api/readings/route.ts                 # the single product endpoint (POST)
    api/health/route.ts                   # S3 liveness (GET)
  middleware.ts                           # S3: x-request-id on every /api request
  components/                             # ConsentModal, QuestionForm, ShuffleReveal,
                                          # ReadingResult, CrisisNotice, ErrorNotice,
                                          # CardNarrationItem, DiagnosticBadge, DisclaimerFooter
  lib/                                    # constitution-copy.ts, persona-mapping.ts
  server/
    intake/                               # index, keywords, normalize, rules, safety
    knowledge/                            # index, bundle, local-json-provider, types, errors
    reading-engine/                       # index, cards, deck, deterministic, synthesis, validate
      providers/
        types.ts, shared.ts, mock.ts
        claude/ (config, errors, http, index, mapper, prompt)
    observability/                        # S3: request-id, log, rate-limit
  types/                                  # api, card, intake, interpretation, knowledge,
                                          # knowledge-authoring, reading, evaluation, asset-license
```

## Reading Engine (`src/server/reading-engine/`)

The **sole authority** for which cards, in what order, at what positions, and orientation (ADR-011/012). Key files:
- `deterministic.ts` — seed-based selection (reproducible).
- `deck.ts`, `cards.ts` — 22 Major Arcana loaded from `data/cards/*.json`.
- `synthesis.ts` — pattern layer (Layer 2, non-AI).
- `index.ts` — `generateInterpretedReading(...)`: orchestrates draw → knowledge resolution → provider narration → validation → fallback. Returns `{ reading, output, providerUsed, promptVersionUsed, knowledge, usage?, fallbackReason? }`.
- `validate.ts` — schema + red-line (forbidden-phrase) validation gate on provider output.

**Three-layer model (ADR-004):** (1) deterministic DB lookup, (2) synthesis/patterns, (3) LLM narration only.

## Provider interface (`src/server/reading-engine/providers/`)

- `types.ts` — `InterpretationProvider` contract: `generate(input) → InterpretationOutput`, `name`, `promptVersion`, optional `getLastUsage?()` (Sprint 6, token capture).
- `mock.ts` — `MockProvider`: deterministic, no network, no key; the always-available fallback.
- `claude/` — `ClaudeProvider`: narration-only. `config.ts` (`DEFAULT_MODEL = 'claude-sonnet-5'`, `loadClaudeProviderConfig`, never logs the key), `http.ts` (Anthropic call + retry + usage capture), `mapper.ts` (parse + **card-order verification**), `prompt.ts` (`PROMPT_VERSION`, system/user prompts). Swapping providers **never changes what a reading means** (ADR-011).

## Deterministic card draw

Seed-based; same seed → same cards/order. Verified by `src/__tests__/unit/reading-engine.test.ts` and enforced as zero-tolerance invariant #11 (no provider reorders/adds/drops cards). A fabricated Claude response with reordered insights is rejected by `mapper.ts` and falls back to Mock.

## Validation pipeline

1. Request schema (`src/types/api.ts` `ReadingRequestSchema`) — has **no** persona/safetyFlags fields to trust.
2. Server-side `classifyIntake` (`src/server/intake/`).
3. Crisis gate (route level).
4. Provider output → `validateInterpretation` (`reading-engine/validate.ts`): Zod schema + red-line forbidden phrases. On failure → fallback to Mock, classified `fallbackReason` (`red-line-rejected` | `schema-invalid` | `provider-error`).
5. Response schema (`ReadingResponseSchema`) parsed before return.

## API routes

- **`POST /api/readings`** (`src/app/api/readings/route.ts`): validate JSON → validate request schema → S3 rate-limit (env-gated) → `classifyIntake` → crisis gate → `generateInterpretedReading` → versioned `ReadingResponse`. Emits redacted structured log + `x-request-id`. Returns `crisis` / reading / `400` / `429`.
- **`GET /api/health`** (`src/app/api/health/route.ts`): `{status, version, commit, timestamp}`; no secrets, no DB.
- **Middleware** (`src/middleware.ts`): sets/propagates `x-request-id`, matcher `/api/:path*`.

## Observability (S3, `src/server/observability/`)

- `request-id.ts` — correlation id.
- `log.ts` — `buildReadingLogRecord` / `logReading`: structured JSON, **input type has no field for question/reflection/crisis text** (redaction by construction).
- `rate-limit.ts` — fixed-window per-IP limiter; OFF in dev/test, ON in prod or `RATE_LIMIT_ENABLED=1`; in-memory (durable store deferred to S4).

## Versioning

Every response carries `versions: { deck, algorithm, knowledge, prompt }` (`DECK_DATA_VERSION`, `DECK_ALGORITHM_VERSION` from reading-engine; `knowledge.meta.version`; provider `promptVersion`). Enables reproducibility and provenance.

## Data (repository, non-secret)

`data/cards/*.json` (22 cards) · `data/contexts.json`, `data/positions.json` · `data/knowledge/bundle-v0.1.0.json` (live pilot bundle) · `data/knowledge-authoring/` (sources.json, records/, lessons removed pre-G1) · `data/knowledge-builds/pilot/` · `data/evaluation/cases/cases.json` (24 cases) + prior run artifacts · `data/assets/pilot-license-manifest.json`.

## Deployment readiness

CI code gates and Vercel **preview** config exist (`.github/workflows/code-gates.yml`, `vercel.json`). No production deploy, no production DB (S3 boundary). Deploy runbook: `docs/deploy/`.


---

<!-- ===== SOURCE FILE: 02_PRODUCT_GOVERNANCE.md ===== -->

# 02 — Product Governance

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `docs/DECISION_LOG.md`, constitutions `docs/0X-*.md`, debt logs, governance schemas.

---

## Accepted ADRs (summaries) — `docs/DECISION_LOG.md`

- **ADR-001** — 22 Major Arcana only for MVP (not 78).
- **ADR-002** — Reversed cards excluded from MVP (upright only); no certain-prophecy.
- **ADR-003** — Next.js 16, Route Handlers, **no separate backend, no monorepo**.
- **ADR-004** — 3-layer reading engine (deterministic → synthesis → LLM narration), not a monolithic AI call.
- **ADR-005** — Persona-aware readings.
- **ADR-006** — Auth.js magic link + Google (passwordless) — *direction; not built*.
- **ADR-007** — Cooldown + metered free tier (no unlimited; anti-addiction).
- **ADR-008** — 100-user controlled test before full launch.
- **ADR-009** — **PostgreSQL + Drizzle** ORM (not MongoDB/SQLite/Prisma).
- **ADR-010** — Vercel deployment (Railway/managed Postgres) — *direction*.
- **ADR-011** — Interpretation knowledge architecture: **LLM is narration-only**; never originates a card meaning, pairing, or safety judgment.
- **ADR-012** — Knowledge Layer sits between Reading Engine and Provider; ground-truth invariant extends to it (KnowledgeProvider resolves *about* an already-drawn reading; it never selects cards).
- **ADR-013** — Branch succession; `feat/insight-engine-milestone-3` is the active line; `feat/major-arcana-asset-migration` frozen; **`claude/tarot-ai-mvp-setup-h2fyf7` deprecated/abandoned**.
- **ADR-014** — **Insight Cadence Model** ACCEPTED as an MVP hypothesis/constraint (Daily/Weekly/Threshold), with hard guardrails against compulsive daily divination and repeated same-question readings; Daily/Weekly architecture deferred, MVP builds the Threshold three-card loop only.

## Superseded / corrected

- **Prisma → SUPERSEDED by ADR-009 (Drizzle)** in `docs/MVP_PLAN_FINAL.md`, `docs/MVP_PLAN_REVISED.md`, `docs/MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.0.md` (Sprint 0).
- `docs/10-MVP_EXIT_CRITERIA.md` labeled **TARGET STATE, NOT CURRENT STATE** (Sprint 0) — it references auth/Posthog/Sentry/Vercel/GDPR that do not exist yet.
- `docs/BOOK_RAG_INGESTION_PROPOSAL_v1.0.md` **SUPERSEDED** by `docs/HUMAN_GOVERNED_METHODOLOGY_EXTRACTION_PROPOSAL_v1.0.md` (RAG withdrawn).

## MVP constraints (binding, enforced)

Major-Arcana-only · upright-only · three-card Past/Present/(Possible-)Future · no yes/no verdicts · no repeated-question divination · canonical RWS card ids (`08-strength`, `11-justice` — Marseille numbering from the Bill Store books **not adopted**) · Reading Engine sole draw authority · intake server-side · crisis short-circuits tarot.

## Lock authority (source & knowledge)

Governance is schema-enforced in `src/types/knowledge-authoring.ts`:
- Lifecycle `draft → reviewed → red-teamed → locked`.
- `reviewerId` and `lockAuthorityId` **can never be an AI actor** (`isAiActorId`) — human-only, structurally.
- **Only the Product Owner may lock.** Claude may author drafts and act as Red Team (`redTeamActorId: "claude"` is the one sanctioned AI field).
- AI-assisted drafts cannot reach red-teamed/locked until every cited source is human-verified.

## Source governance

- Registry: `data/knowledge-authoring/sources.json` (schema `SourceSchema`).
- Two copyrighted reference books registered **lineage-only** with a `governance` block whose restriction booleans are `literal(false)` (cannot be flipped true): `runtimeEligible`, `soleAuthorityAllowed`, `storedText`, `embeddingAllowed`, `imageUseAllowed` — all false; `rightsStatus: copyrighted-no-ingestion`.
- The two books are marked **related-edition / high-overlap-confirmed / deduplicationRequired** → counted as **one lineage family**, never two independent corroborating sources. `npm run knowledge:validate` prints a standing lineage warning and checks related-source integrity.
- **Book never sole backing**; a principle needs ≥1 genuinely independent external source (Waite 1910 / Pollack 1980 / original synthesis).

## Copyright restrictions (both Bill Store books)

Rights belong to The Bill Store (2025); all rights reserved; storage "in a retrieval system" and electronic transmission prohibited without written permission (same registration No. 2025/14830 on both). Therefore: **no RAG ingestion, no OCR storage, no chunks, no embeddings, no vector index, no runtime PDF access, no illustration extraction, no shipped book text, no user-facing citations.** Human background reading is allowed; abstract methodology extraction is deferred to **after G1** under the Human-Governed Methodology Extraction policy. The PDFs are **not in the repo**.

## Current HOLD / BLOCKED tracks

- **Methodology Extraction** — HOLD until after a genuine S2 live run + independent human scoring + explicit **G1 GO**. Pre-G1 lesson drafting was quarantined to branch `hold/methodology-extraction-pre-g1` (`validation/reports/METHODOLOGY-EXTRACTION-PRE-G1/SCOPE_CORRECTION_REPORT.md`).
- **S4 (persistence)** — must not begin until S2 completes and G1 is recorded.

## Debt logs

- `docs/ASSET_LICENSING_DEBT_LOG.md` — 44/44 montage assets unverified/high-risk; must close before public/paid beta.
- `docs/SECURITY_DEBT_LOG.md` — Next.js transitive advisories (dev-only + `sharp` runtime, latent until artwork renders via `next/image`).
- `docs/UX_DEBT_LOG.md` — UX-DEBT-001 closed (persona mapping, Sprint 4).


---

<!-- ===== SOURCE FILE: 03_KNOWLEDGE_SYSTEM.md ===== -->

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


---

<!-- ===== SOURCE FILE: 04_EVALUATION_AND_SAFETY.md ===== -->

# 04 — Evaluation and Safety

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `scripts/evaluation/`, `src/types/evaluation.ts`, `data/evaluation/`, `src/__tests__/unit/zero-tolerance-invariants.test.ts`, `src/server/intake/`, `docs/02-ETHICAL_CONSTITUTION.md`.

---

## Evaluation corpus

- **24 fixed cases** — `data/evaluation/cases/cases.json`. Cover all 5 personas, all 4 question domains, easy/hard question mix, all 4 crisis flags, 2 prompt-injection, 2 red-line-boundary cases.
- **Case governance disclosed honestly:** `authoredBy`/`reviewedBy`/`adversarialReviewedBy` are all `"claude"` at this commit — **no independent human review yet** (stated in each risk-tagged case's notes). This is disclosed debt, not hidden.
- Schema: `EvaluationCaseSchema` (`src/types/evaluation.ts`), lifecycle `draft → reviewed → active`, mandatory adversarial review for risk-tagged cases before `active`.

## MockProvider results (harness baseline)

- `npm run evaluation:run` runs all active cases against `MockProvider`. Latest baselines: 24 cases, fallback rate 0.0%, latency p50/p95 ≈ 0ms, **zero zero-tolerance violations**.
- **These are harness-mechanics proof only.** Mock never calls a real model, so `totalInputTokens`/cost are structurally 0 and quality is not represented.

## Anthropic live-run status

- **NOT EXECUTED.** `data/evaluation/runs/live-anthropic-*/live-anthropic-status.json` reads `NOT EXECUTED / credentials unavailable`, harness `VERIFIED`. The dev environment has no `ANTHROPIC_API_KEY` or confirmed network path.
- **S2 tooling is ready** for a real local run: `evaluation:live-preflight`, `evaluation:live-anthropic [-- --retain-raw]`, `evaluation:scrub-artifacts`, `evaluation:cost`, `evaluation:compare` (blind Mock-vs-Claude), `evaluation:cleanup-raw`. Default evaluated model `claude-sonnet-5` (`ANTHROPIC_MODEL`-overridable).
- **No real quality/latency/cost baseline exists yet.** Producing it is a Product-Owner local action, and is a precondition for the G1 decision.

## OpenAI status

- **Not used.** The project integrates **Anthropic Claude only** (narration provider) with a deterministic MockProvider fallback. There is no OpenAI/GPT code path in the repository.

## Crisis routing (`src/server/intake/` + route)

- Intake computes `safetyFlags` server-side (`keywords.ts`, `safety.ts`). If any crisis flag is present (`isCrisisFlag`), the API route returns a crisis-support response with Türkiye resources (İntihar Önleme 0312 380 9098, ALO 183, Polis 155, Acil Tıp 112) and performs **no draw, no provider call, no tarot narration** (`src/app/api/readings/route.ts`, `docs/02-ETHICAL_CONSTITUTION.md`). Crisis text is never logged (only that a short-circuit occurred).

## Red-line rules

- `reading-engine/validate.ts` enforces forbidden-phrase / ethical red lines on provider output; violations cause a full fallback to Mock (classified `red-line-rejected`), never partial pass-through.
- Ethical constitution (`docs/02-ETHICAL_CONSTITUTION.md`) forbids certain prophecy, death/pregnancy/illness prediction, professional (medical/legal/financial) conclusions, etc.

## Zero-tolerance invariants (`src/__tests__/unit/zero-tolerance-invariants.test.ts`)

Five hard gates, proven against the real `POST` handler (not just isolated functions):
- **#9** schema-invalid output never reaches a caller.
- **#10** a crisis case never produces tarot content (`status: 'crisis'`, cards/interpretation/provider undefined).
- **#11** no provider reorders/adds/drops cards (deterministic ground truth holds; reordered fake Claude response rejected → Mock).
- **#12** `ANTHROPIC_API_KEY` never leaks into an error message.
- **#13** no unvalidated provider output is ever returned.
- The harness (`scripts/evaluation/run.ts`) also fails the entire run (`process.exit(1)`) on any `zeroToleranceViolations` entry, independent of quality/cost.

## Rubric scoring (`RubricScoreSchema`)

- Human-only narration-quality scoring is schema-built (`scoredBy` rejects AI actors). **No RubricScore records exist yet** — no narration has been scored (real or Mock). Founder + independent scoring are S2/G1 preconditions.

## Safety tests (broader)

`src/__tests__/unit/` includes `intake-engine`, `persona-mapping`, `claude-provider`, `interpretation-provider`, `evaluation`, plus S2 (`evaluation-s2-tooling`) and S3 (`observability-s3`) suites. Structured logs never carry question/reflection/crisis text (redaction test, `observability-s3.test.ts`).


---

<!-- ===== SOURCE FILE: 05_SPRINT_STATUS.md ===== -->

# 05 — Sprint Status

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md`, sprint plans `docs/SPRINT_S*_*.md`, evidence reports `validation/reports/`.

---

## Phase-2 roadmap (S0–S9)

| Sprint | Title | Status at `5e0a5bb` |
|---|---|---|
| **S0** | Governance & guardrails (docs-only) | **PASS** — ADR-014 accepted, Prisma superseded, exit criteria labeled, branch-migration proposal (`validation/reports/SPRINT-0-GOVERNANCE/`). |
| **S1** | Commercially-safe visual system (3-card pilot) | **PROPOSAL DELIVERED — AWAITING DIRECTION LOCK & ASSET PROCUREMENT.** |
| **S2** | Real Anthropic evaluation tooling | **IMPLEMENTATION COMPLETE — LIVE RUN PENDING.** |
| **G1** | STOP/HOLD gate — live-model | **NOT REACHED** (needs the S2 live run + scoring). |
| **S3** | CI gates, staging, observability, main-migration prep | **IMPLEMENTATION COMPLETE — STAGING DEPLOY PENDING.** |
| **S4** | Persistence, privacy, continuity (Drizzle) | **NOT STARTED** — blocked until S2 complete + G1 recorded. |
| **S5** | Premium mobile UI & clarity | Planned. |
| **S6** | Analytics & experiment framework | Planned. |
| **S7** | Closed beta (10–20 users) | Planned. |
| **G2** | STOP/HOLD gate — post-beta | Planned. |
| **S8** | Monetization experiment | Planned. |
| **S9** | Investor evidence pack | Planned (partial artifacts started: `validation/investor-readiness/ASSET_LICENSE_MANIFEST.md`). |

Approved cadence: S0–S3 as a parallel block; S1/S2/S3 each with separate evidence, commits, closure. **S4 not before S2 + G1.**

## S1 — current status

- **Delivered (`validation/reports/SPRINT-S1-VISUAL-PILOT/`):** visual-direction proposal (`docs/visual/VISUAL_DIRECTION_PROPOSAL_v0.1.md`) for Fool/Hermit/Star; production asset gate (`src/types/asset-license.ts`, `scripts/assets/validate-assets.ts`, `npm run assets:validate`); pilot license manifest (`data/assets/pilot-license-manifest.json`); investor manifest.
- **Gate correctly fails all 3 pilot production assets** (unverified, no rights) — the honest state.
- **Pending (Product Owner):** lock the visual direction (4 open decisions); commission/license the 3 pilot cards; record rights so the gate passes. Montage assets are non-production (D3). Longest-lead item.

## S2 — current status

- **Delivered (`validation/reports/SPRINT-S2-LIVE-EVAL/`):** safe local-run procedure (`docs/evaluation/LIVE_RUN_PROCEDURE.md`), preflight, secret scrubber, secret-safe `--retain-raw` flow (default OFF, git-ignored, 7-day cleanup), blind Mock-vs-Claude comparison, cost calculator (records model/date/prompt-version/tokens/USD/latency/fallbacks/schema-failures/red-line/zero-tolerance).
- **Pending (Product Owner):** genuine local Anthropic run, scrubbed artifacts, founder scoring, independent human subset scoring, Mock-vs-Claude delta, **G1 decision**. S2 cannot be PASS without these.

## S3 — current status

- **Delivered (`validation/reports/SPRINT-S3-CI-STAGING/`):** CI code gates (`.github/workflows/code-gates.yml`), Vercel preview config (`vercel.json`), request IDs (`src/middleware.ts`), redacted logging (`src/server/observability/log.ts`), rate limiting (`rate-limit.ts` + route), health endpoint (`src/app/api/health/route.ts`), deploy runbook + staging-secrets + Vercel + main-migration checklist (`docs/deploy/`).
- **Pending (Product Owner GitHub/Vercel actions):** create the Vercel project + preview secrets; run the `main` default-branch + branch-protection migration. No production deploy/DB (D3).

## G1 conditions (must all hold to record GO/HOLD/STOP)

1. Genuine local Anthropic run executed. 2. Zero secret leakage (scrubber-verified). 3. Schema + red-line results recorded. 4. Cost + latency data. 5. Founder scoring. 6. Independent human subset scoring (Selin Naz Çokyaşar pending; else a named alternative). 7. Mock-vs-Claude delta. 8. **G1 GO/HOLD/STOP recorded.**

## Blocked work

- **S4 persistence** — blocked on S2 + G1.
- **Methodology extraction** (both Bill Store books) — HOLD until after G1 (independent-source, human review, PO lock rules apply).

## Immediate next actions (Product Owner)

- Run S2 locally (few USD of credits) → founder + independent scoring → **record G1**.
- Lock S1 visual direction + commission the 3 pilot cards with documented rights.
- Create Vercel project + run the `main` migration for S3.


---

<!-- ===== SOURCE FILE: 06_REPOSITORY_MAP.md ===== -->

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


---

<!-- ===== SOURCE FILE: 07_DECISION_LOG_DIGEST.md ===== -->

# 07 — Decision Log Digest

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `docs/DECISION_LOG.md` (14 recorded ADRs) + Sprint-0/Phase-2 governance changes.

---

## Accepted ADRs (concise)

| ADR | Decision | Status |
|---|---|---|
| 001 | 22 Major Arcana only (not 78) for MVP | Accepted |
| 002 | Reversed cards excluded; upright only; no certain prophecy | Accepted |
| 003 | Next.js 16, Route Handlers, no separate backend, no monorepo | Accepted |
| 004 | 3-layer reading engine (deterministic → synthesis → LLM narration) | Accepted |
| 005 | Persona-aware readings | Accepted |
| 006 | Passwordless auth (Auth.js magic link + Google) | Accepted (direction; not built) |
| 007 | Cooldown + metered free tier; no unlimited (anti-addiction) | Accepted |
| 008 | 100-user controlled test before full launch | Accepted |
| 009 | PostgreSQL + Drizzle ORM (not Mongo/SQLite/Prisma) | Accepted |
| 010 | Vercel deploy + managed Postgres | Accepted (direction; not built) |
| 011 | Interpretation knowledge architecture — LLM narration-only | Accepted |
| 012 | Knowledge Layer between Engine and Provider; ground-truth invariant extends | Accepted |
| 013 | Branch succession; deprecate `claude/tarot-ai-mvp-setup-h2fyf7`; freeze `feat/major-arcana-asset-migration` | Accepted |
| 014 | Insight Cadence Model (Daily/Weekly/Threshold) as MVP hypothesis + guardrails | Accepted (hypothesis, not validated behavior) |

## Superseded decisions

- **Prisma persistence recommendations** (in `docs/MVP_PLAN_FINAL.md`, `MVP_PLAN_REVISED.md`, `MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.0.md`) → **SUPERSEDED by ADR-009 (Drizzle)** (Sprint 0). Prisma must not be introduced.
- **`docs/10-MVP_EXIT_CRITERIA.md`** → relabeled TARGET STATE, not current state (assumes auth/Posthog/Sentry/Vercel/GDPR that do not exist yet).
- **Book-RAG track** (`docs/BOOK_RAG_INGESTION_PROPOSAL_v1.0.md`) → **SUPERSEDED** by Human-Governed Methodology Extraction (RAG withdrawn); the pre-G1 lesson-drafting implementation was **quarantined** (branch `hold/methodology-extraction-pre-g1`) as unauthorized early scope.
- ADR-013 succeeded the old active branch name (asset-migration → milestone-3 lineage).

## Unresolved / deferred decisions (named, not yet ADRs)

From `docs/DECISION_LOG.md` "Future Decision Points" and Phase-2 open items:
- **Persistence architecture details** (S4) — Drizzle direction set (ADR-009); host + schema pending; blocked on G1.
- **Analytics & evaluation at scale** (S6) — first-party Postgres events intended, no third-party SDK; not built.
- **Deployment architecture** — Vercel preview built (S3); production + `main` protection are Product-Owner GitHub/Vercel actions, not executed.
- **Production asset licensing** (S1) — original deck direction proposed; art not commissioned; rights undocumented.
- **Live provider integration proof** — Anthropic harness ready; no real run; **G1** pending.
- **Citation / source governance at scale**, **knowledge ingestion at scale** — Milestone-3+, deferred (ADR-011/012 deferral list).
- **Monetization** (S8) — no pricing locked before user evidence.
- **Second Bill Store book** — registered lineage-only related edition; methodology extraction deferred to after G1.

## Governance meta

Total recorded ADRs: **14**. Pending review: 0. Rejected (documented): 0. New accepted decisions get the next sequential ADR number when written (no reserved placeholders).


---

<!-- ===== SOURCE FILE: 08_INVESTOR_READINESS.md ===== -->

# 08 — Investor Readiness

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `docs/INVESTOR_READY_MVP_GAP_ANALYSIS_v1.0.md`, `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md`, `validation/reports/`, `validation/investor-readiness/`.

---

## Current product classification

**Functional product prototype** (Phase-1 audit verdict). Past a technical prototype (a real, gate-green end-to-end product spine), short of a closed-beta-ready MVP. Not yet an investable early-stage company. Recommendation on file: **GO WITH REVISIONS.**

## Evidence completed (verified in-repo)

- **Engineering discipline:** clean install; `lint` 0, `typecheck` 0, `test` **201/201**, `build` 0; knowledge + evaluation harness commands run.
- **Architecture boundaries enforced in code:** intake server-side; crisis gate before any draw/provider call; provider narration-only with card-order verification + fallback; five zero-tolerance invariants proven against the real handler.
- **Honest governance:** the live-Anthropic gate self-reports `NOT EXECUTED` rather than faking results; AI-authored content is disclosed as such; lock authority is human-only and schema-enforced.
- **S1/S2/S3 tooling delivered** with separate evidence reports; asset gate; secret-safe evaluation tooling; CI code gates + observability.
- **Investor-pack artifacts started:** `validation/investor-readiness/ASSET_LICENSE_MANIFEST.md`.

## Missing evidence (blocks investor-readiness)

- **Real model quality/cost/latency baseline** — no live Anthropic run yet (S2 pending; G1 not reached).
- **Legally clean visuals** — 0/44 montage assets licensed; original pilot art not produced; rights undocumented.
- **Persistence + deletion** — none (S4 not started); no return-to-reading or data-deletion capability.
- **Analytics/funnel** — none (S6).
- **Any real user evidence** — no activation/retention/usefulness/willingness-to-pay data.
- **Independent human review** — of the 24 eval cases and knowledge records (all currently AI-authored/self-reviewed).
- **Privacy policy + retention implementation** — not built.
- **Deployed staging** — S3 code ready; Vercel project + `main` migration are Product-Owner actions.

## Risks

**Technical**
- No real-provider proof that Claude beats the deterministic Mock enough to justify cost (the core G1 question).
- In-memory rate limiter (per-instance) until S4; `sharp`/`next` image CVE latent until artwork renders (S5).
- Default branch on GitHub is the ADR-013-deprecated lineage until the PO runs the `main` migration; CI code gates enforce only once `main` is protected.

**Legal**
- Montage card assets have unverified provenance/commercial rights (`docs/ASSET_LICENSING_DEBT_LOG.md`) — must close before paid/public beta.
- Two copyrighted Bill Store reference books: governed lineage-only (no ingestion); an IP lawyer should review the concrete methodology-extraction flow before commercial launch.

**Product/commercial**
- Cadence model (ADR-014) is an untested hypothesis; threshold-usage is deliberately low-frequency, tightening the monetization math.
- No target-segment validation, no measured cost-per-reading, no pricing tested.

## Kill / narrow criteria (from the gap analysis)

Reposition/stop if: users don't understand the value unassisted; live Claude adds no measurable edge over the deterministic fallback; users seek certainty over reflection; retention is negligible; unit economics can't close; licensing is uneconomical.

## Shortest credible path (Phase-2 order)

Legally clean visuals (S1) · real Claude eval + cost (S2 → **G1**) · deploy + CI + observability + branch fix (S3) · Drizzle persistence w/ guest-save + deletion (S4, after G1) · analytics (S6) · 10–20 user closed beta (S7) · one measured pricing test (S8) · investor evidence pack (S9). Evidence, not features, is the acceptance currency.


---

<!-- ===== SOURCE FILE: 09_CHANGELOG_RECENT.md ===== -->

# 09 — Recent Changelog

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `git log` on `claude/insight-engine-investor-audit-bkofgr`.

---

## Most recent meaningful commits (newest first)

| SHA | Summary | What changed | Why |
|---|---|---|---|
| `5e0a5bb` | Register 2nd Bill Store book lineage-only | `SourceGovernance`/`SourceRelationship` schemas (restriction booleans `literal(false)`), `sources.json` entry `modern-klasik-tarot-rehberi-2025` + reciprocal related-edition link, validator lineage/integrity checks, backlog note | Second copyrighted book governed like the first; duplicate lineage (same reg. No. 2025/14830) recorded so it never counts as an independent source |
| `82d5238` | S3 evidence report | `validation/reports/SPRINT-S3-CI-STAGING/` | Close S3 with honest status (staging deploy pending) |
| `72d0b16` | S3 implementation | `code-gates.yml`, `vercel.json`, `middleware.ts`, `observability/*`, `/api/health`, `docs/deploy/*` | CI gates, preview config, request IDs, redacted logging, rate limiting, health — operational backbone |
| `8ef68c4` | S1 evidence report | `validation/reports/SPRINT-S1-VISUAL-PILOT/` | Close S1 (proposal delivered, awaiting lock) |
| `3a1108c` | S1 implementation | `docs/visual/`, `src/types/asset-license.ts`, `scripts/assets/`, `data/assets/`, manifest | Visual-direction proposal + production asset gate (D3) |
| `811f262` | S2 evidence report | `validation/reports/SPRINT-S2-LIVE-EVAL/` | Close S2 (implementation complete, live run pending) |
| `5376fc6` | S2 implementation | `scripts/evaluation/{preflight,scrub-artifacts,compare,cost,cleanup-raw}.ts`, `lib/{pricing,scrub,raw}.ts`, `live-anthropic --retain-raw`, model in manifest | Safe local-run tooling for the real Anthropic evaluation |
| `3283eb2` | Quarantine pre-G1 methodology extraction | Reverted draft lessons + lesson tooling from the active line; kept lineage-only source + rights schema + backlog; added scope-correction report | Corrective action — earlier lesson drafting exceeded approved pre-G1 scope |
| `0ff7d91` | Sprint 0 governance | ADR-014 accepted, Prisma superseded, exit criteria labeled, branch proposal | Convert cadence draft to accepted ADR; resolve doc conflicts |
| `2448a1c` / `95c7209` | Phase-2 plan / Phase-1 gap analysis | `docs/INVESTOR_READY_MVP_*` | Investor-ready audit + execution plan |

## What changed, overall (this session's arc)

1. **Phase-1 audit** classified the project a Functional product prototype and ranked blockers.
2. **Phase-2 plan** approved (GO WITH REVISIONS); S0 governance landed (ADR-014, Prisma→Drizzle, exit-criteria labeling).
3. **Book knowledge** pivoted from RAG to **Human-Governed Methodology Extraction**; pre-G1 over-implementation was quarantined; both Bill Store books registered lineage-only as one family.
4. **S1/S2/S3** implemented in parallel to their honest ceilings; each with separate evidence and closure.

## Current clean-gate results (`5e0a5bb`)

| Gate | Result |
|---|---|
| `npm run lint` | 0 errors |
| `npm run typecheck` | 0 errors |
| `npm run test` | 15 files, **201 passed** |
| `npm run build` | 0 — routes `/`, `/_not-found`, `/api/health`, `/api/readings`, + Middleware |
| `npm run knowledge:validate` | OK — 6 sources, citations + related-source refs resolve, lineage warnings printed |
| `npm run assets:validate` | reports 3/3 pilot production assets NOT eligible (expected until rights documented) |

## Working tree

Clean at generation time (all work committed and pushed to `claude/insight-engine-investor-audit-bkofgr`).

