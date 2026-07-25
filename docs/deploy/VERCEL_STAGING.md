# Vercel Staging (Preview-Only) — Setup

**Sprint:** S3. **Scope:** preview/staging only. **Production is NOT opened during S3 (D3).**

`vercel.json` sets `framework: nextjs`, `npm ci` install, `npm run build`, and
`git.deploymentEnabled.main: false` — so a push to `main` does **not** auto-deploy
to production. PR preview deployments remain enabled. This is the encoding of
"preview-only, production not opened."

## Product-Owner steps (Claude cannot do these — they need the Vercel account)

1. Create a Vercel project linked to this repo (import `umit-spec/TAROT_AI`).
2. Confirm the framework preset is **Next.js** (vercel.json already pins it).
3. Set **preview-scope** environment variables (see `STAGING_SECRETS.md`) — never commit them.
4. Do **not** assign a production domain or enable production deploys yet.
5. Open a PR → Vercel posts a **preview URL**. That URL is the staging deploy.

## What Claude provided

- `vercel.json` (preview-only config).
- The app itself builds cleanly (`npm run build`, 4 routes incl. `/api/health`).
- `/api/health` for the platform up-check.
- No production deploy, no production database (S3 wires none).
