import {
  ABSOLUTE_ADVICE_KEYWORDS,
  countMatches,
  CRISIS_KEYWORDS,
  PROMPT_INJECTION_PATTERNS,
} from './keywords';
import { matchesCrisisCategory } from './crisis-match';

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

  // Clause-scoped, with negation and reported-speech exclusions (H1). NOT a
  // plain substring scan - see ./crisis-match.ts for why message-level
  // negation would be unsafe.
  for (const [flag, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    if (matchesCrisisCategory(normalizedText, flag, keywords)) flags.push(flag);
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
