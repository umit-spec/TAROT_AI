import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { POST as previewPOST } from '../../app/api/readings/preview/route';
import { POST as readingPOST } from '../../app/api/readings/route';
import { CRISIS_MESSAGE, CRISIS_RESOURCES } from '../../server/intake/crisis-resources';
import { previewRateLimitPerMinute, rateLimitPerMinute } from '../../server/observability/rate-limit';

const CRISIS_Q = 'Artık yaşayamam, kendime zarar vermeyi düşünüyorum.';

let savedRateEnabled: string | undefined;
beforeEach(() => {
  savedRateEnabled = process.env.RATE_LIMIT_ENABLED;
  delete process.env.RATE_LIMIT_ENABLED;
});
afterEach(() => {
  if (savedRateEnabled === undefined) delete process.env.RATE_LIMIT_ENABLED;
  else process.env.RATE_LIMIT_ENABLED = savedRateEnabled;
});

function previewReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/readings/preview', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}
function readingReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/readings', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/readings/preview — normal framing', () => {
  test('normal question -> 200 preview with only topicLabel + reflectiveFocus', async () => {
    const res = await previewPOST(previewReq({ question: 'Bu işi kabul etmeli miyim?', topicHint: 'career' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('preview');
    expect(Object.keys(json).sort()).toEqual(['framing', 'status']);
    expect(Object.keys(json.framing).sort()).toEqual(['reflectiveFocus', 'topicLabel']);
    expect(json.framing.topicLabel.length).toBeGreaterThan(0);
    expect(json.framing.reflectiveFocus.length).toBeGreaterThan(0);
  });

  test('empty question -> 200 preview with neutral framing', async () => {
    const res = await previewPOST(previewReq({ question: '' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('preview');
    expect(json.framing.reflectiveFocus).toBe('Aklından geçenleri açık uçlu biçimde düşünmek');
  });

  test('prediction-style question -> preview, never a prediction verb', async () => {
    const res = await previewPOST(previewReq({ question: 'Sınavı kazanacak mıyım?' }));
    const json = await res.json();
    expect(json.status).toBe('preview');
    expect(JSON.stringify(json)).not.toMatch(/olacak|kesinlikle|mutlaka/i);
  });

  test('third-party mind-reading question -> preview, user-focused framing', async () => {
    const res = await previewPOST(previewReq({ question: 'O beni hâlâ seviyor mu?' }));
    const json = await res.json();
    expect(json.status).toBe('preview');
    expect(json.framing.reflectiveFocus).toMatch(/eceğin|acağın|düşün|sana|aklından/i);
  });
});

describe('POST /api/readings/preview — crisis gate (no framing, no draw)', () => {
  test('crisis question -> crisis response using the single-source 112 list', async () => {
    const res = await previewPOST(previewReq({ question: CRISIS_Q }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('crisis');
    expect(json.message).toBe(CRISIS_MESSAGE);
    expect(json.resources).toEqual(CRISIS_RESOURCES);
    // No framing, no cards, no seed on the crisis path.
    expect(json.framing).toBeUndefined();
    expect(json.cards).toBeUndefined();
    expect(json.seed).toBeUndefined();
  });
});

describe('POST /api/readings/preview — strict schema rejects smuggled fields', () => {
  test.each([
    ['persona', { question: 'x', persona: 'decision-seeking' }],
    ['safetyFlags', { question: 'x', safetyFlags: [] }],
    ['confidence', { question: 'x', confidence: 1 }],
    ['seed', { question: 'x', seed: 'abc' }],
    ['framing', { question: 'x', framing: { topicLabel: 'a', reflectiveFocus: 'b' } }],
  ])('unknown key %s -> 400', async (_name, body) => {
    const res = await previewPOST(previewReq(body));
    expect(res.status).toBe(400);
  });

  test('invalid JSON -> 400', async () => {
    const res = await previewPOST(previewReq('{ not json'));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/readings/preview — no internal leak, no cards, no seed', () => {
  test('response body never contains any internal field or draw artifact', async () => {
    const res = await previewPOST(previewReq({ question: 'İlişkimde ne yapmalıyım?', topicHint: 'relationship' }));
    const body = JSON.stringify(await res.json());
    for (const forbidden of [
      'persona',
      'confidence',
      'safetyFlags',
      'emotionalIntensity',
      'decisionUrgency',
      'spiritualPreference',
      'responseDepth',
      'provider',
      'cards',
      'seed',
      'knowledge',
      'interpretation',
    ]) {
      expect(body).not.toContain(forbidden);
    }
  });
});

describe('POST /api/readings/preview — independent rate limit', () => {
  test('preview limiter has its own, higher-than-reading default config', () => {
    // Independent config knob, not a copy of the reading limit.
    expect(previewRateLimitPerMinute({})).toBe(60);
    expect(previewRateLimitPerMinute({ PREVIEW_RATE_LIMIT_PER_MINUTE: '5' })).toBe(5);
    // Its default does not track the reading limit.
    expect(previewRateLimitPerMinute({})).not.toBe(rateLimitPerMinute({}));
  });

  test('preview limiter blocks abuse (429) while /api/readings stays independent', async () => {
    process.env.RATE_LIMIT_ENABLED = '1';
    let sawBlock = false;
    // Default preview limit is 60/min; exhaust the window.
    for (let i = 0; i < 62; i++) {
      const res = await previewPOST(previewReq({ question: 'tekrar' }));
      if (res.status === 429) {
        sawBlock = true;
        break;
      }
    }
    expect(sawBlock).toBe(true);
    // The reading endpoint uses a SEPARATE limiter/counter - still served.
    const reading = await readingPOST(readingReq({ seed: 'demo-001', question: 'Kariyerimde ne yapmalıyım?' }));
    expect(reading.status).toBe(200);
  });
});

describe('preview grants no authority — /api/readings re-checks its own body', () => {
  test('a benign preview does not let a later crisis reading through', async () => {
    // 1) benign preview
    const pre = await previewPOST(previewReq({ question: 'Kariyerimde ne yapmalıyım?' }));
    expect((await pre.json()).status).toBe('preview');
    // 2) reading body edited to add crisis content -> reading re-runs its gate
    const reading = await readingPOST(readingReq({ seed: 'demo-001', question: CRISIS_Q }));
    const json = await reading.json();
    expect(json.status).toBe('crisis');
    expect(json.cards).toBeUndefined();
  });
});
