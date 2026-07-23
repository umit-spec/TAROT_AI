# Sprint S2 — Real Anthropic Evaluation Tooling — Build Evidence Report

**Date:** 2026-07-23
**Branch:** `claude/insight-engine-investor-audit-bkofgr`
**Governed by:** `docs/SPRINT_S2_LIVE_EVAL_TOOLING_PLAN.md` (APPROVED) + Product-Owner binding decisions (model, raw-payload policy).
**Status:** **IMPLEMENTATION COMPLETE — LIVE RUN PENDING.** This is the explicit ceiling; S2 is **not** PASS. PASS requires a genuine local Anthropic run, founder scoring, and independent human subset scoring (none of which this environment can perform).

---

## 1. Scope delivered (offline evaluation tooling)

1. **Safe local-run procedure** — `docs/evaluation/LIVE_RUN_PROCEDURE.md`: key-in-`.env.local`-only, never printed/committed; step-by-step preflight → run → scrub → cost → blind-compare → cleanup.
2. **Preflight** — `evaluation:live-preflight`: reports key presence as `present: true/false` (never the value), verifies `.env*` + raw path git-ignored, model resolvable, and a scrubber self-test; hard-fails block a run. Verified output: all hard checks ✓ in this repo.
3. **Secret scrubber** — `lib/scrub.ts` + `evaluation:scrub-artifacts`: catches `sk-ant-*`, `Authorization: Bearer`, `x-api-key`, and an exact env-key match; masks findings, never prints the secret. Scans a whole run folder and fails loud.
4. **Secret-safe raw artifact flow** — `--retain-raw` (default **OFF**, Product-Owner decision 3): writes per-case narration + structured request to a **git-ignored** `raw/` folder, each **scrubbed before write** (write refuses on any match). `.gitignore` covers `data/evaluation/runs/**/raw/` and `data/evaluation/comparisons/`. Raw = structured request + narration, **not** the literal HTTP bytes — the `Authorization` header/key live only in the transport layer and are never persisted.
5. **Raw retention cleanup** — `evaluation:cleanup-raw`: deletes `raw/` folders older than 7 days (default), leaving scrubbed metrics in place.
6. **Claude-vs-Mock blind comparison** — `evaluation:compare build|unblind`: strips provider identity, randomizes A/B per case, writes a scoring sheet + a **separate** unblind map + a blank scores template; `unblind` joins scores back to providers and reports the live-vs-mock delta (the G1 signal).
7. **Cost calculator + full report** — `lib/pricing.ts` + `evaluation:cost`: `claude-sonnet-5` at $3/$15 per 1M (auto-applies the $2/$10 introductory rate on/before 2026-08-31), overridable via `ANTHROPIC_MODEL`; unknown models reported as unpriced, never guessed. The report records **every required field**: model name, run date, prompt version(s), input/output tokens, total USD cost, cost/case, p50/p95 latency, fallback reasons, **schema failures**, **red-line rejections**, and **zero-tolerance invariant results**.
8. **Additive harness wiring** — `runCase` gains an optional raw-capture callback; `live-anthropic` gains `--retain-raw` and records the evaluated `model` in the manifest (optional field, mock manifests unaffected). The runtime reading engine (providers, http, validation) is **untouched**.
9. **Tests** — `src/__tests__/unit/evaluation-s2-tooling.test.ts` (13 tests): pricing intro/standard/unknown, scrubber catch/mask/clean, raw write/refuse-secret/cleanup, preflight no-leak + hard checks, cost report required fields, blind build + unblind tally.

## 2. Acceptance evidence — gates

| Command | Result |
|---|---|
| `npm run lint` | 0 errors |
| `npm run typecheck` | 0 errors |
| `npm run test` | 13 files, **183/183** (170 prior + 13 new), zero regressions |
| `npm run build` | 0 — same 3 routes (no runtime change) |
| `npm run evaluation:live-preflight` | all hard checks ✓; key `present: false` reported honestly (no key in this env) |
| `npm run evaluation:live-anthropic` | `NOT EXECUTED / credentials unavailable`, harness `VERIFIED`, raw retention `OFF` |
| `npm run evaluation:cost -- <mock-run>` | report written; mock model `unknown`, cost `n/a (unpriced)` — correct for mock |
| `npm run evaluation:scrub-artifacts -- <mock-run>` | 0 secret-like findings |

Transient run artifacts generated during smoke-testing were deleted; the commit contains only tooling.

## 3. Product-Owner decisions honored

- **Model:** default `claude-sonnet-5`, `ANTHROPIC_MODEL`-overridable; report captures model name/version-where-available, date, prompt version, tokens, cost, latency, fallback reasons, schema failures, red-line rejections, zero-tolerance results.
- **Raw payload policy:** default OFF; `--retain-raw` opt-in only; local-only; git-ignored; 7-day max retention with a cleanup command; keys/Authorization never stored (structurally impossible in the artifact + scrubber-gated); only scrubbed derived metrics committable.
- **PASS conditions:** not claimed — see §4.

## 4. What is NOT done (blocks PASS, by design)

1. A **genuine local Anthropic run** — the Product Owner runs it with `.env.local`; this environment has no key/network.
2. **Founder scoring** and **independent human subset scoring** (Selin Naz Çokyaşar pending agreement; else a named alternative before final S2 PASS).
3. The **blind Mock-vs-Claude delta** from real narration.
4. The recorded **G1** GO/HOLD/STOP decision.

No S1/S3 evidence is borrowed; S2's PASS depends only on a real live run.

## 5. Status

**IMPLEMENTATION COMPLETE — LIVE RUN PENDING.**

## 6. Closure recommendation

Tooling is complete, tested, and safe. Hand to the Product Owner to execute `LIVE_RUN_PROCEDURE.md` locally. S2 remains open at the interim ceiling until the real run + scoring + G1 decision exist. **S4 must not begin until S2 is complete and G1 is explicitly recorded** (Product-Owner cadence rule).
