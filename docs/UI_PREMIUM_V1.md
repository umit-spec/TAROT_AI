# Insight Engine — Premium UI/UX v1 (FAZ 0 Audit + Roadmap)

**Status:** FAZ 0 + FAZ 1 in progress. This document is the single source of
truth for the card-independent premium interface work. It is written before
any visual code changes land, and is updated at the end of each phase.

**Source branch:** `claude/insight-engine-investor-audit-bkofgr` (HEAD at
audit time: `657e698`).
**Working branch:** `claude/premium-ui-foundation-phase1-4d2940`.

---

## 0. Governance note (read first)

`docs/VISUAL_SYSTEM_v0.1.md` (already in this branch, committed
`4414d20`) states explicitly:

> "The big visual implementation waits for live-eval **Gate 2** (0 safety
> FAILs, 0 zero-tolerance violations) — building a polished-but-unsafe
> product would be worse than a plain one."

`docs/evidence/LOCAL_ANTHROPIC_SMOKE_TEST_2026-07-25.md` confirms Gate 2 is
**not yet closed**: the 12-case governed live-eval corpus has not been
independently reviewed/executed, and that document lists "the planned
visual-system and mobile-polish passes" as still pending before user-facing
testing.

**This phase proceeds anyway, on explicit current instruction from the
product owner**, with the scope deliberately narrowed to stay compatible
with that gate: presentation-only changes (color tokens, typography,
layout shell), zero changes to state machine, API contracts, reading
engine, crisis gate, or safety logic, and all 329 existing tests must stay
green throughout. If Gate 2 later fails or is revisited, this work is pure
CSS/markup and is cheap to re-theme or roll back — no product logic is at
stake.

The color token *values* proposed by the current instruction differ from
the placeholder dark palette sketched in `VISUAL_SYSTEM_v0.1.md` §3. This
document's palette (§3 below) is the one actually applied; it supersedes
the `VISUAL_SYSTEM_v0.1.md` hex values as the working spec, but keeps that
document's semantic *principles* (gold = single sparing accent, violet =
quiet introspection, crisis = separate red family never confused with
gold, WCAG AA everywhere, no glow/pulse theatrics). `VISUAL_SYSTEM_v0.1.md`
is left in place, unmodified, as a historical record.

---

## 1. Design intent

Product identity (current instruction, product owner decision):
**"A safe, calm, aesthetic personal reflection ritual."** Not a fortune-telling
machine, not a casino/gambling surface, not a neon mobile game, not a pile of
crystals/smoke/sparkle. Reference language: premium editorial app, boutique
hotel darkness, museum-vitrine precision, an old book's elegance, modern
digital-product clarity, cinematic but restrained.

The user should feel: calm, curiosity, trust, privacy, mental space,
controlled anticipation, entry into a considered ritual — not urgency, not
reward-loop dopamine, not manipulated certainty.

## 2. Card-image rule (hard constraint)

No real tarot artwork exists in this branch and none is added in this phase
or in FAZ 1–8. Where a card surface is needed, it is represented by a
CSS-only placeholder (`CardArtworkPlaceholder`, introduced in FAZ 5, **not**
FAZ 1): dark surface, thin gold border, an abstract center mark, a position
label, controlled light. The placeholder is unambiguously named and coded so
nobody mistakes it for real card art. Real card-asset integration is FAZ 9
and requires explicit separate user approval — it is out of scope for every
phase in this document unless and until that approval is given.

## 3. Token system

Single source of truth: CSS custom properties in `src/app/globals.css`
(`:root`), consumed by `tailwind.config.ts` via `var(--token-name)` so there
is exactly one place to change a value. Components use Tailwind utility
classes, never inline hex codes.

### 3.1 Backward-compatible semantic names (existing, unchanged names, new values)

These names are already used throughout `src/components/**` today
(`bg-surface-raised`, `text-ink-muted`, `bg-accent`, `bg-crisis-surface`,
`text-crisis-accent`, `bg-diagnostic-subtle`, `text-diagnostic-subtleText`,
`border-diagnostic-subtle`, `font-heading`, `font-body`). FAZ 1 only swaps
the **values** behind these names from the Sprint-4 grayscale placeholder to
the premium dark palette; it does not rename or remove any class any
existing component depends on.

| Token | Old (placeholder) | New (premium) |
|---|---|---|
| `surface.base` | `#fafafa` | `#07060B` (bg deepest) |
| `surface.raised` | `#ffffff` | `#191422` (surface raised) |
| `ink.primary` | `#1a1a1a` | `#F5F0E7` |
| `ink.muted` | `#6b6b6b` | `#938CA6` (see §3.3 — adjusted for AA, see below) |
| `accent` | `#4a4a4a` | `#D0A45C` (antique gold) |
| `diagnostic.subtle` | `#e8e8e8` | `#211A2C` (surface interactive) |
| `diagnostic.subtleText` | `#555555` | `#B8AFBF` (secondary text) |
| `crisis.surface` | `#fff5f5` (light-mode pink) | `#2A1416` (deep desaturated red, dark-coherent) |
| `crisis.accent` | `#8b3a3a` | `#F3A9A9` (warm readable red on the new crisis surface) |

Crisis tokens are updated in this phase (values only, in
`tailwind.config.ts`) because leaving the old light-pink box unchanged
inside a black premium shell would read as a rendering bug at the single
worst possible moment (a user in crisis) — but `CrisisNotice.tsx` itself,
its logic, its copy, and its structure are untouched.

### 3.2 New semantic tokens (additive, for the new shell components)

Introduced for `AppShell`/`Surface`/new primitives; not required by any
existing component, so adding them cannot break anything:

`background`, `background-elevated`, `surface`, `surface-raised`,
`surface-interactive`, `foreground`, `foreground-secondary`,
`foreground-muted`, `accent-gold`, `accent-gold-soft`, `accent-violet`,
`accent-violet-deep`, `border-subtle`, `border-strong`, `focus`.

### 3.3 Full palette + WCAG AA verification

| Token | Hex / rgba | Contrast checked |
|---|---|---|
| Background deepest | `#07060B` | — |
| Background elevated | `#0D0A13` | — |
| Surface | `#13101B` | — |
| Surface raised | `#191422` | — |
| Surface interactive | `#211A2C` | — |
| Primary text | `#F5F0E7` | 17.8:1 on deepest, 14.8:1 on surface-interactive — **AA/AAA** |
| Secondary text | `#B8AFBF` | 9.5:1 on deepest, 8.5:1 on surface-raised — **AA** |
| Muted text | `#938CA6` (adjusted from the instruction's `#81798B`, which measured 4.33:1 on surface-raised — below the 4.5:1 AA text threshold) | 5.6–6.3:1 across all surfaces — **AA** |
| Antique gold (accent) | `#D0A45C` | 8.8:1 as text on deepest; dark-on-gold button text 8.8:1 — **AA** |
| Soft gold | `#E4C483` | 12.0:1 on deepest — **AA** |
| Deep violet | `#4E2B71` | used as a surface/background only (primary text on it: 9.7:1 — **AA**) |
| Accent violet | `#7650A3` | 3.1–3.3:1 — used only for focus rings / non-text UI accents (WCAG 1.4.11 non-text 3:1 threshold), never as body text on a plain background |
| Border subtle | `rgba(208,164,92,0.18)` | decorative, non-text |
| Border strong | `rgba(228,196,131,0.42)` | decorative, non-text |
| Focus ring | `rgba(228,196,131,0.75)` | decorative, non-text, high-visibility by design |
| Crisis surface | `#2A1416` | — |
| Crisis accent | `#F3A9A9` | verified AA on crisis surface |

Contrast ratios computed with the standard WCAG relative-luminance formula
(sRGB → linear → 0.2126/0.7152/0.0722 weighting), not eyeballed.

### 3.4 Typography

Existing decision kept: **Playfair Display** (headings) / **Inter** (body).
FAZ 1 is the first phase that actually loads them (`next/font/google`,
self-hosted at build time by Next.js, no runtime Google request, no new
npm dependency) — previously only the Tailwind `font-heading`/`font-body`
class names existed with no font actually wired in `layout.tsx`.

## 4. Component plan

FAZ 1 adds shell-only primitives. Screen-internal primitives
(`TopicCard`, `GuidancePrompt`, `FormField`, `StatusMessage`, `StepIndicator`,
`SafetyNote`, `CardArtworkPlaceholder`, etc.) are deferred to the phase that
actually redesigns that screen (FAZ 2–7), per the "don't redesign screen
internals in FAZ 1" instruction.

FAZ 1 introduces:
- `AppShell` — page-level frame: ambient background layer + centered content
  column + brand header slot. Wraps the existing `<main>` content; does not
  alter what is rendered inside it.
- `AmbientBackground` — CSS-only layered radial-gradient/vignette/grain,
  `aria-hidden`, fixed position, behind all content, disabled/simplified
  under `prefers-reduced-motion`.
- `BrandMark` — "Insight Engine" wordmark + "Sembolik yansıtma deneyimi"
  subtitle, quiet, non-interactive.

## 5. Existing component inventory (unchanged this phase)

`ConsentModal`, `QuestionForm`, `FramingReview`, `ShuffleReveal`,
`CardReveal`, `PatternArrival`, `ReadingResult`, `ReflectionClose`,
`CrisisNotice`, `ErrorNotice`, `DisclaimerFooter`, `DiagnosticBadge`,
`CardNarrationItem`. All inherit the new palette automatically through the
unchanged semantic class names (§3.1); none of their markup, copy, aria
attributes, or class names changes in this phase.

## 6. State machine (unchanged, documented for reference)

`src/app/page.tsx` owns a single `ViewState` union and is the only place
that calls `fetch()`:

```
consent -> compose -> previewing -> (crisis | framing | error)
framing --confirm--> reading -> (revealing -> pattern -> success? -> reflection | crisis | error)
framing --edit--> compose (prior input preserved)
```

Request payloads (must never change): preview = `{ question, topicHint? }`,
reading = `{ seed, question, topicHint? }`. No client-sent persona,
confidence, or safety flag exists anywhere in the component tree — verified
by reading every component in `src/components/*` and `src/app/page.tsx`.

## 7. Test-contract inventory (do not break)

Verified by reading every file in `src/__tests__/unit/*` that renders UI:

- Exact button/heading text asserted via `getByRole('button'|'heading', { name: ... })`:
  `'Devam Et'`, `'Anlıyorum'` (checkbox aria-label), `'Sorumu netleştir'`,
  `'Evet, böyle devam et'`, `'Sorumu düzenle'`, `'Geçmiş/Şimdi/Yön kartını aç'`,
  `'İçgörüyü gör'`, `'Bir soruyla tamamla'`, `'Kartların ayrıntılarını gör'`,
  `'Okumayı bir soruyla tamamla'`, `'Yeniden başla'`, `'Tekrar Dene'`,
  `'Kartlarını kendi hızında aç'`, `'Seni doğru mu anladım?'`,
  `'Üç kartın birlikte gösterdiği örüntü'`, `'Kendine bırakacağın soru'`,
  and any crisis/error heading text (which is server-supplied, rendered
  verbatim).
- `aria-label` values asserted directly: `question-form`, `topic-hint`,
  `soru-onerileri`, `framing-review`, `shuffle-loading`, `card-reveal`,
  `reveal-list`, `revealed-<id>`, `pattern-arrival`, `main-synthesis`,
  `supporting-cues`, `uncertainty-note`, `reading-result`, `persona-framing`,
  `card-list`, `card-<id>`, `detailed-synthesis`, `patterns`,
  `diagnostic-<kind>`, `result-disclaimer`, `reflection-close`,
  `reflection-question`, `crisis-resources`, `error-state`, `consent-modal`.
- Structural class assertion: `QuestionForm`'s topic-hint buttons must keep
  literal `min-h-[44px]` / `min-w-[44px]` substrings in `className`
  (`ui-components.test.tsx:120-124`, regex-matched).
- `prefers-reduced-motion` behavior on `ShuffleReveal`/`CardReveal`
  (transition class present/absent).
- Focus-on-mount behavior (`useFocusOnMount`) on every screen transition
  heading.

None of these are touched by FAZ 1 (FAZ 1 does not edit any file under
`src/components/`).

## 8. Files touched in FAZ 1

`src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (shell
wiring + metadata/brand text only — no state-machine change),
`tailwind.config.ts`, new `src/components/AppShell.tsx`,
`src/components/AmbientBackground.tsx`, `src/components/BrandMark.tsx`,
this document.

## 9. Files explicitly not touched (this phase and until FAZ 9 for cards)

`src/app/api/**`, `src/server/**` (reading engine, providers, crisis gate,
observability), `src/lib/persona-mapping.ts`, `src/lib/framing-presenter.ts`,
`src/lib/constitution-copy.ts`, `src/lib/card-display.ts`,
`src/components/*` (existing 13 components), `src/types/**`,
`src/__tests__/**`, `data/**`, `validation/**`, `scripts/**`, any
`asset/*` branch, any card registry/manifest.

## 10. Phases (roadmap, unchanged from the instruction)

FAZ 0 Audit (this doc) · FAZ 1 Design tokens + AppShell (this run) · FAZ 2
Consent/onboarding · FAZ 3 Question composition · FAZ 4 Framing/loading ·
FAZ 5 Card area (CSS placeholder, still no real art) · FAZ 6 Pattern/reading
typography · FAZ 7 Reflection close · FAZ 8 QA/polish · FAZ 9 Real card
asset integration (blocked on explicit user approval).

## 11. Accessibility criteria (FAZ 1 pass bar)

- No horizontal overflow at 375/390/768/1440px.
- Every interactive element keeps ≥44×44px hit targets (no regressions to
  existing `min-h/min-w-[44px]` classes).
- `:focus-visible` produces a visible, high-contrast ring
  (`--color-focus`, 0.75 alpha soft gold) on every interactive element,
  including inside `AppShell`.
- All new text/background pairs verified ≥4.5:1 (normal text) / ≥3:1
  (large text, non-text UI) per §3.3.
- `prefers-reduced-motion: reduce` continues to be honored; `AmbientBackground`
  has no motion regardless, and adds no new animated element.
- No change to any `aria-label`, heading text, or DOM structure that a test
  in §7 depends on.

## 12. Risks

1. **Governance deviation** (§0): visual work proceeds ahead of the
   documented live-eval Gate 2. Mitigated by keeping the change
   presentation-only and fully reversible; flagged here explicitly rather
   than silently overridden.
2. **Palette divergence**: this document's hex values differ from
   `VISUAL_SYSTEM_v0.1.md`'s draft dark palette. `VISUAL_SYSTEM_v0.1.md` is
   left unmodified as a record; a future reader must consult this file
   (§3.3) as the applied source of truth, not that one.
3. **Muted-text value adjusted**: the instruction's literal `#81798B` fails
   AA (4.33:1) on the darkest raised surface; `#938CA6` is substituted. If
   the product owner has an exact-hex brand requirement, this needs
   sign-off.
4. **Crisis token restyle**: `crisis.surface`/`crisis.accent` values change
   in this phase (component/logic untouched) so the crisis screen doesn't
   visually clash with the new dark shell; this is a judgment call beyond
   the literal FAZ 1 file list and should be confirmed by the product owner
   in review.
5. **Font loading via `next/font/google`** fetches font files from Google's
   CDN at build time. Confirmed reachable from this environment; if a
   future CI/build environment blocks that host, the build will need
   self-hosted font files instead.
