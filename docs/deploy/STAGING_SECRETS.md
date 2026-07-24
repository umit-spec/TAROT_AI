# Staging Secrets — Documentation (values live in Vercel, never in git)

**Sprint:** S3. This file **documents** which secrets staging needs and where they
live. It contains **no secret values** — those are set in the Vercel project's
**Preview** environment scope and are never committed (D4).

| Env var | Purpose | Scope | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Live narration provider (optional in staging) | Preview | Without it, the app uses the observable Mock fallback — staging still works. Never logged (existing key-never-in-error test). |
| `ANTHROPIC_MODEL` | Override evaluated model | Preview | Defaults to `claude-sonnet-5`. |
| `RATE_LIMIT_ENABLED` | Turn on abuse-prevention rate limiting | Preview | Set `1` in staging; OFF by default in dev/test. |
| `RATE_LIMIT_PER_MINUTE` | Rate-limit threshold per IP/min | Preview | Starting value `30` (Product-Owner tunable). |
| `DATABASE_URL` | (Future) Neon preview Postgres | Preview | **S4**, not S3 — no database is wired in S3. Listed so the slot is known. |

## Rules

- Secrets are set in Vercel → Project → Settings → Environment Variables, **Preview** scope.
- Never place a secret in the repo, in logs, in evidence artifacts, or in a screenshot.
- The app reads all of these from the environment; none is hard-coded.
