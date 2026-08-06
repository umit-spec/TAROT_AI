/**
 * Three-level crisis classifier (H2).
 *
 * Supersedes the H1 clause matcher. H1 patched a substring scan; this decides
 * between three outcomes on token-based, Turkish-aware matching:
 *
 *   NORMAL            - ordinary reflective question, deliver the reading
 *   EMOTIONAL_SUPPORT - real distress, no crisis disclosure: acknowledge
 *                       first, and never open with a prediction
 *   CRISIS            - withhold the reading entirely, show resources
 *
 * WHY THREE LEVELS AND NOT TWO
 *
 * A binary gate forces every distressed-but-not-in-danger user through one of
 * two wrong doors: either a crisis screen they did not need, or a breezy tarot
 * reading that ignores what they just said. "Çok üzgünüm ve kafam karışık" is
 * neither an emergency nor a neutral question. The middle level exists so the
 * product can respond to distress without either over- or under-reacting.
 *
 * WHAT THIS IS NOT
 *
 * Not a clinical instrument. It does not diagnose, score risk, or triage. It
 * decides only what the product shows next. Every rule is a fixed, reviewable
 * list; there is no model, no inference, and no learned threshold.
 */

import {
  containsPhrase,
  stripSeparators,
  tokenize,
  type TokenMatchOptions,
} from './turkish-text';
import {
  CRISIS_KEYWORDS,
  FUZZY_EXEMPT_PHRASES,
  MILD_DISTRESS_KEYWORDS,
  STRONG_DISTRESS_KEYWORDS,
} from './keywords';

export type CrisisLevel = 'normal' | 'emotional_support' | 'crisis';

export interface CrisisAssessment {
  level: CrisisLevel;
  /** Categorical crisis flags, e.g. 'crisis_suicide_detected'. Never text. */
  categories: string[];
  /**
   * True when a crisis keyword DID match but an exclusion discounted it.
   * Used for the fail-safe below; carries no user text.
   */
  discounted: boolean;
  distressSignals: number;
}

/* ------------------------------------------------------------------ *
 * Clause splitting
 * ------------------------------------------------------------------ */

/**
 * Turkish contrastive conjunctions carry the reversal that matters here, plus
 * ordinary sentence punctuation. Negation must never clear a whole message, so
 * every clause is judged on its own.
 */
const CLAUSE_SPLIT = /(?:[.!?;\n]+|\s+(?:ama|fakat|ancak|lakin|oysa)\s+)/u;

function splitClauses(text: string): string[] {
  return text
    .split(CLAUSE_SPLIT)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

/* ------------------------------------------------------------------ *
 * Exclusions (carried forward from H1, now token-based)
 * ------------------------------------------------------------------ */

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
  'böyle bir niyetim yok',
  'öyle bir niyetim yok',
];

const REPORTED_SPEECH_MARKERS = [
  'haberlerde', 'haberde', 'haberini', 'filmde', 'dizide', 'kitapta',
  'gazetede', 'sosyal medyada', 'diye duydum', 'diye okudum', 'okumuştum',
  'belgeselde', 'arkadaşım', 'komşum', 'tanıdığım',
];

/**
 * First-person intent overrides a reported-speech exclusion, so narration can
 * never be used to smuggle a real disclosure past the gate.
 */
const FIRST_PERSON_INTENT_MARKERS = [
  'istiyorum', 'düşünüyorum', 'planlıyorum', 'kendime', 'kendimi',
  'ben de', 'niyetim', 'karar verdim',
];

const RESOLVED_SYMPTOM_MARKERS = [
  'ama iyiyim', 'ama şimdi iyiyim', 'ama geçti', 'geçti artık',
  'gibi hissettim', 'gibi oldum', 'eskiden', 'geçen sene', 'geçen yıl',
];

const HEDGE_MARKERS = ['gibi hissediyorum', 'gibi hissettim', 'gibi geliyor', 'sanki'];

/**
 * Informational framing about a condition, rather than reporting one now
 * ("Kalp krizi riski var mı diye merak ediyorum"). Medical category only.
 *
 * Kept to phrasings that are unambiguously about wanting information. Notably
 * absent: 'nasıl anlarım', which someone mid-symptom could plausibly write.
 */
const MEDICAL_CURIOSITY_MARKERS = [
  'merak ediyorum',
  'riski var mı',
  'riski nedir',
  'belirtileri neler',
  'diye merak',
  'okumak istiyorum',
];

/** Hedging may soften ONLY these categories. Never suicide, never violence. */
const HEDGEABLE_CATEGORIES = new Set(['crisis_assault_detected', 'crisis_medical_detected']);

const HYPERBOLE_CAUSES = [
  'sıcaktan', 'bu sıcakta', 'soğuktan', 'utançtan', 'gülmekten',
  'açlıktan', 'yorgunluktan', 'sıkıntıdan', 'mahcubiyetten',
];

/** Suicide signals that no hyperbole or hedge exclusion may ever discount. */
const NON_NEGOTIABLE_SUICIDE_SIGNALS = [
  'intihar', 'kendime zarar', 'canıma kıy', 'hayatıma son ver',
  'yaşamıma son ver', 'hayatımı bitir', 'bileklerimi kes', 'kendimi asmak',
];

/* ------------------------------------------------------------------ *
 * Matching
 * ------------------------------------------------------------------ */

/**
 * Typo tolerance is enabled per-phrase, not globally. A short or common phrase
 * under fuzzy matching becomes a false-positive engine, so `FUZZY_EXEMPT_PHRASES`
 * names the ones that must stay exact.
 */
function matchOptionsFor(phrase: string): TokenMatchOptions {
  return { allowSuffix: true, fuzzy: !FUZZY_EXEMPT_PHRASES.includes(phrase) };
}

function clauseHasAny(clauseTokens: string[], phrases: readonly string[]): boolean {
  return phrases.some((p) => containsPhrase(clauseTokens, p, { allowSuffix: true }));
}

function hasNonNegotiableSuicideSignal(clauseTokens: string[]): boolean {
  return NON_NEGOTIABLE_SUICIDE_SIGNALS.some((p) =>
    containsPhrase(clauseTokens, p, { allowSuffix: true })
  );
}

function isClauseExcluded(clause: string, clauseTokens: string[], category: string): boolean {
  if (clauseHasAny(clauseTokens, NEGATED_CRISIS_PHRASES)) return true;

  if (
    clauseHasAny(clauseTokens, REPORTED_SPEECH_MARKERS) &&
    !clauseHasAny(clauseTokens, FIRST_PERSON_INTENT_MARKERS)
  ) {
    return true;
  }

  if (
    category === 'crisis_medical_detected' &&
    (clauseHasAny(clauseTokens, RESOLVED_SYMPTOM_MARKERS) ||
      clauseHasAny(clauseTokens, MEDICAL_CURIOSITY_MARKERS))
  ) {
    return true;
  }

  if (HEDGEABLE_CATEGORIES.has(category) && clauseHasAny(clauseTokens, HEDGE_MARKERS)) {
    return true;
  }

  if (
    category === 'crisis_suicide_detected' &&
    !hasNonNegotiableSuicideSignal(clauseTokens) &&
    clauseHasAny(clauseTokens, HYPERBOLE_CAUSES)
  ) {
    return true;
  }

  // `clause` is kept in the signature for future rules that need raw spacing;
  // no current rule reads it.
  void clause;
  return false;
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/**
 * Assess one piece of user text.
 *
 * `rawText` is the user's question. All folding, tokenization, and matching
 * happen inside; the caller does not need to normalize first, and passing
 * already-lowercased text is harmless because `foldCase` is idempotent.
 */
export function assessCrisis(rawText: string): CrisisAssessment {
  const categories = new Set<string>();
  let discounted = false;

  // De-obfuscated whole-text view, used ONLY to catch separator tricks on
  // unambiguous single-word signals. Deliberately not the primary path: a
  // fully-joined string can fuse innocent neighbouring words.
  const stripped = stripSeparators(rawText);

  for (const clause of splitClauses(rawText)) {
    const clauseTokens = tokenize(clause);

    for (const [category, phrases] of Object.entries(CRISIS_KEYWORDS)) {
      if (categories.has(category)) continue;

      const hit = phrases.some((p) => containsPhrase(clauseTokens, p, matchOptionsFor(p)));
      if (!hit) continue;

      if (isClauseExcluded(clause, clauseTokens, category)) {
        discounted = true;
        continue;
      }
      categories.add(category);
    }
  }

  // Separator-obfuscated single words that tokenization alone cannot see.
  // Restricted to the non-negotiable list, where a false positive is a crisis
  // screen rather than a missed disclosure.
  //
  // MUST NOT RUN WHEN `discounted` IS SET. If a clause matched and an
  // exclusion deliberately cleared it, this crude whole-text view would
  // silently overturn that decision - "Haberlerde bir intihar haberi gördüm"
  // still contains "intihar" in the stripped string. The exclusions are the
  // considered judgement; this fallback only covers the case where nothing
  // matched at all.
  if (categories.size === 0 && !discounted) {
    for (const signal of NON_NEGOTIABLE_SUICIDE_SIGNALS) {
      if (signal.includes(' ')) continue;
      if (stripped.includes(stripSeparators(signal))) {
        categories.add('crisis_suicide_detected');
        break;
      }
    }
  }

  const allTokens = tokenize(rawText);
  const strongDistress = STRONG_DISTRESS_KEYWORDS.filter((p) =>
    containsPhrase(allTokens, p, { allowSuffix: true })
  ).length;
  const mildDistress = MILD_DISTRESS_KEYWORDS.filter((p) =>
    containsPhrase(allTokens, p, { allowSuffix: true })
  ).length;
  const distressSignals = strongDistress + mildDistress;

  if (categories.size > 0) {
    return { level: 'crisis', categories: [...categories], discounted, distressSignals };
  }

  /**
   * FAIL-SAFE. A crisis keyword matched and an exclusion discounted it, but
   * the person is also showing real distress. Rather than resolve that
   * ambiguity toward "ordinary tarot question", degrade to emotional support:
   * the user is acknowledged and the reading is still delivered, so the cost
   * of being wrong is a gentler tone rather than a missed disclosure.
   */
  if (discounted && distressSignals > 0) {
    return { level: 'emotional_support', categories: [], discounted, distressSignals };
  }

  // One STRONG signal is enough ("Dayanamıyorum artık"); MILD signals are
  // ordinary alone ("Biraz endişeliyim yeni iş hakkında") and need company.
  if (strongDistress >= 1 || mildDistress >= 2) {
    return { level: 'emotional_support', categories: [], discounted, distressSignals };
  }

  return { level: 'normal', categories: [], discounted, distressSignals };
}

/** Internals exposed for targeted tests only. */
export const CRISIS_CLASSIFIER_INTERNALS = {
  NEGATED_CRISIS_PHRASES,
  REPORTED_SPEECH_MARKERS,
  FIRST_PERSON_INTENT_MARKERS,
  HEDGE_MARKERS,
  HYPERBOLE_CAUSES,
  NON_NEGOTIABLE_SUICIDE_SIGNALS,
  splitClauses,
} as const;
