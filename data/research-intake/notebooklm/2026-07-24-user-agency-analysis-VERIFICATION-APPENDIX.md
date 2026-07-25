# Verification Appendix — User Agency Analysis (resolves the open items)

**Companion to:** `data/research-intake/notebooklm/2026-07-24-user-agency-analysis.md`
**Governed by:** `docs/NOTEBOOKLM_RESEARCH_GOVERNANCE.md`
**Independent verification date:** 2026-07-24 · **Verified against commit:** `97c7e22` (branch `claude/insight-engine-investor-audit-bkofgr`)
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW
**Human reviewer:**
**Review date:**

> Purpose: the companion intake record lists several claims as *unresolved* because exact test paths were not checked when it was written. This appendix records an **independent verification pass** that resolves each of those, with exact repository evidence and the **actual** repository gate results. It is additive; it changes no runtime code, promotes no KnowledgeBundle, starts no S4, and resumes no methodology extraction. No reviewer identity is recorded until the Product Owner explicitly approves.

---

## 1. Resolved rows (state vocabulary from `docs/NOTEBOOKLM_RESEARCH_GOVERNANCE.md`)

| Companion "unresolved" item | Exact repository evidence (verified `97c7e22`) | Resolved state |
|---|---|---|
| Exact ConsentModal test path | `src/components/ConsentModal.tsx` + `src/__tests__/unit/ui-components.test.tsx:13-38` (2 tests: exact-copy render; Accept disabled until checkbox checked) | **IMPLEMENTED_AND_TESTED** |
| Exact crisis-gate test path | Gate `src/app/api/readings/route.ts:46-95`; tests `src/__tests__/unit/zero-tolerance-invariants.test.ts:70-88` ("Invariant 10", all 4 crisis flags → `status: 'crisis'`, no cards/interpretation/provider) + `src/__tests__/unit/api-readings.test.ts:104-114` | **IMPLEMENTED_AND_TESTED** |
| Deterministic selection impl + card-order invariant test | Impl `src/server/reading-engine/deterministic.ts`; tests `src/__tests__/unit/zero-tolerance-invariants.test.ts:90-133` ("Invariant 11: no provider can reorder, add, or drop cards", 2 tests incl. a deliberately reordered Claude response rejected → Mock, ground-truth order preserved) + `reading-engine.test.ts:27` ("same seed produces byte-identical output"), `:45` (positions past/present/future, no duplicates) + `knowledge.test.ts:150` (swapping KnowledgeProvider does not change the draw) | **IMPLEMENTED_AND_TESTED** |
| Red-line / output-validation impl + test | Impl `src/server/reading-engine/validate.ts:76` (`validateInterpretation`, forbidden-pattern categories from `docs/02-ETHICAL_CONSTITUTION.md`); tests `src/__tests__/unit/interpretation-provider.test.ts:78,110-178` (Zod + red-line scan; forbidden phrase rejected → `fallbackReason === 'red-line-rejected'`). **Note:** live-model violation/fallback *frequency* still requires the S2 live run — that remains `PRODUCT_HYPOTHESIS`. | **IMPLEMENTED_AND_TESTED** (mechanism) |
| Exact rate-limit test path | Impl `src/server/observability/rate-limit.ts`; wiring `src/app/api/readings/route.ts:29,50-51`; tests `src/__tests__/unit/observability-s3.test.ts:37` (allow→block within window; window reset; enabled-flag; threshold; client key) | **IMPLEMENTED_AND_TESTED** (as abuse-prevention only) |
| Actual full repository gate results | Run this session (see §3) | Recorded |

## 2. Points where this appendix agrees with the companion record (no change)

- **Durable cooldown / same-question metering (ADR-007)** is still `ACCEPTED_NOT_IMPLEMENTED`. The shipped `rate-limit.ts` is per-instance, in-memory abuse-prevention — **not** the anti-addiction cooldown, which needs persistence (S4, not started). Keep the two distinct.
- **Crisis-resource numbers** remain a `REJECTED_OR_UNSUPPORTED`/safety item: `src/app/api/readings/route.ts:21-24` carries `155` (Polis) alongside `112`, and a private İntihar Önleme number. Türkiye's unified emergency line is **112**. This is a real-world fact the repo cannot settle and a **separate, reviewed safety-remediation task** — **not changed here** (no runtime edit in this workflow). Official references to check: `https://www.112.gov.tr/`, ALO 183 (Aile ve Sosyal Hizmetler Bakanlığı).
- **Cadence (ADR-014)** and **positioning** remain `PRODUCT_HYPOTHESIS`, not validated behavior.
- **Upright-only (ADR-002)** is a scope/complexity decision, **not** the primary anti-prophecy control; the real controls are the governed prompt, response schema, and red-line validation (`validate.ts`).

## 3. Actual repository gate results (this session, commit `97c7e22`)

| Gate | Command | Result |
|---|---|---|
| Lint | `npm run lint` | **0 errors** |
| Typecheck | `npm run typecheck` | **0 errors** |
| Tests | `npm run test` | **15 files, 201/201 passed** |
| Build | `npm run build` | **0** — routes `/`, `/_not-found`, `/api/health`, `/api/readings`, + Middleware |

All 15 stated test files exist under `src/__tests__/unit/`.

## 4. Constraints honored

No runtime code changed · live `KnowledgeBundle` untouched · methodology extraction not resumed · S4 not started · no reviewer identity recorded · no "implemented and tested" state assigned without both code and a test cited on the current branch.

## 5. Reviewer sign-off (Product Owner only — blank until explicit approval)

- Approved by: ____________________  Date: ____________
- Suggested action on approval: fold the resolved states in §1 into the companion record's table and close its "Unresolved claims" list; open a separate safety-remediation task for the crisis numbers.
