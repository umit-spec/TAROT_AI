/**
 * Controlled keyword/pattern layer (per user instruction: "yalnızca
 * kontrollü anahtar kelime ve pattern katmanı kullanılsın" - a fixed,
 * auditable list, not free-form NLP inference). Every list here is meant
 * to be read and extended by a human, not learned.
 */

export const DOMAIN_KEYWORDS = {
  relationship: [
    'ilişki', 'ilişkim', 'sevgili', 'sevgilim', 'eşim', 'kocam', 'karım',
    'partnerim', 'ayrılık', 'ayrılmalı', 'boşanma', 'boşanmalı', 'aşk',
    'flört', 'evlilik', 'evlenmeli', 'aldatma', 'aldattı', 'sadakatsizlik',
    'nişanlım', 'eski sevgilim',
  ],
  // No bare 'iş' - it's a substring of 'ilişki'/'ilişkim' (relationship),
  // which caused every relationship-only question to also score a false
  // career point. Every entry below is specific enough not to collide.
  career: [
    'işim', 'işimde', 'işimden', 'kariyer', 'kariyerim', 'terfi',
    'işten çıkar', 'işten ayrıl', 'patron', 'maaş', 'iş değişikliği',
    'iş görüşmesi', 'şirket', 'meslek', 'işsizlik', 'yeni iş', 'iş teklifi',
    'girişim', 'kendi işim',
  ],
  self: [
    'kendim', 'kimliğim', 'amacım', 'hayatım', 'benliğim', 'kim olduğum',
    'ne istediğim', 'kendimi', 'iç huzur', 'yolumu',
  ],
} as const;

export const PERSONA_KEYWORDS = {
  'decision-seeking': [
    'karar vermeliyim', 'hangisini seçmeliyim', 'ne yapmalıyım',
    'seçim yapmam gerekiyor', 'karar aşamasındayım', 'karar veremiyorum',
    'hangi yolu seçmeliyim',
  ],
  'emotionally-overwhelmed': [
    'ağlıyorum', 'dayanamıyorum', 'çok kötüyüm', 'yıkıldım', 'mahvoldum',
    'umutsuzum', 'panik', 'çaresizim', 'çok acı veriyor', 'dayanacak gücüm yok',
  ],
  'curious-explorer': [
    'merak ediyorum', 'sadece bakmak istedim', 'ilk defa', 'ilk kez',
    'deniyorum', 'öğrenmek istiyorum', 'nasıl çalışıyor', 'meraktan',
  ],
  'experienced-practitioner': [
    'ters kart', 'açılım', 'majör arkana', 'minör arkana', 'kart okuma',
    'tarot destesi', 'kupa', 'kılıç', 'değnek', 'tılsım serisi',
  ],
  'reflection-seeking': [
    'düşünüyorum', 'anlamaya çalışıyorum', 'içgörü istiyorum',
    'kendimi anlamak istiyorum', 'farkındalık', 'yansıtma',
  ],
} as const;

export const EMOTIONAL_INTENSITY_KEYWORDS = {
  high: [
    'ağlıyorum', 'dayanamıyorum', 'yıkıldım', 'mahvoldum', 'panik',
    'çaresizim', 'umutsuzum', 'çok acı veriyor', 'dayanacak gücüm yok',
  ],
  medium: ['üzgünüm', 'endişeliyim', 'kaygılıyım', 'stresliyim', 'tedirginim'],
} as const;

export const URGENCY_KEYWORDS = {
  high: ['hemen', 'acil', 'bugün karar', 'yarın karar', 'vaktim yok', 'çabuk karar'],
  medium: ['yakında', 'bu hafta', 'bu ay içinde', 'yakın zamanda'],
} as const;

export const SPIRITUAL_PREFERENCE_KEYWORDS = {
  symbolic: ['ruhsal', 'enerji', 'evren', 'kader', 'işaret', 'alametler'],
  psychological: ['psikolojik', 'bilimsel', 'mantıklı açıklama', 'kanıt', 'rasyonel'],
} as const;

/**
 * docs/02-ETHICAL_CONSTITUTION.md Crisis Detection categories.
 *
 * H1 REMEDIATION — measured false positives removed. The previous list matched
 * bare stems and generic verb phrases with `includes()`, which produced these
 * measured results (docs/MASTER_PROGRAM_STATE_RECOVERY.md §5.2):
 *
 *   'zorla'              matched "zorlanıyorum" / "zorlamam"
 *                        → "İşimde çok zorlanıyorum" flagged as SEXUAL ASSAULT
 *   'istemeden'          means "unintentionally" and carries no assault sense
 *                        → "İstemeden onu kırdım" flagged as SEXUAL ASSAULT
 *   'bitirmek istiyorum' matched "projeyi bitirmek istiyorum"    → false suicide flag
 *   'son vermek istiyorum' matched "ilişkiye son vermek istiyorum" → false suicide flag
 *
 * The rule now applied to every entry: a crisis keyword must be a phrase that
 * cannot appear in an ordinary, non-crisis Turkish sentence. Bare stems that
 * take common suffixes are not allowed. Entries that need an explicit object
 * ("hayatıma son vermek") carry it.
 *
 * Matching is clause-scoped with negation and reported-speech exclusions —
 * see ./crisis-match.ts. Any match means the caller must withhold the reading
 * (the Intake Engine only flags; see IntakeContextSchema doc).
 *
 * Coverage additions below (overdose, partner violence, passive death wish)
 * close measured false negatives. Morphology, transliteration, and typo
 * tolerance remain H2 scope.
 */
export const CRISIS_KEYWORDS = {
  crisis_suicide_detected: [
    'intihar',
    'kendime zarar',
    'kendine zarar',
    'canıma kıy',
    // Self-directed, so it belongs here and not in the violence category -
    // "kendimi öldürmek" was previously only reachable via
    // 'öldürmek istiyorum', which classified a suicide disclosure as violence
    // toward another person and would have routed the wrong resources.
    'kendimi öldür',
    'kendimi yok et',
    'hayatıma son ver',
    'yaşamıma son ver',
    'hayatımı bitir',
    'artık yaşayamam',
    'yaşamak istemiyorum',
    'yaşamak istemiyor',
    'ölmek istiyorum',
    'ölsem daha iyi',
    'uyanmasam daha iyi',
    'hiç uyanmasam',
    // NOT included: 'yok olmak istiyorum' / 'ortadan kaybolmak istiyorum'.
    // Both are ordinary Turkish idiom for wanting a break or escaping
    // embarrassment ("Toplantıda yok olmak istedim") and produced false
    // positives in H1 red-teaming. The explicit phrases above cover the real
    // disclosures without them.
    // Method / overdose disclosures. Bound to medication - a bare 'aşırı doz'
    // matched "Kahve aşırı doz oldu" in red-teaming.
    'ilaçlarımı bir kerede',
    'bütün ilaçlarımı iç',
    'aşırı doz ilaç',
    'aşırı dozda ilaç',
    'ilaç içip',
    'bileklerimi kes',
    'kendimi asmak',
  ],
  crisis_violence_detected: [
    'öldürmek istiyorum',
    'birine zarar vermek',
    'yaralamak istiyorum',
    'intikam almak istiyorum',
  ],
  crisis_medical_detected: [
    'göğüs ağrısı',
    'göğsümde ağrı',
    'göğsümde şiddetli',
    'nefes alamıyorum',
    'bayılıyorum',
    'kanama var',
    'kalp krizi',
    'felç geçir',
  ],
  crisis_assault_detected: [
    'tecavüz',
    'cinsel saldırı',
    'cinsel istismar',
    'taciz ediyor',
    'tacize uğradım',
    'rızam dışında',
    'rızası dışında',
    // 'zorla' is NEVER a keyword on its own - it is a prefix of the very
    // common 'zorlan-'/'zorlam-' stems ("İşimde zorlanıyorum"), which is what
    // produced the measured sexual-assault false positives. It only appears
    // here bound to an object that makes the coercion explicit.
    'zorla dokun',
    'zorla ilişki',
    // Passive and past forms spelled out: Turkish passive -ıl- is a
    // DERIVATIONAL infix, so it is deliberately absent from the inflectional
    // suffix whitelist in turkish-text.ts and "yapıldı" is not reachable from
    // the stem "yap". Listing the real forms is safer than widening that
    // whitelist, which would re-open the 'zorla'/"zorlanıyorum" defect.
    'zorla bir şey yap',
    'zorla bir şey yapıldı',
    'zorla bir şey yaptılar',
    'zorla bir şey yaptı',
    'zorla soy',
    // Partner / domestic violence disclosures. 'bana vuruyor' is NOT listed
    // bare - it matched "Güneş bana vuruyor" in red-teaming - so the
    // perpetrator is named explicitly, or the verb is one with no benign
    // reading ('dövüyor').
    'eşim bana vuruyor',
    'kocam bana vuruyor',
    'karım bana vuruyor',
    'sevgilim bana vuruyor',
    'partnerim bana vuruyor',
    'babam bana vuruyor',
    'annem bana vuruyor',
    'abim bana vuruyor',
    'ağabeyim bana vuruyor',
    'beni dövüyor',
    'beni dövdü',
    'bana şiddet uyguluyor',
    'evde şiddet görüyorum',
    'evde şiddet var',
  ],
} as const;

/**
 * H2 EMOTIONAL_SUPPORT level. Genuine distress that is NOT a crisis
 * disclosure. Matching these does not withhold the reading; it changes how the
 * reading opens, so the product acknowledges what the person said instead of
 * answering a distressed message in a neutral register.
 *
 * The bar for entry is deliberately different from CRISIS_KEYWORDS: these may
 * be ordinary words, because the cost of a false positive here is a slightly
 * gentler opening, not a crisis screen.
 */
/**
 * STRONG distress: one of these alone is enough to warrant an acknowledging
 * opening. Each states exhaustion, hopelessness, or collapse outright, so
 * treating a single occurrence as meaningful does not over-fire.
 */
export const STRONG_DISTRESS_KEYWORDS = [
  'çok üzgünüm', 'çok kötüyüm', 'berbat hissediyorum',
  'ağlıyorum', 'içim daralıyor',
  'dayanamıyorum', 'dayanacak gücüm yok', 'tükendim',
  'yıkıldım', 'mahvoldum', 'çaresizim', 'umutsuzum', 'boğuluyorum',
  'çok yalnızım', 'kimsem yok', 'kimse anlamıyor',
  'değersiz hissediyorum', 'işe yaramaz hissediyorum',
  'çok acı veriyor', 'kaybolmuş hissediyorum',
  'panik içindeyim', 'yalnız hissediyorum',
] as const;

/**
 * MILD distress: ordinary in isolation ("Biraz endişeliyim yeni iş
 * hakkında"), meaningful in combination. TWO are required before the level
 * changes, so a single ordinary worry stays an ordinary question.
 */
export const MILD_DISTRESS_KEYWORDS = [
  'kötü hissediyorum', 'ağlamaktan', 'bittim',
  'panik', 'kaygılıyım', 'endişeliyim', 'korkuyorum', 'tedirginim',
  'kafam karışık', 'kafam çok karışık', 'ne yapacağımı bilmiyorum',
  'içim sıkışıyor', 'uyuyamıyorum', 'suçlu hissediyorum',
  'çok zor geliyor', 'üst üste geldi',
] as const;

/** Union, kept for callers that only need "is there any distress signal". */
export const EMOTIONAL_SUPPORT_KEYWORDS = [
  ...STRONG_DISTRESS_KEYWORDS,
  ...MILD_DISTRESS_KEYWORDS,
] as const;

/**
 * Phrases that must be matched EXACTLY, with typo tolerance switched off.
 *
 * Fuzzy matching trades a false negative for a false positive. That trade is
 * only acceptable on long, distinctive phrases. Anything short, common, or one
 * edit away from an ordinary Turkish word is listed here so it can never be
 * reached by an approximate match.
 */
export const FUZZY_EXEMPT_PHRASES: readonly string[] = [
  'zorla dokun', 'zorla ilişki', 'zorla soy', 'zorla bir şey yap',
  'ilaç içip', 'aşırı doz ilaç', 'aşırı dozda ilaç',
  'kanama var', 'bayılıyorum', 'felç geçir',
  'beni dövdü', 'beni dövüyor', 'evde şiddet var',
  'ölmek istiyorum', 'ölsem daha iyi', 'hiç uyanmasam', 'uyanmasam daha iyi',
];

/**
 * Category 1/2 absolute-advice requests (docs/02-ETHICAL_CONSTITUTION.md) -
 * not a crisis, but the reading needs a disclaimer, not a symbolic answer
 * pretending to be medical/legal/financial fact.
 */
export const ABSOLUTE_ADVICE_KEYWORDS = {
  health_disclaimer_shown: [
    'hastalığım geçecek mi', 'ilacı bırakmalı mıyım', 'hamile kalacak mıyım', 'ameliyat olmalı mıyım',
  ],
  legal_financial_disclaimer_shown: [
    'davayı kazanacak mıyım', 'boşanma davası', 'kredi çekmeli miyim',
    'hisse alsam mı', 'yatırım yapmalı mıyım', 'kripto almalı mıyım',
  ],
} as const;

/**
 * Not an LLM-prompt defense by itself (the real defense is: never
 * concatenate raw free text into a provider prompt - docs/02-ETHICAL_CONSTITUTION.md
 * "Claude'a JSON gönderilir, freetext değil"). This only makes the attempt
 * visible for logging; classification below still runs normally since it's
 * closed local keyword matching, not a prompt.
 */
export const PROMPT_INJECTION_PATTERNS = [
  'ignore previous instructions',
  'ignore all previous',
  'you are now',
  'act as',
  'system:',
  '###',
  'yeni talimat',
  'önceki talimatları unut',
  'kurallarını unut',
  'artık farklı bir',
];

export function countMatches(text: string, keywords: readonly string[]): number {
  let count = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) count++;
  }
  return count;
}
