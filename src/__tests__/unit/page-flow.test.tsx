// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
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
  await userEvent.click(screen.getByRole('button', { name: 'Sorumu netleştir' }));
}

async function confirmFraming() {
  await waitFor(() => expect(screen.getByLabelText('framing-review')).toBeInTheDocument());
  await userEvent.click(screen.getByRole('button', { name: 'Evet, böyle devam et' }));
}

// The reading resolves into the reveal; the user opens all three cards at
// their own pace, then continues -> the pattern arrival screen.
async function revealAllAndContinue() {
  await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());
  await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
  await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
  await userEvent.click(screen.getByRole('button', { name: 'Yön kartını aç' }));
  await userEvent.click(screen.getByRole('button', { name: 'İçgörüyü gör' }));
}

// From the pattern arrival screen, an explicit user action opens the details.
async function seePatternDetails() {
  await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
  await userEvent.click(screen.getByRole('button', { name: 'Kartların ayrıntılarını gör' }));
}

// Path A: close straight from the pattern with the reflection question.
async function completeFromPattern() {
  await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
  await userEvent.click(screen.getByRole('button', { name: 'Bir soruyla tamamla' }));
}

// Path B: close from the end of the card details.
async function completeFromDetails() {
  await seePatternDetails();
  await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
  await userEvent.click(screen.getByRole('button', { name: 'Okumayı bir soruyla tamamla' }));
}

const RESPONSE_REFLECTION_PROMPT = 'Bu okuma sana neyi yeniden düşünmen için alan açıyor?';

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
    reflectionPrompt: 'Bu okuma sana neyi yeniden düşünmen için alan açıyor?',
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

    // Continue again, then confirm -> reveal -> pattern -> details.
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu netleştir' }));
    await confirmFraming();
    await revealAllAndContinue();
    await seePatternDetails();
    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
  });
});

describe('HomePage — the pattern arrival is the first destination after the reveal', () => {
  test('pattern is not reachable before all three cards are revealed', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
    // 2/3: no pattern, no result.
    expect(screen.queryByLabelText('pattern-arrival')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
  });

  test('after 3/3 the İçgörüyü gör CTA lands on the pattern screen, not the full result', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();

    await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
    // The pattern screen shows the main synthesis, and the full result is NOT
    // shown yet.
    expect(screen.getByLabelText('main-synthesis')).toHaveTextContent('test reflection');
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
  });

  test('with no patterns, the pattern screen shows no supporting-cues section', async () => {
    // baseReading.interpretation.patterns === [].
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
    expect(screen.queryByLabelText('supporting-cues')).not.toBeInTheDocument();
  });

  test('multiple patterns appear as supporting cues on the pattern screen', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        reading: () =>
          jsonResponse({
            ...baseReadingResolved,
            interpretation: { ...baseReading.interpretation, patterns: ['ipucu bir', 'ipucu iki'] },
          }),
      })
    );
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await waitFor(() => expect(screen.getByLabelText('supporting-cues')).toBeInTheDocument());
    expect(screen.getByLabelText('supporting-cues')).toHaveTextContent('ipucu bir');
    expect(screen.getByLabelText('supporting-cues')).toHaveTextContent('ipucu iki');
  });

  test('the uncertainty notice is shown as a boundary note, separate from the synthesis', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
    expect(screen.getByLabelText('uncertainty-note')).toHaveTextContent('test notice');
    expect(screen.getByLabelText('main-synthesis')).not.toHaveTextContent('test notice');
  });

  test('no technical diagnostic badge appears on the pattern screen (even with a fallback provider)', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        reading: () => jsonResponse({ ...baseReadingResolved, provider: 'mock' }),
      })
    );
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
    // Diagnostic badges live in the detail (ReadingResult), never on the pattern.
    expect(screen.queryByLabelText(/^diagnostic-/)).not.toBeInTheDocument();
  });

  test('card details require an explicit action and preserve card order + narration index', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
    // The details are not shown until the user asks.
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
    await seePatternDetails();
    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    // Cards render in response order in the detail (index == order).
    const cardList = screen.getByLabelText('card-list');
    const ids = within(cardList)
      .getAllByRole('listitem')
      .map((li) => li.getAttribute('aria-label'));
    expect(ids).toEqual(['card-00-fool', 'card-01-magician', 'card-02-high-priestess']);
  });
});

describe('HomePage — the reveal gates the interpretation (3/3)', () => {
  test('the reading resolves into the reveal, NOT the whole interpretation at once', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();

    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());
    // No interpretation, no synthesis, no result yet.
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
    expect(screen.queryByText('test opening')).not.toBeInTheDocument();
    // Only the first card is openable; the reader cannot jump ahead.
    expect(screen.getByRole('button', { name: 'Geçmiş kartını aç' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Şimdi kartını aç' })).not.toBeInTheDocument();
  });

  test('no path to the interpretation exists before all three are revealed', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
    // 2/3 revealed - still no gate, still no result.
    expect(screen.queryByRole('button', { name: 'İçgörüyü gör' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Yön kartını aç' }));
    await userEvent.click(screen.getByRole('button', { name: 'İçgörüyü gör' }));
    // 3/3 opens the interpretation flow at the pattern screen (not the wall).
    await waitFor(() => expect(screen.getByLabelText('pattern-arrival')).toBeInTheDocument());
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
  });

  test('the revealed card ids/positions match the response (no redraw in the flow)', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    // The revealed element still carries the internal id (aria-label), while the
    // user sees the governed display name, never the raw id.
    const revealed = screen.getByLabelText('revealed-00-fool');
    expect(revealed).toHaveTextContent('Deli');
    expect(revealed.textContent ?? '').not.toContain('00-fool');
  });

  test('there is no redraw/retry control inside the reveal', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /yeniden|tekrar çek|redraw/i })).not.toBeInTheDocument();
  });

  test('reveal focuses the reveal heading on entry', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Kartlarını kendi hızında aç' })).toHaveFocus());
  });
});

describe('HomePage — pipeline outcomes render distinct, correct screens', () => {
  test('normal success renders the reading with no diagnostic badges', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await seePatternDetails();

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
    await revealAllAndContinue();
    await seePatternDetails();

    await waitFor(() => expect(screen.getByLabelText('reading-result')).toBeInTheDocument());
    expect(screen.getByLabelText('diagnostic-knowledge-partial')).toBeInTheDocument();
    expect(screen.queryByLabelText('error-state')).not.toBeInTheDocument();
  });

  test('provider fallback (provider: mock) still flows through the reveal to full content', async () => {
    vi.stubGlobal(
      'fetch',
      routingFetch({
        reading: () =>
          jsonResponse({ ...baseReading, provider: 'mock', knowledge: { meta: { status: 'resolved', provider: 'local-json', version: '0.1.0' }, context: {} } }),
      })
    );
    await compose();
    await confirmFraming();
    // The reveal and pattern are unaffected by the narration fallback.
    await revealAllAndContinue();
    await seePatternDetails();

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
    expect(screen.queryByLabelText('pattern-arrival')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('reflection-close')).not.toBeInTheDocument();
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
    // Crisis never enters the reveal path.
    expect(screen.queryByLabelText('card-reveal')).not.toBeInTheDocument();
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

describe('HomePage — reflection close is reachable from both the pattern and the details', () => {
  test('reflection is not reachable before the pattern screen', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    expect(screen.queryByLabelText('reflection-close')).not.toBeInTheDocument();
  });

  test('pattern -> primary CTA lands on the reflection close, without opening details', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await completeFromPattern();

    await waitFor(() => expect(screen.getByLabelText('reflection-close')).toBeInTheDocument());
    expect(screen.getByLabelText('reflection-question').textContent).toBe(RESPONSE_REFLECTION_PROMPT);
    // Details were never required.
    expect(screen.queryByLabelText('reading-result')).not.toBeInTheDocument();
  });

  test('pattern -> details -> complete reaches the SAME governed reflection prompt', async () => {
    vi.stubGlobal('fetch', routingFetch({}));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await completeFromDetails();

    await waitFor(() => expect(screen.getByLabelText('reflection-close')).toBeInTheDocument());
    expect(screen.getByLabelText('reflection-question').textContent).toBe(RESPONSE_REFLECTION_PROMPT);
  });

  test('reaching reflection makes no extra API call and never redraws', async () => {
    const fetchSpy = routingFetch({});
    vi.stubGlobal('fetch', fetchSpy);
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await completeFromPattern();
    await waitFor(() => expect(screen.getByLabelText('reflection-close')).toBeInTheDocument());
    // Only the preview + reading calls; the reflection close calls nothing.
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test('reflectionPromptSource / provider metadata never leaks onto the reflection surface', async () => {
    vi.stubGlobal('fetch', routingFetch({ reading: () => jsonResponse({ ...baseReadingResolved, provider: 'mock' }) }));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await completeFromPattern();
    await waitFor(() => expect(screen.getByLabelText('reflection-close')).toBeInTheDocument());
    const text = screen.getByLabelText('reflection-close').textContent ?? '';
    expect(text).not.toMatch(/provider|source|fallback|mock|confidence|safetyFlags/i);
  });

  test('a provider fallback does not break the path to reflection', async () => {
    vi.stubGlobal('fetch', routingFetch({ reading: () => jsonResponse({ ...baseReadingResolved, provider: 'mock' }) }));
    await compose();
    await confirmFraming();
    await revealAllAndContinue();
    await completeFromPattern();
    await waitFor(() => expect(screen.getByLabelText('reflection-close')).toBeInTheDocument());
  });
});

describe('HomePage — neither endpoint ever receives a trusted client-side intake field', () => {
  test('preview body is { question } only (no seed); reading body is { seed, question }', async () => {
    const fetchSpy = routingFetch({});
    vi.stubGlobal('fetch', fetchSpy);
    await compose('my question');
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());

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
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu netleştir' }));
    await confirmFraming();
    await waitFor(() => expect(screen.getByLabelText('card-reveal')).toBeInTheDocument());

    const previewBody = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    const readingBody = JSON.parse((fetchSpy.mock.calls[1][1] as RequestInit).body as string);
    expect(Object.keys(previewBody).sort()).toEqual(['question', 'topicHint']);
    expect(previewBody.topicHint).toBe('career');
    expect(Object.keys(readingBody).sort()).toEqual(['question', 'seed', 'topicHint']);
    expect(readingBody.topicHint).toBe('career');
  });
});
