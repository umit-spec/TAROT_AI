import { CardContextKey } from '../../types/card';
import {
  IntensityLevel,
  Persona,
  QuestionDomain,
  ResponseDepth,
  SpiritualPreference,
  UrgencyLevel,
} from '../../types/intake';
import {
  countMatches,
  DOMAIN_KEYWORDS,
  EMOTIONAL_INTENSITY_KEYWORDS,
  PERSONA_KEYWORDS,
  SPIRITUAL_PREFERENCE_KEYWORDS,
  URGENCY_KEYWORDS,
} from './keywords';

export interface DomainScoring {
  domain: QuestionDomain;
  multiDomainDetected: boolean;
  // topicHint contradicted by strong textual evidence for a different
  // domain - the hint still wins (an explicit UI choice is a deliberate
  // user act, per the Ethical Constitution's autonomy principle), but the
  // conflict is recorded, not silently discarded. See safety.ts.
  hintConflict: boolean;
  topScore: number;
}

/**
 * topicHint (an explicit UI topic button, if collected) is a hint, not a
 * forced override: it wins unless the free text itself scores strictly
 * higher for a *different* domain, in which case the hint still wins (user
 * choice stands) but hintConflict is set so the mismatch is observable
 * (safetyFlags -> 'topic_hint_conflict'), not silently absorbed.
 */
export function scoreDomain(text: string, topicHint?: 'relationship' | 'career' | 'self'): DomainScoring {
  const scores: Record<'relationship' | 'career' | 'self', number> = {
    relationship: countMatches(text, DOMAIN_KEYWORDS.relationship),
    career: countMatches(text, DOMAIN_KEYWORDS.career),
    self: countMatches(text, DOMAIN_KEYWORDS.self),
  };

  if (topicHint) {
    const hintScore = scores[topicHint];
    const strongerElsewhere = (Object.keys(scores) as Array<keyof typeof scores>).some(
      (k) => k !== topicHint && scores[k] > hintScore
    );
    return { domain: topicHint, multiDomainDetected: false, hintConflict: strongerElsewhere, topScore: Math.max(hintScore, 1) };
  }

  const max = Math.max(scores.relationship, scores.career, scores.self);
  if (max === 0) {
    return { domain: 'self', multiDomainDetected: false, hintConflict: false, topScore: 0 };
  }

  const winners = (Object.keys(scores) as Array<keyof typeof scores>).filter((k) => scores[k] === max);
  if (winners.length > 1) {
    return { domain: 'general', multiDomainDetected: true, hintConflict: false, topScore: max };
  }
  return { domain: winners[0], multiDomainDetected: false, hintConflict: false, topScore: max };
}

/** Bridge for card data, which only has 3 contextualMeanings buckets today. */
export function toCardContext(domain: QuestionDomain): CardContextKey {
  if (domain === 'self') return 'general';
  return domain;
}

export interface PersonaScoring {
  persona: Persona;
  topScore: number;
}

export function scorePersona(text: string): PersonaScoring {
  const entries = Object.entries(PERSONA_KEYWORDS) as Array<[Persona, readonly string[]]>;
  const scores = entries.map(([persona, keywords]) => ({ persona, score: countMatches(text, keywords) }));

  const max = Math.max(...scores.map((s) => s.score));
  if (max === 0) {
    return { persona: 'reflection-seeking', topScore: 0 };
  }

  // First match wins on a tie, in declaration order - deterministic and
  // reflection-seeking (the safe default) is declared last, so it only
  // wins ties by being the sole nonzero scorer, never by tiebreak luck.
  const winner = scores.find((s) => s.score === max)!;
  return { persona: winner.persona, topScore: max };
}

export function scoreEmotionalIntensity(text: string): IntensityLevel {
  if (countMatches(text, EMOTIONAL_INTENSITY_KEYWORDS.high) > 0) return 'high';
  if (countMatches(text, EMOTIONAL_INTENSITY_KEYWORDS.medium) > 0) return 'medium';
  return 'low';
}

export function scoreUrgency(text: string): UrgencyLevel {
  if (countMatches(text, URGENCY_KEYWORDS.high) > 0) return 'high';
  if (countMatches(text, URGENCY_KEYWORDS.medium) > 0) return 'medium';
  return 'low';
}

export function scoreSpiritualPreference(text: string): SpiritualPreference {
  const symbolic = countMatches(text, SPIRITUAL_PREFERENCE_KEYWORDS.symbolic);
  const psychological = countMatches(text, SPIRITUAL_PREFERENCE_KEYWORDS.psychological);
  if (symbolic > psychological) return 'symbolic';
  if (psychological > symbolic) return 'psychological';
  return 'balanced';
}

export function scoreResponseDepth(persona: Persona, emotionalIntensity: IntensityLevel): ResponseDepth {
  if (emotionalIntensity === 'high') return 'brief';
  if (persona === 'experienced-practitioner') return 'deep';
  return 'standard';
}

/**
 * Not a statistical model - a simple, auditable signal-count heuristic.
 * 0 when nothing matched anywhere (pure fallback-default territory), rising
 * with how much keyword evidence supported the winning domain + persona.
 */
export function scoreConfidence(domainScore: number, personaScore: number): number {
  if (domainScore === 0 && personaScore === 0) return 0.2;
  return Math.min(1, (domainScore + personaScore) / 4);
}
