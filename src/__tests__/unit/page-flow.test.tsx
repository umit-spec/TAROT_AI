// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import HomePage from '../../app/page';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function acceptConsentAndSubmit(question = 'test question') {
  render(<HomePage />);
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: 'Devam Et' }));
  await userEvent.type(screen.getByLabelText('Sorunuz'), question);
  await userEvent.click(screen.getByRole('button', { name: 'Kartları Çek' }));
}

const baseReading = {
  readingId: null,
  seed: 'demo-001',
  cards: [
    { id: '00-fool', position: 'past', orientation: 'upright' },
    { id: '01-magician', position: 'present', orientation: 'upright' },
    { id: '02-high-priestess', position: 'future', orientation: 'upright' },
  ],
  intakeContext: {
    questionDomain: 'general',
    persona: 'reflection-seeking',
    emotionalIntensity: 'low',
    decisionUrgency: 'low',
    spiritualPreference: 'balanced',
    responseDepth: 'standard',
    safetyFlags: [],
    confidence: 0.2,
  },
  interpretation: {
    opening: 'test opening',
    cards: [
      { cardId: '00-fool', position: 'past', symbolicMeaning: 'x', relevanceToQuestion: 'y', reflection: 'z' },
      { cardId: '01-magician', position: 'present', symbolicMeaning: 'x', relevanceToQuestion: 'y', reflection: 'z' },
      { cardId: '02-high-priestess', position: 'future', symbolicMeaning: 'x', relevanceToQuestion: 'y', reflection: 'z' },
    ],
    patterns: [],
    practicalReflection: 'test reflection',
    uncertaintyNotice: 'test notice',
    safetyFlags: [],
  },
  provider: 'claude',
  versions: { deck: '1.0.0', algorithm: '1.0.0', knowledge: '0.1.0', prompt: 'tarot-interpretation-v1' },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HomePage — pipeline outcomes render distinct, correct screens', () => {
  test('normal success (resolved) renders First Insight + Detailed Synthesis, no diagnostic badges', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ ...baseReading, knowledge: { meta: { status: 'resolved', provider: 'local-json', version: '0.1.0' }, context: {} } })
      )
    );
    await acceptConsentAndSubmit();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByText('test opening')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^diagnostic-/)).not.toBeInTheDocument();
  });

  test('knowledge partial renders the reading normally, with the partial badge (not an error)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ ...baseReading, knowledge: { meta: { status: 'partial', provider: 'local-json', version: '0.1.0' }, context: {} } })
      )
    );
    await acceptConsentAndSubmit();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByLabelText('diagnostic-knowledge-partial')).toBeInTheDocument();
    expect(screen.queryByLabelText('error-state')).not.toBeInTheDocument();
  });

  test('knowledge fallback renders the reading normally, with the fallback badge (not an error)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          ...baseReading,
          knowledge: { meta: { status: 'fallback', provider: 'local-json', version: 'unknown', errorCode: 'bundle_not_found' }, context: {} },
        })
      )
    );
    await acceptConsentAndSubmit();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByLabelText('diagnostic-knowledge-fallback')).toBeInTheDocument();
    expect(screen.queryByLabelText('error-state')).not.toBeInTheDocument();
  });

  test('narration fallback (provider: mock) renders full reading content with the mock badge', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          ...baseReading,
          provider: 'mock',
          knowledge: { meta: { status: 'resolved', provider: 'local-json', version: '0.1.0' }, context: {} },
        })
      )
    );
    await acceptConsentAndSubmit();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByLabelText('diagnostic-narration-fallback')).toBeInTheDocument();
    expect(screen.getByText('test opening')).toBeInTheDocument();
  });

  test('crisis short-circuit renders CrisisNotice, never the reading UI', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          status: 'crisis',
          message: 'crisis test message',
          resources: [{ label: 'Test Hattı', contact: '000' }],
        })
      )
    );
    await acceptConsentAndSubmit('crisis-triggering question');

    await waitFor(() => expect(screen.getByLabelText('crisis-resources')).toBeInTheDocument());
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
    expect(screen.getByText('crisis test message')).toBeInTheDocument();
  });

  test('400 validation error renders ErrorNotice, not a crash', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: 'invalid_request' }, 400)));
    await acceptConsentAndSubmit();

    await waitFor(() => expect(screen.getByLabelText('error-state')).toBeInTheDocument());
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
  });

  test('network failure renders ErrorNotice with retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );
    await acceptConsentAndSubmit();

    await waitFor(() => expect(screen.getByLabelText('error-state')).toBeInTheDocument());
    expect(screen.getByText(/Bağlantı hatası oluştu/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tekrar Dene' }));
    expect(screen.getByLabelText('question-form')).toBeInTheDocument();
  });
});

describe('HomePage — request payload never carries trusted client-side intake fields', () => {
  test('fetch body is exactly { seed, question } when no topic hint chosen', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ ...baseReading, knowledge: { meta: { status: 'resolved', provider: 'local-json', version: '0.1.0' }, context: {} } })
    );
    vi.stubGlobal('fetch', fetchSpy);
    await acceptConsentAndSubmit('my question');

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    // JSON.stringify drops an undefined topicHint entirely - only seed/question present.
    expect(Object.keys(body).sort()).toEqual(['question', 'seed']);
    expect(body.question).toBe('my question');
    expect(body.persona).toBeUndefined();
    expect(body.safetyFlags).toBeUndefined();
    expect(body.confidence).toBeUndefined();
  });

  test('fetch body includes topicHint when a topic hint button is chosen, still no persona/safety fields', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ ...baseReading, knowledge: { meta: { status: 'resolved', provider: 'local-json', version: '0.1.0' }, context: {} } })
    );
    vi.stubGlobal('fetch', fetchSpy);

    render(<HomePage />);
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Devam Et' }));
    await userEvent.type(screen.getByLabelText('Sorunuz'), 'career question');
    await userEvent.click(screen.getByRole('button', { name: 'Kariyer' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kartları Çek' }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(Object.keys(body).sort()).toEqual(['question', 'seed', 'topicHint']);
    expect(body.topicHint).toBe('career');
  });
});
