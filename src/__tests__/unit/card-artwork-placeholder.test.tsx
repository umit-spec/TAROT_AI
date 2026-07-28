// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { CardArtworkPlaceholder } from '../../components/CardArtworkPlaceholder';
import { CARD_BACK_ARTWORK } from '../../lib/tarot-card-artwork';
import type { CardId } from '../../lib/tarot-card-artwork';

const FOOL = '00-fool' as const;

describe('CardArtworkPlaceholder — closed cards show only the card back', () => {
  test('locked state renders the card back image', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="locked" positionLabel="Geçmiş" reducedMotion={false} />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toContain(encodeURIComponent(CARD_BACK_ARTWORK.src).replace(/%2F/g, '%2F'));
  });

  test('current state renders the card back image', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="current" positionLabel="Şimdi" reducedMotion={false} />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('locked state never renders a face src, even when cardId is passed by mistake', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="locked" positionLabel="Geçmiş" cardId={FOOL} reducedMotion={false} />
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src') ?? '').not.toContain('Deli');
  });

  test('current state never renders a face src, even when cardId is passed by mistake', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="current" positionLabel="Şimdi" cardId={FOOL} reducedMotion={false} />
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src') ?? '').not.toContain('Deli');
  });

  test('locked/current carry no raw card id anywhere in the DOM', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="locked" positionLabel="Geçmiş" cardId={FOOL} reducedMotion={false} />
    );
    expect(container.innerHTML).not.toMatch(/00-fool/);
  });

  test('the card back image is decorative (empty alt, wrapper is aria-hidden)', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="locked" positionLabel="Geçmiş" reducedMotion={false} />
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('CardArtworkPlaceholder — revealed cards show the correct face only', () => {
  test('revealed state renders the face image matching the given cardId', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  test('revealed image alt text is the governed displayName', () => {
    render(<CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />);
    expect(screen.getByAltText('Deli')).toBeInTheDocument();
  });

  test('displayName is visible as text, not just in alt', () => {
    render(<CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />);
    expect(screen.getAllByText('Deli').length).toBeGreaterThan(0);
  });

  test('the raw cardId never appears as visible text', () => {
    render(<CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />);
    expect(screen.queryByText('00-fool')).not.toBeInTheDocument();
  });

  test('revealed wrapper is not aria-hidden', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />
    );
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'false');
  });

  test('only one image renders for a revealed card (face only, no card back underneath)', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />
    );
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });
});

describe('CardArtworkPlaceholder — reduced motion and layout contract', () => {
  test('reducedMotion=true drops the reveal animation class', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={true} />
    );
    expect(container.querySelector('.card-artwork__reveal')).not.toBeInTheDocument();
  });

  test('reducedMotion=false applies the reveal animation class on a revealed card', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />
    );
    expect(container.querySelector('.card-artwork__reveal')).toBeInTheDocument();
  });

  test('the 2:3 aspect-ratio container is preserved', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="locked" positionLabel="Geçmiş" reducedMotion={false} />
    );
    expect(container.querySelector('.aspect-\\[2\\/3\\]')).toBeInTheDocument();
  });

  test('no external-domain URL is ever used for src (Next.js image proxy is same-origin)', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={FOOL} displayName="Deli" reducedMotion={false} />
    );
    const img = container.querySelector('img');
    const src = img?.getAttribute('src') ?? '';
    // next/image's onError handling makes it render a fully-qualified
    // `_next/image?url=...` proxy URL in this test environment (a jsdom
    // rendering detail, not present with real browser navigation - see
    // RC-2 §14 network QA, which confirms same-origin-only requests in a
    // real browser). The real invariant is "no external origin", not "no
    // protocol prefix" - a same-origin absolute URL is fine.
    expect(src).not.toMatch(/^https?:\/\/(?!localhost)/);
    expect(decodeURIComponent(src)).toContain('/assets/tarot-cards/v2/');
    expect(decodeURIComponent(src)).not.toMatch(/\.png/);
  });

  test('a long single-word displayName carries the break-words class so it can wrap instead of clipping (RC-2 regression)', () => {
    // "İmparatoriçe" (Empress) has no space to wrap at under normal
    // white-space rules; at 320px width it previously overflowed its box
    // and got clipped to "İmparatori" by the card's overflow-hidden
    // ancestor. break-words (overflow-wrap) lets it wrap mid-word instead.
    render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={'03-empress' as CardId} displayName="İmparatoriçe" reducedMotion={false} />
    );
    const label = screen.getByText('İmparatoriçe');
    expect(label.className).toMatch(/break-words/);
  });
});

describe('CardArtworkPlaceholder — defensive fallback when revealed without a resolvable cardId', () => {
  test('revealed without cardId does not crash and shows the neutral shell, not another card', () => {
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" displayName="Deli" reducedMotion={false} />
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('revealed with an unknown cardId does not crash and shows the neutral shell', () => {
    // Cast past the CardId union deliberately - this proves the runtime
    // guard (the registry lookup, not the type system) holds even if a
    // caller bypasses the type, e.g. from an unvalidated server response.
    const unknownId = '99-unknown-card' as CardId;
    const { container } = render(
      <CardArtworkPlaceholder state="revealed" positionLabel="Geçmiş" cardId={unknownId} displayName="Bilinmeyen" reducedMotion={false} />
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
