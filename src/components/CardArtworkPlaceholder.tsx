'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CARD_ARTWORK, CARD_BACK_ARTWORK, type CardId } from '../lib/tarot-card-artwork';

export type CardArtworkPlaceholderState = 'locked' | 'current' | 'revealed';

export interface CardArtworkPlaceholderProps {
  state: CardArtworkPlaceholderState;
  positionLabel: string;
  /** Only meaningful (and only rendered) once state === 'revealed'. */
  displayName?: string;
  /** Only meaningful (and only read) once state === 'revealed' - the
   * governed CardId whose face artwork to show. Never read for locked or
   * current cards, so a closed card's identity can never reach the DOM. */
  cardId?: CardId;
  reducedMotion: boolean;
}

/**
 * Governed card artwork (docs/UI_PREMIUM_V1.md FAZ 9, RC-2 §14/§19). Locked
 * and current cards always render the same constant card-back image
 * regardless of which card they actually are - `cardId` is read only when
 * `state === 'revealed'`, so a closed card's face path never reaches the
 * DOM and no face image is ever requested before the user opens it. The
 * 2:3 aspect ratio contract from the FAZ 5 CSS placeholder is unchanged.
 *
 * The neutral geometric shell is always the base layer, painted before any
 * `<Image>`. If the active image request fails (RC-2: was previously a
 * native broken-image icon), `onError` hides that `<Image>` and the shell
 * shows through instead - never another card's artwork, never an external
 * placeholder, never a retry loop. If `state === 'revealed'` but `cardId`
 * is missing or unresolvable in the registry, the shell is shown the same
 * way (no image was ever attempted).
 */
export function CardArtworkPlaceholder({ state, positionLabel, displayName, cardId, reducedMotion }: CardArtworkPlaceholderProps) {
  const revealedArtwork = state === 'revealed' && cardId ? CARD_ARTWORK[cardId] : undefined;
  const activeSrc = state === 'revealed' ? revealedArtwork?.src : CARD_BACK_ARTWORK.src;
  const [imageFailed, setImageFailed] = useState(false);
  const [trackedSrc, setTrackedSrc] = useState(activeSrc);

  // A different image is now the active one (state changed, or a different
  // card was revealed into this slot) - a prior failure doesn't carry over.
  // Adjusted during render (React's recommended pattern), not in an effect,
  // so it takes effect in the same render pass instead of triggering an
  // extra one.
  if (activeSrc !== trackedSrc) {
    setTrackedSrc(activeSrc);
    setImageFailed(false);
  }

  // The governed name stays visible whenever there's a real card to caption,
  // whether or not its image actually loaded.
  const showVisibleLabel = state === 'revealed' && Boolean(revealedArtwork) && Boolean(displayName);

  return (
    <div
      aria-hidden={state !== 'revealed'}
      title={positionLabel}
      className={`relative aspect-[2/3] w-full overflow-hidden rounded-xl border bg-gradient-to-b from-surface-interactive to-surface ${
        state === 'current'
          ? 'border-border-strong shadow-[0_0_0_1px_var(--color-border-strong),0_0_20px_-6px_rgba(208,164,92,0.45)]'
          : 'border-border-subtle'
      } ${state === 'locked' ? 'opacity-55' : ''} ${
        state === 'revealed' && !reducedMotion ? 'card-artwork__reveal' : ''
      }`}
    >
      {/* Neutral shell - always the base layer, underneath any image. */}
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-gold/70 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Eight-pointed star - the same neutral geometric mark every
              closed card has always used. */}
          <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" strokeLinejoin="round" />
        </svg>
      </div>

      {state !== 'revealed' && !imageFailed && (
        <Image
          src={CARD_BACK_ARTWORK.src}
          alt=""
          fill
          sizes="(max-width: 640px) 30vw, 220px"
          className="object-contain"
          onError={() => setImageFailed(true)}
        />
      )}

      {revealedArtwork && !imageFailed && (
        <Image
          src={revealedArtwork.src}
          alt={displayName ?? ''}
          fill
          sizes="(max-width: 640px) 30vw, 220px"
          className="object-contain"
          onError={() => setImageFailed(true)}
        />
      )}

      {showVisibleLabel && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent px-2 pb-2 pt-8">
          <span className="block break-words text-center font-heading text-[13px] leading-snug text-foreground sm:text-base">
            {displayName}
          </span>
        </div>
      )}

      {/* Defensive case: revealed with no resolvable cardId at all (no
          image was ever attempted, distinct from an image that failed to
          load) - the name is announced but not shown as a caption over an
          image that was never there. */}
      {state === 'revealed' && !revealedArtwork && displayName && (
        <span className="sr-only">{displayName}</span>
      )}
    </div>
  );
}
