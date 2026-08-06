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
| 2026-08-06 | Claude Code (H5) | Re-run. 5 high findings — see SECURITY-DEBT-002. `sharp` blocking condition NOT yet triggered (no `next/image` usage in `src/`, verified by grep). No dependency change made: `DEPENDENCY_UPGRADE_AUTHORIZED=false`. |

---

## SECURITY-DEBT-002: `npm audit` re-run at H5

**Opened:** 2026-08-06
**Status:** Recorded, unresolved — no dependency change was authorized
**Review date:** Next sprint start, and before any public-facing release

### Findings (`npm audit`, 2026-08-06)

| Package | Severity | Range | Runtime-reachable? |
|---|---|---|---|
| `next` | High | `9.3.4-canary.0 - 16.3.0-preview.10` | Umbrella advisory |
| `postcss` | High | `<=8.5.22` | **No** — build-time CSS only |
| `sharp` | High | `<0.35.0` | **Not today** — no `next/image` usage in `src/` |
| `undici` | High | `7.0.0 - 7.28.0` | **YES — see below** |
| `brace-expansion` | High | `<=1.1.17 \|\| 4.0.0 - 5.0.8` | No — tooling dependency |

### `undici` is the one that changed the picture

`undici` is the HTTP client behind Node's `fetch`. This application calls the
Anthropic API through `fetch` (`src/server/reading-engine/providers/claude/http.ts`),
so unlike `postcss` and `sharp` this is **on a live request path in production**,
not build-only or dormant.

That does not make it exploitable by itself — reachability is not
exploitability, and the specific advisory has not been analysed against how
this code calls `fetch` (fixed URL, no user-controlled host, no redirect
following configured). But it is a materially different category from the
previously accepted findings and should not be filed alongside them without
that distinction being stated.

### What was NOT done, and why

`DEPENDENCY_UPGRADE_AUTHORIZED=false` for the H-phase work, so no upgrade,
no `npm audit fix`, and no lockfile change was made. `fixAvailable: true` is
reported for all five, but the previously recorded remediation for the
`next` chain was a downgrade to `next@9.3.3`, which ADR-003 rejects.

### Required human decision

1. Re-run `npm audit` and check whether a forward fix (not a downgrade) now
   exists for `next` and `undici`.
2. Analyse the `undici` advisory against this repository's actual `fetch`
   usage before any public-facing release.
3. Decide whether `brace-expansion` and `postcss` remain accepted risks.

### Review log

| Date | Reviewer | Result |
|---|---|---|
| 2026-08-06 | Claude Code (H5) | Opened. Recorded, not remediated — dependency changes not authorized. `undici` flagged as runtime-reachable, distinct from the build-only findings in SECURITY-DEBT-001. |
