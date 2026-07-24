# `main` Migration Checklist — Product-Owner Actions

**Sprint:** S3 (prepared, not executed). **Claude does NOT change the default branch or branch protection** (D5). This is the PO checklist that pairs with `docs/DEFAULT_BRANCH_MIGRATION_PROPOSAL.md` (S0) and the new `.github/workflows/code-gates.yml`.

## What Claude prepared (S3)
- `code-gates.yml`: lint/typecheck/test/build on PRs to `main` (and the active line) — the check the protected `main` will require.
- The proposal (no-history-rewrite, succession pattern) — S0.

## Product-Owner steps (GitHub-side — Claude cannot perform these)
1. Create `main` from the current real tip (a normal branch push; no history rewrite).
2. GitHub → Settings → Branches → **set default branch to `main`** (fixes the clone-lands-on-deprecated-branch trap; remote HEAD is currently the ADR-013-deprecated lineage).
3. Add branch protection on `main`:
   - Require a PR before merging (≥1 approval).
   - **Require status checks:** the `code-gates` job (lint/typecheck/test/build).
   - Require up-to-date branches; restrict force-push and deletion.
4. Leave `feat/major-arcana-asset-migration` (frozen) and `claude/tarot-ai-mvp-setup-h2fyf7` (deprecated) untouched (ADR-013).

## Acceptance (checked after PO runs the above)
- A fresh `git clone` checks out `main`.
- A PR into `main` runs the code gates and they are required to merge.
- Neither frozen/deprecated branch was rewritten or deleted.

## Rollback
- Default branch is a reversible GitHub setting; repoint back if needed. No history is rewritten at any step.
