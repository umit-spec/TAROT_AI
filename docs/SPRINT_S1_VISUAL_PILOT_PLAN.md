# Sprint S1 — Commercially-Safe Visual System (3-Card Pilot) — PROPOSAL

**Date:** 2026-07-23
**Status:** PROPOSAL (docs-only). No implementation until Product-Owner approval of this proposal.
**Governed by:** `docs/INVESTOR_READY_MVP_EXECUTION_PLAN_v1.0.md` §S1; Phase 2 decision **D3**; `docs/ASSET_LICENSING_DEBT_LOG.md`.
**Binding order (Product Owner):** three-card pilot **only** — **The Fool, The Hermit, The Star** — first deliverable is a **visual-direction proposal**, not code; do **not** produce the remaining 19 cards; do **not** mark any asset production-ready before PO approval + documented rights.

---

## 1. Goal

Lock a single, original, commercially-clean **visual direction** using a 3-card pilot before any deck-wide production. Success at S1 is *direction locked + pilot rights documented*, not 22 cards.

## 2. Why a direction proposal first (not art, not code)

The most expensive mistake here is producing 22 cards in a direction that is later rejected or turns out to be legally tainted. A written, approved direction + a 3-card pilot de-risks both before the deck-wide spend. Claude's role at S1 is **specification and governance tooling**, not producing production artwork — original art is commissioned/licensed by the Product Owner (D3); Claude does not draw the shippable deck.

## 3. First deliverable — the Visual-Direction Proposal (Claude-authored)

A document (`docs/visual/VISUAL_DIRECTION_PROPOSAL_v0.1.md`) covering, for the 3 pilot cards:

1. **Style definition** — the visual language (e.g., line quality, flat vs. rendered, illustration vs. photographic, level of realism), stated concretely enough that an illustrator could execute it.
2. **Color system / palette** — a named palette with hex values, light/dark behavior, per-arcana accent logic, and contrast targets (WCAG AA for any text-on-card).
3. **Card frame system** — border/frame construction, title placement, numbering, aspect ratio (aligned to the existing 512×768 / 2048×3072 asset shapes), safe margins for mobile crop.
4. **Typography** — display face for card titles and numerals, licensing status of the fonts themselves (fonts are assets too), fallback stack.
5. **Symbolism density** — how much iconographic detail each card carries; a deliberate target (readable at mobile thumbnail size, not cluttered), with per-card symbol lists for Fool / Hermit / Star grounded in `data/cards/*.json` meanings.
6. **Mobile behavior** — how a card reads at 375px width, in a 3-card row, and full-screen; legibility and focal-point rules.
7. **Originality constraints** — explicit "stay away from" list (see §5) so the commissioned art cannot accidentally reproduce a copyrighted deck.
8. **Provenance / licensing model** — the contract + evidence structure that makes an asset production-eligible (see §6).

## 4. Second deliverable — the production asset gate (Claude-authored tooling design)

A **design spec** (not yet wired into CI at S1) for the asset gate that S1 will later enforce:
- Per-asset metadata schema: `creator`, `license`, `commercial_use`, `modification_rights`, `attribution_required`, `evidence_location`, `status ∈ {unverified, verified-licensed, verified-public-domain, replacement-completed}`.
- A validator that fails if any *production* asset is `unverified`/missing evidence.
- The `ASSET_LICENSE_MANIFEST.md` structure (the investor-pack artifact) seeded for the 3 pilot cards.

> The gate's CI wiring and the `sharp`/`next/image` CVE mitigation (B10) are implemented alongside S5 UI / S3 CI when artwork actually renders — not at S1. S1 designs the gate and applies it to the pilot manifest.

## 5. Originality constraints (the "stay away from" list)

The commissioned pilot art must not reproduce or derive from:
- **Rider–Waite–Smith (Pamela Colman Smith) imagery** — even though the 1909 line art is public domain in many jurisdictions, most in-market versions are modern recolorings/redraws that are **not** public domain; safest to not evoke specific RWS compositions at all.
- **The Thoth deck (Lady Frieda Harris / Crowley)** — still under copyright.
- **Any recognizable in-market commercial deck** (Marseille modern editions, indie decks, app decks).
- **AI-image outputs that reproduce or closely imitate any existing copyrighted deck** — an original commission is the intended path; any AI assistance in ideation must not yield derivative-of-copyrighted-deck output, and montage-derived assets remain ineligible (D3).
Positive target: an original symbolic language that stands on its own and matches the "insight, not fortune-telling" positioning.

## 6. Provenance / licensing model (the closing bar for the pilot)

Each pilot asset becomes production-eligible only when one of these is documented at `evidence_location`:
- **Commission with full commercial rights** *(preferred, D3)* — a signed agreement assigning or licensing commercial-use + modification rights for a paid product (work-for-hire/assignment language), creator named.
- **Verified public-domain** *(temporary staging/internal/free-beta fallback only, D3)* — provenance of the *specific* source documented (named historical edition + why it's PD in the target jurisdiction) **and** scan/reproduction rights documented; flagged as fallback, not production.
- Montage-derived assets: **never** eligible (D3).

## 7. Ownership split

| Work | Owner | Claude can do? |
|---|---|---|
| Visual-direction proposal doc | **[Claude]** | Yes |
| Asset-gate schema + validator design + manifest structure | **[Claude]** | Yes |
| Approve/lock the visual direction | **[Product Owner]** | No — a decision |
| Commission illustrator / procure license; provide the 3 pilot files + signed rights docs | **[Product Owner]** | No — external + legal |
| Independent verification that each license/PD claim actually grants commercial use | **[Second human ≠ founder]** | No |

## 8. Dependencies · effort · risks

- **Dependencies:** Sprint 0 (done). Independent of S2/S3.
- **Effort:** Claude deliverables **S** (direction proposal + gate design, ~1–2 days). Full pilot **L** by calendar — illustrator turnaround is the **longest schedule risk** in the whole plan; start procurement immediately in parallel.
- **Risks:** direction rejected after art starts (mitigated: lock direction on 3 cards first); font licensing overlooked (called out in §3.4); fallback PD deck weaker provenance than assumed (mitigated: fallback is staging/free-beta only, never paid).

## 9. Evidence artifacts

- `docs/visual/VISUAL_DIRECTION_PROPOSAL_v0.1.md`
- Asset-gate schema + validator design; `validation/investor-readiness/ASSET_LICENSE_MANIFEST.md` (pilot rows)
- Per-pilot license/provenance documents at recorded `evidence_location` (Product-Owner supplied)
- `docs/ASSET_LICENSING_DEBT_LOG.md` pilot rows updated when (and only when) rights are documented

## 10. Acceptance criteria & allowed statuses

- **Direction stage:** `PROPOSAL DELIVERED — AWAITING DIRECTION LOCK` until the PO approves the visual direction.
- **Pilot stage:** `PASS` only when all **3** pilot assets exist, pass the asset gate with **documented commercial rights** (or documented PD-fallback clearly marked non-production), and the direction is locked. Otherwise `IMPLEMENTATION COMPLETE — ASSETS/RIGHTS PENDING` or `PASS WITH DOCUMENTED DEBT` (PD-fallback in use, blocks paid beta).
- **Hard rule:** no asset is marked production-ready before PO approval + documented rights. The remaining 19 cards are out of scope until the pilot direction is locked.

## 11. Open decisions for the Product Owner

1. Illustration path for the pilot: commission a specific illustrator now, or start on a documented PD fallback for staging while commissioning in parallel?
2. Any brand/style priors (existing logo, colors, references you *like*) Claude should incorporate into the direction proposal, or fully open?
3. Aspect ratio confirm: keep the existing 512×768 / 2048×3072 (2:3) shapes, or change before art starts?
