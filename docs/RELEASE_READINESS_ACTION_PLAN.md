# Insight Engine — Release Readiness Action Plan

**Date:** 2026-07-24  
**Status:** ACTIVE GOVERNED ROADMAP  
**Owner:** Product Owner  
**Source intake:** `data/research-intake/notebooklm/2026-07-24-prioritized-gap-register.md`

## Purpose

This document is the authoritative execution order for closing the most important release, safety, evaluation, privacy, and investor-readiness gaps currently identified for Insight Engine.

It does not claim that any item is complete merely because a decision, file, script, or test placeholder exists. Completion requires the exact evidence listed below.

## Current product class

`FUNCTIONAL PRODUCT PROTOTYPE — NOT CLOSED-BETA READY`

The product must not be described as production-ready, clinically validated, legally risk-free, GDPR/KVKK compliant, or commercially validated until the applicable gates are closed.

## Gate order

### P0 — Release blocker

#### RR-001 — Correct crisis resources and prove short-circuit behavior

**Problem**

`src/app/api/readings/route.ts` contains legacy crisis-resource labels and numbers, including `155`. The route short-circuits crisis cases, but the response resources are not release-safe until they are reverified against current official sources and corrected.

**Smallest permitted implementation**

- Replace legacy runtime resources with current officially verified emergency and social-support routing.
- Keep emergency response copy concise and non-tarot.
- Ensure crisis handling occurs before card generation and before provider invocation.
- Do not store raw crisis text in ordinary analytics or logs.

**Required evidence**

- Exact route test proving crisis classification causes a short-circuit.
- Test proving the Reading Engine is not called.
- Test proving the narration provider is not called.
- Test proving only approved current resources are returned.
- Source note recording the official verification date and authority.

**Exit condition**

`P0 CLOSED` only when code, tests, and official-source verification are all present.

**Prohibited claim before closure**

> “The crisis system is completely safe.”

---

### P1 — Gate blockers

#### RR-002 — Complete genuine Anthropic live evaluation

**Goal**

Measure real-model quality, safety pressure, latency, token usage, cost, fallback frequency, and red-line behavior.

**Required evidence**

- Timestamped live-run manifest.
- Model identifier and prompt version.
- Scrubbed output artifact.
- Cost and latency report.
- Red-line and fallback report.
- Raw-payload retention disabled or bounded under the approved evaluation controls.

**Exit condition**

A genuine live run exists and can be independently reproduced from documented commands and configuration.

**Prohibited claim before closure**

> “The live model is safer, better, faster, or cheaper than the mock provider.”

#### RR-003 — Complete independent human scoring

**Goal**

Evaluate output quality, agency preservation, safety, groundedness, and tone independently of the model that produced or initially scored the cases.

**Minimum review design**

- One Product Owner reviewer.
- One independent reviewer.
- Blind or partially blind model labels where practical.
- A documented disagreement-resolution rule.

**Required evidence**

- Named reviewer IDs.
- Dated rubric records.
- Scoring instructions.
- Inter-reviewer disagreement summary.
- No clinical-validation language.

**Exit condition**

The governed subset is fully scored by the required humans and the results are summarized without overstating professional or clinical authority.

**Prohibited claim before closure**

> “The outputs have clinical or professional validation.”

#### RR-004 — Prove CI and controlled staging readiness

**Goal**

Show that the target branch passes reproducible code gates and can be deployed to a controlled staging environment with rollback and health evidence.

**Required evidence**

- Green lint, typecheck, test, and build gates.
- Staging URL.
- Health endpoint evidence.
- Environment-variable inventory with no secrets committed.
- Rollback procedure.
- Deployment record tied to a commit SHA.

**Exit condition**

A reviewer can open the staging build, identify the deployed commit, inspect green gates, and follow the rollback note.

**Prohibited claim before closure**

> “The product is production-ready.”

---

### P2 — Closed-beta requirements

#### RR-005 — Close pilot visual provenance

Complete original three-card pilot assets, provenance, creator or commission records, and validator evidence. Validator success does not independently constitute legal clearance.

#### RR-006 — Approve minimum privacy-preserving persistence design

Before S4 implementation, approve:

- exact stored fields,
- fields explicitly prohibited from storage,
- retention periods,
- deletion behavior,
- access boundaries,
- consent and lawful-purpose mapping,
- crisis-data minimization.

Crisis flags must not become a longitudinal mental-health profile by default.

#### RR-007 — Implement durable anti-addiction controls

Treat durable cooldown, account quota, same-question repetition handling, and API abuse prevention as distinct controls.

Required tests must cover:

- reset behavior,
- bypass resistance,
- repeated-topic handling,
- user-facing explanation,
- privacy-safe identity strategy.

The existing in-memory limiter must not be described as a durable cooldown system.

#### RR-008 — Run a limited closed beta

Use a consented cohort and measure more than retention:

- user understanding of reflection positioning,
- repeat-question behavior,
- certainty-seeking,
- agency preservation,
- safety events,
- perceived value,
- healthy exit and non-use behavior.

The daily/weekly/threshold cadence remains a hypothesis until user evidence exists.

#### RR-009 — Define minimal first-party analytics

Allowed analytics should use minimized derived events. Ordinary analytics must not store raw crisis text or unnecessary sensitive questions.

Required artifacts:

- event taxonomy,
- prohibited-field list,
- retention rules,
- access policy,
- event tests.

#### RR-010 — Coordinate identity, consent, deletion, and privacy controls

Authentication is not proof of personalization. The workstream must jointly address:

- closed-beta identity model,
- consent versioning and revocation,
- session isolation,
- history access,
- export or access request design where applicable,
- deletion workflow,
- processor and data inventory.

No GDPR or KVKK compliance claim may be made from a single endpoint or technical feature.

#### RR-011 — Expand the evaluation corpus with governed human-authored cases

Add at least 10 reviewed, human-authored cases covering:

- ambiguous third-party questions,
- certainty-seeking,
- manipulative requests,
- fear-based language,
- adversarial phrasing,
- culturally natural Turkish wording,
- crisis-borderline cases,
- dependency and repeated-question behavior.

Private session wording must not be copied into the production corpus.

#### RR-012 — Implement privacy-safe observability

Use derived operational signals with strict access and bounded retention. Do not persist raw crisis statements by default.

---

### HOLD — Legal and governance gate

#### RR-013 — Keep methodology extraction blocked

Copyrighted book sources remain excluded from OCR, embeddings, runtime retrieval, lesson drafting, and derivative knowledge production.

A legal opinion may inform a future Product Owner decision, but legal consultation alone does not reopen extraction.

**Required reopening conditions**

- narrowly scoped written legal assessment,
- Product Owner decision,
- source-use boundaries,
- similarity and provenance controls,
- renewed governance gate.

---

### P3 — Post-beta business validation

#### RR-014 — Test ethical monetization

Revenue design must not sell certainty, remove safety limits, reward repeated readings, or create compulsive loops.

Candidate value propositions should focus on:

- structured reflection history,
- user-controlled summaries,
- optional deeper synthesis,
- privacy-respecting exports,
- low-frequency threshold use.

**Required evidence**

- willingness-to-pay experiment,
- unit-cost analysis,
- cancellation and refund flow,
- comprehension test,
- dependency-risk review.

**Prohibited claim before closure**

> “The business model is validated and profitable.”

## Investor-language guardrail

Until corresponding evidence exists, the following statements are prohibited:

- The crisis system is completely safe.
- The live model is proven better than the mock provider.
- Outputs are clinically or professionally validated.
- The product is production-ready.
- All visual assets are legally risk-free.
- User history is securely persisted.
- Compulsive use is fully prevented.
- Users follow the threshold cadence model.
- Conversion exceeds market benchmarks.
- The experience is fully personalized.
- The KnowledgeBundle is legally risk-free.
- The product is GDPR or KVKK compliant.
- All abuse and prompt-injection scenarios have been tested.
- Incident response operates in real time.
- The business model is validated and profitable.

## Execution rule

Work proceeds in this order:

1. RR-001
2. RR-002
3. RR-003
4. RR-004
5. RR-005 through RR-012 according to approved sprint planning
6. RR-014 after beta evidence

RR-013 remains on HOLD independently of the execution order.

No later item may be used to bypass an earlier safety or gate blocker.

## Change-control rule

An item may move to `CLOSED` only when:

1. implementation or operational work is complete,
2. exact evidence is linked,
3. required tests or artifacts exist,
4. unresolved risks are recorded,
5. a named reviewer approves closure.

Documentation, file existence, or an accepted ADR alone is not closure evidence.
