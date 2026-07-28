# Full Tarot Deck V2 — Display-Name Consistency Audit (RC-2 §9)

**Date:** 2026-07-28
**Reviewer:** Claude (RC-2 execution)
**Scope:** the 22 registered Major Arcana entries in `src/lib/tarot-card-artwork.ts`

## Method

For each of the 22 real `CardId` values, compared four independent sources:

1. `CardId` (from `data/cards/*.json`, the reading engine's own catalog)
2. `cardDisplayName(cardId)` / the governed UI label (`data/cards/*.json` → `name_tr`, the same value shown in the app)
3. The registry's artwork filename (`src/lib/tarot-card-artwork.ts` → `src`)
4. The artwork's own painted title text, read directly off the served WebP file at
   `public/assets/tarot-cards/v2/*.webp` (visual inspection via a generated,
   labeled contact sheet - not the FAZ 9A contact sheet, a fresh one built
   from the exact files served by this branch)

## Result table

| # | CardId | Governed displayName | Artwork filename | Painted title | Result |
|---:|---|---|---|---|---|
| 0 | 00-fool | Deli | 00_Deli | Deli | MATCH |
| 1 | 01-magician | Büyücü | 01_Buyucu | Büyücü | MATCH |
| 2 | 02-high-priestess | Yüksek Rahibe | 02_Yuksek_Rahibe | Yüksek Rahibe | MATCH |
| 3 | 03-empress | İmparatoriçe | 03_Imparatorice | İmparatoriçe | MATCH |
| 4 | 04-emperor | İmparator | 04_Imparator | İmparator | MATCH |
| 5 | 05-hierophant | Aziz | 05_Aziz | Aziz | MATCH |
| 6 | 06-lovers | Âşıklar | 06_Asiklar | Aşıklar | ACCEPTABLE TYPOGRAPHIC VARIANT (diacritic on the first letter only; same word) |
| 7 | 07-chariot | Savaş Arabası | 07_Savas_Arabasi | Savaş Arabası | MATCH |
| 8 | 08-strength | Güç | 08_Guc | Güç | MATCH |
| 9 | 09-hermit | Ermiş | 09_Ermis | Ermiş | MATCH |
| 10 | 10-wheel-of-fortune | Kaderin Tekerleği | 10_Kader_Carki | Kader Çarkı | **MISMATCH** - different Turkish word for "wheel" (Çark vs Tekerlek); same card, same position (X), same imagery; not a wrong-card mapping |
| 11 | 11-justice | Adalet | 11_Adalet | Adalet | MATCH |
| 12 | 12-hanged-man | Asılı Adam | 12_Asilan_Adam | Asılan Adam | ACCEPTABLE TYPOGRAPHIC VARIANT (grammatical form of the same word - "the hanging one" vs "hanging") |
| 13 | 13-death | Ölüm | 13_Olum | Ölüm | MATCH |
| 14 | 14-temperance | Denge | 14_Denge | Denge | MATCH |
| 15 | 15-devil | Şeytan | 15_Seytan | Şeytan | MATCH |
| 16 | 16-tower | Kule | 16_Kule | Kule | MATCH |
| 17 | 17-star | Yıldız | 17_Yildiz | Yıldız | MATCH |
| 18 | 18-moon | Ay | 18_Ay | Ay | MATCH |
| 19 | 19-sun | Güneş | 19_Gunes | Güneş | MATCH |
| 20 | 20-judgement | Yargı | 20_Yargi | Yargı | MATCH |
| 21 | 21-world | Dünya | 21_Dunya | Dünya | MATCH |

## Summary

- 19/22 exact MATCH
- 2/22 ACCEPTABLE TYPOGRAPHIC VARIANT (cards 6, 12)
- 1/22 MISMATCH (card 10)
- 0/22 BLOCKED

Roman numerals (0 through XXI) on every card were also checked against
the card's position in the Major Arcana sequence during this pass and in
FAZ 9A's own visual QA; all 22 are correctly sequential and correctly
paired with their `CardId`/`number`.

## The one MISMATCH, in detail

Card 10 (Wheel of Fortune) has its painted title reading "Kader Çarkı"
while the application's governed `displayName` (from `data/cards/
10-wheel-of-fortune.json` → `name_tr`) reads "Kaderin Tekerleği". Both
are legitimate Turkish translations of "Wheel of Fortune" and refer to
the exact same card - the artwork, its Roman numeral (X), its position in
the sequence, and its `CardId` are all correct. This is a wording
difference in decorative, non-programmatic artwork text, not a card-
identity or mapping defect:

- The governed `displayName` is what the application actually renders as
  the accessible `alt` text and the visible scrim caption - it is
  authoritative and unaffected by what's painted on the image.
- The painted title is never read programmatically anywhere in the
  application (confirmed: no OCR, no text extraction, nothing parses
  image content).
- A user revealing this card sees the governed label "Kaderin Tekerleği"
  clearly, with the artwork's own smaller painted "Kader Çarkı" visible
  only within the illustration itself.

**Classification: MINOR.** Not fixed in RC-2: the governed name is
correct, and RC-2 has no mandate or mechanism to regenerate artwork. If
visual consistency between the painted title and the governed label is
ever desired, that would be a FAZ 9A-adjacent art-regeneration decision
(V2-D013 territory), not an RC-2 code change.
