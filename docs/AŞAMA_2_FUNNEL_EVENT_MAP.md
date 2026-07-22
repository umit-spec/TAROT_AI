# Aşama 2 — 12 Core Funnel Events & Screen Mapping

## Overview

This document maps each of the 12 core funnel events to specific wireframe screens, ensuring complete analytics coverage and funnel visibility.

**Core Funnel Flow:**
```
Landing View (Event 1)
  ↓ Click "Başla"
Topic Selected (Event 2)
  ↓ Tap topic card
Questions Started (Event 3)
  ↓ First question appears
Questions Completed (Event 4)
  ↓ All 3 questions answered
Spread Inline Recommended (Event 5)
  ↓ System suggests spread, user accepts/changes
Spread Confirmed (Event 6)
  ↓ Ready to select cards
Cards Selection Started (Event 7)
  ↓ Tap card positions
Cards Selected (Event 8)
  ↓ All positions selected
Shuffle Animation Played (Event 9)
  ↓ Shuffle animation completes
First Insight Displayed (Event 10) ← PRIMARY KPI: ≤90 sec milestone
  ↓ User reads first insight (12 sec)
Detailed Synthesis Viewed (Event 11)
  ↓ User reads full reading
Helpfulness Submitted (Event 12)
  ↓ User rates 1-3 + save prompt
Save Prompted (Event 13)
  ↓ "Save this?" decision
[CORE FLOW ENDS — ≤120 sec target]

(Premium Modal shown separately post-session)
```

---

## Event-by-Event Specification

### 1. Landing View
**Screen:** 01-landing.svg

**Trigger:** User lands on home page or refreshes

**Properties to capture:**
```json
{
  "event_name": "landing_view",
  "device": "mobile" | "tablet" | "desktop",
  "referrer": "direct" | "google" | "link" | "app",
  "timestamp": "ISO8601",
  "session_id": "uuid",
  "user_id": "uuid | null (guest)"
}
```

**Wireframe element:** Page load complete, hero visible

**Success metric:** CTA visible, call to action "Başla" is clickable

**Timing:** Part of 8-sec Landing budget

---

### 2. Topic Selected
**Screen:** 02-topic-selection.svg

**Trigger:** User taps one of 4 topic cards

**Properties to capture:**
```json
{
  "event_name": "topic_selected",
  "topic": "relationship" | "career" | "mood" | "general",
  "time_to_selection": "ms (from landing_view)",
  "card_position": 1 | 2 | 3 | 4,
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** One of 4 cards becomes active/highlighted, screen transitions to questions

**Success metric:** Topic card clickable, selection registers

**Timing:** 8 sec to tap topic card (part of 8-sec Topic Selection budget)

---

### 3. Questions Started
**Screen:** 03-merged-questions.svg (first question)

**Trigger:** First question appears on screen after topic selection

**Properties to capture:**
```json
{
  "event_name": "questions_started",
  "num_questions": 3,
  "includes_persona_detect": true,
  "persona_type_at_start": null,
  "topic": "relationship" | "career" | "mood" | "general",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** First question UI appears, input field ready for answer

**Success metric:** Question is readable, input method available (radio/text/etc)

**Timing:** Start of 25-sec Questions budget

---

### 4. Questions Completed
**Screen:** 03-merged-questions.svg (after Q3 answered)

**Trigger:** User answers 3rd question, system processes answers for persona detection

**Properties to capture:**
```json
{
  "event_name": "questions_completed",
  "persona_type": "first_timer" | "regular" | "anxious" | "decision_maker" | "skeptic",
  "persona_confidence": 0.0 to 1.0,
  "time_spent": "ms (from questions_started)",
  "answers_given": {
    "q1": "string",
    "q2": "string",
    "q3": "string"
  },
  "spread_recommended": "three_card" | "five_card",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** All 3 questions answered, system indicator (subtle) shows persona detection complete, spread recommendation appears inline

**Success metric:** Persona algorithm completes, spread suggestion displayed

**Timing:** End of 25-sec Questions budget (at ~25 sec from topic selection)

---

### 5. Spread Inline Recommended
**Screen:** 03-merged-questions.svg (inline recommendation, part of Q screen)

**Trigger:** After Q3 answered, spread recommendation appears

**Properties to capture:**
```json
{
  "event_name": "spread_inline_recommended",
  "recommended_spread": "three_card" | "five_card",
  "confidence": 0.0 to 1.0,
  "persona_type": "first_timer" | "regular" | "anxious" | "decision_maker" | "skeptic",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** Inline card/modal showing spread recommendation, two buttons: "Accept" + "Change to [other]"

**Success metric:** Recommendation visible, accept/change buttons clickable

**Timing:** Within 25-sec Questions budget (last 5 sec, or auto-advance at 25 sec)

---

### 6. Spread Confirmed
**Screen:** Transition from 03-merged-questions.svg to 04-card-selection.svg

**Trigger:** User taps "Accept" or "Change to 5-card / 3-card", then advances to card selection

**Properties to capture:**
```json
{
  "event_name": "spread_confirmed",
  "spread_type": "three_card" | "five_card",
  "user_accepted_recommendation": true | false,
  "recommended_spread": "three_card" | "five_card",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** Spread choice locked in, card selection screen loads

**Success metric:** Card selection grid displays correct number of positions (3 or 5)

**Timing:** ~30 sec cumulative (end of spread recommendation phase)

---

### 7. Cards Selection Started
**Screen:** 04-card-selection.svg (initial state, deck visible, positions labeled)

**Trigger:** Card selection screen fully loads, ready for user interaction

**Properties to capture:**
```json
{
  "event_name": "cards_selection_started",
  "spread_type": "three_card" | "five_card",
  "deck_seed": "integer (for reproducibility)",
  "num_positions": 3 | 5,
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** Deck displayed (78 cards visible as grid or scrollable), 3 or 5 empty position boxes labeled (e.g., "Position 1: Past", "Position 2: Present", "Position 3: Future")

**Success metric:** Deck loads, position labels visible, first card tappable

**Timing:** Start of 18-sec Card Selection budget (~30 sec cumulative)

---

### 8. Cards Selected
**Screen:** 04-card-selection.svg (after all positions filled)

**Trigger:** User taps 3rd or 5th card, all positions now occupied

**Properties to capture:**
```json
{
  "event_name": "cards_selected",
  "num_cards": 3 | 5,
  "tap_sequence": [card_id_1, card_id_2, card_id_3] or [card_id_1...card_id_5],
  "time_to_selection": "ms (from cards_selection_started)",
  "spread_type": "three_card" | "five_card",
  "deck_seed": "integer",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** All position boxes filled with selected card names/images, "Reveal" button appears and becomes enabled, deck selection screen still visible (for review)

**Success metric:** All positions filled, Reveal button clickable

**Timing:** ~48 sec cumulative (18 sec for selection + 30 sec prior)

---

### 9. Shuffle Animation Played
**Screen:** 05-shuffle-animation.svg (cards animating)

**Trigger:** User clicks "Reveal", shuffle animation begins

**Properties to capture:**
```json
{
  "event_name": "shuffle_animation_played",
  "duration_ms": 4000,
  "animation_type": "shuffle" | "flip" | "instant (if prefers-reduced-motion)",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:** Cards animate (rotate, shuffle visual, then flip to show face)

**Success metric:** Animation completes without stutter, 4 sec duration

**Timing:** ~52 sec cumulative (4 sec animation)

---

### 10. First Insight Displayed ⭐ PRIMARY KPI MILESTONE
**Screen:** 06-first-insight-display.svg

**Trigger:** Shuffle animation completes, First Insight text appears on screen

**Properties to capture:**
```json
{
  "event_name": "first_insight_displayed",
  "time_to_delivery_ms": "ms (total from landing_view)",
  "first_insight_words": "~50 words",
  "persona_type": "first_timer" | "regular" | "anxious" | "decision_maker" | "skeptic",
  "reading_layer": "first_insight (deterministic + synthesis + ai language)",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:**
- Cards displayed at top (3 or 5, face-up, with card names)
- Below cards: "First Insight" heading
- Initial meaning + relevance text (~50 words, persona-specific tone)
- Implicit call-to-action or scroll indicator: "Read more below" or similar
- Timing indicator: "≤90 sec total from landing" tracked in backend

**Success metric:** Text visible, cards revealed, time_to_delivery_ms ≤90,000 (90 sec)

**CRITICAL PASS CONDITION:** Average of 5 users' time_to_delivery ≤90 sec; max ≤100 sec

**Timing:** ~52 sec + 12 sec read = ~64 sec cumulative (but milestone should be at ~56 sec when text first appears, user reads over next 12 sec)

---

### 11. Detailed Synthesis Viewed
**Screen:** 07-detailed-synthesis-display.svg (full reading visible)

**Trigger:** User scrolls or auto-advances to detailed synthesis section

**Properties to capture:**
```json
{
  "event_name": "detailed_synthesis_viewed",
  "time_to_view_ms": "ms (from first_insight_displayed)",
  "full_reading_words": "integer (~200-250 words, persona-specific)",
  "read_duration_ms": "ms (NOT measured as strict budget, but tracked for UX insight)",
  "persona_type": "first_timer" | "regular" | "anxious" | "decision_maker" | "skeptic",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:**
- Cards still visible at top (persistent)
- "Detailed Reading" section with full text
- Persona-specific framing (explanatory, symbolic, empowering, actionable, or scientific)
- Reflection question at bottom ("What one action could you take?")
- "Helpful?" rating button below
- Read duration is tracked but NOT limited (user can linger)

**Success metric:** Full reading text loads and is readable, no layout breaks

**Timing:** User reads naturally; time_to_view starts from First Insight; no hard limit, but typical 30-60 sec

---

### 12. Helpfulness Submitted
**Screen:** 08-helpfulness-rating.svg

**Trigger:** User selects 1, 2, or 3 rating, optionally adds text note, taps "Submit"

**Properties to capture:**
```json
{
  "event_name": "helpfulness_submitted",
  "score": 1 | 2 | 3,
  "text_note": "string (optional)" | null,
  "time_to_submission_ms": "ms (from detailed_synthesis_viewed)",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:**
- Question: "How helpful was this reading?" with 3 emoji/text options (1="Not helpful" to 3="Very helpful")
- Optional text field: "Tell us why:" (small, unobtrusive)
- Submit button
- After submit: Save prompt appears

**Success metric:** Rating registers, optional text captured, next step appears

**Timing:** ~96 sec cumulative (5 sec to rate)

---

### 13. Save Prompted
**Screen:** 09-save-prompt.svg

**Trigger:** After helpfulness submitted, save prompt appears

**Properties to capture:**
```json
{
  "event_name": "save_prompted",
  "user_action": "save" | "dismiss",
  "auth_method": "magic_link" | "google" | "guest" | null,
  "is_new_user": true | false,
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Wireframe element:**
- Modal or inline prompt: "Save this reading to your account?"
- Two buttons: "Save" + "Maybe Later"
- If guest: Save button leads to auth flow (magic link + Google)
- If logged in: Save button directly saves

**Success metric:** Prompt visible, both buttons clickable

**Timing:** ~101 sec cumulative (5 sec to decide)

**CORE FLOW ENDS HERE (115 sec total, ≤120 sec target)**

---

## Premium Modal (DEFERRED — Outside Core Flow)

**Screen:** 10-premium-modal.svg

**Trigger:** After save_prompted action, user either saves or dismisses, then premium modal appears (optional, post-session)

**Properties to capture:**
```json
{
  "event_name": "premium_modal_viewed",
  "trigger": "post_session",
  "display_duration_ms": "ms",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**AND/OR:**

```json
{
  "event_name": "premium_modal_clicked",
  "button_action": "tell_me_when" | "learn_more" | "dismiss",
  "session_id": "uuid",
  "timestamp": "ISO8601"
}
```

**Note:** These events are tracked separately and NOT included in the core flow time budget (115 sec).

---

## Analytics Dashboard Queries

### Core Funnel Completion Rate
```sql
SELECT 
  DATE(created_at) as day,
  COUNT(DISTINCT session_id) as sessions_started,
  COUNT(DISTINCT CASE WHEN event_name='first_insight_displayed' THEN session_id END) as reached_first_insight,
  COUNT(DISTINCT CASE WHEN event_name='save_prompted' THEN session_id END) as core_flow_complete,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event_name='save_prompted' THEN session_id END) 
    / COUNT(DISTINCT session_id), 2) as completion_rate
FROM analytics_events
WHERE event_name IN ('landing_view', 'first_insight_displayed', 'save_prompted')
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

### Time to First Insight Tracking
```sql
SELECT 
  DATE(created_at) as day,
  AVG(CAST(event_data->>'time_to_delivery_ms' AS DECIMAL)) / 1000 as avg_seconds,
  MAX(CAST(event_data->>'time_to_delivery_ms' AS DECIMAL)) / 1000 as max_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CAST(event_data->>'time_to_delivery_ms' AS DECIMAL)) / 1000 as p50_seconds,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY CAST(event_data->>'time_to_delivery_ms' AS DECIMAL)) / 1000 as p95_seconds
FROM analytics_events
WHERE event_name='first_insight_displayed'
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

### Persona Distribution & Helpfulness
```sql
SELECT 
  event_data->>'persona_type' as persona_type,
  COUNT(DISTINCT session_id) as total_sessions,
  AVG(CAST(next_event_data->>'score' AS DECIMAL)) as avg_helpfulness,
  COUNT(CASE WHEN CAST(next_event_data->>'score' AS INT) >= 2 THEN 1 END) * 100.0 
    / COUNT(DISTINCT session_id) as pct_helpful
FROM analytics_events ae
LEFT JOIN analytics_events ae2 ON ae.session_id = ae2.session_id 
  AND ae2.event_name='helpfulness_submitted' 
  AND ae2.created_at > ae.created_at
WHERE ae.event_name='first_insight_displayed'
GROUP BY event_data->>'persona_type'
ORDER BY total_sessions DESC;
```

### Save Rate by Funnel Step
```sql
SELECT 
  'landing_view' as event,
  COUNT(DISTINCT session_id) as count
FROM analytics_events
WHERE event_name='landing_view'
UNION ALL
SELECT 
  'topic_selected',
  COUNT(DISTINCT session_id)
FROM analytics_events
WHERE event_name='topic_selected'
UNION ALL
SELECT 
  'first_insight_displayed',
  COUNT(DISTINCT session_id)
FROM analytics_events
WHERE event_name='first_insight_displayed'
UNION ALL
SELECT 
  'save_prompted',
  COUNT(DISTINCT session_id)
FROM analytics_events
WHERE event_name='save_prompted'
ORDER BY count DESC;
```

---

## Event Validation Checklist (Wireframe Testing)

Before approving wireframe for visual design:

- [ ] Event 1 (landing_view): Fires on page load
- [ ] Event 2 (topic_selected): Fires when topic card tapped
- [ ] Event 3 (questions_started): Fires when first question appears
- [ ] Event 4 (questions_completed): Fires after Q3 answered, persona detected
- [ ] Event 5 (spread_inline_recommended): Fires when spread recommendation appears
- [ ] Event 6 (spread_confirmed): Fires when spread choice locked
- [ ] Event 7 (cards_selection_started): Fires when card selection screen loads
- [ ] Event 8 (cards_selected): Fires when all card positions filled
- [ ] Event 9 (shuffle_animation_played): Fires when shuffle animation starts
- [ ] Event 10 (first_insight_displayed): Fires when first insight text appears; **time_to_delivery_ms ≤90,000**
- [ ] Event 11 (detailed_synthesis_viewed): Fires when full reading visible
- [ ] Event 12 (helpfulness_submitted): Fires when rating submitted
- [ ] Event 13 (save_prompted): Fires when save modal appears; **core flow ends here**
- [ ] Bonus: Premium modal events fire post-session (not measured in core flow)

---

## Success Metrics

| Metric | Target | Fail Threshold |
|--------|--------|----------------|
| **Time to First Insight** | ≤90 sec (avg, 5 users) | >90 sec avg OR any user >100 sec |
| **Core Flow Completion** | ≤120 sec (avg, 5 users) | >120 sec avg OR any user >130 sec |
| **Completion Rate** | >70% (landing → save) | <50% |
| **Helpfulness Avg** | ≥2.0/3.0 | <1.5/3.0 |
| **Event Capture** | 100% of core 13 events | Any event missing |

