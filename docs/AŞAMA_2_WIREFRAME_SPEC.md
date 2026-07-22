# Aşama 2 — Wireframe & User Flow Specification

## Overview

Aşama 2'nin amacı: **Tıklanabilir wireframe + time budget + accessibility + funnel analytics tanımlamak.**

Hiçbir koda, renk seçimine veya görsel asset'e ihtiyaç yok.

Yalnızca: "Kullanıcı ne görecek? Nereye dokunacak? Ne kadar sürede?"

---

## Time Budget (Maksimum 2 Dakika Total)

### Screen-by-Screen Breakdown

| Screen | Component | Target Time | Hard Limit | Notes |
|--------|-----------|-------------|-----------|-------|
| **Landing** | Hero + CTA | 10 sec | 15 sec | Browse, understand, click "Başla" |
| **Topic Selection** | 4 cards, tap one | 10 sec | 15 sec | Visual, quick |
| **Persona Questions** | 3-4 questions + answers | 25 sec | 35 sec | Read Q, pick answer, tap next |
| **Intake Questions** | 3-5 questions (topic-specific) | 20 sec | 25 sec | Shorter than persona |
| **Spread Recommendation** | System suggests, accept/change | 10 sec | 15 sec | Mostly automatic |
| **Card Selection** | Tap 3 or 5 positions on deck | 20 sec | 25 sec | Slowest part (deliberate) |
| **Shuffle Animation** | Visual reveal + shuffle | 3 sec | 5 sec | Pure animation |
| **Reading Display** | Cards + text appear | 30 sec | 45 sec | User reads |
| **Helpfulness Rating** | 1-3 score + submit | 5 sec | 10 sec | Quick feedback |
| **Save Prompt** | "Save this?" button | 5 sec | 10 sec | Accept or dismiss |
| **Premium Modal** (optional) | "Tell me when" modal | 10 sec | 15 sec | Don't linger |
| | | **TOTAL: 148 sec** | **≤120 sec target** | |

### Timing Violations (FAIL → Redesign)

If any screen takes >hard limit:
1. **Simplify.** Remove non-critical elements.
2. **Parallelize.** Show multiple items at once.
3. **Automate.** Let system decide, user confirms.

Example:
- **Persona Questions >35sec:** Remove 1 question
- **Intake >25sec:** Combine 2 questions or use radio buttons
- **Card Selection >25sec:** Show fewer card previews

---

## Funnel Analytics (Events)

Every screen transition = event fired.

```
1. landing_view
   ├─ device: "mobile" | "tablet" | "desktop"
   ├─ referrer: "direct" | "google" | "link"
   └─ [User has ~15 sec here]
   
   ↓ Click "Başla"

2. topic_selected
   ├─ topic: "relationship" | "career" | "mood" | "general"
   ├─ time_to_selection: milliseconds
   └─ [User has ~15 sec here]
   
   ↓ Tap topic card

3. persona_questions_started
   ├─ num_questions: 3 or 4
   └─ [User has ~35 sec here]
   
   ↓ Answer persona Qs

4. persona_detected
   ├─ persona_type: "first_timer" | "regular" | "anxious" | "decision_maker" | "skeptic"
   ├─ confidence: 0.0-1.0
   └─ [System detects, no delay]
   
   ↓ Auto-proceed to intake Qs

5. intake_questions_started
   ├─ num_questions: 3-5 (topic-specific)
   ├─ topic: [previous topic]
   └─ [User has ~25 sec here]
   
   ↓ Answer intake Qs

6. intake_completed
   ├─ time_spent: milliseconds
   └─ [Ready for spread]
   
   ↓ Auto-proceed to recommendation

7. spread_recommended
   ├─ recommended_spread: "three_card" | "five_card"
   ├─ confidence: 0.0-1.0
   └─ [System recommends, ~10 sec user decides]
   
   ↓ Accept or change

8. spread_accepted
   ├─ spread_type: "three_card" | "five_card"
   ├─ user_accepted_recommendation: true | false
   └─ [Ready for card selection]
   
   ↓ Proceed to card deck

9. card_selection_started
   ├─ spread_type: [previous]
   ├─ deck_seed: integer (random)
   └─ [User has ~25 sec to select cards]
   
   ↓ User taps 3 or 5 card positions

10. cards_selected
    ├─ num_cards: 3 | 5
    ├─ tap_order: [pos1, pos3, pos5]
    ├─ time_to_selection: milliseconds
    └─ [Ready to reveal]
    
    ↓ Auto-reveal with shuffle animation

11. shuffle_animation_played
    ├─ duration_ms: 2000-3000
    └─ [Visual feedback only]
    
    ↓ Cards flip

12. reading_displayed
    ├─ time_to_delivery: milliseconds (total from landing)
    ├─ reading_length_words: integer
    ├─ persona_at_display: [detected persona]
    └─ [User reads, ~45 sec]
    
    ↓ Read + absorb

13. helpfulness_submitted
    ├─ score: 1 | 2 | 3
    ├─ text_note: "string" | null
    └─ [5-10 sec feedback]
    
    ↓ Rate helpful

14. save_prompted
    ├─ user_action: "save" | "dismiss"
    └─ [5-10 sec decide]
    
    ↓ "Save this reading?"

15. (Optional) premium_modal_viewed
    ├─ trigger: "post_reading"
    ├─ display_duration: milliseconds
    └─ User sees offer, <15 sec

16. (Optional) premium_modal_clicked
    ├─ button: "tell_me_when" | "learn_more" | "dismiss"
    └─ End of session

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

### Screen Audit

| Screen | Essential? | Reason |
|--------|------------|--------|
| **Landing** | ✅ YES | User needs to understand product value before starting |
| **Topic Selection** | ✅ YES | Determines questions + spread + tone |
| **Persona Q's** | ✅ YES | Persona drives reading tone; without it all reads sound same |
| **Persona Detection** | ✅ YES | (System step, invisible to user) |
| **Intake Q's** | ✅ YES | Context for reading; without it, generic |
| **Spread Recommendation** | ✅ YES | (Could auto-select, but showing choice respects user autonomy) |
| **Card Selection** | ✅ YES | Core tarot experience; ritual matters |
| **Shuffle Animation** | ⚠️ MAYBE | Nice-to-have; can be removed if tight on time |
| **Reading Display** | ✅ YES | The whole point |
| **Helpfulness Rating** | ✅ YES | Essential for MVP success metrics |
| **Save Prompt** | ✅ YES | Conversion funnel (free → registered) |
| **Premium Modal** | ⚠️ MAYBE | Can be skip-able; gentle nudge vs hard sell |

**MVP Minimum Flow:**
Landing → Topic → Persona Q's → Intake Q's → Card Select → Reading → Rate → Save

(Shuffle + Premium are enhancements, can defer if timing tight)

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

## Metrics Per Screen

Each screen needs a success metric:

| Screen | Metric | Target | Fail |
|--------|--------|--------|------|
| Landing | CTA click rate | >80% (of viewers) | <60% |
| Topic Selection | Abandonment rate | <5% | >10% |
| Persona Q's | Completion rate | >95% | <90% |
| Intake Q's | Completion rate | >95% | <90% |
| Spread Recommendation | Acceptance rate | >70% (of recs) | <50% |
| Card Selection | Completion rate | >98% | <95% |
| Shuffle Animation | Engagement (watched) | >95% | <80% |
| Reading Display | Time spent | 30-60 sec | <15 sec or >2 min |
| Helpfulness Rating | Submission rate | >50% | <30% |
| Save Prompt | Save rate | >20% | <10% |
| Premium Modal | CTR | >15% | <10% |

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

### Files to Deliver

```
design/
├── wireframes/
│   ├── 01-landing.svg
│   ├── 02-topic-selection.svg
│   ├── 03-persona-questions.svg
│   ├── 04-intake-questions.svg
│   ├── 05-spread-recommendation.svg
│   ├── 06-card-selection.svg
│   ├── 07-reading-display.svg
│   ├── 08-helpfulness-rating.svg
│   ├── 09-save-prompt.svg
│   └── 10-premium-modal.svg
│
├── WIREFRAME_SPEC.md (this file + updates)
├── ACCESSIBILITY_CHECKLIST.md (audit)
├── TIME_BUDGET_VALIDATION.md (timing test results)
├── FUNNEL_FLOW_MAP.json (event sequence)
└── PROTOTYPE_LINK.md (Figma or live link)
```

---

## Testing Protocol (End of Aşama 2)

### 5 Real Users

Test wireframe with 5 new users:

1. **Timing Test:**
   - Measure each screen time
   - Total time <2 min?

2. **Clarity Test:**
   - Can user understand each screen's purpose?
   - Any confusion?

3. **Accessibility Test:**
   - Can they use one-handed (mobile)?
   - Button sizes comfortable?

4. **Funnel Test:**
   - Do they complete all steps?
   - Where do they abandon?

5. **Persona Adaptation Test:**
   - Show same wireframe to first-timer + regular
   - Do they perceive differences in tone? (later, in design)

---

## PASS Criteria (Aşama 2 → Aşama 3)

- ✅ All 10 screens wireframed
- ✅ 2-minute timing validated (5 users average <120 sec)
- ✅ Mobile-first responsive (375px minimum)
- ✅ All 16 funnel events mapped to screens
- ✅ Accessibility audit passed (contrast, tap targets, keyboard)
- ✅ "No Magic" test passed (every screen justified)
- ✅ Persona variations noted (5 different paths documented)
- ✅ Per-screen metrics defined
- ✅ 5 user tests completed, feedback incorporated
- ✅ Wireframe tıklanabilir (Figma prototype or HTML)

**If ANY fails:** Redesign and re-test.

---

## Sonraki Adım

Aşama 3: Design System & Premium Visual Language

(Renk, tipografi, component, tone-of-voice kuralları tanımlanır)
