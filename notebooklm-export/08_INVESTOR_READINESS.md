# 08 — Investor Readiness

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** `docs/INVESTOR_READY_MVP_GAP_ANALYSIS_v1.0.md`, `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md`, `validation/reports/`, `validation/investor-readiness/`.

---

## Current product classification

**Functional product prototype** (Phase-1 audit verdict). Past a technical prototype (a real, gate-green end-to-end product spine), short of a closed-beta-ready MVP. Not yet an investable early-stage company. Recommendation on file: **GO WITH REVISIONS.**

## Evidence completed (verified in-repo)

- **Engineering discipline:** clean install; `lint` 0, `typecheck` 0, `test` **201/201**, `build` 0; knowledge + evaluation harness commands run.
- **Architecture boundaries enforced in code:** intake server-side; crisis gate before any draw/provider call; provider narration-only with card-order verification + fallback; five zero-tolerance invariants proven against the real handler.
- **Honest governance:** the live-Anthropic gate self-reports `NOT EXECUTED` rather than faking results; AI-authored content is disclosed as such; lock authority is human-only and schema-enforced.
- **S1/S2/S3 tooling delivered** with separate evidence reports; asset gate; secret-safe evaluation tooling; CI code gates + observability.
- **Investor-pack artifacts started:** `validation/investor-readiness/ASSET_LICENSE_MANIFEST.md`.

## Missing evidence (blocks investor-readiness)

- **Real model quality/cost/latency baseline** — no live Anthropic run yet (S2 pending; G1 not reached).
- **Legally clean visuals** — 0/44 montage assets licensed; original pilot art not produced; rights undocumented.
- **Persistence + deletion** — none (S4 not started); no return-to-reading or data-deletion capability.
- **Analytics/funnel** — none (S6).
- **Any real user evidence** — no activation/retention/usefulness/willingness-to-pay data.
- **Independent human review** — of the 24 eval cases and knowledge records (all currently AI-authored/self-reviewed).
- **Privacy policy + retention implementation** — not built.
- **Deployed staging** — S3 code ready; Vercel project + `main` migration are Product-Owner actions.

## Risks

**Technical**
- No real-provider proof that Claude beats the deterministic Mock enough to justify cost (the core G1 question).
- In-memory rate limiter (per-instance) until S4; `sharp`/`next` image CVE latent until artwork renders (S5).
- Default branch on GitHub is the ADR-013-deprecated lineage until the PO runs the `main` migration; CI code gates enforce only once `main` is protected.

**Legal**
- Montage card assets have unverified provenance/commercial rights (`docs/ASSET_LICENSING_DEBT_LOG.md`) — must close before paid/public beta.
- Two copyrighted Bill Store reference books: governed lineage-only (no ingestion); an IP lawyer should review the concrete methodology-extraction flow before commercial launch.

**Product/commercial**
- Cadence model (ADR-014) is an untested hypothesis; threshold-usage is deliberately low-frequency, tightening the monetization math.
- No target-segment validation, no measured cost-per-reading, no pricing tested.

## Kill / narrow criteria (from the gap analysis)

Reposition/stop if: users don't understand the value unassisted; live Claude adds no measurable edge over the deterministic fallback; users seek certainty over reflection; retention is negligible; unit economics can't close; licensing is uneconomical.

## Shortest credible path (Phase-2 order)

Legally clean visuals (S1) · real Claude eval + cost (S2 → **G1**) · deploy + CI + observability + branch fix (S3) · Drizzle persistence w/ guest-save + deletion (S4, after G1) · analytics (S6) · 10–20 user closed beta (S7) · one measured pricing test (S8) · investor evidence pack (S9). Evidence, not features, is the acceptance currency.
