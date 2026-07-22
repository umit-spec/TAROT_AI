# Major Arcana Card Assets — Version 1.0

**Status:** Extracted and validated  
**Extraction Date:** 2026-07-22  
**Card Count:** 22 cards (complete Major Arcana deck)  
**Source:** User-provided montage (1000214766.png)  
**Approved For:** Prototype use

---

## Overview

Complete set of 22 Major Arcana illustrations extracted from provided montage image.

Each card is available in two formats:
- **Web:** 512×768 px, WebP, ~10-20KB (optimized for fast loading)
- **HQ:** 2048×3072 px, WebP, ~20-30KB (high-resolution for printing, sharing)

---

## File Structure

```
tarot-cards/
├── README.md (this file)
├── CARD_REGISTRY.json (canonical card metadata)
├── _extraction_manifest.json (extraction details, checksums, crop coordinates)
├── 00-the-fool.webp
├── 00-the-fool-hq.webp
├── 00-the-fool-metadata.json (individual card metadata)
├── 01-the-magician.webp
├── 01-the-magician-hq.webp
├── 01-the-magician-metadata.json
├── ... (20 more cards)
└── 21-the-world-hq.webp
```

---

## Card Manifest

| # | ID | Name (EN) | Name (TR) | Web File | HQ File |
|---|-----|-----------|-----------|----------|---------|
| 0 | 00-the-fool | The Fool | Deli | 00-the-fool.webp | 00-the-fool-hq.webp |
| 1 | 01-the-magician | The Magician | Simyacı | 01-the-magician.webp | 01-the-magician-hq.webp |
| 2 | 02-the-high-priestess | The High Priestess | Yüksek Rahibe | 02-the-high-priestess.webp | 02-the-high-priestess-hq.webp |
| 3 | 03-the-empress | The Empress | İmparatoriçe | 03-the-empress.webp | 03-the-empress-hq.webp |
| 4 | 04-the-emperor | The Emperor | İmparator | 04-the-emperor.webp | 04-the-emperor-hq.webp |
| 5 | 05-the-hierophant | The Hierophant | Hiyerofant | 05-the-hierophant.webp | 05-the-hierophant-hq.webp |
| 6 | 06-the-lovers | The Lovers | Sevgili | 06-the-lovers.webp | 06-the-lovers-hq.webp |
| 7 | 07-the-chariot | The Chariot | Savaş Arabası | 07-the-chariot.webp | 07-the-chariot-hq.webp |
| 8 | 08-strength | Strength | Güç | 08-strength.webp | 08-strength-hq.webp |
| 9 | 09-the-hermit | The Hermit | Eremit | 09-the-hermit.webp | 09-the-hermit-hq.webp |
| 10 | 10-wheel-of-fortune | Wheel of Fortune | Kaderin Tekerleği | 10-wheel-of-fortune.webp | 10-wheel-of-fortune-hq.webp |
| 11 | 11-justice | Justice | Adalet | 11-justice.webp | 11-justice-hq.webp |
| 12 | 12-the-hanged-man | The Hanged Man | Asılı Adam | 12-the-hanged-man.webp | 12-the-hanged-man-hq.webp |
| 13 | 13-death | Death | Ölüm | 13-death.webp | 13-death-hq.webp |
| 14 | 14-temperance | Temperance | İtemlendirme | 14-temperance.webp | 14-temperance-hq.webp |
| 15 | 15-the-devil | The Devil | Şeytan | 15-the-devil.webp | 15-the-devil-hq.webp |
| 16 | 16-the-tower | The Tower | Kule | 16-the-tower.webp | 16-the-tower-hq.webp |
| 17 | 17-the-star | The Star | Yıldız | 17-the-star.webp | 17-the-star-hq.webp |
| 18 | 18-the-moon | The Moon | Ay | 18-the-moon.webp | 18-the-moon-hq.webp |
| 19 | 19-the-sun | The Sun | Güneş | 19-the-sun.webp | 19-the-sun-hq.webp |
| 20 | 20-judgement | Judgement | Kıyamet | 20-judgement.webp | 20-judgement-hq.webp |
| 21 | 21-the-world | The World | Dünya | 21-the-world.webp | 21-the-world-hq.webp |

---

## Technical Details

### Extraction Process

Source montage extracted using deterministic script: `tools/assets/extract_major_arcana.py`

Configuration: `tools/assets/config/major_arcana_crops.json`

**Extraction manifest:** `_extraction_manifest.json`
- Includes crop coordinates for all 22 cards
- Source checksum for reproducibility
- Output dimensions and checksums

### Dimensions

**Web format (512×768 px):**
- Optimized for: landing, card selection screen, reveal animation
- Typical file size: 10-20 KB per card
- Format: WebP with quality 85

**HQ format (2048×3072 px):**
- Optimized for: full-screen reading detail, printing, sharing
- Typical file size: 20-30 KB per card
- Format: WebP with quality 90

Both formats maintain:
- 2:3 aspect ratio (portrait)
- Black padding if card was wider
- `object-fit: contain` behavior in CSS

### Color Space

- sRGB
- No embedded color profile (Web sRGB assumed)
- 8-bit per channel

---

## Provenance & Rights

**Source:** User-provided montage image (1000214766.png)  
**Extraction:** 2026-07-22  
**Status:** Approved for prototype use  
**License:** To be confirmed with product owner

**Approval Chain:**
1. Extracted from montage
2. Pending visual QA
3. Pending legal review (provenance/licensing)
4. Red Team validation
5. Gatekeeper decision

---

## Usage in Application

### Importing Card

```javascript
// Import card asset
import Fool from '@/assets/tarot-cards/00-the-fool.webp?url';

// Or with loader
const cardImage = import.meta.glob('../../assets/tarot-cards/*.webp', { 
  import: 'default' 
});
```

### CSS Background

```css
.card-back {
  background-image: url(/assets/tarot-cards/00-the-fool.webp);
  background-size: contain;
  background-position: center;
}
```

### React Component

```jsx
<img
  src={`/assets/tarot-cards/${cardId}.webp`}
  alt={`${cardName} card`}
  style={{ objectFit: 'contain' }}
/>
```

### Responsive Sizing

```jsx
// Mobile: 100x150px
// Tablet: 200x300px
// Desktop: 400x600px

<img
  srcset="
    /assets/tarot-cards/00-the-fool.webp 512w
  "
  sizes="(max-width: 600px) 100px,
         (max-width: 1024px) 200px,
         400px"
/>
```

---

## QA & Validation

### Contact Sheet

Visual proof of all 22 cards in order:  
`validation/evidence/assets/major-arcana-contact-sheet.png`

### Validation Evidence

See: `validation/evidence/assets/`

---

## Metadata Per Card

Each card has an individual metadata file:
- `{card-id}-metadata.json`

Includes:
- Card name (English & Turkish)
- Canonical number
- Arcana type (major)
- Asset paths
- Source crop coordinates
- Provenance status
- QA score (when available)

---

## Reproducibility

To regenerate these exact assets from source montage:

```bash
cd /home/user/TAROT_AI

# Run extraction script
python3 tools/assets/extract_major_arcana.py \
  /path/to/1000214766.png \
  --config tools/assets/config/major_arcana_crops.json \
  --output assets/tarot-cards

# Verify output
python3 tools/assets/create_contact_sheet.py assets/tarot-cards

# Create metadata
python3 tools/assets/create_card_metadata.py
```

All outputs will be byte-identical (checksums match extraction manifest).

---

## Testing Checklist

- [ ] Asset count: exactly 22 cards
- [ ] Canonical IDs: 00-21, no gaps
- [ ] No duplicate IDs
- [ ] All files decode (valid WebP)
- [ ] Web dimensions: 512×768 ± 0px
- [ ] HQ dimensions: 2048×3072 ± 0px
- [ ] No zero-byte files
- [ ] Manifest checksums match
- [ ] All metadata files present
- [ ] Contact sheet renders correctly
- [ ] No Strength/Justice swap (11, 8 in correct positions)
- [ ] No Tower/Star numbering error (16, 17 in correct positions)

---

## Integration Timeline

**Phase 1:** Extract and validate assets ✅ (2026-07-22)  
**Phase 2:** Red Team audit (in progress)  
**Phase 3:** Gatekeeper decision (pending)  
**Phase 4:** Integration into UI components  
**Phase 5:** End-to-end testing (responsive, reversed, reveal)  
**Phase 6:** Performance validation  
**Phase 7:** Production release  

---

## Support & Questions

- Extraction script: `tools/assets/extract_major_arcana.py`
- Configuration: `tools/assets/config/major_arcana_crops.json`
- Manifest: `_extraction_manifest.json` (crop coordinates, checksums)
- Validation evidence: `validation/evidence/assets/`

For issues, refer to migration PR and Validation OS evidence.

---

**Version 1.0** | Generated 2026-07-22 | Extraction branch: `feat/major-arcana-asset-migration`
