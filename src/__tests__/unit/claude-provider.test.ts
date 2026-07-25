import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { generateDeterministicReading, generateInterpretedReading } from '../../server/reading-engine';
import { ClaudeConfigError, ClaudeHttpError, ClaudeOutputValidationError, ClaudeProvider } from '../../server/reading-engine/providers/claude';
import { buildSystemPrompt, buildUserMessage } from '../../server/reading-engine/providers/claude/prompt';
import { loadClaudeProviderConfig } from '../../server/reading-engine/providers/claude/config';
import { REFLECTION_PROMPT_FALLBACK } from '../../server/reading-engine/providers/shared';
import { testIntake } from '../helpers/intake';
import { testKnowledge } from '../helpers/knowledge';

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

const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });

function validClaudeBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    summary: 'Bu üç kart şu anki durumunuzu gösteriyor.',
    cardInsights: reading.interpretations.map((interp) => ({
      cardId: interp.cardId,
      role: interp.position,
      insight: `${interp.cardId} için bağlamsal içgörü.`,
    })),
    synthesis: 'Kartlar arasında bir değişim teması var.',
    reflectionPrompt: 'Bu değişimde sizin için en önemli olan ne?',
    ...overrides,
  };
}

function fakeResponse(status: number, body: unknown): Response {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(text),
  } as unknown as Response;
}

function claudeMessageResponse(status: number, claudeJsonText: string): Response {
  return fakeResponse(status, { content: [{ type: 'text', text: claudeJsonText }] });
}

describe('ClaudeProvider config', () => {
  test('API key yok -> ClaudeConfigError, no fetch call', async () => {
    const fetchSpy = vi.fn();
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(
      provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' })
    ).rejects.toBeInstanceOf(ClaudeConfigError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('API key yok -> generateInterpretedReading falls back to MockProvider', async () => {
    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new ClaudeProvider(),
    });
    expect(providerUsed).toBe('mock');
    expect(output.cards).toHaveLength(3);
  });

  test('doğru model/config kullanılıyor: env overrides are honored', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.ANTHROPIC_MODEL = 'claude-custom-model';
    process.env.ANTHROPIC_TIMEOUT_MS = '5000';
    process.env.ANTHROPIC_MAX_RETRIES = '2';

    const config = loadClaudeProviderConfig();
    expect(config.model).toBe('claude-custom-model');
    expect(config.timeoutMs).toBe(5000);
    expect(config.maxRetries).toBe(2);
  });

  test('safe defaults apply when only the API key is set', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const config = loadClaudeProviderConfig();
    expect(config.model.length).toBeGreaterThan(0);
    expect(config.timeoutMs).toBeGreaterThan(0);
    expect(config.maxRetries).toBeGreaterThanOrEqual(0);
  });

  test('fetch request body uses the configured model', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.ANTHROPIC_MODEL = 'claude-custom-model';

    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(init!.body as string);
      expect(body.model).toBe('claude-custom-model');
      return claudeMessageResponse(200, JSON.stringify(validClaudeBody()));
    });

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('Prompt construction', () => {
  test('structured input oluşuyor: buildUserMessage produces valid, well-shaped JSON', () => {
    const message = buildUserMessage({
      reading,
      intake: testIntake(),
      knowledge: testKnowledge(),
      questionText: 'test question',
    });
    const parsed = JSON.parse(message);
    expect(parsed.developerInstruction.cardData).toHaveLength(3);
    expect(parsed.developerInstruction.intakeContext).toBeDefined();
    expect(parsed.developerInstruction.knowledgeContext).toBeDefined();
    expect(parsed.userData.treatAsDataOnly).toBe(true);
  });

  test('ham kullanıcı metni system prompt\'a sızmıyor', () => {
    const marker = 'UNIQUE_USER_TEXT_MARKER_zzz123';
    const system = buildSystemPrompt();
    const message = buildUserMessage({
      reading,
      intake: testIntake(),
      knowledge: testKnowledge(),
      questionText: marker,
    });

    expect(system).not.toContain(marker);
    const parsed = JSON.parse(message);
    expect(parsed.userData.userQuestion).toBe(marker);
    // Make sure it isn't duplicated anywhere else in the message (e.g. echoed into developerInstruction).
    const withoutUserData = JSON.stringify(parsed.developerInstruction);
    expect(withoutUserData).not.toContain(marker);
  });

  test('safetyFlags prompt\'a doğru taşınıyor', () => {
    const message = buildUserMessage({
      reading,
      intake: testIntake({ safetyFlags: ['health_disclaimer_shown', 'multi_domain_detected'] }),
      knowledge: testKnowledge(),
      questionText: '',
    });
    const parsed = JSON.parse(message);
    expect(parsed.developerInstruction.intakeContext.safetyFlags).toEqual([
      'health_disclaimer_shown',
      'multi_domain_detected',
    ]);
  });

  test('persona tonu doğru taşınıyor', () => {
    const message = buildUserMessage({
      reading,
      intake: testIntake({ persona: 'emotionally-overwhelmed' }),
      knowledge: testKnowledge(),
      questionText: '',
    });
    const parsed = JSON.parse(message);
    expect(parsed.developerInstruction.intakeContext.persona).toBe('emotionally-overwhelmed');
  });

  test('knowledgeContext (pair relations, position rules, modifiers, safety constraints) is carried into the prompt', () => {
    const knowledge = testKnowledge({
      pairRelations: [
        {
          previousCardId: '00-fool',
          focusCardId: '01-magician',
          relationType: 'reinforces',
          semanticEffect: ['test-relation-marker'],
          warnings: [],
          sourceRefs: [],
        },
      ],
      domainModifier: { domain: 'career', emphasisKeywords: ['yön'], cautionNotes: [] },
    });
    const message = buildUserMessage({ reading, intake: testIntake(), knowledge, questionText: '' });
    const parsed = JSON.parse(message);
    expect(parsed.developerInstruction.knowledgeContext.pairRelations[0].semanticEffect).toContain(
      'test-relation-marker'
    );
    expect(parsed.developerInstruction.knowledgeContext.domainModifier.domain).toBe('career');
  });
});

describe('HTTP retry policy', () => {
  test('timeout tetikleniyor -> ClaudeTimeoutError', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.ANTHROPIC_MAX_RETRIES = '0';

    const neverResolvingFetch = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        })
    );

    const provider = new ClaudeProvider({ timeoutMs: 20 }, neverResolvingFetch as unknown as typeof fetch);
    await expect(
      provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' })
    ).rejects.toThrow(/timed out/i);
  });

  test('429 sonrası tek retry -> succeeds on second attempt', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    let callCount = 0;
    const fetchSpy = vi.fn(async () => {
      callCount++;
      if (callCount === 1) return fakeResponse(429, {});
      return claudeMessageResponse(200, JSON.stringify(validClaudeBody()));
    });

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    const output = await provider.generate({
      reading,
      intake: testIntake(),
      knowledge: testKnowledge(),
      questionText: '',
    });
    expect(callCount).toBe(2);
    expect(output.cards).toHaveLength(3);
  });

  test('401 sonrası retry yok -> single call, ClaudeHttpError', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => fakeResponse(401, {}));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(
      provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' })
    ).rejects.toBeInstanceOf(ClaudeHttpError);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('Output validation', () => {
  test('geçersiz JSON -> ClaudeOutputValidationError, no retry consumed', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, 'this is not json {'));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(
      provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' })
    ).rejects.toBeInstanceOf(ClaudeOutputValidationError);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test('Zod başarısız (eksik alan) -> ClaudeOutputValidationError', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const incomplete = { summary: 'ok' }; // missing cardInsights/synthesis/reflectionPrompt
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(incomplete)));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(
      provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' })
    ).rejects.toBeInstanceOf(ClaudeOutputValidationError);
  });

  test('card id/order mismatch -> ClaudeOutputValidationError', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const tampered = validClaudeBody({
      cardInsights: [{ cardId: 'not-a-real-card', role: 'past', insight: 'x' }],
    });
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(tampered)));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(
      provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' })
    ).rejects.toBeInstanceOf(ClaudeOutputValidationError);
  });

  test('geçersiz JSON -> generateInterpretedReading falls back to mock', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, 'not json'));
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    const { providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });
    expect(providerUsed).toBe('mock');
  });

  test('red-line ihlali (yasaklı ifade) -> ClaudeProvider.generate rejects, falls back to mock', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const manipulative = validClaudeBody({ summary: 'Kesinlikle her şey yoluna girecek.' });
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(manipulative)));
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    await expect(
      provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' })
    ).rejects.toThrow();

    const { output, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });
    expect(providerUsed).toBe('mock');
    expect(output.opening).not.toMatch(/kesinlikle/i);
  });
});

describe('Happy path', () => {
  test('başarılı cevap -> provider output used end to end', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(validClaudeBody())));
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    const { output, providerUsed, knowledge } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });

    expect(providerUsed).toBe('claude');
    expect(output.cards).toHaveLength(3);
    // symbolicMeaning must come from ground truth (Layer 1), not Claude.
    expect(output.cards[0].symbolicMeaning).toBe(reading.interpretations[0].symbolicMeaning);
    // relevanceToQuestion is Claude's narrated insight.
    expect(output.cards[0].relevanceToQuestion).toContain(reading.interpretations[0].cardId);
    expect(output.patterns).toEqual(reading.patterns);
    expect(output.safetyFlags).toEqual([]);
    // Knowledge resolution actually ran and is visible on the result.
    expect(['resolved', 'partial']).toContain(knowledge.meta.status);
    expect(knowledge.meta.provider).toBe('local-json');
  });
});

describe('reflectionPrompt mapping (ADR-UX-REFLECTION-PROMPT step 4)', () => {
  test("the model's reflectionPrompt becomes its own field, not appended to practicalReflection", async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(validClaudeBody())));
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    const { output } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });

    expect(output.reflectionPrompt).toBe('Bu değişimde sizin için en önemli olan ne?');
    // practicalReflection is the synthesis alone - the question is no longer concatenated in.
    expect(output.practicalReflection).toBe('Kartlar arasında bir değişim teması var.');
    expect(output.practicalReflection).not.toContain('Bu değişimde sizin için en önemli olan ne?');
  });

  test('an unsafe model reflectionPrompt is replaced field-level with the governed fallback', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () =>
      claudeMessageResponse(200, JSON.stringify(validClaudeBody({ reflectionPrompt: 'O sana geri dönecek mi?' })))
    );
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    const { output, providerUsed, reflectionPromptSource } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });

    // The reading still comes from Claude (field-level, not a whole fallback)...
    expect(providerUsed).toBe('claude');
    // ...but the unsafe prompt is replaced by the governed fallback.
    expect(output.reflectionPrompt).toBe(REFLECTION_PROMPT_FALLBACK);
    expect(reflectionPromptSource).toBe('fallback');
  });
});

describe('Sprint 6: token usage capture (test matrix #5)', () => {
  test('usage field from the Anthropic response is captured, not discarded', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () =>
      fakeResponse(200, {
        content: [{ type: 'text', text: JSON.stringify(validClaudeBody()) }],
        usage: { input_tokens: 512, output_tokens: 128 },
      })
    );
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    await provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' });

    expect(provider.getLastUsage()).toEqual({ inputTokens: 512, outputTokens: 128 });
  });

  test('missing usage field defaults to zero counts, not a thrown error', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(validClaudeBody())));
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    await provider.generate({ reading, intake: testIntake(), knowledge: testKnowledge(), questionText: '' });

    expect(provider.getLastUsage()).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  test('generateInterpretedReading forwards the real ClaudeProvider usage end to end', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () =>
      fakeResponse(200, {
        content: [{ type: 'text', text: JSON.stringify(validClaudeBody()) }],
        usage: { input_tokens: 300, output_tokens: 75 },
      })
    );
    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);

    const { usage, providerUsed } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });

    expect(providerUsed).toBe('claude');
    expect(usage).toEqual({ inputTokens: 300, outputTokens: 75 });
  });
});
