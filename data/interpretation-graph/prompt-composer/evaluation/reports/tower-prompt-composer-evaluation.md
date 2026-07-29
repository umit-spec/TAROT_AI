# Tower Prompt Composer Offline Evaluation

## Baseline

- IG-2 SHA: `a16816a`
- IG-3 base SHA: `a16816a`
- Test date: 2026-07-29
- Offline/no-network: yes — no API call, no API key, no network access anywhere in this evaluation.

## Composer cases

- Positive+negative total: 78, passed: 78
- Result: PASS

## Trust boundary

- Injection cases: 36, structurally contained: 36 (100.0%)
- Question containment: verified per-case (question appears ONLY in untrustedUserQuestion.text; systemPrompt and contextRefs identical to a neutral-question baseline).

## Golden replay

- 18-case replay against IG-2's golden set: 18/18 PASS
- Presentation preference used: **concise** — see 'Known limitation: IG-2/IG-3 word-range compatibility' below for why.
- Context leakage findings: 0 (target 0)

## Output contract

- Valid cases accepted: 10/10
- Invalid cases rejected: 23/23

## Prompt size

- systemPrompt bytes: min=5022 median=5039 p95=5067 max=5067 (limit 6000)
- boundedContext bytes: min=4615 median=4831 p95=5697 max=6291 (limit 6500)
- total bundle bytes: min=12361 median=12722 p95=13498 max=14155 (limit 16000)
- Approximate token estimate (bytes / 4, a rough heuristic only — no tokenizer dependency added): median ~3180 tokens per bundle.
- All measured bundles stayed within the proposed limits on real data; limits were not adjusted to force a PASS.

## Integrity

- Deterministic hash result: verified per composer case (recompose + byte-compare) and via bundleHash tamper-detection re-verification (verify_bundle_hash).
- Tamper detection: changing any single field changes the relevant hash — see src/__tests__/unit/interpretation-graph-prompt-composer.test.ts "Integrity" suite.

## Safety

- Prophecy/diagnosis/command/professional-outcome/third-party-intent/chain-of-thought: all covered by the output-contract adversarial set above (23/23 correctly rejected).

## Known limitation: IG-2/IG-3 word-range compatibility

IG-2's 18 golden cases were authored to a single 35-90 word range. Measured directly, all 18 fall entirely within 35-48 words — inside IG-3's "concise" tier (35-60), below the minimum of "balanced" (50). The golden replay above therefore validates against "concise", not "balanced". This is a documented cross-phase interface note, not a defect in either phase's own data.

## Known limitation (structural, not behavioral)

**Bu faz prompt bundle'ın yapısal sınırlarını ve output contract'ı doğrular. Canlı bir LLM'in prompt-injection girişimlerine davranışsal olarak direnmesini kanıtlamaz.**

## Final decision

**PASS-WITH-NOTES**
