# NotebookLM Research Intake: User Agency and Safety Guardrails

**Date:** 2026-07-24  
**Notebook:** Insight Engine — Product & Research  
**Branch verified:** `claude/insight-engine-investor-audit-bkofgr`  
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW

## Original question

Bu çalışmadan Insight Engine için kullanıcı iradesini koruyan ürün tasarım ilkelerini çıkar. Bulgular ile yazarların yorumlarını birbirinden ayır.

## NotebookLM output

The original NotebookLM answer asserted that consent, crisis routing, deterministic card control, prophecy prevention, upright-only scope, cooldown, cadence, and kill/narrow criteria had specific implementation states. It also supplied local NotebookLM citation numbers and claimed repository/test evidence that required independent verification.

The raw NotebookLM citation markers are intentionally not reused as evidence below.

## Claim verification

| Claim | NotebookLM-claimed status | Actual repository/external evidence | Verified status | Correction required | Destination document |
|---|---|---|---|---|---|
| The consent modal exists and requires affirmative consent before acceptance. | Implemented and tested | Implementation verified at `src/components/ConsentModal.tsx`; acceptance button is disabled until the checkbox is selected. An exact current-branch test path was not independently verified during this review. | `ACCEPTED_NOT_IMPLEMENTED` for the combined “implemented and tested” claim; implementation exists, test status unresolved | Split implementation from test claim. Do not say “tested” until the exact test is verified. | Future current-behavior document after test verification |
| Crisis intake short-circuits the normal reading path. | Implemented and tested | `src/app/api/readings/route.ts`: server-side `classifyIntake`, crisis-flag check, and response before `generateInterpretedReading`. Exact crisis-gate test path not independently verified here. | `ACCEPTED_NOT_IMPLEMENTED` for the combined claim; implementation verified, test claim unresolved | Verify exact test path before promoting to `IMPLEMENTED_AND_TESTED`. | `docs/SAFETY_CONTROLS_CURRENT.md` when created/reviewed |
| The AI/provider cannot choose or reorder cards and is narration-only. | Implemented and tested | Architecture decision verified in `docs/DECISION_LOG.md`, ADR-011. Runtime route passes the resolved reading to `generateInterpretedReading`; however, the exact invariant test path was not independently verified in this intake. | `ACCEPTED_NOT_IMPLEMENTED` for the combined claim | Retain ADR-011 as accepted architecture; verify the exact implementation and test files before claiming tested enforcement. | `docs/ARCHITECTURE_CURRENT.md` when created/reviewed |
| Deterministic card selection is implemented and tested. | Implemented and tested | ADR-004 and ADR-011 support deterministic architecture. Exact current-branch deterministic implementation and invariant-test paths were not independently verified in this intake. | `REJECTED_OR_UNSUPPORTED` as currently evidenced | Re-run repository verification with exact implementation and test paths. | N/A until verified |
| Prophecy language is blocked by prompt, schema, red-line validation, and post-generation validation. | Implemented and tested | ADR-011 and `src/app/api/readings/route.ts` support provider/output validation architecture. Exact validator and test paths were not independently verified in this intake. | `ACCEPTED_NOT_IMPLEMENTED` for the combined claim | Verify exact validator and test paths. A live model run is still needed to measure violation/fallback frequency. | `docs/SAFETY_CONTROLS_CURRENT.md` after verification |
| Upright-only is the main anti-prophecy control. | Implemented and tested | `docs/DECISION_LOG.md`, ADR-002: upright-only was selected to reduce MVP/UI/interpretation complexity. | `REJECTED_OR_UNSUPPORTED` | Reject the causal link. Upright-only narrows scope; it is not the main anti-prophecy mechanism. | N/A; correction belongs in governance/current-scope docs |
| Cooldown and free-tier quotas are already implemented. | Implemented | `docs/DECISION_LOG.md`, ADR-007 records the accepted policy. `src/server/observability/rate-limit.ts` contains an in-memory, per-instance request limiter and explicitly defers durable/shared state to S4. | `ACCEPTED_NOT_IMPLEMENTED` | Do not equate request rate limiting with durable same-question cooldown, account quota, or monetization. | `docs/DECISION_LOG.md` / phase plan |
| S3 rate limiting exists. | Implemented | `src/server/observability/rate-limit.ts`; integration visible in `src/app/api/readings/route.ts`. It is disabled by default in dev/test and is per-instance. | `ACCEPTED_NOT_IMPLEMENTED` for production-grade/durable protection | Describe it as temporary in-memory abuse prevention, not durable quota/cooldown. Exact test path remains unresolved here. | S3 evidence/current architecture after review |
| Daily/Weekly/Threshold cadence is validated user behavior. | Validated model | `docs/DECISION_LOG.md`, ADR-014 records it as an MVP hypothesis/product constraint; current MVP builds the Threshold loop only. | `PRODUCT_HYPOTHESIS` | Do not present it as validated behavior or analytics evidence. | `docs/PRODUCT_HYPOTHESES.md` when created/reviewed |
| The product is positioned as an insight/reflection system rather than certain fortune-telling. | Implemented | Product and ethical documentation/ADRs support the positioning, but positioning is not a runtime implementation state. | `PRODUCT_HYPOTHESIS` / accepted positioning | Treat as positioning and validation hypothesis, not a coded feature. | Product strategy / investor readiness docs |
| Legacy crisis resources are safe to ship as currently coded. | Implemented | `src/app/api/readings/route.ts` currently includes `155`, a private “İntihar Önleme” number, `183`, and `112`. Official current sources identify 112 as the unified emergency number and ALO 183 as a violence/social-support guidance line. Official references: `https://www.112.gov.tr/` and `https://aile.gov.tr/btgmd/e-hizmetler-yeni/alo-183-web-sitesi/`. | `REJECTED_OR_UNSUPPORTED` | Runtime crisis resources require a separate, reviewed safety correction before release. Do not use an unverified private suicide-prevention number. | Safety remediation issue / `docs/SAFETY_CONTROLS_CURRENT.md` |
| Kill/narrow criteria are a runtime rule. | Implemented | Investor/gap-analysis material treats these as Product Owner decision criteria dependent on real-user evidence. | `PRODUCT_HYPOTHESIS` | Keep separate from runtime behavior. | `docs/G1_DECISION_FRAMEWORK.md` when created/reviewed |

## Verified repository findings

### Implemented code verified

- `src/components/ConsentModal.tsx`
- `src/app/api/readings/route.ts`
- `src/server/observability/rate-limit.ts`

### Accepted decisions verified

- ADR-002 — reversed cards excluded for MVP simplicity/scope
- ADR-007 — cooldown and metered free tier accepted as a product decision
- ADR-011 — LLM/provider is a narration layer behind a governed interface
- ADR-014 — cadence is an MVP hypothesis/product constraint

### Safety defect discovered

`src/app/api/readings/route.ts` contains legacy or unverified crisis-resource information. This intake does not change runtime code. A separate safety-remediation change is required and must be verified against current official Turkish sources before release.

## Unresolved claims

- Exact current-branch test path for `ConsentModal` behavior.
- Exact current-branch crisis-gate test path.
- Exact deterministic-selection implementation path and card-order invariant test.
- Exact red-line/output-validation implementation and test paths.
- Exact rate-limit test path.
- Actual full repository gate results after this docs/data change; they must be run in a local/CI environment with repository execution access.

## Proposed downstream changes

- Open a separate safety-remediation task for crisis-resource copy in runtime.
- Verify exact test paths before creating or updating `IMPLEMENTED_AND_TESTED` current-state documentation.
- Keep cooldown/quota, cadence, and kill/narrow claims out of current-runtime documentation unless their status is explicitly qualified.

## Human review

**Reviewed by:**  
**Review date:**  
**Decision:** PENDING
