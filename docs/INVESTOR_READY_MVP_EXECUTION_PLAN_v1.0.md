# Investor-Ready MVP — Execution Plan v1.0

**Date:** 2026-07-23
**Branch (planning):** `claude/insight-engine-investor-audit-bkofgr` (based on `feat/insight-engine-milestone-3`)
**Predecessor:** `docs/INVESTOR_READY_MVP_GAP_ANALYSIS_v1.0.md` (Phase 1 — APPROVED)
**Status:** PROPOSAL. No implementation code. Each sprint is executed only after its own Product-Owner approval, following the required working style (docs-only proposal → approval → implementation → clean-install gates → adversarial checks → evidence report → separate closeout commit).

---

## 0. Binding Product-Owner decisions this plan is built on

Recorded verbatim intent (2026-07-23), governing everything below:

- **D1 (B9a) — ADR-014 ACCEPTED:** "Insight Cadence Model for MVP Validation." Daily = lightweight reflection; Weekly = theme/pattern summary; Threshold = deep three-card tarot-guided reflection at meaningful events. It is an **accepted MVP hypothesis and product constraint, not validated user behavior**. No compulsive daily divination; no encouragement to re-read the same question.
- **D2 (B9b) — Drizzle authoritative (ADR-009).** All stale Prisma recommendations marked **SUPERSEDED**. Prisma must not be introduced.
- **D3 (B1) — Montage-derived assets are NOT production-eligible.** Plan for a fully original 22-card production deck with documented commercial rights. A verified public-domain deck may be a **temporary fallback only** if provenance + scan rights are documented.
- **D4 (B2) — Real Anthropic evaluation mandatory before closed beta.** Key supplied locally via `.env.local`; **never printed, logged, committed, or placed in any evidence artifact**. First live run is an **engineering baseline, not independent validation**.
- **D5 (B4) — No feature branch as permanent default.** Propose a PR-based path to establish `main` as the protected integration branch; CI + staging decisions belong to this plan.

> Governance note: recording ADR-014, marking Prisma SUPERSEDED, and the default-branch proposal are **docs-only** actions scheduled as Sprint 0 below. This plan file does not itself edit `DECISION_LOG.md`; Sprint 0 does, as its own reviewed step.

---

## 1. Operating principles for Phase 2

1. **Evidence is the acceptance currency.** No sprint is PASS because code was written — only against its stated evidence artifact.
2. **Status vocabulary (every item):** `PASS` · `PASS WITH DOCUMENTED DEBT` · `REVISE` · `FAIL` · `NOT EXECUTED`. Banned words ("production-ready", "validated", "secure", "scalable", "investor-ready") unless a specific gate + evidence is named.
3. **Three owners, never blurred:**
   - **[Claude]** — code, schema, tests, docs, harness, analytics instrumentation, CI config, runbooks. Reproducible, gate-checked.
   - **[Product Owner]** — supply credentials, procure/commission art, approve designs & copy, branch-protection change, recruit beta users, pricing decisions, sign-offs. **Cannot be done by Claude and must never be simulated by Claude.**
   - **[Second human]** — independent review distinct from author: eval-case adversarial re-check, second rubric scorer, legal review of privacy/terms, license verification. **A different person from the founder.**
4. **Two hard STOP/HOLD gates** (§after Sprint 2 and §after Sprint 6) — the plan does not flow past them on momentum.
5. **Scope discipline:** the MVP is one loop (question → safe intake → deterministic three-card reading → grounded narration → reflection → optional save → return at a threshold). Excluded: reversed cards, all 78 cards, second production provider, journaling/dream/symbol modules, unlimited readings, full RAG, native apps, i18n.
6. **Non-negotiables from the gap analysis carry forward:** Reading Engine sole card authority; intake server-side; crisis short-circuits tarot; provider output through Zod + red-line always; no API key in any artifact; no monorepo, no second backend; Drizzle not Prisma; upright-only.

---

## 2. Sprint map (sequence + dependency graph)

| Sprint | Title | Priority | Primary owner | Hard dependency |
|---|---|---|---|---|
| S0 | Governance & guardrails (docs-only) | P0-enabler | Claude + PO | — |
| S1 | Commercially-safe visual system | P0 | **PO/designer** + Claude tooling | S0 |
| S2 | Real Anthropic evaluation baseline | P0 | **PO (key)** + Claude harness | S0 |
| **G1** | **STOP/HOLD GATE — live-model** | — | PO | S2 |
| S3 | CI code gates + staging + observability + default-branch move | P0 | Claude + **PO (protection)** | S0 |
| S4 | Persistence, privacy & continuity (Drizzle) | P0/P1 | Claude + **second human (legal)** | S0(D2), S3 |
| S5 | Premium mobile UI & product clarity | P1 | **PO (design approval)** + Claude | S1, S3 |
| S6 | Analytics & experiment framework | P1 | Claude | S3, S4 |
| S7 | Closed beta (10–20 users) | P1 | **PO** + Claude instruments | S1,S2,S4,S5,S6 |
| **G2** | **STOP/HOLD GATE — post-beta** | — | PO | S7 |
| S8 | Monetization experiment | P1 | **PO (pricing)** + Claude | S6, S7 |
| S9 | Investor evidence pack | P1 | Claude assembles, PO/2nd-human attest | all above |

Critical path to a credible investor conversation: **S0 → S2 → G1 → S3 → S4 → S6 → S7 → G2 → S9**, with **S1** running in parallel from day 1 (longest external lead time) and **S5** slotting after S1+S3.

---

## 3. Sprint detail

Each sprint lists: Goal · Scope · **[Claude] / [PO] / [Second human]** split · Dependencies · Effort · Risks · Evidence artifacts · Acceptance (with status vocabulary).

### S0 — Governance & guardrails (docs-only)
- **Goal:** Land the binding decisions as durable governance before any code sprint starts.
- **Scope:** ADR-014 written into `DECISION_LOG.md` (accepted, framed as hypothesis-not-behavior); Prisma passages in `MVP_PLAN_FINAL.md`/`MVP_PLAN_REVISED.md`/`MILESTONE_2_*` annotated **SUPERSEDED → ADR-009 (Drizzle)**; `10-MVP_EXIT_CRITERIA.md` labeled target-state; asset-licensing hard rule reaffirmed; a written default-branch proposal drafted for PO (does not change protection itself).
- **[Claude]** all doc edits + the proposal text. **[PO]** approve ADR-014 wording; decide the default-branch mechanics in S3. **[Second human]** none.
- **Deps:** none. **Effort:** S (0.5–1 day).
- **Risks:** ADR-014 wording drifts into implying validated behavior — mitigated by explicit "hypothesis, not evidence" line.
- **Evidence:** ADR-014 in `DECISION_LOG.md`; a `SUPERSEDED` grep returning zero live Prisma recommendations; `docs/DEFAULT_BRANCH_MIGRATION_PROPOSAL.md`.
- **Acceptance:** `PASS` when ADR-014 is present + accepted, no doc still *recommends* Prisma, and the branch proposal exists. Gates unaffected (docs-only).

### S1 — Commercially-safe visual system  *(runs in parallel, longest lead)*
- **Goal:** Every shipped production visual asset has documented commercial permission.
- **Scope:** Decide path (original commission **preferred** per D3; verified public-domain only as documented temporary fallback). Produce/procure 22 upright Major Arcana. Build a **production asset gate** (metadata → `verified-licensed`/`verified-public-domain`/`replacement-completed`, evidence path required) and, where useful, visual-regression checks. Retire montage assets from any production path.
- **[Claude]** asset-gate script + schema, per-card license-manifest structure, visual-regression harness, wiring behind the gate, `next/image` `sharp` CVE mitigation (B10) at render time. **[PO]** commission artist / purchase license / choose fallback deck; provide license documents. **[Second human]** independent license verification (a person, not Claude, confirms each document actually grants commercial use).
- **Deps:** S0. **Effort:** L (external, days–weeks — start immediately).
- **Risks:** commission cost/timeline; fallback deck provenance weaker than assumed; style mismatch with brand (S5). Mitigate: begin procurement now; keep the gate blocking so nothing unverified ships.
- **Evidence:** `validation/investor-readiness/ASSET_LICENSE_MANIFEST.md`; per-asset license docs at recorded `evidence_location`; asset-gate CI check; `ASSET_LICENSING_DEBT_LOG.md` rows flipped off `unverified`.
- **Acceptance:** `PASS` only when **all** shipped assets are non-`unverified` with real documents; else `NOT EXECUTED`/`PASS WITH DOCUMENTED DEBT` (debt = still on fallback deck, blocks paid beta).

### S2 — Real Anthropic evaluation baseline  *(P0, cheap, unblocks economics)*
- **Goal:** A real-provider quality/latency/**cost** baseline exists, with zero security-invariant violations.
- **Scope:** Run the existing 24-case harness through the live Claude provider; capture latency, input/output tokens, **cost**, fallback reasons, schema failures, red-line failures; preserve raw run artifacts; founder transparent scoring; **second human** reviews a meaningful subset; compare Claude vs Mock — does Claude add enough value to justify cost/complexity?
- **[Claude]** execute `evaluation:live-anthropic` **if** the key is present in this environment; otherwise deliver an exact, reproducible run procedure for the PO/engineer to run locally, plus the analysis/report scaffolding and Mock-vs-live comparison tooling. **[PO]** supply `ANTHROPIC_API_KEY` via `.env.local` (never committed/logged); fund credits; do founder scoring. **[Second human]** score/cross-check a subset independently.
- **Deps:** S0. **Effort:** S (≈ a day + a few USD).
- **Risks:** key leakage (mitigated: `.env*` git-ignored, existing test asserts key never in errors, no key in any evidence artifact — **hard rule D4**); live quality underwhelms; cost higher than model assumptions.
- **Evidence:** `validation/investor-readiness/LIVE_MODEL_EVALUATION_REPORT.md` (marked engineering-baseline, founder-scored where founder-scored); raw run folder under `data/evaluation/runs/live-anthropic-*` (no secrets); `UNIT_ECONOMICS_BASELINE.md` seed (cost/reading).
- **Acceptance:** `PASS` = real baseline recorded, **zero** zero-tolerance violations, honest Mock-vs-live delta stated. `NOT EXECUTED` if no key is ever supplied — and then **G1 cannot be cleared and no closed beta may start** (D4).

### G1 — STOP/HOLD GATE (after live-model evaluation)
**Do not proceed to beta-track build (S4→S7) until the PO rules on S2 evidence.** Decision options, recorded as an ADR:
- **GO:** live Claude measurably beats deterministic fallback on usefulness at acceptable cost → continue.
- **HOLD:** quality/cost inconclusive → iterate prompts/cases, re-run, re-gate.
- **STOP/NARROW:** Claude adds no real edge over the deterministic engine → **ship deterministic-only** (better margins) or reposition; do not build a paid LLM layer on unproven value. (Kill-criterion #2 from the gap analysis.)

### S3 — CI code gates + staging + observability + default-branch move
- **Goal:** A second developer can recreate a staging deployment from documented steps; code gates run in CI; default branch is no longer the deprecated lineage.
- **Scope:** CI job running `lint/typecheck/test/build` on PRs to the integration branch; **PR-based path to establish `main` as protected default** (D5); a Next.js-compatible deploy target + staging; structured logging **without sensitive question text by default**; error monitoring; rate limiting; request IDs; provider latency/fallback dashboard; health check; deployment runbook + rollback.
- **[Claude]** CI config, logging/rate-limit/request-ID/health-check code, dashboards, runbook, the migration PR. **[PO]** approve deploy target/account, flip branch protection + default (GitHub-side action Claude cannot perform), provision deploy secrets. **[Second human]** none required.
- **Deps:** S0. **Effort:** M. **Runs parallel to S1/S2** (no dependency on their outcome).
- **Risks:** `sharp` CVE becomes live when artwork renders (coordinate with S1/S5 mitigation); accidental logging of question text (mitigate: default-redact, test it).
- **Evidence:** green CI on a PR; `validation/investor-readiness/ARCHITECTURE_DIAGRAM.md` + deploy runbook; `SECURITY_AND_SAFETY_SUMMARY.md` (secrets, rate limiting, redaction); a staging URL reproduced by a second person.
- **Acceptance:** `PASS` = CI runs code gates on the active branch, `main` is protected default, staging reproduced from docs, no sensitive text in default logs (proven by a test). Partial → `PASS WITH DOCUMENTED DEBT`.

### S4 — Persistence, privacy & continuity (Drizzle)
- **Goal:** A user can return to one prior reading and delete their stored data.
- **Scope (designed *after* reading the current API schema, not the stale AŞAMA-9 plan):** anonymous/guest session; consent record; optional account upgrade; saved readings; reflection note; knowledge/prompt/deck/algorithm **version metadata**; provider/fallback metadata; **deletion**; retention policy; **no storage of crisis content** unless explicitly justified; sensitive free-text minimization. Drizzle + PostgreSQL per ADR-009/D2.
- **[Claude]** Drizzle schema + migrations, guest-session + save + delete flows, retention/minimization logic, tests. **[PO]** choose managed Postgres host; approve retention window. **[Second human]** legal review of the privacy/retention model + a drafted privacy policy.
- **Deps:** S0 (D2 resolved), S3 (deploy/host). **Effort:** M.
- **Risks:** storing sensitive question text (mitigate: minimize + explicit consent + deletion); scope creep into full accounts (hold to guest + optional upgrade).
- **Evidence:** working return-to-reading + delete demo; `validation/investor-readiness/DATA_PRIVACY_AND_RETENTION.md`; schema + migration in repo; deletion test.
- **Acceptance:** `PASS` = guest returns to a prior reading and deletes their data end-to-end; crisis content not stored; privacy doc reviewed by a named non-founder.

### S5 — Premium mobile UI & product clarity
- **Goal:** Five unassisted users complete the flow without explanation (measured in S7; this sprint builds toward it).
- **Scope:** replace the functional shell with an **approved** mobile-first design contract (Claude does not invent the brand); real card artwork only after S1; optimize first-value timing; crisis state entirely outside the tarot experience; fallback/partial states shown without alarming normal users; skeleton/retry/network-error/accessibility states; test at real mobile viewports (375px).
- **[Claude]** implement the approved design, states, a11y, mobile layout, tests. **[PO/designer]** provide/approve the design contract, brand, copy. **[Second human]** none required (usability is measured in S7).
- **Deps:** S1 (art), S3 (deploy). **Effort:** M–L.
- **Risks:** Claude improvising brand → forbidden; blocked on S1 art (mitigate: build with licensed/placeholder-under-gate art, swap when S1 lands).
- **Evidence:** deployed staging UI; a11y check; viewport screenshots; `PRODUCT_DEMO_SCRIPT.md` draft.
- **Acceptance:** `PASS WITH DOCUMENTED DEBT` acceptable pre-beta; full `PASS` deferred to S7's unassisted-completion evidence.

### S6 — Analytics & experiment framework
- **Goal:** A beta session produces a complete, privacy-conscious funnel.
- **Scope:** smallest event set to answer: landing→consent, question-start, completed-reading, time-to-first-insight, usefulness score, reflection completion, 7-day return, threshold-vs-casual usage, free→paid intent, fallback exposure, crisis short-circuit count. **No unnecessary sensitive content collected.**
- **[Claude]** event schema, instrumentation, a `METRICS_DICTIONARY.md`, privacy-conscious storage aligned with S4. **[PO]** approve the event list + any third-party analytics choice. **[Second human]** none.
- **Deps:** S3, S4. **Effort:** S–M.
- **Risks:** over-collection (mitigate: dictionary review, no free-text in events); double-counting (mitigate: request IDs from S3).
- **Evidence:** `validation/investor-readiness/METRICS_DICTIONARY.md`; a dry-run funnel from synthetic sessions.
- **Acceptance:** `PASS` = every listed event fires correctly in a staging dry-run, no sensitive content in the event payloads.

### S7 — Closed beta (10–20 users)
- **Goal:** ≥10 users complete the flow; evidence recorded honestly (no PMF claim from 10–20).
- **Scope:** founder-led beta across ≥2 intended segments. Instruments: consent, pre-use expectation, post-reading usefulness, emotional-safety check, "felt personal", "helped me think more clearly", return likelihood, willingness-to-pay, preferred cadence, qualitative interview.
- **[Claude]** build/ship the instruments, consent capture, results aggregation, quote-collection-with-consent tooling. **[PO]** recruit + run users, conduct interviews, obtain consent. **[Second human]** optional independent read of qualitative results.
- **Deps:** S1, S2 (live model), S4, S5, S6. **Effort:** M (calendar-bound by recruiting).
- **Risks:** manufactured/founder-biased feedback (mitigate: structured instruments, honest recording, no invented testimonials); too few completions.
- **Evidence:** `validation/investor-readiness/BETA_RESULTS_REPORT.md`, `USER_QUOTES_WITH_CONSENT.md` (consented only), funnel from S6.
- **Acceptance:** `PASS` = ≥10 honest completions with recorded usefulness + return-intent + cadence-preference evidence; `PASS WITH DOCUMENTED DEBT` if fewer.

### G2 — STOP/HOLD GATE (after closed beta)
**Do not proceed to monetization/pricing or investor-pack finalization until the PO rules on S7 evidence.** ADR-recorded options:
- **GO:** users understand it unassisted, find it useful, show return intent + plausible WTP → proceed to S8/S9.
- **HOLD:** mixed signal → iterate product/positioning, re-run a beta slice.
- **STOP/NARROW/REPOSITION:** users don't grasp the value, seek certainty over reflection, or retention is negligible → reposition or narrow (kill-criteria #1, #3, #4).

### S8 — Monetization experiment
- **Goal:** At least one price/value proposition has **measured user intent**, not founder intuition. **No final pricing is locked before this evidence.**
- **Scope:** test hypotheses (free weekly reflection; monthly threshold-reading allowance; credits; subscription with journaling/weekly-summary value; one-time deep reading; founder waitlist / fake-door). Track **actual API variable cost per active user** (from S2 + S6).
- **[Claude]** fake-door/waitlist/pricing-test surfaces, intent instrumentation, cost-per-active-user rollup. **[PO]** choose which hypotheses to test; make any pricing decision (Claude proposes, PO decides). **[Second human]** none.
- **Deps:** S6, S7. **Effort:** S–M.
- **Risks:** premature price anchoring (mitigate: test intent, don't hard-code final price); tiny-sample over-reading.
- **Evidence:** `UNIT_ECONOMICS_BASELINE.md` (completed with real cost/active user); a pricing-intent result.
- **Acceptance:** `PASS` = ≥1 pricing/value proposition with measured intent + a real variable-cost figure; final pricing explicitly **not** locked.

### S9 — Investor evidence pack
- **Goal:** An investor can inspect evidence and distinguish verified facts from assumptions.
- **Scope:** assemble `validation/investor-readiness/` (13 artifacts): TECHNICAL_DUE_DILIGENCE_SUMMARY, PRODUCT_DEMO_SCRIPT, ARCHITECTURE_DIAGRAM, SECURITY_AND_SAFETY_SUMMARY, ASSET_LICENSE_MANIFEST, LIVE_MODEL_EVALUATION_REPORT, UNIT_ECONOMICS_BASELINE, BETA_RESULTS_REPORT, USER_QUOTES_WITH_CONSENT, METRICS_DICTIONARY, DATA_PRIVACY_AND_RETENTION, KNOWN_RISKS_AND_DEBT, 90_DAY_EXECUTION_ROADMAP. Every claim links to evidence; estimates marked estimates; founder-scored marked founder-scored; AI-authored marked AI-authored; **no manufactured testimonials**.
- **[Claude]** assemble/cross-link all artifacts from real evidence. **[PO]** attest business claims + sign off. **[Second human]** attest independent-review items (eval, license, legal).
- **Deps:** all above. **Effort:** M.
- **Evidence:** the folder itself, each file evidence-linked.
- **Acceptance:** `PASS` only when every investor-readiness gate in §4 is individually satisfied with named evidence.

---

## 4. Investor-readiness gates (must all pass before "investor-ready" is used)

- **Technical:** clean install · lint · typecheck · tests · build · staging deploy · deterministic reproducibility · CI code gates · error monitoring · rate limiting · rollback/runbook.
- **Safety:** zero crisis-to-tarot leakage · zero provider card reorder · zero schema-invalid UI output · zero API-key leakage · zero unvalidated provider output · reviewed crisis copy · non-prophecy / non-professional-advice framing.
- **Legal:** zero unverified production assets · commercial-rights evidence stored · privacy policy draft · retention/deletion implemented · AI-use disclosure.
- **Product:** unassisted mobile flow · core loop completed · first-value timing measured · ≥10 real beta completions · qualitative usefulness · return-intent · cadence preference.
- **Business:** real API cost baseline · expected monthly variable cost per active user · one tested pricing/value proposition · target segment stated · acquisition hypothesis stated · 90-day growth plan.
- **Team:** another person can run the app · another can follow deploy instructions · backlog prioritized · open risks visible · founder-only decisions identified.

---

## 5. Consolidated ownership split

**[Claude] can complete:** S0 docs; S1 asset-gate + regression + `sharp` mitigation; S2 harness execution/scaffolding + Mock-vs-live analysis; S3 CI + logging/rate-limit/observability + runbook + migration PR; S4 Drizzle schema/flows/deletion/minimization; S5 approved-design implementation + a11y; S6 analytics instrumentation + dictionary; S7 instruments + aggregation; S8 pricing-test surfaces + cost rollup; S9 assembly.

**[Product Owner] only (never simulated):** approve ADR-014 wording; commission/license art + provide documents; supply `ANTHROPIC_API_KEY` locally; choose deploy + Postgres hosts + provision secrets; flip default branch + protection to `main`; approve design/brand/copy; recruit + run beta; consent handling; pricing decisions; final sign-offs.

**[Second human, ≠ founder] only:** independent license verification; independent adversarial re-check of the 24 eval cases + pilot knowledge records; second rubric scorer; legal review of privacy/terms.

---

## 6. Cross-cutting risks

| Risk | Where | Mitigation |
|---|---|---|
| API-key leakage into logs/artifacts | S2, S3 | `.env*` ignored; existing key-never-in-error test; explicit "no key in evidence" rule (D4); log redaction test in S3 |
| Sensitive question text stored/logged | S3, S4, S6 | default-redact logs; free-text minimization; no free-text in events; deletion path |
| `sharp`/`next` CVE goes live on artwork render | S1, S5 | patch check or `unoptimized`/pre-optimized WebP at render time (B10) |
| Claude improvising brand/pricing | S5, S8 | design contract + pricing decided by PO; Claude proposes only |
| Founder-biased or manufactured beta evidence | S7 | structured instruments, consent, honest recording, no invented quotes |
| Building on unproven LLM value | G1 | STOP/NARROW to deterministic-only if Claude adds no measured edge |
| Momentum past a failing signal | G1, G2 | two hard gates, ADR-recorded decisions |

---

## 7. Open decisions required before/within Phase 2 execution

These are decisions this plan cannot make for the PO; listed with a recommendation.

1. **Asset path (S1):** original commission (recommended, per D3) vs. documented public-domain fallback first? Affects S1 lead time and S5 brand.
2. **Where S2 runs:** does the PO run `evaluation:live-anthropic` locally with the key, or provision a key into a Claude-accessible environment? (This remote environment currently has no key/network to Anthropic.)
3. **Deploy + Postgres hosts (S3/S4):** target platform + managed Postgres provider — needed before S3 code lands.
4. **Retention window (S4):** default max retention for saved readings + reflection notes.
5. **Analytics backend (S6):** self-hosted/first-party events vs. a third-party tool (privacy trade-off).
6. **Second human (S2/S4/S9):** who performs independent review, and by when.
7. **Sprint approval cadence:** approve sprint-by-sprint (recommended) or approve S0–S3 as a block since they're low-risk and mostly parallelizable.

---

## 8. What this plan explicitly does not do

- Does not implement any code (proposal only).
- Does not lock final pricing before user evidence (S8 tests intent only).
- Does not mark any asset production-eligible without documents (D3).
- Does not claim a live-model result that hasn't run (D4).
- Does not edit `DECISION_LOG.md` here — ADR-014 + Prisma-SUPERSEDED are Sprint 0's reviewed actions.
- Does not proceed past G1 or G2 on momentum.
