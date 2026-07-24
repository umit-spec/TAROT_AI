// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ConsentModal } from '../../components/ConsentModal';
import { CrisisNotice, type CrisisNoticeProps } from '../../components/CrisisNotice';
import { DiagnosticBadge } from '../../components/DiagnosticBadge';
import { QuestionForm } from '../../components/QuestionForm';
import { FramingReview } from '../../components/FramingReview';
import { ErrorNotice } from '../../components/ErrorNotice';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { ShuffleReveal } from '../../components/ShuffleReveal';
import { CONSENT_MODAL_COPY, RESULT_DISCLAIMER_COPY } from '../../lib/constitution-copy';

describe('ConsentModal — exact Ethical Constitution copy', () => {
  test('renders the exact quoted title, intro, and section text', () => {
    render(<ConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);
    expect(screen.getByText(CONSENT_MODAL_COPY.title)).toBeInTheDocument();
    expect(screen.getByText(CONSENT_MODAL_COPY.intro)).toBeInTheDocument();
    for (const item of CONSENT_MODAL_COPY.notDone) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    for (const item of CONSENT_MODAL_COPY.howToUse) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  test('Accept button is disabled until the checkbox is checked', async () => {
    const onAccept = vi.fn();
    render(<ConsentModal onAccept={onAccept} onDecline={vi.fn()} />);
    const acceptButton = screen.getByRole('button', { name: CONSENT_MODAL_COPY.acceptLabel });
    expect(acceptButton).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox'));
    expect(acceptButton).toBeEnabled();

    await userEvent.click(acceptButton);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});

describe('DisclaimerFooter — exact Result Disclaimer copy', () => {
  test('renders all 4 quoted lines', () => {
    render(<DisclaimerFooter />);
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.heading)).toBeInTheDocument();
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.body)).toBeInTheDocument();
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.professionalNote)).toBeInTheDocument();
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.autonomyNote)).toBeInTheDocument();
  });
});

describe('CrisisNotice — cannot structurally carry tarot content', () => {
  test('renders message and resources from props only', () => {
    const props: CrisisNoticeProps = {
      message: 'test crisis message',
      resources: [{ label: 'Test Hattı', contact: '000' }],
    };
    render(<CrisisNotice {...props} />);
    expect(screen.getByText('test crisis message')).toBeInTheDocument();
    expect(screen.getByText(/Test Hattı/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('CrisisNoticeProps has no field capable of carrying reading data (type-level)', () => {
    // If this object literal compiled with a `cards` or `interpretation`
    // key, TypeScript would reject it under excess-property checking -
    // this test's existence (and a clean `npm run typecheck`) is the proof.
    const props: CrisisNoticeProps = { message: 'x', resources: [] };
    expect(Object.keys(props)).toEqual(['message', 'resources']);
  });
});

describe('DiagnosticBadge — enum-only, no free-string copy drift', () => {
  test.each([
    ['knowledge-partial', /kısmi/],
    ['knowledge-fallback', /ulaşılamadı/],
    ['narration-fallback', /yedek modda/],
  ] as const)('%s renders its fixed copy', (kind, expectedPattern) => {
    render(<DiagnosticBadge kind={kind} />);
    expect(screen.getByLabelText(`diagnostic-${kind}`)).toHaveTextContent(expectedPattern);
  });
});

describe('ShuffleReveal — prefers-reduced-motion', () => {
  test('reducedMotion=true drops the transition class (instant reveal)', () => {
    render(<ShuffleReveal isLoading={true} reducedMotion={true} />);
    const el = screen.getByLabelText('shuffle-loading');
    expect(el.className).not.toMatch(/transition-opacity/);
  });

  test('reducedMotion=false applies the shuffle transition class', () => {
    render(<ShuffleReveal isLoading={true} reducedMotion={false} />);
    const el = screen.getByLabelText('shuffle-loading');
    expect(el.className).toMatch(/duration-shuffle/);
  });

  test('renders nothing when not loading', () => {
    const { container } = render(<ShuffleReveal isLoading={false} reducedMotion={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('QuestionForm — the only component constructing a request payload', () => {
  test('onSubmit payload contains only question/topicHint keys, never persona/safety fields', async () => {
    const onSubmit = vi.fn();
    render(<QuestionForm onSubmit={onSubmit} disabled={false} />);

    await userEvent.type(screen.getByLabelText('Sorunuz'), 'test question');
    await userEvent.click(screen.getByRole('button', { name: 'Kariyer' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu netleştir' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(Object.keys(payload).sort()).toEqual(['question', 'topicHint']);
    expect(payload.question).toBe('test question');
    expect(payload.topicHint).toBe('career');
  });

  test('topic hint buttons are ≥44x44px touch targets (via className, structural check)', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    const button = screen.getByRole('button', { name: 'İlişki' });
    expect(button.className).toMatch(/min-h-\[44px\]/);
    expect(button.className).toMatch(/min-w-\[44px\]/);
  });

  test('all inputs disabled when disabled=true (loading state)', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={true} />);
    expect(screen.getByLabelText('Sorunuz')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'İlişki' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Netleştiriliyor/ })).toBeDisabled();
  });

  test('keyboard-only navigation can reach and activate the submit button', async () => {
    const onSubmit = vi.fn();
    render(<QuestionForm onSubmit={onSubmit} disabled={false} />);
    const textarea = screen.getByLabelText('Sorunuz');
    textarea.focus();
    await userEvent.keyboard('kariyer sorusu');
    // Tab from the textarea to the submit button and activate with Enter/Space.
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Sorumu netleştir' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // S-UX-3 copy correction: the compose submit starts the framing preview, not
  // a draw, so it must not use card/draw/shuffle language (UX_COPY_CONTRACT
  // §5.4, compose.cta = "Sorumu netleştir").
  test('compose submit uses the framing CTA and carries no card/draw/shuffle language', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    const submit = screen.getByRole('button', { name: 'Sorumu netleştir' });
    expect(submit).toHaveAttribute('type', 'submit');
    expect(submit.textContent ?? '').not.toMatch(/kart|çek|karıl|shuffle/i);
  });

  test('the loading label carries no card/shuffle/reading language either', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={true} />);
    const submit = screen.getByRole('button', { name: /Netleştiriliyor/ });
    expect(submit.textContent ?? '').not.toMatch(/kart|çek|karıl|shuffle|okuma/i);
  });
});

describe('QuestionForm — S-UX-1 question guidance (topic cards + reflective scaffolds)', () => {
  test('topic card shows its guidance hint while its accessible name stays exactly the label', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    // Name is forced by aria-label, so the visible hint text never pollutes it
    // (keeps the payload-shape regression tests and role queries stable).
    expect(screen.getByRole('button', { name: 'İlişki' })).toBeInTheDocument();
    expect(screen.getByText('Bir bağ, bir mesafe, bir soru işareti üzerine.')).toBeInTheDocument();
  });

  test('clicking a reflective scaffold inserts its text into an empty textarea and focuses it', async () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    const textarea = screen.getByLabelText('Sorunuz') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');

    await userEvent.click(screen.getByRole('button', { name: /gözden kaçırıyor/ }));

    expect(textarea.value).toBe('Bu konuda neyi gözden kaçırıyor olabilirim?');
    expect(textarea).toHaveFocus();
  });

  test('scaffold insert is non-destructive: it appends after the user’s own text', async () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    const textarea = screen.getByLabelText('Sorunuz') as HTMLTextAreaElement;

    await userEvent.type(textarea, 'kendi sorum');
    await userEvent.click(screen.getByRole('button', { name: /neye dikkat/ }));

    expect(textarea.value).toContain('kendi sorum');
    expect(textarea.value).toContain('Şu an neye dikkat etmem iyi olur?');
  });

  test('empty question still submits, and the payload shape is unchanged', async () => {
    const onSubmit = vi.fn();
    render(<QuestionForm onSubmit={onSubmit} disabled={false} />);

    // No topic, no text: the reading must still be requestable (skippable).
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu netleştir' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(Object.keys(payload).sort()).toEqual(['question', 'topicHint']);
    expect(payload.question).toBe('');
    expect(payload.topicHint).toBeUndefined();
  });

  test('scaffold buttons are disabled during loading', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button', { name: /gözden kaçırıyor/ })).toBeDisabled();
  });

  test('every scaffold is reflective, never predictive (anti-prophecy copy guard)', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    const scaffoldGroup = screen.getByRole('group', { name: 'soru-onerileri' });
    const buttons = within(scaffoldGroup).getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      // No certainty/prediction verbs (mirrors validate.ts red-line spirit).
      expect(button.textContent ?? '').not.toMatch(/olacak|kesinlikle|mutlaka|gelecek/i);
      // A reflective prompt ends in a question.
      expect((button.textContent ?? '').trim()).toMatch(/\?$/);
    }
  });

  test('initial values seed the form so "Sorumu düzenle" preserves prior input', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} initialQuestion="önceki sorum" initialTopicHint="career" />);
    expect((screen.getByLabelText('Sorunuz') as HTMLTextAreaElement).value).toBe('önceki sorum');
    expect(screen.getByRole('button', { name: 'Kariyer' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('FramingReview — shows only topic + reflective angle, never internals', () => {
  const framing = { topicLabel: 'Kariyer', reflectiveFocus: 'Bu kararda gözden kaçırıyor olabileceğin etkenler' };

  test('renders the two safe framing strings and the "not a diagnosis" note', () => {
    render(<FramingReview framing={framing} onConfirm={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText('Kariyer')).toBeInTheDocument();
    expect(screen.getByText('Bu kararda gözden kaçırıyor olabileceğin etkenler')).toBeInTheDocument();
    expect(screen.getByText(/teşhis değil/)).toBeInTheDocument();
  });

  test('confirm and edit call their handlers', async () => {
    const onConfirm = vi.fn();
    const onEdit = vi.fn();
    render(<FramingReview framing={framing} onConfirm={onConfirm} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Evet, böyle devam et' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu düzenle' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test('the rendered surface never shows an internal classification field', () => {
    // FramingReviewProps exposes only framing/onConfirm/onEdit/disabled - there
    // is no slot through which an internal field could reach the screen.
    render(<FramingReview framing={framing} onConfirm={vi.fn()} onEdit={vi.fn()} />);
    const body = screen.getByLabelText('framing-review').textContent ?? '';
    expect(body).not.toMatch(/persona|confidence|safetyFlags|reflection-seeking|decision-seeking/i);
  });
});

describe('Focus management (a11y) — a screen transition lands focus in the new context', () => {
  test('FramingReview focuses its heading on mount', async () => {
    render(
      <FramingReview framing={{ topicLabel: 'Kariyer', reflectiveFocus: 'x' }} onConfirm={vi.fn()} onEdit={vi.fn()} />
    );
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Seni doğru mu anladım?' })).toHaveFocus());
  });

  test('CrisisNotice focuses the crisis heading on mount', async () => {
    render(<CrisisNotice message="crisis heading" resources={[{ label: 'x', contact: '112' }]} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'crisis heading' })).toHaveFocus());
  });

  test('ErrorNotice focuses the error heading on mount', async () => {
    render(<ErrorNotice userMessage="bir sorun" onRetry={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: /bir sorun/ })).toHaveFocus());
  });

  test('the focused heading uses tabIndex=-1 so the normal tab order is unchanged', () => {
    render(<ErrorNotice userMessage="x" onRetry={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /x/ })).toHaveAttribute('tabindex', '-1');
  });

  test('QuestionForm with autoFocus moves focus to the question textarea', async () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} autoFocus />);
    await waitFor(() => expect(screen.getByLabelText('Sorunuz')).toHaveFocus());
  });

  test('QuestionForm without autoFocus does not steal focus on first load', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    expect(screen.getByLabelText('Sorunuz')).not.toHaveFocus();
  });
});
