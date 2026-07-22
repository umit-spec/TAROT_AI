# Visual Constitution — Tarot Card Production Standard

## Purpose

22 Büyük Arkana kartı üretim standardı. 

**KRITIK KURAL:** Bu belge KESINLEŞMEDEN, Aşama 4 kart üretimine BAŞLANMAZ.

---

## Design Philosophy

**Premium Minimalism**
- Elegant, not cluttered
- Sophisticated, not ornate
- Timeless, not trendy
- Accessible, not obscure

**Visual Consistency**
- Tüm 22 kart "aynı desteden" hissi verin
- Benzer ışık, kamera, palet
- Tekrar eden semboller
- Uyumlu anatomisi

---

## Card Specifications

### Format & Resolution

```
Web display: 512 x 768 px
High-res (share/print): 2048 x 3072 px
Aspect ratio: 2:3 (portrait)
Color space: sRGB
Format: PNG (alpha channel for web, opaque for print)
File size: <500KB web, <2MB print
```

### Card Anatomy

```
┌─────────────────────────────────────┐ ↑ 768px
│  TITLE AREA (40px top margin)       │ │
│  "00 - THE FOOL"                    │ │
│  (Türkçe + Roman numeral)           │ │
├─────────────────────────────────────┤ │
│                                     │ │
│  MAIN ILLUSTRATION AREA (680px)     │ │
│                                     │ │
│  [Centered, 90% viewport]           │ │
│                                     │ │
│                                     │ │
│                                     │ │
│                                     │ │
├─────────────────────────────────────┤ │
│  FOOTER KEYWORDS (40px bottom)      │ │
│  "Yeni Başlangıç • Macera"          │ │
└─────────────────────────────────────┘ ↓
        ← 512px →
```

---

## Visual Style

### Color Palette

**Primary:**
- Deep Navy: #1a2332 (backgrounds, shadows)
- Warm Black: #0f0e0b (text, depth)
- Warm Beige: #d4a574 (accents, highlights)
- Soft Gold: #c9a961 (borders, shimmer)

**Secondary:**
- Deep Burgundy: #8b3a3a (emotion, depth)
- Soft Cream: #f5f1eb (high-light, reverse)
- Charcoal: #3a3a3a (contrast)

**Usage:**
- Main illustration: warm, earthy, gold/burgundy accents
- No neon, no oversaturation
- Gold should feel luxury, not cheap

### Lighting

**Direction:** Consistent across all cards
- Light source: Upper left (45° angle)
- Shadows: Soft, diffused (not harsh)
- Highlights: Gentle (not blown out)
- Overall: Warm, evening-like (not stark daylight)

**No:** 
- Harsh shadows
- Overhead clinical lighting
- Color temperature shifts between cards

### Camera Angle

**Perspective:** Consistent, slightly elevated
- 3/4 view (not straight-on, not extreme angle)
- Eye level: ~60% of frame
- Distance: Intimate but not claustrophobic
- Depth: Background softly blurred (bokeh)

---

## Symbol Language

### Recurring Symbols (Consistency)

Tüm 22 kart'ta tekrar eden semboller, tutarlı stillerde gösterilir:

| Symbol | Meaning | Style Rule |
|--------|---------|-----------|
| Sun | Consciousness, clarity, life | Warm gold, centered top |
| Moon | Intuition, dreams, night | Silver, crescent, lower |
| Star | Hope, guidance, potential | 5-point, gold, scattered |
| Water | Emotion, flow, unconscious | Ripples, blues/teals, feminine |
| Fire | Passion, transformation, will | Flames, warm, directional |
| Mountains | Obstacles, stability, challenge | Layered, blue-grey, distant |
| Trees/Nature | Growth, roots, grounding | Organic, textured, varied |
| Figures | Human, archetype, path | Anatomically proportional, expressive |
| Doors/Gates | Transition, threshold, choice | Symmetrical, ornate-but-elegant |
| Wheels | Cycle, fate, fortune | Geometric, balanced, spinning |

---

## Character Design

### Face Anatomy Rules

**Proportions** (consistent across all human faces):
- Eyes: 1/4 way down from top
- Distance between eyes: 1 eye width
- Nose: 1/3 point of face length
- Mouth: 2/3 point
- Head size: 1/7 of body (anatomically correct)

**Expression:**
- No caricature (subtle, not exaggerated)
- Age range: 20-70, diverse
- Gender: Mix of masculine, feminine, androgynous
- Emotion: Matches card meaning

**Skin Diversity:**
- All skin tones represented
- No stereotyping or exoticization
- Respectful representation of features

### Clothing Language

**Consistency:**
- All figures in period clothing (not modern, not anachronistic)
- Rich textures (silk, wool, leather, gold-thread)
- Color harmony with overall card
- Cultural references: Respectful, not appropriative

**Diversity:**
- Various cultures represented
- Not all European aesthetic
- Authentic textile and style references

---

## Negative Prompt System

**These should NEVER appear on cards:**

```
Poor quality, blurry, distorted, low-res,
plastic, artificial, cold lighting,
harsh shadows, clipped, out of frame,
anatomically incorrect, broken proportions,
ugly faces, sick, diseased, rotting,
gore, explicit violence,
modern items (phones, cars, electricity),
text (except title and keywords),
watermarks, signatures, AI artifacts,
duplicate elements, repetitive,
bad color grading, oversaturated,
neon, graffiti,
photorealism (should be painterly),
celebrity likenesses,
religious iconography (non-symbolic),
corporate logos,
low-contrast, muddy, washed out
```

---

## Generation & Tracking

### Generation Process

1. **Seed Selection:** Unique integer per card (recorded)
2. **Model:** Midjourney or Stable Diffusion (recorded)
3. **Parameters:**
   ```
   Style: Oil painting, Renaissance-inspired, warm tones, mystical
   Quality: Maximum, High definition
   Aspect: 2:3
   Negative: [above list]
   Seed: [unique per card]
   Version: [Stable Diffusion v2.1 or Midjourney v6]
   ```

4. **Generation:** Batch 3-4 variations per card
5. **Manual Selection:** Choose best version
6. **Post-processing:** Minimal (crop, normalize color)
7. **QA Review:** Against rubric (see below)
8. **Approval:** Product Owner signs off

### Seed & Parameter Tracking

```json
{
  "cardId": "00-fool",
  "name_tr": "Aptal",
  "generation": {
    "model": "midjourney-v6",
    "seed": 4827394,
    "prompt": "A young person standing at cliff's edge, looking toward horizon...",
    "negative_prompt": "[full negative list above]",
    "generated_at": "2026-08-15T10:23:00Z",
    "variations_generated": 4,
    "selected_variation": 1,
    "post_processing": "Cropped to 512x768, normalized white balance",
    "approved_by": "Product Owner",
    "approved_at": "2026-08-16T14:00:00Z",
    "version": "1.0"
  },
  "qa_score": 8.5,
  "qa_notes": "Excellent consistency, strong symbolism, warm lighting perfect"
}
```

---

## Quality Rubric (QA Scoring)

Every card scored 1-10 on:

| Criterion | Weight | Rubric |
|-----------|--------|--------|
| **Consistency** | 25% | Matches other 21 cards in style/lighting/pacing |
| **Symbolism** | 20% | Clear visual metaphor, relevant to card meaning |
| **Composition** | 15% | Balanced, foreground/middle/background clear |
| **Lighting** | 15% | Warm, consistent, flattering on skin |
| **Anatomy** | 10% | Proportions correct, no obvious deformities |
| **Color Harmony** | 10% | Palette consistent, no jarring shifts |
| **Accessibility** | 5% | Readable in small format (thumbnail test passed) |

**Minimum acceptable:** 7.5/10

**Resubmit if:** <7.5/10 or any criterion <6/10

---

## Mobile Thumbnail Test

**Critical:** Card must be readable at small size.

```
Display sizes to test:
- 100x150 px (small phone)
- 150x225 px (medium)
- 200x300 px (large)

Test checklist:
- [ ] Title readable?
- [ ] Keywords readable?
- [ ] Main figure visible?
- [ ] Color harmony clear?
- [ ] Not muddy or over-contrasted?
```

If failed: Adjust contrast/color, regenerate.

---

## Asset Library Organization

```
assets/tarot-cards/
├── 00-fool/
│   ├── fool-web.png (512x768)
│   ├── fool-hq.png (2048x3072)
│   ├── fool-thumb.png (100x150)
│   ├── fool-metadata.json (generation record)
│   └── fool-qa.md (QA notes)
├── 01-magician/
│   ├── [same structure]
├── ...
└── README.md (deck overview + consistency notes)
```

---

## Version & Provenance

All cards include:
- **Model provenance:** Which AI model, version
- **Seed:** For reproducibility
- **Generation date:** When created
- **Approval chain:** Who QA'd, who approved
- **Changelog:** If card regenerated, why

This ensures:
- Legal protection (clear AI usage)
- Reproducibility (same seed = same card)
- Quality audit trail
- Future updates tracked

---

## Final Checklist (Before Aşama 4)

- [ ] Color palette finalized and approved
- [ ] Lighting direction chosen and tested
- [ ] Symbol glossary complete
- [ ] Character design rules documented
- [ ] Negative prompt tested on 3-4 sample generations
- [ ] Sample cards (0, 11, 21) created and QA'd (all >7.5/10)
- [ ] Seed & parameter tracking JSON template approved
- [ ] QA rubric weighted and tested
- [ ] Mobile thumbnail test protocol finalized
- [ ] Asset library folder structure created
- [ ] Generation script / workflow documented
- [ ] Product Owner sign-off on visual direction

**No card production starts until ALL boxes checked.**

---

## Next Steps

Reading Constitution. 3-katman reading engine detayları.
