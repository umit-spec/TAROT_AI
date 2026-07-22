# Aşama 2 — Wireframe & User Flow Specification

## Overview

Aşama 2'nin amacı: **Tıklanabilir wireframe + time budget + accessibility + funnel analytics tanımlamak.**

Hiçbir koda, renk seçimine veya görsel asset'e ihtiyaç yok.

Yalnızca: "Kullanıcı ne görecek? Nereye dokunacak? Ne kadar sürede?"

---

## Time Budget (Revize — Two-Tier System)

### PRIMARY KPI: Time to First Insight ≤90 seconds

First meaningful insight = user sees card + initial meaning, understands relevance to question.

### SECONDARY KPI: Core Flow Completion ≤120 seconds

Full interaction through save prompt.

### Screen-by-Screen Breakdown (REVISED)

| Screen | Component | Target | Hard Limit | Notes |
|--------|-----------|--------|-----------|-------|
| **Landing** | Hero + CTA | 8 sec | 10 sec | Quick value prop, click "Başla" |
| **Topic Selection** | 4 cards, tap one | 8 sec | 12 sec | Visual, immediate |
| **Persona + Intake (MERGED)** | 3 natural questions | 25 sec | 30 sec | Feels like conversation, not test |
| **Spread Confirmation** | System suggests, inline | 5 sec | 8 sec | Quick "yes/no" or auto-accept |
| **Card Selection** | Tap 3 or 5 on deck | 18 sec | 22 sec | Swift, deliberate |
| **Reveal** | Shuffle + flip animation | 4 sec | 6 sec | Visual, no delays |
| **FIRST INSIGHT** | Initial card meaning + relevance | 12 sec | 15 sec | **MILESTONE: 80 sec total** |
| | | **TIME TO FIRST INSIGHT: 80 sec** | **≤90 sec target** | ✅ Primary goal |
| **Detailed Synthesis** | Deeper reading + patterns | 25 sec | 30 sec | User reads naturally, no rush |
| **Helpfulness Rating** | 1-3 score | 5 sec | 8 sec | Quick feedback |
| **Save Prompt** | "Save this?" | 5 sec | 8 sec | Simple decision |
| | | **CORE FLOW: 115 sec** | **≤120 sec target** | ✅ Secondary goal |
| **Premium Modal** | ❌ NOT IN CORE FLOW | (deferred) | (deferred) | Shown separately, after save |

### Key Changes

1. **Persona + Intake merged** (35 sec → 25 sec) 
   - Persona detection hidden from user
   - Questions feel natural, not like tests
   
2. **Spread recommendation inline** (10 sec → 5 sec)
   - No separate confirmation screen
   - System suggests, user taps accept or changes
   
3. **Two-layer reading**
   - Layer 1: First insight (12 sec, ~50 words)
   - Layer 2: Detailed synthesis (25 sec, full reading)
   - User can skim or deep-dive
   
4. **Premium modal removed from core flow**
   - Shown AFTER save (if at all)
   - Reduces decision fatigue
   
5. **Revised success metrics**
   - Time to First Insight: ≤90 sec (PRIMARY)
   - Core Flow Completion: ≤120 sec (SECONDARY)
   - Free-reading time: UNMEASURED (user can linger)

---

## Funnel Analytics (Revised — 12 Core Events)

Every screen transition = event fired. Premium modal moved outside core flow.

```
1. landing_view
   ├─ device: "mobile" | "tablet" | "desktop"
   ├─ referrer: "direct" | "google" | "link"
   └─ [8 sec here]
   
   ↓ Click "Başla"

2. topic_selected
   ├─ topic: "relationship" | "career" | "mood" | "general"
   ├─ time_to_selection: milliseconds
   └─ [8 sec here]
   
   ↓ Tap topic card

3. questions_started (MERGED)
   ├─ num_questions: 3
   ├─ includes_persona_detect: true (hidden)
   └─ [25 sec here, feels natural]
   
   ↓ Answer 3 natural questions

4. questions_completed
   ├─ persona_type: "first_timer" | "regular" | "anxious" | "decision_maker" | "skeptic"
   ├─ persona_confidence: 0.0-1.0
   ├─ time_spent: milliseconds
   └─ [System detects, inline spread recommendation]
   
   ↓ Auto-proceed to card selection

5. spread_inline_recommended
   ├─ recommended_spread: "three_card" | "five_card"
   ├─ confidence: 0.0-1.0
   └─ [5 sec, simple accept/change]
   
   ↓ Tap "accept" or "3-card instead"

6. spread_confirmed
   ├─ spread_type: "three_card" | "five_card"
   ├─ user_accepted: true | false
   └─ [Ready for card selection]
   
   ↓ Proceed to deck

7. cards_selection_started
   ├─ spread_type: [previous]
   ├─ deck_seed: integer
   └─ [18 sec to select]
   
   ↓ User taps positions

8. cards_selected
   ├─ num_cards: 3 | 5
   ├─ tap_order: [1,3,5]
   ├─ time_to_selection: milliseconds
   └─ [Ready to reveal]
   
   ↓ Auto-reveal with animation

9. shuffle_animation_played
   ├─ duration_ms: 4000
   └─ [Visual only]
   
   ↓ Cards flip

10. first_insight_displayed
    ├─ time_to_delivery: milliseconds (total from landing, ≤90 sec)
    ├─ first_insight_words: ~50
    ├─ persona_at_delivery: [detected]
    ├─ **MILESTONE: Time to First Insight**
    └─ [12 sec read]
    
    ↓ User reads or scrolls for more

11. detailed_synthesis_viewed (optional)
    ├─ time_to_view: milliseconds (after first insight)
    ├─ full_reading_words: integer
    ├─ read_duration: milliseconds
    └─ [User reads deeply, time unmeasured]
    
    ↓ User rates or saves

12. helpfulness_submitted
    ├─ score: 1 | 2 | 3
    ├─ text_note: "string" | null
    └─ [5 sec feedback]
    
    ↓ Save prompt

13. save_prompted
    ├─ user_action: "save" | "dismiss"
    └─ [5 sec, end of core flow, ≤120 sec total]
    
    ↓ [CORE FLOW ENDS]

14. (DEFERRED) premium_modal_viewed
    ├─ trigger: "post_session" (not inline)
    ├─ display_duration: milliseconds
    └─ Only if user saved or dismissed

15. (DEFERRED) premium_modal_clicked
    ├─ button: "tell_me_when" | "learn_more" | "dismiss"
    └─ Separate metric, not core funnel

---

**Key Changes:**
- Persona detection invisible (no separate flow)
- Spread recommendation inline (no separate screen)
- Reading two-layer (first insight + detailed)
- Premium modal OUTSIDE core flow (reduces decision fatigue)
- 12 core events (focused on funnel, not all interactions)
- Two success metrics: Time to First Insight + Core Flow Completion

---

## Accessibility Validation

Every screen must pass:

### Touch Target Sizes

- [ ] All buttons ≥44×44 px (minimum)
- [ ] All tappable elements ≥40 px spacing
- [ ] Cards/questions single-handed reachable (thumbs only)

**Test:** Hold phone one-handed, reach with thumb.
- Top: Can you tap without stretching?
- Middle: Natural?
- Bottom: Can you tap without shifting grip?

Fail = redesign layout

### Color Contrast

- [ ] Text vs background ≥4.5:1 (normal text)
- [ ] Text vs background ≥3:1 (large text >18pt)
- [ ] Icons + text color ≥3:1 contrast

**Test:** Axe-core audit (later in dev), but wireframe should assume high contrast

### Animation

- [ ] Shuffle animation respects `prefers-reduced-motion`
- [ ] If user has "reduce motion" enabled, card reveal is instant (no animation)

**Implementation note:** CSS `@media (prefers-reduced-motion: reduce)`

### Keyboard Navigation

- [ ] All interactive elements Tab-reachable
- [ ] Tab order logical (left-to-right, top-to-bottom)
- [ ] Form inputs clearly labeled

**Not required in wireframe, but spec'd for dev**

### Screen Reader

- [ ] Card names announced
- [ ] Buttons have aria-label if needed
- [ ] Form instructions clear

---

## "No Magic" Test

For each screen, ask:

> **"If this screen disappeared, would the user experience break?"**

If answer is NO → **Remove it.**

### Screen Audit (Revised)

| Screen | Essential? | Reason |
|--------|------------|--------|
| **Landing** | ✅ YES | User needs to understand product value before starting |
| **Topic Selection** | ✅ YES | Determines context + spread recommendation + reading tone |
| **Merged Questions (Persona + Intake)** | ✅ YES | Persona detection hidden; 3 questions feel natural, context gathered |
| **Card Selection** | ✅ YES | Core tarot experience; ritual matters |
| **Shuffle Animation** | ⚠️ MAYBE | Visual polish; can be instant if timing tight |
| **First Insight Display** | ✅ YES | PRIMARY KPI milestone; user sees initial meaning + relevance (≤90 sec total) |
| **Detailed Synthesis Display** | ✅ YES | Full reading depth; user reads naturally (time unmeasured) |
| **Helpfulness Rating** | ✅ YES | Essential for MVP success metrics |
| **Save Prompt** | ✅ YES | Conversion funnel (free → registered) |
| **Premium Modal** | ⚠️ MAYBE | OUTSIDE core flow; shown post-session to reduce decision fatigue |

**Core Flow (≤120 sec):**
Landing → Topic → Questions (merged) → Card Select → Shuffle → First Insight → Detailed Synthesis → Rate → Save

**Premium Modal** shown separately after core flow completes (not measured in time budget).

---

## Persona Flow Variations

**Same wireframe, different paths:**

### Persona 1: First-Time User
- Longer explanations (inline help text)
- Simpler question language
- "What does this card mean?" after reveal

### Persona 2: Regular Practitioner
- Shorter explanations (assumes knowledge)
- Advanced questions
- Skips definition screens

### Persona 3: Anxious User
- Reassuring language ("You're doing great")
- Fewer choices (less decision anxiety)
- Emphasis on autonomy

### Persona 4: Decision-Maker
- Action-oriented language ("Next step...")
- Clarity emphasis
- Skips poetry, gets practical

### Persona 5: Skeptic
- Scientific framing ("This works because...")
- No mystical language
- Psychology explanations

**Wireframe must accommodate all 5 without changing layout.**

---

## Metrics Per Screen (Revised)

Each screen needs a success metric:

| Screen | Metric | Target | Fail | Notes |
|--------|--------|--------|------|-------|
| Landing | CTA click rate | >80% (of viewers) | <60% | 8 sec target |
| Topic Selection | Abandonment rate | <5% | >10% | 8 sec target |
| Merged Questions (Persona + Intake) | Completion rate | >95% | <90% | 25 sec, feels natural |
| Spread Recommendation (inline) | Acceptance rate | >70% (of recs) | <50% | 5 sec, embedded in flow |
| Card Selection | Completion rate | >98% | <95% | 18 sec target |
| Shuffle Animation | Engagement (watched) | >95% | <80% | 4 sec, optional polish |
| **First Insight Display** | **Time to delivery** | **≤90 sec total** | **>90 sec = FAIL** | **PRIMARY KPI: Initial meaning + relevance shown** |
| Detailed Synthesis Display | Read duration | 30-60 sec naturally | <15 sec = skim only | User reads deeply; time unmeasured |
| Helpfulness Rating | Submission rate | >50% | <30% | 5 sec target |
| Save Prompt | Save rate (auth) | >20% | <10% | 5 sec target |
| **Core Flow Total** | **End-to-end time** | **≤120 sec** | **>120 sec = FAIL** | **SECONDARY KPI: Landing through Save** |
| Premium Modal (deferred) | CTR | >15% | <10% | Shown post-session, not measured in core flow time |

---

## Wireframe Deliverables (End of Aşama 2)

### Format Options

Choose one (or both):

**Option A: Figma (Interactive)**
- Tüm screens
- Click-through prototype
- Mobile + tablet + desktop
- Share link

**Option B: SVG/HTML (Code-friendly)**
- Semantic HTML (no images)
- Tailwind utility structure (for dev handoff)
- Dark mode default

**Recommendation:** Figma for quick testing, SVG for developer handoff

### Files to Deliver (Revised)

```
design/
├── wireframes/
│   ├── 01-landing.svg                      (8 sec: hero + CTA)
│   ├── 02-topic-selection.svg              (8 sec: 4 topic cards)
│   ├── 03-merged-questions.svg             (25 sec: 3 natural questions, spread inline)
│   ├── 04-card-selection.svg               (18 sec: shuffle deck, select positions)
│   ├── 05-shuffle-animation.svg            (4 sec: card reveal animation)
│   ├── 06-first-insight-display.svg        (12 sec: initial meaning + relevance, ≤90 sec milestone)
│   ├── 07-detailed-synthesis-display.svg   (25 sec: full reading, patterns, deeper analysis)
│   ├── 08-helpfulness-rating.svg           (5 sec: rate 1-3)
│   ├── 09-save-prompt.svg                  (5 sec: "Save this?")
│   └── 10-premium-modal.svg                (DEFERRED: shown post-session)
│
├── AŞAMA_2_WIREFRAME_SPEC.md (this file, fully revised)
├── ACCESSIBILITY_CHECKLIST.md (WCAG AA audit, 44×44 px targets, 4.5:1 contrast)
├── TIME_BUDGET_VALIDATION.md (5-user timing test results, Time to First Insight ≤90 sec, Core Flow ≤120 sec)
├── FUNNEL_FLOW_MAP.json (12 core events + mapping to screens)
├── PERSONA_VARIATIONS.md (5 reading paths, same wireframe, different tone)
└── PROTOTYPE_LINK.md (Figma interactive prototype or HTML/SVG interactive demo)
```

---

## Testing Protocol (End of Aşama 2, Revised)

### 5 Real Users (Timing-Critical Test)

Test wireframe with 5 new users, minimum. Measure time for EACH screen independently (stopwatch), not just total.

**PRIMARY TEST: Time to First Insight**
- From Landing to First Insight Display (cards revealed + 12 sec read)
- **TARGET: ≤90 seconds average**
- Measure 5 users, average and max
- If ANY user >100 sec, redesign flow (merged questions might still be too slow)

**SECONDARY TEST: Core Flow Completion**
- From Landing through Save Prompt
- **TARGET: ≤120 seconds average**
- Measure 5 users, average and max
- If average >120 sec, prioritize (cut shuffle animation? shorten reads?)

1. **Screen-by-Screen Timing:**
   - Landing: target 8 sec (measure actual)
   - Topic: target 8 sec (measure actual)
   - Questions: target 25 sec + spread inline (measure actual)
   - Card Select: target 18 sec (measure actual)
   - Shuffle: target 4 sec (measure actual)
   - First Insight: target 12 sec read + milestone timestamp (measure actual)
   - Detailed Synthesis: natural read time (measure, but NOT in core budget)
   - Helpfulness: target 5 sec (measure actual)
   - Save: target 5 sec (measure actual)

2. **Clarity Test:**
   - Can user understand each screen's purpose without help?
   - Any confusion at merged questions screen (is context clear)?
   - Does inline spread recommendation make sense?

3. **Accessibility Test:**
   - Can they use one-handed (mobile, thumb only)?
   - Button/card tap target sizes comfortable (44×44 px)?
   - Color contrast readable (normal lighting)?

4. **Funnel Test:**
   - Do they complete all steps (Landing → Save)?
   - Where do they abandon or slow down?
   - Any screen that causes hesitation?

5. **Persona Adaptation Test (For Later, Design Phase):**
   - Same wireframe shown to first-timer + skeptic
   - Tone variations will be tested in Aşama 3 (design system)
   - Wireframe tests flow + timing only

---

## PASS Criteria (Aşama 2 → Aşama 3, Revised)

**ALL of the following must be true:**

- ✅ **9-10 screens wireframed** (Landing, Topic, Questions, Cards, Shuffle, First Insight, Detailed Synthesis, Rating, Save, Premium Modal)
- ✅ **Time to First Insight ≤90 sec** (5 users tested, average + max documented)
- ✅ **Core Flow Completion ≤120 sec** (Landing → Save, 5 users tested, average + max documented)
- ✅ **Mobile-first responsive** (375px, 768px, 1920px tested; no horizontal scroll)
- ✅ **12 core funnel events mapped** to screens (landing_view through save_prompted)
- ✅ **Accessibility audit passed**:
  - [ ] All tap targets ≥44×44 px
  - [ ] Contrast ≥4.5:1 (text) and ≥3:1 (large text)
  - [ ] Keyboard navigation Tab-able (left-to-right, top-to-bottom)
  - [ ] prefers-reduced-motion respected (instant reveal if enabled)
  - [ ] Screen reader compatible (card names announced, buttons labeled)
- ✅ **"No Magic" test passed** (every screen justified; Premium Modal marked DEFERRED, acceptable outside core)
- ✅ **Persona variations documented** (5 different tone paths for same wireframe; design phase will implement)
- ✅ **Per-screen metrics defined** (time targets, completion rates, CTRs)
- ✅ **5 user tests completed** (timing log, feedback incorporated, redesigns if needed)
- ✅ **Wireframe interactive** (Figma clickable prototype OR HTML/SVG with state transitions)

**If ANY timing test fails (>90 sec to First Insight OR >120 sec core flow):**
- Redesign screens (may need to cut Shuffle animation, condense questions further, reduce reading text)
- Re-test with 5 users
- Do not proceed to wireframe visual design until timing passes

**If accessibility fails:**
- Redesign layout
- Re-test
- Do not proceed until WCAG AA passed

**If "No Magic" test fails on any screen:**
- Remove or justify the screen
- Core flow cannot have "nice-to-have" screens
- Re-test

**Approval gate:** All tests pass → Aşama 3 (Design System & Visual Language)

---

## Sonraki Adım

Aşama 3: Design System & Premium Visual Language

(Renk, tipografi, component, tone-of-voice kuralları tanımlanır)
