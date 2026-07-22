# Reading Constitution — 3-Layer Reading Engine Specification

## Purpose

Reading Engine, 3 katmanda çalışır. Her katman net bir görevle sınırlandırılır.

AI, tüm katmanı kontrol etmez; sadece Language Layer'da çalışır.

---

## Layer 1: Deterministic Knowledge Layer

**Input:**
- `cardId` (00-21)
- `position` (past, present, future, or 5-card positions)
- `topic` (relationship, career, mood, general)

**Process:**
```typescript
const cardMeaning = await db.query(`
  SELECT 
    base_meaning,
    position_meanings[${position}],
    context_meanings[${topic}]
  FROM cards WHERE id = ${cardId}
`)
```

**Output:**
```typescript
{
  card_id: "00",
  card_name_tr: "Aptal",
  position: "past",
  topic: "relationship",
  
  base_meaning: "Yeni başlangıç, macera, bilinmeyenliğe adım atma",
  position_meaning: "İlişkinin başında bir cesaret anı",
  topic_meaning: "Aşkta ilk riskleri almak, açılmak",
  
  reflection_question: "Neyi riske atmaya hazırız?",
  
  keywords: ["başlangıç", "cesaret", "belirsizlik"],
  
  red_flags: [
    "avoid: 'kesinlikle geçecek'",
    "avoid: 'aldatılıyorsunuz'",
    "instead: 'potansiyel gösteriyor'"
  ]
}
```

**Rules:**
- NEVER output is "kesin kehanet"
- NEVER mentions health/legal/financial outcomes
- ALWAYS contextual to topic
- ALWAYS includes red_flags

**Data Source:** PostgreSQL cards table (hardcoded Türkçe meanings)

---

## Layer 2: Synthesis Layer

**Input:**
- Array of Layer 1 outputs (3 or 5 cards)
- `user_context_answers` (intake answers)
- `persona_type` (for framing)

**Process:**

```typescript
// Identify patterns
const themes = analyzePatterns([card1, card2, card3])
  // Look for repeated symbols, numbers, elements
  // E.g., 3 cards = 2 water symbols = "emotional focus"

const narrative = buildNarrative(themes, position_sequence)
  // E.g., Past (beginning) → Present (challenge) → Future (growth)
  // Tell story arc

const relevance = mapToContext(narrative, user_answers)
  // Connect patterns to user's actual question
  // E.g., if user said "communication issues", 
  // and cards show isolation → connection → dialogue
  // Point this out

const implications = suggestPerspectives(themes)
  // What could user think about differently?
  // What angles haven't they considered?
```

**Output:**
```typescript
{
  themes: [
    {
      symbol: "water",
      count: 2,
      meaning: "Emotional currents are central",
      cards_involved: ["cups_3", "cups_10"]
    }
  ],
  
  narrative_arc: "Initial vulnerability → Current stability → Future depth",
  
  user_relevance: [
    "You mentioned 'feeling stuck.' These cards suggest emotional depth, not blockage.",
    "The progression from Past to Future shows movement, even if slow."
  ],
  
  angles_to_consider: [
    "How might vulnerability be your strength here?",
    "What could it mean to trust the current pace?"
  ],
  
  caution_areas: [
    "Don't rush the process",
    "Listen to your body and emotions"
  ]
}
```

**Rules:**
- NEVER interprets "destiny" or "certainty"
- ALWAYS grounded in card meanings
- ALWAYS acknowledges user's autonomy
- NEVER contradicts Layer 1 outputs

---

## Layer 3: AI Language Layer

**Input:**
- Layer 1 (deterministic meanings)
- Layer 2 (synthesis patterns)
- `persona_type` (reading tone)
- `persona_confidence` (how strongly to apply tone)
- `user_name` (optional personalization)

**Process:**

Claude API call with system message:

```
You are an ethical tarot guide. Your only job is to:

1. Take structured card meanings (provided in JSON)
2. Organize them into flowing Türkçe prose
3. Apply tone based on user persona
4. Maintain all safety guardrails

STRICT RULES:
- Never invent card meanings. Use only provided data.
- Never make predictions or certainties.
- Never suggest health/legal/financial actions.
- Never use manipulative language.
- Always end with reflection question, not command.

USER PERSONA: [persona_type]
TONE RULES FOR THIS PERSONA: [persona-specific frases]

Generate natural, flowing reading that:
- Feels personal but not creepy
- Honors the cards' meanings
- Asks thoughtful questions
- Respects user's autonomy
```

**Output:**
```
[Natural Türkçe reading, ~300-400 words, persona-appropriate tone]
```

**Validation:**

After AI generates text:

```typescript
const validation = {
  schema_valid: validateZodSchema(reading),
  prohibited_phrases: scanForProhibited(reading),
  tone_check: detectManipulation(reading),
  length_ok: 200 < reading.length < 500
}

if (!validation.schema_valid || validation.prohibited_phrases.length > 0) {
  // Rewrite request to Claude
  console.log("Rewriting: ", validation.prohibited_phrases)
  reading = await claude.messages.create({
    system: system_message + "\n\nREWRITE: Remove these phrases: " + prohibited,
    messages: [...]
  })
}
```

**Fallback (Claude unavailable):**
```
If API fails or rate-limited:
1. Return Layer 1 + Layer 2 as structured JSON
2. Message: "AI insights unavailable; showing card meanings"
3. User still gets complete reading, just less natural
```

---

## Output Validation Schema

```typescript
type ReadingResult = {
  opening: string; // 1-2 sentences, sets tone
  
  cards: {
    cardId: string;
    card_name_tr: string;
    position: string;
    
    symbolic_meaning: string; // Layer 1
    position_context: string; // Layer 1
    topic_relevance: string; // Layer 1
    
    reflection: string; // Layer 1
  }[];
  
  patterns: {
    theme: string;
    description: string;
    cards_involved: string[];
  }[]; // Layer 2
  
  narrative_synthesis: string; // Layer 2
  
  user_angles: string[]; // Layer 2 angles
  
  practical_reflection: string; // Layer 3, actionable
  
  uncertainty_notice: string; // "These cards show potential, not certainty"
  
  safety_flags: {
    crisis_detected: boolean;
    health_mentioned: boolean;
    legal_mentioned: boolean;
    financial_mentioned: boolean;
    disclaimer_shown: boolean;
  };
  
  closing_question: string; // Reflection, no command
}
```

---

## Quality Checks

Every output must pass:

```
✓ No prohibited phrases (Ethical Constitution)
✓ Matches persona tone (Persona Constitution)
✓ Zod schema valid
✓ 3 layers present and distinguished
✓ No certainty language
✓ Closing is question, not command
✓ References all revealed cards
✓ Acknowledges user autonomy
✓ Crisis safety flags checked
```

If fails ANY: Rewrite or fallback to deterministic-only.

---

## Testing Protocol

### Unit Tests
- Layer 1: Card lookup accuracy, context switching
- Layer 2: Pattern detection, narrative building
- Layer 3: Persona tone consistency, phrase filtering

### Integration Tests
- End-to-end flow (intake → reading → validation)
- Fallback mode (Claude down, deterministic works)
- Persona switching (same cards, different tones)

### Safety Tests
- Crisis keyword triggering
- Prohibited phrase detection
- Tone check (catches manipulation)
- Rate-limit enforcement

---

## Next Steps

Technical Constitution. Kod standartları ve mimari kuralları.
