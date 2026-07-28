# Commercial Release Checklist

**Phase:** CRG-1 (Commercial Release Gate Review)
**Date:** 2026-07-28
**Prepared by:** Claude (CRG-1 execution)

Status values: **PASS** (evidence exists and is sufficient) / **OPEN**
(no evidence yet) / **NOT APPLICABLE** / **BLOCKED** (evidence exists and
is unfavorable).

## Asset rights

| Item | Status | Evidence |
|---|---|---|
| Provenance/production-chain declaration | PASS | `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` |
| Generation-session platform evidence (V2-D002) | OPEN (accepted residual risk, not closed evidence) | same file §7 |
| Canva Licensed Content audit (V2-D005) | PASS | `docs/evidence/FULL_DECK_V2_CANVA_CONTENT_AUDIT.md` |
| Per-file binary verification (V2-D007) | PASS | `assets/tarot-cards-v2/provenance-manifest.json` |
| Derivative export provenance (V2-D012) | PASS | `assets/tarot-cards-v2/derivatives/derivative-manifest.json` |
| Final visual QA (V2-D013) | PASS | `docs/evidence/FULL_DECK_V2_VISUAL_QA.md` |
| Third-party visual similarity review (V2-D003) | **OPEN** | `docs/evidence/FULL_DECK_V2_SIMILARITY_REVIEW.md` — 4 of 22 cards flagged HIGH, routed to legal review |
| Platform-terms dated evidence (V2-D004) | **OPEN** | `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md` + `docs/evidence/platform-terms/` — primary-source re-fetch blocked (HTTP 403), secondary evidence only |
| Public-repository reuse notice | PASS | `assets/tarot-cards-v2/ASSET_LICENSE.txt` |

## Trademark

| Item | Status | Evidence |
|---|---|---|
| General web-presence check for "Insight Engine" | PASS (as a first filter only) | `docs/legal/TRADEMARK_CLEARANCE_PRELIMINARY.md` |
| Professional database search (TÜRKPATENT/WIPO/EUIPO) | **OPEN** | not performed — no interactive database access in this environment |
| Trademark counsel opinion | **OPEN** | not performed |
| Turkish-facing product name identified and searched | **OPEN** | product's actual Turkish-facing brand name (vs. the English "Insight Engine" project name) not confirmed in this pass |

## Legal documents

| Item | Status | Evidence |
|---|---|---|
| Turkey-focused legal review packet prepared | PASS (packet exists; review itself not performed) | `docs/legal/COMMERCIAL_RELEASE_LEGAL_REVIEW_PACKET_TR.md` |
| External/independent counsel review actually obtained | **OPEN** | no counsel opinion recorded in this repository as of this date |
| KVKK disclosure notice (aydınlatma metni) | **OPEN** | does not exist; not required to be drafted at this phase per CRG-1's code-change boundary, but flagged as a pre-launch requirement |
| Terms of use / privacy policy for end users | **OPEN** | does not exist |

## Product safety

| Item | Status | Evidence |
|---|---|---|
| Crisis-detection gate implemented and reviewed | PASS | `src/server/intake/crisis-resources.ts`, safety-reviewed 2026-07-24 per its own header comment |
| No-prophecy / no-certainty framing | PASS | `docs/legal/PRODUCT_CLAIMS_AUDIT.md` |
| No health/legal/financial advice framing | PASS | same |
| Red-line output validator on all AI narration | PASS | `src/server/reading-engine/validate.ts` |
| Age policy | **OPEN** | no age gate or age-related copy exists anywhere in the product |
| Falcılık (Law No. 677) applicability review | **OPEN** | newly surfaced in this CRG-1 pass, routed to legal packet §D.0 — the single highest-priority open item in this checklist |

## Technical

| Item | Status | Evidence |
|---|---|---|
| Governed artwork registry integrity | PASS | `tools/assets/generate_tarot_artwork_registry.py --check` (re-run in this phase's quality gates) |
| No production code changes made in this phase | PASS | verified via `git diff 80ec612..HEAD -- src/` in this phase's quality gates |
| Test suite green | PASS | see final report's test count |
| Rollback rehearsed (RC-2) | PASS | `docs/RC2_INTEGRATED_ASSET_AUDIT.md` §"rollback rehearsal" |

## Operations

| Item | Status | Evidence |
|---|---|---|
| Data-flow/logging inventory | PASS (inventory exists; compliance review not performed) | `docs/legal/DATA_FLOW_AND_USER_RIGHTS_INVENTORY.md` |
| Third-party processor (Anthropic) disclosed to users | **OPEN** | no privacy notice exists; the data flow exists in code but is undisclosed in-product |
| Log retention policy | **NOT APPLICABLE YET** | no deployment target/infrastructure chosen yet; logs currently go to stdout only |
| Rate limiting / abuse prevention | PASS | `src/server/observability/rate-limit.ts`, in-memory (documented MVP limitation) |
| Persistence / accounts / payments | NOT APPLICABLE | none exist yet ("Sprint 4+"); nothing to review at this phase |

## Overall checklist result

**Not all items PASS.** The BLOCKED-severity items are zero; the OPEN
items are concentrated exactly where CRG-1's master instruction expected
them to be: professional trademark search, external counsel review, and
user-facing legal/privacy documents, plus two genuinely new findings from
this pass (Law 677 falcılık applicability; age policy absence). See the
decision matrix and final CRG-1 report for the overall PASS/PARTIAL/
BLOCKED phase decision.
