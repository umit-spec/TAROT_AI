import { DeterministicReading, DeterministicReadingSchema } from '../../types/reading';
import {
  InterpretationOutput,
  InterpretationOutputSchema,
  RawInterpretationOutput,
} from '../../types/interpretation';
import { REFLECTION_PROMPT_FALLBACK } from './providers/shared';

/**
 * docs/02-ETHICAL_CONSTITUTION.md forbidden output patterns, by category.
 * Layer 1 (deterministic, hand-authored) rarely trips these - this scan is
 * a regression guard there. Layer 3 (AI narration, free text) is where this
 * is the *primary* defense per the constitution's "AI Safeguards" section:
 * "Tüm Claude outputs ... Prohibited phrases scanned (regex)".
 */
const CATEGORY_4_MANIPULATION = [
  'kesinlikle',
  'mutlaka',
  'garantili',
  'kaderin yazılı',
  'evren sana mesaj veriyor',
  'özel enerjin var',
  'special souls',
  'sadece tarot bunu bilir',
];

const CATEGORY_1_HEALTH_ABSOLUTE = [
  'hastalığı geçeceksin',
  'ilacı bırak',
  'hamile kalacaksın',
  'hamile kalmayacaksın',
  'ağrın geçecek',
];

const CATEGORY_2_LEGAL_FINANCIAL_ABSOLUTE = [
  'davayı kazanacaksın',
  'paraların artacak',
  'kripto al',
  'boşan, daha iyi olacaksın',
];

const FORBIDDEN_PHRASES = [
  ...CATEGORY_4_MANIPULATION,
  ...CATEGORY_1_HEALTH_ABSOLUTE,
  ...CATEGORY_2_LEGAL_FINANCIAL_ABSOLUTE,
];

export class ReadingValidationError extends Error {}

function scanForForbiddenPhrases(haystack: string): void {
  const lower = haystack.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) {
      throw new ReadingValidationError(`Forbidden phrase detected: "${phrase}"`);
    }
  }
}

export function validateReading(reading: DeterministicReading): DeterministicReading {
  const parsed = DeterministicReadingSchema.parse(reading);

  const positions = parsed.cards.map((c) => c.position);
  if (new Set(positions).size !== positions.length) {
    throw new ReadingValidationError('Duplicate positions in draw');
  }
  if (parsed.cards.some((c) => c.orientation !== 'upright')) {
    throw new ReadingValidationError('ADR-002 violation: non-upright orientation in MVP output');
  }

  scanForForbiddenPhrases(JSON.stringify(parsed));

  return parsed;
}

/**
 * Gate for Layer 3 (any InterpretationProvider) output, per ADR-011 step 6
 * and the Ethical Constitution's "AI Safeguards" section. Applies to
 * MockProvider output too, not just Claude - the gate must not depend on
 * which provider produced the text.
 */
export function validateInterpretation(output: InterpretationOutput): InterpretationOutput {
  const parsed = InterpretationOutputSchema.parse(output);
  scanForForbiddenPhrases(JSON.stringify(parsed));
  return parsed;
}

/**
 * Raw -> final boundary for the governed reflection prompt
 * (docs/ADR-UX-REFLECTION-PROMPT.md A1/A2). A provider's reflectionPrompt may
 * be missing/invalid; this substitutes the ONE central server-side fallback
 * for that field ONLY (never masking a problem in another field, A2), so the
 * final-schema parse in validateInterpretation always sees a non-empty,
 * governed reflection prompt. Field-level; the client never fabricates one.
 *
 * Step 2 (minimal): fills when missing/empty. The full validation guards
 * (length, single-question, prediction/third-party/diagnosis) are added in
 * the next step and plugged in here.
 */
export function finalizeReflectionPrompt(raw: RawInterpretationOutput): InterpretationOutput {
  const candidate = (raw.reflectionPrompt ?? '').trim();
  const reflectionPrompt = candidate.length > 0 ? candidate : REFLECTION_PROMPT_FALLBACK;
  return { ...raw, reflectionPrompt };
}
