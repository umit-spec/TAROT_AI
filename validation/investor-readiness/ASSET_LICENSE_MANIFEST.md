# Asset License Manifest — Pilot (3 cards)

**Date:** 2026-07-23 · **Sprint:** S1 · **Source of truth:** `data/assets/pilot-license-manifest.json` (schema-validated, gate-checked).
**Gate:** `npm run assets:validate` (`--enforce` to hard-fail). Status today: **3/3 pilot production assets NOT eligible** — expected until the Product Owner records real rights documents.

This is an investor-readiness evidence artifact. It intentionally shows the gate
*failing* the pilot, which is the honest state: original art does not exist yet,
and montage-derived assets are permanently barred from production (D3).

| assetId | cardId | purpose | status | commercialUse | creator | evidence | ships? |
|---|---|---|---|---|---|---|---|
| 00-fool-production | 00-fool | production | unverified | unknown | unknown | — | ❌ blocked |
| 09-hermit-production | 09-hermit | production | unverified | unknown | unknown | — | ❌ blocked |
| 17-star-production | 17-star | production | unverified | unknown | unknown | — | ❌ blocked |
| 00-fool-montage-web | 00-fool | prototype-nonproduction | unverified | unknown | unknown | debt log | 🚫 never (montage) |
| 09-hermit-montage-web | 09-hermit | prototype-nonproduction | unverified | unknown | unknown | debt log | 🚫 never (montage) |
| 17-star-montage-web | 17-star | prototype-nonproduction | unverified | unknown | unknown | debt log | 🚫 never (montage) |

## Closing bar (per production entry)

An entry flips to shippable only when one is documented at `evidenceLocation`:
1. **verified-licensed** — signed commercial-use + modification license/commission, creator named.
2. **verified-public-domain** — specific source's PD status + scan rights documented (staging/free-beta only, non-production).
3. **replacement-completed** — original commissioned art delivered with (1).

Montage-derived assets (`prototype-nonproduction`) are never eligible and cannot be re-typed to `production` without failing schema intent — they exist for local/dev preview only.

## Relationship to the 44-asset debt log

`docs/ASSET_LICENSING_DEBT_LOG.md` tracks all 44 shipped montage files at repo level. This manifest is the *forward* gate for the pilot's original production art. Both must be satisfied before any paid/public beta ships visuals.
