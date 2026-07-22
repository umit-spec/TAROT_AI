import { DeterministicReading, DeterministicReadingSchema } from '../../types/reading';

/**
 * Category 4 forbidden phrases from docs/02-ETHICAL_CONSTITUTION.md
 * ("Manipülasyon & Addiction Tetikleyicileri"). Deterministic layer content
 * is hand-authored against this list; this scan is a regression guard, not
 * the primary defense (Layer 3 AI output will need its own, larger scan).
 */
const FORBIDDEN_PHRASES = [
  'kesinlikle',
  'mutlaka',
  'garantili',
  'kaderin yazılı',
  'evren sana mesaj veriyor',
  'özel enerjin var',
];

export class ReadingValidationError extends Error {}

export function validateReading(reading: DeterministicReading): DeterministicReading {
  const parsed = DeterministicReadingSchema.parse(reading);

  const positions = parsed.cards.map((c) => c.position);
  if (new Set(positions).size !== positions.length) {
    throw new ReadingValidationError('Duplicate positions in draw');
  }
  if (parsed.cards.some((c) => c.orientation !== 'upright')) {
    throw new ReadingValidationError('ADR-002 violation: non-upright orientation in MVP output');
  }

  const haystack = JSON.stringify(parsed).toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (haystack.includes(phrase)) {
      throw new ReadingValidationError(`Forbidden phrase detected: "${phrase}"`);
    }
  }

  return parsed;
}
