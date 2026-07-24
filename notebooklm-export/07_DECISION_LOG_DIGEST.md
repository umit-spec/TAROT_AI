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
