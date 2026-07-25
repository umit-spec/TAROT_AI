# Visual System v0.1 — Design Tokens (SPEC ONLY)

**Status:** DRAFT SPEC — NOT APPLIED. This is the visual-system design + token spec prepared in parallel with the human live-eval review. **It is not wired into `tailwind.config.ts` or any component.** The big visual implementation waits for **live-eval Gate 2** (0 safety FAILs, 0 zero-tolerance violations) — building a polished-but-unsafe product would be worse than a plain one.
**Replaces (when applied):** the deliberately grayscale placeholder palette in `tailwind.config.ts` (Sprint 4 note: "neutral/grayscale placeholder pending an actual design lock").
**Locked, unchanged:** fonts (`Playfair Display` headings / `Inter` body) and motion durations (`shuffle 280ms`, `reveal 200ms`).

---

## 1. Design principles

The product is **reflection, not fortune-telling** — the visual language must reinforce that, not undercut it.

- **Calm and grounded, not mystical-manipulative.** Deep, quiet backgrounds; one restrained warm accent. No glow, sparkle, or "cosmic destiny" theatrics that would imply certainty.
- **Gold is a single point of attention, used sparingly** — the primary action and the one moment that matters (reveal, the reflection close). Overusing gold reads as reward/dopamine; the anti-addiction posture forbids that.
- **Purple/indigo = introspection, held quietly.** It is the atmosphere, not a spectacle.
- **Crisis is never celebratory.** Crisis surfaces use a distinct calm red family, clearly separated from gold/accent — a person in distress must never see the "reward" color.
- **Accessibility is a hard constraint.** Every text/background pair below is WCAG-AA validated (§3). Theme-aware (dark + light). Reduced-motion already honored in components.

## 2. Token architecture

Keeps the **existing semantic token names** (so wiring later is a value swap, not a rename): `surface.base/raised`, `ink.primary/muted`, `accent`, a new `accent.purple`, `diagnostic.subtle/subtleText`, `crisis.surface/accent`. Two themes: **dark** (primary identity) and **light** (accessible alternative), selected via `prefers-color-scheme` + a `data-theme` override.

## 3. Token values (WCAG-AA validated)

Ratios computed for each text/background pair; **all pass AA (≥ 4.5:1 normal text)**.

### Dark theme (primary)
| Token | Hex | Used for | Contrast check |
|---|---|---|---|
| `surface.base` | `#17141F` | app background (deep plum-black) | — |
| `surface.raised` | `#211C2E` | cards / panels | — |
| `ink.primary` | `#F4F1F8` | primary text | 16.25:1 on base · 14.79:1 on raised — **AA** |
| `ink.muted` | `#B9B2C9` | secondary text, hints | 8.89:1 on base — **AA** |
| `accent` (gold) | `#C9A24B` | primary buttons (with dark text) | dark text `#17141F` on gold = 7.57:1 — **AA** |
| `accent.text` (gold as text) | `#D4AF61` | sparing gold text/emphasis on dark | 8.74:1 on base — **AA** |
| `accent.purple` | `#B69CE6` | focus rings, secondary emphasis | 7.69:1 on base — **AA** |
| `diagnostic.subtle` | `#2A2440` | hidden-by-default badge bg | — |
| `diagnostic.subtleText` | `#9A93AD` | badge text | 5.02:1 on subtle — **AA** |
| `crisis.surface` | `#3A1E22` | crisis panel (deep desaturated red) | — |
| `crisis.accent` | `#F6B0B0` | crisis text/number | 8.47:1 on crisis.surface — **AA** |

### Light theme (accessible alternative)
| Token | Hex | Used for | Contrast check |
|---|---|---|---|
| `surface.base` | `#FBF9FE` | app background (faint lavender-white) | — |
| `surface.raised` | `#FFFFFF` | cards / panels | — |
| `ink.primary` | `#1E1A29` | primary text | 16.26:1 on base — **AA** |
| `ink.muted` | `#5A5470` | secondary text | 6.84:1 on base — **AA** |
| `accent` (gold) | `#C9A24B` | primary buttons (with dark text) | dark text `#1E1A29` on gold = 7.09:1 — **AA** |
| `accent.text` (gold as text) | `#8A6D22` | gold text/emphasis on light | 4.68:1 on base — **AA** |
| `accent.purple` | `#5B3FA6` | focus rings, secondary emphasis | 7.42:1 on base — **AA** |
| `crisis.surface` | `#FCEFEF` | crisis panel | — |
| `crisis.accent` | `#8B3A3A` | crisis text/number (kept from current) | 6.78:1 on crisis.surface — **AA** |

> Non-text tokens (surfaces, badge/crisis backgrounds) have no text-contrast requirement on their own; each is validated only against the text placed on it, above.

## 4. Semantic usage map (component → token)

- **Primary CTAs** (`Bir soruyla tamamla`, `İçgörüyü gör`, draw, submit) → `accent` (gold) bg + dark text. One gold action per screen, max.
- **Secondary controls** (edit, see-details, restart) → `surface.raised` + border + `ink.primary`.
- **Body / headings** → `ink.primary`; **hints, boundary notes, uncertainty note** → `ink.muted`.
- **Focus rings / keyboard focus** → `accent.purple` (visible in both themes; a11y focus is never removed).
- **Reveal** — face-down card = `surface.raised` + subtle border; the just-revealed card may use a single `accent.purple`/`accent` edge, no glow.
- **Diagnostic badges** (`DiagnosticBadge`) → `diagnostic.subtle`/`subtleText`, hidden-by-default; never gold (they are dev signals, not insight).
- **Crisis** (`CrisisNotice`) → `crisis.surface`/`crisis.accent` **only**; never `accent`/gold. This separation is a safety rule, not a style choice.

## 5. Motion (unchanged)

Keep `transitionDuration.shuffle = 280ms`, `reveal = 200ms` (animation principle "< 300ms"). `prefers-reduced-motion` continues to drop opacity transitions (already implemented in `CardReveal`, `ShuffleReveal`). No new motion is introduced by this spec; the visual pass must not add glow/pulse/parallax that reads as "mystical certainty."

## 6. Scope boundary (what this doc does NOT do)

- Does **not** change `tailwind.config.ts`, `globals.css`, or any component.
- Does **not** add a theme toggle, fonts, icons, card artwork, or the 78-card set.
- Does **not** gate or unblock the first user test — that still requires live-eval **Gate 2**.

## 7. Implementation plan (only after Gate 2 passes)

1. Swap the `tailwind.config.ts` color values to the §3 tokens (names unchanged) + add `accent.purple`; add the `data-theme` dark/light mechanism in `globals.css`.
2. Wire focus-ring utility to `accent.purple`; ensure focus is always visible (a11y).
3. Apply per-screen, one PR at a time, **changing no behavior, copy, or structure** — pure presentation. Keep 329/329 tests green (they assert structure/roles, not colors) and re-verify the crisis/accent separation.
4. Keep the reduced-motion and AA guarantees; add a contrast-regression check for the token pairs if practical.
