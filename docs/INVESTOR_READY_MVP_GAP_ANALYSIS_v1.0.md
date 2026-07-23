# Investor-Ready MVP — Gap Analysis v1.0

**Date:** 2026-07-23
**Author role:** Combined technical due-diligence / product / safety / analytics / investor red-team review
**Branch audited:** `feat/insight-engine-milestone-3` (tip `f24863c`)
**Working branch for this report:** `claude/insight-engine-investor-audit-bkofgr` (based on the audited tip)
**Status of this document:** Audit findings only. No implementation code is proposed or written here. This is Phase 1 output; Phase 2 (`INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md`) is not written until this is reviewed.

> Method note: every claim below is tagged **[verified]** (I ran it or read the file), **[partial]** (evidence exists but is incomplete), **[claimed]** (a repo document asserts it but I could not independently confirm), or **[missing]** (no evidence found). Nothing here is graded PASS because code was written.

---

## 1. Executive verdict

**Classification: Functional product prototype.**

Not lower (it is past "technical prototype"): there is a real, end-to-end browser flow — consent → question → server-side intake → crisis gate → deterministic draw → knowledge resolution → narration provider → schema + red-line validation → versioned API → rendered reading — and all five engineering gates are green on a clean install (§3). This is a working product spine, not a set of libraries.

Not higher (it is short of "closed-beta-ready MVP") for four independent reasons, **any one of which alone blocks a paid or public beta**:

1. **0 of 44 visual assets have confirmed commercial rights** [verified — `docs/ASSET_LICENSING_DEBT_LOG.md`, all 44 rows `unverified`/`high`].
2. **No real-model quality data exists.** Every quality/latency/cost number in the repo is against `MockProvider`; the live Anthropic run reports `NOT EXECUTED / credentials unavailable` [verified — `data/evaluation/runs/live-anthropic-2026-07-23T14-30-58-719Z/live-anthropic-status.json`].
3. **No persistence, no accounts, no deployment.** A user cannot return to a prior reading or delete data; the app runs only on a local dev server [verified — no DB/ORM/auth dependency in `package.json`, no deploy config in repo].
4. **No real user has ever used it.** Zero activation, retention, or willingness-to-pay evidence [missing].

**Blunt reason:** The engineering discipline is genuinely strong and unusually honest (the Live Anthropic gate *reporting its own non-execution* instead of faking a number is a credibility signal, not a defect). But investability is currently gated by things that are *not more backend*: clean legal assets, real model data, real user behavior, and measured payment intent. The project has been building the machine that measures the product faster than it has been producing the product's real-world evidence.

---

## 2. Evidence inventory

### Verified (I ran it or read the artifact)
- `npm install` clean (exit 0); `npm run lint` 0 errors; `npm run typecheck` 0 errors; `npm run test` **168/168** across 12 files; `npm run build` 0 (routes `/`, `/_not-found`, `ƒ /api/readings`). [verified this session]
- `knowledge:validate` (6 records, all citations resolve; 3 governance warnings that author===reviewer under `singleOperatorMode`), `knowledge:check-conflicts` (no blocking conflicts), `knowledge:build` (3 locked records → pilot bundle), `evaluation:run` (24 cases, 0.0% fallback, 0 zero-tolerance violations). [verified this session]
- Architecture boundaries as coded: intake computed server-side (`api/readings/route.ts` recomputes `classifyIntake`, request schema has no persona/safety fields to trust); crisis gate short-circuits before any draw/provider call; provider is narration-only with card-order verification and fallback. [verified — read `src/app/api/readings/route.ts`, `src/app/page.tsx`, ADR-011/012, zero-tolerance test file]
- 44 shipped image assets (22 cards × web+HQ), all sourced from one user-provided montage `1000214766.png`, provenance `approved-for-prototype`, license "to be confirmed". [verified — `docs/ASSET_LICENSING_DEBT_LOG.md`]
- Remote default branch (HEAD) = `claude/tarot-ai-mvp-setup-h2fyf7`, the branch ADR-013 declares deprecated. [verified — `git ls-remote --symref origin HEAD`]
- CI (`.github/workflows/validation-gates.yml`) validates only docs/validation-OS artifacts; triggers on PRs to `main`/`dev` for `validation/**` and `docs/AŞAMA_*` paths; **does not run lint/typecheck/test/build**. [verified — read the workflow]

### Partially verified
- Zero-tolerance security invariants (#9–#13): proven **against Mock and the real POST handler**, not against a live model [partial — `zero-tolerance-invariants.test.ts` passes; but no live-provider path exercised].
- Knowledge governance / human-lock lifecycle: mechanism exists and is tested (schema rejects `scoredBy: "claude"`), but every current record and eval case is AI-authored/AI-reviewed; the one human identity (`umit`) is author===reviewer, flagged by the validator itself [partial].

### Claimed but unverified
- Narration quality, latency, token cost of the real Claude provider — **do not exist** as data; the harness is ready but has never run against Anthropic [claimed-ready only].
- "MVP Exit Criteria" (`docs/10-MVP_EXIT_CRITERIA.md`) references auth, Drizzle/PostgreSQL, Posthog, Sentry, Vercel, Resend, 50–100 users, GDPR deletion — none of these exist in the codebase; the doc is an aspirational rubric, not a state description [claimed].

### Missing
- Any persistence / account / reading-history / deletion capability.
- Any deployment, staging environment, runbook, error monitoring, rate limiting, or request-ID/observability layer.
- Any analytics/event instrumentation (no client or server event emission).
- Any real user, session, funnel, retention, or willingness-to-pay data.
- Any privacy policy, terms, or data-retention implementation.
- An accepted ADR for the "Insight Engine" cadence/positioning (it is an explicit *draft*, `DECISION_LOG.md`).

---

## 3. Architecture review

| Dimension | Finding | Grade |
|---|---|---|
| Correctness | Product spine works end-to-end; deterministic draw is the sole card authority; intake recomputed server-side. | [verified] strong |
| Maintainability | Small, layered, typed (TS strict); provider/knowledge boundaries are interfaces (`InterpretationProvider`, `KnowledgeProvider`), swappable without moving call sites. | [verified] strong |
| Provider boundaries | ADR-011/012 enforced in code: LLM narrates, never selects/reorders/originates meaning; a deliberately reordered fake Claude response is rejected and falls back to Mock. | [verified] strong |
| Determinism | Seed-based draw; reproducibility asserted by tests. | [verified] strong |
| Safety | Crisis flags short-circuit before draw/provider; red-line + Zod validation gate all provider output; API key never logged (tested). | [verified] strong (against Mock) |
| Observability | **None in product runtime.** No structured logging, request IDs, metrics, error monitoring. Evaluation harness produces offline artifacts only. | [missing] **gap** |
| Test value | 168 tests are real behavioral assertions, not smoke tests (invariants run through the actual POST handler). Coverage of persistence/deploy paths is N/A because those paths don't exist. | [verified] strong-but-scoped |
| Deployment readiness | No deploy target, no env-var provisioning story beyond local, no CI code gates. | [missing] **gap** |
| Data model readiness | Reading/knowledge/eval schemas are mature; **no persistence schema at all** (ADR-009 locks Drizzle/PostgreSQL but nothing is implemented). | [missing] **gap** |
| Secret handling | `loadClaudeProviderConfig` reads `process.env`, never logs `apiKey`; `.env*` git-ignored; a test asserts the key never appears in error messages. | [verified] strong |
| Failure modes | Provider error / schema-invalid / red-line-rejected each classified (`fallbackReason`) and fall back to Mock, observably. | [verified] strong |

**Net:** The core engine is the strongest part of the company and is close to production-grade *for what it covers*. The gaps are entire missing layers (persistence, deploy, observability, analytics), not defects in what exists.

---

## 4. Product review

| Dimension | Finding |
|---|---|
| Onboarding clarity | A consent modal + question form exist; **never tested on an unassisted user** — clarity is unproven [missing evidence]. |
| Time to first value | Technically fast (mock latency ~0–4ms; deterministic draw instant). Real end-to-end time depends on live Claude latency, which is unmeasured. |
| Mobile usability | `prefers-reduced-motion` handled; components exist; **no evidence of testing at 375px or on a device**. UX Design Contract (Sprint 4) is a spec, not a validated UI. |
| Emotional safety | Strong by construction: crisis content never reaches tarot; Türkiye crisis resources hard-coded; disclaimer footer present. |
| Visual quality | Functional shell; card artwork is legally unusable (§6) and design is not brand-approved. |
| User motivation / repeat-use | The *intended* model (Daily/Weekly/Threshold) is a draft, not built. Current app is single-shot; no reason-to-return exists in code. |
| Differentiation | The "insight at thresholds, not daily fortune-telling" thesis is genuinely differentiated **if** validated — currently an untested hypothesis. |
| Cadence model | Draft decision only (`DECISION_LOG.md`), no schema, no UI. |
| Free vs paid value | Undefined in product; monetization constitution exists on paper only. |

**Net:** This is a well-governed *reading generator*, not yet a *product experience*. The single most important unknown — does a real person understand it and find it useful without explanation — has never been tested.

---

## 5. Commercial review

- **Target user:** Not empirically defined. Intake taxonomy implies 5 personas, but no evidence which (if any) will pay.
- **Core job-to-be-done:** Hypothesis = "help me structure reflection at a meaningful decision/threshold." Untested.
- **Monetization hypothesis:** `09-MONETIZATION_CONSTITUTION.md` + ADR-007 (metered free + premium) exist as intent; **no price has been shown to any user**.
- **Usage frequency:** Deliberately *low* by strategy (threshold, not daily) — which is ethically right but tightens the monetization math; a low-frequency product must extract more value per use or add the Daily/Weekly layers to justify subscription.
- **Model cost:** **Unknown** — no real token/cost measurement exists (the whole point of the P0 live-eval below). `MockProvider` reports 0 tokens.
- **Gross-margin risk:** Cannot be assessed until real cost-per-reading is known. This is the single biggest commercial blind spot.
- **Retention hypothesis:** Return-at-threshold is plausible but unproven and structurally hard to measure with few users.
- **Willingness-to-pay test:** None run.
- **Distribution:** No stated acquisition channel or CAC hypothesis.
- **Category/positioning:** "Personal insight system, tarot as first module" is a credible wedge but must survive contact with real users before it's a claim.

**Net:** Commercially this is pre-evidence. The technical maturity does **not** de-risk the commercial questions; those require users and real model economics.

---

## 6. Legal and trust review

| Dimension | Finding | Severity |
|---|---|---|
| Asset licensing | **0/44 verified.** Single montage source, creator/license unknown. Hard rule already on file: no public/paid beta while any row is `unverified`. | **P0 blocker** |
| Source/citation governance | Knowledge records carry sources and resolve citations (validator passes); mature relative to everything else. | ok |
| Privacy | No privacy policy, no data-handling implementation (nothing is stored yet, which is the only reason there's no active violation). | gap |
| Retention of sensitive questions | Free-text questions are sent to intake and (in future) to Claude; no storage today, no retention/minimization policy for when storage lands. | gap (latent) |
| Crisis handling | Strong: crisis short-circuits, resources shown, no tarot generated. | strong |
| Disclaimer quality | Disclaimer footer + constitution red lines present; not legally reviewed. | partial |
| AI disclosure | No user-facing "this is AI-generated" disclosure in the UI reviewed. | gap |
| User-data deletion | Not implemented (no data to delete yet; becomes mandatory the moment persistence lands). | gap (blocks persistence exit) |

---

## 7. Founder and operational risk

- **Founder dependency: high.** All knowledge records, eval cases, and reviews trace to a single human identity (`umit`) acting as both author and reviewer — the validator itself warns this is "pilot only, not production." Governance *mechanism* is good; governance *staffing* is one person.
- **Onboarding another developer: currently broken at the front door.** The remote **default branch is the ADR-013-deprecated `claude/tarot-ai-mvp-setup-h2fyf7`** — a fresh clone checks out the abandoned monorepo lineage, not the real work on `feat/insight-engine-milestone-3`. This is a concrete, cheap-to-fix onboarding trap.
- **Release process / CI/CD:** CI exists but only gates docs/validation artifacts and targets non-existent `main`/`dev` branches; **the code gates (lint/type/test/build) run only on a developer's laptop**. There is no deploy pipeline.
- **Runbooks / incident handling:** None (nothing is deployed to have incidents yet).
- **Evaluation repeatability:** Good — harness is deterministic and offline; artifacts are versioned.
- **Content governance:** Strong on paper (lifecycle, locks, red-team playbook), unstaffed beyond one person.

---

## 8. Investment blockers (ranked)

For each: evidence · impact · smallest responsible fix · owner · acceptance criterion · effort · dependency.

### P0 — blocks public or paid beta

**B1. 44/44 visual assets have no commercial-use rights.**
Evidence: `ASSET_LICENSING_DEBT_LOG.md` (all `unverified`/`high`). · Impact: legally cannot ship a paid/public product; existential. · Fix: commission or license an original Major Arcana set (or verify public-domain provenance for a specific named historical deck) and record creator/license/commercial-use/modification evidence per asset. · Owner: Product Owner + designer/illustrator. · Acceptance: every shipped asset row is `verified-licensed`/`verified-public-domain`/`replacement-completed` with a real document at `evidence_location`. · Effort: M–L (external, days–weeks). · Dependency: none — start now, parallel to everything.

**B2. No real Anthropic evaluation exists.**
Evidence: `live-anthropic-status.json` = `NOT EXECUTED`. · Impact: model quality, latency, and **cost/unit economics** are entirely unknown; cannot prove Claude beats the deterministic fallback enough to justify its cost. · Fix: supply an `ANTHROPIC_API_KEY` locally, run `evaluation:live-anthropic` over the 24 cases, preserve raw artifacts, founder-score transparently, second-human-review a subset. · Owner: Founder (+ one independent reviewer). · Acceptance: real quality/latency/cost baseline recorded, **zero** security-invariant violations, Mock-vs-Claude value delta stated honestly. · Effort: S (a few USD of credits + a day). · Dependency: none.

**B3. No persistence / accounts / deletion.**
Evidence: no DB/ORM/auth in `package.json`; ADR-009 (Drizzle) unimplemented. · Impact: objective "user can return and delete data" unattainable; blocks any retention measurement. · Fix: minimal Drizzle schema (guest session, consent record, saved reading, reflection note, version metadata, deletion) — designed *after* reading the current API schema, not from the stale AŞAMA-9 plan. · Owner: Engineering. · Acceptance: a user returns to one prior reading and deletes their stored data. · Effort: M. · Dependency: resolve Prisma-vs-Drizzle doc conflict (B9) first; deploy target (B4).

**B4. Not deployed; no staging; no observability; no rate limiting.**
Evidence: no deploy config, no monitoring, no request IDs in repo. · Impact: another person cannot run it as a product; no beta is possible; no operational safety. · Fix: pick a Next.js-compatible target, add CI code gates + deploy, structured logging (no sensitive question text by default), error monitoring, rate limiting, request IDs, health check, runbook. · Owner: Engineering. · Acceptance: a second developer recreates a staging deployment from documented steps. · Effort: M. · Dependency: none to start; persistence (B3) needs a compatible data host.

### P1 — blocks a credible investor demonstration

**B5. CI does not run code gates; default branch is the deprecated lineage.**
Evidence: `validation-gates.yml` (docs-only, targets `main`/`dev`); remote HEAD = `claude/tarot-ai-mvp-setup-h2fyf7`. · Impact: green gates aren't enforced; new devs land on the wrong branch; both read as sloppiness in due diligence. · Fix: add a code-gate CI job on the real branch; repoint the default branch to the active line. · Owner: Engineering. · Acceptance: CI runs lint/type/test/build on PRs to the active branch; clone lands on the active branch. · Effort: S. · Dependency: none.

**B6. No analytics / funnel instrumentation.**
Evidence: no event emission in code. · Impact: a beta would produce no measurable behavior (objective 5). · Fix: smallest privacy-conscious event set (landing→consent, question-start, completion, time-to-first-insight, usefulness, reflection-completion, 7-day return, fallback exposure, crisis short-circuit count). · Owner: Product + Eng. · Acceptance: a beta session yields a complete, privacy-conscious funnel. · Effort: S–M. · Dependency: deploy (B4), persistence (B3) for return metrics.

**B7. Zero real-user evidence (activation / retention / usefulness / WTP).**
Evidence: none exists. · Impact: the core investor questions are unanswered; technical maturity does not substitute. · Fix: 10–20 user founder-led closed beta with consent + pre/post instruments. · Owner: Founder. · Acceptance: ≥10 users complete the flow, evidence recorded honestly (no PMF claim from 10–20). · Effort: M. · Dependency: B1 (legal visuals), B2 (real model), B3–B4 (return + hosting), B6 (measurement).

**B8. All knowledge + eval content is AI-authored and self-reviewed.**
Evidence: `authoredBy/reviewedBy/adversarialReviewedBy = "claude"`; validator flags author===reviewer. · Impact: safety/quality claims rest on one actor; a red team will discount them. · Fix: independent human review + adversarial re-check of the 24 cases (esp. 8 risk-tagged) and the pilot knowledge records; record named human reviewers. · Owner: Founder + one independent reviewer. · Acceptance: risk-tagged cases carry a distinct human `adversarialReviewedBy`. · Effort: S–M. · Dependency: none.

**B9. "Insight Engine" cadence/positioning is a draft, not an accepted ADR; stale Prisma docs contradict ADR-009.**
Evidence: `DECISION_LOG.md` draft section; `MVP_PLAN_*` AŞAMA-9 propose Prisma vs ADR-009 Drizzle. · Impact: risk of building the wrong product surface, and a persistence sprint starting on contradictory guidance. · Fix: Product Owner decision → accept/revise/reject the cadence model as a real ADR; write an ADR resolving Prisma→Drizzle explicitly and mark the stale plan sections superseded. · Owner: Product Owner. · Acceptance: an accepted ADR exists for both; no doc still directs Prisma. · Effort: S (decision + docs). · Dependency: none — should precede B3.

### P2 — reduces quality or scale

**B10. Latent `sharp`/`next` image-optimization CVE + aspirational exit-criteria doc drift.**
Evidence: `SECURITY_DEBT_LOG.md` (sharp becomes live runtime exposure when `next/image` renders artwork); `10-MVP_EXIT_CRITERIA.md` describes a stack (auth/Posthog/Sentry/Vercel/GDPR) that doesn't exist. · Impact: a real runtime CVE the moment card art is rendered through `next/image`; exit-criteria doc misleads a reader about current state. · Fix: at artwork-render time, confirm an upstream patch or serve pre-optimized WebP with `unoptimized`; annotate the exit-criteria doc as target-state. · Owner: Engineering. · Acceptance: no vulnerable code path reachable at runtime; exit doc labeled aspirational. · Effort: S. · Dependency: B1/UI work triggers the sharp condition.

### P3 — later
- Second spread type (`SpreadTypeSchema` only has `three-card`), rubric scoring of real narrations, expanding beyond 22 upright cards — all correctly deferred; keep deferred for the MVP.

---

## 9. Kill / narrow / reposition criteria

The Product Owner should **stop, narrow, or reposition** if, after the P0/P1 evidence work:

1. **Value not understood:** unassisted beta users cannot articulate what the product is for without explanation → reposition the framing before spending more on build.
2. **AI adds no real edge:** live Claude narration does not measurably beat the deterministic fallback on usefulness → drop or defer the paid LLM layer; the deterministic engine may be the product, at far better margins.
3. **Certainty-seeking dominates:** users repeatedly want prediction/certainty rather than reflection → the ethical positioning and the market are misaligned; narrow to a different audience or reframe.
4. **Negligible retention:** threshold-usage return intent is near zero and the Daily/Weekly layers don't move it → the subscription thesis fails; consider one-time-purchase or shelve.
5. **Economics don't close:** real cost-per-reading vs. plausible price and CAC cannot support a margin → narrow scope (deterministic-only, or fewer live calls) or stop.
6. **Licensing uneconomical:** commissioning/licensing a usable deck costs more than the near-term opportunity justifies → narrow to a text-first / minimal-visual product or stop.

---

## 10. Recommendation

**GO WITH REVISIONS.**

The engineering foundation is real, honest, and well-governed — strong enough to build a company on, and notably free of the usual "we'll fix it later" fictions (the self-reported `NOT EXECUTED` gate is the tell). But the project is a **functional product prototype**, not an investable company, and the next unit of value does **not** come from a seventh knowledge layer or more test infrastructure. It comes, in this order, from:

1. **Legally clean visuals** (B1) — start immediately, runs in parallel.
2. **Real Claude evaluation with real cost data** (B2) — cheap, unblocks the entire commercial argument.
3. **Deploy + CI code gates + observability, and fix the default-branch/CI trap** (B4, B5).
4. **Drizzle persistence with guest-save + deletion, after resolving the Prisma/positioning decisions** (B9 → B3).
5. **Analytics** (B6) → **10–20 user closed beta** (B7) → **one measured pricing/value test**.
6. **Independent human review of AI-authored knowledge/eval content** (B8), folded in along the way.

The "Revisions" are: (a) the Product Owner must convert the Insight-Engine cadence from draft to an accepted-or-rejected ADR before persistence work starts (B9); (b) evidence, not features, is the acceptance currency for every sprint from here; (c) no gate is marked PASS on code volume — only on the stated evidence.

**Phase 2 (`INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md`) is not written until this report is reviewed and the B9 decisions are made.**

---

### Appendix A — Commands run this session
`git` branch/status/log/ls-remote · `npm install` · `npm run lint` · `npm run typecheck` · `npm run test` (168/168) · `npm run build` · `npm run knowledge:validate` · `npm run knowledge:check-conflicts` · `npm run knowledge:build` · `npm run evaluation:run`. No live Anthropic run (no key). No knowledge promotion. No live-bundle modification. Generated artifacts from harness runs were reverted to keep the tree docs-only.

### Appendix B — Files inspected (primary)
`package.json` · `src/app/page.tsx` · `src/app/api/readings/route.ts` · `src/server/reading-engine/**` (index, providers/claude/*, mock, validate) · `src/server/intake/**` · `src/server/knowledge/**` · `src/types/**` · `data/cards/**`, `data/knowledge*/**`, `data/evaluation/**` (incl. live-anthropic status + readiness results) · `assets/tarot-cards/**` (44 webp + metadata) · `docs/DECISION_LOG.md` (ADR-001…013 + cadence draft) · `docs/ASSET_LICENSING_DEBT_LOG.md` · `docs/SECURITY_DEBT_LOG.md` · `docs/UX_DEBT_LOG.md` · `docs/10-MVP_EXIT_CRITERIA.md` · `docs/07-TECHNICAL_CONSTITUTION.md` · `docs/MVP_PLAN_*.md` (Prisma conflict) · `validation/reports/SPRINT-6-LIVE-EVALUATION/{BUILD_EVIDENCE_REPORT,BETA_READINESS_CHECKLIST}.md` · `.github/workflows/validation-gates.yml`.
