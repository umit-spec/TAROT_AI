// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CardReveal } from '../../components/CardReveal';
import type { DrawnCard } from '../../types/reading';

const CARDS: DrawnCard[] = [
  { id: '00-fool', position: 'past', orientation: 'upright' },
  { id: '01-magician', position: 'present', orientation: 'upright' },
  { id: '02-high-priestess', position: 'future', orientation: 'upright' },
];

function renderReveal(onContinue = vi.fn(), reducedMotion = false) {
  render(<CardReveal cards={CARDS} reducedMotion={reducedMotion} onContinue={onContinue} />);
  return onContinue;
}

async function revealAll() {
  await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
  await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
  await userEvent.click(screen.getByRole('button', { name: 'Yön kartını aç' }));
}

describe('CardReveal — user controls pace, one card at a time', () => {
  test('starts with only the first card openable, nothing revealed, no continue gate', () => {
    renderReveal();
    expect(screen.getByRole('button', { name: 'Geçmiş kartını aç' })).toBeInTheDocument();
    // The later cards are not yet openable (cannot be skipped to).
    expect(screen.queryByRole('button', { name: 'Şimdi kartını aç' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yön kartını aç' })).not.toBeInTheDocument();
    // Nothing revealed, no way to move on yet.
    expect(screen.queryByLabelText('revealed-00-fool')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'İçgörüyü gör' })).not.toBeInTheDocument();
  });

  test('revealing advances exactly one card and a revealed card is no longer a button', async () => {
    renderReveal();
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));

    expect(screen.getByLabelText('revealed-00-fool')).toBeInTheDocument();
    // The revealed card is not still an open-button.
    expect(screen.queryByRole('button', { name: 'Geçmiş kartını aç' })).not.toBeInTheDocument();
    // Only the next card is now openable.
    expect(screen.getByRole('button', { name: 'Şimdi kartını aç' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yön kartını aç' })).not.toBeInTheDocument();
  });

  test('reveal order follows the response array order exactly', async () => {
    renderReveal();
    await revealAll();
    const items = within(screen.getByLabelText('reveal-list')).getAllByRole('listitem');
    const ids = items.map((li) => li.getAttribute('aria-label'));
    expect(ids).toEqual(['revealed-00-fool', 'revealed-01-magician', 'revealed-02-high-priestess']);
  });

  test('no continue/insight gate appears before all three are revealed', async () => {
    renderReveal();
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    expect(screen.queryByRole('button', { name: 'İçgörüyü gör' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
    expect(screen.queryByRole('button', { name: 'İçgörüyü gör' })).not.toBeInTheDocument();
  });

  test('after all three revealed, the insight gate appears and calls onContinue', async () => {
    const onContinue = renderReveal();
    await revealAll();
    const gate = screen.getByRole('button', { name: 'İçgörüyü gör' });
    expect(gate).toBeInTheDocument();
    await userEvent.click(gate);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('card identity and position are never changed by revealing (no redraw)', async () => {
    renderReveal();
    await revealAll();
    // Internal id preserved on the element (aria-label); the user sees the name.
    expect(screen.getByLabelText('revealed-00-fool')).toHaveTextContent('Geçmiş');
    expect(screen.getByLabelText('revealed-00-fool')).toHaveTextContent('Deli');
    expect(screen.getByLabelText('revealed-02-high-priestess')).toHaveTextContent('Yön');
    expect(screen.getByLabelText('revealed-02-high-priestess')).toHaveTextContent('Yüksek Rahibe');
  });

  test('the governed display name is shown, never the raw cardId', async () => {
    renderReveal();
    await revealAll();
    const body = screen.getByLabelText('card-reveal').textContent ?? '';
    expect(body).toContain('Deli');
    expect(body).not.toContain('00-fool');
    expect(body).not.toContain('02-high-priestess');
  });

  test('the third position label is "Yön", never "Gelecek" (anti-prophecy copy)', async () => {
    renderReveal();
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
    // The third open-button says Yön, not Gelecek.
    expect(screen.getByRole('button', { name: 'Yön kartını aç' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Yön kartını aç' }));
    expect(screen.getByLabelText('card-reveal').textContent ?? '').not.toMatch(/Gelecek/);
    // The INTERNAL position value is untouched - the input still says 'future'.
    expect(CARDS[2].position).toBe('future');
  });
});

describe('CardReveal — a11y and reduced motion', () => {
  test('focuses the reveal heading on mount', async () => {
    renderReveal();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Kartlarını kendi hızında aç' })).toHaveFocus());
  });

  test('one polite status region announces the most recent reveal', async () => {
    renderReveal();
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    expect(screen.getByRole('status')).toHaveTextContent('Geçmiş kartı açıldı (1/3)');
    await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
    expect(screen.getByRole('status')).toHaveTextContent('Şimdi kartı açıldı (2/3)');
  });

  test('reduced motion drops the opacity transition on revealed cards', async () => {
    renderReveal(vi.fn(), true);
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    expect(screen.getByLabelText('revealed-00-fool').className).not.toMatch(/transition-opacity/);
  });

  test('with motion enabled, revealed cards carry the opacity transition', async () => {
    renderReveal(vi.fn(), false);
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    expect(screen.getByLabelText('revealed-00-fool').className).toMatch(/transition-opacity/);
  });
});
