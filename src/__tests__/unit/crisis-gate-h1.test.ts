import { describe, expect, test } from 'vitest';
import { classifyIntake } from '../../server/intake';
import { isCrisisFlag } from '../../server/intake/safety';
import { ReadingRequestSchema, PreviewRequestSchema } from '../../types/api';
import { MAX_QUESTION_CHARS, MAX_SEED_CHARS } from '../../server/limits';

/**
 * H1 crisis-gate regression fixtures.
 *
 * These are a COVERAGE REGRESSION SUITE over synthetic phrasings, not an
 * accuracy metric. A green run means "the specific failures we measured stay
 * fixed", not "the crisis gate is correct". Real-world accuracy is not
 * measured here and must not be inferred from it.
 *
 * Every case below is synthetic, written for this suite. No real user text.
 *
 * Baseline before H1 (docs/MASTER_PROGRAM_STATE_RECOVERY.md §5.2): of 24
 * probes, 12 benign questions raised a crisis flag and 5 genuine crisis
 * phrasings were missed.
 */

function isCrisis(text: string): boolean {
  return classifyIntake({ questionText: text }).safetyFlags.some(isCrisisFlag);
}

function flagsFor(text: string): string[] {
  return classifyIntake({ questionText: text }).safetyFlags.filter(isCrisisFlag);
}

describe('H1 crisis gate — benign questions must NOT be flagged', () => {
  // Each of these raised a crisis flag before H1. The comment names the
  // keyword that mis-fired, so a future edit that reintroduces it fails here.
  const BENIGN: Array<[string, string]> = [
    ["İşimde çok zorlanıyorum, ne yapmalıyım?", "'zorla' matched 'zorlanıyorum'"],
    ["Kendimi zorla işe gidiyormuş gibi hissediyorum.", "'zorla' as an adverb"],
    ["Ders çalışmak için kendimi zorlamam gerekiyor.", "'zorla' matched 'zorlamam'"],
    ["Bu ilişkide kendimi zorlanmış hissediyorum.", "'zorla' matched 'zorlanmış'"],
    ["İstemeden onu kırdım, nasıl özür dilerim?", "'istemeden' has no assault sense"],
    ["Bu projeyi bitirmek istiyorum ama motivasyonum yok.", "'bitirmek istiyorum'"],
    ["Tezimi bitirmek istiyorum, odaklanamıyorum.", "'bitirmek istiyorum'"],
    ["İlişkime son vermek istiyorum, doğru mu yapıyorum?", "'son vermek istiyorum'"],
    ["Bu ilişkiyi bitirmek istiyorum, kararsızım.", "'bitirmek istiyorum'"],
    ["Sözleşmeyi zorla imzalattılar diye duydum.", "'zorla' + reported speech"],
    ["Bu işi bitirmek istiyorum ama nereden başlayacağımı bilmiyorum.", "'bitirmek istiyorum'"],
    ["Arkadaşlığa son vermek istiyorum.", "'son vermek istiyorum'"],
  ];

  test.each(BENIGN)('benign: %s', (text) => {
    expect(flagsFor(text)).toEqual([]);
  });
});

describe('H1 crisis gate — reported speech and negation', () => {
  test('news report about suicide is not the user in crisis', () => {
    expect(isCrisis('Haberlerde bir intihar haberi gördüm ve çok üzüldüm.')).toBe(false);
  });

  test('a film plot is not the user in crisis', () => {
    expect(isCrisis('Filmde karakter kendine zarar veriyordu, etkilendim.')).toBe(false);
  });

  test('explicitly negated suicidal ideation is not a crisis', () => {
    expect(isCrisis('İntihar etmeyi asla düşünmem, sadece yorgunum.')).toBe(false);
  });

  test('a symptom the user frames as resolved is not an acute medical crisis', () => {
    expect(isCrisis('Spor sonrası nefes alamıyorum gibi hissettim ama iyiyim.')).toBe(false);
  });

  /**
   * THE CRITICAL SAFETY RULE: negation clears only its own clause. A message
   * that negates one crisis statement and then makes another must stay a
   * crisis. If this ever regresses, the gate has become fail-open.
   */
  test('negation in one clause does NOT clear an active crisis in another', () => {
    expect(isCrisis('İntihar etmeyi düşünmüyorum ama kendime zarar vermek istiyorum.')).toBe(true);
  });

  test('reported speech does NOT clear a first-person disclosure in the same clause', () => {
    expect(isCrisis('Haberlerdeki gibi ben de intihar etmek istiyorum.')).toBe(true);
  });
});

describe('H1 crisis gate — genuine crisis phrasings must be caught', () => {
  const CRISIS: Array<[string, string]> = [
    ['Kendime zarar vermek istiyorum.', 'crisis_suicide_detected'],
    ['İntihar etmeyi düşünüyorum.', 'crisis_suicide_detected'],
    ['Artık yaşamak istemiyorum.', 'crisis_suicide_detected'],
    ['Yaşamak istemiyorum artık, her şey anlamsız.', 'crisis_suicide_detected'],
    ['Artık yaşayamam, kendime zarar vermeyi düşünüyorum.', 'crisis_suicide_detected'],
    ['Hayatıma son vermek istiyorum.', 'crisis_suicide_detected'],
    ['Canıma kıymayı düşünüyorum.', 'crisis_suicide_detected'],
    // Measured false negatives before H1:
    ['Uyandığımda hiç uyanmasam daha iyi diye düşünüyorum.', 'crisis_suicide_detected'],
    ['Bütün ilaçlarımı bir kerede içmeyi düşündüm.', 'crisis_suicide_detected'],
    ['Eşim bana vuruyor ve korkuyorum.', 'crisis_assault_detected'],
    ['Göğsümde şiddetli bir ağrı var şu an.', 'crisis_medical_detected'],
  ];

  test.each(CRISIS)('crisis: %s -> %s', (text, expectedFlag) => {
    expect(flagsFor(text)).toContain(expectedFlag);
  });

  test('the pre-existing crisis regression case still holds', () => {
    // Pinned: this exact string is asserted by intake-engine and api-readings
    // tests. H1 must not have narrowed the gate out from under them.
    expect(flagsFor('Artık yaşayamam, kendime zarar vermeyi düşünüyorum.')).toContain(
      'crisis_suicide_detected'
    );
  });
});

/**
 * These cases were found by red-teaming H1's OWN new keywords, not by the
 * original baseline probe. The first draft of H1 introduced every one of them
 * as a fresh false positive. They are pinned here so the fix cannot silently
 * regress.
 */
describe('H1 red-team — keywords added by H1 must not create new false positives', () => {
  const RED_TEAM_BENIGN: Array<[string, string]> = [
    ['Güneş bana vuruyor, başım ağrıyor.', "bare 'bana vuruyor'"],
    ['Bu sıcakta ölmek istiyorum resmen, çok bunaldım.', 'hyperbole with a mundane cause'],
    ['Utançtan ölmek istiyorum, çok mahcup oldum.', 'hyperbole with a mundane cause'],
    ['Kahve aşırı doz oldu galiba, uyuyamıyorum.', "bare 'aşırı doz'"],
    ['Tatilde ortadan kaybolmak istiyorum biraz.', 'idiomatic escape wish'],
    ['Toplantıda yok olmak istedim utançtan.', 'idiomatic embarrassment'],
    ['Patronum bana çok yükleniyor, şiddet görüyorum gibi hissediyorum.', 'simile, not disclosure'],
    ['Filmde kadın şiddet görüyordu.', 'reported narration'],
  ];

  test.each(RED_TEAM_BENIGN)('benign: %s', (text) => {
    expect(flagsFor(text)).toEqual([]);
  });

  /**
   * The hedging and hyperbole exclusions must NEVER reach a real disclosure.
   * If any of these stops being a crisis, the gate has gone fail-open.
   */
  const MUST_STILL_FLAG: string[] = [
    'Kendimi öldürmek istiyorum gibi hissediyorum.',
    'Sanki intihar etmek istiyorum.',
    'Bu sıcakta intihar etmek istiyorum.',
    'Utançtan kendime zarar vermek istiyorum.',
    'Eşim bana vuruyor ve korkuyorum.',
    'Bana zorla bir şey yapıldı, ne yapacağımı bilmiyorum.',
  ];

  test.each(MUST_STILL_FLAG)('hedging/hyperbole never clears a real disclosure: %s', (text) => {
    expect(isCrisis(text)).toBe(true);
  });
});

describe('H1 central input limits', () => {
  test('reading accepts a question at exactly the limit', () => {
    const r = ReadingRequestSchema.safeParse({ seed: 's', question: 'a'.repeat(MAX_QUESTION_CHARS) });
    expect(r.success).toBe(true);
  });

  test('reading rejects a question one character over the limit', () => {
    const r = ReadingRequestSchema.safeParse({
      seed: 's',
      question: 'a'.repeat(MAX_QUESTION_CHARS + 1),
    });
    expect(r.success).toBe(false);
  });

  test('preview enforces the SAME question limit as the reading route', () => {
    expect(PreviewRequestSchema.safeParse({ question: 'a'.repeat(MAX_QUESTION_CHARS) }).success).toBe(
      true
    );
    expect(
      PreviewRequestSchema.safeParse({ question: 'a'.repeat(MAX_QUESTION_CHARS + 1) }).success
    ).toBe(false);
  });

  test('seed accepts exactly the limit and rejects one over', () => {
    expect(ReadingRequestSchema.safeParse({ seed: 'z'.repeat(MAX_SEED_CHARS) }).success).toBe(true);
    expect(ReadingRequestSchema.safeParse({ seed: 'z'.repeat(MAX_SEED_CHARS + 1) }).success).toBe(
      false
    );
  });

  test('the previously unbounded payloads are now rejected', () => {
    expect(ReadingRequestSchema.safeParse({ seed: 's', question: 'a'.repeat(200_000) }).success).toBe(
      false
    );
    expect(ReadingRequestSchema.safeParse({ seed: 'z'.repeat(100_000) }).success).toBe(false);
  });
});
