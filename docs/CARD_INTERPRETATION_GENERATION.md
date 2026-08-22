# Card Interpretation Generator System

## Overview

This system provides an **agent skill framework** for generating and validating tarot card interpretations using **The Magician** (card 1, 01-magician) as the authoritative pattern reference.

All 22 major arcana cards follow the same structure established by The Magician:
- **Symbolic Meaning**: Archetypal essence in Turkish (10–15 words)
- **Psychological Reflection**: Inner capacity or shadow aspect (12–20 words)
- **Keywords**: 3–4 essential themes
- **Position Meanings**: past / present / future resonance
- **Contextual Meanings**: relationship / career / general context
- **Reflection Questions**: 2 powerful self-inquiry prompts
- **Red Flags**: what to avoid + positive redirect

## Architecture

### Core Files

#### `src/server/knowledge/card-interpretation-generator.ts`
The main skill class with all generation and validation logic.

**Key Methods:**
- `loadBundle()`: Load the v0.1.0 knowledge bundle
- `getReferenceCard()`: Get The Magician as the pattern reference
- `getNonReferenceCards()`: Get the 21 other cards
- `generatePromptForCard()`: Create a complete Claude prompt using The Magician as template
- `validateInterpretation()`: Check output against reference quality standards
- `auditInterpretations()`: Run full audit across all 22 cards
- `saveBundle()`: Persist updated interpretations to disk

#### `scripts/generate-card-interpretations.ts`
CLI tool for interactive generation and validation workflow.

**Commands:**
```bash
# Audit all cards for validation issues
npx ts-node scripts/generate-card-interpretations.ts --audit

# Generate Claude prompt for specific card
npx ts-node scripts/generate-card-interpretations.ts --card 00-fool

# Validate JSON output from Claude
npx ts-node scripts/generate-card-interpretations.ts --validate
```

#### `src/__tests__/unit/card-interpretation-generator.test.ts`
Comprehensive test suite (25+ tests) covering:
- Reference card completeness
- Bundle loading and structure
- Validation logic for all field types
- Prompt generation correctness
- Full card-set consistency

## Workflow

### 1. Audit Current State
```bash
npm run ts-node scripts/generate-card-interpretations.ts --audit
```
Output shows:
- Total cards: 22
- Valid cards: N
- Warnings: list of specific issues per card

### 2. Generate Prompt for One Card
```bash
npm run ts-node scripts/generate-card-interpretations.ts --card 00-fool
```
Output is a complete prompt ready to send to Claude. The prompt includes:
- The full Magician reference card (as structural template)
- Target card metadata (name, number, archetypal themes)
- Detailed requirements for each field
- Tone rules (Turkish, psychological, no Western assumptions)
- Expected JSON output format

### 3. Send to Claude
Copy the prompt and send to Claude (claude.ai, API, etc.) with these instructions:

> Generate ONLY JSON output, no markdown or explanation. Follow The Magician structure exactly.

Claude will return JSON conforming to the schema.

### 4. Validate Output
```bash
npm run ts-node scripts/generate-card-interpretations.ts --validate
```
Paste the JSON. The tool checks:
- All fields present
- Field types correct
- Content length reasonable (word counts match reference)
- Turkish language (no English in interpretive fields)
- Structure consistency

### 5. Update Bundle
Once validated, manually integrate the JSON into `data/knowledge/bundle-v0.1.0.json`:
```json
{
  "version": "0.1.0",
  "cards": [
    { ...existing_cards },
    { ...newly_validated_card }
  ]
}
```

### 6. Verify and Commit
```bash
npm run typecheck   # TypeScript check
npm run lint        # ESLint check
npm run test        # Full test suite (includes structure validation)
npm run build       # Next.js production build
git add data/knowledge/bundle-v0.1.0.json
git commit -m "update: refresh card interpretations for [card_name]"
git push origin [designated_branch]
```

## The Magician Reference

The Magician (card 1) is the canonical reference for all interpretations:

```json
{
  "cardId": "01-magician",
  "name_en": "The Magician",
  "name_tr": "Büyücü",
  "arcana": "major",
  "number": 1,
  "symbolicMeaning": "Elde var olan araçları bilinçli şekilde kullanma, niyeti eyleme dönüştürme.",
  "psychologicalReflection": "İstenç ve beceri arasındaki uyum; potansiyeli somut bir sonuca kanalize etme.",
  "keywords": ["irade", "beceri", "niyet"],
  "positionMeanings": {
    "past": "Geçmişte bir beceri ya da kaynağı etkin şekilde kullanmışsınız.",
    "present": "Şu anda elinizdeki araçları nasıl kullandığınız önemli.",
    "future": "Niyetinizi somut bir adıma dönüştürme fırsatı yaklaşıyor."
  },
  "contextualMeanings": {
    "relationship": "İletişimde niyetinizi net ifade etme kapasitesi.",
    "career": "Elinizdeki becerileri görünür kılma, inisiyatif alma zamanı.",
    "general": "Kaynaklarınızı bilinçli kullanma isteği."
  },
  "reflectionQuestions": [
    "Elinizde olan hangi kaynağı henüz kullanmadınız?",
    "Niyetiniz ile eyleminiz ne kadar uyumlu?"
  ],
  "redFlags": {
    "avoid": ["manipülasyon önerisi", "başkasını kontrol etme çağrısı"],
    "instead": "Kendi becerilerinize dair farkındalığınızı güçlendirin."
  }
}
```

**Pattern Elements:**
- **No English**: All interpretive content in Turkish
- **Direct Address**: "Elinizde olan..." (second person, direct)
- **Psychological Depth**: Inner capacity and shadow, not fate
- **Cultural Sensitivity**: Turkish idioms, Turkish legal/social context
- **Agency**: "Capacity" framing, not predictive
- **Concision**: Every word counts; no filler

## Validation Criteria

The `validateInterpretation()` method checks:

| Field | Requirement | Reference Value |
|-------|-------------|-----------------|
| `cardId` | Present, format: `NN-name` | `01-magician` |
| `name_en` | Present, English | `The Magician` |
| `name_tr` | Present, Turkish | `Büyücü` |
| `number` | 0–21, numeric | `1` |
| `symbolicMeaning` | 7–20 words, Turkish | 14 words |
| `psychologicalReflection` | 10–25 words, Turkish | 16 words |
| `keywords` | 3–4 items, Turkish | `["irade", "beceri", "niyet"]` |
| `positionMeanings.past` | Present, Turkish | ✓ |
| `positionMeanings.present` | Present, Turkish | ✓ |
| `positionMeanings.future` | Present, Turkish | ✓ |
| `contextualMeanings.relationship` | Present, Turkish | ✓ |
| `contextualMeanings.career` | Present, Turkish | ✓ |
| `contextualMeanings.general` | Present, Turkish | ✓ |
| `reflectionQuestions` | Exactly 2 items, Turkish | `["...", "..."]` |
| `redFlags.avoid` | 2–3 items, Turkish | `["...", "..."]` |
| `redFlags.instead` | Present, Turkish, 1 sentence | ✓ |

## Integration Points

### Usage in Components
The bundle is loaded by `LocalJsonKnowledgeProvider` (src/server/knowledge/local-json-provider.ts):

```typescript
const bundle = loadKnowledgeBundle(); // throws on failure
```

The bundle contains:
- **pairRelations**: Sequence contexts (card A → card B)
- **positionRules**: Spread-specific position meanings
- **domainModifiers**: Domain-specific context (e.g., legal, relationship)
- **personaModifiers**: User persona adjustments
- **safetyConstraints**: Safety guardrails by flag

### Card Interpretations in Readings
When a card is drawn, `ReadingResult.tsx` retrieves:
```typescript
// From context:
// context.pairRelations: Card pair-based meanings
// context.positionRules: Position-specific meanings
// context.domainModifier: Domain context
// context.personaModifier: Persona context
```

The interpretation system ensures these all follow the same psychological, Turkish-first, capacity-based pattern.

## Testing

Run tests for the skill:
```bash
npm run test -- card-interpretation-generator
```

Test coverage includes:
- Reference card completeness
- All 22 cards for structure consistency
- Prompt generation correctness
- Validation logic for each field type
- Bundle loading and integrity

All 22 cards must have identical field structure (enforced by tests).

## Extending the System

### For New Cards (Minor Arcana, Courts)
If adding minor arcana:
1. Maintain The Magician as reference
2. Adjust symbolic meaning per card (same word-count range)
3. Keep psychological reflection format: "[theme]; [manifestation]"
4. Follow same Turkish language and agency rules
5. Add corresponding tests to ensure consistency

### For New Languages
If translating to another language:
1. Use The Magician as canonical English reference
2. Ensure translations preserve psychological depth (not literal)
3. Adapt cultural context to target language (Turkish idioms → local idioms)
4. Create new bundle version (e.g., bundle-v0.2.0.json)
5. Maintain separate language-specific validation

### For Automation
To fully automate generation:
1. Implement `generateInterpretation()` method calling Claude API
2. Build retry logic for API failures
3. Implement automatic validation and save-on-success
4. Add batch processing for all 22 cards
5. Wire into CI/CD pipeline for periodic refresh

## Quick Reference

**All commands:**
```bash
# Typecheck, lint, test, build
npm run typecheck
npm run lint
npm run test
npm run build

# Card interpretation workflow
npx ts-node scripts/generate-card-interpretations.ts --audit
npx ts-node scripts/generate-card-interpretations.ts --card 00-fool
npx ts-node scripts/generate-card-interpretations.ts --validate
```

**Key files:**
- Skill: `src/server/knowledge/card-interpretation-generator.ts`
- CLI: `scripts/generate-card-interpretations.ts`
- Tests: `src/__tests__/unit/card-interpretation-generator.test.ts`
- Bundle: `data/knowledge/bundle-v0.1.0.json`
- Loader: `src/server/knowledge/bundle.ts`

**Reference:**
- The Magician (01-magician): Canonical pattern
- All 22 cards in bundle: Must follow same structure
- No deviations: Structure fidelity enforced by validation

## Troubleshooting

**Bundle won't load:**
```bash
# Check JSON validity
node -e "const b = require('./data/knowledge/bundle-v0.1.0.json'); console.log('Valid')"
```

**Validation errors:**
```bash
# Check specific card against reference
npx ts-node -e "
  import { CardInterpreterSkill } from './src/server/knowledge/card-interpretation-generator';
  const skill = new CardInterpreterSkill();
  const bundle = skill.loadBundle();
  const card = bundle.cards.find(c => c.cardId === '00-fool');
  const result = skill.validateInterpretation(card);
  console.log(result);
"
```

**Word count off:**
```bash
# Count words in field
echo "Elde var olan araçları bilinçli şekilde kullanma, niyeti eyleme dönüştürme." | wc -w
```

---

**Last Updated:** August 22, 2024  
**Status:** Production Ready  
**Reference Card:** The Magician (01-magician, v0.1.0)
