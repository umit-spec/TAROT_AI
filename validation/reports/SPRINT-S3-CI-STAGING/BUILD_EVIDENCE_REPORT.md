# Sprint S3 — CI Gates, Vercel Staging & Observability — Build Evidence Report

**Date:** 2026-07-23
**Branch:** `claude/insight-engine-investor-audit-bkofgr`
**Governed by:** `docs/SPRINT_S3_CI_STAGING_PLAN.md`; decisions D3, D4, D5.
**Status:** **IMPLEMENTATION COMPLETE — STAGING DEPLOY PENDING.** All code/config/docs landed; the Vercel project creation and the `main` default-branch/protection change are Product-Owner GitHub actions (Claude cannot and did not perform them).

---

## 1. Scope delivered

1. **CI code gates** — `.github/workflows/code-gates.yml`: `npm ci` → lint → typecheck → test → build (+ asset gate report) on PRs to `main` / the active line, Node 20. This is the check the protected `main` will require.
2. **Vercel preview config** — `vercel.json`: Next.js preset, `git.deploymentEnabled.main: false` so a `main` push does **not** deploy production. Preview deploys on PRs only. Production not opened (D3).
3. **Request IDs** — `src/middleware.ts` (first middleware in the app): sets/propagates `x-request-id` on every `/api` request and echoes it on the response.
4. **Redacted structured logging** — `src/server/observability/log.ts`: single-line JSON per reading request; the builder's input type has **no field that can hold question / reflection / crisis text** (D4/D5). Test asserts a sensitive question never appears; crisis path logs only that a short-circuit occurred.
5. **Rate limiting** — `src/server/observability/rate-limit.ts` + wired into `/api/readings`: fixed-window per-IP, `429` + `retry-after`. OFF in dev/test, ON in production or with `RATE_LIMIT_ENABLED=1`; threshold `RATE_LIMIT_PER_MINUTE` (default 30). In-memory / per-instance is a **documented** limitation — durable store deferred to S4.
6. **Health endpoint** — `src/app/api/health/route.ts`: `GET` → `{status, version, commit, timestamp}`, no secrets, no DB.
7. **Deploy/rollback runbook + staging-secrets doc + Vercel setup + `main`-migration checklist** — `docs/deploy/{RUNBOOK,STAGING_SECRETS,VERCEL_STAGING,MAIN_MIGRATION_CHECKLIST}.md`. Secrets documented, never contained.
8. **Tests** — `src/__tests__/unit/observability-s3.test.ts` (9 tests): log redaction (+ crisis), rate limiter allow/block/reset/flag/threshold/key, request-id reuse/generate, health endpoint.

## 2. Acceptance evidence — gates

| Command | Result |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run typecheck` | 0 errors |
| `npm run test` | 15 files, **199/199** (190 prior + 9 new), zero regressions |
| `npm run build` | 0 — routes now `/`, `/_not-found`, `ƒ /api/health`, `ƒ /api/readings`, plus **Middleware** |

The existing `/api/readings` tests and zero-tolerance invariants still pass unchanged — rate limiting is OFF in test, request-id/logging are additive.

## 3. Binding non-goals honored (D3/D5)

- **No default-branch or branch-protection change** — the `main` migration is a PO GitHub checklist (`MAIN_MIGRATION_CHECKLIST.md`); Claude prepared the CI job and proposal only.
- **No production deploy** — `vercel.json` disables `main` production deploys; preview-only.
- **No production database** — S3 wires none; `DATABASE_URL` is documented as an S4 slot.
- Claude does not act as if protection is enabled.

## 4. Safety / privacy (D4/D5)

- Structured logs carry derived signals only (requestId, outcome, latency, persona, domain, provider, fallback reason, token counts) — **never** free-text; enforced by the input type and a redaction test.
- Rate-limit and request-id paths never inspect the request body's free-text.
- `sharp`/`next` image CVE not triggered — S3 adds no `<Image>` usage (relevant only at S5 artwork render).

## 5. Status & closure recommendation

**IMPLEMENTATION COMPLETE — STAGING DEPLOY PENDING.** Product Owner to: create the Vercel project + set preview secrets (`VERCEL_STAGING.md` / `STAGING_SECRETS.md`), then run the `main`-migration GitHub steps (`MAIN_MIGRATION_CHECKLIST.md`) so CI enforces on a protected `main`. S3 reaches `PASS` when a second developer reproduces a staging preview from the runbook and CI runs the code gates on PRs to the active/integration branch. No S1/S2 evidence borrowed. **S4 not started** (blocked on S2 completion + G1).
