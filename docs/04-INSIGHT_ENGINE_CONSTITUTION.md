# Insight Engine Constitution — Core Flow & Data Model

## Purpose

Insight Engine, çekirdek mimari. Topic'ten Reading'e kadar akış tanımlar.

Her modül (Tarot, Dream, Journal, vb.) bu çekirdeği kullanır.

---

## Core Data Flow

```
┌─────────────────────────────────────────────────┐
│ 1. INTAKE PHASE                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ Topic Selection                           │  │
│ │ (relationship, career, mood, general)     │  │
│ │ → user_topic                              │  │
│ └───────────────────────────────────────────┘  │
│                    ↓                            │
│ ┌───────────────────────────────────────────┐  │
│ │ Persona Detection Questions (3-4 q)      │  │
│ │ → user_persona_type                       │  │
│ │ → persona_confidence (0-1)                │  │
│ └───────────────────────────────────────────┘  │
│                    ↓                           │
│ ┌───────────────────────────────────────────┐  │
│ │ Context Questions (3-5 q, topic-specific)│  │
│ │ → user_context_answers (JSON)             │  │
│ │ → intake_summary (string)                 │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 2. RECOMMENDATION PHASE                         │
│ ┌───────────────────────────────────────────┐  │
│ │ System suggests best spread               │  │
│ │ Input: topic + context_answers            │  │
│ │ Output: recommended_spread (3_card|5_card)│  │
│ │ Confidence: spread_confidence (0-1)       │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 3. SELECTION PHASE (Client-side)                │
│ ┌───────────────────────────────────────────┐  │
│ │ User taps deck (3 or 5 positions)         │  │
│ │ → selected_positions [1,3,5] or [1,2,...]│  │
│ │ → deck_seed (random, server-generated)    │  │
│ │ → selection_order (time-stamped)          │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 4. CARD REVEAL PHASE                            │
│ ┌───────────────────────────────────────────┐  │
│ │ Server: validate selection + reveal cards │  │
│ │ Input: deck_seed, selected_positions      │  │
│ │ Output: revealed_cards [                  │  │
│ │   { cardId, position, upright/reversed }  │  │
│ │ ]                                         │  │
│ │ → card_reveal_order (1st, 2nd, 3rd)      │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 5. READING GENERATION PHASE                     │
│ ┌───────────────────────────────────────────┐  │
│ │ [Deterministic Layer]                     │  │
│ │ - Card meanings lookup                    │  │
│ │ - Position context                        │  │
│ │ - Topic relevance                         │  │
│ │ → deterministic_reading (JSON)            │  │
│ │                                           │  │
│ │ [Synthesis Layer]                         │  │
│ │ - Theme patterns                          │  │
│ │ - Card relationships                      │  │
│ │ - Context connections                     │  │
│ │ → synthesis_patterns (array)              │  │
│ │                                           │  │
│ │ [AI Language Layer]                       │  │
│ │ - Claude: rewrite + personalize           │  │
│ │ - Persona-aware tone                      │  │
│ │ → ai_reading (text)                       │  │
│ │                                           │  │
│ │ [Validation]                              │  │
│ │ - Zod schema check                        │  │
│ │ - Prohibited phrase scan                  │  │
│ │ - Tone check (manipulation filter)        │  │
│ │ → reading_validated (boolean)             │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 6. DISPLAY & FEEDBACK PHASE                     │
│ ┌───────────────────────────────────────────┐  │
│ │ Show: card + persona-specific text        │  │
│ │ Collect: helpfulness_score (1-3)          │  │
│ │ Collect: user_notes (optional)            │  │
│ │                                           │  │
│ │ Prompt: Save result? (requires auth)      │  │
│ │ Prompt: Premium interest?                 │  │
│ │ Prompt: 1-week reminder (email)           │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 7. PERSISTENCE PHASE (optional)                 │
│ ┌───────────────────────────────────────────┐  │
│ │ User saves: auth (magic link / Google)    │  │
│ │ Save to: readings table                   │  │
│ │ Also save:                                │  │
│ │ - cards_selected (JSON)                   │  │
│ │ - interpretation (JSON)                   │  │
│ │ - helpfulness_score                       │  │
│ │ - personas_at_time (snapshot)             │  │
│ │ - reflection_prompt_shown_at              │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 8. REFLECTION PHASE (1+ weeks)                  │
│ ┌───────────────────────────────────────────┐  │
│ │ Email reminder: "1 hafta oldu..."         │  │
│ │ User: Opens link, views reading           │  │
│ │ User: Adds reflection note                │  │
│ │ Save to: reading_reflections table        │  │
│ │ Next: Future reading'lerde context use    │  │
│ └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Data Model

### Core Tables

```sql
TABLE users {
  id UUID PK
  email STRING UNIQUE
  provider ENUM('magic_link', 'google')
  name STRING
  persona_type ENUM('first_timer', 'regular', 'anxious', 'decision_maker', 'skeptic')
  persona_confidence DECIMAL(0-1)
  persona_updated_at TIMESTAMP
  created_at TIMESTAMP
  last_reading_at TIMESTAMP
}

TABLE readings {
  id UUID PK
  user_id UUID FK (nullable for guests)
  session_id STRING (guest session tracking)
  
  -- Intake data
  topic ENUM('relationship', 'career', 'mood', 'general')
  persona_at_reading ENUM (snapshot)
  context_answers JSONB
  
  -- Spread & cards
  spread_type ENUM('three_card', 'five_card')
  cards_revealed JSONB [{
    cardId: string,
    position: string,
    upright: boolean,
    meaning_deterministic: string
  }]
  
  -- Reading
  interpretation JSONB {
    deterministic: string,
    synthesis: string[],
    ai_text: string,
    validated: boolean
  }
  
  -- User feedback
  helpfulness_score ENUM(1,2,3) -- 1=not helpful, 2=somewhat, 3=very helpful
  user_notes TEXT (optional)
  
  -- Reflection
  reflection_prompt_shown_at TIMESTAMP
  reflected_at TIMESTAMP
  reflection_text TEXT
  
  created_at TIMESTAMP
}

TABLE reading_reflections {
  id UUID PK
  reading_id UUID FK
  user_note TEXT
  outcome_status ENUM('happened', 'partial', 'not_yet', 'different')
  created_at TIMESTAMP
}

TABLE analytics_events {
  id UUID PK
  session_id STRING
  user_id UUID FK (nullable)
  event_name STRING (14 events)
  event_data JSONB
  created_at TIMESTAMP
  
  INDEX(session_id, created_at)
}
```

---

## Rate Limiting & Cooldown

```sql
-- Free users
SELECT COUNT(*) FROM readings 
WHERE user_id = ? AND created_at > NOW() - interval 7 days
HAVING COUNT(*) < 2  -- 2 per week

-- Same-topic cooldown
SELECT * FROM readings
WHERE user_id = ? AND topic = ? AND created_at > NOW() - interval 24 hours
HAVING COUNT(*) = 0  -- must be empty (no reading today for this topic)

-- Premium users (future)
SELECT COUNT(*) FROM readings
WHERE user_id = ? AND created_at > NOW() - interval 1 month
HAVING COUNT(*) < 20  -- 20 per month (example)
```

---

## Error Handling & Fallback

### API Failure Scenarios

1. **Claude API down/rate limit:**
   - Deterministic + Synthesis only (no AI Language)
   - Message: "AI insights unavailable; showing card meanings"

2. **Database error:**
   - Guest-only mode (no save)
   - Message: "Can't save now; screenshot your reading"

3. **Persona detection low confidence (<0.5):**
   - Default tone: balanced, educational
   - Prompt: "Update your profile?"

---

## Validation Rules

Every step must validate:

- **Intake validation:** User answer not empty, topic exists
- **Persona validation:** Detection algorithm must assign one of 5
- **Card validation:** Revealed cards exist in database, no duplicates
- **Reading validation:** Zod schema, prohibited phrases, tone check
- **Feedback validation:** Helpfulness 1-3, notes < 500 chars

---

## Next Steps

Visual Constitution. Kart üretim standardları.
