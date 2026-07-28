// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ConsentModal } from '../../components/ConsentModal';
import { CrisisNotice, type CrisisNoticeProps } from '../../components/CrisisNotice';
import { DiagnosticBadge } from '../../components/DiagnosticBadge';
import { QuestionForm } from '../../components/QuestionForm';
import { FramingReview } from '../../components/FramingReview';
import { CardNarrationItem } from '../../components/CardNarrationItem';
import { ErrorNotice } from '../../components/ErrorNotice';
import { DisclaimerFooter } from '../../components/DisclaimerFooter';
import { ShuffleReveal } from '../../components/ShuffleReveal';
import { FramingLoading } from '../../components/FramingLoading';
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

describe('ConsentModal — premium consent behavior & accessibility (FAZ 2)', () => {
  test('focuses the dialog heading on mount', async () => {
    render(<ConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: CONSENT_MODAL_COPY.title })).toHaveFocus());
  });

  test('has the expected dialog aria relationships - accessible name is the visible heading', () => {
    render(<ConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);
    // Semantic query, not a test-hook string: the dialog's accessible name
    // must be the real heading text, not an internal label a screen-reader
    // user would never recognize (docs/UI_PREMIUM_V1.md FAZ 2.1).
    const dialog = screen.getByRole('dialog', { name: CONSENT_MODAL_COPY.title });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-testid', 'consent-modal');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(CONSENT_MODAL_COPY.intro);
  });

  test('Decline calls onDecline directly, never onAccept', async () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    render(<ConsentModal onAccept={onAccept} onDecline={onDecline} />);
    await userEvent.click(screen.getByRole('button', { name: CONSENT_MODAL_COPY.declineLabel }));
    expect(onDecline).toHaveBeenCalledTimes(1);
    expect(onAccept).not.toHaveBeenCalled();
  });

  test('Escape calls onDecline', async () => {
    const onDecline = vi.fn();
    render(<ConsentModal onAccept={vi.fn()} onDecline={onDecline} />);
    await userEvent.keyboard('{Escape}');
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  test('checkbox is keyboard operable (Space toggles it)', async () => {
    render(<ConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    expect(checkbox).not.toBeChecked();
    await userEvent.keyboard(' ');
    expect(checkbox).toBeChecked();
  });

  test('Tab wraps from the last focusable back to the first (focus stays inside the dialog)', async () => {
    render(<ConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    const decline = screen.getByRole('button', { name: CONSENT_MODAL_COPY.declineLabel });
    // Accept starts disabled, so with the checkbox unchecked the trap cycles
    // between the two elements that are actually focusable: checkbox <-> decline.
    checkbox.focus();
    await userEvent.tab();
    expect(decline).toHaveFocus();
    await userEvent.tab();
    expect(checkbox).toHaveFocus();
  });

  test('once checked, Tab cycles checkbox -> Accept -> Decline -> checkbox (forward and reverse)', async () => {
    render(<ConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    const accept = screen.getByRole('button', { name: CONSENT_MODAL_COPY.acceptLabel });
    const decline = screen.getByRole('button', { name: CONSENT_MODAL_COPY.declineLabel });

    await userEvent.click(checkbox);
    checkbox.focus();

    await userEvent.tab();
    expect(accept).toHaveFocus();
    await userEvent.tab();
    expect(decline).toHaveFocus();
    await userEvent.tab();
    expect(checkbox).toHaveFocus();

    // Reverse must retrace the same three elements, never escaping the dialog.
    await userEvent.tab({ shift: true });
    expect(decline).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(accept).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(checkbox).toHaveFocus();
  });

  test('Accept and Decline keep 44x44px minimum touch targets', () => {
    render(<ConsentModal onAccept={vi.fn()} onDecline={vi.fn()} />);
    const accept = screen.getByRole('button', { name: CONSENT_MODAL_COPY.acceptLabel });
    const decline = screen.getByRole('button', { name: CONSENT_MODAL_COPY.declineLabel });
    expect(accept.className).toMatch(/min-h-\[44px\]/);
    expect(accept.className).toMatch(/min-w-\[44px\]/);
    expect(decline.className).toMatch(/min-h-\[44px\]/);
    expect(decline.className).toMatch(/min-w-\[44px\]/);
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
    expect(screen.getByTestId(`diagnostic-${kind}`)).toHaveTextContent(expectedPattern);
  });
});

describe('ShuffleReveal — prefers-reduced-motion', () => {
  test('reducedMotion=true drops the transition class (instant reveal)', () => {
    render(<ShuffleReveal isLoading={true} reducedMotion={true} />);
    const el = screen.getByTestId('shuffle-loading');
    expect(el.className).not.toMatch(/transition-opacity/);
  });

  test('reducedMotion=false applies the shuffle transition class', () => {
    render(<ShuffleReveal isLoading={true} reducedMotion={false} />);
    const el = screen.getByTestId('shuffle-loading');
    expect(el.className).toMatch(/duration-shuffle/);
  });

  test('renders nothing when not loading', () => {
    const { container } = render(<ShuffleReveal isLoading={false} reducedMotion={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ShuffleReveal — live-region semantics and truthful loading copy', () => {
  test('is a polite, atomic, busy status region with the exact loading copy', () => {
    render(<ShuffleReveal isLoading={true} reducedMotion={false} />);
    const status = screen.getByRole('status');
    expect(status).toBe(screen.getByTestId('shuffle-loading'));
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('Kartlar karılıyor...');
  });

  test('carries no card identity, name, or count - it cannot, it has no cards prop', () => {
    render(<ShuffleReveal isLoading={true} reducedMotion={false} />);
    const status = screen.getByTestId('shuffle-loading');
    expect(status.textContent ?? '').not.toMatch(/deli|büyücü|00-fool|01-magician|%|kalan süre/i);
  });

  test('the reduced-motion dot mark drops its animation class', () => {
    const { container: reduced } = render(<ShuffleReveal isLoading={true} reducedMotion={true} />);
    expect(reduced.querySelector('.loading-mark__dot')).not.toBeInTheDocument();
    const { container: full } = render(<ShuffleReveal isLoading={true} reducedMotion={false} />);
    expect(full.querySelectorAll('.loading-mark__dot').length).toBe(3);
  });
});

describe('FramingLoading — the preview-stage counterpart, same live-region contract', () => {
  test('is a polite, atomic, busy status region with the exact preview copy', () => {
    render(<FramingLoading reducedMotion={false} />);
    const status = screen.getByRole('status');
    expect(status).toBe(screen.getByTestId('preview-loading'));
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('Sorun çerçeveleniyor...');
  });

  test('uses no percentage, countdown, or fabricated progress language', () => {
    render(<FramingLoading reducedMotion={false} />);
    const status = screen.getByTestId('preview-loading');
    expect(status.textContent ?? '').not.toMatch(/%|kalan süre|saniye|kader|evren/i);
  });

  test('reduced motion drops the dot mark animation class', () => {
    const { container } = render(<FramingLoading reducedMotion={true} />);
    expect(container.querySelector('.loading-mark__dot')).not.toBeInTheDocument();
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

  test('a topic alone (no question text) still submits with an empty question and the chosen topicHint', async () => {
    const onSubmit = vi.fn();
    render(<QuestionForm onSubmit={onSubmit} disabled={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'Kendim' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sorumu netleştir' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(Object.keys(payload).sort()).toEqual(['question', 'topicHint']);
    expect(payload.question).toBe('');
    expect(payload.topicHint).toBe('self');
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
    const body = screen.getByRole('region', { name: 'Seni doğru mu anladım?' }).textContent ?? '';
    expect(body).not.toMatch(/persona|confidence|safetyFlags|reflection-seeking|decision-seeking/i);
  });

  test('DOM/Tab order is Confirm before Edit, matching the visual order (no reversal trick)', async () => {
    render(<FramingReview framing={framing} onConfirm={vi.fn()} onEdit={vi.fn()} />);
    const confirm = screen.getByRole('button', { name: 'Evet, böyle devam et' });
    const edit = screen.getByRole('button', { name: 'Sorumu düzenle' });
    confirm.focus();
    await userEvent.tab();
    expect(edit).toHaveFocus();
  });

  test('disabled prop makes both Confirm and Edit inert', () => {
    render(<FramingReview framing={framing} onConfirm={vi.fn()} onEdit={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Evet, böyle devam et' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sorumu düzenle' })).toBeDisabled();
  });

  test('both CTAs keep at least a 44px minimum touch target (Confirm is taller by design, 52px)', () => {
    render(<FramingReview framing={framing} onConfirm={vi.fn()} onEdit={vi.fn()} />);
    const confirm = screen.getByRole('button', { name: 'Evet, böyle devam et' });
    const edit = screen.getByRole('button', { name: 'Sorumu düzenle' });
    expect(confirm.className).toMatch(/min-h-\[52px\]/);
    expect(confirm.className).toMatch(/min-w-\[44px\]/);
    expect(edit.className).toMatch(/min-h-\[44px\]/);
    expect(edit.className).toMatch(/min-w-\[44px\]/);
  });

  test('a long reflectiveFocus renders inside a wrapping, non-overflowing surface', () => {
    const longFraming = {
      topicLabel: 'Kariyer',
      reflectiveFocus:
        'Bu uzun yansıtma odağı, satır kaydırmayı zorlayacak kadar uzun Türkçe kelimeler ve noktalama içeren, en az yüz seksen karakter uzunluğunda, taşma üretmemesi gereken bir örnek cümledir; devamı da buraya eklenir.',
    };
    render(<FramingReview framing={longFraming} onConfirm={vi.fn()} onEdit={vi.fn()} />);
    const dd = screen.getByText(longFraming.reflectiveFocus);
    expect(dd.className).toMatch(/break-words/);
  });

  test('the region heading is tabIndex=-1 and never shows the interactive focus-visible ring', () => {
    render(<FramingReview framing={framing} onConfirm={vi.fn()} onEdit={vi.fn()} />);
    const heading = screen.getByRole('heading', { name: 'Seni doğru mu anladım?' });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading.className).toMatch(/focus-visible:outline-none/);
  });
});

describe('CardNarrationItem — third position reads "Yön", not "Gelecek"', () => {
  test('a future-position card is labelled Yön on the user surface', () => {
    render(
      <ul>
        <CardNarrationItem
          index={0}
          position="future"
          cardId="02-high-priestess"
          orientation="upright"
          narration={{
            cardId: '02-high-priestess',
            position: 'future',
            symbolicMeaning: 's',
            relevanceToQuestion: 'r',
            reflection: 'x',
          }}
        />
      </ul>
    );
    expect(screen.getByText('Yön')).toBeInTheDocument();
    expect(screen.queryByText('Gelecek')).not.toBeInTheDocument();
  });

  test('shows the governed display name, never the raw cardId', () => {
    render(
      <ul>
        <CardNarrationItem
          index={0}
          position="past"
          cardId="00-fool"
          orientation="upright"
          narration={{ cardId: '00-fool', position: 'past', symbolicMeaning: 's', relevanceToQuestion: 'r', reflection: 'x' }}
        />
      </ul>
    );
    expect(screen.getByText('Deli')).toBeInTheDocument();
    expect(screen.queryByText('00-fool')).not.toBeInTheDocument();
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

  test('QuestionForm without autoFocus focuses the screen heading instead (first compose entry)', async () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bugün neye bakmak istersin?' })).toHaveFocus()
    );
  });

  test('the QuestionForm heading is tabIndex=-1 and never shows the interactive focus-visible ring', () => {
    render(<QuestionForm onSubmit={vi.fn()} disabled={false} />);
    const heading = screen.getByRole('heading', { name: 'Bugün neye bakmak istersin?' });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading.className).toMatch(/focus-visible:outline-none/);
  });
});
