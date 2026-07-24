# 09 — Recent Changelog

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `git log` on `claude/insight-engine-investor-audit-bkofgr`.

---

## Most recent meaningful commits (newest first)

| SHA | Summary | What changed | Why |
|---|---|---|---|
| `5e0a5bb` | Register 2nd Bill Store book lineage-only | `SourceGovernance`/`SourceRelationship` schemas (restriction booleans `literal(false)`), `sources.json` entry `modern-klasik-tarot-rehberi-2025` + reciprocal related-edition link, validator lineage/integrity checks, backlog note | Second copyrighted book governed like the first; duplicate lineage (same reg. No. 2025/14830) recorded so it never counts as an independent source |
| `82d5238` | S3 evidence report | `validation/reports/SPRINT-S3-CI-STAGING/` | Close S3 with honest status (staging deploy pending) |
| `72d0b16` | S3 implementation | `code-gates.yml`, `vercel.json`, `middleware.ts`, `observability/*`, `/api/health`, `docs/deploy/*` | CI gates, preview config, request IDs, redacted logging, rate limiting, health — operational backbone |
| `8ef68c4` | S1 evidence report | `validation/reports/SPRINT-S1-VISUAL-PILOT/` | Close S1 (proposal delivered, awaiting lock) |
| `3a1108c` | S1 implementation | `docs/visual/`, `src/types/asset-license.ts`, `scripts/assets/`, `data/assets/`, manifest | Visual-direction proposal + production asset gate (D3) |
| `811f262` | S2 evidence report | `validation/reports/SPRINT-S2-LIVE-EVAL/` | Close S2 (implementation complete, live run pending) |
| `5376fc6` | S2 implementation | `scripts/evaluation/{preflight,scrub-artifacts,compare,cost,cleanup-raw}.ts`, `lib/{pricing,scrub,raw}.ts`, `live-anthropic --retain-raw`, model in manifest | Safe local-run tooling for the real Anthropic evaluation |
| `3283eb2` | Quarantine pre-G1 methodology extraction | Reverted draft lessons + lesson tooling from the active line; kept lineage-only source + rights schema + backlog; added scope-correction report | Corrective action — earlier lesson drafting exceeded approved pre-G1 scope |
| `0ff7d91` | Sprint 0 governance | ADR-014 accepted, Prisma superseded, exit criteria labeled, branch proposal | Convert cadence draft to accepted ADR; resolve doc conflicts |
| `2448a1c` / `95c7209` | Phase-2 plan / Phase-1 gap analysis | `docs/INVESTOR_READY_MVP_*` | Investor-ready audit + execution plan |

## What changed, overall (this session's arc)

1. **Phase-1 audit** classified the project a Functional product prototype and ranked blockers.
2. **Phase-2 plan** approved (GO WITH REVISIONS); S0 governance landed (ADR-014, Prisma→Drizzle, exit-criteria labeling).
3. **Book knowledge** pivoted from RAG to **Human-Governed Methodology Extraction**; pre-G1 over-implementation was quarantined; both Bill Store books registered lineage-only as one family.
4. **S1/S2/S3** implemented in parallel to their honest ceilings; each with separate evidence and closure.

## Current clean-gate results (`5e0a5bb`)

| Gate | Result |
|---|---|
| `npm run lint` | 0 errors |
| `npm run typecheck` | 0 errors |
| `npm run test` | 15 files, **201 passed** |
| `npm run build` | 0 — routes `/`, `/_not-found`, `/api/health`, `/api/readings`, + Middleware |
| `npm run knowledge:validate` | OK — 6 sources, citations + related-source refs resolve, lineage warnings printed |
| `npm run assets:validate` | reports 3/3 pilot production assets NOT eligible (expected until rights documented) |

## Working tree

Clean at generation time (all work committed and pushed to `claude/insight-engine-investor-audit-bkofgr`).
