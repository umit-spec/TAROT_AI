# Local Anthropic Smoke Test — 2026-07-25

**Status:** PASS — single controlled localhost smoke test  
**Scope:** Connectivity and end-to-end provider integration only  
**Branch:** `claude/insight-engine-investor-audit-bkofgr`  
**Environment:** Windows / localhost / Next.js development server  
**Privacy:** No API key, raw user question, full model output, request body, or personally identifying content is stored in this record.

## Purpose

Verify that the application can complete one real Anthropic-backed reading through the production-shaped local route without falling back to `MockProvider`.

This record is **not** a quality benchmark, safety certification, beta-readiness approval, or substitute for the governed 12-case live evaluation corpus.

## Preconditions observed

- `.env.local` was loaded by Next.js.
- `ANTHROPIC_API_KEY` was present locally and not printed or committed.
- Direct Anthropic Messages API probe succeeded.
- Model configured: `claude-sonnet-5`.
- Typecheck passed.
- Unit/integration suite passed: **329/329**.
- Production build completed successfully.
- Local server reached ready state at `http://localhost:3000`.

## Direct API probe

A minimal direct Anthropic Messages API request completed successfully.

| Field | Result |
|---|---:|
| HTTP/API outcome | Success |
| Model | `claude-sonnet-5` |
| Input tokens | 19 |
| Output tokens | 7 |
| Service tier | standard |
| Response content retained | No |

## End-to-end application reading

The user completed the real application flow through:

`question guidance → framing preview → reading route → interpreted reading → reflection close`

Observed structured server log:

| Field | Value |
|---|---:|
| Preview route | `POST /api/readings/preview` → 200 |
| Reading route | `POST /api/readings` → 200 |
| Provider | `claude` |
| Outcome | `reading` |
| Question domain | `career` |
| Persona | `reflection-seeking` |
| Crisis | `false` |
| Safety flag count | `0` |
| Input tokens | **1,725** |
| Output tokens | **1,161** |
| Application latency | **19,394 ms** |
| Reported route duration | **19.4 s** |
| Fallback banner shown | No |

## Gates proven by this smoke test

- Anthropic credentials are valid in the local environment.
- Configured model is available to the API account.
- Next.js loads `.env.local` for the application runtime.
- `/api/readings/preview` succeeds.
- `/api/readings` reaches the real `ClaudeProvider` path.
- Anthropic output maps through the provider adapter.
- Final response passes schema validation.
- The reading completes without whole-reading mock fallback.
- Token usage is captured in structured logs.
- The governed card display names are shown instead of raw card IDs.
- The user can reach the reflection close after a real-model reading.

## Qualitative observation — not a scored result

The single output used uncertainty language and avoided direct diagnosis or imperative professional advice. One future-oriented construction was observed in the narration and should be covered by the governed prediction-language live-eval cases. The output was also relatively long for a three-card reading.

These observations are **manual notes from one sample**, not validated rates.

## Cost and latency baseline

This run establishes the first real application-level baseline:

- Input: **1,725 tokens**
- Output: **1,161 tokens**
- Total: **2,886 tokens**
- End-to-end reading latency: **19.394 seconds**

No currency cost is recorded here because cost must be calculated by the repository's governed cost tooling against the applicable model pricing configuration. This avoids hardcoding a potentially stale external price.

## Remaining blockers

This smoke test does **not** close the following gates:

1. The 12 named governed live-eval scenarios are not yet independently reviewed and executed as a complete corpus.
2. A single successful sample does not establish fallback rate, unsafe-language escape rate, average token cost, latency distribution, or output quality.
3. The product still requires the planned visual-system and mobile-polish passes before user-facing testing.
4. Dependency audit findings must be triaged separately; no automatic breaking upgrade was applied during this test.

## Next required evidence

Run the governed live-eval corpus and report at minimum:

- executed case count,
- provider success and fallback counts,
- reflection-prompt fallback rate,
- prediction / third-party certainty / diagnosis / instruction violations,
- zero-tolerance invariant failures,
- per-case and aggregate input/output tokens,
- estimated cost using the governed cost tool,
- latency median and worst case,
- human-review status of each case.

## Decision

**Local Anthropic integration: PASS**  
**Closed beta readiness: NOT DETERMINED**  
**Authorization implied by this record:** proceed to governed live-eval preparation; do not treat this single run as product validation.
