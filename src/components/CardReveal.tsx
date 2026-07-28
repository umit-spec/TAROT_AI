'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { DrawnCard } from '../types/reading';
import type { CardPositionKey } from '../types/card';
import { cardDisplayName } from '../lib/card-display';
import { useFocusOnMount } from '../lib/use-focus-on-mount';
import { CardArtworkPlaceholder } from './CardArtworkPlaceholder';

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
 * User-controlled card reveal (docs/UX_FLOW_V2.md §3.4, priority #3;
 * docs/UI_PREMIUM_V1.md FAZ 5). The cards are ALREADY resolved by the
 * server; this surface controls only the pace of showing them:
 *
 *  - Cards render in array order - there is no sort/reorder/redraw here; the
 *    index IS the order (extends ReadingResult's ADR-002/012 invariant).
 *  - Exactly one card - the next unrevealed one - can be opened at a time; a
 *    locked card is inert (not a button), so no card can be skipped.
 *  - The move to the interpretation is gated behind revealing all cards.
 *  - It shows the drawn card's position and identity only; it never authors a
 *    card meaning or symbol (that lives in the governed reading response).
 *  - No real card artwork exists anywhere in this component - only
 *    CardArtworkPlaceholder, a CSS shell (FAZ 9 adds real art, not this).
 */
export function CardReveal({ cards, reducedMotion, onContinue }: CardRevealProps) {
  const [revealed, setRevealed] = useState(0);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = useId();
  const currentButtonRef = useRef<HTMLButtonElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);
  const allRevealed = revealed >= cards.length;
  const lastRevealed = revealed > 0 ? cards[revealed - 1] : null;

  // Focus progression (docs/UI_PREMIUM_V1.md FAZ 5 §12): after the heading's
  // own focus-on-mount, each reveal moves focus to the next actionable
  // target - the next card's open button, or the continue gate once all
  // three are open - so a keyboard/screen-reader user is always told what
  // to do next without a card being auto-opened for them.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (allRevealed) continueRef.current?.focus();
    else currentButtonRef.current?.focus();
  }, [revealed, allRevealed]);

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      data-testid="card-reveal"
      className="mt-4 rounded-[28px] border border-border-subtle bg-surface-raised/60 p-6 sm:p-8"
    >
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
      >
        Kartlarını kendi hızında aç
      </h2>
      <p className="mt-2 text-sm text-foreground-secondary sm:text-base">
        Her kartı hazır olduğunuzda açın. Sonraki kart, önceki açıldıktan sonra erişilebilir olur.
      </p>

      {/* Real progress, not a game meter: exactly how many of the three the
          user has opened so far. */}
      <div className="mt-4 flex items-center gap-3">
        <div aria-hidden="true" className="flex gap-1.5">
          {cards.map((_, i) => (
            <span key={i} className={`h-1 w-6 rounded-full ${i < revealed ? 'bg-gold' : 'bg-border-subtle'}`} />
          ))}
        </div>
        <p className="text-xs text-foreground-muted">
          {revealed} / {cards.length} kart açıldı
        </p>
      </div>

      {/* One polite live region; a single, short announcement per reveal -
          governed display name + position + real progress, never a raw id
          or a card meaning. */}
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {lastRevealed
          ? `${POSITION_LABEL[lastRevealed.position]} kartı açıldı: ${cardDisplayName(lastRevealed.id)}. ${cards.length} karttan ${revealed}'i açık.`
          : ''}
      </p>

      <ol aria-label="Üç kartlık açılım" data-testid="reveal-list" className="mt-6 grid list-none grid-cols-3 gap-2 sm:gap-4">
        {cards.map((card, i) => {
          if (i < revealed) {
            return (
              <li key={card.id}>
                <div data-testid={`revealed-${card.id}`} className="flex flex-col items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted sm:text-xs">
                    {POSITION_LABEL[card.position]}
                  </p>
                  <CardArtworkPlaceholder
                    state="revealed"
                    positionLabel={POSITION_LABEL[card.position]}
                    displayName={cardDisplayName(card.id)}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </li>
            );
          }
          if (i === revealed) {
            return (
              <li key={card.id}>
                <button
                  ref={currentButtonRef}
                  type="button"
                  onClick={() => setRevealed((n) => n + 1)}
                  className="flex min-h-[44px] min-w-[44px] w-full flex-col items-center gap-2 rounded-xl"
                >
                  <CardArtworkPlaceholder state="current" positionLabel={POSITION_LABEL[card.position]} reducedMotion={reducedMotion} />
                  <span className="text-[11px] text-foreground sm:text-xs">{POSITION_LABEL[card.position]} kartını aç</span>
                </button>
              </li>
            );
          }
          // Locked: inert placeholder, not focusable, cannot be skipped to.
          return (
            <li key={card.id} aria-hidden="true">
              <div className="flex flex-col items-center gap-2">
                <CardArtworkPlaceholder state="locked" positionLabel={POSITION_LABEL[card.position]} reducedMotion={reducedMotion} />
                <p className="text-[11px] text-foreground-muted sm:text-xs">{POSITION_LABEL[card.position]}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {allRevealed && (
        <button
          ref={continueRef}
          type="button"
          onClick={onContinue}
          className="mt-6 min-h-[52px] w-full min-w-[44px] rounded-2xl bg-accent px-4 text-base font-medium text-background sm:w-auto"
        >
          İçgörüyü gör
        </button>
      )}
    </section>
  );
}
