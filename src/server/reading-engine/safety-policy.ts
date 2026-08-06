/**
 * Central LLM output safety policy (H3).
 *
 * Replaces the 17-entry literal substring denylist that `validate.ts` used.
 * Measured behaviour of that denylist (docs/MASTER_PROGRAM_STATE_RECOVERY.md
 * §5.3): 7 of 10 adversarial outputs passed, including EVERY uppercase
 * Turkish phrase, because the scan used JavaScript's Turkish-unaware
 * `toLowerCase()` while the intake layer correctly used `toLocaleLowerCase('tr')`.
 *
 * ---
 *
 * DESIGN
 *
 * 1. NORMALIZE FIRST. Every check runs on Turkish-folded, diacritic-folded
 *    text, plus a separator-stripped view for spacing and hyphen evasion.
 *    All patterns below are therefore written in ASCII-folded form
 *    ("gerceklesecek", not "gerçekleşecek").
 *
 * 2. CATEGORIES, NOT A FLAT LIST. Each rule says what kind of harm it guards
 *    against, so a violation can be logged and acted on categorically without
 *    ever logging the offending text.
 *
 * 3. FIELD-LEVEL RULES. Fields do different jobs. `uncertaintyNotice` is
 *    supposed to talk about the limits of the reading; `practicalReflection`
 *    is supposed to suggest something the user might consider. Applying one
 *    blanket rule to both either over-blocks one or under-blocks the other.
 *
 * 4. REJECT, NEVER REPAIR. A failing field is replaced by a governed
 *    fallback. The model's text is never edited into compliance — editing
 *    hides the fact that the model produced something unsafe, and the edited
 *    result is not something any human wrote or reviewed.
 *
 * WHAT THIS CANNOT DO: it is a denylist over known harmful forms. It will not
 * catch every paraphrase, and it must not be described as if it did. It is one
 * layer; the bounded prompt and the grounded knowledge context are the others.
 */

import { normalizeForMatch, stripSeparators } from '../intake/turkish-text';

export type SafetyCategory =
  | 'certainty'
  | 'command'
  | 'medical'
  | 'legal'
  | 'financial'
  | 'thirdParty'
  | 'mysticAuthority'
  | 'dependency'
  | 'fear'
  | 'exclusivity'
  | 'professionalAdvice'
  | 'privacyLeak'
  | 'chainOfThought'
  | 'promptLeak';

export interface SafetyRule {
  category: SafetyCategory;
  /** Matched against normalized text. Written ASCII-folded. */
  pattern: RegExp;
  /** Human-readable reason, for evidence reports. Never shown to a user. */
  note: string;
}

/**
 * Rules. Patterns are intentionally readable rather than clever: a reviewer
 * must be able to tell what each one blocks without running it.
 */
export const SAFETY_RULES: readonly SafetyRule[] = [
  // ---- certainty / prophecy -------------------------------------------
  { category: 'certainty', pattern: /\bkesinlikle\b/u, note: 'absolute certainty' },
  // Negative lookahead: a professional referral ("mutlaka bir doktora
  // danisin") is exactly what this product should say, so 'mutlaka' only
  // fires when it is NOT followed by a referral verb.
  { category: 'certainty', pattern: /\bmutlaka\b(?!.{0,40}\b(danis|basvur|gorun|yardim al))/u, note: 'absolute necessity' },
  { category: 'certainty', pattern: /\bgarantili\b|\bgaranti ederim\b|\bgaranti veriyorum\b/u, note: 'guarantee' },
  { category: 'certainty', pattern: /\bhic suphe yok\b|\bsuphesiz\b|\bkuskusuz\b/u, note: 'no-doubt framing' },
  { category: 'certainty', pattern: /\beminim ki\b|\bkesin olarak\b|\bkesin bir sekilde\b/u, note: 'certainty framing' },
  { category: 'certainty', pattern: /\bmutlaka olacak\b|\bgerceklesecek\b|\bolacagi kesin\b/u, note: 'prophecy' },
  { category: 'certainty', pattern: /\b(kazanacaksin|kaybedeceksin|bulacaksin|donecek|ayrilacaksin|evleneceksin)\b/u, note: 'second-person future prediction' },
  { category: 'certainty', pattern: /\b(onumuzdeki|gelecek)\s+(ay|hafta|yil)\b.{0,40}\b\w+acaksin\b/u, note: 'dated prediction' },
  // Negated fate talk ("kaderin yazili olduguna inanmak zorunda degilsiniz")
  // is the opposite of asserting fate.
  { category: 'certainty', pattern: /(\bkaderin yazili\b|\bkaderinde\b.{0,30}\bvar\b)(?!.{0,45}\b(degil|zorunda degil|inanmak zorunda))/u, note: 'fate as fact' },

  // ---- direct command --------------------------------------------------
  { category: 'command', pattern: /\byapman gereken tek sey\b/u, note: 'single prescribed action' },
  { category: 'command', pattern: /\bmutlaka yap\b|\bhemen yap\b|\bderhal\b/u, note: 'imperative urgency' },
  { category: 'command', pattern: /\b(ayril|bosan|istifa et|terk et|birak onu)\b/u, note: 'life-decision imperative' },
  { category: 'command', pattern: /\bbunu yapmalisin\b|\byapmak zorundasin\b/u, note: 'obligation framing' },

  // ---- medical ---------------------------------------------------------
  { category: 'medical', pattern: /\bilaci birak\b|\bilacini birak\b|\bilaci azalt\b|\bilacini azalt\b/u, note: 'medication advice' },
  { category: 'medical', pattern: /\b(depresyon|anksiyete|bipolar|travma)\b.{0,20}\b(isareti|belirtisi|var sende|yasiyorsun)\b/u, note: 'diagnosis' },
  { category: 'medical', pattern: /\bhastaligi gececeksin\b|\bagrin gececek\b|\biyilesecesin\b/u, note: 'medical outcome promise' },
  { category: 'medical', pattern: /\bhamile kal(acaksin|mayacaksin)\b/u, note: 'fertility prediction' },
  // "Bu okuma bir teshis degildir" is a disclaimer, not a diagnosis.
  { category: 'medical', pattern: /\b(teshis|tani koy)\b(?!.{0,20}\b(degildir|degil|koymaz|koyamaz|sunmaz))/u, note: 'diagnostic framing' },

  // ---- legal -----------------------------------------------------------
  { category: 'legal', pattern: /\bdavayi kazanacaksin\b|\bdavayi kaybedeceksin\b/u, note: 'legal outcome' },
  { category: 'legal', pattern: /\bmahkeme\b.{0,20}\blehine sonuclanacak\b/u, note: 'court outcome' },
  { category: 'legal', pattern: /\bbosan, daha iyi olacak\b/u, note: 'legal-adjacent imperative' },

  // ---- financial -------------------------------------------------------
  { category: 'financial', pattern: /\bkripto al\b|\bhisse al\b|\byatirim yap\b(?!.{0,30}\bdanis)/u, note: 'investment instruction' },
  { category: 'financial', pattern: /\bparalarin artacak\b|\bzengin olacaksin\b|\bkar edeceksin\b/u, note: 'financial outcome' },
  { category: 'financial', pattern: /\bkredi cek\b|\bborclan\b/u, note: 'financial instruction' },

  // ---- third-party mind reading ---------------------------------------
  { category: 'thirdParty', pattern: /\b(o|onun|partnerin|esin|sevgilin|patronun|annen|baban)\b.{0,25}\bseni (seviyor|sevmiyor|aldatiyor|dusunuyor)\b/u, note: 'third-party inner state as fact' },
  { category: 'thirdParty', pattern: /\bicinden gecenler\b|\bgercek niyeti\b|\bgizli dusuncesi\b/u, note: 'third-party mind reading' },
  { category: 'thirdParty', pattern: /\bsana yalan soyluyor\b|\bseni kandiriyor\b/u, note: 'third-party accusation' },

  // ---- mystic authority / causality -----------------------------------
  { category: 'mysticAuthority', pattern: /\bevren sana mesaj veriyor\b|\bevren seni\b/u, note: 'mystical causality' },
  { category: 'mysticAuthority', pattern: /\bkartlar emrediyor\b|\bkartlar soyluyor ki kesin\b/u, note: 'cards as authority' },
  { category: 'mysticAuthority', pattern: /\bruhun bunu istiyor\b|\benerjin bunu soyluyor\b/u, note: 'spiritual authority' },

  // ---- dependency ------------------------------------------------------
  { category: 'dependency', pattern: /\bher gun kart ac\b|\bher gun bana sor\b|\btekrar tekrar bak\b/u, note: 'usage dependency' },
  { category: 'dependency', pattern: /\bbensiz karar verme\b|\bonce bana danis\b/u, note: 'dependency on the product' },
  { category: 'dependency', pattern: /\bbu okuma olmadan\b.{0,25}\byapamazsin\b/u, note: 'dependency framing' },

  // ---- fear / manipulation --------------------------------------------
  { category: 'fear', pattern: /\bkotu bir sey olacak\b|\bfelaket\b.{0,20}\byaklasiyor\b/u, note: 'fear induction' },
  { category: 'fear', pattern: /\bsimdi harekete gecmezsen\b.{0,30}\bgec olacak\b/u, note: 'urgency manipulation' },
  { category: 'fear', pattern: /\bson sansin\b|\bbir daha bu firsat\b/u, note: 'scarcity manipulation' },

  // ---- exclusivity / special status -----------------------------------
  { category: 'exclusivity', pattern: /\bozel enerjin var\b|\bsecilmis\b|\bnadir bir ruhsun\b/u, note: 'special-status flattery' },
  { category: 'exclusivity', pattern: /\bsadece tarot bunu bilir\b|\bbaskasi bunu goremez\b/u, note: 'exclusive knowledge' },
  { category: 'exclusivity', pattern: /\bspecial souls\b|\bchosen one\b/u, note: 'English special-status phrasing' },

  // ---- professional advice boundary -----------------------------------
  { category: 'professionalAdvice', pattern: /\bdoktora gitmene gerek yok\b|\bterapiye gerek yok\b/u, note: 'discourages professional help' },
  { category: 'professionalAdvice', pattern: /\bavukata gerek yok\b|\buzman gerekmez\b/u, note: 'discourages legal/expert help' },

  // ---- leakage ---------------------------------------------------------
  { category: 'privacyLeak', pattern: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/u, note: 'email address in output' },
  { category: 'privacyLeak', pattern: /\b(?:\+?90[\s-]?)?0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/u, note: 'phone number in output' },
  { category: 'chainOfThought', pattern: /\bdusunce zincirim\b|\bonce sunu dusundum\b|\badim adim dusunelim\b/u, note: 'reasoning leak' },
  { category: 'chainOfThought', pattern: /\bchain of thought\b|\blet me think step by step\b/u, note: 'reasoning leak (English)' },
  // No TRAILING \b on the Turkish stems: agglutination means "talimat" is
  // normally written "talimatlar"/"talimatları", and a closing word boundary
  // makes the pattern miss every inflected form.
  { category: 'promptLeak', pattern: /\bsistem talimat|\bsana verilen talimat|\bprompt'?um\b/u, note: 'prompt leak' },
  { category: 'promptLeak', pattern: /\bsystem prompt\b|\byou are an ai\b|\bas an ai language model\b/u, note: 'prompt/model leak' },
];

export interface SafetyViolation {
  category: SafetyCategory;
  note: string;
}

/**
 * Scan one string.
 *
 * Checks BOTH the normalized text and the separator-stripped view, so
 * "k e s i n l i k l e" and "kesin-likle" are caught alongside the plain form.
 * The stripped view is only ever used to ADD detections, never to clear one.
 */
export function findViolations(text: string): SafetyViolation[] {
  if (!text) return [];

  const normalized = normalizeForMatch(text);
  const stripped = stripSeparators(text);
  // Word boundaries do not survive separator stripping, so the stripped view
  // is checked with a boundary-free variant of each pattern.
  const strippedProbe = ` ${stripped} `;

  const found: SafetyViolation[] = [];
  const seen = new Set<string>();

  for (const rule of SAFETY_RULES) {
    const key = `${rule.category}:${rule.note}`;
    if (seen.has(key)) continue;

    let hit = rule.pattern.test(normalized);

    // The stripped view removes ALL separators, so it can only be used for
    // patterns that do not depend on spacing. Two kinds are excluded:
    //
    //  - patterns containing a literal space: the space cannot survive
    //    stripping, so they would never match anyway;
    //  - patterns with a negative lookahead: their EXEMPTION usually depends
    //    on a multi-word phrase ("mutlaka ... doktora danisin"), which also
    //    loses its spaces. Running them here inverts the exemption and turns
    //    correctly-allowed safety language into a violation.
    const strippedSafe = !rule.pattern.source.includes('(?!') && !rule.pattern.source.includes(' ');

    if (!hit && strippedSafe) {
      const loose = new RegExp(rule.pattern.source.replace(/\\b/g, ''), rule.pattern.flags);
      hit = loose.test(strippedProbe);
    }

    if (hit) {
      found.push({ category: rule.category, note: rule.note });
      seen.add(key);
    }
  }

  return found;
}

export function isSafe(text: string): boolean {
  return findViolations(text).length === 0;
}

/* ------------------------------------------------------------------ *
 * Field-level policy
 * ------------------------------------------------------------------ */

export type GovernedField =
  | 'opening'
  | 'symbolicMeaning'
  | 'relevanceToQuestion'
  | 'reflection'
  | 'patterns'
  | 'practicalReflection'
  | 'uncertaintyNotice'
  | 'reflectionPrompt';

export interface FieldPolicy {
  field: GovernedField;
  maxChars: number;
  minChars: number;
  /** Categories that are always fatal for this field. */
  forbidden: readonly SafetyCategory[];
  /** Governed replacement used when the field fails. Never a repair. */
  fallback: string;
  purpose: string;
}

/**
 * Every category is forbidden everywhere EXCEPT where a narrower list is
 * genuinely justified. Starting from "all forbidden" and subtracting is the
 * safe direction; starting from a small list and adding is how gaps appear.
 */
const ALL_CATEGORIES: readonly SafetyCategory[] = [
  'certainty', 'command', 'medical', 'legal', 'financial', 'thirdParty',
  'mysticAuthority', 'dependency', 'fear', 'exclusivity', 'professionalAdvice',
  'privacyLeak', 'chainOfThought', 'promptLeak',
];

export const FIELD_POLICIES: Readonly<Record<GovernedField, FieldPolicy>> = {
  opening: {
    field: 'opening',
    minChars: 10,
    maxChars: 400,
    forbidden: ALL_CATEGORIES,
    fallback: 'Bu okuma, sorunuz üzerine düşünmek için sembolik bir çerçeve sunar.',
    purpose: 'Sets the frame for the reading. Never a prediction, never a verdict.',
  },
  symbolicMeaning: {
    field: 'symbolicMeaning',
    minChars: 10,
    maxChars: 600,
    forbidden: ALL_CATEGORIES,
    fallback: 'Bu kartın sembolü, durumunuza dair bir düşünme alanı açar.',
    purpose: "Describes the card's symbolism. Grounded in the knowledge context only.",
  },
  relevanceToQuestion: {
    field: 'relevanceToQuestion',
    minChars: 10,
    maxChars: 600,
    forbidden: ALL_CATEGORIES,
    fallback: 'Bu kart, sorduğunuz konuya farklı bir açıdan bakmayı önerir.',
    purpose: "Connects the card to the user's question, as one perspective among others.",
  },
  reflection: {
    field: 'reflection',
    minChars: 10,
    maxChars: 500,
    forbidden: ALL_CATEGORIES,
    fallback: 'Bu kart üzerine kendi deneyiminizden ne hatırlıyorsunuz?',
    purpose: 'Invites the reader to reflect. Never instructs.',
  },
  patterns: {
    field: 'patterns',
    minChars: 5,
    maxChars: 300,
    forbidden: ALL_CATEGORIES,
    fallback: 'Kartlar arasında birden fazla okuma biçimi mümkün.',
    purpose: 'Names a pattern across the spread, as an observation not a conclusion.',
  },
  practicalReflection: {
    field: 'practicalReflection',
    minChars: 10,
    maxChars: 700,
    // `command` is the central risk here: this is the field most likely to
    // slide from "something to consider" into "do this".
    forbidden: ALL_CATEGORIES,
    fallback:
      'Bu okumayı, karar vermek için değil, kendi düşüncenizi netleştirmek için kullanabilirsiniz.',
    purpose: 'Offers something to consider. Never a directive, never a plan of action.',
  },
  uncertaintyNotice: {
    field: 'uncertaintyNotice',
    minChars: 10,
    maxChars: 400,
    forbidden: ALL_CATEGORIES,
    fallback:
      'Bu okuma kesin bilgi değildir; sembolik bir yorumdur ve yalnızca sizin değerlendirmenizle anlam kazanır.',
    purpose: 'States the limits of the reading. The one field whose job is to reduce certainty.',
  },
  reflectionPrompt: {
    field: 'reflectionPrompt',
    minChars: 20,
    maxChars: 220,
    forbidden: ALL_CATEGORIES,
    fallback: 'Bu okumada size en çok ne tanıdık geldi?',
    purpose: 'Exactly one open reflective question addressed to the user.',
  },
};

export interface FieldOutcome {
  value: string;
  source: 'provider' | 'fallback';
  violations: SafetyViolation[];
  /** Set when the fallback was used for a non-safety reason (length). */
  structural?: 'too_short' | 'too_long';
}

/**
 * VALIDATE -> REJECT -> FALLBACK for a single field.
 *
 * Never repairs. Either the provider's text passes untouched, or the governed
 * fallback replaces it whole. The returned `violations` are categorical and
 * carry no user or model text, so they are safe to log.
 */
export function governField(field: GovernedField, value: string | undefined): FieldOutcome {
  const policy = FIELD_POLICIES[field];
  const text = (value ?? '').trim();

  if (text.length < policy.minChars) {
    return { value: policy.fallback, source: 'fallback', violations: [], structural: 'too_short' };
  }
  if (text.length > policy.maxChars) {
    return { value: policy.fallback, source: 'fallback', violations: [], structural: 'too_long' };
  }

  const violations = findViolations(text).filter((v) => policy.forbidden.includes(v.category));
  if (violations.length > 0) {
    return { value: policy.fallback, source: 'fallback', violations };
  }

  return { value: text, source: 'provider', violations: [] };
}
