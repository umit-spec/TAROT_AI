import {
  ABSOLUTE_ADVICE_KEYWORDS,
  countMatches,
  CRISIS_KEYWORDS,
  PROMPT_INJECTION_PATTERNS,
} from './keywords';

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
  multiDomainDetected: boolean
): string[] {
  const flags: string[] = [];

  for (const [flag, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    if (countMatches(normalizedText, keywords) > 0) flags.push(flag);
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

  if (normalizedText.length < MIN_MEANINGFUL_INPUT_LENGTH) {
    flags.push('empty_or_too_short_input');
  }

  return flags;
}
