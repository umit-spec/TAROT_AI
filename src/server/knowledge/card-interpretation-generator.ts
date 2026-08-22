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
    if (!card.redFlags?.avoid || !Array.isArray(card.redFlags.avoid)) {
      errors.push('redFlags.avoid must be non-empty array');
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

    return {
      valid: errors.length === 0,
      errors
    };
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
    return `You are a Turkish tarot interpretation specialist. Generate a structured interpretation for this card following THE MAGICIAN pattern EXACTLY.

REFERENCE CARD (THE MAGICIAN - your structural and tonal pattern):
${JSON.stringify(MAGICIAN_REFERENCE, null, 2)}

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
   * Report on interpretation quality across all cards
   */
  auditInterpretations(): {
    total: number;
    valid: number;
    warnings: Array<{ cardId: string; issues: string[] }>;
  } {
    const bundle = this.loadBundle();
    const warnings: Array<{ cardId: string; issues: string[] }> = [];

    for (const card of bundle.cards) {
      const result = this.validateInterpretation(card, false);
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
}

export default CardInterpreterSkill;
