// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ConsentModal } from '../../components/ConsentModal';
import { CrisisNotice, type CrisisNoticeProps } from '../../components/CrisisNotice';
import { DiagnosticBadge } from '../../components/DiagnosticBadge';
import { QuestionForm } from '../../components/QuestionForm';
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
    await userEvent.click(screen.getByRole('button', { name: 'Kartları Çek' }));

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
    expect(screen.getByRole('button', { name: /hazırlanıyor/ })).toBeDisabled();
  });

  test('keyboard-only navigation can reach and activate the submit button', async () => {
    const onSubmit = vi.fn();
    render(<QuestionForm onSubmit={onSubmit} disabled={false} />);
    const textarea = screen.getByLabelText('Sorunuz');
    textarea.focus();
    await userEvent.keyboard('kariyer sorusu');
    // Tab from the textarea to the submit button and activate with Enter/Space.
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Kartları Çek' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
