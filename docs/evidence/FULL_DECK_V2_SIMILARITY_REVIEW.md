# Full Tarot Deck V2 — Third-Party Visual Similarity Review (V2-D003)

**Phase:** CRG-1A (Commercial Release Gate Review, Gate A)
**Date:** 2026-07-28
**Reviewer:** Claude (CRG-1 execution), manual visual review only
**Scope:** the 22 public Major Arcana WebP files + the card back in
`public/assets/tarot-cards/v2/*.webp` (the only 23 files actually served
to the browser; identical in content to the corresponding files in
`assets/tarot-cards-v2/derivatives/webp/Major_Arcana/`)

## What this review is, and is not

This is a **manual, memory-based visual comparison** performed by an AI
assistant against well-known published tarot iconography (principally the
1909 Rider-Waite-Smith deck, whose card-by-card scene compositions are
the de facto industry template that thousands of subsequently published
decks — commercial and public-domain alike — reuse or reinterpret).

This review does **NOT** include, and should not be read as equivalent to:

- a reverse-image search (Google Images, TinEye, or a specialized visual
  search engine) against any actual image database;
- comparison against a specific, enumerated list of currently-in-print
  commercial tarot decks (Wild Unknown, Modern Witch Tarot, Light Seer's
  Tarot, Tarot de Marseille reprints, Thoth, etc.) — no such deck's actual
  artwork was retrieved or compared pixel-by-pixel;
- an assessment by a person with professional visual-IP or trademark
  training;
- a legal conclusion about copyright infringement, trade dress, or unfair
  competition under any jurisdiction's law.

**No tool with actual image-comparison or reverse-image-search capability
was available in this execution environment.** This is a disclosed,
structural limitation of this review, not a discretionary omission.

## Method

Each of the 22 registered Major Arcana card faces and the card back was
opened and visually inspected directly (full card, not a thumbnail). For
each, the reviewer recorded:

1. Whether the overall **scene composition** (subject pose, arrangement,
   key symbolic props) matches a well-known Rider-Waite-Smith-derived
   "stock" composition for that Major Arcana position, and how closely.
2. Whether any **specific, non-generic iconographic detail** was
   reproduced (e.g., a specific letter, number, or symbol placement that
   is a deliberate, recognizable Pamela Colman Smith design choice rather
   than a generic tarot-archetype element).
3. Whether any **named franchise character, real person, logo, or
   trademark** appears (none were expected per the FAZ 9A provenance
   declaration, and this pass re-checked that claim independently).
4. Whether the **rendering style** (linework, palette, digital-painterly
   AI-generation aesthetic) is itself distinctive of a specific named
   contemporary artist or deck brand.

## Risk scale used

| Risk | Meaning |
|---|---|
| NONE | No meaningful resemblance beyond the shared tarot-archetype subject matter itself (idea, not expression) |
| LOW | Generic RWS-family compositional echo, widely repeated across the published-deck industry; no specific reproduced detail |
| MEDIUM | Close compositional/motif resemblance to the RWS "scene template" for this card, including specific arrangement of the same symbolic elements, but different rendering style, palette, character design, and no verbatim detail copy |
| HIGH | A specific, non-generic, recognizable design detail is reproduced (not just the archetype), OR the resemblance extends to a named contemporary commercial deck rather than only the 1909 public-domain template |
| BLOCKED | Franchise character, real-person likeness, logo, or a rendering close enough to read as a copy of one identifiable prior work |

## Per-card table

| # | CardId | Görsel | Gözlenen çağrışım | Risk | Sonuç | Not |
|---:|---|---|---|---|---|---|
| 0 | 00-fool | Deli | Young figure with bindle-on-a-stick, small dog, cliff edge, looking upward | MEDIUM | PASS-WITH-NOTE | Standard RWS Fool blocking (cliff, dog, bundle); distinct night-sky/gold palette and figure design, not RWS's daytime look |
| 1 | 01-magician | Büyücü | One arm raised, one pointed down, altar with cup/sword/disc-like objects | MEDIUM | PASS-WITH-NOTE | RWS "as above so below" gesture and altar-tools motif reused; no pentagram-lemniscate symbol visible, different setting (garden colonnade, not RWS's flower-bed) |
| 2 | 02-high-priestess | Yüksek Rahibe | Seated woman between two pillars marked **"B"** and **"J"**, crescent moon headdress, scroll on lap | **HIGH** | **HUMAN-LEGAL-REVIEW** | The "B"/"J" pillar labels are a specific, deliberate, non-generic Pamela Colman Smith design detail (representing Boaz/Jachin), not a generic tarot archetype element. Reproducing the literal letters is a materially closer copy than reusing the general "seated woman between two pillars" idea. Flagged as the single highest-priority item in this review. |
| 3 | 03-empress | İmparatoriçe | Seated woman on cushioned throne, peacock, abundant flowers/wheat/fruit | MEDIUM | PASS-WITH-NOTE | RWS Empress uses a Venus symbol and wheat field, not a peacock; the peacock is a departure, not a reproduction, but the throne-plus-abundance-symbols template is RWS-derived |
| 4 | 04-emperor | İmparator | Enthroned bearded king, armor, staff, birds and lion figures flanking the throne | LOW | PASS | RWS Emperor throne has ram-head carvings, not lion heads/birds; figure design and throne motif diverge meaningfully from RWS specifics |
| 5 | 05-hierophant | Aziz | Robed elder at an altar/lectern, raised hand, candles | LOW | PASS | RWS Hierophant is seated between two pillars with two kneeling acolytes and a triple cross staff; none of those specific elements are present here — only the generic "religious elder" archetype |
| 6 | 06-lovers | Âşıklar | Two figures facing each other, an angelic presence above radiating light | MEDIUM | PASS-WITH-NOTE | RWS Lovers has an angel (Raphael) above a nude couple with a tree of knowledge/tree of life behind each figure; here two winged figures flank a light burst instead of one angel overhead, and both figures are clothed — a real departure from the specific RWS composition, though the "angel above couple" idea is retained |
| 7 | 07-chariot | Savaş Arabası | Armored rider standing in a chariot pulled by one black and one white horse | MEDIUM | PASS-WITH-NOTE | RWS uses two sphinxes (black/white), not horses, pulling the chariot; the black/white dual-animal-pulling-the-chariot idea is retained, the specific animal is changed |
| 8 | 08-strength | Güç | Woman gently embracing/calming a lion, flowers around her | MEDIUM | PASS-WITH-NOTE | RWS Strength shows a woman opening/closing a lion's jaws with her bare hands, an infinity symbol above her head; here the gesture is an embrace, not a jaw-hold, and no infinity symbol is visible — same archetype, softer specific gesture |
| 9 | 09-hermit | Ermiş | Hooded elder alone on a mountain path, holding a raised lantern and a staff | MEDIUM | PASS-WITH-NOTE | This is one of the closest matches to its RWS counterpart: hooded figure, staff, raised lantern, solitary mountain setting are all present. No six-pointed star inside the lantern (a specific RWS detail) was observed, which is the main point of divergence |
| 10 | 10-wheel-of-fortune | Kaderin Tekerleği | Large wheel, sphinx-like figure on top, snake on one side, four winged creatures (angel/eagle/lion/bull) in the corners | **HIGH** | **HUMAN-LEGAL-REVIEW** | The four-fixed-sign-creature-in-each-corner arrangement (angel, eagle, lion, ox/bull — the four evangelist symbols RWS itself borrowed from Ezekiel/Revelation iconography) plus a sphinx-topped wheel and a serpent is a very close structural match to the specific RWS Wheel of Fortune composition, beyond the generic "wheel" archetype. The four-creature-corner motif specifically is what makes RWS's version recognizable versus a plain wheel; reproducing that specific arrangement raises the same category of concern as card 2. |
| 11 | 11-justice | Adalet | Blindfolded woman with sword and scales, seated between two pillars | LOW | PASS | Notably, RWS's own Justice is **not** blindfolded (that is the older, classical/Greco-Roman "Lady Justice" iconography, itself centuries older than and independent of RWS) — this card's blindfold is actually a point of divergence from RWS, not a similarity. Two-pillar setting echoes the shared "seated between pillars" RWS family motif but without a labeled-letter detail |
| 12 | 12-hanged-man | Asılan Adam | Figure hanging upside-down from a tree by one ankle, other leg crossed behind the knee, hands behind back | MEDIUM | PASS-WITH-NOTE | The crossed-leg-behind-the-knee pose is a specific, recognizable RWS detail (forming the numeral "4" shape with the legs) and is reproduced here; no visible halo/light around the head (an RWS detail that is absent) |
| 13 | 13-death | Ölüm | Hooded robed reaper figure walking a path at dusk, flowers/butterflies nearby | LOW | PASS | RWS Death is a skeleton in armor on a white horse — a mounted knight-figure. This card shows a standing, walking, non-mounted hooded figure with a scythe-topped staff — a materially different composition from RWS's specific "pale rider" scene, sharing only the generic reaper/death archetype |
| 14 | 14-temperance | Denge | Winged angelic figure pouring liquid between two cups, standing near flowing water | MEDIUM | PASS-WITH-NOTE | RWS Temperance shows an angel pouring water between two cups with one foot in a pool and one on land, an iris flower and a path to distant mountains behind. Cup-pouring-angel-by-water is retained here in close form; the one-foot-in-water detail and iris flower were not clearly distinguishable in this pass |
| 15 | 15-devil | Şeytan | Horned enthroned figure on a pedestal, two smaller chained figures kneeling below, pentagram | **HIGH** | **HUMAN-LEGAL-REVIEW** | This is the closest single match in the whole set to its RWS counterpart: horned Baphomet-style figure on a pedestal, an inverted-pentagram motif, and two smaller chained figures kneeling at the base are all present and arranged essentially as in RWS's Devil. This combination of specific details (not just "a devil card") is flagged for the same reason as cards 2 and 10. |
| 16 | 16-tower | Kule | Tower struck by a lightning bolt, crumbling stonework, two falling human figures | MEDIUM | PASS-WITH-NOTE | RWS Tower has a falling crown, flames, and two falling figures from a struck tower — the core "struck tower with two falling figures" scene is retained; no crown motif was clearly visible |
| 17 | 17-star | Yıldız | Woman by a pool pouring water from two vessels, one large star and smaller stars above | MEDIUM | PASS-WITH-NOTE | RWS Star shows a kneeling nude woman pouring from two jugs, one onto land and one into a pool, under a large 7/8-pointed star with 7 smaller stars — the two-vessel pouring pose and single-large-star-plus-smaller-stars sky are both retained here in close form, figure is clothed rather than nude |
| 18 | 18-moon | Ay | Two canines howling toward a large moon, a path between them, a crustacean emerging from water | **HIGH** | **HUMAN-LEGAL-REVIEW** | RWS Moon's specific, well-known combination — two dogs/wolves howling, a crayfish/lobster emerging from a pool in the foreground, a winding path between two towers toward the moon — is highly distinctive of that one card, more so than most other Majors, and this card reproduces essentially all of those specific elements together, not just the "moon" archetype. Flagged alongside cards 2, 10, and 15. |
| 19 | 19-sun | Güneş | Standing figure with arms raised under a large radiant sun, sunflowers in the foreground | LOW | PASS | RWS Sun shows a nude child on a white horse with a red banner, a wall, and sunflowers behind — a young-rider composition. This card shows an adult figure walking/standing with raised arms, no horse, no banner, no wall — a materially different scene sharing only "sun + flowers" |
| 20 | 20-judgement | Yargı | Winged angel above blowing a trumpet, banner below the trumpet, robed figures below rising with arms raised | MEDIUM | PASS-WITH-NOTE | RWS Judgement's angel-with-trumpet-over-rising-figures composition (with a cross on the banner, and often coffins/a sea below) is closely echoed; this card's banner appears to carry a star motif rather than a cross, and no coffins are visible |
| 21 | 21-world | Dünya | Central dancing/floating figure inside a wreath, surrounded by planetary bodies in the corners | LOW | PASS | RWS World's wreath-plus-central-figure idea is retained, but RWS specifically places the four evangelist creatures (the same angel/eagle/lion/ox set as the Wheel of Fortune) in the four corners — here the corners hold planets/moons instead, which is a meaningful departure from the one RWS detail (the four-creature set) that recurs as the more protectable-feeling element elsewhere in this deck (cards 2, 10, 15, 18) |
| — | Card_Back | Kart Arkası | Radial/eye motif, moon phases, stars, symmetrical mandala-style border | NONE | PASS | Original decorative composition; no resemblance to any specific known deck's card-back design was observed (most published decks use a plain repeating pattern or a house-brand emblem, not this specific eye/moon-phase mandala) |

## Summary

| Risk level | Count |
|---|---:|
| NONE | 1 (card back) |
| LOW | 6 (Emperor, Hierophant, Justice, Death, Sun, World) |
| MEDIUM | 12 (Fool, Magician, Empress, Lovers, Chariot, Strength, Hermit, Hanged Man, Temperance, Tower, Star, Judgement) |
| HIGH | 4 (**High Priestess, Wheel of Fortune, Devil, Moon**) |
| BLOCKED | 0 |

**No card is classified BLOCKED.** No franchise character, no real-person
likeness, no logo, and no rendering style read as a copy of one specific
identifiable named contemporary artist was observed in any of the 22
cards or the card back.

**Four cards are classified HIGH** and routed to HUMAN-LEGAL-REVIEW:
High Priestess (02), Wheel of Fortune (10), Devil (15), Moon (18). Each
reproduces a *specific, non-generic* combination of design details from
the 1909 Rider-Waite-Smith deck (labeled pillars; the four-creature wheel
corners; the horned-figure-plus-chained-pair-plus-pentagram grouping; the
two-dogs-plus-crayfish-plus-path grouping) rather than only the shared
tarot archetype. Whether this crosses from unprotectable idea/archetype
into protectable expression — and whether an 1909 public-domain
illustration even carries enforceable rights against this kind of
compositional echo in the first place, as opposed to a *later* copyrighted
reinterpretation of the same RWS template by a still-active rights holder
— is a legal judgment call this review is not qualified to make. It is
listed as Question set §D item 1 in
`docs/legal/COMMERCIAL_RELEASE_LEGAL_REVIEW_PACKET_TR.md`.

## V2-D003 status after this review

**PARTIAL — cannot be CLOSED by this review alone.**

Per the debt log's own closure requirement, V2-D003 needs one of:

- (A) a documented human similarity review — **this document is that**,
  but it is an AI-assisted review, not a human reviewer's independent
  judgment, and explicitly not a reverse-image search;
- (B) reverse-image-search plus human evaluation — **not performed**, no
  tool available in this environment;
- (C) expert legal/trademark counsel evaluation — **not performed**,
  remains a §D packet item for external counsel;
- (D) explicit product-owner residual-risk acceptance — **not yet given**
  for this specific finding set, and per the debt log's own rule, even an
  acceptance cannot cover a HIGH/BLOCKED-risk image being used as-is
  without further review.

**Recommendation (not a decision):** route the four HIGH-risk cards (02,
10, 15, 18) to actual legal/trademark counsel review before commercial
release, specifically on the RWS-derivation question above. The other 18
cards plus the card back can reasonably proceed on a LOW/MEDIUM-archetype
residual-risk basis if the product owner chooses to formally accept that
residual risk in writing — but that acceptance has not been sought or
given as part of this CRG-1 execution, consistent with this phase's
instruction not to close legal gates unilaterally.
