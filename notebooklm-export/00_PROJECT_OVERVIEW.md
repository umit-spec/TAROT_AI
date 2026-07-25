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
