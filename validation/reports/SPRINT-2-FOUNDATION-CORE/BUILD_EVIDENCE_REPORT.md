# Sprint 2 Build Evidence Report

**Date:** 2026-07-22
**Branch:** `feat/major-arcana-asset-migration`
**Author:** Validation Lead
**Status:** Sprint 2 — CLOSED

---

## 1. Scope

**Sprint 2 — Intake, Provider Abstraction and Safe Narration**

Part of Milestone 2 (Foundation & Executable Core, per
`docs/MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.1.md`). Sprint 2 opened with two
binding conditions from the Sprint 1 GO decision (ESLint restoration as
P0; ADR-011 locking the interpretation knowledge architecture before any
Claude code), then delivered, in order:

1. ESLint 9 flat-config restoration (S2-P0)
2. `InterpretationProvider` interface
3. `MockProvider` + deterministic tests
4. Intake Engine (deterministic, rule-based, no LLM call)
5. `ClaudeProvider` adapter (mock-HTTP verified, no live call)
6. Red-line validator (extended to cover Layer 3 output)
7. Prompt/version record structure (`PROMPT_VERSION` constant)
8. End-to-end engine tests (seed → draw → intake → provider → validated output)
9. Security and error-state coverage (config, HTTP, output validation, fallback)
10. This report

---

## 2. Acceptance Evidence

Ran from a clean install (`rm -rf node_modules .next && npm install`) immediately before this report, not from a warm cache.

| Command | Exit Code | Duration | Result |
|---|---|---|---|
| `npm install` | 0 | 18.4s | 444 packages installed, 0 errors. 3 vulnerabilities reported (see §5/§7 — SECURITY-DEBT-001) |
| `npm run lint` | 0 | 2.6s | 0 errors, 0 warnings |
| `npm run typecheck` | 0 | 1.4s | 0 type errors (`tsc --noEmit`) |
| `npm run test` | 0 | 0.9s (859ms reported by Vitest) | 4 test files, 49/49 tests passed |
| `npm run build` | 0 | ~3s (Turbopack) | Next.js 16.2.11 production build succeeded; 2 static routes generated (`/`, `/_not-found`) |

All five commands green, in sequence, on a clean tree. No command was retried to get a passing result.

---

## 3. Test Inventory

49 tests total, across 4 files. Grouped by what each group actually defends against, not just where the file lives:

| Category | Count | File(s) | What it defends against |
|---|---|---|---|
| **Reading Engine tests** | 10 | `reading-engine.test.ts` | Card data integrity (22 cards, no gaps, no Strength/Justice or Tower/Star swap), draw determinism (same seed → identical output, different seeds → different draws), ADR-002 upright-only enforcement, Zod schema conformance |
| **Intake Engine tests** | 13 | `intake-engine.test.ts` | The full required matrix: career decision, relationship ambiguity, intense emotional language, curiosity-only use, experienced-user language, empty/very-short input, multi-domain tie, absolute medical/legal/financial advice request, crisis language, prompt-injection-like input, explicit topicHint override, low-confidence fallback |
| **MockProvider tests** | 3 | `interpretation-provider.test.ts` | Determinism (byte-identical output for identical input), persona actually changes narration tone, output passes schema + red-line scan |
| **ClaudeProvider tests** (config/prompt construction) | 9 | `claude-provider.test.ts` | Config loads correct model/timeout/retries from env with safe defaults; structured prompt has the right shape; raw user text never leaks into the system prompt; safetyFlags and persona are correctly carried into the prompt |
| **Retry/error tests** | 6 | `claude-provider.test.ts` | Timeout triggers `ClaudeTimeoutError`; 429 → exactly one retry → success; 401 → zero retries; invalid JSON response → `ClaudeOutputValidationError`; missing-field (Zod) failure → `ClaudeOutputValidationError`; card id/order tampering → rejected |
| **Red-line tests** | 2 | `interpretation-provider.test.ts`, `claude-provider.test.ts` | A manipulative phrase (`"Kesinlikle..."`) is caught by `validateInterpretation` regardless of which provider produced it |
| **End-to-end engine tests** | 6 | `interpretation-provider.test.ts`, `claude-provider.test.ts` | `generateInterpretedReading()` works with an arbitrary provider; falls back to `MockProvider` when a provider throws, when it returns a manipulative phrase, and when its JSON is unparseable; a fully successful Claude response is used untouched end-to-end; intake `safetyFlags` propagate into the final output on the happy path |

**49/49 passing is not the claim being made here — the claim is that these specific failure modes are each independently exercised**, not just that the code happens to run without crashing.

---

## 4. Architecture Evidence

Recorded here as executable fact (tests + code), not just design intent:

- **Dependency direction is one-way: Reading Engine → `InterpretationProvider`.** `src/server/reading-engine/index.ts` imports the `InterpretationProvider` interface; neither `deck.ts`, `deterministic.ts`, nor `synthesis.ts` import anything from `providers/`. A provider cannot reach back into card selection or Layer 1/2 logic — there's no import edge for it to do so through.
- **`ClaudeProvider` cannot select cards.** `drawCards()` (in `deck.ts`) is called once, in `generateDeterministicReading()`, before any provider is invoked. `ClaudeProvider.generate()` receives an already-drawn `DeterministicReading` and has no code path that calls `drawCards` or `getAllCards` itself.
- **Deterministic data is ground truth, never provider output.** `mapper.ts`'s `mapToInterpretationOutput()` sources `symbolicMeaning`, `position`, `reflection`, and `patterns` exclusively from the `DeterministicReading` argument — Claude's JSON response contributes only `insight` (→ `relevanceToQuestion`), `summary` (→ `opening`), and `synthesis`+`reflectionPrompt` (→ `practicalReflection`). Verified by test: `output.cards[0].symbolicMeaning` is asserted equal to `reading.interpretations[0].symbolicMeaning` in the happy-path test, not merely "some string."
- **The mapper verifies card id and order match the original draw.** `mapToInterpretationOutput()` throws `ClaudeOutputValidationError` if `cardInsights.length` doesn't match, or if any `cardId` at a given index doesn't match the corresponding `reading.interpretations[i].cardId` — a hallucinated or reordered card list is rejected before it can reach the user. Covered by the "card id/order mismatch" test.
- **The fallback chain is centralized, not per-provider.** `generateInterpretedReading()` in `reading-engine/index.ts` wraps *any* provider's `generate()` call in one `try/catch` that falls back to `MockProvider` — `ClaudeProvider` itself contains no fallback logic, no knowledge of `MockProvider`, and no special-casing. Adding a fourth provider later needs zero changes to the fallback mechanism.
- **`safetyFlags` are never provider-controlled.** Both `MockProvider` and `ClaudeProvider` unconditionally return `safetyFlags: []`; the actual flags are unioned in from `IntakeContext.safetyFlags` centrally, in `runProvider()`, after the provider call returns.

---

## 5. Security Evidence

| Control | Evidence |
|---|---|
| API key never logged | Grepped `src/server/reading-engine/providers/claude/`: zero `console.log`/`console.error`/`console.warn` calls anywhere in the directory. `apiKey` only ever appears as a config field or the `x-api-key` HTTP header value. |
| System prompt is fully static | `buildSystemPrompt()` (`prompt.ts`) takes no arguments and contains no string interpolation — there is no code path for user data to reach it. Verified by test: a unique marker string placed in `questionText` is asserted absent from `buildSystemPrompt()`'s output. |
| User text is data-only | The marker string is also asserted to appear *only* inside `parsed.userData.userQuestion` (a JSON field explicitly tagged `treatAsDataOnly: true`), and asserted absent from the `developerInstruction` block. |
| Retry limit enforced | `callAnthropicWithRetry()` performs exactly `1 + maxRetries` attempts, verified by call-count assertions in the 429 (2 calls) and 401 (1 call) tests. |
| Timeout enforced | `AbortController` fires at `config.timeoutMs`; verified by a fake fetch that only rejects on the abort signal, with a 20ms timeout in the test. |
| Schema validation | `ClaudeInterpretationOutputSchema` (Zod) rejects any response missing a required field; verified by the "Zod başarısız" test using a deliberately incomplete payload. |
| Red-line validation | `validateInterpretation()` runs on every provider's output before `generateInterpretedReading()` can return it; verified against a payload containing `"Kesinlikle..."`. |
| Unsupported/malformed model output rejected | Non-JSON response text, and a JSON response with a hallucinated `cardId`, both throw `ClaudeOutputValidationError` before reaching the caller. |
| Fallback behavior | Every failure mode above (config error, HTTP error, timeout, validation error, red-line violation) is independently verified to result in `generateInterpretedReading()` returning `providerUsed: 'mock'` rather than propagating the failure to the caller. |

Cross-reference: `docs/SECURITY_DEBT_LOG.md` (SECURITY-DEBT-001) for the separate, dependency-level security posture (npm audit findings) — not overlapping with the above, which is about this sprint's own code.

---

## 6. Deferred Items

Explicitly out of scope for this sprint, listed so nobody mistakes "Sprint 2 closed" for "these are done":

- **No live Anthropic API call has been made.** `ClaudeProvider` is verified entirely against a mocked HTTP layer (injected `fetch`). A real key has never been supplied in this environment.
- **No HTTP API route exists.** `generateInterpretedReading()` is called directly from tests; there is no Next.js route handler exposing it over HTTP yet.
- **No persistence.** Nothing is written to a database; there is no database connection in this codebase yet (Drizzle/PostgreSQL per ADR-009 is unimplemented).
- **No pair-relation knowledge matrix.** ADR-011 explicitly deferred adjacent-card influence data to Milestone 3.
- **No NotebookLM pipeline / RAG infrastructure.** Also explicitly deferred by ADR-011 to Milestone 3.
- **No UI persona mapping.** `AŞAMA_2_PERSONA_WIREFRAME_PATHS.md`'s wireframe copy still uses the old 5-archetype vocabulary; reconciling it with the Intake Engine's session-scoped taxonomy is UX-DEBT-001, open and unstarted.
- **Milestone 1 asset findings remain frozen.** The Red Team audit of the Major Arcana asset pipeline (charter: `validation/RED_TEAM_AUDIT_CHARTER_v1.0.md`) has not run; two known issues in `tests/assets.test.js` (a stale `-the-tower`/`-the-star` reference, and an under-threshold file size on `11-justice.webp`) remain untouched, per explicit instruction, for Red Team to find independently.

---

## 7. Risks and Debt

| Reference | Summary | Status |
|---|---|---|
| `docs/SECURITY_DEBT_LOG.md` — SECURITY-DEBT-001 | 3 remaining npm audit findings (sharp/postcss/next), accepted since the only fix downgrades Next.js below ADR-003's requirement | Open, reviewed each sprint start |
| — sharp runtime risk (within SECURITY-DEBT-001) | Currently dev-only exposure (no `next/image` usage yet); becomes a real runtime concern the moment Sprint 3 wires up card artwork rendering | Open, gates Sprint 3's `next/image` work specifically |
| `docs/UX_DEBT_LOG.md` — UX-DEBT-001 | Intake Engine's session-scoped persona taxonomy has no tested mapping to the wireframe spec's UX archetypes yet | Open, gates any persona-conditional screen |
| `tests/assets.test.js` legacy issues | Stale ID reference breaking the Tower/Star swap test; `11-justice.webp` under the file-size test threshold | Open, deliberately untouched, awaiting Red Team (Milestone 1 frozen scope) |
| Anthropic live integration gate | No live-call verification exists yet | Open — proposed as a separate `integration:anthropic` gate, run once a real API key is available, not part of Sprint 2's definition of done |

---

## 8. Final Status

**Sprint 2 Status: PASS WITH DOCUMENTED DEBT**

Executable core, deterministic intake, provider abstraction, safe Claude
adapter, validation, fallback and build gates verified.

Live provider integration and product API exposure are deferred.

---

**Report Generated:** 2026-07-22
**By:** Validation Lead
**Branch:** `feat/major-arcana-asset-migration`
**Next Step:** Milestone 2 checkpoint review before Sprint 3 (per closing instruction — re-sequencing UI / API route / persistence / knowledge architecture may be needed)
