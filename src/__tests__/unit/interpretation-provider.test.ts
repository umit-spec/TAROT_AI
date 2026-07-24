import { describe, expect, test } from 'vitest';
import { generateDeterministicReading, generateInterpretedReading, MockProvider } from '../../server/reading-engine';
import { InterpretationProvider } from '../../server/reading-engine/providers/types';
import { finalizeReflectionPrompt, validateInterpretation, ReadingValidationError } from '../../server/reading-engine/validate';
import { InterpretationInput, RawInterpretationOutput } from '../../types/interpretation';
import { testIntake } from '../helpers/intake';
import { testKnowledge } from '../helpers/knowledge';

class ThrowingProvider implements InterpretationProvider {
  readonly name = 'throwing-test-provider';
  async generate(): Promise<RawInterpretationOutput> {
    throw new Error('simulated provider failure (e.g. Claude API down)');
  }
}

class ManipulativeProvider implements InterpretationProvider {
  readonly name = 'manipulative-test-provider';
  async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
    const mock = await new MockProvider().generate(input);
    return { ...mock, opening: 'Kesinlikle bu ilişki mutlu olacak.' };
  }
}

// Sprint 6 test matrix #3: a provider whose output structurally violates
// InterpretationOutputSchema (wrong cards length) - triggers the ZodError
// classifyFallbackReason() maps to 'schema-invalid', distinct from a
// red-line rejection or a raw provider throw.
class SchemaInvalidProvider implements InterpretationProvider {
  readonly name = 'schema-invalid-test-provider';
  async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
    const mock = await new MockProvider().generate(input);
    return { ...mock, cards: mock.cards.slice(0, 1) };
  }
}

// Sprint 6 test matrix #5: a provider exposing the optional getLastUsage()
// side channel, proving generateInterpretedReading forwards it without
// needing a real Claude/Anthropic call.
class UsageReportingProvider implements InterpretationProvider {
  readonly name = 'usage-reporting-test-provider';
  async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
    return new MockProvider().generate(input);
  }
  getLastUsage() {
    return { inputTokens: 123, outputTokens: 45 };
  }
}

describe('MockProvider', () => {
  test('same input produces byte-identical output', async () => {
    const provider = new MockProvider();
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });

    const a = await provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' });
    const b = await provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('persona changes the opening tone deterministically', async () => {
    const provider = new MockProvider();
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });

    const skeptic = await provider.generate({
      reading,
      intake: testIntake({ persona: 'experienced-practitioner' }),
      knowledge: testKnowledge(),
      questionText: '',
    });
    const firstTimer = await provider.generate({
      reading,
      intake: testIntake({ persona: 'curious-explorer' }),
      knowledge: testKnowledge(),
      questionText: '',
    });
    expect(skeptic.opening).not.toBe(firstTimer.opening);
  });

  test('output passes the Zod schema and the red-line scan', async () => {
    const provider = new MockProvider();
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const output = await provider.generate({
      reading,
      intake: testIntake({ persona: 'decision-seeking' }),
      knowledge: testKnowledge(),
      questionText: '',
    });
    expect(() => validateInterpretation(finalizeReflectionPrompt(output))).not.toThrow();
  });

  test('surfaces knowledge pair-relation content in patterns, without inventing it', async () => {
    const provider = new MockProvider();
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const knowledge = testKnowledge({
      pairRelations: [
        {
          previousCardId: '00-fool',
          focusCardId: '01-magician',
          relationType: 'reinforces',
          semanticEffect: ['test-semantic-effect-marker'],
          warnings: [],
          sourceRefs: [],
        },
      ],
    });
    const output = await provider.generate({ reading, intake: testIntake(), knowledge, questionText: '' });
    expect(output.patterns).toContain('test-semantic-effect-marker');
  });
});

describe('reflectionPrompt boundary (ADR-UX-REFLECTION-PROMPT step 2)', () => {
  test('MockProvider emits the governed fallback reflection prompt (one question)', async () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const out = await new MockProvider().generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' });
    expect(out.reflectionPrompt).toBeDefined();
    expect((out.reflectionPrompt ?? '').trim().endsWith('?')).toBe(true);
  });

  test('finalizeReflectionPrompt fills the central fallback when the field is missing/empty', () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const base = {
      opening: 'o',
      cards: reading.interpretations.map((i) => ({
        cardId: i.cardId,
        position: i.position,
        symbolicMeaning: i.symbolicMeaning,
        relevanceToQuestion: 'r',
        reflection: i.reflection,
      })),
      patterns: [],
      practicalReflection: 'p',
      uncertaintyNotice: 'u',
      safetyFlags: [],
    };
    const filled = finalizeReflectionPrompt({ ...base });
    expect(filled.reflectionPrompt.length).toBeGreaterThan(0);
    const kept = finalizeReflectionPrompt({ ...base, reflectionPrompt: 'Kendi adımın ne olabilir?' });
    expect(kept.reflectionPrompt).toBe('Kendi adımın ne olabilir?');
  });

  test('a reading through generateInterpretedReading always carries a non-empty reflectionPrompt', async () => {
    const { output } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new MockProvider(),
    });
    expect(output.reflectionPrompt.length).toBeGreaterThan(0);
  });
});

describe('validateInterpretation (red-line validator)', () => {
  test('rejects output containing a forbidden manipulation phrase', async () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const output = await new ManipulativeProvider().generate({
      reading,
      intake: testIntake({ persona: 'decision-seeking' }),
      knowledge: testKnowledge(),
      questionText: '',
    });
    expect(() => validateInterpretation(finalizeReflectionPrompt(output))).toThrow(ReadingValidationError);
  });
});

describe('Provider swap architecture (ADR-011/ADR-012)', () => {
  test('generateInterpretedReading works with any InterpretationProvider implementation', async () => {
    const { output, providerUsed, knowledge } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new MockProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(output.cards).toHaveLength(3);
    expect(knowledge.meta.provider).toBe('local-json');
  });

  test('falls back to MockProvider when the given provider throws', async () => {
    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new ThrowingProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(output.cards).toHaveLength(3);
  });

  test('falls back to MockProvider when the given provider returns a manipulative phrase', async () => {
    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new ManipulativeProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(output.opening).not.toMatch(/kesinlikle/i);
  });

  test('intake safetyFlags propagate into the final output, even on the happy path', async () => {
    const { output } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake({ safetyFlags: ['crisis_suicide_detected'] }),
      provider: new MockProvider(),
    });
    expect(output.safetyFlags).toContain('crisis_suicide_detected');
  });
});

describe('Sprint 6: fallbackReason classification (test matrix #2-4)', () => {
  test('a red-line phrase rejection classifies as red-line-rejected', async () => {
    const { fallbackReason, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new ManipulativeProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(fallbackReason).toBe('red-line-rejected');
  });

  test('a schema-shape failure classifies as schema-invalid', async () => {
    const { fallbackReason, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new SchemaInvalidProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(fallbackReason).toBe('schema-invalid');
  });

  test('a raw provider/network throw classifies as provider-error', async () => {
    const { fallbackReason, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new ThrowingProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(fallbackReason).toBe('provider-error');
  });

  test('fallbackReason is undefined on the happy path (no fallback occurred)', async () => {
    const { fallbackReason, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new MockProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(fallbackReason).toBeUndefined();
  });
});

describe('Sprint 6: token usage capture (test matrix #5)', () => {
  test('a provider exposing getLastUsage() has its usage forwarded on the happy path', async () => {
    const { usage, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new UsageReportingProvider(),
    });
    expect(providerUsed).toBe('usage-reporting-test-provider');
    expect(usage).toEqual({ inputTokens: 123, outputTokens: 45 });
  });

  test('MockProvider (no getLastUsage) yields undefined usage, not an error', async () => {
    const { usage } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new MockProvider(),
    });
    expect(usage).toBeUndefined();
  });
});
