import { describe, expect, test } from 'vitest';
import { presentFraming } from '../../lib/framing-presenter';
import { classifyIntake } from '../../server/intake';
import { FramingPreviewResponseSchema } from '../../types/api';
import {
  IntakeContext,
  Persona,
  PersonaSchema,
  QuestionDomain,
  QuestionDomainSchema,
} from '../../types/intake';

const ALL_PERSONAS = PersonaSchema.options as readonly Persona[];
const ALL_DOMAINS = QuestionDomainSchema.options as readonly QuestionDomain[];

function makeIntake(overrides: Partial<IntakeContext> = {}): IntakeContext {
  return {
    questionDomain: 'self',
    persona: 'reflection-seeking',
    emotionalIntensity: 'low',
    decisionUrgency: 'low',
    spiritualPreference: 'balanced',
    responseDepth: 'standard',
    safetyFlags: [],
    confidence: 0.5,
    ...overrides,
  };
}

// Anything that would betray a prediction, a diagnosis, the raw classification,
// or a third party. The presenter must never emit any of these.
const FORBIDDEN = [
  /olacak/i,
  /kesinlikle/i,
  /mutlaka/i,
  /gelecek/i, // no prediction verbs
  /decision-seeking/i,
  /reflection-seeking/i,
  /emotionally-overwhelmed/i,
  /curious-explorer/i,
  /experienced-practitioner/i, // no persona enum
  /confidence|safetyFlags|persona|intensity|urgency/i, // no internal field names
];

function assertSafe(text: string) {
  expect(text.length).toBeGreaterThan(0);
  for (const pattern of FORBIDDEN) {
    expect(text).not.toMatch(pattern);
  }
}

describe('framing-presenter — topicLabel', () => {
  test.each([
    ['relationship', 'İlişkiler'],
    ['career', 'Kariyer'],
    ['self', 'Kendin'],
    ['general', 'Açık uçlu'],
  ] as const)('domain %s -> %s', (domain, label) => {
    expect(presentFraming(makeIntake({ questionDomain: domain })).topicLabel).toBe(label);
  });

  test('every QuestionDomain resolves to exactly one non-empty topic label', () => {
    for (const domain of ALL_DOMAINS) {
      const { topicLabel } = presentFraming(makeIntake({ questionDomain: domain }));
      expect(topicLabel.length).toBeGreaterThan(0);
    }
  });
});

describe('framing-presenter — reflectiveFocus is persona-shaped but leak-free', () => {
  test('every Persona resolves to a distinct, safe, user-focused reflective focus', () => {
    const seen = new Set<string>();
    for (const persona of ALL_PERSONAS) {
      const { reflectiveFocus } = presentFraming(makeIntake({ persona }));
      assertSafe(reflectiveFocus);
      // User-focused (2nd person), never third-party.
      expect(reflectiveFocus).toMatch(/eceğin|acağın|düşün|sana|aklından/i);
      seen.add(reflectiveFocus);
    }
    // No two personas collapse to the same string (the mapping is exhaustive
    // and distinct, like the persona-mapping "no drift" guarantee).
    expect(seen.size).toBe(ALL_PERSONAS.length);
  });

  test('exhaustive persona x domain: both fields always safe', () => {
    for (const persona of ALL_PERSONAS) {
      for (const domain of ALL_DOMAINS) {
        const framing = presentFraming(makeIntake({ persona, questionDomain: domain }));
        assertSafe(framing.topicLabel);
        assertSafe(framing.reflectiveFocus);
        // Serializable as the exact wire response, nothing more.
        expect(() =>
          FramingPreviewResponseSchema.parse({ status: 'preview', framing })
        ).not.toThrow();
      }
    }
  });
});

describe('framing-presenter — empty input gets neutral framing regardless of persona', () => {
  test('empty_or_too_short_input flag -> neutral focus, ignoring persona', () => {
    for (const persona of ALL_PERSONAS) {
      const { reflectiveFocus } = presentFraming(
        makeIntake({ persona, safetyFlags: ['empty_or_too_short_input'] })
      );
      expect(reflectiveFocus).toBe('Aklından geçenleri açık uçlu biçimde düşünmek');
    }
  });
});

describe('framing-presenter — integrated with the real classifier', () => {
  test('empty question -> valid neutral framing, no error', () => {
    const framing = presentFraming(classifyIntake({ questionText: '' }));
    assertSafe(framing.topicLabel);
    assertSafe(framing.reflectiveFocus);
  });

  test('prediction-style question -> reflective framing, never a prediction', () => {
    const framing = presentFraming(classifyIntake({ questionText: 'Sınavı kazanacak mıyım?' }));
    assertSafe(framing.reflectiveFocus);
  });

  test('third-party mind-reading question -> user-focused framing, no third-party claim', () => {
    const framing = presentFraming(classifyIntake({ questionText: 'O beni hâlâ seviyor mu?' }));
    assertSafe(framing.reflectiveFocus);
    expect(framing.reflectiveFocus).toMatch(/eceğin|acağın|düşün|sana|aklından/i);
  });

  test('normal career decision question -> safe framing', () => {
    const framing = presentFraming(
      classifyIntake({ questionText: 'Bu işi kabul etmeli miyim?', topicHint: 'career' })
    );
    assertSafe(framing.topicLabel);
    assertSafe(framing.reflectiveFocus);
  });
});
