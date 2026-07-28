// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PatternArrival } from '../../components/PatternArrival';

const REGION_NAME = 'Üç kartın birlikte gösterdiği örüntü';

const base = {
  opening: 'Kısa bir giriş.',
  practicalReflection: 'Üç kartın birlikte söylediği ana düşünce.',
  patterns: ['ilk destekleyici ipucu', 'ikinci destekleyici ipucu'],
  uncertaintyNotice: 'Bu bir kesinlik değil, olası bir bakış açısı.',
};

function renderArrival(overrides: Partial<typeof base> = {}, onSeeDetails = vi.fn(), onComplete = vi.fn()) {
  render(<PatternArrival {...base} {...overrides} onComplete={onComplete} onSeeDetails={onSeeDetails} />);
  return { onSeeDetails, onComplete };
}

describe('PatternArrival — single cross-card arrival screen', () => {
  test('shows the heading and the main synthesis (practicalReflection)', () => {
    renderArrival();
    expect(screen.getByRole('heading', { name: REGION_NAME })).toBeInTheDocument();
    expect(screen.getByTestId('main-synthesis')).toHaveTextContent('Üç kartın birlikte söylediği ana düşünce.');
  });

  test('renders the opening lead-in verbatim', () => {
    renderArrival();
    expect(screen.getByText('Kısa bir giriş.')).toBeInTheDocument();
  });

  test('empty opening renders no opening paragraph', () => {
    renderArrival({ opening: '' });
    expect(screen.queryByText('Kısa bir giriş.')).not.toBeInTheDocument();
  });

  test('multiple patterns appear as "Destekleyen ipuçları", not as a declared main theme', () => {
    renderArrival();
    const cues = screen.getByTestId('supporting-cues');
    expect(within(cues).getByRole('heading', { name: 'Destekleyen ipuçları' })).toBeInTheDocument();
    const items = within(cues).getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['ilk destekleyici ipucu', 'ikinci destekleyici ipucu']);
    // patterns[0] is NOT promoted into the heading/main synthesis.
    expect(screen.getByRole('heading', { name: REGION_NAME })).toBeInTheDocument();
    expect(screen.getByTestId('main-synthesis')).not.toHaveTextContent('ilk destekleyici ipucu');
  });

  test('empty patterns renders NO supporting-cues section (no empty heading/list)', () => {
    renderArrival({ patterns: [] });
    expect(screen.queryByTestId('supporting-cues')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Destekleyen ipuçları' })).not.toBeInTheDocument();
  });

  test('uncertaintyNotice is a boundary note, kept separate from the CTA and synthesis', () => {
    renderArrival();
    const note = screen.getByTestId('uncertainty-note');
    expect(note).toHaveTextContent('Bu bir kesinlik değil, olası bir bakış açısı.');
    // It is not the main synthesis and not a button, and not labelled as a
    // reflection question.
    expect(note.tagName).toBe('ASIDE');
    expect(note.textContent ?? '').not.toMatch(/soru\?/i);
    expect(screen.getByTestId('main-synthesis')).not.toHaveTextContent('kesinlik değil');
  });

  test('the secondary CTA opens the card details and is keyboard-operable', async () => {
    const { onSeeDetails } = renderArrival();
    const cta = screen.getByRole('button', { name: 'Kartların ayrıntılarını gör' });
    cta.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSeeDetails).toHaveBeenCalledTimes(1);
  });

  test('the primary CTA completes with a question, without opening details', async () => {
    const { onComplete, onSeeDetails } = renderArrival();
    await userEvent.click(screen.getByRole('button', { name: 'Bir soruyla tamamla' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSeeDetails).not.toHaveBeenCalled();
  });

  test('DOM/Tab order is "Bir soruyla tamamla" before "Kartların ayrıntılarını gör" (no reversal trick)', async () => {
    renderArrival();
    const primary = screen.getByRole('button', { name: 'Bir soruyla tamamla' });
    const secondary = screen.getByRole('button', { name: 'Kartların ayrıntılarını gör' });
    primary.focus();
    await userEvent.tab();
    expect(secondary).toHaveFocus();
  });

  test('both CTAs keep at least a 44px minimum touch target', () => {
    renderArrival();
    const primary = screen.getByRole('button', { name: 'Bir soruyla tamamla' });
    const secondary = screen.getByRole('button', { name: 'Kartların ayrıntılarını gör' });
    expect(primary.className).toMatch(/min-h-\[52px\]/);
    expect(primary.className).toMatch(/min-w-\[44px\]/);
    expect(secondary.className).toMatch(/min-h-\[44px\]/);
    expect(secondary.className).toMatch(/min-w-\[44px\]/);
  });

  test('no technical diagnostic (provider/confidence/persona/safety) can appear here', () => {
    renderArrival();
    const body = screen.getByRole('region', { name: REGION_NAME }).textContent ?? '';
    expect(body).not.toMatch(/provider|confidence|safetyFlags|persona|mock|fallback/i);
  });

  test('the region accessible name is the visible heading, not a test-hook string', () => {
    renderArrival();
    expect(screen.getByRole('region', { name: REGION_NAME })).toHaveAttribute('data-testid', 'pattern-arrival');
  });

  test('focuses the pattern heading on mount', async () => {
    renderArrival();
    await waitFor(() => expect(screen.getByRole('heading', { name: REGION_NAME })).toHaveFocus());
  });

  test('the heading is tabIndex=-1 and never shows the interactive focus-visible ring', () => {
    renderArrival();
    const heading = screen.getByRole('heading', { name: REGION_NAME });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading.className).toMatch(/focus-visible:outline-none/);
  });

  test('a long-text stress fixture renders without throwing and stays inside a wrapping surface', () => {
    const long = 'Uzun bir örüntü açıklaması. '.repeat(30).trim();
    renderArrival({ practicalReflection: long });
    const synthesis = screen.getByTestId('main-synthesis');
    expect(synthesis).toHaveTextContent(long);
    expect(synthesis.className).toMatch(/break-words/);
  });
});
