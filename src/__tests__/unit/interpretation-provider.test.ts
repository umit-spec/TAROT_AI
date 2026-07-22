import { describe, expect, test } from 'vitest';
import { generateDeterministicReading, generateInterpretedReading, MockProvider } from '../../server/reading-engine';
import { InterpretationProvider } from '../../server/reading-engine/providers/types';
import { validateInterpretation, ReadingValidationError } from '../../server/reading-engine/validate';
import { InterpretationInput, InterpretationOutput } from '../../types/interpretation';

class ThrowingProvider implements InterpretationProvider {
  readonly name = 'throwing-test-provider';
  async generate(): Promise<InterpretationOutput> {
    throw new Error('simulated provider failure (e.g. Claude API down)');
  }
}

class ManipulativeProvider implements InterpretationProvider {
  readonly name = 'manipulative-test-provider';
  async generate(input: InterpretationInput): Promise<InterpretationOutput> {
    const mock = await new MockProvider().generate(input);
    return { ...mock, opening: 'Kesinlikle bu ilişki mutlu olacak.' };
  }
}

describe('MockProvider', () => {
  test('same input produces byte-identical output', async () => {
    const provider = new MockProvider();
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });

    const a = await provider.generate({ reading, persona: 'first_timer' });
    const b = await provider.generate({ reading, persona: 'first_timer' });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('persona changes the opening tone deterministically', async () => {
    const provider = new MockProvider();
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });

    const skeptic = await provider.generate({ reading, persona: 'skeptic' });
    const firstTimer = await provider.generate({ reading, persona: 'first_timer' });
    expect(skeptic.opening).not.toBe(firstTimer.opening);
  });

  test('output passes the Zod schema and the red-line scan', async () => {
    const provider = new MockProvider();
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const output = await provider.generate({ reading, persona: 'regular' });
    expect(() => validateInterpretation(output)).not.toThrow();
  });
});

describe('validateInterpretation (red-line validator)', () => {
  test('rejects output containing a forbidden manipulation phrase', async () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const output = await new ManipulativeProvider().generate({ reading, persona: 'regular' });
    expect(() => validateInterpretation(output)).toThrow(ReadingValidationError);
  });
});

describe('Provider swap architecture (ADR-011)', () => {
  test('generateInterpretedReading works with any InterpretationProvider implementation', async () => {
    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      topic: 'general',
      persona: 'regular',
      provider: new MockProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(output.cards).toHaveLength(3);
  });

  test('falls back to MockProvider when the given provider throws', async () => {
    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      topic: 'general',
      persona: 'regular',
      provider: new ThrowingProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(output.cards).toHaveLength(3);
  });

  test('falls back to MockProvider when the given provider returns a manipulative phrase', async () => {
    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      topic: 'general',
      persona: 'regular',
      provider: new ManipulativeProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(output.opening).not.toMatch(/kesinlikle/i);
  });
});
