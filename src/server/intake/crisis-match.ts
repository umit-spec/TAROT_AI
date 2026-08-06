/**
 * H1 crisis matching layer.
 *
 * WHAT THIS IS: a narrow, auditable fix for measured false positives and the
 * most indefensible false negatives in the crisis gate. It replaces a bare
 * `text.includes(keyword)` scan with clause-scoped matching plus two explicit
 * exclusion lists.
 *
 * WHAT THIS IS NOT: the full crisis rebuild. Turkish morphology-aware
 * tokenization, transliteration aliases, typo tolerance, and the three-level
 * NORMAL / EMOTIONAL_SUPPORT / CRISIS decision model are H2. This module is
 * deliberately small so its behavior is obvious on inspection; H2 replaces it
 * rather than layering onto it.
 *
 * This is not a clinical instrument. It does not diagnose. It decides only
 * whether to withhold a tarot reading and show support resources instead.
 *
 * ---
 *
 * WHY CLAUSE SCOPING
 *
 * Negation must never make a whole message safe. Measured baseline behavior:
 *
 *   "İntihar etmeyi düşünmüyorum ama kendime zarar vermek istiyorum."
 *
 * The first clause is negated; the second is an active crisis statement. A
 * message-level negation check would clear the entire sentence. So the text is
 * split into clauses and each is judged independently: ANY clause that still
 * carries a crisis signal makes the whole message a crisis.
 */

/**
 * Clause separators. Turkish contrastive conjunctions ("ama", "fakat",
 * "ancak", "lakin") are the ones that actually carry a reversal, plus ordinary
 * sentence/clause punctuation.
 */
const CLAUSE_SPLIT = /(?:[.!?;\n]+|\s+(?:ama|fakat|ancak|lakin|oysa)\s+)/u;

/**
 * Explicit negated forms (H1 "minimal negation exclusions").
 *
 * Deliberately a fixed list of whole phrases, NOT a general rule about Turkish
 * negative suffixes. A general -mA- rule would be actively dangerous here:
 * "yaşamak istemiyorum" ("I don't want to live") carries a negative suffix and
 * IS a crisis statement. Only these exact, reviewed constructions clear a
 * clause.
 */
const NEGATED_CRISIS_PHRASES = [
  'intihar etmeyi düşünmüyorum',
  'intihar etmeyi asla düşünmem',
  'intihar etmeyi düşünmem',
  'intihar etmem',
  'intihar etmeyi hiç düşünmedim',
  'kendime zarar vermeyi düşünmüyorum',
  'kendime zarar vermem',
  'kendime zarar vermeyi asla düşünmem',
  'kendime zarar verecek değilim',
];

/**
 * Reported speech / third-party narration markers. A person describing a news
 * item, a film, or something they heard about is not disclosing their own
 * crisis.
 */
const REPORTED_SPEECH_MARKERS = [
  'haberlerde',
  'haberde',
  'haberini',
  'filmde',
  'dizide',
  'kitapta',
  'gazetede',
  'sosyal medyada',
  'diye duydum',
  'diye okudum',
  'okumuştum',
  'belgeselde',
];

/**
 * First-person intent markers that OVERRIDE a reported-speech exclusion.
 *
 * Without this, "haberlerdeki gibi ben de intihar etmek istiyorum" would be
 * dismissed as narration because it mentions the news. A clause that carries
 * the speaker's own intent is never cleared by a narration marker.
 */
const FIRST_PERSON_INTENT_MARKERS = [
  'istiyorum',
  'düşünüyorum',
  'planlıyorum',
  'kendime',
  'kendimi',
  'ben de',
  'bende',
  'niyetim',
  'karar verdim',
];

/**
 * Qualifiers that mark a symptom as recalled, hypothetical, or already
 * resolved rather than happening now. Applied ONLY to the medical category,
 * where "I felt out of breath after exercise but I'm fine" is a measured false
 * positive and the phrasing is genuinely distinguishable.
 */
const RESOLVED_SYMPTOM_MARKERS = [
  'ama iyiyim',
  'ama şimdi iyiyim',
  'ama geçti',
  'geçti artık',
  'gibi hissettim',
  'gibi oldum',
  'sanki',
  'eskiden',
  'geçen sene',
  'geçen yıl',
];

/**
 * Simile / hedging markers — "it feels LIKE violence" is a comparison, not a
 * disclosure ("Patronum bana yükleniyor, şiddet görüyorum gibi hissediyorum").
 *
 * DELIBERATELY NOT APPLIED TO THE SUICIDE CATEGORY. "Kendimi öldürmek
 * istiyorum gibi hissediyorum" is a disclosure, not a simile, and discounting
 * it would be exactly the fail-open behavior this module exists to prevent.
 * Hedging is only ever allowed to soften the assault and medical categories.
 */
const HEDGE_MARKERS = ['gibi hissediyorum', 'gibi hissettim', 'gibi geliyor', 'sanki'];

const HEDGEABLE_CATEGORIES = new Set(['crisis_assault_detected', 'crisis_medical_detected']);

/**
 * Hyperbole with a named trivial cause. Turkish uses "ölmek istiyorum" as
 * everyday exaggeration ("Bu sıcakta ölmek istiyorum resmen") and flagging it
 * sends an ordinary user to a crisis screen.
 *
 * SCOPE IS INTENTIONALLY NARROW: this discounts a clause ONLY when it names
 * one of these mundane causes AND carries no other suicide keyword. A clause
 * mentioning suicide, self-harm, or ending one's life is never discounted,
 * whatever else it contains — see `isHyperbolicDeathWish`.
 */
const HYPERBOLE_CAUSES = [
  'sıcaktan',
  'bu sıcakta',
  'soğuktan',
  'utançtan',
  'gülmekten',
  'açlıktan',
  'yorgunluktan',
  'sıkıntıdan',
  'can sıkıntısından',
  'mahcubiyetten',
];

/** Suicide keywords that no hyperbole exclusion may ever discount. */
const NON_NEGOTIABLE_SUICIDE_SIGNALS = [
  'intihar',
  'kendime zarar',
  'canıma kıy',
  'hayatıma son ver',
  'yaşamıma son ver',
  'hayatımı bitir',
  'bileklerimi kes',
  'kendimi asmak',
];

function isHyperbolicDeathWish(clause: string): boolean {
  if (containsAny(clause, NON_NEGOTIABLE_SUICIDE_SIGNALS)) return false;
  return containsAny(clause, HYPERBOLE_CAUSES);
}

function splitClauses(text: string): string[] {
  return text
    .split(CLAUSE_SPLIT)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function containsAny(clause: string, phrases: readonly string[]): boolean {
  return phrases.some((p) => clause.includes(p));
}

/**
 * True when this clause's crisis signal should be discounted.
 *
 * Order matters: a first-person intent marker defeats the reported-speech
 * exclusion, so narration cannot be used to smuggle a real disclosure past the
 * gate.
 */
function isClauseExcluded(clause: string, category: string): boolean {
  // An explicitly negated crisis construction clears only this clause.
  if (containsAny(clause, NEGATED_CRISIS_PHRASES)) return true;

  // Narration clears the clause only when the speaker is not describing
  // their own intent.
  if (
    containsAny(clause, REPORTED_SPEECH_MARKERS) &&
    !containsAny(clause, FIRST_PERSON_INTENT_MARKERS)
  ) {
    return true;
  }

  // Medical only: a symptom the user themselves frames as past or resolved.
  if (category === 'crisis_medical_detected' && containsAny(clause, RESOLVED_SYMPTOM_MARKERS)) {
    return true;
  }

  // Assault/medical only: an explicit simile rather than a disclosure. Never
  // applied to suicide or violence.
  if (HEDGEABLE_CATEGORIES.has(category) && containsAny(clause, HEDGE_MARKERS)) {
    return true;
  }

  // Suicide only: everyday exaggeration with a named mundane cause, and no
  // non-negotiable suicide signal anywhere in the clause.
  if (category === 'crisis_suicide_detected' && isHyperbolicDeathWish(clause)) {
    return true;
  }

  return false;
}

/**
 * Clause-scoped crisis detection for one category.
 *
 * Returns true when at least one clause contains a keyword for `category` and
 * that clause is not excluded. `normalizedText` must already be lowercased by
 * `normalize()`.
 */
export function matchesCrisisCategory(
  normalizedText: string,
  category: string,
  keywords: readonly string[]
): boolean {
  for (const clause of splitClauses(normalizedText)) {
    const hit = keywords.some((kw) => clause.includes(kw));
    if (!hit) continue;
    if (isClauseExcluded(clause, category)) continue;
    return true;
  }
  return false;
}

/** Exported for tests and for the H2 rebuild to reuse or supersede. */
export const CRISIS_MATCH_INTERNALS = {
  NEGATED_CRISIS_PHRASES,
  REPORTED_SPEECH_MARKERS,
  FIRST_PERSON_INTENT_MARKERS,
  RESOLVED_SYMPTOM_MARKERS,
  splitClauses,
} as const;
