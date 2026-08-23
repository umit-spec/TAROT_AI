import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Card Interpretation Generator Skill
 *
 * This system uses The Magician as the authoritative pattern reference
 * to generate or validate interpretations for all 22 major arcana cards.
 *
 * Usage:
 *   1. Choose reference card: The Magician (index 1, cardId "01-magician")
 *   2. For each other card, generate prompt with Magician as structural template
 *   3. Validate output against reference schema
 *   4. Save to bundle version
 *   5. Commit to designated branch
 */

export interface CardInterpretation {
  cardId: string;
  name_en: string;
  name_tr: string;
  arcana: 'major' | 'minor';
  number: number;
  symbolicMeaning: string;
  psychologicalReflection: string;
  keywords: string[];
  positionMeanings: {
    past: string;
    present: string;
    future: string;
  };
  contextualMeanings: {
    relationship: string;
    career: string;
    general: string;
  };
  reflectionQuestions: [string, string];
  redFlags: {
    avoid: string[];
    instead: string;
  };
}

export interface KnowledgeBundle {
  version: string;
  cards: CardInterpretation[];
  pairRelations?: Array<{ previousCardId: string; focusCardId: string }>;
}

/**
 * The Magician - Pattern Reference (card 1 of 22)
 *
 * This card serves as the structural and tonal baseline for all other interpretations.
 * Its form is canonical; deviations indicate need for refinement.
 */
export const MAGICIAN_REFERENCE: CardInterpretation = {
  cardId: '01-magician',
  name_en: 'The Magician',
  name_tr: 'Büyücü',
  arcana: 'major',
  number: 1,
  symbolicMeaning: 'Elde var olan araçları bilinçli şekilde kullanma, niyeti eyleme dönüştürme.',
  psychologicalReflection: 'İstenç ve beceri arasındaki uyum; potansiyeli somut bir sonuca kanalize etme.',
  keywords: ['irade', 'beceri', 'niyet'],
  positionMeanings: {
    past: 'Geçmişte bir beceri ya da kaynağı etkin şekilde kullanmışsınız.',
    present: 'Şu anda elinizdeki araçları nasıl kullandığınız önemli.',
    future: 'Niyetinizi somut bir adıma dönüştürme fırsatı yaklaşıyor.'
  },
  contextualMeanings: {
    relationship: 'İletişimde niyetinizi net ifade etme kapasitesi.',
    career: 'Elinizdeki becerileri görünür kılma, inisiyatif alma zamanı.',
    general: 'Kaynaklarınızı bilinçli kullanma isteği.'
  },
  reflectionQuestions: [
    'Elinizde olan hangi kaynağı henüz kullanmadınız?',
    'Niyetiniz ile eyleminiz ne kadar uyumlu?'
  ],
  redFlags: {
    avoid: ['manipülasyon önerisi', 'başkasını kontrol etme çağrısı'],
    instead: 'Kendi becerilerinize dair farkındalığınızı güçlendirin.'
  }
};

export class CardInterpreterSkill {
  private bundlePath: string;
  private bundle: KnowledgeBundle | null = null;

  constructor(bundleDirectory: string = join(process.cwd(), 'data', 'knowledge')) {
    this.bundlePath = join(bundleDirectory, 'bundle-v0.1.0.json');
  }

  /**
   * Load the current bundle
   */
  loadBundle(): KnowledgeBundle {
    if (this.bundle) {
      return this.bundle;
    }

    try {
      const content = readFileSync(this.bundlePath, 'utf-8');
      this.bundle = JSON.parse(content) as KnowledgeBundle;
      return this.bundle;
    } catch (err) {
      throw new Error(`Failed to load bundle: ${err}`);
    }
  }

  /**
   * Get The Magician reference card
   */
  getReferenceCard(): CardInterpretation {
    const bundle = this.loadBundle();
    const magician = bundle.cards.find((c) => c.cardId === '01-magician');
    if (!magician) throw new Error('Magician card not found in bundle');
    return magician;
  }

  /**
   * Get all cards except The Magician
   */
  getNonReferenceCards(): CardInterpretation[] {
    const bundle = this.loadBundle();
    return bundle.cards.filter((c) => c.cardId !== '01-magician');
  }

  /**
   * Validate interpretation against Magician pattern
   *
   * Checks:
   * - All required fields present
   * - Field type consistency
   * - Field length reasonableness
   * - Turkish language usage (no English in main fields)
   */
  validateInterpretation(card: CardInterpretation, strict = true): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Structure checks
    if (!card.cardId) errors.push('Missing cardId');
    if (!card.name_en || !card.name_tr) errors.push('Missing name fields');
    if (typeof card.number !== 'number') errors.push('Invalid number');
    if (!Array.isArray(card.keywords) || card.keywords.length < 3) {
      errors.push('keywords must be array of 3+ items');
    }
    if (!Array.isArray(card.reflectionQuestions) || card.reflectionQuestions.length !== 2) {
      errors.push('reflectionQuestions must be exactly 2 items');
    }
    // redFlags.avoid is an array field: `!card.redFlags.avoid` is false for `[]`
    // (empty arrays are truthy), so an empty array was silently passing this
    // check despite the error text claiming "non-empty". Check length instead,
    // and match the 2-3 item range the generation prompt actually asks for.
    if (
      !Array.isArray(card.redFlags?.avoid) ||
      card.redFlags.avoid.length < 2 ||
      card.redFlags.avoid.length > 3 ||
      card.redFlags.avoid.some((a) => !a || !a.trim())
    ) {
      errors.push('redFlags.avoid must be an array of 2-3 non-empty items');
    }
    if (!card.redFlags?.instead || !card.redFlags.instead.trim()) {
      errors.push('redFlags.instead is required');
    }

    // Content length checks (from Magician reference)
    const symbolicLength = card.symbolicMeaning?.split(' ').length || 0;
    if (strict && (symbolicLength < 7 || symbolicLength > 20)) {
      errors.push(`symbolicMeaning too short/long (${symbolicLength} words, target 10-15)`);
    }

    const psychoLength = card.psychologicalReflection?.split(' ').length || 0;
    if (strict && (psychoLength < 10 || psychoLength > 25)) {
      errors.push(`psychologicalReflection too short/long (${psychoLength} words, target 12-20)`);
    }

    // Position meanings present
    if (!card.positionMeanings?.past || !card.positionMeanings?.present || !card.positionMeanings?.future) {
      errors.push('All positionMeanings required (past, present, future)');
    }

    // Contextual meanings present
    if (
      !card.contextualMeanings?.relationship ||
      !card.contextualMeanings?.career ||
      !card.contextualMeanings?.general
    ) {
      errors.push('All contextualMeanings required (relationship, career, general)');
    }

    // Turkish-only check: the docstring above has always promised this, but no
    // check ever existed - an English sentence could reach the bundle silently.
    const englishHits = this.findSuspectedEnglish(card);
    if (englishHits.length > 0) {
      errors.push(`Suspected English content (Turkish-only fields): ${englishHits.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Heuristic English-word detector for the Turkish-only interpretive fields.
   * Not a language classifier - just catches the common failure mode of an
   * un-translated or partially-translated English sentence slipping through
   * (e.g. "the journey", "you must", "this card means").
   */
  private findSuspectedEnglish(card: CardInterpretation): string[] {
    const ENGLISH_MARKERS =
      /\b(the|and|you|your|this|that|with|for|of|is|are|means|card|represents|journey|must|will)\b/i;

    const fields: Array<[string, string | undefined]> = [
      ['symbolicMeaning', card.symbolicMeaning],
      ['psychologicalReflection', card.psychologicalReflection],
      ['positionMeanings.past', card.positionMeanings?.past],
      ['positionMeanings.present', card.positionMeanings?.present],
      ['positionMeanings.future', card.positionMeanings?.future],
      ['contextualMeanings.relationship', card.contextualMeanings?.relationship],
      ['contextualMeanings.career', card.contextualMeanings?.career],
      ['contextualMeanings.general', card.contextualMeanings?.general],
      ['redFlags.instead', card.redFlags?.instead]
    ];

    const hits: string[] = [];
    for (const [name, value] of fields) {
      if (value && ENGLISH_MARKERS.test(value)) {
        hits.push(name);
      }
    }
    for (const q of card.reflectionQuestions ?? []) {
      if (ENGLISH_MARKERS.test(q)) {
        hits.push('reflectionQuestions');
        break;
      }
    }
    return hits;
  }

  /**
   * Generate a prompt for Claude to create interpretation
   *
   * The prompt is structured to:
   * - Show The Magician as the exact pattern to follow
   * - Provide archetypal guidance
   * - Request strict JSON output
   * - Emphasize Turkish language and psychological depth
   */
  generatePromptForCard(
    cardNumber: number,
    cardName_en: string,
    cardName_tr: string,
    archetypalThemes: string
  ): string {
    // Read the reference from the live bundle rather than the hardcoded
    // MAGICIAN_REFERENCE constant below - if the Magician entry is ever
    // edited in the bundle, this prompt must reflect that edit instead of
    // silently generating new cards against a stale, drifted pattern.
    const reference = this.getReferenceCard();
    return `You are a Turkish tarot interpretation specialist. Generate a structured interpretation for this card following THE MAGICIAN pattern EXACTLY.

REFERENCE CARD (THE MAGICIAN - your structural and tonal pattern):
${JSON.stringify(reference, null, 2)}

TARGET CARD (generate interpretation for this):
- name_en: ${cardName_en}
- name_tr: ${cardName_tr}
- number: ${cardNumber}
- Archetypal themes: ${archetypalThemes}

CRITICAL REQUIREMENTS:

1. symbolicMeaning (Turkish, 10-15 words)
   - Archetypal essence, not fortune-telling
   - Follow Magician example exactly: "Elde var olan araçları bilinçli şekilde kullanma, niyeti eyleme dönüştürme."

2. psychologicalReflection (Turkish, 12-20 words)
   - Inner capacity or shadow aspect
   - Format: "[psychological theme]; [how it manifests]"
   - Example: "İstenç ve beceri arasındaki uyum; potansiyeli somut bir sonuca kanalize etme."

3. keywords (3-4 essential themes in Turkish)
   - Short, powerful, specific to this card
   - Example: ["irade", "beceri", "niyet"]

4. positionMeanings (all three required)
   - past: How this archetype appeared in history
   - present: Current resonance
   - future: What unfolds

5. contextualMeanings (all three required)
   - relationship: How this plays in love/connection
   - career: How this appears in work
   - general: Broader life context

6. reflectionQuestions (exactly 2, Turkish, powerful)
   - Self-inquiry format like: "Elinizde olan hangi kaynağı henüz kullanmadınız?"
   - Should invite introspection, not predict

7. redFlags (required)
   - avoid: 2-3 harmful interpretations to warn against
   - instead: Positive redirect (one concise sentence)

TONE RULES (strict):
- Direct address in Turkish second person
- Psychological depth over superstition
- No Western assumptions; use Turkish cultural context
- Always leave room for agency (capacity, not destiny)
- Cultural sensitivity (especially sensitive cards like Death, Devil, Tower)

OUTPUT (MUST BE VALID JSON, no markdown, no extra text):
{
  "cardId": "${cardNumber.toString().padStart(2, '0')}-${cardName_en.toLowerCase().replace(/ /g, '-')}",
  "name_en": "${cardName_en}",
  "name_tr": "${cardName_tr}",
  "arcana": "major",
  "number": ${cardNumber},
  "symbolicMeaning": "...",
  "psychologicalReflection": "...",
  "keywords": [...],
  "positionMeanings": {
    "past": "...",
    "present": "...",
    "future": "..."
  },
  "contextualMeanings": {
    "relationship": "...",
    "career": "...",
    "general": "..."
  },
  "reflectionQuestions": ["...", "..."],
  "redFlags": {
    "avoid": [...],
    "instead": "..."
  }
}`;
  }

  /**
   * Save updated bundle to file
   */
  saveBundle(bundle: KnowledgeBundle, path?: string): void {
    const targetPath = path || this.bundlePath;
    try {
      writeFileSync(targetPath, JSON.stringify(bundle, null, 2));
      console.log(`✓ Saved bundle to ${targetPath}`);
    } catch (err) {
      throw new Error(`Failed to save bundle: ${err}`);
    }
  }

  /**
   * Report on interpretation quality across all cards.
   *
   * Defaults to strict=true: an earlier version of this method audited with
   * strict=false, so `npm run cards:audit` reported "22/22 valid" while 18 of
   * those 22 cards were actually failing the Magician length pattern - the
   * audit command silently couldn't catch the exact problem it exists to
   * catch. Strict is now the default; pass `strict: false` explicitly if a
   * looser structural-only pass is ever needed.
   */
  auditInterpretations(strict = true): {
    total: number;
    valid: number;
    warnings: Array<{ cardId: string; issues: string[] }>;
  } {
    const bundle = this.loadBundle();
    const warnings: Array<{ cardId: string; issues: string[] }> = [];

    for (const card of bundle.cards) {
      const result = this.validateInterpretation(card, strict);
      if (!result.valid) {
        warnings.push({ cardId: card.cardId, issues: result.errors });
      }
    }

    return {
      total: bundle.cards.length,
      valid: bundle.cards.length - warnings.length,
      warnings
    };
  }

  /**
   * Cross-card consistency checks that per-card validateInterpretation()
   * cannot catch, since it only ever looks at one card in isolation:
   * - number/cardId/name uniqueness and complete 0-21 coverage
   * - duplicated interpretive text reused verbatim across different cards
   *   (a copy-paste artifact, not a legitimate shared phrase)
   * - pairRelations entries pointing at a cardId that doesn't exist
   */
  auditBundleIntegrity(): { valid: boolean; issues: string[] } {
    const bundle = this.loadBundle();
    const issues: string[] = [];

    const numbers = bundle.cards.map((c) => c.number);
    const expectedNumbers = Array.from({ length: 22 }, (_, i) => i);
    const missingNumbers = expectedNumbers.filter((n) => !numbers.includes(n));
    if (missingNumbers.length > 0) {
      issues.push(`Missing card numbers: ${missingNumbers.join(', ')}`);
    }
    const dupeNumbers = [...new Set(numbers.filter((n, i) => numbers.indexOf(n) !== i))];
    if (dupeNumbers.length > 0) {
      issues.push(`Duplicate card numbers: ${dupeNumbers.join(', ')}`);
    }

    for (const field of ['cardId', 'name_en', 'name_tr'] as const) {
      const values = bundle.cards.map((c) => c[field]);
      const dupes = [...new Set(values.filter((v, i) => values.indexOf(v) !== i))];
      if (dupes.length > 0) {
        issues.push(`Duplicate ${field}: ${dupes.join(', ')}`);
      }
    }

    const textFields: Array<[string, (c: CardInterpretation) => string | undefined]> = [
      ['symbolicMeaning', (c) => c.symbolicMeaning],
      ['psychologicalReflection', (c) => c.psychologicalReflection],
      ['redFlags.instead', (c) => c.redFlags?.instead]
    ];
    for (const [label, getter] of textFields) {
      const seen = new Map<string, string>();
      for (const card of bundle.cards) {
        const value = getter(card);
        if (!value) continue;
        const existing = seen.get(value);
        if (existing) {
          issues.push(`Duplicate ${label} text shared by ${existing} and ${card.cardId}: "${value}"`);
        } else {
          seen.set(value, card.cardId);
        }
      }
    }

    const ids = new Set(bundle.cards.map((c) => c.cardId));
    for (const rel of bundle.pairRelations ?? []) {
      if (!ids.has(rel.previousCardId)) {
        issues.push(`pairRelations references unknown previousCardId: ${rel.previousCardId}`);
      }
      if (!ids.has(rel.focusCardId)) {
        issues.push(`pairRelations references unknown focusCardId: ${rel.focusCardId}`);
      }
    }

    return { valid: issues.length === 0, issues };
  }

  /**
   * Insert or replace a card in the bundle (matched by cardId) and persist it.
   * Closes the generate -> validate -> save loop: previously saveBundle()
   * existed but nothing in the CLI workflow ever called it, so a validated
   * card had to be spliced into the JSON file by hand.
   */
  upsertCard(card: CardInterpretation): void {
    const bundle = this.loadBundle();
    const index = bundle.cards.findIndex((c) => c.cardId === card.cardId);
    if (index >= 0) {
      bundle.cards[index] = card;
    } else {
      bundle.cards.push(card);
    }
    bundle.cards.sort((a, b) => a.number - b.number);
    this.saveBundle(bundle);
  }
}

export default CardInterpreterSkill;
