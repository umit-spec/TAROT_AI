# Sprint S1 — Commercially-Safe Visual System (3-Card Pilot) — Build Evidence Report

**Date:** 2026-07-23
**Branch:** `claude/insight-engine-investor-audit-bkofgr`
**Governed by:** `docs/SPRINT_S1_VISUAL_PILOT_PLAN.md`; decision D3.
**Status:** **PROPOSAL DELIVERED — AWAITING DIRECTION LOCK & ASSET PROCUREMENT.** The Claude deliverables (visual-direction proposal + asset gate) are complete; the pilot art itself and its rights are Product-Owner/illustrator actions.

---

## 1. Scope delivered

1. **Visual-direction proposal** — `docs/visual/VISUAL_DIRECTION_PROPOSAL_v0.1.md`, for **Fool / Hermit / Star only**: style, palette (hex + light/dark + WCAG-AA text target), 2:3 frame system, typography (incl. font-license note), symbolism density grounded in `data/cards/*.json`, 375px mobile behavior, the originality "stay-away" list (RWS/Thoth/in-market/AI-imitation), and the provenance/licensing model. Explicitly a spec for PO approval — Claude does not draw the shippable art (D3).
2. **Production asset gate** — `src/types/asset-license.ts` (`AssetLicenseManifestSchema` + `evaluateAssetGate`), `scripts/assets/validate-assets.ts`, `npm run assets:validate` (`--enforce` for the pre-ship CI hard-fail). Enforces D3: a `production` asset that is unverified / `commercialUse ≠ yes` / unknown-creator / no evidence fails. Montage assets are typed `prototype-nonproduction` and structurally cannot be marked `production`.
3. **Pilot license manifest** — `data/assets/pilot-license-manifest.json`: 3 pilot production entries (art pending, `unverified`) + 3 montage entries (barred from production). `validation/investor-readiness/ASSET_LICENSE_MANIFEST.md` mirrors it as evidence.
4. **Tests** — `src/__tests__/unit/asset-license.test.ts` (7 tests): gate fails unverified production, passes fully-documented, never gates montage, rejects bad cardId, and asserts the shipped pilot manifest keeps all 3 production entries unverified with montage never production.

## 2. Acceptance evidence — gates

| Command | Result |
|---|---|
| `npm run lint` | 0 errors |
| `npm run typecheck` | 0 errors |
| `npm run test` | 14 files, **190/190** (183 prior + 7 new) |
| `npm run build` | 0 — same 3 routes (no runtime change; no `<Image>` added, so no `sharp` CVE exposure) |
| `npm run assets:validate` | 3/3 pilot production assets reported **NOT eligible** — the correct, honest state until rights are documented |

## 3. Decision D3 honored

- Original 22-card deck is the plan; only the 3-card pilot is in scope now.
- Montage assets are `prototype-nonproduction` and can never be marked production.
- Public-domain is allowed only as a documented staging/free-beta fallback, never montage.
- RWS/Thoth/in-market/AI-imitation compositions are named in the stay-away list; the book's RWS plates are never used.

## 4. What is NOT done (by design)

- **No card art produced** — commissioning/licensing is a PO + illustrator action (D3); Claude specifies direction, it does not draw the deck.
- **No rights documented** — all 3 pilot production entries remain `unverified`; the gate is meant to fail them until real documents exist.
- **Direction not locked** — needs PO approval of the proposal (§ open decisions in the proposal doc).
- **Remaining 19 cards** — out of scope until the pilot direction is locked.
- **Visual regression tests** — deferred until real art exists (premature now); noted, not silently skipped.

## 5. Status & closure recommendation

**PROPOSAL DELIVERED — AWAITING DIRECTION LOCK & ASSET PROCUREMENT.** Product Owner to: (1) answer the 4 open decisions to lock the visual direction, (2) commission/procure the 3 pilot assets with documented commercial rights, (3) record each at `evidenceLocation` so the gate passes. S1 reaches `PASS` only when all 3 pilot assets are gate-clean (or a documented PD fallback is in place, which is `PASS WITH DOCUMENTED DEBT` — blocks paid beta). No S2/S3 evidence borrowed. Longest calendar item — start procurement in parallel.
