// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PatternArrival } from '../../components/PatternArrival';

const base = {
  opening: 'Kısa bir giriş.',
  practicalReflection: 'Üç kartın birlikte söylediği ana düşünce.',
  patterns: ['ilk destekleyici ipucu', 'ikinci destekleyici ipucu'],
  uncertaintyNotice: 'Bu bir kesinlik değil, olası bir bakış açısı.',
};

function renderArrival(overrides: Partial<typeof base> = {}, onSeeDetails = vi.fn()) {
  render(<PatternArrival {...base} {...overrides} onSeeDetails={onSeeDetails} />);
  return onSeeDetails;
}

describe('PatternArrival — single cross-card arrival screen', () => {
  test('shows the heading and the main synthesis (practicalReflection)', () => {
    renderArrival();
    expect(screen.getByRole('heading', { name: 'Üç kartın birlikte gösterdiği örüntü' })).toBeInTheDocument();
    expect(screen.getByLabelText('main-synthesis')).toHaveTextContent('Üç kartın birlikte söylediği ana düşünce.');
  });

  test('renders the opening lead-in verbatim', () => {
    renderArrival();
    expect(screen.getByText('Kısa bir giriş.')).toBeInTheDocument();
  });

  test('multiple patterns appear as "Destekleyen ipuçları", not as a declared main theme', () => {
    renderArrival();
    const cues = screen.getByLabelText('supporting-cues');
    expect(within(cues).getByRole('heading', { name: 'Destekleyen ipuçları' })).toBeInTheDocument();
    const items = within(cues).getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['ilk destekleyici ipucu', 'ikinci destekleyici ipucu']);
    // patterns[0] is NOT promoted into the heading/main synthesis.
    expect(screen.getByRole('heading', { name: 'Üç kartın birlikte gösterdiği örüntü' })).toBeInTheDocument();
    expect(screen.getByLabelText('main-synthesis')).not.toHaveTextContent('ilk destekleyici ipucu');
  });

  test('empty patterns renders NO supporting-cues section (no empty heading/list)', () => {
    renderArrival({ patterns: [] });
    expect(screen.queryByLabelText('supporting-cues')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Destekleyen ipuçları' })).not.toBeInTheDocument();
  });

  test('uncertaintyNotice is a boundary note, kept separate from the CTA and synthesis', () => {
    renderArrival();
    const note = screen.getByLabelText('uncertainty-note');
    expect(note).toHaveTextContent('Bu bir kesinlik değil, olası bir bakış açısı.');
    // It is not the main synthesis and not a button.
    expect(note.tagName).not.toBe('BUTTON');
    expect(screen.getByLabelText('main-synthesis')).not.toHaveTextContent('kesinlik değil');
  });

  test('the CTA moves on to the card details and is keyboard-operable', async () => {
    const onSeeDetails = renderArrival();
    const cta = screen.getByRole('button', { name: 'Kartların ayrıntılarını gör' });
    cta.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSeeDetails).toHaveBeenCalledTimes(1);
  });

  test('no technical diagnostic (provider/confidence/persona/safety) can appear here', () => {
    renderArrival();
    const body = screen.getByLabelText('pattern-arrival').textContent ?? '';
    expect(body).not.toMatch(/provider|confidence|safetyFlags|persona|mock|fallback/i);
  });

  test('focuses the pattern heading on mount', async () => {
    renderArrival();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Üç kartın birlikte gösterdiği örüntü' })).toHaveFocus()
    );
  });
});
