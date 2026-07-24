# NotebookLM Research Governance

**Status:** IMPLEMENTATION COMPLETE — AWAITING PRODUCT OWNER REVIEW  
**Scope:** Documentation and research-intake governance only. This document does not authorize runtime, KnowledgeBundle, S4, or methodology-extraction changes.

## Core rule

NotebookLM researches and synthesizes. Repository evidence verifies. A human decides. Only then may an accepted claim be incorporated into an authoritative project document.

NotebookLM output is never authoritative by itself.

## Claim states

Every extracted claim must receive exactly one state:

- `IMPLEMENTED_AND_TESTED` — current-branch code exists and a relevant current-branch test exists.
- `ACCEPTED_NOT_IMPLEMENTED` — an accepted ADR or product decision exists, but implementation is absent or incomplete.
- `PRODUCT_HYPOTHESIS` — an unvalidated behavior, positioning, metric, cadence, or future target.
- `EXTERNAL_RESEARCH` — a factual statement grounded outside the repository.
- `REJECTED_OR_UNSUPPORTED` — incorrect, outdated, contradicted, or insufficiently evidenced.

## Evidence requirements

NotebookLM citation markers such as `[1]`, `[2]`, and `[3]` are not valid repository citations. A reviewed claim must retain the applicable evidence:

- exact repository path,
- ADR identifier,
- exact test path,
- official external URL, DOI, or stable identifier,
- current branch or commit where verification occurred.

A path proves only that a file exists. `IMPLEMENTED_AND_TESTED` requires both implementation evidence and a relevant test.

## Intake lifecycle

1. Preserve the original NotebookLM question and raw answer in an intake record.
2. Split the answer into atomic claims.
3. Verify every claimed path, ADR, test, status, and external fact.
4. Assign one claim state.
5. Record corrections, unresolved points, and the intended destination document.
6. Obtain named human review.
7. Update authoritative documentation separately; the intake record itself never becomes authoritative knowledge.

## Binding controls

1. NotebookLM output cannot directly enter the live KnowledgeBundle.
2. NotebookLM output cannot become locked knowledge.
3. NotebookLM cannot be recorded as a human reviewer, verifier, author, or lock authority.
4. Unsupported claims remain rejected or unresolved.
5. Current state and planned state must remain separate.
6. Safety and crisis information must be rechecked against current official sources before release.
7. The presence of upright-only cards must not be represented as the main anti-prophecy control. The primary controls are the governed prompt, response schema, red-line validation, and post-generation validation.
8. Rate limiting must not be represented as durable cooldown or account quota. The current branch contains an in-memory, per-instance limiter at `src/server/observability/rate-limit.ts`; durable persistence remains deferred.
9. No runtime code may be changed through this intake workflow.
10. No S4 work may begin through this workflow.
11. Methodology extraction remains on HOLD until its gate conditions are met.
12. Book PDFs, OCR, extracted images, embeddings, and book-derived runtime retrieval remain prohibited under the existing source-governance decisions.

## Human-review rule

An intake record starts as:

`DRAFT — AWAITING PRODUCT OWNER REVIEW`

The `Reviewed by` and `Review date` fields must remain empty until a named human actually completes the review. Preparing or discussing a draft does not constitute review.

## Verified current-branch observations used by the worked example

The following were directly verified on `claude/insight-engine-investor-audit-bkofgr` while preparing this governance document:

- `src/components/ConsentModal.tsx` exists and requires an affirmative checkbox before acceptance.
- `src/app/api/readings/route.ts` performs server-side intake classification and short-circuits crisis cases before card generation/provider narration.
- `src/app/api/readings/route.ts` currently contains legacy crisis-resource labels/numbers, including `155`; these require a separate safety correction before release.
- `src/server/observability/rate-limit.ts` implements a fixed-window, in-memory, per-instance limiter and explicitly defers durable/shared state to S4.
- `docs/DECISION_LOG.md` records ADR-002 as an MVP-complexity decision and ADR-007 as an accepted cooldown/metered-tier decision.

Test-file claims remain unresolved unless an exact current-branch test path is recorded in the relevant intake row.

## Prohibited closure claims

NotebookLM must never be allowed to claim that it:

- created repository files,
- committed changes,
- ran tests,
- reviewed a record as a human,
- changed a project status,
- closed a sprint.

Those claims require repository actions and evidence outside NotebookLM.
