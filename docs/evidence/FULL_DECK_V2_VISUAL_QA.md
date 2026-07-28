# Full Tarot Deck V2 — Final Visual QA (V2-D013)

**Reviewer:** Claude (FAZ 9A execution), reviewed image-by-image via generated contact sheets
**Date:** 2026-07-28
**Source branch/SHA:** `asset/06-full-tarot-deck-v2` @ `ae45f3a983ddc4ee579ccecdb6a76ac84976b454`
**Derivative manifest SHA (content, not git commit - manifest generated after this review's screenshots):** see `assets/tarot-cards-v2/derivatives/derivative-manifest.json`, `summary.generated_at`
**Preparation branch:** `asset/09-production-derivatives`

## Methodology

1. Ran `tools/assets/export_full_tarot_deck_v2.py` against the 79 canonical PNG
   sources, producing 79 deterministic 512×768 WebP derivatives. Verified
   reproducibility by running the export a second time into a separate
   directory and diffing all 79 output files byte-for-byte: **identical**.
2. Built five contact sheets from the WebP derivatives with
   `tools/assets/build_contact_sheets.py` (grid layout, filename label under
   each card, low-resolution JPEG - QA artifacts only, never served to the
   application):
   - `01-major-arcana-and-back.jpg` (23: Major Arcana 0-XXI + Card Back)
   - `02-asa.jpg` (14: Wands / Asa)
   - `03-kilic.jpg` (14: Swords / Kılıç)
   - `04-kupa.jpg` (14: Cups / Kupa)
   - `05-tilsim.jpg` (14: Pentacles / Tılsım)
3. Additionally built a dedicated full-resolution (512×768, not upscaled)
   close-up sheet of the four King cards specifically, since these are the
   only four sourced from lower-resolution (512×768) originals and carry
   the highest risk of visible quality loss: `06-kings-closeup.jpg`.
4. Viewed all six sheets directly (image review, not automated pixel
   diffing) and checked every card against the QA criteria in the FAZ 9
   master prompt §10.

This is a contact-sheet-level human visual review, not a per-file
full-resolution pixel audit of all 79 images individually. That level of
depth was judged unnecessary given: (a) no anomaly was visible at
contact-sheet resolution for any card, (b) the King-card close-up
specifically addressed the one known lower-source-resolution risk, and
(c) automated checks already cover file count, dimensions, and hash
integrity (`derivative-manifest.json` summary). If a defect surfaces
later at in-app display size, this document's finding should be revised
via a manifest version bump per V2-D013's own closure requirement, not a
silent overwrite.

## Findings by sheet

### 01 — Major Arcana + Card Back (23/23 reviewed)

All 22 Major Arcana cards are present, in correct traditional order
(0 Deli/Fool through XXI Dünya/World), each with a distinct, non-repeated
illustration and a legible printed title matching its card. Card Back is
a self-contained decorative motif (moons/stars/eye) with no card-identity
information encoded in it. No watermark, no logo, no visible AI-generation
artifact (extra limbs/faces, garbled text), no border inconsistency, no
franchise/trademark resemblance noted.

**Result: PASS (23/23).**

### 02-05 — Minor Arcana suits (56/56 reviewed)

Each of the four suits (Asa/Wands, Kılıç/Swords, Kupa/Cups, Tılsım/
Pentacles) has all 14 expected cards (Ace through Ten, Page, Knight, Queen,
King), each visually distinct within its suit, with pip counts in the
artwork matching the card's rank where the traditional pattern calls for
it (e.g. Onlusu/Ten shows ten suit objects, Üçlü/Three shows three). No
duplicate artwork was found within or across suits. No cut-off titles, no
watermark, no visible corruption.

**Result: PASS (56/56).**

### 06 — King cards, full-resolution close-up (4/4 reviewed)

The four King cards (Asa/Wands, Kılıç/Swords, Kupa/Cups, Tılsım/
Pentacles) are the only cards sourced from 512×768 originals rather than
1024×1536 (per the governed provenance manifest); the derivative pipeline
does not upscale them, so this view is the exact pixel resolution the
application will display. Reviewed at full size: linework, crown/regalia
detail, and printed titles remain sharp and legible; no visible pixelation,
blur, or compression artifact that would read as lower quality next to the
other 75 cards at normal in-app card size (the reveal surface renders
cards well below their native 512×768 resolution).

**Result: PASS (4/4). No REGENERATE required.**

## Notes (non-blocking)

- Every card carries its own painted title text baked into the artwork
  (e.g. "ASA KRALI"). The application's governed `displayName` (from the
  existing card-display registry, Turkish names like "Asa Kralı") will be
  shown separately per the FAZ 9 master prompt §19 (light scrim + governed
  label over the artwork). The two will visually agree in content but are
  independent - the painted title is not read programmatically and never
  substitutes for the governed display name. Flagged for FAZ 9B's UI
  wiring, not an image defect.
- This review did not check for trademark/franchise similarity to known
  commercial tarot decks in a legal sense - that is V2-D003 (open,
  commercial-release gate), explicitly out of scope for V2-D013.

## Regeneration reconciliation

No card was classified REGENERATE or BLOCKED. No regeneration was
required, so no manifest version bump or hash replacement was needed.

## Count summary

| Sheet | Expected | Reviewed | PASS | PASS-WITH-NOTE | REGENERATE | BLOCKED |
|---|---:|---:|---:|---:|---:|---:|
| Major Arcana + Back | 23 | 23 | 23 | 0 | 0 | 0 |
| Wands / Asa | 14 | 14 | 14 | 0 | 0 | 0 |
| Swords / Kılıç | 14 | 14 | 14 | 0 | 0 | 0 |
| Cups / Kupa | 14 | 14 | 14 | 0 | 0 | 0 |
| Pentacles / Tılsım | 14 | 14 | 14 | 0 | 0 | 0 |
| **Total** | **79** | **79** | **79** | **0** | **0** | **0** |

(The baked-in-title observation above is a UI-integration note, not a
per-card PASS-WITH-NOTE classification - it applies uniformly to all 79
cards by design, not to any specific card as a defect.)

## Final decision

**V2-D013: PASS.** All 79 production derivatives are visually acceptable
for FAZ 9B integration at their governed 512×768 dimensions. No
regeneration required. This finding covers image quality and structural
correctness only - it does not clear V2-D002, V2-D005, or any
commercial-release gate.
