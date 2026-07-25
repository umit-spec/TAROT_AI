import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { POST } from '../../app/api/readings/route';
import {
  generateDeterministicReading,
  generateInterpretedReading,
  MockProvider,
  ClaudeProvider,
} from '../../server/reading-engine';
import { InterpretationProvider } from '../../server/reading-engine/providers/types';
import { InterpretationInput, InterpretationOutputSchema, RawInterpretationOutput } from '../../types/interpretation';
import { testIntake } from '../helpers/intake';

/**
 * Sprint 6 §3: 5 security/architecture invariants the Product Owner
 * declared zero-tolerance, never "measure first" - a single violation
 * fails an evaluation run outright, regardless of every other metric.
 * These tests are the acceptance evidence for that gate.
 */

const ENV_KEYS = ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'ANTHROPIC_TIMEOUT_MS', 'ANTHROPIC_MAX_RETRIES'] as const;
let originalEnv: Record<string, string | undefined>;

beforeEach(() => {
  originalEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (originalEnv[k] === undefined) delete process.env[k];
    else process.env[k] = originalEnv[k];
  }
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/readings', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('Invariant 9: schema-invalid output never reaches a caller', () => {
  class SchemaInvalidProvider implements InterpretationProvider {
    readonly name = 'schema-invalid-invariant-provider';
    async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
      const mock = await new MockProvider().generate(input);
      return { ...mock, cards: mock.cards.slice(0, 1) }; // violates .length(3)
    }
  }

  test('generateInterpretedReading never resolves with an object that fails InterpretationOutputSchema', async () => {
    const { output } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new SchemaInvalidProvider(),
    });
    expect(InterpretationOutputSchema.safeParse(output).success).toBe(true);
  });

  test('the same guarantee holds through the real HTTP route', async () => {
    const res = await POST(makeRequest({ seed: 'demo-001', question: 'Kariyerimde ne yapmalıyım?' }));
    const json = await res.json();
    expect(InterpretationOutputSchema.safeParse(json.interpretation).success).toBe(true);
  });
});

describe('Invariant 10: a crisis-flagged request never produces tarot content', () => {
  const crisisPhrases = [
    ['crisis_suicide_detected', 'Artık yaşayamam, kendime zarar vermeyi düşünüyorum.'],
    ['crisis_violence_detected', 'Birine zarar vermek istiyorum, çok öfkeliyim.'],
    ['crisis_medical_detected', 'Göğüs ağrısı var ve nefes alamıyorum.'],
    ['crisis_assault_detected', 'Bana zorla bir şey yapıldı, ne yapacağımı bilmiyorum.'],
  ] as const;

  for (const [flag, question] of crisisPhrases) {
    test(`${flag}: no cards, no interpretation, no provider field in the response`, async () => {
      const res = await POST(makeRequest({ seed: 'demo-001', question }));
      const json = await res.json();
      expect(json.status).toBe('crisis');
      expect(json.cards).toBeUndefined();
      expect(json.interpretation).toBeUndefined();
      expect(json.provider).toBeUndefined();
    });
  }
});

describe('Invariant 11: no provider can reorder, add, or drop cards', () => {
  test('MockProvider narration cardIds match the ground-truth draw order exactly', async () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const { output } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new MockProvider(),
    });
    expect(output.cards.map((c) => c.cardId)).toEqual(reading.cards.map((c) => c.id));
  });

  test('a Claude response that reorders cardInsights is rejected, never silently accepted', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const swapped = [...reading.interpretations].reverse(); // deliberately wrong order
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'test',
              cardInsights: swapped.map((interp) => ({ cardId: interp.cardId, role: interp.position, insight: 'x' })),
              synthesis: 'test',
              reflectionPrompt: 'test',
            }),
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new ClaudeProvider({}, fetchSpy),
    });

    // Rejected -> fell back to Mock -> ground-truth order preserved anyway.
    expect(providerUsed).toBe('mock');
    expect(output.cards.map((c) => c.cardId)).toEqual(reading.cards.map((c) => c.id));
  });
});

describe('Invariant 12: ANTHROPIC_API_KEY never appears in any thrown error message', () => {
  const SECRET = 'sk-ant-super-secret-test-value-should-never-leak';

  test('a timeout error never includes the API key', async () => {
    process.env.ANTHROPIC_API_KEY = SECRET;
    const abortingFetch = vi.fn(
      () =>
        new Promise((_resolve, reject) => {
          setTimeout(() => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), 1);
        })
    ) as unknown as typeof fetch;
    const provider = new ClaudeProvider({ timeoutMs: 1, maxRetries: 0 }, abortingFetch);

    let caught: unknown;
    try {
      await provider.generate({
        reading: generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' }),
        intake: testIntake(),
        knowledge: { pairRelations: [], positionRules: [], domainModifier: null, personaModifier: null, safetyConstraints: [] },
        questionText: '',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).not.toContain(SECRET);
  });

  test('an HTTP error never includes the API key', async () => {
    process.env.ANTHROPIC_API_KEY = SECRET;
    const fetchSpy = vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })) as unknown as typeof fetch;
    const provider = new ClaudeProvider({ maxRetries: 0 }, fetchSpy);

    let caught: unknown;
    try {
      await provider.generate({
        reading: generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' }),
        intake: testIntake(),
        knowledge: { pairRelations: [], positionRules: [], domainModifier: null, personaModifier: null, safetyConstraints: [] },
        questionText: '',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).not.toContain(SECRET);
  });

  test('a config error (no key set) never echoes back a partial/full key value', async () => {
    // ANTHROPIC_API_KEY deliberately left unset by beforeEach.
    const provider = new ClaudeProvider();
    let caught: unknown;
    try {
      await provider.generate({
        reading: generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' }),
        intake: testIntake(),
        knowledge: { pairRelations: [], positionRules: [], domainModifier: null, personaModifier: null, safetyConstraints: [] },
        questionText: '',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe('ANTHROPIC_API_KEY is not set');
  });
});

describe('Invariant 13: generateInterpretedReading never returns a raw, unvalidated provider output', () => {
  class RawlyManipulativeProvider implements InterpretationProvider {
    readonly name = 'raw-manipulative-invariant-provider';
    async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
      const mock = await new MockProvider().generate(input);
      return { ...mock, opening: 'Kesinlikle mutlu olacaksın, garantili.' };
    }
  }

  test('a forbidden-phrase output is replaced entirely, never partially passed through', async () => {
    const { output } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new RawlyManipulativeProvider(),
    });
    expect(output.opening).not.toContain('Kesinlikle');
    expect(output.opening).not.toContain('garantili');
    expect(InterpretationOutputSchema.safeParse(output).success).toBe(true);
  });
});
