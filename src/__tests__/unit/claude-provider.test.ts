import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { generateDeterministicReading, generateInterpretedReading } from '../../server/reading-engine';
import { ClaudeConfigError, ClaudeHttpError, ClaudeOutputValidationError, ClaudeProvider } from '../../server/reading-engine/providers/claude';
import { buildSystemPrompt, buildUserMessage } from '../../server/reading-engine/providers/claude/prompt';
import { loadClaudeProviderConfig } from '../../server/reading-engine/providers/claude/config';
import { testIntake } from '../helpers/intake';

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
      provider.generate({ reading, intake: testIntake(), questionText: '' })
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
    await provider.generate({ reading, intake: testIntake(), questionText: '' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('Prompt construction', () => {
  test('structured input oluşuyor: buildUserMessage produces valid, well-shaped JSON', () => {
    const message = buildUserMessage({ reading, intake: testIntake(), questionText: 'test question' });
    const parsed = JSON.parse(message);
    expect(parsed.developerInstruction.cardData).toHaveLength(3);
    expect(parsed.developerInstruction.intakeContext).toBeDefined();
    expect(parsed.userData.treatAsDataOnly).toBe(true);
  });

  test('ham kullanıcı metni system prompt\'a sızmıyor', () => {
    const marker = 'UNIQUE_USER_TEXT_MARKER_zzz123';
    const system = buildSystemPrompt();
    const message = buildUserMessage({ reading, intake: testIntake(), questionText: marker });

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
      questionText: '',
    });
    const parsed = JSON.parse(message);
    expect(parsed.developerInstruction.intakeContext.persona).toBe('emotionally-overwhelmed');
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
    await expect(provider.generate({ reading, intake: testIntake(), questionText: '' })).rejects.toThrow(
      /timed out/i
    );
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
    const output = await provider.generate({ reading, intake: testIntake(), questionText: '' });
    expect(callCount).toBe(2);
    expect(output.cards).toHaveLength(3);
  });

  test('401 sonrası retry yok -> single call, ClaudeHttpError', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => fakeResponse(401, {}));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(provider.generate({ reading, intake: testIntake(), questionText: '' })).rejects.toBeInstanceOf(
      ClaudeHttpError
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('Output validation', () => {
  test('geçersiz JSON -> ClaudeOutputValidationError, no retry consumed', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, 'this is not json {'));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(provider.generate({ reading, intake: testIntake(), questionText: '' })).rejects.toBeInstanceOf(
      ClaudeOutputValidationError
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test('Zod başarısız (eksik alan) -> ClaudeOutputValidationError', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const incomplete = { summary: 'ok' }; // missing cardInsights/synthesis/reflectionPrompt
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(incomplete)));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(provider.generate({ reading, intake: testIntake(), questionText: '' })).rejects.toBeInstanceOf(
      ClaudeOutputValidationError
    );
  });

  test('card id/order mismatch -> ClaudeOutputValidationError', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const tampered = validClaudeBody({
      cardInsights: [{ cardId: 'not-a-real-card', role: 'past', insight: 'x' }],
    });
    const fetchSpy = vi.fn(async () => claudeMessageResponse(200, JSON.stringify(tampered)));

    const provider = new ClaudeProvider({}, fetchSpy as unknown as typeof fetch);
    await expect(provider.generate({ reading, intake: testIntake(), questionText: '' })).rejects.toBeInstanceOf(
      ClaudeOutputValidationError
    );
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

    await expect(provider.generate({ reading, intake: testIntake(), questionText: '' })).rejects.toThrow();

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

    const { output, providerUsed } = await generateInterpretedReading({
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
  });
});
