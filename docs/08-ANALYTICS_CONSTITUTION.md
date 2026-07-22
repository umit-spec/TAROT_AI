# Analytics Constitution — KPIs, Events & Measurement

## Primary Metrics (MVP Success)

| Metric | Target | Threshold |
|--------|--------|-----------|
| **Completion Rate** | >70% | <50% = FAIL |
| **Helpfulness Score Avg** | ≥2.0/3.0 | <1.5 = FAIL |
| **Premium Interest CTR** | ≥15% | <10% = REVISE |
| **7-day Return Rate** | ≥20% | <15% = INVESTIGATE |
| **Same-topic Re-read Rate** | <20% | >50% = ADDICTION ALERT |
| **Security Incidents** | 0 | >0 = CRITICAL |

---

## Events Schema (14 Events)

```json
{
  "landing_view": {
    "description": "User lands on home page",
    "properties": {
      "source": "direct|google|link|app",
      "device": "mobile|tablet|desktop",
      "referrer": "string"
    }
  },
  
  "reading_started": {
    "description": "User initiates reading flow",
    "properties": {
      "user_id": "uuid|null (guest)",
      "session_id": "string"
    }
  },
  
  "topic_selected": {
    "description": "User chooses topic",
    "properties": {
      "topic": "relationship|career|mood|general",
      "time_to_selection": "ms"
    }
  },
  
  "persona_detected": {
    "description": "System assigns persona",
    "properties": {
      "persona_type": "first_timer|regular|anxious|decision_maker|skeptic",
      "confidence": 0.0-1.0,
      "questions_asked": 3|4|5
    }
  },
  
  "intake_completed": {
    "description": "User answers all context questions",
    "properties": {
      "num_answers": 3-5,
      "time_spent": "ms"
    }
  },
  
  "spread_accepted": {
    "description": "User accepts recommended spread or chooses other",
    "properties": {
      "spread_type": "three_card|five_card",
      "recommended": true|false,
      "user_accepted_recommendation": true|false
    }
  },
  
  "cards_selected": {
    "description": "User taps card positions",
    "properties": {
      "num_cards": 3|5,
      "time_to_selection": "ms",
      "tap_sequence": [1,3,5],
      "deck_seed": "integer"
    }
  },
  
  "shuffle_animation_played": {
    "description": "Shuffle animation starts",
    "properties": {
      "duration_ms": 2000|3000
    }
  },
  
  "reading_completed": {
    "description": "User sees full reading result",
    "properties": {
      "time_to_reading": "ms (total from landing)",
      "reading_length_words": integer,
      "persona_at_delivery": "string"
    }
  },
  
  "helpfulness_submitted": {
    "description": "User rates reading helpfulness",
    "properties": {
      "score": 1|2|3,
      "text_note": "string|null"
    }
  },
  
  "result_saved": {
    "description": "User saves reading (requires auth)",
    "properties": {
      "auth_method": "magic_link|google",
      "is_new_user": true|false,
      "time_to_auth_complete": "ms"
    }
  },
  
  "premium_modal_viewed": {
    "description": "Premium offer modal shown",
    "properties": {
      "trigger": "post_reading|menu|other",
      "display_duration": "ms"
    }
  },
  
  "premium_modal_clicked": {
    "description": "User clicks premium button",
    "properties": {
      "button_action": "subscribe|learn_more|dismiss"
    }
  },
  
  "reflection_prompt_shown": {
    "description": "1-week reflection email/prompt shown",
    "properties": {
      "days_since_reading": 7,
      "opened_reflection": true|false
    }
  }
}
```

---

## Funnel Analysis

```
Landing View (100%)
  ↓ 80-90%
Topic Selected
  ↓ 85-95%
Persona Detected
  ↓ 90-95%
Intake Completed
  ↓ 90-98%
Spread Accepted
  ↓ 95-99%
Cards Selected
  ↓ 100%
Reading Completed
  ↓ 50-70% (depends on UX clarity)
Helpfulness Submitted
  ↓ 20-40%
Result Saved (requires login)
  ↓ 15-30%
Premium Modal Clicked
```

---

## Cohort Analysis

| Cohort | Metric | Target |
|--------|--------|--------|
| First-time users | Completion | >70% |
| Anxious personas | Helpfulness >2 | >60% |
| Regular practitioners | Return rate | >40% |
| Decision-makers | Premium interest | >20% |
| Premium clickers | Conversion (future) | >30% |

---

## Addiction Indicators

**Monitor:**
- Same-topic re-read within 24h (should <20%)
- Session frequency (one per day max healthy)
- Reading in late night hours (midnight-5am >20% = concern)
- Text note length (if getting shorter = disengagement OR getting obsessive)

**Threshold:**
- If >50% same-topic reads → PAUSE recommendations
- If >3 reads/day from one user → Email: "You're asking a lot; take a reflection break"
- If trend worsening → Product Owner notified

---

## Dashboard Queries (SQL)

```sql
-- Daily completion rate
SELECT 
  DATE(created_at) as day,
  COUNT(CASE WHEN event_name='reading_completed' THEN 1 END) * 100.0 
  / COUNT(CASE WHEN event_name='reading_started' THEN 1 END) as completion_rate
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Average helpfulness by persona
SELECT 
  persona_type,
  AVG(CAST(event_data->>'score' AS DECIMAL)) as avg_helpfulness
FROM analytics_events ae
JOIN readings r ON ae.session_id = r.session_id
WHERE event_name='helpfulness_submitted'
GROUP BY persona_type;

-- Premium CTR by funnel step
SELECT 
  CASE 
    WHEN LAG(event_name) OVER (PARTITION BY session_id ORDER BY created_at) = 'reading_completed' 
    THEN 'post_reading' 
    ELSE 'other' 
  END as trigger,
  COUNT(CASE WHEN event_name='premium_modal_clicked' THEN 1 END) * 100.0
  / COUNT(CASE WHEN event_name='premium_modal_viewed' THEN 1 END) as ctr
FROM analytics_events
GROUP BY trigger;
```

---

## Weekly Review Checklist

Every week, Product Owner checks:

- [ ] Completion rate trending?
- [ ] Helpfulness consistent?
- [ ] Premium interest surprising?
- [ ] Any addiction signals?
- [ ] Security incidents?
- [ ] Performance degrading?
- [ ] User feedback themes (if collected)?

---

## Next Steps

Monetization Constitution. Pricing and free/premium boundaries.
