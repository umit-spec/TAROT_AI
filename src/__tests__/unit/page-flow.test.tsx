// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import HomePage from '../../app/page';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const previewOk = {
  status: 'preview',
  framing: { topicLabel: 'Açık uçlu', reflectiveFocus: 'Üzerine düşünmek isteyebileceğin açık uçlu yönler' },
};

// Routes a mocked fetch by URL: the preview call and the reading call are two
// distinct endpoints going through the one orchestrator.
function routingFetch(handlers: {
  preview?: () => Response | Promise<Response>;
  reading?: () => Response | Promise<Response>;
}) {
  return vi.fn(async (url: RequestInfo | URL, _init?: RequestInit) => {
    const u = String(url);
    if (u.includes('/preview')) return (handlers.preview ?? (() => jsonResponse(previewOk)))();
    return (handlers.reading ?? (() => jsonResponse(baseReadingResolved)))();
  });
}

async function compose(question = 'test question') {
  render(<HomePage />);
  await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: 'Devam Et' }));
  await userEvent.type(screen.getByLabelText('Sorunuz'), question);
  await userEvent.click(screen.getByRole('button', { name: 'Kartları Çek' }));
}

async function confirmFraming() {
  await waitFor(() => expect(screen.getByLabelText('framing-review')).toBeInTheDocument());
  await userEvent.click(screen.getByRole('button', { name: 'Evet, böyle devam et' }));
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
const baseReadingResolved = {
  ...baseReading,
  knowledge: { meta: { status: 'resolved', provider: 'local-json', version: '0.1.0' }, context: {} },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HomePage — framing review sits between the question and the draw', () => {
  test('preview is fetched first and shows the framing review, no cards yet', async () => {
    const fetchSpy = routingFetch({});
    vi.stubGlobal('fetch', fetchSpy);
    await compose();

    await waitFor(() => expect(screen.getByLabelText('framing-review')).toBeInTheDocument());
    expect(screen.getByText('Açık uçlu')).toBeInTheDocument();
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
    // Only the preview endpoint was hit so far - no draw.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toContain('/api/readings/preview');
  });

  test('confirm draws the reading; edit returns to the question preserving input', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose('my careful question');
    // Edit path: back to the form with the text preserved.
    await waitFor(() => expect(screen.getByLabelText('framing-review')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu düzenle' }));
    expect((screen.getByLabelText('Sorunuz') as HTMLTextAreaElement).value).toBe('my careful question');

    // Continue again, then confirm -> reading renders.
    await userEvent.click(screen.getByRole('button', { name: 'Kartları Çek' }));
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByText('test opening')).toBeInTheDocument();
  });
});

describe('HomePage — pipeline outcomes render distinct, correct screens', () => {
  test('normal success renders the reading with no diagnostic badges', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByText('test opening')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^diagnostic-/)).not.toBeInTheDocument();
  });

  test('knowledge partial renders the reading with the partial badge (not an error)', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        reading: () =>
          jsonResponse({ ...baseReading, knowledge: { meta: { status: 'partial', provider: 'local-json', version: '0.1.0' }, context: {} } }),
      })
    );
    await compose();
    await confirmFraming();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByLabelText('diagnostic-knowledge-partial')).toBeInTheDocument();
    expect(screen.queryByLabelText('error-state')).not.toBeInTheDocument();
  });

  test('narration fallback (provider: mock) renders full content with the mock badge', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        reading: () =>
          jsonResponse({ ...baseReading, provider: 'mock', knowledge: { meta: { status: 'resolved', provider: 'local-json', version: '0.1.0' }, context: {} } }),
      })
    );
    await compose();
    await confirmFraming();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByLabelText('diagnostic-narration-fallback')).toBeInTheDocument();
  });

  test('preview-stage crisis short-circuits: CrisisNotice, never framing or reading', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        preview: () => jsonResponse({ status: 'crisis', message: 'crisis test message', resources: [{ label: 'Test Hattı', contact: '112' }] }),
      })
    );
    await compose('crisis-triggering question');

    await waitFor(() => expect(screen.getByLabelText('crisis-resources')).toBeInTheDocument());
    expect(screen.queryByLabelText('framing-review')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
    expect(screen.getByText('crisis test message')).toBeInTheDocument();
  });

  test('reading-stage crisis (edited-in after preview) still short-circuits', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        reading: () => jsonResponse({ status: 'crisis', message: 'reading crisis', resources: [{ label: 'x', contact: '112' }] }),
      })
    );
    await compose();
    await confirmFraming();

    await waitFor(() => expect(screen.getByLabelText('crisis-resources')).toBeInTheDocument());
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
  });

  test('preview 400 renders ErrorNotice, not a crash', async () => {
    vi.stubGlobal('fetch', routingFetch({ preview: () => jsonResponse({ error: 'invalid_request' }, 400) }));
    await compose();

    await waitFor(() => expect(screen.getByLabelText('error-state')).toBeInTheDocument());
    expect(screen.queryByLabelText('framing-review')).not.toBeInTheDocument();
  });

  test('network failure renders ErrorNotice with retry back to the question form', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down');
    }));
    await compose();

    await waitFor(() => expect(screen.getByLabelText('error-state')).toBeInTheDocument());
    expect(screen.getByText(/Bağlantı hatası oluştu/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tekrar Dene' }));
    expect(screen.getByLabelText('question-form')).toBeInTheDocument();
  });
});

describe('HomePage — focus management across transitions (a11y)', () => {
  test('framing transition focuses the framing heading', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Seni doğru mu anladım?' })).toHaveFocus());
  });

  test('edit returns focus to the question textarea', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose('devam eden sorum');
    await waitFor(() => expect(screen.getByLabelText('framing-review')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu düzenle' }));
    await waitFor(() => expect(screen.getByLabelText('Sorunuz')).toHaveFocus());
  });

  test('preview-stage crisis transition focuses the crisis heading', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        preview: () => jsonResponse({ status: 'crisis', message: 'kriz başlığı', resources: [{ label: 'x', contact: '112' }] }),
      })
    );
    await compose('crisis');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'kriz başlığı' })).toHaveFocus());
  });

  test('error transition focuses the error heading', async () => {
    vi.stubGlobal('fetch', routingFetch({ preview: () => jsonResponse({ error: 'invalid_request' }, 400) }));
    await compose();
    await waitFor(() => expect(screen.getByRole('heading', { name: /Bir hata oluştu/ })).toHaveFocus());
  });
});

describe('HomePage — neither endpoint ever receives a trusted client-side intake field', () => {
  test('preview body is { question } only (no seed); reading body is { seed, question }', async () => {
    const fetchSpy = routingFetch({});
    vi.stubGlobal('fetch', fetchSpy);
    await compose('my question');
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const previewBody = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    const readingBody = JSON.parse((fetchSpy.mock.calls[1][1] as RequestInit).body as string);

    expect(String(fetchSpy.mock.calls[0][0])).toContain('/api/readings/preview');
    expect(Object.keys(previewBody).sort()).toEqual(['question']); // no seed on preview
    expect(previewBody.persona).toBeUndefined();
    expect(previewBody.safetyFlags).toBeUndefined();

    expect(Object.keys(readingBody).sort()).toEqual(['question', 'seed']);
    expect(readingBody.persona).toBeUndefined();
    expect(readingBody.confidence).toBeUndefined();
  });

  test('topicHint flows to both endpoints, still no persona/safety fields', async () => {
    const fetchSpy = routingFetch({});
    vi.stubGlobal('fetch', fetchSpy);

    render(<HomePage />);
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Devam Et' }));
    await userEvent.type(screen.getByLabelText('Sorunuz'), 'career question');
    await userEvent.click(screen.getByRole('button', { name: 'Kariyer' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kartları Çek' }));
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());

    const previewBody = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    const readingBody = JSON.parse((fetchSpy.mock.calls[1][1] as RequestInit).body as string);
    expect(Object.keys(previewBody).sort()).toEqual(['question', 'topicHint']);
    expect(previewBody.topicHint).toBe('career');
    expect(Object.keys(readingBody).sort()).toEqual(['question', 'seed', 'topicHint']);
    expect(readingBody.topicHint).toBe('career');
  });
});
