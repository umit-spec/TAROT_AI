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

const REGION_NAME = 'Kartlarını kendi hızında aç';

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
    expect(screen.queryByTestId('revealed-00-fool')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'İçgörüyü gör' })).not.toBeInTheDocument();
  });

  test('revealing advances exactly one card and a revealed card is no longer a button', async () => {
    renderReveal();
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));

    expect(screen.getByTestId('revealed-00-fool')).toBeInTheDocument();
    // The revealed card is not still an open-button.
    expect(screen.queryByRole('button', { name: 'Geçmiş kartını aç' })).not.toBeInTheDocument();
    // Only the next card is now openable.
    expect(screen.getByRole('button', { name: 'Şimdi kartını aç' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Yön kartını aç' })).not.toBeInTheDocument();
  });

  test('reveal order follows the response array order exactly', async () => {
    renderReveal();
    await revealAll();
    const revealedFaces = within(screen.getByTestId('reveal-list')).getAllByTestId(/^revealed-/);
    const ids = revealedFaces.map((el) => el.getAttribute('data-testid'));
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
    // Internal id preserved on the element (data-testid); the user sees the name.
    expect(screen.getByTestId('revealed-00-fool')).toHaveTextContent('Geçmiş');
    expect(screen.getByTestId('revealed-00-fool')).toHaveTextContent('Deli');
    expect(screen.getByTestId('revealed-02-high-priestess')).toHaveTextContent('Yön');
    expect(screen.getByTestId('revealed-02-high-priestess')).toHaveTextContent('Yüksek Rahibe');
  });

  test('the governed display name is shown, never the raw cardId', async () => {
    renderReveal();
    await revealAll();
    const body = screen.getByRole('region', { name: REGION_NAME }).textContent ?? '';
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
    expect(screen.getByRole('region', { name: REGION_NAME }).textContent ?? '').not.toMatch(/Gelecek/);
    // The INTERNAL position value is untouched - the input still says 'future'.
    expect(CARDS[2].position).toBe('future');
  });

  test('an unknown card id falls back to the neutral governed name, never the raw id', async () => {
    const unknown: DrawnCard[] = [
      { id: '99-nonexistent', position: 'past', orientation: 'upright' },
      { id: '01-magician', position: 'present', orientation: 'upright' },
      { id: '02-high-priestess', position: 'future', orientation: 'upright' },
    ];
    render(<CardReveal cards={unknown} reducedMotion={false} onContinue={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    const revealed = screen.getByTestId('revealed-99-nonexistent');
    expect(revealed).toHaveTextContent('Kart');
    expect(revealed.textContent ?? '').not.toContain('99-nonexistent');
  });
});

describe('CardReveal — locked cards cannot be skipped to or focused', () => {
  test('locked cards are aria-hidden, not buttons, and carry no card identity in the DOM', () => {
    renderReveal();
    // Only the current (first) card is a button; the other two are inert.
    expect(screen.getAllByRole('button', { name: /kartını aç/ })).toHaveLength(1);
    const list = screen.getByTestId('reveal-list');
    expect(list.textContent ?? '').not.toContain('01-magician');
    expect(list.textContent ?? '').not.toContain('02-high-priestess');
  });

  test('Tab from the current reveal button does not land on a locked card', async () => {
    renderReveal();
    const current = screen.getByRole('button', { name: 'Geçmiş kartını aç' });
    current.focus();
    await userEvent.tab();
    expect(screen.queryByRole('button', { name: 'Şimdi kartını aç' })).not.toBeInTheDocument();
    // Nothing named after a locked position is focused.
    expect(document.activeElement).not.toHaveAccessibleName('Şimdi kartını aç');
  });
});

describe('CardReveal — a11y, focus progression, and reduced motion', () => {
  test('focuses the reveal heading on mount', async () => {
    renderReveal();
    await waitFor(() => expect(screen.getByRole('heading', { name: REGION_NAME })).toHaveFocus());
  });

  test('the region accessible name is the visible heading, not a test-hook string', () => {
    renderReveal();
    expect(screen.getByRole('region', { name: REGION_NAME })).toHaveAttribute('data-testid', 'card-reveal');
  });

  test('the heading is tabIndex=-1 and never shows the interactive focus-visible ring', () => {
    renderReveal();
    const heading = screen.getByRole('heading', { name: REGION_NAME });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading.className).toMatch(/focus-visible:outline-none/);
  });

  test('after revealing the first card, focus moves to the next (Şimdi) reveal button', async () => {
    renderReveal();
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Şimdi kartını aç' })).toHaveFocus());
  });

  test('after revealing the third card, focus moves to the continue gate, not back to the body', async () => {
    renderReveal();
    await revealAll();
    await waitFor(() => expect(screen.getByRole('button', { name: 'İçgörüyü gör' })).toHaveFocus());
  });

  test('reveal buttons work with the keyboard (Enter)', async () => {
    const onContinue = renderReveal();
    screen.getByRole('button', { name: 'Geçmiş kartını aç' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByTestId('revealed-00-fool')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Şimdi kartını aç' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Enter}');
    expect(onContinue).not.toHaveBeenCalled(); // continue still requires its own activation
  });

  test('one polite, atomic status region announces position + governed name + real progress', async () => {
    renderReveal();
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveTextContent("Geçmiş kartı açıldı: Deli. 3 karttan 1'i açık.");
    await userEvent.click(screen.getByRole('button', { name: 'Şimdi kartını aç' }));
    expect(screen.getByRole('status')).toHaveTextContent("Şimdi kartı açıldı: Büyücü. 3 karttan 2'i açık.");
  });

  test('reduced motion drops the reveal animation class from the card face', async () => {
    renderReveal(vi.fn(), true);
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    const revealed = screen.getByTestId('revealed-00-fool');
    expect(revealed.querySelector('.card-artwork__reveal')).not.toBeInTheDocument();
  });

  test('with motion enabled, the revealed card face carries the reveal animation class', async () => {
    renderReveal(vi.fn(), false);
    await userEvent.click(screen.getByRole('button', { name: 'Geçmiş kartını aç' }));
    const revealed = screen.getByTestId('revealed-00-fool');
    expect(revealed.querySelector('.card-artwork__reveal')).toBeInTheDocument();
  });
});

describe('CardReveal — layout contract for future real artwork', () => {
  test('every card surface carries the 2:3 aspect-ratio contract', () => {
    const { container } = render(<CardReveal cards={CARDS} reducedMotion={false} onContinue={vi.fn()} />);
    const faces = container.querySelectorAll('.aspect-\\[2\\/3\\]');
    expect(faces.length).toBe(3);
  });

  test('the three positions render inside a three-column grid, DOM order matching visual order', () => {
    renderReveal();
    const list = screen.getByTestId('reveal-list');
    expect(list.className).toMatch(/grid-cols-3/);
    // Locked items are aria-hidden (correctly excluded from the a11y tree),
    // so this counts real DOM <li> elements, not accessible listitems.
    expect(list.querySelectorAll('li')).toHaveLength(3);
  });

  test('the current reveal button keeps a 44x44px minimum touch target', () => {
    renderReveal();
    const button = screen.getByRole('button', { name: 'Geçmiş kartını aç' });
    expect(button.className).toMatch(/min-h-\[44px\]/);
    expect(button.className).toMatch(/min-w-\[44px\]/);
  });

  test('no <img>, Next <Image>, or raster asset is rendered anywhere in the reveal', () => {
    const { container } = render(<CardReveal cards={CARDS} reducedMotion={false} onContinue={vi.fn()} />);
    expect(container.querySelectorAll('img').length).toBe(0);
  });
});
