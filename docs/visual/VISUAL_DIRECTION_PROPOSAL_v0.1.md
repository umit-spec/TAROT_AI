# Visual Direction Proposal v0.1 — Three-Card Pilot

**Date:** 2026-07-23
**Sprint:** S1. **Status:** PROPOSAL — AWAITING PRODUCT-OWNER DIRECTION LOCK. This is the Claude deliverable that must be approved before any card art is commissioned; Claude does not produce the shippable artwork (D3).
**Scope:** three pilot cards only — **The Fool (00), The Hermit (09), The Star (17)**. Do not produce the remaining 19 until this direction is locked.
**Governed by:** `docs/SPRINT_S1_VISUAL_PILOT_PLAN.md`; decision D3 (original deck; PD only as documented fallback; montage never production; RWS images never used).

> Everything below is a *specification for an illustrator/PO to approve or change*, not a brand Claude is imposing. Aspect ratio, palette, and type are proposed defaults; the PO's approval (or edits) locks them.

---

## 1. Style definition

- **Language:** original, restrained line-and-flat-shape illustration — clear silhouettes, confident linework, minimal rendering. Reads as a *thinking tool*, not a mystical performance (aligns with the "insight, not fortune-telling" positioning, ADR-014).
- **Not** photorealistic, not heavy-gradient "AI fantasy," not ornate occult maximalism.
- Each card carries **one clear focal figure/scene** legible at thumbnail size, with symbolic detail supporting — never crowding — it.

## 2. Color system / palette (proposed defaults — hex, light + dark)

A small, calm palette. Per-arcana accent draws from the card's own emotional register.

| Role | Light theme | Dark theme |
|---|---|---|
| Card ground | `#F5F1E8` (warm paper) | `#171A21` (deep slate) |
| Primary ink | `#2B2B33` | `#E8E6DF` |
| Neutral mid | `#8A8578` | `#9AA0A8` |
| Frame line | `#3A3A44` | `#C9C6BE` |

Per-card accent (used sparingly, for the focal symbol only):
- **Fool** → `#E0A83D` (dawn gold — beginning, courage).
- **Hermit** → `#5B6E8C` (muted slate-blue — inward, quiet).
- **Star** → `#3E9C8E` (clear teal — renewal, clarity).

Contrast target: any text placed on a card (title/numeral) meets **WCAG AA** against its ground in both themes; illustration itself is exempt but should keep the focal figure ≥ 3:1 against its immediate background.

## 3. Card frame system

- Aspect ratio **2:3** — keeps the existing `512×768` (web) / `2048×3072` (HQ) shapes so downstream sizing, the deck registry, and any `next/image` config are unchanged.
- A thin single-line border (`Frame line` color), inset with a consistent safe margin (~6% of the short edge) so mobile cropping never clips the figure.
- **Title + numeral** in the bottom band (see typography); Roman-or-Arabic numeral is a PO choice — proposal: Arabic to match the project's `NN-cardname` canonical ids and avoid the Marseille/RWS numbering debate entirely.

## 4. Typography

- **Display (card title + numeral):** one calm humanist serif or a high-legibility grotesque — proposal: a serif for warmth (e.g. an open-license face such as *EB Garamond* or *Source Serif*). **Fonts are assets too:** whichever face is chosen must have a license permitting commercial embedding/redistribution; record it in the license manifest alongside the art.
- **No decorative "mystical" display faces.** Fallback stack documented at build time.
- Titles in Turkish first (product language), with the canonical English name available in metadata, not on the card, for the pilot.

## 5. Symbolism density (grounded in `data/cards`)

Target: **one or two symbols per card**, readable at a 375px thumbnail. Symbols drawn from each card's own meaning in `data/cards/*.json`:

- **The Fool** (`başlangıç, cesaret, açıklık` — "a first step into the unknown, pure potential"): a figure at a threshold/edge, one small bundle. Accent-gold on the horizon. Avoid the cliff-dog-sun RWS composition entirely (see §7).
- **The Hermit** (`içe dönüş, yalnızlık, arayış` — "withdrawing inward, seeking one's own guidance"): a solitary figure with a single contained light source (a lamp read as *limited but sufficient illumination*), quiet slate-blue field. Not the RWS mountain-peak-and-staff composition.
- **The Star** (`umut, iyileşme, berraklık` — "clarity after a hard period"): a single guiding star over calm water/ground, teal accent. Not the RWS kneeling-figure-two-vessels composition.

## 6. Mobile behavior

- Legible as a **single card at 375px** and in a **3-card row** (each ~110–120px wide) — the focal figure must survive that reduction; hence the low symbol density.
- Full-screen view: figure centered, safe margins hold; no text smaller than the frame band.
- Focal point sits in the upper-central third so a bottom-cropped thumbnail still shows it.

## 7. Originality constraints (the "stay away from" list)

The commissioned pilot art must **not** reproduce or derive from:
- **Rider–Waite–Smith (Pamela Colman Smith) compositions** — even where the 1909 line art is public domain, most in-market versions are modern recolorings that are not; safest to not evoke specific RWS scenes at all. (The reference book's plates are RWS and are never extracted — see the Book RAG/Methodology decisions.)
- **The Thoth deck (Harris/Crowley)** — under copyright.
- **Any recognizable in-market commercial or app deck.**
- **AI image outputs that imitate any existing copyrighted deck.**
Positive target: an original symbolic language that stands on its own.

## 8. Provenance / licensing model (the closing bar)

Each pilot asset becomes production-eligible only when, recorded at `evidenceLocation` in `data/assets/pilot-license-manifest.json`:
- **Commission with full commercial rights** *(preferred, D3)* — signed assignment/license covering commercial use + modification in a paid product, creator named; **or**
- **Verified public-domain** *(staging/free-beta fallback only)* — the specific source's PD status + scan/reproduction rights documented; flagged non-production; **never** montage-derived.
The asset gate (`npm run assets:validate`) enforces this: a `production` entry that is `unverified`, has `commercialUse ≠ yes`, an `unknown` creator, or no evidence document, fails — which is exactly its state today.

---

## Open decisions for the Product Owner (must answer to lock direction)

1. **Illustration path:** commission an illustrator for the 3 pilot cards now, or start on a documented public-domain fallback for staging while commissioning in parallel?
2. **Palette / type:** accept the proposed palette + serif direction, or supply brand priors (existing colors/fonts/logo) to fold in?
3. **Aspect ratio + numeral:** keep 2:3 and Arabic numerals (proposal), or change before art starts?
4. **Font license:** any preferred display face, and does its license permit commercial embedding?

On approval, this becomes `VISUAL_DIRECTION_LOCKED_v1.0` and the 3 pilot cards can be produced; only after the pilot is locked do the remaining 19 proceed.
