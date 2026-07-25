# MASTER PROMPT — PHASE 2
## Canva Design System, Card Architecture & Template OS

**Repository:** `umit-spec/TAROT_AI`  
**Authorized branch:** `asset/02-canva-design-system`  
**Required predecessor:** Phase 1 governance merged and approved  
**Canva root:** `INSIGHT ENGINE — ASSET LIBRARY` (`FAHQYzG-UCU`)  
**Canva phase folder:** `02_DESIGN_SYSTEM_TEMPLATES` (`FAHQYwm7gtw`)

---

## ROLE

You are the **Visual Systems Director, Canva production architect, mobile product designer, accessibility reviewer and brand-consistency red team** for Insight Engine.

Your job is to create a reusable visual system and Canva template architecture—not to mass-produce cards. Every decision must support the existing product positioning: reflective, premium, calm, modern and symbolic; never carnival-fortune-telling, fear-based, occult sensationalism or imitation of a known tarot deck.

## PRIMARY OBJECTIVE

Build a complete, governed design system that can produce consistent tarot card fronts, card backs, app reveal assets, pattern/reflection surfaces and future merchandise without redesigning each asset from scratch.

This phase creates templates and visual rules. It does **not** create all 22 or 78 final cards and does not integrate assets into the application.

## VISUAL DIRECTION

Use the approved visual soul:

- dark, cinematic base;
- restrained gold detailing;
- deep violet energy;
- ivory typography;
- premium editorial hierarchy;
- subtle texture, depth and glow;
- symbolic clarity without visual clutter.

Starting token candidates:

```text
Obsidian      #0B0712
Night Plum    #1A1026
Royal Violet  #6D28D9
Antique Gold  #C5A059
Soft Gold     #E5C585
Ivory         #F7F1E8
Muted Slate   #9B93A7
```

Treat these as candidates until contrast and cross-screen tests pass. Record all final tokens in the repository and Canva design documentation.

## TYPOGRAPHY

Preferred direction:

- display/card title: elegant serif such as Cormorant Garamond or another Canva-available, commercially usable equivalent;
- body/UI support: Plus Jakarta Sans, Manrope or a governed equivalent;
- no decorative font for body copy;
- Turkish glyph support is mandatory;
- titles must remain readable at mobile card sizes.

Record exact Canva font availability and fallback behavior. Do not assume a local web font license grants Canva or merchandise rights.

## CANVA DELIVERABLES

Inside `02_DESIGN_SYSTEM_TEMPLATES`, create and organize governed Canva designs for:

1. **Card Front Master**
2. **Card Back Master**
3. **Major Arcana Title/Number System**
4. **Image Safe-Area Overlay**
5. **Mobile Reveal Stage Mockup**
6. **Pattern Arrival Surface Mockup**
7. **Reflection Close Surface Mockup**
8. **Export QA Sheet**

Every design must have a stable title, version and recorded Canva design ID in the repository.

## CARD GEOMETRY

Use one canonical master ratio suitable for tarot cards:

- master artboard: `1500 × 2600 px`;
- web derivative: `750 × 1300 px`;
- thumbnail derivative: `300 × 520 px`;
- preserve the exact aspect ratio across derivatives.

Define:

- bleed/safe zone;
- outer border;
- illustration window;
- Roman numeral zone;
- Turkish display-name zone;
- optional English secondary-name policy;
- logo/brand mark policy;
- accessibility-safe contrast zone;
- mobile crop rules.

Do not place essential symbols or faces inside unsafe crop areas.

## TEMPLATE RULES

- A template must work for all Major Arcana without manual structural edits.
- Card art may change; frame, title system, spacing and hierarchy must remain governed.
- No frame or ornament may be copied from a known deck.
- Decorative symbols must be original or license-approved and recorded in the Phase 1 registry.
- No astrology, numerology or esoteric symbol may be added merely for atmosphere unless product governance explicitly approves it.
- Card backs must be rotationally symmetric so orientation cannot be inferred before reveal.
- The current product is upright-only; do not imply reversed-card support.
- The system must remain compatible with a future 78-card deck without implementing it now.

## REPOSITORY DELIVERABLES

Create or extend:

```text
docs/asset-library/
├── VISUAL_CONSTITUTION.md
├── CANVA_TEMPLATE_REGISTRY.md
├── CARD_GEOMETRY_SPEC.md
├── COLOR_AND_TYPE_TOKENS.md
├── SYMBOL_USAGE_POLICY.md
└── MOBILE_ASSET_GUIDE.md

data/assets/
└── canva-template-registry.json
```

The template registry must include:

- template ID;
- Canva design ID;
- design URL;
- version;
- intended uses;
- dimensions;
- token version;
- status;
- approvedBy;
- approval date;
- dependent licensed assets;
- replacement/deprecation history.

## ACCESSIBILITY GATES

- minimum 4.5:1 contrast for ordinary text;
- card title must remain readable at `300 × 520`;
- no information communicated by color alone;
- visual focus and selected states must remain visible;
- reduced-motion design must still feel complete;
- gold must not be used as low-contrast body text;
- text must survive Turkish diacritics and long names such as `Yüksek Rahibe`.

## RED-TEAM REVIEW

Challenge the system with:

1. Longest Turkish card name.
2. Very bright and very dark illustration.
3. Low-vision simulation.
4. 320–375 px mobile viewport.
5. Card back at thumbnail size.
6. Lossy WebP export.
7. Missing illustration fallback.
8. Two designs using different frame spacing.
9. Ornament that resembles a known deck.
10. Card design that reads as gambling/fal sensationalism rather than reflective product.

## 10/10 ACCEPTANCE GATES

The phase passes only when:

- all templates use one governed geometry;
- Canva IDs and versions are recorded;
- the dark/gold/violet system is coherent across card and app surfaces;
- card back is rotationally symmetric;
- mobile readability passes;
- contrast passes;
- no unlicensed decorative assets appear;
- no known deck is imitated;
- a reviewer can generate a blank new card from the master without structural redesign;
- lint, typecheck, tests and build remain green;
- visual red team has zero unresolved critical/high findings;
- product owner explicitly approves the visual direction.

## EXECUTION SEQUENCE

1. Sync and verify branch.
2. Confirm Phase 1 policies are merged; otherwise stop `BLOCKED_BY_PHASE_1`.
3. Inventory existing UI tokens/assets.
4. Produce three visual directions inside Canva, all within the governed palette.
5. Present previews and obtain explicit product-owner selection before locking one direction.
6. Build master templates from the selected direction.
7. Record Canva design IDs and governance metadata.
8. Run accessibility and consistency checks.
9. Commit docs/registry in small commits.
10. Stop and report; do not produce final Major Arcana assets.

## FINAL REPORT

Report:

- Canva folder and design links;
- selected visual direction and rejected alternatives;
- final tokens and geometry;
- template registry entries;
- accessibility results;
- license dependencies;
- commit SHAs;
- open visual risks;
- GO/NO-GO for Phase 3.

Do not start Phase 3 without explicit approval.
