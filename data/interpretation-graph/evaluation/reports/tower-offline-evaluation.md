# Tower Offline Interpretation Evaluation

## Baseline

- IG-1 SHA: `f52a25d`
- IG-2 base SHA: `f52a25d`
- Test date: 2026-07-28
- Offline/no-network: yes — no Anthropic/OpenAI API call, no API key used, no network access required by any script in this evaluation.

## Dataset

- Routing cases: 63
- Negative cases: 12
- Golden cases: 18
- Adversarial cases: 20
- Mutations: 10

## Coverage

- Position coverage: past/present/direction, each represented in routing (24 cases), golden (6 each), and negative-case rejection tests.
- Context coverage: all 8 contexts appear in routing cases (one each) and in golden cases (all 8 covered).
- Signal coverage: all 10 signals appear in routing cases; 9 of 10 appear in golden cases (loss-concern golden coverage deferred to a future pass).
- Goal coverage: all 5 goals appear in routing and golden cases.
- Relationship coverage: all 7 types appear in routing cases; 5 of 7 in golden cases.
- Safety category coverage: all 20 §12 hard-gate categories have at least one dedicated adversarial case.

## Hard gates

- Routing: PASS (63/63)
- Negative-case rejection: PASS (12/12)
- Golden hard-gate/structural checks: PASS (18/18 clean)
- Adversarial detection: PASS (20/20)

## Soft scores

- Overall average: 2.00 (threshold >= 1.60)
- **Disclosure**: these are self-consistency scores assigned by the same reviewer who authored the golden cases (evaluation-rubric.json scoringMethod), not blind third-party or live-LLM-judged ratings — no API call was made in this offline phase. This is a known limitation, not a claim of independent validation.

## Routing

- Exact accuracy: 100.0%
- Unknown-ref rejection: 100.0%
- Context leakage: 0 (target 0)

## Safety mutation

- Detection rate: 100.0%
- Deterministic (same seed -> same output): True

## Turkish matching

- Regression tests (Tanıdık/tanıdır, İ/ı case-fold, YÖN/Yön normalization, apostrophe/punctuation): see src/__tests__/unit/interpretation-graph-evaluation.test.ts "Turkish matching" suite — run via `npm test`, not this Python report.
- False-positive result: 0 known false positives after the tanıdık/tanıdır curated-lexicon fix (tools/interpretation-graph/lib/tr_normalize.py).

## Assumption audit

- Card-node findings remaining: 0 (target 0)
- Golden-case findings remaining: 0 (target 0)
- Fixed before this report:
  - contexts.family (focus + followUpQuestion)
  - contexts.uncertainty (focus + followUpQuestion)
  - userSignalLenses.control-scope-clarification (focus + reflectionQuestion)
  - userSignalLenses.loss-concern.reflectionQuestion (found by this audit tool itself, beyond the 3 named fixes)
- Remaining review-required questions: none known as of this report.

## Final decision

**PASS-WITH-NOTES**

All hard gates, routing, negative-case rejection, mutation detection, context-leakage, and assumption-audit checks pass cleanly. The "notes" qualifier reflects the soft-score self-grading limitation disclosed above — an independent or live-judged scoring pass remains open for a future phase, not a defect found in this one.
