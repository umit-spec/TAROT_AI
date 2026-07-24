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
