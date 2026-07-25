# Asset Licensing Debt Log

**Opened:** 2026-07-23
**Owner:** Product Owner (Ümit)
**Status:** OPEN — 44/44 entries `unverified`, `risk_level: high`
**Governs:** Standalone commercial-use risk, independent of any sprint's
sequencing. Per the Product Owner's explicit instruction (2026-07-23):
*"Bu Sprint 6'dan bağımsız bir ticari risk. Ürün kamuya açılmadan veya
ücretli beta başlamadan önce kapanmalı."* (This is a commercial risk
independent of Sprint 6. It must be closed before the product goes
public or paid beta begins.)

Mirrors the existing `docs/SECURITY_DEBT_LOG.md` / `docs/UX_DEBT_LOG.md`
pattern: a tracked, visible debt item with a real closing bar, not a
silent assumption.

---

## What this tracks and why it's 44 rows, not 22

`assets/tarot-cards/CARD_REGISTRY.json` lists 22 Major Arcana cards, but
each card ships **two** image files - a web resolution (512×768) and an
HQ resolution (2048×3072). Both are real, separately-shipped assets, so
both get their own row - rounding this down to "22 images" would
undercount what's actually in the repo by half.

## What's already known (not "unknown source" - "unconfirmed license")

`assets/tarot-cards/README.md` and every per-card
`{card-id}-metadata.json` already record:
- **Source:** a single user-provided montage file, `1000214766.png`,
  extracted 2026-07-22 via `tools/assets/extract_major_arcana.py`.
- **License status, verbatim from README.md:** *"To be confirmed with
  product owner"* - i.e. this was already flagged as open before this
  debt log existed; this log makes it a tracked item with a closing bar
  instead of a line inside a README that's easy to lose track of.
- **Provenance status (per-card metadata):** `"approved-for-prototype"` -
  explicitly *not* `"approved-for-production"`.

What is genuinely unknown: who created the original artwork in the
montage, under what license (if any) it was made available, and whether
the Product Owner's right to use the montage extends to commercial
redistribution inside a paid product. `creator`, `license`, and
`commercial_use` below are `unknown` because no document in this repo
answers them - not because the question wasn't asked.

---

## Entries

| asset_id | file_path | source | creator | license | commercial_use | modification_rights | attribution_required | evidence_location | status | risk_level | replacement_required |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 00-fool-web | `assets/tarot-cards/00-fool.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `00-fool-metadata.json` | unverified | high | possible |
| 00-fool-hq | `assets/tarot-cards/00-fool-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `00-fool-metadata.json` | unverified | high | possible |
| 01-magician-web | `assets/tarot-cards/01-magician.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `01-magician-metadata.json` | unverified | high | possible |
| 01-magician-hq | `assets/tarot-cards/01-magician-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `01-magician-metadata.json` | unverified | high | possible |
| 02-high-priestess-web | `assets/tarot-cards/02-high-priestess.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `02-high-priestess-metadata.json` | unverified | high | possible |
| 02-high-priestess-hq | `assets/tarot-cards/02-high-priestess-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `02-high-priestess-metadata.json` | unverified | high | possible |
| 03-empress-web | `assets/tarot-cards/03-empress.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `03-empress-metadata.json` | unverified | high | possible |
| 03-empress-hq | `assets/tarot-cards/03-empress-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `03-empress-metadata.json` | unverified | high | possible |
| 04-emperor-web | `assets/tarot-cards/04-emperor.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `04-emperor-metadata.json` | unverified | high | possible |
| 04-emperor-hq | `assets/tarot-cards/04-emperor-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `04-emperor-metadata.json` | unverified | high | possible |
| 05-hierophant-web | `assets/tarot-cards/05-hierophant.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `05-hierophant-metadata.json` | unverified | high | possible |
| 05-hierophant-hq | `assets/tarot-cards/05-hierophant-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `05-hierophant-metadata.json` | unverified | high | possible |
| 06-lovers-web | `assets/tarot-cards/06-lovers.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `06-lovers-metadata.json` | unverified | high | possible |
| 06-lovers-hq | `assets/tarot-cards/06-lovers-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `06-lovers-metadata.json` | unverified | high | possible |
| 07-chariot-web | `assets/tarot-cards/07-chariot.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `07-chariot-metadata.json` | unverified | high | possible |
| 07-chariot-hq | `assets/tarot-cards/07-chariot-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `07-chariot-metadata.json` | unverified | high | possible |
| 08-strength-web | `assets/tarot-cards/08-strength.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `08-strength-metadata.json` | unverified | high | possible |
| 08-strength-hq | `assets/tarot-cards/08-strength-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `08-strength-metadata.json` | unverified | high | possible |
| 09-hermit-web | `assets/tarot-cards/09-hermit.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `09-hermit-metadata.json` | unverified | high | possible |
| 09-hermit-hq | `assets/tarot-cards/09-hermit-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `09-hermit-metadata.json` | unverified | high | possible |
| 10-wheel-of-fortune-web | `assets/tarot-cards/10-wheel-of-fortune.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `10-wheel-of-fortune-metadata.json` | unverified | high | possible |
| 10-wheel-of-fortune-hq | `assets/tarot-cards/10-wheel-of-fortune-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `10-wheel-of-fortune-metadata.json` | unverified | high | possible |
| 11-justice-web | `assets/tarot-cards/11-justice.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `11-justice-metadata.json` | unverified | high | possible |
| 11-justice-hq | `assets/tarot-cards/11-justice-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `11-justice-metadata.json` | unverified | high | possible |
| 12-hanged-man-web | `assets/tarot-cards/12-hanged-man.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `12-hanged-man-metadata.json` | unverified | high | possible |
| 12-hanged-man-hq | `assets/tarot-cards/12-hanged-man-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `12-hanged-man-metadata.json` | unverified | high | possible |
| 13-death-web | `assets/tarot-cards/13-death.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `13-death-metadata.json` | unverified | high | possible |
| 13-death-hq | `assets/tarot-cards/13-death-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `13-death-metadata.json` | unverified | high | possible |
| 14-temperance-web | `assets/tarot-cards/14-temperance.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `14-temperance-metadata.json` | unverified | high | possible |
| 14-temperance-hq | `assets/tarot-cards/14-temperance-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `14-temperance-metadata.json` | unverified | high | possible |
| 15-devil-web | `assets/tarot-cards/15-devil.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `15-devil-metadata.json` | unverified | high | possible |
| 15-devil-hq | `assets/tarot-cards/15-devil-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `15-devil-metadata.json` | unverified | high | possible |
| 16-tower-web | `assets/tarot-cards/16-tower.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `16-tower-metadata.json` | unverified | high | possible |
| 16-tower-hq | `assets/tarot-cards/16-tower-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `16-tower-metadata.json` | unverified | high | possible |
| 17-star-web | `assets/tarot-cards/17-star.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `17-star-metadata.json` | unverified | high | possible |
| 17-star-hq | `assets/tarot-cards/17-star-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `17-star-metadata.json` | unverified | high | possible |
| 18-moon-web | `assets/tarot-cards/18-moon.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `18-moon-metadata.json` | unverified | high | possible |
| 18-moon-hq | `assets/tarot-cards/18-moon-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `18-moon-metadata.json` | unverified | high | possible |
| 19-sun-web | `assets/tarot-cards/19-sun.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `19-sun-metadata.json` | unverified | high | possible |
| 19-sun-hq | `assets/tarot-cards/19-sun-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `19-sun-metadata.json` | unverified | high | possible |
| 20-judgement-web | `assets/tarot-cards/20-judgement.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `20-judgement-metadata.json` | unverified | high | possible |
| 20-judgement-hq | `assets/tarot-cards/20-judgement-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `20-judgement-metadata.json` | unverified | high | possible |
| 21-world-web | `assets/tarot-cards/21-world.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `21-world-metadata.json` | unverified | high | possible |
| 21-world-hq | `assets/tarot-cards/21-world-hq.webp` | 1000214766.png (user-provided montage) | unknown | unconfirmed | unknown | unknown | unknown | `assets/tarot-cards/README.md`, `21-world-metadata.json` | unverified | high | possible |

**Total tracked assets:** 44

---

## Closing bar

This debt log closes (all 44 entries move off `unverified`/`high`) only
when, for each entry, one of the following is true and recorded in
`evidence_location`:

1. **`verified-licensed`** - a real license (purchase receipt, license
   agreement, stock-asset terms) is on file, covering commercial use in
   a paid product, with `evidence_location` pointing at the actual
   document.
2. **`verified-public-domain`** - the original artwork is confirmed
   public domain (e.g. a specific, named historical deck old enough to
   be out of copyright), with the evidence for *that specific claim*
   recorded, not asserted from general tarot-deck-age assumptions.
3. **`replacement-completed`** - the asset was replaced with
   commissioned original art or a properly licensed alternative, and
   `replacement_required` flips to `false` (from `possible` to
   confirmed-and-executed).

**Hard rule:** the product must not go to public launch or a paid closed
beta while any entry remains `unverified`/`high`. This is independent of
Sprint 6, Sprint 7, or any other sprint's own closure criteria - it is
tracked here specifically so it cannot be closed by sprint momentum
alone.

---

## Changelog

- **2026-07-23:** Log opened. All 44 entries (22 cards × 2 resolutions)
  seeded from `assets/tarot-cards/CARD_REGISTRY.json` and per-card
  metadata files, all starting at `unverified`/`high`/`unknown` per the
  Product Owner's explicit instruction.
