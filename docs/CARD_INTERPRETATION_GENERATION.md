# Card Interpretation Generator System

## Overview

This system provides an **agent skill framework** for generating and validating tarot card interpretations using **The Magician** (card 1, 01-magician) as the authoritative pattern reference.

All 22 major arcana cards follow the same structure established by The Magician:
- **Symbolic Meaning**: Archetypal essence in Turkish (7–20 words; the enforced gate — see Validation Criteria below for why this differs from the earlier 10–15 target text)
- **Psychological Reflection**: Inner capacity or shadow aspect (10–25 words)
- **Keywords**: 3–4 essential themes
- **Position Meanings**: past / present / future resonance
- **Contextual Meanings**: relationship / career / general context
- **Reflection Questions**: 2 powerful self-inquiry prompts
- **Red Flags**: 2–3 items to avoid + one positive redirect

## Architecture

### Core Files

#### `src/server/knowledge/card-interpretation-generator.ts`
The main skill class with all generation and validation logic.

**Key Methods:**
- `loadBundle()`: Load the v0.1.0 knowledge bundle
- `getReferenceCard()`: Get The Magician as the pattern reference
- `getNonReferenceCards()`: Get the 21 other cards
- `generatePromptForCard()`: Create a complete Claude prompt, reading the reference card live from the bundle (not a hardcoded copy) so the prompt can never drift from what `01-magician` actually contains
- `validateInterpretation()`: Check output against reference quality standards — structure, word-count gates, a 2-3 item `redFlags.avoid` range, and a heuristic check for English content leaking into the Turkish-only fields
- `auditInterpretations()`: Run a full audit across all 22 cards, **strict by default**
- `upsertCard()`: Insert or replace one card (matched by `cardId`) in the bundle and persist it
- `saveBundle()`: Persist a full bundle to disk (used internally by `upsertCard()`)

#### `scripts/generate-card-interpretations.ts`
CLI tool for interactive generation and validation workflow. Run via the `cards:*` npm scripts (there is no `ts-node` npm script in this project — use `npx tsx` or the scripts below).

**Commands:**
```bash
# Audit all cards for validation issues
npm run cards:audit

# Generate Claude prompt for specific card (cardId must match the bundle exactly,
# e.g. "00-fool" not "00-the-fool" — see Troubleshooting)
npm run cards:generate -- --card 00-fool

# Validate JSON output from Claude (report only)
npm run cards:validate

# Validate AND write the card into data/knowledge/bundle-v0.1.0.json
npx tsx scripts/generate-card-interpretations.ts --validate --save
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
npm run cards:audit
```
Output shows:
- Total cards: 22
- Valid cards: N
- Warnings: list of specific issues per card

This runs **strict** by default (word-count gates, redFlags range, English-leak
check all included). Call `auditInterpretations(false)` directly if a looser,
structure-only pass is ever needed — the CLI does not expose that option
because a looser default is what let 18/22 cards silently fail before.

### 2. Generate Prompt for One Card
```bash
npm run cards:generate -- --card 00-fool
```
The `cardId` must match `data/knowledge/bundle-v0.1.0.json` exactly — it does
**not** include the card's "The " prefix (`00-fool`, `01-magician`,
`09-hermit`, `16-tower`, not `00-the-fool` etc.). Run `npm run cards:generate`
with no `--card` flag to print the reference card and a few valid examples.

Output is a complete prompt ready to send to Claude. The prompt includes:
- The Magician reference card, read live from the bundle (not a hardcoded copy — see Architecture)
- Target card metadata (name, number, archetypal themes)
- Detailed requirements for each field
- Tone rules (Turkish, psychological, no Western assumptions)
- Expected JSON output format

### 3. Send to Claude
Copy the prompt and send to Claude (claude.ai, API, etc.) with these instructions:

> Generate ONLY JSON output, no markdown or explanation. Follow The Magician structure exactly.

Claude will return JSON conforming to the schema.

### 4. Validate (and optionally Save)
```bash
# Report only
npm run cards:validate

# Report AND write the card into data/knowledge/bundle-v0.1.0.json
npx tsx scripts/generate-card-interpretations.ts --validate --save
```
Paste the JSON, then Ctrl+D. The tool checks:
- All fields present
- Field types correct
- Content length within the enforced gate (symbolicMeaning 7–20 words, psychologicalReflection 10–25 words)
- `redFlags.avoid` has 2–3 non-empty items and `redFlags.instead` is present
- Turkish-only heuristic: flags common English marker words in the interpretive fields
- Structure consistency

With `--save`, a passing card is upserted into the bundle by `cardId` (replacing
an existing entry of the same id, or appended if new) and the file is written
immediately — no manual JSON splicing required.

### 5. Verify and Commit
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
| `redFlags.avoid` | 2–3 non-empty items (an empty array fails; a >3-item array fails) | `["...", "..."]` |
| `redFlags.instead` | Present, non-empty, Turkish | ✓ |
| all interpretive fields | Fail if a common English marker word (`the`, `and`, `you`, `card`, `journey`, ...) appears — heuristic, not a language classifier | n/a |

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
`upsertCard()` already closes the validate → save step (`--validate --save`).
To fully automate generation end-to-end:
1. Implement a method calling the Claude API directly with `generatePromptForCard()`'s output
2. Build retry logic for API failures
3. Call `validateInterpretation()` then `upsertCard()` on success (no manual paste step)
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
npm run cards:audit
npm run cards:generate -- --card 00-fool
npm run cards:validate
npx tsx scripts/generate-card-interpretations.ts --validate --save
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
# Check specific card against reference (strict mode, matching npm run cards:audit)
node --experimental-strip-types -e "
import { CardInterpreterSkill } from './src/server/knowledge/card-interpretation-generator.ts';
const skill = new CardInterpreterSkill();
const bundle = skill.loadBundle();
const card = bundle.cards.find(c => c.cardId === '00-fool');
console.log(skill.validateInterpretation(card, true));
"
```

**`--card <id>` says "Card not found":**
The id must match the bundle's actual `cardId` exactly, which drops the
card's "The " prefix. `The Fool` → `00-fool`, `The Magician` → `01-magician`,
`The Hermit` → `09-hermit`, `The Tower` → `16-tower` — not `00-the-fool` etc.
Run `npm run cards:generate` with no arguments to print three valid examples.

**Word count off:**
```bash
# Count words in field
echo "Elde var olan araçları bilinçli şekilde kullanma, niyeti eyleme dönüştürme." | wc -w
```

---

**Last Updated:** August 23, 2026
**Status:** Production Ready
**Reference Card:** The Magician (01-magician, v0.1.0)
