import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { POST } from '../../app/api/readings/route';

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
  vi.unstubAllGlobals();
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/readings', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/readings — happy path', () => {
  test('valid request returns 200 with a well-shaped response', async () => {
    const res = await POST(makeRequest({ seed: 'demo-001', question: 'İşimde yön değiştirmeli miyim?' }));
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.seed).toBe('demo-001');
    expect(json.cards).toHaveLength(3);
    expect(json.intakeContext).toBeDefined();
    expect(json.knowledge.meta).toBeDefined();
    expect(json.interpretation.cards).toHaveLength(3);
    expect(json.readingId).toBeNull();
  });

  test('versions object has all 4 fields non-empty', async () => {
    const res = await POST(makeRequest({ seed: 'demo-001', question: 'test' }));
    const json = await res.json();
    expect(json.versions.deck.length).toBeGreaterThan(0);
    expect(json.versions.algorithm.length).toBeGreaterThan(0);
    expect(json.versions.knowledge.length).toBeGreaterThan(0);
    expect(json.versions.prompt.length).toBeGreaterThan(0);
  });

  test('same seed produces the same cards across two separate requests', async () => {
    const a = await (await POST(makeRequest({ seed: 'repeat-test', question: 'a' }))).json();
    const b = await (await POST(makeRequest({ seed: 'repeat-test', question: 'a different question entirely' }))).json();
    expect(a.cards).toEqual(b.cards);
  });

  test('no ANTHROPIC_API_KEY set -> 200 with provider: "mock"', async () => {
    const res = await POST(makeRequest({ seed: 'demo-001', question: 'test' }));
    const json = await res.json();
    expect(json.provider).toBe('mock');
    expect(json.versions.prompt).toBe('n/a');
  });
});

describe('POST /api/readings — request validation', () => {
  test('missing seed -> 400, request-shaped error, not a reading', async () => {
    const res = await POST(makeRequest({ question: 'no seed here' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_request');
    // Proves the engine path never ran: a ReadingResponse would have
    // `cards`/`interpretation`; this shape has neither.
    expect(json.cards).toBeUndefined();
  });

  test('malformed JSON body -> 400', async () => {
    const res = await POST(makeRequest('not json {'));
    expect(res.status).toBe(400);
  });

  test('unknown extra fields do not smuggle a client-supplied IntakeContext through', async () => {
    // seed/question/topicHint are the only accepted fields - persona/
    // confidence/safetyFlags are not in ReadingRequestSchema at all, so
    // Zod strips them silently; classifyIntake() still runs server-side.
    const res = await POST(
      makeRequest({
        seed: 'demo-001',
        question: 'normal question',
        persona: 'experienced-practitioner',
        safetyFlags: [],
        confidence: 1.0,
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    // Server-computed classification for this bland question, not the
    // attacker-supplied persona/confidence.
    expect(json.intakeContext.persona).not.toBe('experienced-practitioner');
    expect(json.intakeContext.confidence).toBeLessThan(1.0);
  });
});

describe('POST /api/readings — crisis gate', () => {
  test('crisis-flagged question -> crisis response, not a reading', async () => {
    const res = await POST(
      makeRequest({ seed: 'demo-001', question: 'Artık yaşayamam, kendime zarar vermeyi düşünüyorum.' })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('crisis');
    expect(json.resources.length).toBeGreaterThan(0);
    // Structural proof the reading pipeline never ran: a ReadingResponse
    // has `cards`/`interpretation`/`provider`; the crisis shape has none.
    expect(json.cards).toBeUndefined();
    expect(json.interpretation).toBeUndefined();
    expect(json.provider).toBeUndefined();
  });

  test('non-crisis question does not trigger the crisis path', async () => {
    const res = await POST(makeRequest({ seed: 'demo-001', question: 'Kariyerimde ne yapmalıyım?' }));
    const json = await res.json();
    expect(json.status).not.toBe('crisis');
    expect(json.cards).toBeDefined();
  });
});

describe('POST /api/readings — red-line violation over HTTP falls back to mock', () => {
  test('a manipulative Claude response is never returned to the caller', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  summary: 'Kesinlikle her şey yoluna girecek.',
                  cardInsights: [],
                  synthesis: 'x',
                  reflectionPrompt: 'y',
                }),
              },
            ],
          }),
          { status: 200 }
        )
      )
    );

    const res = await POST(makeRequest({ seed: 'demo-001', question: 'test' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.provider).toBe('mock');
    expect(json.interpretation.opening).not.toMatch(/kesinlikle/i);
  });
});
