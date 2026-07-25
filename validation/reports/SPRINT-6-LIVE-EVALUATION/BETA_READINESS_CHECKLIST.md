# Closed Beta Readiness Checklist

**Date:** 2026-07-23
**Governed by:** `docs/SPRINT_6_LIVE_EVALUATION_PRODUCT_READINESS_PLAN.md` §1.8
**Status:** ⛔ **NOT READY** — this checklist aggregates evidence, it does
not claim readiness that evidence doesn't support. Several items below are
explicitly incomplete, by design (Sprint 6 measures and builds gates, it
does not itself satisfy every gate).

---

## 1. Evaluation metrics

| Item | Status | Evidence |
|---|---|---|
| Harness proven end-to-end | ✅ | `data/evaluation/runs/mock-*/manifest.json`, 24/24 cases, 0 zero-tolerance violations |
| Zero-tolerance security/architecture invariants | ✅ (against Mock) | §3 of `BUILD_EVIDENCE_REPORT.md` — all 5 proven live |
| Real Anthropic quality/latency/cost baseline | ⛔ NOT ESTABLISHED | No `ANTHROPIC_API_KEY` in this environment — `live-anthropic-status.json` reads `NOT EXECUTED` / `credentials unavailable`. Cannot claim readiness on a number that doesn't exist. |
| Quality/cost thresholds set | ⛔ NOT SET (by design) | Per decision 4: baseline first, thresholds from real data later — not a gap, a deliberate sequencing choice |

## 2. Narration quality rubric

| Item | Status | Evidence |
|---|---|---|
| Rubric schema built, AI-scoring structurally blocked | ✅ | `RubricScoreSchema` rejects `scoredBy: "claude"`, tested |
| Any case actually scored | ⛔ NOT DONE | Zero `RubricScore` records exist - no narration (real or Mock) has been scored yet |
| Single-evaluator transparency metadata enforced | ✅ (mechanism only) | Schema requires `evaluatorCount`/`independentReview`/`evaluationRound` - untested against a real score because none exists yet |
| Second-scorer cross-check subset | ⛔ NOT DONE | Explicitly non-blocking per decision 3, but still open |

## 3. Asset licensing

| Item | Status | Evidence |
|---|---|---|
| Inventory opened and tracked | ✅ | `docs/ASSET_LICENSING_DEBT_LOG.md`, all 44 entries |
| Entries resolved (`verified-*` or `replacement-completed`) | ⛔ **0 of 44** | All 44 entries remain `unverified`/`high` — **this alone blocks public launch or paid beta per that log's own hard rule**, independent of anything else in this checklist |

## 4. Security & UX debt

| Item | Status | Evidence |
|---|---|---|
| `SECURITY_DEBT_LOG.md` | ⚠️ Accepted risk (dev-only), tracked | SECURITY-DEBT-001, reviewed each sprint start |
| `UX_DEBT_LOG.md` | ✅ Closed | UX-DEBT-001 closed at Sprint 4 |

## 5. Evaluation case governance debt (new, Sprint 6)

| Item | Status | Evidence |
|---|---|---|
| 24 fixed cases authored, schema-valid | ✅ | `data/evaluation/cases/cases.json`, all pass `EvaluationCaseSchema` |
| Independent human review of cases | ⛔ NOT DONE | `authoredBy`/`reviewedBy` are both `"claude"` for all 24 - disclosed in each risk-tagged case's `notes`, not hidden |
| Adversarial review of risk-tagged cases | ⚠️ Self-reviewed only | `adversarialReviewedBy: "claude"` on all 8 risk-tagged cases - same actor as author, transparently noted, not an independent check |

---

## Overall

**This product is not ready for public launch or a paid closed beta.**
Two independent, sufficient reasons, either one of which alone blocks it:

1. **Asset licensing** — 44/44 assets `unverified`, per that log's own
   explicit hard rule.
2. **No real-provider evaluation data exists** — every quality/cost/
   latency number in this sprint's evidence is against `MockProvider`,
   which is a harness-correctness proof, not a product-quality proof.

**What Sprint 6 actually achieved:** the *measurement and gating
infrastructure* is real, tested, and proven not to fake results it
doesn't have (the Live Anthropic gate's honest `NOT EXECUTED` report is
itself evidence of this, not a shortcoming). The infrastructure existing
is a genuine precondition for readiness; it is not readiness itself.

**Next steps to actually close this checklist** (not this sprint's job to
execute, listed for whoever picks this up next):
1. Supply real `ANTHROPIC_API_KEY` credentials somewhere this harness can
   run against them; execute `evaluation:live-anthropic` for real.
2. Score at least a meaningful subset of resulting narrations with the
   rubric, by a named human.
3. Resolve `docs/ASSET_LICENSING_DEBT_LOG.md`'s 44 entries.
4. Have a human (not Claude) review and adversarially re-check the 24
   evaluation cases, especially the 8 risk-tagged ones.
