# Default-Branch Migration Proposal — establish protected `main`

**Date:** 2026-07-23
**Sprint:** Sprint 0 (docs-only)
**Owner of the decision + the GitHub-side actions:** Product Owner (Claude cannot change repository settings, branch protection, or the default branch).
**Governs Phase 2 decision:** D5 — "Do not make a feature branch the permanent default. Propose a PR-based path to establish `main` as the protected integration branch."
**Related:** ADR-013 (branch succession; `claude/tarot-ai-mvp-setup-h2fyf7` deprecated), Phase 1 gap analysis blocker **B5**.

---

## 1. The problem (verified in Phase 1)

- The remote **default branch (HEAD) is `claude/tarot-ai-mvp-setup-h2fyf7`** — the exact branch ADR-013 declares **deprecated/abandoned** (a pre-ADR, monorepo lineage that contradicts ADR-003). Verified via `git ls-remote --symref origin HEAD`.
- A fresh `git clone` therefore checks out the abandoned lineage, not the real work.
- All real work lives on **`feat/insight-engine-milestone-3`**.
- CI (`.github/workflows/validation-gates.yml`) targets `main`/`dev` — **branches that do not exist** — and only checks docs, never the code gates. So CI effectively never runs on the real work.

Net effect: a new developer lands on the wrong branch, and the safety net (CI) is pointed at nothing.

## 2. Goal

A single, protected **`main`** as the default integration branch, carrying the current real history, with CI code gates enforced on every PR into it — reached **without rewriting history** and without disturbing the frozen reference branches.

## 3. Constraints

- **No history rewrite.** Same discipline as ADR-013 (succession, not `git branch -m`).
- **Do not touch** `feat/major-arcana-asset-migration` (frozen reference) or revive `claude/tarot-ai-mvp-setup-h2fyf7` (deprecated).
- **Production must not be opened during S3** (Phase 2 decision D3) — this migration is about the integration branch and CI/preview only, not a production deploy.
- Claude performs **none** of the GitHub-side steps below; they are Product-Owner actions.

## 4. Proposed path (PR-based, no rewrite)

**Step A — Create `main` from the current real tip (Product Owner or Claude via a normal branch push).**
`main` is created pointing at the current `feat/insight-engine-milestone-3` tip (after the Sprint 0 docs land and any in-flight audit branch is merged). No commits are rewritten; `main` simply starts where the real work is.

**Step B — Repoint the repository default branch → `main` (Product Owner, GitHub settings).**
GitHub → Settings → Branches → default branch → `main`. This is the step that fixes the clone-lands-on-abandoned-branch trap. GitHub cannot be scripted for this from here; it is a Product-Owner UI/API action.

**Step C — Add branch protection on `main` (Product Owner, GitHub settings).**
Recommended ruleset:
- Require a pull request before merging (≥1 approval).
- Require status checks to pass — the new **code-gate CI job** (S3): `lint`, `typecheck`, `test`, `build`.
- Require branches to be up to date before merging.
- Restrict force-pushes and deletion of `main`.

**Step D — Fix CI triggers (Claude, in Sprint 3).**
Update `.github/workflows/validation-gates.yml` (or add a new `code-gates.yml`) to trigger on PRs to `main`, and add the lint/typecheck/test/build job. This is code/config work, so it is done as part of **Sprint 3**, not Sprint 0 — Sprint 0 is docs-only. This proposal only records the intent and target.

**Step E — Retarget ongoing work onto `main`.**
Future feature branches (including the Phase 2 sprint branches) branch from and PR into `main`. The designated audit/planning branch `claude/insight-engine-investor-audit-bkofgr` is merged into `main` (or its docs cherry-picked) as part of establishing `main`.

**Step F — Leave the frozen/deprecated branches alone.**
`feat/major-arcana-asset-migration` and `claude/tarot-ai-mvp-setup-h2fyf7` are neither retargeted nor deleted; ADR-013 already governs them. Optionally, the Product Owner may archive/close the deprecated branch, but that is not required.

## 5. Ownership split

| Step | Action | Owner | Can Claude do it? |
|---|---|---|---|
| A | Create `main` at the real tip | PO or Claude (git push) | Yes (a normal branch push) — but only on PO instruction |
| B | Set default branch → `main` | **Product Owner** | **No** — GitHub repo setting |
| C | Branch protection ruleset | **Product Owner** | **No** — GitHub repo setting |
| D | CI triggers + code-gate job | Claude (Sprint 3) | Yes — file edit, but it's S3 scope, not S0 |
| E | Retarget/merge planning branch | PO + Claude | Partially (PR creation on request) |
| F | Leave frozen/deprecated alone | — | N/A |

## 6. Sequencing vs. Phase 2

- **Sprint 0 (now):** this proposal only. No branch or setting is changed.
- **Sprint 3:** Step D (CI code gates) lands as code, and Steps A–C/E are executed by the Product Owner as the integration branch is stood up alongside Vercel staging/previews. Production stays closed (D3).

## 7. Acceptance criterion (for the migration, checked in S3)

`PASS` when: a fresh `git clone` checks out `main`; `main` is protected and requires the code-gate checks; a PR into `main` runs `lint/typecheck/test/build`; and neither frozen/deprecated branch was rewritten or deleted.

## 8. Rollback

If `main` is set as default prematurely and causes disruption, the default can be repointed back to `feat/insight-engine-milestone-3` in GitHub settings (a reversible UI action) with no history impact. Because no history is rewritten at any step, rollback is always a pointer change, never a recovery.
