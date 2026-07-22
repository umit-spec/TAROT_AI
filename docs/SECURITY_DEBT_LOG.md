# Security Debt Log

Tracks accepted, unresolved `npm audit` findings — separate from `DECISION_LOG.md`
(architecture decisions) because these are not decisions, they're risks with a
review date. An entry closes when the upstream fix lands and is applied, not
when someone stops looking at it.

---

## SECURITY-DEBT-001: Next.js 16 transitive dependency vulnerabilities

**Opened:** 2026-07-22
**Status:** Accepted risk (dev-only) + one runtime item to watch
**Review date:** Next `npm audit` run at the start of every sprint; re-evaluate immediately if `next` gets a patch release

### Context

Sprint 1 installed the ADR-003-locked stack (Next.js 16, single app). A first
`npm audit` reported 8 vulnerabilities. Five were in the Vitest toolchain
(`esbuild`, `vite`, `vite-node`, `@vitest/mocker`, `vitest` itself — 1 critical)
and were fixed same-day by upgrading `vitest` to `^4.1.10` (dev-only tool,
no product architecture impact, verified: full suite + build still green
after the bump). The three below remain, all inside `next@16.2.11`'s own
dependency tree.

### Current findings (as of this entry)

| Package | Severity | Range | Via `next`'s bundled | Fix available |
|---|---|---|---|---|
| `sharp` | High | `<0.35.0` (installed: `0.34.5`) | Next's built-in image optimization (`next/image`) | Would require downgrading `next` to `9.3.3` |
| `postcss` | Moderate | `<8.5.10` (Next's internal copy: `8.4.31`) | Next's internal CSS build pipeline | Same — `next` downgrade only |
| `next` | High | `9.3.4-canary.0 - 16.3.0-preview.7` | — | `next@9.3.3` |

`npm audit fix --force`'s only offered remediation for all three is downgrading
`next` to `9.3.3`. **Rejected** — this directly violates ADR-003 (Next.js 16,
Accepted), which exists precisely to avoid taking on a known-stale major
version's migration debt. Downgrading to fix an advisory would trade a
documented, scoped risk for an undocumented, larger one (an EOL Next.js major).

### Runtime vs. dev-only classification

- **`postcss` (moderate):** Build-time only — Next's internal CSS
  compilation step. Not reachable from a request at runtime. **Dev/build-only.**
- **`next` (high, the umbrella advisory):** Same two sub-dependencies below;
  no additional exposure of its own.
- **`sharp` (high) — the one to actually watch:** This is *not* purely
  dev-only. `sharp` is Next's runtime image-processing library, invoked
  whenever `next/image` performs server-side optimization (local or remote
  images) in production. **Currently not exploitable in this repo** — Sprint 1
  ships no `<Image>` usage (`src/app/page.tsx` is a text placeholder). It
  **will** become live runtime exposure the moment card artwork
  (`assets/tarot-cards/*.webp`) is rendered through `next/image`, which is
  in-scope for Sprint 3 (Card Selection/Shuffle UI per
  `MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.1.md`).

### Mitigation status

- Vitest chain: **Resolved** (upgraded to v4.1.10, Sprint 1).
- `postcss`/`next` (build-only): **Accepted risk**, re-review each sprint start.
- `sharp`: **Accepted risk today, blocking condition attached** — before
  Sprint 3 wires up `next/image` for card artwork, re-run `npm audit` and
  either (a) confirm an upstream `sharp`/`next` patch has landed, or (b) set
  `unoptimized: true` on the relevant `<Image>` usage / serve pre-optimized
  WebP directly (which Milestone 1 already produces) to avoid invoking the
  vulnerable code path at all.

### Review log

| Date | Reviewer | Result |
|---|---|---|
| 2026-07-22 | Validation Lead | Opened. Vitest chain fixed same-day. Next.js chain accepted, sharp flagged for Sprint 3 gate. |
