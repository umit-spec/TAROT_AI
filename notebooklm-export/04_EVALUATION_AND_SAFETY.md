# 04 — Evaluation and Safety

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `scripts/evaluation/`, `src/types/evaluation.ts`, `data/evaluation/`, `src/__tests__/unit/zero-tolerance-invariants.test.ts`, `src/server/intake/`, `docs/02-ETHICAL_CONSTITUTION.md`.

---

## Evaluation corpus

- **24 fixed cases** — `data/evaluation/cases/cases.json`. Cover all 5 personas, all 4 question domains, easy/hard question mix, all 4 crisis flags, 2 prompt-injection, 2 red-line-boundary cases.
- **Case governance disclosed honestly:** `authoredBy`/`reviewedBy`/`adversarialReviewedBy` are all `"claude"` at this commit — **no independent human review yet** (stated in each risk-tagged case's notes). This is disclosed debt, not hidden.
- Schema: `EvaluationCaseSchema` (`src/types/evaluation.ts`), lifecycle `draft → reviewed → active`, mandatory adversarial review for risk-tagged cases before `active`.

## MockProvider results (harness baseline)

- `npm run evaluation:run` runs all active cases against `MockProvider`. Latest baselines: 24 cases, fallback rate 0.0%, latency p50/p95 ≈ 0ms, **zero zero-tolerance violations**.
- **These are harness-mechanics proof only.** Mock never calls a real model, so `totalInputTokens`/cost are structurally 0 and quality is not represented.

## Anthropic live-run status

- **NOT EXECUTED.** `data/evaluation/runs/live-anthropic-*/live-anthropic-status.json` reads `NOT EXECUTED / credentials unavailable`, harness `VERIFIED`. The dev environment has no `ANTHROPIC_API_KEY` or confirmed network path.
- **S2 tooling is ready** for a real local run: `evaluation:live-preflight`, `evaluation:live-anthropic [-- --retain-raw]`, `evaluation:scrub-artifacts`, `evaluation:cost`, `evaluation:compare` (blind Mock-vs-Claude), `evaluation:cleanup-raw`. Default evaluated model `claude-sonnet-5` (`ANTHROPIC_MODEL`-overridable).
- **No real quality/latency/cost baseline exists yet.** Producing it is a Product-Owner local action, and is a precondition for the G1 decision.

## OpenAI status

- **Not used.** The project integrates **Anthropic Claude only** (narration provider) with a deterministic MockProvider fallback. There is no OpenAI/GPT code path in the repository.

## Crisis routing (`src/server/intake/` + route)

- Intake computes `safetyFlags` server-side (`keywords.ts`, `safety.ts`). If any crisis flag is present (`isCrisisFlag`), the API route returns a crisis-support response with Türkiye resources (İntihar Önleme 0312 380 9098, ALO 183, Polis 155, Acil Tıp 112) and performs **no draw, no provider call, no tarot narration** (`src/app/api/readings/route.ts`, `docs/02-ETHICAL_CONSTITUTION.md`). Crisis text is never logged (only that a short-circuit occurred).

## Red-line rules

- `reading-engine/validate.ts` enforces forbidden-phrase / ethical red lines on provider output; violations cause a full fallback to Mock (classified `red-line-rejected`), never partial pass-through.
- Ethical constitution (`docs/02-ETHICAL_CONSTITUTION.md`) forbids certain prophecy, death/pregnancy/illness prediction, professional (medical/legal/financial) conclusions, etc.

## Zero-tolerance invariants (`src/__tests__/unit/zero-tolerance-invariants.test.ts`)

Five hard gates, proven against the real `POST` handler (not just isolated functions):
- **#9** schema-invalid output never reaches a caller.
- **#10** a crisis case never produces tarot content (`status: 'crisis'`, cards/interpretation/provider undefined).
- **#11** no provider reorders/adds/drops cards (deterministic ground truth holds; reordered fake Claude response rejected → Mock).
- **#12** `ANTHROPIC_API_KEY` never leaks into an error message.
- **#13** no unvalidated provider output is ever returned.
- The harness (`scripts/evaluation/run.ts`) also fails the entire run (`process.exit(1)`) on any `zeroToleranceViolations` entry, independent of quality/cost.

## Rubric scoring (`RubricScoreSchema`)

- Human-only narration-quality scoring is schema-built (`scoredBy` rejects AI actors). **No RubricScore records exist yet** — no narration has been scored (real or Mock). Founder + independent scoring are S2/G1 preconditions.

## Safety tests (broader)

`src/__tests__/unit/` includes `intake-engine`, `persona-mapping`, `claude-provider`, `interpretation-provider`, `evaluation`, plus S2 (`evaluation-s2-tooling`) and S3 (`observability-s3`) suites. Structured logs never carry question/reflection/crisis text (redaction test, `observability-s3.test.ts`).
