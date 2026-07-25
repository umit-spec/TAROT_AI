# Deployment & Rollback Runbook (Staging) — Sprint S3

**Boundary:** staging/preview only. **No production deploy, no production database** in S3 (D3).
Reproducible by a second developer from these steps.

## Prerequisites
- Repo access; Node 20; `npm ci` works locally (green code gates — see `.github/workflows/code-gates.yml`).
- A Vercel project linked to the repo, Next.js preset (`docs/deploy/VERCEL_STAGING.md`).
- Preview-scope env vars set (`docs/deploy/STAGING_SECRETS.md`).

## Deploy a staging (preview) build
1. Open a PR against the integration branch.
2. Vercel builds it (`npm ci` → `npm run build`) and posts a **preview URL**.
3. Verify the deploy:
   - `GET <preview-url>/api/health` → `{ "status": "ok", "version": ..., "commit": ... }`.
   - Load `/` → complete a reading (Mock fallback if no `ANTHROPIC_API_KEY`).
4. Every response carries an `x-request-id` header for log correlation.

## Observability
- **Logs:** structured single-line JSON per reading request (`event: reading_request`), with `requestId`, `outcome`, latency, persona/domain, provider, fallback reason, token counts — **never** question/reflection/crisis text (D4/D5). Read them in Vercel → Deployment → Logs, or your log drain.
- **Rate limiting:** set `RATE_LIMIT_ENABLED=1` in staging; a limited client gets `429` + `retry-after`.
- **Health:** `/api/health` for uptime monitors.

## Rollback (staging)
- Vercel keeps every previous deployment. To roll back: Vercel → Deployments → pick the last-good preview → **Promote/Redeploy** within staging.
- Because no production alias exists in S3, rollback is always a pointer to a previous **preview** — no production impact.
- Nothing here is destructive; no database migrations are involved (none exist yet).

## Error monitoring (S3 scope)
- Structured logs + request IDs are the S3 baseline. A dedicated error-monitoring SDK (e.g. Sentry) is a small follow-up; the log shape already carries what's needed to correlate. Documented debt, not silently skipped.

## Known S3 limitations (documented, not hidden)
- **Rate limiter is in-memory / per-instance.** A durable shared store (Postgres/Upstash) is deferred to **S4** when persistence lands.
- **No production environment** and **no database** by design (D3).
- **`sharp`/`next` image CVE** is not triggered: S3 adds no `<Image>` usage; it becomes relevant only when card artwork renders (S5).
