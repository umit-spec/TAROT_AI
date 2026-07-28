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

---

## 13. FAZ 2 — Consent & Onboarding (record)

### 13.1 Behavior fix (not a visual change)

`src/app/page.tsx` wired both `ConsentModal.onAccept` and `onDecline` to the
same `{ status: 'compose' }` transition, so pressing "Çıkış" silently
bypassed the "Anlıyorum" checkbox requirement. Fixed by adding a `declined`
`ViewState` and a `ConsentDeclined` screen. Declining now reaches a screen
with no `QuestionForm`, no `fetch` call, and no path into the reading flow;
the only way back is "Kararımı değiştir", which returns to `consent` (not
directly to `compose` - the checkbox requirement applies again). Covered by
4 new `HomePage` integration tests in `page-flow.test.tsx`.

### 13.2 Also fixed: a WCAG-AA regression from FAZ 1

While rebuilding `ConsentModal`, contrast-checked every `bg-accent` button
and found `text-white` (used on 6 pre-existing buttons across
`ConsentModal`, `QuestionForm`, `FramingReview`, `CardReveal`,
`PatternArrival`, `ReadingResult`) measures **~2.0-2.3:1** against the new
gold `accent` token - well under the 4.5:1 AA floor. This was a defect in
FAZ 1 (the old gray `accent` made white text safe; gold does not), not
something introduced by FAZ 2's copy or logic. Fixed by swapping
`text-white` → `text-background` (`#07060B` on gold = 8.8:1) on all 6
buttons - a one-class value swap per line, no structural/copy/test change,
verified no test asserts `text-white`. This technically touches
`QuestionForm.tsx`, `CardReveal.tsx`, `PatternArrival.tsx`, and
`ReadingResult.tsx`, which FAZ 2's file-boundary list marks "don't touch
unless necessary" - judged necessary because it corrects a false AA claim
already reported as PASS for FAZ 1, and the fix carries no behavioral risk.

### 13.3 What changed

- `src/components/ConsentModal.tsx` - full presentational rewrite. Exact
  `CONSENT_MODAL_COPY` text preserved verbatim (title, intro, both list
  headings/items, checkbox/accept/decline labels). `aria-label="consent-modal"`
  preserved exactly (kept as the stable accessible name, matching every other
  screen's `aria-label` test-hook convention in this app) rather than adding
  a competing `aria-labelledby`, which would silently override it per the
  ARIA naming precedence rules. Added `aria-describedby` (intro paragraph),
  a real `role="dialog"` on the panel itself (previously on the full-screen
  backdrop), Tab/Shift+Tab focus containment, Escape-to-decline, background
  scroll lock while open (via `useDialogFocus`), and heading-focus-on-mount
  (via the existing `useFocusOnMount`, matching every other screen
  transition in the app).
- `src/hooks/useDialogFocus.ts` (new) - small, dialog-specific focus trap +
  Escape + scroll-lock hook; no external focus-trap dependency added. Not
  built as a general design-system primitive - `ConsentModal` is the only
  caller, but the `containerRef` contract is generic enough to reuse.
- `src/components/ConsentDeclined.tsx` (new) - the decline destination
  (§13.1).
- `src/app/page.tsx` - `declined` state + wiring only.
- Native checkbox semantics preserved (`<input type="checkbox">` in the DOM,
  Space-toggleable, real `checked` state) - only styled via `accent-color`.
- Responsive dialog: mobile (`<640px`) renders as a bottom-anchored sheet
  (`items-end`, top-rounded only, `max-h-[88vh]` + internal scroll,
  `env(safe-area-inset-bottom)` padding); `sm:` and up renders centered,
  `max-w-xl`, fully rounded, with a blurred backdrop
  (`bg-background/80 backdrop-blur-sm`).
- Entrance animation: single 220ms opacity/translate settle
  (`.consent-modal__panel`, `globals.css`), removed entirely under
  `prefers-reduced-motion: reduce`.
- List items for "YAPILMAZ"/"NASIL KULLANILIR" use a small neutral gold/violet
  dot marker instead of default browser bullets - deliberately the *same*
  calm marker style for both lists (not red/alarm styling for "YAPILMAZ"),
  per the "don't turn this into an alarm screen" instruction.
- Primary/secondary CTA hierarchy: `flex-col-reverse` (mobile: primary on
  top) / `sm:flex-row` (desktop: secondary left, primary right) - a
  CSS-only reordering, no JS breakpoint logic.
- Disabled "Devam Et" is styled explicitly (`bg-surface-interactive` +
  `border-border-subtle` + `text-foreground-muted`) rather than just a faded
  gold, so it reads as inert rather than as a dim/hover-active gold button.

### 13.4 Not created

`Surface.tsx` / `PrimaryButton.tsx` / `SecondaryButton.tsx` were on the
allowed-if-needed list but not created - `ConsentModal`/`ConsentDeclined`
inline their button classes, consistent with how every other existing
screen component in this codebase already does it (no shared button
primitive exists yet anywhere). Introducing one now, usable only by these
two components, would be exactly the "abstract design system used only by
ConsentModal" the instruction says not to build.

### 13.5 Tests added

- `ui-components.test.tsx`: heading focus-on-mount, dialog aria
  relationships (`role`, `aria-modal`, `aria-label`, `aria-describedby`
  resolving to the intro text), Decline calls `onDecline` only, Escape
  calls `onDecline`, checkbox is Space-toggleable, Tab wraps within the
  dialog (checkbox ↔ decline while accept is disabled), 44×44px minimum
  targets on both buttons.
- `page-flow.test.tsx`: accept → compose, decline → declined (not compose),
  declined renders no `QuestionForm` and makes no `fetch` call, "Kararımı
  değiştir" → `consent` (re-entering still requires the checkbox, no
  automatic compose).
- Total: 329 (FAZ 1 baseline) + 4 (decline fix) + 7 (ConsentModal a11y) =
  **340/340 passing.**

### 13.6 Viewport QA (Playwright, real browser, not simulated)

375×812, 390×844, 768×1024, 1440×900, each in three states (unchecked,
checked, declined), plus a dedicated Escape→declined check per breakpoint:
no horizontal overflow in any state/breakpoint, Escape reaches the declined
screen on every breakpoint, no new console errors (the one pre-existing
`favicon.ico` 404 predates this branch and is unrelated to consent).

## 14. FAZ 2.1 — Consent Accessibility & Visual Polish Patch (record)

Two defects found in FAZ 2 review, both real and independently reproduced
before fixing:

### 14.1 Non-interactive heading showed an interactive-looking focus ring

`useFocusOnMount` moves real focus to the `<h2>` on mount (`tabIndex={-1}`),
which is correct and unchanged. But FAZ 1's global `:focus-visible { outline:
... }` rule then drew the same gold rectangle around that heading as around
a real control, reading as a stray form field rather than a screen
transition. Fixed with `focus-visible:outline-none` on the heading only -
scoped to `ConsentModal`, per this patch's file boundary. **Not fixed
elsewhere**: `FramingReview`, `PatternArrival`, `CardReveal`, `CrisisNotice`,
`ErrorNotice`, and `ReflectionClose` headings use the identical
`useFocusOnMount` + `tabIndex={-1}` pattern and will show the same ring once
their transitions are screenshotted - flagged here as a follow-up for
whichever phase next touches each of those files, not fixed now (out of
this patch's scope).

Verified with `getComputedStyle(document.activeElement)` at the instant the
heading holds real focus, not after focus moved away (a naive check that
only reads `outlineStyle` is misleading here: Tailwind's `outline-none`
keeps `outline-style: solid` for the high-contrast-mode fallback and relies
on `outline-color: transparent` for the actual visual suppression - the
correct check is that the rendered ring is invisible, confirmed by
screenshot).

### 14.2 Dialog accessible name was a test-hook string, not real content

`aria-label="consent-modal"` was preserved from FAZ 2 §4's literal
instruction, but a screen reader announces that string as the dialog's
name, not "Tarot Nedir?" - meaningless to a real user. Replaced with
`aria-labelledby` pointing at the (now `id`-bearing) heading, `aria-label`
removed, and `data-testid="consent-modal"` added so the prior
test-hook role moves to a dedicated attribute instead of overloading ARIA.
`page-flow.test.tsx` and `ui-components.test.tsx` now query
`getByRole('dialog', { name: CONSENT_MODAL_COPY.title })` instead of
`getByLabelText('consent-modal')`.

### 14.3 Tab order didn't match visual order once both buttons were enabled

The FAZ 2 button row used `flex-col-reverse` (mobile) / `flex-row`
(desktop) with DOM order `[Decline, Accept]` to get "Accept visually on
top" on mobile while keeping "Decline left / Accept right" on desktop. That
CSS trick decoupled Tab order from visual order: Tab always visited Decline
before Accept, regardless of which one actually appeared first on screen.
Fixed by making DOM order match visual order everywhere instead - no
reversal at all: `[Accept, Decline]` in the DOM, plain `flex-col` /
`sm:flex-row`. Tab now reliably goes checkbox → Accept → Decline → checkbox
(and reverse) on every breakpoint, verified by a new dynamic test.

**Visible side effect**: this flips the desktop button order - "Devam Et"
is now on the left, "Çıkış" on the right (previously the reverse). No
instruction protected the prior desktop arrangement once the tab-order
requirement was explicit, and a mismatch between visual and Tab order on
any single breakpoint was judged worse than a symmetric, fully consistent
order everywhere. Screenshotted and reported for the product owner to
confirm or reject.

### 14.4 Tests

New: `ui-components.test.tsx` - dynamic checked-state Tab cycle
(checkbox → Accept → Decline → checkbox, forward and Shift+Tab reverse).
Updated (not counted as new): the aria-relationship test now asserts
`getByRole('dialog', { name: CONSENT_MODAL_COPY.title })` and
`data-testid="consent-modal"` instead of the old `aria-label` assertion.
Total: 340 (FAZ 2 baseline) + 1 = **341/341 passing.**

### 14.5 Viewport QA (375×812, 390×844)

Confirmed via Playwright in a real browser: dialog's `aria-labelledby`
target resolves to "Tarot Nedir?"; heading shows no visible ring while
holding real focus (screenshot-verified); checkbox and "Devam Et" both show
a clear gold ring when keyboard-focused; Escape reaches `declined` on both
sizes; no horizontal overflow in any state; no new console errors.

## 15. FAZ 3 — Question Compose (record)

### 15.1 What changed

`src/components/QuestionForm.tsx` - full presentational rewrite inside one
editorial surface (`rounded-[28px] border-border-subtle bg-surface-raised/60`),
matching the FAZ 2 pattern of one main surface rather than a card-per-section
layout:

- New screen-entry block: eyebrow ("Niyetini belirle"), `h2` heading ("Bugün
  neye bakmak istersin?"), supporting copy. UI-only text, never sent in the
  payload.
- Focus now branches on `autoFocus` (a prop `page.tsx` already passes
  unchanged): `autoFocus=false` (first compose entry) focuses the new
  heading; `autoFocus=true` (return from framing/error) still focuses the
  textarea, exactly as before. `page.tsx` itself was not touched - the
  existing wiring already expresses "first entry vs. return" via that one
  prop.
- The heading is `tabIndex={-1}` + `focus-visible:outline-none`, the same
  fix as ConsentModal's heading (FAZ 2.1 §14.1), applied here from the
  start since this is a new instance of the same pattern, not a retrofit.
- Topic buttons became a `grid grid-cols-1 sm:grid-cols-3` of cards (single
  column below 640px so the hint sentences don't wrap awkwardly at
  375-390px); selected state adds a border + low-opacity violet surface +
  a decorative gold checkmark (`aria-hidden`, `aria-pressed` still carries
  the state for AT). `aria-label`, `aria-pressed`, `aria-describedby`, and
  the literal `min-h-[44px] min-w-[44px]` classes are all unchanged.
- Guidance prompts became bordered cards with a CSS `::after`-generated `+`
  mark - **not** a DOM text node, specifically because a first attempt using
  a real `<span>+</span>` broke the anti-prophecy copy test (`toMatch(/\?$/)`
  on `button.textContent`, which a literal `+` character after the `?`
  fails). `aria-label` format (`${example} — soruna ekle`) unchanged.
- Textarea: `rows={4}` (was 3), `text-base` (16px, avoids iOS auto-zoom),
  explicit `placeholder:text-foreground-muted` (was relying on browser
  default, which can render illegibly light on a dark surface),
  `bg-surface-raised` + `border-border-subtle` + `focus:border-border-strong`.
  No autosize library added - a fixed `min-h-[8rem]` + `resize-y` was judged
  lower-risk (no cursor-jump/measurement edge cases), matching the
  instruction's explicit fallback permission.
- The reflection-guidance note became a small bordered panel (gold left
  accent, low-opacity violet background) instead of a bare muted paragraph.
  Text unchanged.
- Primary CTA: `min-h-[52px]` (was 44, still ≥44 everywhere else), full
  width on mobile / auto on `sm:`, `motion-safe:active:scale-[0.98]` for
  tactile press feedback that fully disables under `prefers-reduced-motion`
  via Tailwind's built-in `motion-safe:` variant (no JS, no new prop).

### 15.2 Payload, validation, and behavior contracts - unchanged

`onSubmit({ question, topicHint })` is exactly the same call, from the same
state, with the same shape - verified by the existing payload-shape tests
plus a new one (§15.3). No `required` attribute was added to the textarea,
no client-side validation blocks submission, and the CTA is never disabled
by an empty question - only by the `disabled` prop (loading). Topic
toggle-off-on-reclick, scaffold non-destructive insert, and
`initialQuestion`/`initialTopicHint`/`autoFocus` all use the exact same
state and effects as before this rewrite - only the JSX changed.

### 15.3 Tests added

- Heading focuses on first entry (`autoFocus=false`) and carries
  `focus-visible:outline-none` in its class list.
- A topic selected alone (no question text) still submits
  `{ question: '', topicHint: 'self' }` - the empty-submission guarantee
  holds for the topic-only path specifically, not just the fully-empty case
  already covered.
- Total: 341 (FAZ 2.1 baseline) + 3 = **344/344 passing.**

### 15.4 Viewport QA (Playwright, real browser)

375×812, 390×844, 768×1024, 1440×900, four states each (empty; topic +
guidance-prompt insert + typed addition; an edit-return visual proxy -
typed text + topic + textarea focus, since driving the real preview API in
this sandbox wasn't in scope - the actual `initialQuestion`/`autoFocus`
wiring is covered by unit tests, not this screenshot; and a genuinely
in-flight loading state captured by delaying the `/api/readings/preview`
response 4s via route interception). No horizontal overflow in any
cell, no new console errors, disabled/loading state visibly inert with
"Netleştiriliyor..." shown, non-destructive scaffold insertion confirmed
visually (existing text preserved, blank line, new text appended).

### 15.5 Not touched

`src/app/page.tsx` was not touched - `autoFocus`'s existing value (`true`
only when returning with prior input) already expressed exactly the
distinction this phase needed. `ConsentModal`, `ConsentDeclined`,
`useDialogFocus`, and all reading-flow screens (`FramingReview`,
`CardReveal`, `PatternArrival`, `ReadingResult`, `ReflectionClose`,
`CrisisNotice`, `ErrorNotice`) are unchanged - the focus-ring-on-heading
fix from FAZ 2.1 §14.1 still applies only to `ConsentModal` and (as of this
phase) `QuestionForm`; the other six screens remain open follow-up items
for whichever phase next touches each file.

## 16. FAZ 4 — Framing Review & Loading States (record)

### 16.1 What changed

Three surfaces, all presentation-only on top of the unchanged
`compose → previewing → framing → reading → revealing` flow:

- **`src/components/FramingLoading.tsx`** (new) - replaces the bare
  `<p role="status" aria-label="preview-loading">Sorun çerçeveleniyor...</p>`
  that used to sit under `QuestionForm` during `previewing`. Same visible
  copy, same position (directly under the still-visible, now
  `aria-busy="true"` form), now `role="status"` +
  `aria-live="polite"` + `aria-atomic="true"` + `aria-busy="true"` +
  `data-testid="preview-loading"` (the old `aria-label="preview-loading"`
  was a test-hook string, not a real accessible name - a screen reader has
  no use for the English word "preview" spoken aloud).
- **`src/components/ShuffleReveal.tsx`** - same `{ isLoading, reducedMotion }`
  contract, still returns `null` when not loading, still has no `cards` prop
  and cannot reference card data. Rebuilt as a calm centered panel (eyebrow
  "Okumaya hazırlanıyor", the unchanged "Kartlar karılıyor..." status, and
  new supporting copy). `aria-label="shuffle-loading"` (test-hook) replaced
  by `data-testid="shuffle-loading"` + the same live-region attributes as
  `FramingLoading`. The outer container's `transition-opacity duration-shuffle`
  class pair - the exact thing the two pre-existing reduced-motion tests
  assert on - was left byte-for-byte in place; only the test's *query*
  changed (`getByLabelText` → `getByTestId`), not the assertion.
- **`src/components/FramingReview.tsx`** - full presentational rewrite.
  `aria-label="framing-review"` replaced by `role="region"` +
  `aria-labelledby={headingId}` (heading text "Seni doğru mu anladım?" is
  now the actual accessible name) + `data-testid="framing-review"` for the
  test-hook role, mirroring the ConsentModal precedent (FAZ 2.1 §14.2). The
  heading keeps `tabIndex={-1}` + focus-on-mount + `focus-visible:outline-none`
  (FAZ 2.1 §14.1's fix, applied here from the start). `dl`/`dt`/`dd`
  structure kept exactly (topic label as a small pill inside `dd`,
  reflectiveFocus as a larger gold-accented panel inside `dd`) - no div-soup
  replacement. Confirm/Edit stayed in the same DOM order they already had
  (Confirm first) with no `flex-*-reverse`/`order` trick, so Tab order and
  visual order agree on every breakpoint (the exact bug class fixed for
  ConsentModal in FAZ 2.1 §14.3, avoided here from the start instead of
  needing a follow-up patch).
- **`src/components/LoadingMark.tsx`** (new) - the one small shared
  primitive the phase's component-boundary section explicitly allowed
  ("genuinely used by both loading surfaces"): three dots, `aria-hidden`,
  gated on a required `reducedMotion: boolean` prop (not a bare CSS
  `@media` query) specifically so unit tests can assert the reduced-motion
  behavior without a real `matchMedia` - jsdom's `matchMedia` is stubbed to
  "no match" in `src/__tests__/setup.ts`, so a CSS-only approach would be
  untestable here, and the two loading surfaces already receive
  `reducedMotion` as a prop from `page.tsx`'s existing `matchMedia`
  listener. `globals.css` still carries a `@media (prefers-reduced-motion)`
  rule for the same class as defense-in-depth for any future caller that
  forgets to pass the prop.
- **`src/app/page.tsx`** - two lines: the `FramingLoading` import, and
  swapping the bare paragraph for `<FramingLoading reducedMotion={reducedMotion} />`.
  No state, handler, endpoint, or branching logic touched.
- **`src/components/QuestionForm.tsx`** - one attribute:
  `aria-busy={disabled}` on the `<form>`, the one change this phase's file
  boundary explicitly pre-authorized.

### 16.2 Flow and payload contracts - unchanged

`handleCompose`/`handleConfirm`, the `/api/readings/preview` and
`/api/readings` calls, the crisis/error branches, and "Sorumu düzenle"'s
edit-return (prior question/topic preserved) are byte-for-byte the same
code - verified by two new integration tests that hold a controlled,
unresolved fetch Promise open and assert the *live* mid-flight DOM (not a
timer), then resolve it and assert the transition happens with no
artificial delay (§16.3).

### 16.3 Tests added

- `ShuffleReveal`: live-region attributes (`role`, `aria-live`,
  `aria-atomic`, `aria-busy`) + exact copy; no card identity/name/count in
  its text (it cannot have any - no `cards` prop exists); reduced-motion
  drops the `.loading-mark__dot` class entirely (checked via
  `querySelectorAll`, not just a substring match).
- `FramingLoading`: the same three assertions (live-region attributes +
  copy, no fabricated progress language, reduced-motion class drop).
- `FramingReview`: DOM/Tab order Confirm-before-Edit; `disabled` makes both
  buttons inert; both keep ≥44px targets (Confirm's intentional 52px
  height distinguished from Edit's 44px, not conflated into one assertion);
  a 180+ character stress string renders inside a `break-words` surface;
  heading is `tabIndex={-1}` with `focus-visible:outline-none`.
- `page-flow.test.tsx`: while the preview request is genuinely in flight
  (a held-open Promise, not a timer), `QuestionForm` stays mounted,
  `aria-busy="true"`, textarea disabled, and `FramingLoading`'s live-region
  attributes and copy are all present, with no framing region yet;
  resolving the Promise (not waiting out a delay) is what moves the state
  on. A parallel test does the same for the reading/`ShuffleReveal` stage.
- Total: 344 (FAZ 3 baseline) + 13 = **357/357 passing.**

### 16.4 Viewport QA (Playwright, real browser, real routes)

375×812, 390×844, 768×1024, 1440×900 × five states: (A) preview loading
with the `/api/readings/preview` route delayed 3s via Playwright route
interception; (B) a normal framing response; (C) a stress framing response
(topic label long enough to wrap, reflectiveFocus over 180 characters); (D)
reading loading with `/api/readings` delayed 3s; (E) reading loading with
`page.emulateMedia({ reducedMotion: 'reduce' })`, verified by asserting
`.loading-mark__dot` count is 0 in the live DOM, not just eyeballing a
screenshot. All 20 cells: no horizontal overflow, no new console errors,
long text wraps inside its bordered panel without escaping, both loading
surfaces show the calm dot mark with no card shape/silhouette/percentage/
countdown anywhere.

### 16.5 Not touched

`CardReveal`, `PatternArrival`, `ReadingResult`, `ReflectionClose`,
`CrisisNotice`, `ErrorNotice`, `ConsentModal`, `ConsentDeclined`,
`useDialogFocus`, and every file under `src/app/api/**` / `src/server/**`
are unchanged. No card artwork or card placeholder was introduced - FAZ 5
is still the first phase to touch card-shaped surfaces.

## 17. FAZ 5 — Card Field & Reveal Shell (record)

**Gerçek kart görselleri eklenmedi; kart yüzeyleri yalnız CSS tabanlı
CardArtworkPlaceholder kullanıyor.**

### 17.1 What changed

- **`src/components/CardArtworkPlaceholder.tsx`** (new) - a CSS-only,
  deliberately abstract `aspect-[2/3]` shell in three states
  (`locked`/`current`/`revealed`). Every closed card (locked or current)
  renders *identically* regardless of which card it actually is - a
  neutral eight-pointed-star mark, gold/violet gradient, thin antique-gold
  border, a second inset border ring, a static low-opacity radial glow, two
  small decorative lines. No suit symbols, no per-card iconography, no
  raster asset, no `<img>`/`next/image`. Only the `revealed` state's face
  shows text, and that text is always `cardDisplayName(cardId)` - the same
  governed registry `CardNarrationItem`/the old `CardReveal` already used,
  unchanged, still falling back to the neutral `"Kart"` string for an
  unknown id, never the raw id.
- **`src/components/CardReveal.tsx`** - full presentational rewrite,
  identical `{ cards, reducedMotion, onContinue }` contract. Sequence
  authority is unchanged: `cards` array order is the only order, exactly
  one card (`i === revealed`) is ever a button, everything after it is an
  `aria-hidden`, non-focusable, non-button `<li>`, and `onContinue` is
  reachable only once `revealed >= cards.length`. `aria-label="card-reveal"`
  → `role="region"` + `aria-labelledby` (mirrors FramingReview/ConsentModal);
  `aria-label="reveal-list"` → `aria-label="Üç kartlık açılım"` (a real
  name, not a test-hook) + `data-testid="reveal-list"`; the revealed item's
  `aria-label={`revealed-${id}`}` (which put a raw card id into the
  accessible name) → `data-testid` only, since a screen reader has no use
  for hearing an internal id spoken.
- **Real progress**, not a game meter: a three-segment gold-fill line plus
  literal `"{revealed} / {cards.length} kart açıldı"` text - both update
  from the same `revealed` state already driving the sequence, no separate
  source of truth.
- **Live-region announcement upgraded**: from the old terse
  `"Geçmiş kartı açıldı (1/3)"` to
  `"Geçmiş kartı açıldı: Deli. 3 karttan 1'i açık."` - governed display
  name + position + real progress, per the FAZ 5 instruction's example
  format. This changed the exact string the pre-existing live-region test
  asserted on, so that assertion was updated to match (not loosened - it
  still asserts an exact string, just a richer one).
- **Focus progression** (new): after the heading's own focus-on-mount
  (guarded by an `isFirstRender` ref so the two mount-time effects don't
  fight over focus), each reveal moves focus to the next actionable
  target - the next card's open button, or the `İçgörüyü gör` gate once
  `allRevealed` - via two refs and one `useEffect` keyed on `revealed`.
  Verified in both jsdom (unit tests) and a real browser (`document.activeElement`
  after the third reveal, §17.4).
- **Reveal motion**: a single 280ms opacity + small `rotateY` + scale
  settle (`.card-artwork__reveal`, `globals.css`) applied to the
  `CardArtworkPlaceholder` only when it mounts in the `revealed` state with
  `reducedMotion === false` - a fresh DOM mount each time (the wrapping
  element changes from `<button>` to `<div>` on reveal, so this is always a
  genuine new mount, never a replayed/restarted animation). Reduced motion
  drops the class entirely; verified by asserting its absence via
  `querySelector`, not by eyeballing a screenshot.
- **Layout**: `grid grid-cols-3` on the `<ol>` at every breakpoint (a
  three-card spread reads correctly even at 375px with `gap-2`/`sm:gap-4`);
  no `order`/`flex-reverse` trick anywhere, so DOM order and visual order
  are identical (Geçmiş → Şimdi → Yön, always).

### 17.2 Data and sequence contracts - unchanged

No sort/reorder/redraw/shuffle logic exists anywhere in the new file (same
as before - this was never here). `orientation` stays `'upright'`-only,
untouched, un-displayed (no new "Düz" label was added - the instruction
explicitly said this isn't required). The internal `future` position value
is never renamed; only its Turkish display label ("Yön") is shown, exactly
as before.

### 17.3 Tests added

`card-reveal.test.tsx`: unknown-id fallback (`"Kart"`, never the raw id);
locked cards carry no card identity in the DOM and can't be Tab-reached;
region accessible name is the heading text; heading has no
focus-visible ring; focus moves to the next reveal button after each of the
first two reveals and to the continue gate after the third; full keyboard
(Enter) reveal sequence; upgraded live-region text; reduced-motion
class-presence assertions (via `querySelector`, not a screenshot);
`aspect-[2/3]` contract present on all three card faces; 3-column grid;
44×44px minimum on the current reveal button; no `<img>` anywhere.
`page-flow.test.tsx`: all `card-reveal`/`revealed-*` queries migrated to
the same region/testid pattern; no new integration test was added because
the existing "reveal gates the interpretation" and pattern-arrival tests
already exercise the full consent → question → framing → reading →
CardReveal → Pattern path end-to-end with the real component (Section 20's
requirement was already met before this phase, confirmed by re-running that
existing suite against the rewritten component). Total: 357 (FAZ 4
baseline) + 12 = **369/369 passing.**

### 17.4 Viewport QA (Playwright, real browser, real routes)

375×812, 390×844, 768×1024, 1440×900 × states A (0/3) through D (3/3,
continue gate present) + E (reduced motion, same sequence, verified
`.card-artwork__reveal` count is 0 via `page.locator(...).count()`), plus a
dedicated stress case (the longest real display name, "Kaderin Tekerleği",
alongside an unknown-id card that must fall back to "Kart") at 375px. 21
cells total: no horizontal overflow anywhere, no console errors, long
names wrap inside their card face without breaking the grid, the unknown
id never leaks into the DOM, and a real-browser check after the third
reveal confirms `document.activeElement` is the "İçgörüyü gör" button
(not just asserted in jsdom).

### 17.5 Not touched

`PatternArrival`, `ReadingResult`, `ReflectionClose`, `CrisisNotice`,
`ErrorNotice`, `ConsentModal`, `ConsentDeclined`, `useDialogFocus`,
`QuestionForm`, `FramingReview`, `FramingLoading`, `LoadingMark`,
`ShuffleReveal`, `src/app/page.tsx`, and every file under
`src/app/api/**` / `src/server/**` are unchanged. No card meaning,
interpretation text, or symbolic content was added to `CardReveal` - it
still only ever shows a position and a governed display name.

## 18. FAZ 6 — Pattern & Reading Editorial Experience (record)

**Gerçek kart görselleri eklenmedi; FAZ 6 yalnız metin ve editorial okuma
yüzeylerini düzenledi.**

### 18.1 What changed

Five components, all presentation-only on top of the unchanged governed
data contracts:

- **`PatternArrival.tsx`** - full rewrite. `aria-label="pattern-arrival"` →
  `role="region"` + `aria-labelledby` (accessible name is now the real
  heading, mirroring every prior screen migration). `practicalReflection`
  is now visually the strongest element (gold-accented panel, 18–20px
  mobile / 20–24px desktop, `leading-[1.6]`), `patterns` render as a plain
  equal-weight list under a visible "Destekleyen ipuçları" heading,
  `uncertaintyNotice` moved into an `<aside>` labelled "Sınır notu" instead
  of an italic paragraph. `main-synthesis`/`supporting-cues`/`uncertainty-note`
  test-hook `aria-label`s all became `data-testid`. CTA order is unchanged
  in the DOM (Confirm-equivalent "Bir soruyla tamamla" before "Kartların
  ayrıntılarını gör") - no reversal trick was ever present here to begin
  with, so this phase didn't need the FAZ 2.1-style follow-up fix.
- **`ReadingResult.tsx`** - full rewrite, same props. Gained a real visible
  heading ("Kartların ayrıntılı okuması") it never had before, with
  focus-on-mount (previously nothing focused when this screen appeared).
  `aria-label="reading-result"` → `role="region"` + `aria-labelledby`.
  `persona-framing`/`card-list`/`detailed-synthesis`/`patterns` test-hook
  `aria-label`s → `data-testid`. Heading hierarchy is now real: h2 (screen)
  → h3 ("Kartların anlattığı", "Bütünsel değerlendirme") → h4
  ("Destekleyen ipuçları" inside the synthesis section). The repeated
  governed fields (`practicalReflection`/`patterns`/`uncertaintyNotice`,
  same content as PatternArrival) are visually de-emphasized here relative
  to the per-card narration - satisfying "don't hide or drop repeated
  content" (§12) while making this screen read as a different weighting,
  not a copy of the pattern screen.
- **`CardNarrationItem.tsx`** - gained a required `index: number` prop
  purely for an identity-free test hook (`data-testid="card-narration-{i}"`);
  `aria-label={`card-${cardId}`}` (which put a raw card id into an
  accessible name) removed entirely. Desktop layout is now a
  `sm:grid-cols-[8rem_minmax(0,1fr)]` identity-rail + content split
  (position + name narrow left, narrative wide right), single column below
  `sm:`. `narration.symbolicMeaning` is not a prop path on this component -
  not hidden, not `sr-only`, not a data attribute, simply never read.
- **`DiagnosticBadge.tsx`** - `aria-label={`diagnostic-${kind}`}` →
  `data-testid`; copy and the `DiagnosticBadgeKind` enum unchanged.
  `ReadingResult` now wraps one-or-more badges in a single "Okuma durumu"
  `<aside>` when any diagnostic condition is true (§13's optional
  recommendation), instead of three independently-styled pill badges.
- **`DisclaimerFooter.tsx`** - `aria-label="result-disclaimer"` →
  `aria-labelledby` pointing at the existing visible "Hatırlatma" heading
  (now given a stable `id` via `useId`) + `data-testid` for the hook. Four
  lines, exact text, unchanged order.

### 18.2 Content and matching contracts - unchanged

`cards[i]` ↔ `interpretation.cards[i]` pairing is still a straight
array-index read with no sort/join/re-key logic anywhere - verified by a
new dedicated test file (§18.3) that asserts index 0/1/2 map to the correct
governed display name AND the correct `relevanceToQuestion`/`reflection`
text simultaneously (proving both order *and* identity, not just one).
`narration.symbolicMeaning` was checked against three governed fixture
values containing a distinctive marker string and confirmed absent from
both `textContent` and `innerHTML` of the whole `ReadingResult` region -
not just "not visibly rendered" but genuinely never written to the DOM.

### 18.3 Tests added

New file `reading-result.test.tsx` (27 tests, since `ReadingResult` had no
prior dedicated unit-test file - all its coverage used to be indirect, via
`page-flow.test.tsx` integration): structure/region-name/focus, card
order+index+identity pairing, unknown-id fallback, raw-id absence (text
*and* HTML), `symbolicMeaning` absence (text *and* HTML), synthesis
section, the full diagnostics matrix (resolved/partial/fallback/mock, and
that raw `providerUsed`/`safetyFlags` never leak), disclaimer exact text +
accessible name, `onComplete` present/absent, a plain-text security test
(a literal `<script>` string fixture renders as inert text - confirmed via
`document.querySelectorAll('script').length === 0` and that the script's
side effect never ran, not just that the text is visible), and a
long-text stress fixture across every governed field at once. 4 new tests
added to `pattern-arrival.test.tsx` (empty-opening, Tab order, touch
targets, long-text stress). `ui-components.test.tsx` and `page-flow.test.tsx`
had every `aria-label`/`getByLabelText` reference to these five components
migrated to the matching `role`+name or `data-testid` query - no assertion
was loosened, only the query mechanism changed. No new HomePage-level
integration test was added for the two closing paths (Yol A/B, FAZ 6 §24)
because `page-flow.test.tsx` already had full coverage of both before this
phase (pattern → complete → reflection, and pattern → details → complete
→ reflection) - re-confirmed passing against the rewritten components.
Total: 369 (FAZ 5 baseline) + 33 = **402/402 passing.**

### 18.4 Viewport QA (Playwright, real browser, real routes)

375×812, 390×844, 768×1024, 1440×900 × five states: (A) a normal pattern
screen; (B) empty patterns (no supporting-cues section rendered); (C) a
pattern-screen long-text stress fixture; (D) the reading-result screen
combined-stress case (an unknown card id → "Kart" fallback, one very long
`relevanceToQuestion`/`reflection` pair, `knowledge.status: 'partial'`,
and `provider: 'mock'` all at once, to see the worst realistic combination
in one screen); (E) a clean reading-result screen with no diagnostics. 20
cells: no horizontal overflow anywhere, no console errors, the unknown id
never leaked into visible text, long text wrapped inside its surface
without breaking the card grid or identity rail, and the diagnostics
panel read as calm status text, not an error banner.

### 18.5 Not touched

`ReflectionClose`, `CrisisNotice`, `ErrorNotice`, `ConsentModal`,
`ConsentDeclined`, `useDialogFocus`, `QuestionForm`, `FramingReview`,
`FramingLoading`, `LoadingMark`, `ShuffleReveal`, `CardReveal`,
`CardArtworkPlaceholder`, `src/app/page.tsx`, and every file under
`src/app/api/**` / `src/server/**` are unchanged. No `dangerouslySetInnerHTML`,
markdown renderer, or HTML-parsing code was introduced anywhere - every
governed string still goes through plain JSX text interpolation, which is
what the new script-fixture test exists to prove rather than assume.

## 19. FAZ 7 — Reflection Close Experience (record)

**Gerçek kart görselleri entegre edilmedi; asset/06-full-tarot-deck-v2
branch'i bu fazda merge edilmedi. FAZ 7 yalnız oturumun kapanış ekranını
düzenledi.**

### 19.1 What changed

One component, presentation-only, same two-prop contract it has always had:

- **`ReflectionClose.tsx`** - full rewrite. Prop contract unchanged:
  `{ reflectionPrompt: string; onRestart: () => void }` - no new prop was
  added, and none of the explicitly forbidden ones (interpretation, cards,
  provider, persona, confidence, safetyFlags, save/share/journal callbacks)
  exist on this component. `aria-label="reflection-close"` →
  `role="region"` + `aria-labelledby` (pointing at the real visible
  heading, `useId`-generated) + `data-testid="reflection-close"`, mirroring
  every prior screen migration. `aria-label="reflection-question"` →
  `data-testid="reflection-question"` alone (the question paragraph carries
  no accessible-name attribute of its own - it's read as part of the
  region's flow, not announced as a landmark). One small addition allowed
  by the brief: a quiet eyebrow line ("Okumanın sonu") above the heading.
  Everything else - "Kendine bırakacağın soru" heading, "Yanıtlamak
  zorunda değilsin. Bu soruyu yanında taşıman yeterli." support line,
  "Yeniden başla" button text - is byte-for-byte the same copy as before
  this phase. `reflectionPrompt` is still rendered as a single unwrapped
  `{reflectionPrompt}` JSX expression - no trim, no punctuation, no
  fallback string anywhere in the component. The question sits in a
  gold-accented, violet-tinted panel (`border-l-2 border-gold/60
  bg-violet-deep/10`) with `whitespace-pre-line` so governed newlines
  render as line breaks instead of being collapsed. The restart control
  stayed a neutral outlined button (`border border-border-strong`, no
  fill, no gold), `min-h-[48px]` (above the 44px floor), full-width on
  mobile and auto-width from `sm:` up - never framed as "oku tekrar" and
  never styled as the primary gold CTA used elsewhere in the app.

### 19.2 Content and contract rules - unchanged

Exactly one question mark can ever appear on this screen, because the
screen only ever renders one piece of governed text
(`reflectionPrompt`) plus fixed copy that contains no `?` - verified by a
test that scans the whole region's `textContent` for `?` occurrences and
asserts exactly one, for both a normal prompt and content-only checks. No
`uncertaintyNotice`, `provider`, `reflectionPromptSource`, `fallbackReason`,
`confidence`, `safetyFlags`, or `persona` value can leak here because none
of those are props on this component - the same "the prop doesn't exist,
so it can't leak" pattern used for `symbolicMeaning` in FAZ 6. No
save/share/journal/streak/badge/upsell control exists; the only
interactive element on the whole screen is the single restart button
(asserted via `getAllByRole('button')` returning exactly one element).

### 19.3 Accessibility

Heading receives focus on mount via the existing `useFocusOnMount` hook,
consistent with every other screen transition; the heading is
`tabIndex={-1}` with `focus-visible:outline-none` so it never shows the
interactive-looking gold ring (FAZ 2.1 §14.1 fix, applied here too). The
screen is a plain `role="region"`, not an `alert` or a live region - a
governed reflection question is not an urgent system message, and no
`aria-live` attribute exists on the question paragraph. Keyboard operation
of the restart button was verified with both Enter and Space.

### 19.4 Restart behaviour (no `page.tsx` change)

`page.tsx`'s existing wiring - `onRestart={() => setState({ status:
'compose' })}` - was read carefully rather than assumed correct. Because
this resets `ViewState` to `{ status: 'compose' }` with no leftover
`data`/`initial` field, React unmounts the entire prior component tree
(question, framing, cards, pattern, reading, reflection all go away
together); there was no bug to fix here, so `page.tsx` was **not**
modified. A new regression test was added to `page-flow.test.tsx` instead,
proving this behaviour rather than trusting it: after reaching reflection
close with a distinctive question string and clicking "Yeniden başla", the
test asserts the reflection region is gone, the original question text is
gone, the reflection prompt text is gone, the pattern/detail regions are
gone, and the compose textbox is back and empty.

### 19.5 Plain-text safety and edge content

`reflectionPrompt` still only ever reaches the DOM through JSX text
interpolation - no `dangerouslySetInnerHTML`, no markdown parsing, no HTML
parsing anywhere in the component. Verified in both the unit suite and a
real Chromium browser: a literal `<script>alert("reflection")</script>`
fixture renders as inert visible text with zero `<script>` elements in the
document and no `alert()` side effect. Additional fixtures, all rendered
verbatim with no crash and no client-authored fallback: an 800+ character
prompt (renders in full, not truncated), a prompt containing `\n` newlines
(preserved as line breaks via `whitespace-pre-line`), a single-character
prompt (`"?"`), a prompt containing emoji, and an empty string prompt
(renders as an empty panel - no substitute question text appears anywhere
on the screen).

### 19.6 Tests added

`reflection-close.test.tsx` was fully rewritten (20 tests): every
`getByLabelText` query migrated to `getByRole('region', ...)` /
`getByTestId`, plus 6 new plain-text-safety/edge-case tests (script
injection, 800+ char length, newlines, single character, emoji, empty
prompt). `page-flow.test.tsx`'s six reflection-close integration tests had
their `getByLabelText('reflection-close')` / `getByLabelText
('reflection-question')` queries migrated to the same
`role`+name/`data-testid` pattern - no assertion was loosened, only the
query mechanism changed - plus one new regression test proving the
restart-clears-all-state behaviour described in §19.4. Total: 402 (FAZ 6
baseline) + 14 = **416/416 passing.**

### 19.7 Viewport QA (Playwright, real browser, real routes)

375×812, 390×844, 768×1024, 1440×900, driven through the real
`/api/readings/preview` → `/api/readings` flow (mocked reading response
only where a specific `reflectionPrompt` fixture needed to be forced - the
happy-path run used the app's own mock provider unmodified): no horizontal
overflow at any width, the heading correctly receives focus on arrival, no
console errors, restart correctly returns to a fresh compose screen with
no leftover state. A second QA pass forced five `reflectionPrompt`
fixtures (script-injection, 800+ chars, newlines, emoji, empty) through
the real reading response at 375×812 and 1440×900: all ten cells rendered
the prompt byte-for-byte identical to what the mocked API returned, no
`<script>` element was ever created, and no horizontal overflow occurred
even with the unbroken long-word/long-sentence fixture.

### 19.8 Not touched

`CrisisNotice`, `ErrorNotice`, `ConsentModal`, `ConsentDeclined`,
`useDialogFocus`, `QuestionForm`, `FramingReview`, `FramingLoading`,
`LoadingMark`, `ShuffleReveal`, `CardReveal`, `CardArtworkPlaceholder`,
`PatternArrival`, `ReadingResult`, `CardNarrationItem`, `DiagnosticBadge`,
`DisclaimerFooter`, `src/app/page.tsx`, and every file under
`src/app/api/**` / `src/server/**` are unchanged.
`asset/06-full-tarot-deck-v2` was not merged into this branch and no real
card artwork was integrated anywhere in this phase.

## 20. FAZ 8 — Crisis, Error & Final System Polish (record)

**Gerçek kart görselleri entegre edilmedi; asset/06-full-tarot-deck-v2
branch'i bu fazda merge edilmedi. FAZ 8 kriz ekranını, hata ekranını ve
sistem genelinde küçük tutarlılık boşluklarını düzenledi.**

### 20.1 What changed

Two components fully rewritten, same prop contracts they have always had,
plus two small proven consistency fixes elsewhere:

- **`CrisisNotice.tsx`** - full rewrite. Prop contract unchanged:
  `{ message: string; resources: Array<{ label: string; contact: string }> }`
  - no new prop exists, so none of the explicitly forbidden fields
  (cards/interpretation/provider/persona/confidence/safetyFlags/crisisReason/
  classifierScore/rawInput/sessionData/share/save/retry/dismiss/restart) can
  reach this screen. `aria-label="crisis-resources"` → `role="alert"` +
  `aria-labelledby` + `data-testid="crisis-resources"`. Previously the
  governed `message` string *was* the heading; now the heading is fixed UI
  copy ("Destek kaynakları") and `message` renders verbatim in its own
  `data-testid="crisis-message"` paragraph - this keeps the region's
  accessible name stable and semantic regardless of what the message
  contains, and stops a long or oddly-punctuated message from bending
  heading semantics. A quiet eyebrow ("Önce güvenlik") was added above the
  heading, the one small addition the brief allowed. `resources` render in
  exact array order as plain `<li>` items (never `<button>`/`<a>`, never
  auto-linked into `<a href>`) inside a `data-testid="crisis-resource-list"`
  `<ul>` under a visible "Şimdi ulaşabileceğin kaynaklar" heading; the whole
  resource section is omitted (not rendered empty) when `resources` is an
  empty array, mirroring the FAZ 6 empty-patterns pattern. Visual language:
  muted burgundy `crisis-surface`/`crisis-accent` tokens (already existing,
  unchanged), generous spacing, no flashing/pulse/siren/countdown, no tarot
  or mystical vocabulary anywhere in the fixed copy.
- **`ErrorNotice.tsx`** - full rewrite. Prop contract unchanged:
  `{ userMessage: string; onRetry: () => void }` - no new prop, so raw
  stack/Zod issues/status codes/provider names/request IDs structurally
  cannot reach this screen. `aria-label="error-state"` → `role="alert"` +
  `aria-labelledby` + `data-testid="error-state"`. Previously the heading
  was `"Bir hata oluştu: " + userMessage` glued into one string; now the
  heading is fixed UI copy ("Bir şeyler yolunda gitmedi") and `userMessage`
  renders verbatim in its own `data-testid="error-message"` paragraph, with
  no prefix, no punctuation, no fallback. A quiet eyebrow ("Geçici bir
  aksaklık") was added. "Tekrar Dene" is unchanged text, still calls only
  `onRetry` - no automatic retry, no countdown, no retry counter, no
  storage/analytics/reload side effect was added. Visual language:
  neutral/violet `diagnostic-subtle` surface (existing token, unchanged),
  a primary gold CTA (this *is* a forward action, unlike ReflectionClose's
  restart) - deliberately calmer and less severe-looking than the crisis
  screen's burgundy surface.
- **`QuestionForm.tsx`** (final-polish fix, not a redesign) - the `<form>`
  carried `aria-label="question-form"`, a raw machine test-hook name with
  no real accessible-name value to a screen-reader user, structurally
  identical to the `crisis-resources`/`error-state` debt this phase was
  already fixing. Replaced with `aria-labelledby` pointing at the screen's
  existing visible heading id (`headingId`, already computed via `useId`
  for the h2) plus `data-testid="question-form"` for the test hook. No
  other line in this file changed.
- **`ConsentDeclined.tsx`** (final-polish fix, not a redesign) -
  `aria-label="consent-declined"` → `role="region"` + `aria-labelledby` +
  `data-testid="consent-declined"`, matching every other screen's
  migration pattern; the heading also gained `focus-visible:outline-none`,
  which every other programmatically-focused heading in the app already
  had but this one had been missed. No copy, layout, or behavior changed.

### 20.2 Final system consistency audit (§14 of the brief)

Swept every component under `src/components/` for the specific debt
categories the brief named, and only touched what was actually found:

- **Focus**: every `tabIndex={-1}` screen heading across all twelve
  screens already carries `focus-visible:outline-none` except
  `ConsentDeclined`, which was missing it (fixed above, §20.1).
- **Technical `aria-label` test hooks**: grepped every remaining
  `aria-label=` in `src/components/` after this phase's crisis/error
  fixes. Found two genuine machine-name debts on whole-screen containers
  (`question-form`, `consent-declined`, both fixed above). Two remaining
  `aria-label`s on `QuestionForm.tsx`'s sub-groups (`"topic-hint"`,
  `"soru-onerileri"`) were identified but deliberately left alone - unlike
  a screen container, a `role="group"` here has no single natural visible
  heading to point an `aria-labelledby` at, and migrating them would
  require rewriting an already-passing, purpose-built anti-prophecy test
  outside this phase's stated component boundary (CrisisNotice/ErrorNotice
  + minimal proven fixes). `CardReveal`'s `aria-label="Üç kartlık açılım"`
  and `ConsentModal`'s checkbox label are real semantic Turkish names, not
  machine names - left untouched.
- **Touch targets**: every button in every component keeps at least a
  44×44px target (`min-h-[44px] min-w-[44px]` or larger); primary CTAs
  are 48-52px. No gaps found.
- **Contrast**: `CrisisNotice`'s new eyebrow (`text-crisis-accent/80` on
  `bg-crisis-surface`) and `ErrorNotice`'s new eyebrow
  (`text-foreground-muted` on `bg-diagnostic-subtle`) both reuse existing
  token pairings already in use elsewhere in the app; no new hex value was
  introduced anywhere in this phase.
- **Overflow**: both new components apply `whitespace-pre-line
  break-words` to their governed-text paragraphs, the same pattern used by
  every prior phase's governed-content surfaces.
- **Motion**: no new keyframe, transition, or continuous animation was
  added; `globals.css` was not touched this phase.
- **Asset isolation**: confirmed by grep - no `<img>`, no `.png`/`.jpg`
  reference, and no `tarot-cards-v2` reference anywhere under
  `src/components/` or `src/app/`.

### 20.3 Retry behaviour

`onRetry` fires exactly once per click/Enter/Space activation and never
during render (verified by a dedicated test asserting zero calls
immediately after mount). No automatic retry, countdown, exponential
backoff UI, retry counter, `localStorage`, analytics payload, or
`window.location.reload` was added - a dedicated test stubs both `fetch`
and `Storage.prototype.setItem` and asserts neither fires when "Tekrar
Dene" is clicked.

### 20.4 Plain-text safety

Both `message` (crisis) and `userMessage` (error), plus crisis
`resources[].label`/`resources[].contact`, still only ever reach the DOM
through JSX text interpolation - no `dangerouslySetInnerHTML`, markdown
parser, HTML parser, or auto-linking anywhere in either component.
Verified with three fixture families in both the unit suite and a real
Chromium browser: `<script>alert(...)</script>` (zero `<script>` elements
created, no `alert()` fired), `<img src=x onerror=alert(1)>` (zero `<img>`
elements created inside the crisis/error surface, no `onerror` fired), and
`<a href="javascript:alert(1)">...</a>` (zero `<a>` elements created, no
navigation triggered). Also verified: 800+ character messages render in
full, and both an empty `message` and an empty `userMessage` render with
no crash and no client-authored fallback body.

### 20.5 Tests added

`ui-components.test.tsx` gained 16 new `CrisisNotice` tests (region name,
verbatim message paragraph, exact resource order/content, no
button/link/auto-link semantics on resource items, empty-resources
section omission, empty-message defensive case, script/img/javascript-link
security fixtures, 800+ char stress, heading focus-ring suppression) and
18 new `ErrorNotice` tests (fixed heading, no prefix concatenation, single
interactive control, keyboard retry, 44/48px touch target, no raw
diagnostic leakage, empty-message defensive case, the same three security
fixtures, 800+ char stress, no network/storage side effect on retry). The
two pre-existing focus-management tests for both components were migrated
to query the new fixed headings instead of the old message-as-heading
text. `page-flow.test.tsx` had its 7 `getByLabelText`/`queryByLabelText`
references to `crisis-resources`/`error-state`/`question-form`/
`consent-declined` migrated to `getByTestId`/`queryByTestId`, and the two
focus-transition tests (crisis, error) updated to assert focus on the new
fixed headings rather than the old dynamic text. No assertion was
loosened - every migrated test still proves the same guarantee, only the
query mechanism changed. Total: 416 (FAZ 7 baseline) + 30 = **446/446
passing.**

### 20.6 Viewport QA (Playwright, real browser, real routes)

375×812, 390×844, 768×1024, 1440×900 × six crisis states (normal/2
resources, 4+ resources, long message, long contact, empty resources,
plain-text security fixture across message/label/contact simultaneously) =
24 cells, and the same four viewports × four error states (normal, long
`userMessage`, empty `userMessage`, plain-text security fixture) = 16
cells - all through real `/api/readings/preview` route interception, not
component-level mocks. Every cell: no horizontal overflow, the heading
correctly receives focus, the message/resources render byte-for-byte
identical to what the route returned, zero `<script>`/`<img>`/`<a>`
elements were created inside the crisis or error surface even for the
combined HTML-injection fixture, and the resource item count matched
exactly. The normal error case was additionally driven end-to-end with a
real keyboard Enter on "Tekrar Dene", confirming it returns to the
question-form screen. A separate final-smoke pass at 390×844 covered: the
full happy path through to reflection close; restart from reflection
returning to a clean compose screen with no leftover question text;
consent decline showing the declined screen with no question form and no
API call; "Sorumu düzenle" preserving the previously typed question; and
`prefers-reduced-motion: reduce` correctly suppressing the loading-mark
dot animation on the framing-review reveal step. All passed.

### 20.7 Not touched

`ConsentModal`, `useDialogFocus`, `FramingLoading`, `LoadingMark`,
`ShuffleReveal`, `CardReveal`, `CardArtworkPlaceholder`, `PatternArrival`,
`ReadingResult`, `CardNarrationItem`, `DiagnosticBadge`,
`DisclaimerFooter`, `ReflectionClose`, `src/app/page.tsx`, `globals.css`,
`tailwind.config.ts`, and every file under `src/app/api/**` /
`src/server/**` are unchanged. No new npm dependency was added.
`asset/06-full-tarot-deck-v2` was not merged into this branch and no real
card artwork was integrated anywhere in this phase.

## 21. RC-1 — Release Candidate Audit (record)

**Bir redesign fazı değildir.** RC-1, FAZ 1–8'in ürettiği premium UI
hattının tek seferlik tutarlılık ve doğrulama denetimidir; yalnız somut,
doğrulanmış bulgular düzeltildi.

### 21.1 UI Freeze / Design Consistency — bulgular ve düzeltmeler

- **`ConsentDeclined.tsx`** - FAZ 2'de yazılmış, FAZ 3'te kurulan
  "top-level screen surface" kalıbından (`rounded-[28px] border
  border-border-subtle bg-surface-raised/60 p-6 sm:p-8` + `font-heading
  text-2xl ... sm:text-3xl` başlık) hiç geçirilmemiş tek ekrandı - diğer
  sekiz tam-ekran bileşenin (`CardReveal`, `CrisisNotice`, `ErrorNotice`,
  `FramingReview`, `PatternArrival`, `QuestionForm`, `ReadingResult`,
  `ReflectionClose`) tamamı bu kalıbı birebir kullanıyor, `ConsentDeclined`
  hâlâ `rounded-2xl border-border-subtle bg-surface p-6` + `text-xl`
  başlık kullanıyordu. Aynı bileşende ikincil buton `rounded-xl px-4` (diğer
  nötr-outline butonlarda `rounded-2xl px-5`) ve destek metni
  `text-foreground-muted` (diğerlerinde `text-foreground-secondary
  sm:text-base`) idi. Dördü de tek bir bulgu grubu olarak, sadece
  class-name düzeyinde, kopya/davranış/prop değişmeden düzeltildi. Eyebrow
  eklenmedi - `CardReveal` ve `ReadingResult` de eyebrow'suz, yani
  eyebrow'un yokluğu tek başına bir tutarsızlık değil.
- **`ErrorNotice.tsx`** - "Tekrar Dene" butonu `bg-accent` (altın primary)
  stilinde ama `min-h-[48px]` idi; `bg-accent` kullanan diğer beş primary
  CTA'nın (`CardReveal`, `FramingReview`, `PatternArrival`, `QuestionForm`,
  `ReadingResult`) tamamı `min-h-[52px]`. FAZ 8'de bilinçli olarak
  `ReflectionClose`'un nötr 48px restart butonuyla eşleştirilmişti, ama
  "Tekrar Dene" primary-CTA olarak stillendirildiği için doğru referans
  grubu 52px'lik primary CTA'lar. `min-h-[48px]` → `min-h-[52px]`
  düzeltildi; ilgili test (`ui-components.test.tsx`) güncellendi.
- Spacing ölçeği, border-radius kullanım amaçları (`rounded-[28px]`
  tam-ekran / `rounded-2xl` orta-yüzey / `rounded-xl` küçük-rozet),
  boundary-note (`<aside>`) kalıbı, `bg-accent` buton metni
  (`text-background`, hiçbir yerde `text-white` yok) taranmış, başka
  sapma bulunmamıştır.

### 21.2 Accessibility Freeze — bulgular

Bulgu yok. On ekranın tamamında `tabIndex={-1}` başlık ↔
`focus-visible:outline-none` eşleşmesi 1:1; `role` + `aria-labelledby`
(veya `role="alert"`/`role="dialog"`) + `data-testid` üçlüsü eksiksiz;
DOM/Tab sırasını bozan bir `order-*`/`flex-*-reverse` yok. Kalan iki
teknik `aria-label` (`QuestionForm`'daki `"topic-hint"` ve
`"soru-onerileri"` grup etiketleri) FAZ 8'de tespit edilip bilinçli olarak
dokunulmamıştı; ürün sahibi bu kararı FAZ 8 değerlendirmesinde açıkça
onayladı ("gerçek ürün semantiği taşıyan grup etiketleri... sırf debt
sıfırlansın diye bozmazdım") - RC-1 bu kararı değiştirmedi.

### 21.3 Test Freeze

`getByLabelText`/`queryByLabelText` kalıntıları tarandı; kalan iki
kullanım (`ui-components.test.tsx`'te `crisis-resources`/`error-state`)
kasıtlı negatif-doğrulama testleri - eski machine-name `aria-label`in
gerçekten kaybolduğunu kanıtlıyorlar, stale query değiller.
`npm run typecheck` / `npm test` / `npm run build` / `npm run lint`
hepsi temiz. Test sayısı RC-1 öncesi 446'dan değişmedi (bir testin
beklediği sınıf değeri `min-h-[48px]` → `min-h-[52px]` olarak güncellendi,
yeni test eklenmedi/silinmedi çünkü bulgu sayısı azdı ve mevcut testler
zaten doğru şeyi ölçüyordu).

### 21.4 Documentation Freeze

`docs/UI_PREMIUM_V1.md` FAZ 0–8 bölümleri kod durumuyla karşılaştırıldı;
FAZ 8'in §20.5'inde geçen "44/48px touch target" ifadesi RC-1'in
`ErrorNotice` düzeltmesinden önceki (o zamanki doğru) durumu anlatıyor -
geçmiş faz kayıtları geriye dönük düzenlenmez, bu RC-1 bölümü güncel
durumu ayrıca kayda geçirir. Başka yanlış/eskimiş iddia bulunmadı.

### 21.5 Asset Isolation

`src/components/` ve `src/app/` altında `<img>`, `.png/.jpg/.webp`, veya
`tarot-cards-v2` referansı yok (grep ile doğrulandı).
`asset/06-full-tarot-deck-v2` bu branch'e hiçbir commit'iyle sızmamış.

Şeffaflık için önemli bir gözlem: bu branch'in ağacında, FAZ 0'dan ÖNCE
var olan (commit `f753075`, 2026-07-22, bu oturumdan bağımsız) ayrı bir
`assets/tarot-cards/` dizini bulunuyor - 22 Major Arcana kartı, kendi
`README.md`'sinde "montage'dan çıkarılmış, yalnız prototip kullanımı için
onaylanmış" olarak tanımlanmış, kendi lisans-kapısı sistemi
(`src/types/asset-license.ts`, `evaluateAssetGate`) tarafından kalıcı
olarak `purpose: 'prototype-nonproduction'` işaretlenmiş ve production
kullanımı testlerle (`asset-license.test.ts`) engellenmiş. Bu, bu
oturumdaki FULL_DECK_V2 çalışmasından tamamen ayrı, önceden var olan bir
yapı - hiçbir UI component'i bu dizine referans vermiyor (grep ile
doğrulandı), FAZ 0-8 ve RC-1'in hiçbirinde dokunulmadı veya bağlanmadı.
Not ediliyor, düzeltme gerektirmiyor.

### 21.6 Yapılan düzeltmeler (özet)

1. `ConsentDeclined.tsx` - top-level screen surface/heading/button/support-text
   class-name'leri kanonik kalıba hizalandı.
2. `ErrorNotice.tsx` - "Tekrar Dene" butonu `min-h-[48px]` → `min-h-[52px]`
   (primary CTA kalıbına hizalandı); `ui-components.test.tsx`'teki ilgili
   test güncellendi.

### 21.7 Düzeltilmeyen / not edilen gözlemler

- `QuestionForm`'un `"topic-hint"`/`"soru-onerileri"` grup `aria-label`'ları
  - gerçek ürün semantiği taşıyor, ürün sahibi tarafından FAZ 8'de
  onaylanmış bir "dokunma" kararı.
- `ReadingResult`'un `text-lg` alt-başlıkları (`h3`) `CrisisNotice`/
  `QuestionForm`/`PatternArrival`'daki `text-base` grup etiketlerinden
  farklı - incelendi, farklı hiyerarşi seviyelerini (büyük bölüm vs. küçük
  grup etiketi) temsil ettiği doğrulandı, tutarsızlık değil.
- `FramingLoading` (küçük, `QuestionForm` altında gömülü durum şeridi) ile
  `ShuffleReveal` (tam ekran yükleme yüzeyi) arasındaki görsel ağırlık
  farkı - incelendi, `page.tsx`'teki render bağlamları gerçekten farklı
  (biri forma gömülü, diğeri tek başına tam ekran), kasıtlı mimari
  farklılaşma olduğu doğrulandı, tutarsızlık değil.
- `assets/tarot-cards/` (V1, pre-FAZ0) - §21.5'te not edildi, kapsam dışı.

### 21.8 Not touched

`ConsentModal`, `useDialogFocus`, `QuestionForm` (aria-label değişikliği
hariç - o FAZ 8'de yapılmıştı), `FramingLoading`, `LoadingMark`,
`ShuffleReveal`, `CardReveal`, `CardArtworkPlaceholder`, `PatternArrival`,
`ReadingResult`, `CardNarrationItem`, `DiagnosticBadge`,
`DisclaimerFooter`, `ReflectionClose`, `CrisisNotice`, `src/app/page.tsx`,
`globals.css`, `tailwind.config.ts`, ve `src/app/api/**` / `src/server/**`
altındaki her dosya değişmedi. Yeni npm bağımlılığı eklenmedi. Yeni
component, yeni sayfa, yeni route eklenmedi. `asset/06-full-tarot-deck-v2`
bu fazda merge edilmedi ve gerçek kart görseli entegre edilmedi.

## 22. FAZ 9 — Governed Card Asset Integration (record)

**Detaylı governance zinciri, provenance, ve rollback planı için:
`docs/ASSET_INTEGRATION_V2.md`.** Bu bölüm yalnız UI tarafını özetler.

FAZ 9, iki zorunlu kapıdan oluştu: FAZ 9A (asset production readiness,
`asset/09-production-derivatives` branch'inde) ve FAZ 9B (seçici UI
entegrasyonu, `claude/faz9-governed-card-assets` branch'inde). Tam branch
merge hiçbir noktada kullanılmadı; her dosya `git checkout <exact-SHA> --
<paths>` ile seçici olarak taşındı. Frozen UI branch
(`claude/premium-ui-foundation-phase1-4d2940` @ `3f75408`) hiç
değişmedi.

### 22.1 Kapsam kararı: yalnız 22 Major Arcana

Governed Full Deck V2 seti 78 kart yüzü + 1 kart arkası içeriyor (22
Major + 56 Minor Arcana). Ancak uygulamanın reading engine'i
(`src/server/reading-engine/cards.ts`) `data/cards/*.json`'da tam olarak
22 Major Arcana kartı olmadığı sürece hard-fail veriyor - Minor Arcana
kartının gösterilebileceği hiçbir `CardId` yok, ve bu geçici bir eksiklik
değil (`CardDataSchema` `arcana: z.literal('major')` olarak sabitlenmiş).
Bu yüzden governed artwork registry yalnız gerçek 22 `CardId` + 1 kart
arkası üzerinde exhaustive; 56 Minor Arcana derivative'i asset
branch'lerinde provenance için duruyor ama `public/`'a kopyalanmadı,
registry'ye girmedi, hiçbir component'e bağlanmadı. Bu bir kapsam kararı,
bir eksiklik değil - reading engine değişikliği gerektirir, ki bu FAZ
9'un sınırları dışında.

### 22.2 What changed

- **`src/lib/tarot-card-artwork.ts`** (yeni, generated) -
  `tools/assets/generate_tarot_artwork_registry.py` tarafından üretiliyor;
  `data/cards/*.json`, canonical provenance manifest ve derivative
  manifest'i reconcile ediyor. `CardId` union (22 literal), `CARD_ARTWORK`
  (`satisfies Record<CardId, CardArtworkEntry>` - compile-time exhaustive),
  `CARD_BACK_ARTWORK` sabiti. Generator `--check` modunda dry-run
  reproducibility kanıtlıyor.
- **`tools/assets/generate_tarot_artwork_registry.py`** (yeni) - eksik
  CardId, extra face asset, hash mismatch, yanlış boyut, eksik public
  dosya gibi durumlarda sessizce devam etmek yerine sert hata veriyor
  (`fail()` → non-zero exit, kısmi registry yazılmıyor).
- **`CardArtworkPlaceholder.tsx`** - yeni opsiyonel `cardId?: CardId` prop,
  yalnız `state === 'revealed'` iken okunuyor. Locked/current her zaman
  `CARD_BACK_ARTWORK` gösteriyor (hangi kart olduğundan bağımsız).
  Revealed, `CARD_ARTWORK[cardId]`'yi + mevcut governed `displayName`'i bir
  scrim overlay içinde gösteriyor. `cardId` çözümlenemezse (savunma amaçlı)
  aynı nötr geometrik shell'e düşüyor - asla başka bir kartın görseline
  değil. 2:3 aspect-ratio sözleşmesi, reveal animasyonu (`card-artwork__reveal`,
  yalnız `reducedMotion=false` iken), locked/current opacity/glow mantığı
  değişmedi.
- **`CardReveal.tsx`** - yalnız minimal wiring: `resolveArtworkCardId(card.id)`
  yalnız revealed dalına `cardId` olarak geçiyor (locked/current asla
  cardId almıyor, kart kimliği kapalı kartların DOM'una hiç girmiyor); bir
  eski docblock satırı güncellendi. Reveal sırası, gate, focus, kopya
  değişmedi.
- **`public/assets/tarot-cards/v2/`** (yeni, 23 dosya) - yalnız 22 Major
  Arcana + Card Back derivative'i, byte-birebir kopyalandı, her biri
  `derivative-manifest.json`'daki SHA-256 ile doğrulandı. Canonical PNG'ler
  hiçbir zaman bu path'e veya bu branch'e kopyalanmadı.

### 22.3 Identity isolation (doğrulandı)

Kapalı kart (locked/current) her zaman aynı kart arkası görselini
gösteriyor; face path DOM'a hiç girmiyor; face network request'i hiç
atılmıyor. Gerçek tarayıcı network QA: reveal ekranına varışta 1 istek
(paylaşılan kart arkası), her reveal tam olarak 1 face isteği ekliyor,
crisis/error path'lerinde 0 kart görseli isteği, restart sonrası 0 istek.
Hiçbir yerde `.png` isteği, external domain isteği, veya 404 yok.

### 22.4 Accessibility

Kart arkası dekoratif (`alt=""`, wrapper `aria-hidden`); revealed face
`alt` = governed `displayName`, raw id asla görünmüyor/duyulmuyor.
Current buton accessible name'i ("Geçmiş/Şimdi/Yön kartını aç") mevcut
gibi dışarıdan geliyor. Live region davranışı, focus progression, keyboard
Enter/Space değişmedi.

### 22.5 Performance

22 kayıtlı yüz + kart arkası: min 96 KB, medyan 114 KB, p95 129 KB, maks
130 KB, kart arkası 108 KB, tipik 3-kart oturumu ~451 KB - tüm hedefler
kalite düşürülmeden rahatça karşılandı. Detaylar: `docs/ASSET_INTEGRATION_V2.md` §7.

### 22.6 Tests added

`tarot-card-artwork.test.ts` (16 test - exhaustiveness, hash
reconciliation, generator reproducibility), `card-artwork-placeholder.test.tsx`
(18 test - closed/revealed identity isolation, a11y, reduced motion,
defensive fallback), `card-reveal.test.tsx` (+4 net: 1 eski "no image
anywhere" testi FAZ9 gerçeğiyle çelişiyordu, kaldırıldı; 5 yeni identity-
isolation testi eklendi), `page-flow.test.tsx` (+5 - progressive loading,
crisis/error path'lerinde 0 görsel, restart sonrası 0 görsel). Toplam: 446
(RC-1 sonrası) + 43 = **489/489 geçti**.

### 22.7 Governance

V2-D012/D013/D014 CLOSED, V2-D002 ACCEPTED RESIDUAL RISK, V2-D005 CLOSED -
tümü ürün sahibinin gerçek, doğrulanabilir aksiyonlarına dayanıyor (kanıt
uydurulmadı). Detaylar: `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`,
`docs/evidence/FULL_DECK_V2_*`.

### 22.8 What FAZ 9 does NOT clear

Commercial release ayrı gated kalmaya devam ediyor (V2-D003/D004/D009/D010
hâlâ açık). V2-D002 kabul edilmiş bir residual risk, ortadan kaldırılmış
bir kanıt değil. 56 kayıtsız Minor Arcana derivative'i hiçbir component'e
bağlanmadı.

### 22.9 Not touched

`AppShell`, `ConsentModal`, `ConsentDeclined`, `QuestionForm`,
`FramingReview`, `FramingLoading`, `ShuffleReveal`, `PatternArrival`,
`ReadingResult`, `CardNarrationItem`, `DiagnosticBadge`,
`DisclaimerFooter`, `ReflectionClose`, `CrisisNotice`, `ErrorNotice`,
`src/app/page.tsx`, `globals.css`, `tailwind.config.ts`, state machine, ve
`src/app/api/**` / `src/server/**` altındaki her dosya değişmedi
(`CardArtworkPlaceholder` ve `CardReveal` dışında, ki bu fazın açık
hedefiydi). `ReadingResult` bu fazda gerçek kart görseli almadı - kapsam
yalnız `CardArtworkPlaceholder` katmanıyla sınırlıydı.

## 23. RC-2 — Integrated Asset Release Candidate Audit (özet)

Tam rapor: `docs/RC2_INTEGRATED_ASSET_AUDIT.md`. **Karar: PASS.**

İzole clean-install (`npm ci`), registry/public-asset reconciliation, 22
karta tam display-name audit (19 MATCH, 2 kabul edilebilir tipografik
varyant, 1 gerçek kelime farkı - hiçbiri yanlış kart eşleşmesi değil),
gerçek tarayıcıda cache açık/kapalı network isolation, 320px dahil 7
viewport, slow-load, image-failure, accessibility (200% zoom dahil),
reduced motion, performance yeniden hesaplama, bundle audit, frozen UI
diff, ve - en kritik test - izole worktree'de gerçekten çalıştırılmış
rollback provası (tam FAZ 9 zincirinin geri alınması `3f75408` ile
**byte-birebir aynı** ağacı üretti) tamamlandı.

İki MAJOR bulgu tespit edildi ve minimal, doğrulanmış düzeltmelerle
kapatıldı: (1) uzun tek-kelime `displayName`'lerin (İmparatoriçe) 320px'te
kırpılması → `break-words`; (2) görsel yükleme hatasında native
broken-image ikonu görünmesi → nötr shell her zaman temel katman olacak
şekilde yeniden yapılandırıldı, `onError` ile görsel gizleniyor. BLOCKER
yok. Test: 489 → 490/490. Commercial-release kapıları
(V2-D003/D004/D009/D010) hâlâ açık.
