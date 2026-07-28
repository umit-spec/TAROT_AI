# Canva Content Audit Checklist — Full Tarot Deck V2 (V2-D005)

**Purpose:** a short, self-serve checklist so the product owner can close
V2-D005 with a genuine element-level check, not a from-memory statement.
Estimated time: 10-15 minutes for all 79 files if they share a small
number of Canva design documents (most decks like this are built as a
handful of multi-page designs, not 79 separate projects).

**What this checklist is for:** confirming the final Canva design(s) used
to store/organize the 79 card images contain *only* your uploaded card
artwork plus ordinary text/layout — no Canva-owned licensed content that
would carry its own separate usage terms.

## Before you start

Open Canva and locate the design(s) that hold the 79 Full Tarot Deck V2
card images (the ones matching the files in `asset/09-production-derivatives`
→ `assets/tarot-cards-v2/images/`).

## Step 1 — Check each page/element for non-uploaded content (~majority of the time)

For each Canva design/page involved, click through the layers panel (or
click each element on the canvas) and check:

- [ ] **Every image element is one you uploaded** (from Uploads, not
      dragged from Canva's Elements/Photos/Graphics/Templates panels).
      In the layers panel, uploaded images are usually labeled distinctly
      from stock/library elements - if you're not sure whether an element
      is "yours" or "Canva's," right-click it and check if a licensing/
      attribution note appears (Canva shows this for licensed content).
- [ ] **No stock photo or stock video** was added from Canva's built-in
      library (search results in the "Photos" or "Videos" panel).
- [ ] **No template artwork was kept.** If you started from a Canva
      template, confirm every template-provided illustration/background/
      decorative graphic was deleted or fully replaced by your own
      uploaded artwork - not just covered/hidden behind it.
- [ ] **No Canva Pro "licensed" graphic/element** (the ones marked with a
      small crown icon in the Elements panel) was added anywhere on the
      card pages.

## Step 2 — Check text and layout elements

- [ ] Any text you added (card titles, labels) uses Canva's ordinary text
      tool with a standard font - not an imported logo, brand mark, or
      pre-made text graphic.
- [ ] If you used a specific paid/premium font, note which one - fonts
      have their own licensing separate from images and may need a
      one-line note even if this doesn't block V2-D005 itself.
- [ ] Layout/positioning/cropping/resizing tools (frames, grids,
      alignment) are fine to use - these are Canva's editing tools, not
      licensed content, and don't affect this checklist.

## Step 3 — Spot-check a sample if the deck spans many separate designs

If the 79 cards are NOT all in one or two Canva documents, spot-check at
least one design per suit/section (Major Arcana, and one card from each
of Wands/Swords/Cups/Pentacles) rather than every single one - the risk
here is about *how the deck was assembled*, which is normally consistent
across a batch, not something that varies card-by-card.

## Step 4 — Record the result

If everything above checks out, you can send Claude the closure statement
already drafted for this (the one in your prior message beginning "Ürün
sahibi olarak Full Tarot Deck V2 kapsamındaki..."), and it will be
recorded verbatim in a new `docs/evidence/FULL_DECK_V2_CANVA_CONTENT_AUDIT.md`
with the branch/commit references, closing V2-D005.

If you find something that fails a checkbox above (a stock image, a kept
template graphic, a Pro licensed element):

- Note which card(s)/design(s) are affected.
- Do not send the closure statement.
- Tell Claude what you found - the affected card(s) may need Canva-side
  cleanup (removing the licensed element and re-exporting) before this
  gate can close, which is a small, separate follow-up rather than a
  blocker on the rest of the deck.

## What this checklist does NOT cover

- Whether the card *artwork itself* (the OpenAI-generated illustration)
  resembles another artist's or deck's work - that's V2-D003 (open,
  commercial-release gate), a separate visual-similarity review.
- Trademark clearance for the deck name/branding - that's V2-D010.
- Legal sufficiency for commercial release in any jurisdiction - that's
  V2-D009, subject to counsel review.

This checklist closes V2-D005 only: confirming no Canva-licensed content
was mixed into the final card images beyond your own uploads and ordinary
text/layout.
