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

function containsForbiddenPhrase(lower: string): boolean {
  return FORBIDDEN_PHRASES.some((phrase) => lower.includes(phrase));
}

function scanForForbiddenPhrases(haystack: string): void {
  const lower = haystack.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) {
      throw new ReadingValidationError(`Forbidden phrase detected: "${phrase}"`);
    }
  }
}

/** Red-line scan usable by a provider before the engine's final gate. */
export function assertNoForbiddenPhrases(haystack: string): void {
  scanForForbiddenPhrases(haystack);
}

// docs/ADR-UX-REFLECTION-PROMPT.md §5 guards. Conservative: on any doubt the
// caller substitutes the governed fallback (never repairs the text), so
// over-rejection only costs a safe generic prompt.
const REFLECTION_PREDICTION =
  /(kesinlikle|mutlaka|garanti|olacaks?ın|olacak\b|gerçekleşecek|kazanacaks?ın|kaybedeceks?in|dönecek|yarın|gelecek hafta|önümüzdeki|ay içinde|hafta içinde)/i;
// A third party as the certain subject ("O ... mi?", "patronun ...").
const REFLECTION_THIRD_PARTY = /(^|[^a-zçğıöşü])(o|onun)\s|(patronun|sevgilin|eşin|annen|baban|arkadaşın|kocan|karın)\b/i;
// Medical/psychological diagnosis, or an imperative "-malısın/-melisin".
const REFLECTION_DIAGNOSIS = /(depresyon|anksiyete|hastalık|teşhis|tanı\b|ilaç|terapi|m[ae]l[iı]s[iı]n\b)/i;

/**
 * Governed reflection-prompt validator (docs/ADR-UX-REFLECTION-PROMPT.md A3 /
 * §5). Returns the whitespace-normalized prompt when it is exactly one
 * safe, user-focused reflective question; otherwise null. It NEVER repairs a
 * failing prompt — the caller goes straight to the central fallback.
 */
export function validateReflectionPrompt(text: string | undefined): string | null {
  if (!text) return null;
  if (/\n/.test(text)) return null; // single line only
  if (/(^|\s)[-*•]\s/.test(text) || /(^|\s)\d+[.)]\s/.test(text)) return null; // no list
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (normalized.length < 20 || normalized.length > 220) return null;
  if ((normalized.match(/\?/g) ?? []).length !== 1) return null; // exactly one ?
  if (!normalized.endsWith('?')) return null;
  if (REFLECTION_PREDICTION.test(normalized)) return null;
  if (REFLECTION_THIRD_PARTY.test(normalized)) return null;
  if (REFLECTION_DIAGNOSIS.test(normalized)) return null;
  if (containsForbiddenPhrase(normalized.toLowerCase())) return null;
  return normalized;
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
 * Resolves the governed reflection prompt for a raw output
 * (docs/ADR-UX-REFLECTION-PROMPT.md A1/A2/A4): the provider's prompt if it
 * passes validateReflectionPrompt, else the ONE central server-side fallback —
 * for THIS field only, never masking a problem elsewhere. Also reports a
 * categorical source ('provider' | 'fallback') for metadata-only telemetry;
 * it carries no prompt text.
 */
export function resolveReflectionPrompt(raw: RawInterpretationOutput): {
  reflectionPrompt: string;
  source: 'provider' | 'fallback';
} {
  const valid = validateReflectionPrompt(raw.reflectionPrompt);
  return valid
    ? { reflectionPrompt: valid, source: 'provider' }
    : { reflectionPrompt: REFLECTION_PROMPT_FALLBACK, source: 'fallback' };
}

/**
 * Raw -> final boundary: guarantees a non-empty governed reflectionPrompt on
 * the final output before validateInterpretation's parse/red-line scan.
 */
export function finalizeReflectionPrompt(raw: RawInterpretationOutput): InterpretationOutput {
  return { ...raw, reflectionPrompt: resolveReflectionPrompt(raw).reflectionPrompt };
}
