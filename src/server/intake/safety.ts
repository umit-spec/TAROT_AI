import { ABSOLUTE_ADVICE_KEYWORDS, countMatches, PROMPT_INJECTION_PATTERNS } from './keywords';
import { assessCrisis, type CrisisLevel } from './crisis-classifier';

export const MIN_MEANINGFUL_INPUT_LENGTH = 3;

/**
 * Every flag here is additive evidence, not a verdict - the Intake Engine
 * classifies, it never blocks a reading itself (per instruction: must not
 * interfere with card selection). Any 'crisis_*' flag is the caller's
 * signal to withhold the reading and show the docs/02-ETHICAL_CONSTITUTION.md
 * crisis modal instead - that decision lives outside this module.
 */
export function computeSafetyFlags(
  normalizedText: string,
  multiDomainDetected: boolean,
  hintConflict: boolean
): string[] {
  const flags: string[] = [];

  // H2: token-based, Turkish-aware, three-level assessment. See
  // ./crisis-classifier.ts. Only the CRISIS level produces crisis_* flags;
  // the EMOTIONAL_SUPPORT level is surfaced separately (below) because it
  // must NOT withhold the reading.
  const assessment = assessCrisis(normalizedText);
  flags.push(...assessment.categories);
  if (assessment.level === 'emotional_support') {
    flags.push('emotional_support_indicated');
  }

  for (const [flag, keywords] of Object.entries(ABSOLUTE_ADVICE_KEYWORDS)) {
    if (countMatches(normalizedText, keywords) > 0) flags.push(flag);
  }

  if (PROMPT_INJECTION_PATTERNS.some((pattern) => normalizedText.includes(pattern))) {
    flags.push('prompt_injection_suspected');
  }

  if (multiDomainDetected) {
    flags.push('multi_domain_detected');
  }

  // topicHint (explicit UI choice) was honored, but the free text itself
  // scored higher for a different domain - recorded, not silently absorbed.
  if (hintConflict) {
    flags.push('topic_hint_conflict');
  }

  if (normalizedText.length < MIN_MEANINGFUL_INPUT_LENGTH) {
    flags.push('empty_or_too_short_input');
  }

  return flags;
}

/** Used by the API route's crisis gate - flags follow the CRISIS_KEYWORDS naming convention (crisis_*). */
export function isCrisisFlag(flag: string): boolean {
  return flag.startsWith('crisis_');
}

/**
 * H2 middle level. Distress that warrants an acknowledging opening but must
 * NOT withhold the reading - deliberately a different predicate from
 * `isCrisisFlag`, so no caller can accidentally treat support as a crisis or
 * a crisis as mere support.
 */
export const EMOTIONAL_SUPPORT_FLAG = 'emotional_support_indicated';

export function isEmotionalSupportFlag(flag: string): boolean {
  return flag === EMOTIONAL_SUPPORT_FLAG;
}

/** Re-exported so callers get the level without importing the classifier. */
export type { CrisisLevel };
