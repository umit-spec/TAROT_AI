export type CardArtworkPlaceholderState = 'locked' | 'current' | 'revealed';

export interface CardArtworkPlaceholderProps {
  state: CardArtworkPlaceholderState;
  positionLabel: string;
  /** Only meaningful (and only rendered) once state === 'revealed'. */
  displayName?: string;
  reducedMotion: boolean;
}

/**
 * A CSS-only, deliberately abstract card-shaped surface - NOT tarot
 * artwork (docs/UI_PREMIUM_V1.md FAZ 5 §3). Every closed card (locked or
 * current) renders identically regardless of which card it actually is -
 * nothing here reveals a card's identity before the user opens it, and
 * this will never grow real illustration, a suit symbol, or anything that
 * could be mistaken for a shipped tarot deck. Real card artwork is FAZ 9,
 * out of scope until separately approved. The 2:3 aspect ratio is the
 * contract that real artwork will later drop into unchanged.
 */
export function CardArtworkPlaceholder({ state, positionLabel, displayName, reducedMotion }: CardArtworkPlaceholderProps) {
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
      {/* Inner border ring - one of the few allowed decorative details. */}
      <div className="pointer-events-none absolute inset-[6%] rounded-lg border border-border-subtle/70" />

      {/* Low-opacity ambient glow, static (no pulse/spin). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 38%, rgba(208,164,92,0.16), transparent 65%)' }}
      />

      {/* Small top/bottom decorative lines. */}
      <div className="pointer-events-none absolute left-1/2 top-[9%] h-px w-6 -translate-x-1/2 bg-border-strong/60" />
      <div className="pointer-events-none absolute bottom-[9%] left-1/2 h-px w-6 -translate-x-1/2 bg-border-strong/60" />

      <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
        {state === 'revealed' ? (
          <span className="font-heading text-[13px] leading-snug text-foreground sm:text-base">{displayName}</span>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-gold/70 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Eight-pointed star - a neutral geometric mark, not a suit symbol. */}
            <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
