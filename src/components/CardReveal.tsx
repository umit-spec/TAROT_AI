'use client';

import { useState } from 'react';
import type { DrawnCard } from '../types/reading';
import type { CardPositionKey } from '../types/card';
import { cardDisplayName } from '../lib/card-display';
import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface CardRevealProps {
  cards: DrawnCard[];
  reducedMotion: boolean;
  /** Called when the user, having revealed all cards at their own pace,
   * chooses to move on to the interpretation. */
  onContinue: () => void;
}

// Position names match CardNarrationItem so a position reads the same in the
// reveal and in the reading. These are POSITION labels, not predictions - the
// third position is "Yön" (a direction to consider), never "Gelecek" (an
// event foretold), per the anti-prophecy copy contract. The Reading Engine's
// internal position value stays 'future'; only this display label changes.
const POSITION_LABEL: Record<CardPositionKey, string> = {
  past: 'Geçmiş',
  present: 'Şimdi',
  future: 'Yön',
};

/**
 * User-controlled card reveal (docs/UX_FLOW_V2.md §3.4, priority #3). The
 * cards are ALREADY resolved by the server; this surface controls only the
 * pace of showing them:
 *
 *  - Cards render in array order - there is no sort/reorder/redraw here; the
 *    index IS the order (extends ReadingResult's ADR-002/012 invariant).
 *  - Exactly one card - the next unrevealed one - can be opened at a time; a
 *    locked card is inert (not a button), so no card can be skipped.
 *  - The move to the interpretation is gated behind revealing all cards.
 *  - It shows the drawn card's position and identity only; it never authors a
 *    card meaning or symbol (that lives in the governed reading response).
 */
export function CardReveal({ cards, reducedMotion, onContinue }: CardRevealProps) {
  const [revealed, setRevealed] = useState(0);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const allRevealed = revealed >= cards.length;
  const lastRevealed = revealed > 0 ? cards[revealed - 1] : null;

  return (
    <section aria-label="card-reveal">
      <h2 ref={headingRef} tabIndex={-1} className="font-heading text-lg">
        Kartlarını kendi hızında aç
      </h2>

      {/* One polite live region; a single, short announcement per reveal. */}
      <p role="status" className="sr-only">
        {lastRevealed
          ? `${POSITION_LABEL[lastRevealed.position]} kartı açıldı (${revealed}/${cards.length})`
          : ''}
      </p>

      <ol aria-label="reveal-list">
        {cards.map((card, i) => {
          if (i < revealed) {
            return (
              <li
                key={card.id}
                aria-label={`revealed-${card.id}`}
                className={`border-b border-diagnostic-subtle py-3 last:border-0 ${
                  reducedMotion ? '' : 'transition-opacity duration-shuffle'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {POSITION_LABEL[card.position]}
                </p>
                <p className="font-heading text-lg">{cardDisplayName(card.id)}</p>
              </li>
            );
          }
          if (i === revealed) {
            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => setRevealed((n) => n + 1)}
                  className="min-h-[44px] min-w-[44px] rounded border px-4"
                >
                  {POSITION_LABEL[card.position]} kartını aç
                </button>
              </li>
            );
          }
          // Locked: inert placeholder, not focusable, cannot be skipped to.
          return (
            <li key={card.id} aria-hidden="true">
              <div className="min-h-[44px] rounded border border-dashed opacity-40" />
            </li>
          );
        })}
      </ol>

      {allRevealed && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-4 min-h-[44px] min-w-[44px] rounded bg-accent px-4 text-white"
        >
          İçgörüyü gör
        </button>
      )}
    </section>
  );
}
