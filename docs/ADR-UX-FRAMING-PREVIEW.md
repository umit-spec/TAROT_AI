# ADR-UX-FRAMING-PREVIEW — Server-side framing preview endpoint (Option A)

**Status:** ACCEPTED — IMPLEMENTATION CONDITIONED ON SAFETY GATE
**Type:** Architecture + security review. The architecture (Option A) and requirements R1–R12 are binding. Endpoint implementation is gated (§5.1) behind the crisis-resource safety-remediation.
**Decision owner:** Product Owner
**Branch verified:** `claude/insight-engine-investor-audit-bkofgr` (HEAD `a56337e`)
**Unblocks:** `docs/UX_FLOW_V2.md` §5 (the `framing` screen / S-UX-2), which is blocked until this GO/NO-GO passes.
**Depends-on / must not break:** `src/app/api/readings/route.ts`, `src/server/intake` (`classifyIntake`, `isCrisisFlag`), `src/types/api.ts` (`ReadingRequestSchema`, `CrisisResponseSchema`), `src/lib/persona-mapping.ts`.

---

## 1. Decision

Implement framing review as **Option A — a separate, server-side framing-preview endpoint** (`POST /api/readings/preview`) that returns only a safe, human-readable framing and draws no cards. Options B (two-phase `/api/readings`) and C (client-side summary) are rejected:

- **B rejected:** splitting the working single-call `/api/readings` into two phases enlarges the blast radius on existing clients/tests, fragments the Reading Engine flow, and introduces transaction/idempotency complexity — it forces re-proving the single-call safety guarantees that already hold.
- **C rejected:** a client-side summary is cosmetic. It creates two interpretation authorities (client summary vs. server classification) that can diverge, so "seni böyle anladım" would not be what the server actually understood — a weak, non-defensible product claim.

This ADR does **not** authorize writing the endpoint. It defines the binding contract and a GO/NO-GO gate. Endpoint code is a later, separately reviewed change (S-UX-2), gated behind the safety work in §5.1.

### 1.1 Safety gate on implementation (binding)

Single-sourcing the crisis data fixes *consistency*, not *correctness*: a wrong or unverified resource, held in one place, is still wrong. The known crisis-resource safety debt must not be widened onto a second endpoint. Therefore implementation proceeds in this order, and **the preview endpoint must not surface the crisis-resource response over the new route until the safety-remediation (Commit B) is complete:**

- **Commit A — mechanical single-source extraction (done in this change).** The existing crisis `message` + `resources` are moved to `src/server/intake/crisis-resources.ts` **byte-for-byte unchanged**; only `/api/readings` consumes them; a regression test pins the exact content. This commit **verifies nothing** about the resources — it is refactor-only.
- **Commit B — official-source safety-remediation (separate, not yet done).** Verify every number and its purpose against current official Turkish sources; remove/correct unverified entries; stop presenting an emergency line and a social-support/violence line as the same function; update tests. Its own reviewed safety commit.
- **S-UX-2 — preview endpoint.** May reference the shared crisis module, but must not expose crisis resources to users over the new route until Commit B has landed.

---

## 2. Target flow

```
POST /api/readings/preview
        │
        ├─ rate-limit (independent from /api/readings; never inspects body)
        ├─ parse + STRICT schema validation  ({ question, topicHint? } only)
        ├─ classifyIntake()   ← same rule-based, LLM-free classifier as the reading route
        ├─ crisis gate        ← intake.safetyFlags.some(isCrisisFlag), BEFORE any framing is built
        │        └─ crisis → { status:'crisis', … }  (no framing, no cards, no seed)
        └─ safe framing        → { status:'preview', framing:{ topicLabel, reflectiveFocus } }
                    │
              user confirms (client-side only)
                    │
POST /api/readings   ← unchanged; re-runs classifyIntake + crisis gate on ITS OWN body
        └─ crisis gate repeated → cards + narration
```

**Key architectural finding (grounds requirement 11 below):** `classifyIntake` is a pure, deterministic, **rule-based classifier with no LLM call** (`src/types/intake.ts` docstring; used at `src/app/api/readings/route.ts:84`). The crisis decision is `intake.safetyFlags.some(isCrisisFlag)` (`route.ts:86`) — also rule-based. Therefore the preview endpoint performs **no provider/model inference of any kind**: it reuses the same classifier and derives framing from its output. There is no second classifier, and there is no inference surface for the crisis gate to be bypassed around.

---

## 3. Binding requirements

### R1 — Endpoint
`POST /api/readings/preview`. New route; the existing `POST /api/readings` is untouched.

### R2 — Request (client → server): minimal, strict
Exactly:
```ts
{
  question: string;          // default '' — empty question is valid
  topicHint?: 'relationship' | 'career' | 'self';
}
```
A dedicated `PreviewRequestSchema` (Zod `.strict()`) — **unknown keys are rejected with 400**, not silently stripped. This makes the "extra client fields" policy explicit and refuses any attempt to smuggle classification input.

### R3 — Client can NEVER send (rejected by R2's strict schema)
`IntakeContext`, `persona`, `emotionalIntensity`, `decisionUrgency`, `spiritualPreference`, `responseDepth`, `confidence`, `safetyFlags`, any `framing*` field, and `seed`. The request schema has no slot for any of them; the strict schema turns an attempt into a 400. (Same rationale as `src/types/api.ts:7-14`: a client that could set `safetyFlags: []` would defeat the crisis gate.)

### R4 — Normal response (server → client): safe, human-readable framing only
```ts
{
  status: 'preview';
  framing: {
    topicLabel: string;       // e.g. "Kariyer", "İlişki", "Kendim", "Açık uçlu"
    reflectiveFocus: string;  // e.g. "Bu kararda gözden kaçırıyor olabileceğin etkenler"
  };
}
```
`topicLabel` and `reflectiveFocus` are **curated, human-safe presentation strings**. `reflectiveFocus` describes the *angle of reflection*, never the classification. Forbidden phrasings (leaks classification): "seni yüksek duygusal yoğunlukta / kararsız / kaygılı olarak sınıflandırdık". Required phrasing (angle only): "Bakacağımız açı: …".

### R5 — Response must NEVER contain
raw `IntakeContext`, `confidence`, `safetyFlags`, `persona` enum value, `spiritualPreference`, `emotionalIntensity`, `decisionUrgency`, provider/model name, model reasoning, `cards`, `seed`, predicted card IDs, psychological diagnosis, or any inference about third parties. The serialized shape is exactly R4 (or R7 for crisis) — nothing more. This must be asserted by a test that inspects the full response body key set.

### R6 — Crisis gate runs in preview, before any framing is built
The preview endpoint runs `classifyIntake` then the crisis check **before** constructing any framing string. On crisis it returns the crisis response (R7) and builds **no framing, no cards, no seed, no provider call**.

### R7 — Crisis response shape (single-sourced, not duplicated)
Mirrors `CrisisResponseSchema` (`src/types/api.ts:43-47`):
```ts
{ status: 'crisis'; message: string; resources: { label: string; contact: string }[] }
```
The crisis **message and resource data are single-sourced**, shared with `/api/readings`. The endpoint must **not** copy-paste the crisis numbers — see the proposed extraction in §6. (Duplicating them would create a divergence risk and would collide with the separate crisis-number safety-remediation task, which this ADR does not touch.)

### R8 — Preview grants NO authority to the reading call
The result of `/preview` is never a token, flag, cookie, header, or cache key that `/api/readings` trusts. `/api/readings` continues to re-run `classifyIntake` + the crisis gate on **its own** request body every call (`route.ts:84,86`), unchanged. This is what defends against: the user editing the question after preview, a manipulated client, a different payload between preview and reading, or new risky content added post-preview.

### R9 — Preview never touches the Reading Engine
No card selection, no `seed` generation, no `generateInterpretedReading`, no Knowledge Layer resolution, no narration provider. If framing derivation is ever proposed to need a provider in the future, that is a new ADR — out of scope here.

### R10 — Editing framing is client-side only
The user cannot edit `topicLabel`/`reflectiveFocus` and POST them back. "Sorumu düzenle" returns to the raw-question screen (`compose`) and triggers a **new** `/preview` call. The server never accepts framing strings as input (already guaranteed by R2/R3).

### R11 — Operational contract
- **Rate limit (independent AND separately configurable):** a `RateLimiter` instance for `/preview` that is independent of the reading limiter (`route.ts:29`) — a distinct abuse surface with its own counter/window. Its threshold must be **its own configuration value, not a blind copy of the reading limiter's**: the normal "yaz → gör → düzelt → yeniden gör" (compose → preview → edit → re-preview) loop means a user legitimately calls `/preview` several times per reading, so the preview limit must prevent abuse **without punishing** that loop. No hard-coded number in the route; the value lives in configuration (its own env/config knob). Same enable policy (`isRateLimitEnabled()`: OFF in dev/test, ON in prod / `RATE_LIMIT_ENABLED=1`), same `clientKey(headers)` derivation, **never inspects the body**. On 429: `{ error:'rate_limited', … }`, `retry-after` header, mirroring `route.ts:52-59`.
- **Timeout/failure:** because there is no LLM/network call, preview is deterministic and fast. Failure modes are only: invalid JSON → 400; strict-schema reject → 400; unexpected server error → 500 with **no framing and no cards**. No provider timeout path exists.
- **Logging/redaction (`logPreview`, not a fake reading):** `logReading` must **not** be forced onto preview if its semantics are reading-specific. Preview emits its **own** event, e.g. `logPreview({ requestId, status, latencyMs, outcome, safetyFlagCount, questionDomain })`, sharing the **same redaction primitives** as `logReading` (`src/server/observability/log.ts`) but recorded as a distinct event type. A preview call must **never** be counted as a reading — otherwise the conversion funnel, reading-completion metric, and cost/success figures are corrupted. Derived signals only; **never** log question text, crisis text, or the framing strings (matches D4/D5; `route.ts:94`).
- **Idempotency:** preview is a pure function of `{question, topicHint}` (deterministic classifier, no seed, no persistence, no side effects) → naturally idempotent; repeated identical requests return identical framing. No idempotency key required.
- **Crisis-text retention:** crisis `message`/`resources` are returned but never stored or logged.

### R12 — Reuse, don't re-implement
Reuse `classifyIntake` and `isCrisisFlag` **verbatim** — do not create a second classifier or copy any classification business logic. Framing strings are derived by a **presentation-only** formatter over the classifier's already-computed `questionDomain`/`persona` (the existing `resolvePersonaProfile` in `src/lib/persona-mapping.ts` already returns human-safe framing labels; a small `topicLabel`/`reflectiveFocus` presenter sits on top and serializes only safe strings). A presenter that formats existing classifier output is **not** a second classifier.

---

## 4. Test matrix (contract scenarios — to be implemented with the endpoint, not now)

| # | Scenario | Expected |
|---|---|---|
| 1 | Normal relationship question | `status:'preview'`, safe framing only (R4/R5) |
| 2 | Empty question (`''`) | `status:'preview'`, valid neutral framing; no error |
| 3 | Prediction-style question ("ne olacak?") | `status:'preview'`, reflective framing; **no prediction produced** |
| 4 | Third-party mind-reading question ("o beni seviyor mu?") | framing redirects to the **user's own** reflective focus; no third-party inference |
| 5 | Crisis expression | `status:'crisis'` (R7); **no framing, no cards, no seed, no provider call** |
| 6 | Extra client fields (`persona`, `safetyFlags`, `seed`, …) | **400** — strict-schema reject (R2/R3) |
| 7 | Reading request altered after preview | `/api/readings` re-runs the crisis gate on its own body (R8); preview grants nothing |
| 8 | "Preview provider error" | **N/A by construction** — preview makes no provider call; assert no card/seed is ever produced on any preview path (R9) |
| 9 | Rate limit | independent limiter blocks abuse without affecting `/api/readings` (R11) |
| 10 | Full response key-set inspection (normal + crisis) | keys are exactly R4 / R7 — no leaked internal field (R5) |

---

## 5. GO / NO-GO gate

**Precondition (§1.1):** S-UX-2 must not expose the crisis-resource response over the new route until the safety-remediation (Commit B) has landed.

Endpoint coding (S-UX-2) passes **only if all of these hold and are covered by the §4 matrix**:

- [ ] **G-1** Crisis gate runs in preview **before** any framing is built, and before there would be any provider call (there is none). *(R6)*
- [ ] **G-2** `/api/readings` re-runs the crisis gate on its own body; the preview result is never a bypass token — a crisis phrase edited in after preview is still caught. *(R8)*
- [ ] **G-3** Preview produces **no card selection and no seed**, and never calls the Reading Engine (0 Reading Engine calls, 0 provider calls). *(R9)*
- [ ] **G-4** **No raw internal classification leak** — response is exactly R4/R7; confidence/safetyFlags/persona/provider never serialized; verified by a key-set test. *(R5)*
- [ ] **G-5** The existing `/api/readings` contract is **not broken** — its request/response schemas, crisis gate, rate limiter, and all current tests are unchanged. *(R8)*
- [ ] **G-6** Crisis data is **single-sourced** with `/api/readings` (no duplicated numbers), and the classifier is **reused, not re-implemented**. *(R7/R12)*
- [ ] **G-7** Preview has an **independent, separately-configured** rate limiter that blocks abuse but does **not** block the normal compose → preview → edit → re-preview loop at expected use. *(R11)*
- [ ] **G-8** Preview events are logged as their **own** event type and are **never** counted toward the reading-completion metric / conversion funnel. *(R11)*

**NO-GO** if any box cannot be met — in particular, if framing derivation is found to require a provider call (would reintroduce an inference surface), or if crisis data or classifier logic would have to be duplicated, or if Commit B is not yet complete.

---

## 6. Proposed file-change list (for the FUTURE S-UX-2 coding change — not part of this docs commit)

**Done in this change (Commit A):**

| File | Change | Why |
|---|---|---|
| `src/server/intake/crisis-resources.ts` *(new)* | Crisis `message` + `resources` extracted **byte-for-byte** from `route.ts`; marked mechanical/unverified | R7/G-6 single-sourcing |
| `src/app/api/readings/route.ts` | Now imports the shared `CRISIS_MESSAGE`/`CRISIS_RESOURCES`; no content change | R7/G-6 |
| `src/__tests__/unit/api-readings.test.ts` | Regression test pinning the exact crisis message + resources | proves extraction is content-preserving |

**Still to do, each a separate reviewed change (NOT made now):**

| File | Change | Why |
|---|---|---|
| *(Commit B)* `src/server/intake/crisis-resources.ts` + tests | Official-source verification + correction of the numbers/purposes | §1.1 safety gate — precondition for preview exposing crisis resources |
| `src/types/api.ts` | Add `PreviewRequestSchema` (`.strict()`) + `FramingPreviewResponseSchema` (`{status:'preview', framing:{topicLabel, reflectiveFocus}}`) | R2/R4/R5 typed contract |
| `src/lib/framing-presenter.ts` *(new)* | Presentation-only `topicLabel`/`reflectiveFocus` formatter over `classifyIntake` output (wraps/uses `resolvePersonaProfile`); serializes only safe strings | R4/R12 (presenter, not a second classifier) |
| `src/server/observability/rate-limit.ts` | (No signature change) reuse `RateLimiter`/`clientKey`/`isRateLimitEnabled`; add a **separate preview threshold config** (its own env/config knob, not the reading value) | R11 independent, separately-configured limiter |
| `src/server/observability/log.ts` | Add a `logPreview` event sharing the redaction primitives but distinct from `logReading` | R11 — preview not counted as a reading |
| `src/app/api/readings/preview/route.ts` *(new)* | The endpoint: rate-limit → strict parse → `classifyIntake` → crisis gate → framing; no Reading Engine, no provider | R1/R6/R9 |
| `src/app/api/readings/route.ts` | (No further change) — re-check already present at `:84,86` | G-5 |
| `src/__tests__/unit/framing-preview.test.ts` *(new)* | Implement the §4 matrix incl. the R5 key-set inspection | G-4/G-8 |
| `docs/DECISION_LOG.md` | Register this ADR | traceability |

---

## 7. Constraints honored by this ADR

Docs-only · no runtime/schema/endpoint change · `/api/readings` untouched · no crisis-number change (that remains the separate safety task) · no S3/S4 change · no methodology-extraction resume · classifier reused not duplicated · no new inference surface.

---

## 8. Sign-off and implementation sequence

**Decision:** GO on the architecture (Option A). Status **ACCEPTED — IMPLEMENTATION CONDITIONED ON SAFETY GATE**; R1–R12 binding. Endpoint coding is gated behind §1.1.

Minimal safe implementation order (each a separate reviewed change):

1. ADR status/notes update *(this change)*
2. Mechanical crisis-resource single-source extraction *(this change — Commit A)*
3. Crisis-resource official safety review + correction *(Commit B — not started)*
4. Preview request/response schemas
5. Framing presenter
6. Preview route
7. Preview endpoint test matrix (§4)
8. Framing review UI (S-UX-2 client)
9. End-to-end crisis + payload-manipulation test

Binding product order continues: S-UX-1 → **S-UX-2 (gated)** → S-UX-3 → S-UX-4 → S-UX-5 → visual polish. `reveal` (S-UX-3) and `pattern` (S-UX-4) remain queued and do not begin early.

- **Product Owner sign-off (architecture GO):** recorded 2026-07-24.
- **Safety-gate cleared (Commit B complete):** ____________________  **Date:** ____________
