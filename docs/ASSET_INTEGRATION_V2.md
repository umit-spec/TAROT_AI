# FAZ 9 — Governed Card Asset Integration (record)

This document records the FAZ 9 asset-integration decision, the exact
provenance chain, and what is (and is not) cleared as a result. It is
additive to `docs/UI_PREMIUM_V1.md`'s FAZ 9 section, not a replacement.

**FAZ 9 integration does not mean commercial release is cleared.** See
§8 below.

## 1. Scope decision: 22 Major Arcana only

The governed Full Tarot Deck V2 asset set contains 78 card faces + 1 card
back (22 Major Arcana + 56 Minor Arcana). This application's reading
engine (`src/server/reading-engine/cards.ts`) hard-fails unless
`data/cards/*.json` contains **exactly 22 Major Arcana cards** - there is
no `CardId` a Minor Arcana card could ever be shown for, and this is not
a temporary gap: `src/types/card.ts`'s `CardDataSchema` hardcodes
`arcana: z.literal('major')`.

The governed artwork registry (`src/lib/tarot-card-artwork.ts`) is
therefore exhaustive over exactly the 22 real `CardId` values plus one
card-back constant. The 56 Minor Arcana derivatives remain in the asset
branches (`asset/06-full-tarot-deck-v2`, `asset/09-production-derivatives`)
for provenance/future-readiness but are **not** copied to
`public/`, **not** in the registry, and **not** wired to any component.
This is a scope decision, not a defect - reopening it would require a
reading-engine change, which is explicitly out of FAZ 9's boundary.

## 2. Branches and exact SHAs

| Branch | Role | Final SHA |
|---|---|---|
| `claude/premium-ui-foundation-phase1-4d2940` | Frozen premium UI (RC-1) | `3f75408` — never modified by FAZ 9 |
| `asset/06-full-tarot-deck-v2` | Canonical 79-PNG source + governance | `ae45f3a` |
| `asset/09-production-derivatives` | FAZ 9A: derivatives + visual QA + governance closures | `70805a2` |
| `claude/faz9-governed-card-assets` | FAZ 9B: selective integration into the UI | see commits below |

No `git merge` was ever run between these branches. Every file that
crossed from the asset side to the UI side did so via
`git checkout <exact-SHA> -- <specific-paths>` (selective checkout),
listed in the "import governed full-deck production derivatives" commit.

## 3. Canonical → derivative → registry chain

1. **Canonical source**: `assets/tarot-cards-v2/images/Major_Arcana/*.png`
   (on the asset branches only - never copied into this branch), governed
   by `assets/tarot-cards-v2/provenance-manifest.json`
   (`assets/tarot-cards-v2/provenance-manifest.json` IS present here, for
   hash cross-reference, but the PNG bytes themselves are not).
2. **Production derivative**: `tools/assets/export_full_tarot_deck_v2.py`
   → `assets/tarot-cards-v2/derivatives/derivative-manifest.json` +
   `assets/tarot-cards-v2/derivatives/webp/**/*.webp` (79 files, all
   present here for provenance completeness).
3. **Public, browser-served copy**: exactly the 22 Major Arcana + Card
   Back derivatives, byte-identical, copied to
   `public/assets/tarot-cards/v2/*.webp` (23 files - the only files
   actually served).
4. **Registry**: `tools/assets/generate_tarot_artwork_registry.py`
   reconciles (1)-(3) plus `data/cards/*.json` and writes
   `src/lib/tarot-card-artwork.ts` (generated, `// GENERATED — DO NOT
   EDIT`). Re-running the generator with `--check` proves the checked-in
   file is not stale.

Every step's hash is independently re-verified at generation time (not
just trusted from a prior manifest) - see the generator's fail conditions.

## 4. Governance gate closures feeding this integration

Recorded in full in `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`:

- V2-D012 (derivative export provenance): CLOSED
- V2-D013 (final visual QA): CLOSED, zero REGENERATE/BLOCKED findings
- V2-D014 (FAZ 9 product-owner approval): CLOSED
- V2-D002 (generation-session platform evidence): ACCEPTED RESIDUAL RISK
  (explicit product-owner acceptance, not a claim the evidence exists)
- V2-D005 (Canva Licensed Content audit): CLOSED (explicit, dated
  product-owner element-level audit statement, not an assumption)

## 5. UI wiring

- `CardArtworkPlaceholder.tsx`: gained one new optional prop, `cardId?:
  CardId`, read only when `state === 'revealed'`. Locked/current always
  render `CARD_BACK_ARTWORK` regardless of the actual card. Revealed
  renders the matching face from `CARD_ARTWORK[cardId]` plus the existing
  governed `displayName` in a scrim overlay. A revealed card with no
  resolvable `cardId` falls back to the same neutral geometric shell every
  closed card used before FAZ 9 - never another card's artwork.
- `CardReveal.tsx`: minimal wiring only - `resolveArtworkCardId(card.id)`
  passed as `cardId` to the revealed branch's `CardArtworkPlaceholder`
  call; one stale docblock line updated. No reveal-order, gating, focus,
  or copy change.
- `next/image` used with local `public/` paths (`fill` + `object-contain`
  inside the existing `aspect-[2/3]` container); no `next.config.mjs`
  change was needed (no remote image config required for local files).

## 6. Verified guarantees (network + visual QA)

- Arriving at the reveal screen with nothing opened: exactly 1 network
  request for the shared card-back image, 0 face requests.
- Each reveal click adds exactly 1 face request, matching that card only.
- Crisis path and error path: 0 card-image requests (CardReveal is never
  mounted on those paths).
- Restart: 0 asset requests fire afterward - no leftover preload.
- No `.png` request, no external-domain request, no 404 from any
  card-asset path, in any of the above.
- Full human visual QA of all 79 production derivatives (not just the 22
  wired here) already passed in FAZ 9A with zero regenerations.

## 7. Performance

From `assets/tarot-cards-v2/derivatives/derivative-manifest.json`,
restricted to the 22 registered faces + card back:

| Metric | Value | Target | Result |
|---|---:|---:|---|
| Min face size | 96.0 KB | - | - |
| Median face size | 114.4 KB | - | - |
| p95 face size | 129.3 KB | < 400 KB | PASS |
| Max face size | 130.0 KB | < 300 KB | PASS |
| Card back size | 108.0 KB | < 250 KB | PASS |
| Typical 3-card session (median×3 + back) | ~451 KB | ≤ ~1 MB | PASS |
| Total registered bytes (22 + back) | ~2.6 MB | - | not served at once - lazy per reveal |

No quality was reduced to hit these numbers; all targets were already
comfortably met by the V2-D012 export settings (WebP quality 88).

## 8. What FAZ 9 does NOT clear

- **Commercial release** remains separately gated: V2-D003 (third-party
  visual-similarity review), V2-D004 (platform-terms evidence, currently
  PARTIAL), V2-D009 (jurisdiction-specific legal review), V2-D010
  (trademark clearance) are all still OPEN.
- V2-D002 is an accepted residual risk, not eliminated evidence.
- The 56 unregistered Minor Arcana derivatives have not been visually
  re-reviewed against a UI context (they were reviewed in FAZ 9A's
  contact-sheet pass, but never wired to any component - if a future
  reading-engine change ever adds Minor Arcana `CardId`s, the registry
  generator and its test suite would need extending, not silently
  assuming these files are ready to wire as-is).

## 9. Rollback

Integration is structured for a clean, incremental rollback:

- Revert the UI-wiring commit → `CardArtworkPlaceholder`/`CardReveal`
  return to the FAZ 5 CSS-only placeholder; `src/lib/tarot-card-artwork.ts`
  becomes unused but harmless (no import left referencing it).
- Revert the binary-import commit separately → removes
  `assets/tarot-cards-v2/derivatives/`, `public/assets/tarot-cards/v2/`,
  and the governance docs from this branch; does not touch the asset
  branches, which remain the source of truth.
- No state/data migration, no database migration, no API contract change
  was made anywhere in FAZ 9 - rollback is a pure code/asset revert.
