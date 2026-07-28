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
