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
 * docs/02-ETHICAL_CONSTITUTION.md Crisis Detection categories, verbatim
 * trigger words. Any match here means the reading must not be delivered
 * by the caller (Intake Engine only flags - see IntakeContextSchema doc).
 */
export const CRISIS_KEYWORDS = {
  crisis_suicide_detected: [
    'intihar', 'kendime zarar', 'kendine zarar', 'son vermek istiyorum',
    'artık yaşayamam', 'bitirmek istiyorum', 'yaşamak istemiyorum',
  ],
  crisis_violence_detected: [
    'öldürmek istiyorum', 'birine zarar vermek', 'yaralamak istiyorum', 'intikam almak istiyorum',
  ],
  crisis_medical_detected: [
    'göğüs ağrısı', 'nefes alamıyorum', 'bayılıyorum', 'kanama var', 'kalp krizi',
  ],
  crisis_assault_detected: ['tecavüz', 'cinsel saldırı', 'zorla', 'istemeden'],
} as const;

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
