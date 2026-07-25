# Sprint 0 — Governance & Guardrails — Build Evidence Report

**Date:** 2026-07-23
**Branch:** `claude/insight-engine-investor-audit-bkofgr` (based on `feat/insight-engine-milestone-3`)
**Governed by:** `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md` §S0 (APPROVED — Phase 2 GO WITH REVISIONS, Product Owner, 2026-07-23)
**Status:** **PASS** (docs-only). No implementation code changed.

---

## 1. Scope delivered (exactly the four approved docs-only tasks)

1. **ADR-014 written** — `docs/DECISION_LOG.md`. The previously-draft "Insight
   Cadence Model" section is now **ADR-014: Insight Cadence Model for MVP
   Validation, Status: Accepted**. Framed explicitly as an **MVP hypothesis
   and product constraint, not validated user behavior** (per decision D1).
   Adds hard behavioral guardrails: no compulsive daily divination, no
   repeated same-question readings, Threshold tarot gated to named meaningful
   events. Daily/Weekly architecture explicitly deferred to future
   proposal-only sprints; MVP builds only the Threshold three-card loop. Decision
   count updated 13 → 14; sign-off line updated to include ADR-013 and ADR-014.

2. **Stale Prisma recommendations marked SUPERSEDED by ADR-009** (decision D2):
   - `docs/MVP_PLAN_FINAL.md` — SUPERSEDED banner on the Aşama-9 auth/persistence
     block; `Prisma` → `Drizzle (ADR-009)`; `schema.prisma` → `schema.ts (Drizzle
     schema — SUPERSEDES schema.prisma per ADR-009)`.
   - `docs/MVP_PLAN_REVISED.md` — same treatment.
   - `docs/MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.0.md` — the two lines that flagged
     the Prisma-vs-Drizzle conflict as *still open* are now marked **ÇÖZÜLDÜ /
     resolved (Sprint 0)** pointing at D2 and Neon+Drizzle in Phase 2 Sprint 4.
   - Verification: `grep -rni prisma docs/` returns **no un-annotated
     recommendation** — remaining hits are (a) the two investor docs that
     *describe* the conflict as a finding, and (b) lines that already carry
     "SUPERSEDES … Drizzle" text. Prisma is not introduced anywhere.

3. **Aspirational exit criteria labeled accurately** — `docs/10-MVP_EXIT_CRITERIA.md`.
   A prominent **"TARGET STATE, NOT CURRENT STATE"** banner now heads the file,
   naming the specific unbuilt stack it assumes (auth, persistence, analytics,
   Sentry, Vercel, Resend, rate limiting, GDPR deletion, real-user metrics),
   correcting ORM to **Drizzle (not Prisma)**, correcting analytics to
   **first-party PostgreSQL (no third-party SDK)** per D5, stating the **90-day**
   retention target per D4, and deferring authority to the Phase 2 plan and its
   ADRs where they differ.

4. **Default-to-`main` migration proposal produced** — `docs/DEFAULT_BRANCH_MIGRATION_PROPOSAL.md`.
   A PR-based, no-history-rewrite path (decision D5): create `main` at the real
   tip → Product Owner repoints default → branch protection with required
   code-gate checks → CI trigger fix lands in Sprint 3 (not S0) → retarget work,
   leave the frozen/deprecated branches untouched (ADR-013). Explicit
   ownership split marks the GitHub-side steps as **Product-Owner-only**
   (Claude cannot change repo settings), and honors "production not opened
   during S3" (D3). Includes acceptance criterion and a pointer-only rollback.

---

## 2. Docs-only proof — gates unaffected

Sprint 0 changed only files under `docs/`. Diff scope (verified `git diff --stat`):

| File | Change |
|---|---|
| `docs/DECISION_LOG.md` | ADR-014 accepted; count 13→14 |
| `docs/MVP_PLAN_FINAL.md` | Prisma → Drizzle SUPERSEDED banner |
| `docs/MVP_PLAN_REVISED.md` | Prisma → Drizzle SUPERSEDED banner |
| `docs/MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.0.md` | Prisma conflict marked resolved |
| `docs/10-MVP_EXIT_CRITERIA.md` | TARGET-STATE banner |
| `docs/DEFAULT_BRANCH_MIGRATION_PROPOSAL.md` | new proposal (untracked → added) |
| `validation/reports/SPRINT-0-GOVERNANCE/BUILD_EVIDENCE_REPORT.md` | this report |

No file under `src/`, `scripts/`, `data/`, `assets/`, `package.json`, or CI
config was touched. The five engineering gates were re-run only to confirm the
docs edits disturbed nothing (results recorded at closeout).

## 3. What Sprint 0 does NOT do (scope discipline)

- Does not change the default branch or any GitHub setting (Product-Owner action, Sprint 3).
- Does not edit CI config (that is Sprint 3 code work).
- Does not write persistence/analytics/deploy ADRs — the Neon+Drizzle (D3),
  90-day retention (D4), and first-party-analytics (D5) decisions are recorded
  here as **forward guidance** and become their own ADRs at Sprint 3/S4/S6
  start, not now.
- Does not touch any code, asset, or evaluation artifact.

## 4. Status

**PASS** — all four approved docs-only tasks delivered, docs-only confirmed,
no scope creep. Ready for the S1/S2/S3 parallel block on Product-Owner go.
