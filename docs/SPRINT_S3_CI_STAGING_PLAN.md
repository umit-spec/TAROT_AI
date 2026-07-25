# Sprint S3 — CI Gates, Vercel Staging & Observability — PROPOSAL

**Date:** 2026-07-23
**Status:** PROPOSAL (docs-only). No implementation until Product-Owner approval of this proposal.
**Governed by:** `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md` §S3; Phase 2 decisions **D3, D4, D5**; `docs/DEFAULT_BRANCH_MIGRATION_PROPOSAL.md`.
**Binding constraints (Product Owner):** Claude will **not** change the GitHub default branch, **not** act as if branch protection is enabled, **not** deploy production, and **not** connect a production database. Vercel is **preview/staging only**; production must **not** be opened during S3 (D3).

---

## 1. Goal

Make the green local gates enforceable in CI, give the team a reproducible **staging** environment with basic production-grade observability, and prepare (not execute) the `main` migration — so a second developer can recreate staging from documented steps.

## 2. Deliverables (all Claude-authored code/config/docs)

### 2.1 CI code gates — GitHub Actions
`.github/workflows/code-gates.yml`: on PRs to the integration branch (`main` once the PO creates it; until then, the active branch), run `npm ci` → `lint` → `typecheck` → `test` → `build`. Node 20. This is the check the `main` ruleset will later require. Existing `validation-gates.yml` (docs-only) is left in place; this is additive.

### 2.2 Vercel preview configuration (staging only)
`vercel.json` + `docs/deploy/VERCEL_STAGING.md`: framework/build settings for Next.js 16, **preview deployments on PRs**, no production alias. Documents that the production environment is intentionally **not** configured in S3 (D3). No secrets committed — see 2.8.

### 2.3 Request IDs
`src/middleware.ts`: attach an `x-request-id` (incoming header or generated UUID) to every request, propagate to handlers and logs. First middleware in the app (none exists today).

### 2.4 Redacted structured logging
A small logger (`src/server/observability/log.ts`) emitting structured JSON with: `requestId`, route, status, latency, intake persona/domain/**safetyFlag booleans**, provider used, `fallbackReason`, token usage. **Never** logs question text, reflection text, crisis text, or provider payloads (D4/D5). A unit test asserts a reading request produces logs containing **none** of the free-text input. Default log level omits sensitive fields structurally, not by opt-out.

### 2.5 Rate limiting
Per-IP/session limiting on `POST /api/readings` (aligned to ADR-007's ethical-metering intent), returning `429` with a clear message. MVP implementation is in-process/edge-appropriate; a **durable/shared store** (e.g., Postgres/Upstash) is explicitly deferred to when persistence lands (S4) — noted as documented debt, not silently skipped.

### 2.6 Health endpoint
`GET /api/health` → `{ status: 'ok', version, commit }`, no secrets, no DB dependency (S3 has no production DB). Used by Vercel/monitoring for liveness.

### 2.7 Deployment / rollback runbook
`docs/deploy/RUNBOOK.md`: how to deploy a preview, how to read logs/health, how to roll back (Vercel previous-deployment promotion within staging), and the explicit "production is not opened in S3" boundary. Reproducible by a second developer.

### 2.8 Staging secrets documentation
`docs/deploy/STAGING_SECRETS.md`: the env vars staging needs (`ANTHROPIC_API_KEY`, future `DATABASE_URL` for S4 preview DB, etc.), where they live (**Vercel project env, preview scope**), and the rule that they are **never** committed. Documents, does not contain, any secret value.

### 2.9 `main` migration PR preparation
Per `DEFAULT_BRANCH_MIGRATION_PROPOSAL.md`: prepare the PR that adds `code-gates.yml` and targets `main`, plus a written checklist of the **Product-Owner-only** GitHub steps (create `main`, set default, enable protection with the code-gate as a required check). Claude prepares; the PO executes the settings changes.

## 3. Explicit non-goals (binding)

- No change to the GitHub **default branch** or **branch protection** (Product-Owner GitHub actions).
- No **production** deployment or production alias.
- No **production database** connection (S3 wires no DB at all; the preview DB is S4's concern).
- No treating protection as if it's on (e.g., no force-push assumptions).

## 4. Ownership split

| Work | Owner | Claude can do? |
|---|---|---|
| CI workflow, vercel.json, middleware, logger, rate limit, health route, runbook, secrets doc, migration PR | **[Claude]** | Yes |
| Create Vercel project; set staging/preview secrets | **[Product Owner]** | No — account + secrets |
| Create `main`, set default branch, enable branch protection | **[Product Owner]** | No — GitHub settings |
| Approve staging deploy | **[Product Owner]** | No — decision |

## 5. Dependencies · effort · risks

- **Dependencies:** Sprint 0 (done). Independent of S1/S2 for its own PASS. The `main` migration *execution* (PO steps) can follow S3's code landing.
- **Effort:** **M** (~2–4 days).
- **Risks:** `sharp`/`next` image CVE becomes live only when artwork renders (S5) — S3 adds no `<Image>` usage, so no new exposure now; flagged for S5. Accidental sensitive-text logging (mitigated by the redaction test, 2.4). Rate-limit store non-durable across instances (documented debt until S4).

## 6. Evidence artifacts

- Green `code-gates.yml` run on a PR (lint/typecheck/test/build).
- A **preview** (staging) deployment URL reproduced from `RUNBOOK.md` by a second person.
- Redaction test proving no free-text in logs; `/api/health` response; `429` from rate limiting.
- `SECURITY_AND_SAFETY_SUMMARY.md` seed (secrets handling, rate limiting, redaction); `ARCHITECTURE_DIAGRAM.md` seed.

## 7. Acceptance criteria & allowed statuses

- **PASS** when: CI runs the four code gates on PRs to the active/integration branch; a staging **preview** is reproducible from the runbook by a second developer; logs contain no sensitive free-text (test-proven); health + rate limiting work; the `main` migration PR + PO checklist are prepared — **without** Claude changing default/protection, deploying production, or connecting a production DB.
- **`IMPLEMENTATION COMPLETE — STAGING DEPLOY PENDING`** if all code/config/docs land but the PO has not yet created the Vercel project / run the migration steps.
- S3 must **not** borrow S1/S2 evidence.

## 8. Open decisions for the Product Owner

1. Vercel: confirm you'll create the project and provide preview-scope secrets (Claude can't).
2. Rate-limit policy for staging (e.g., N readings/hour/IP) — a starting number to encode?
3. Timing of the `main` migration GitHub steps: during S3 (recommended, so CI enforces on `main`) or right after?
