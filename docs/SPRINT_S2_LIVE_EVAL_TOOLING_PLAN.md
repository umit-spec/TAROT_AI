# Sprint S2 — Real Anthropic Evaluation: Safe-Run Tooling — PROPOSAL

**Date:** 2026-07-23
**Status:** PROPOSAL (docs-only). No implementation until Product-Owner approval of this proposal.
**Governed by:** `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md` §S2; Phase 2 decision **D4**.
**Binding constraints (Product Owner):** the **Product Owner runs the real Anthropic evaluation locally** with a key that exists only in `.env.local`; the key must **never** be printed, logged, snapshotted, committed, or placed in any evidence artifact. **Without a genuine live run, S2 cannot be PASS.** Highest allowed interim status: **`IMPLEMENTATION COMPLETE — LIVE RUN PENDING`**.

---

## 1. Goal

Give the Product Owner everything needed to run the existing 24-case harness against the **real Claude provider** locally, safely, and produce an analyzable, **secret-free** result — plus a **Claude-vs-Mock blind comparison** and a **cost report**. Claude builds the rails; the PO drives the train.

## 2. What already exists (verified, not rebuilt)

- `scripts/evaluation/live-anthropic.ts` — checks for the key via `loadClaudeProviderConfig()` and writes `NOT EXECUTED / credentials unavailable` when absent (no fake success).
- `providers/claude/http.ts` captures token `usage`; `generateInterpretedReading` returns `fallbackReason` + `usage`.
- Default evaluated model: **`claude-sonnet-5`** (overridable via `ANTHROPIC_MODEL`).
- Zero-tolerance harness enforcement: any violation fails the whole run.

S2 **adds tooling around** this; it does not modify the runtime reading engine.

## 3. Deliverables (all Claude-authored)

### 3.1 Safe local-run procedure (doc)
`docs/evaluation/LIVE_RUN_PROCEDURE.md`: exact steps to place the key in `.env.local` (git-ignored, confirmed), run `evaluation:live-anthropic`, and collect artifacts — with an explicit "never do" list (no `echo $ANTHROPIC_API_KEY`, no pasting the key into chat/commits/screenshots, no committing raw artifacts before the scrubber passes).

### 3.2 Preflight check (script) — `evaluation:live-preflight`
Runs **before** a live run and refuses to proceed unless all pass, **without ever printing the key**:
- key present and non-empty (reports only `present: true/false`, never the value or length-as-fingerprint);
- `.gitignore` covers `.env*` and the raw live-run artifact path;
- target model resolvable; timeout/retry config valid;
- a redaction self-test (see 3.3) passes on a synthetic string;
- network reachability to the API host **without** sending the key (a HEAD/OPTIONS-style check or a cl: documented manual step if the environment blocks it).
Output is a checklist; a fail blocks the run with a remedy.

### 3.3 Secret-safe artifact flow
- A **scrubber/validator** (`evaluation:scrub-artifacts`) that scans a live-run folder for anything resembling a key (`sk-ant-` prefixes, the configured env value if present in-process, high-entropy tokens) and **fails loudly** if found, before anything is shown or committed.
- Artifact policy: **raw request/response payloads stay local and git-ignored**; only **derived, secret-free** manifests/metrics (token counts, latency, fallback reasons, violation counts, cost) are eligible to commit — and only after the scrubber passes. A `.gitignore` entry for the raw live-run path is included.
- Reaffirms D4: no key in any evidence artifact, ever.

### 3.4 Claude-vs-Mock blind comparison tooling — `evaluation:compare`
- Takes a live run folder + a mock run folder over the **same 24 cases**.
- Emits **anonymized A/B pairs** (provider identity stripped, order randomized per case, a blind map stored separately) into a scoring sheet for the founder and second human to rate on usefulness/coherence/safety-feel **without knowing which is Claude**.
- After scores are entered, an **unblind** step joins scores back to providers and reports the delta: *does Claude measurably beat the deterministic Mock, and by how much?* — the exact question G1 needs.

### 3.5 Cost calculation + report — `evaluation:cost` / report scaffold
- Converts captured input/output tokens → USD using **current published Anthropic pricing for the evaluated model** (pulled from the `claude-api` reference at implementation time, not hardcoded from memory; model is `claude-sonnet-5` by default).
- Produces `validation/investor-readiness/UNIT_ECONOMICS_BASELINE.md` (cost/reading, projected variable cost/active-user seed) and the `LIVE_MODEL_EVALUATION_REPORT.md` scaffold, **marked engineering-baseline / founder-scored where founder-scored**.

## 4. Ownership split

| Work | Owner | Claude can do? |
|---|---|---|
| Procedure doc, preflight, scrubber, compare tool, cost tool, report scaffolds | **[Claude]** | Yes |
| Supply the key in `.env.local`; execute the real live run; fund credits | **[Product Owner]** | No — key is local-only (D4) |
| Founder scoring (transparent) | **[Product Owner]** | No |
| Independent subset scoring + cross-check | **[Second human ≠ founder]** | No |

## 5. Dependencies · effort · risks

- **Dependencies:** Sprint 0 (done). Independent of S1/S3. **Note:** this remote environment has no key and no confirmed network path to Anthropic — the live run happens on the PO's machine.
- **Effort:** **S** (~1–1.5 days of tooling) + a PO run (~an hour + a few USD credits).
- **Risks:** key leakage (mitigated by preflight + scrubber + git-ignored raw artifacts + existing key-never-in-error test); live quality underwhelms or costs exceed assumptions (that is the *finding*, surfaced at G1); scorer bias (mitigated by blind comparison).

## 6. Evidence artifacts

- `docs/evaluation/LIVE_RUN_PROCEDURE.md`; preflight/scrubber/compare/cost scripts + their unit tests (run against **synthetic** data, no key).
- After the PO's live run: a secret-free live-run manifest under `data/evaluation/runs/live-anthropic-*`, blind-comparison scores, `LIVE_MODEL_EVALUATION_REPORT.md`, `UNIT_ECONOMICS_BASELINE.md`.

## 7. Acceptance criteria & allowed statuses

- **After Claude's work, before the PO's run:** `IMPLEMENTATION COMPLETE — LIVE RUN PENDING` (the explicit ceiling; S2 is **not** PASS here).
- **PASS** requires **all**: a genuine live run executed by the PO; real quality/latency/**cost** baseline recorded; **zero** zero-tolerance violations; blind Claude-vs-Mock delta reported; no secret in any artifact (scrubber-verified).
- S2 must **not** borrow S1/S3 evidence; its PASS depends only on a real live run.

## 8. Open decisions for the Product Owner

1. Confirm the evaluated model — `claude-sonnet-5` (default) or override via `ANTHROPIC_MODEL`?
2. Who is the second scorer for the blind comparison (Selin Naz Çokyaşar, pending her agreement — otherwise the named alternative required before final S2 PASS)?
3. Should the raw request/response payloads be kept locally at all (for debugging) or discarded after metrics are derived? (Default proposal: keep local, git-ignored, scrubber-gated.)
