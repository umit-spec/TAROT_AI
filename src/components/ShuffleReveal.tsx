import { LoadingMark } from './LoadingMark';

export interface ShuffleRevealProps {
  isLoading: boolean;
  reducedMotion: boolean;
}

/**
 * Purely presentational + nothing else - has no access to card data at all
 * until the response arrives (it never computes which cards will appear;
 * that's the server's job). `reducedMotion` makes the transition instant,
 * per the wireframe's accessibility criterion. No card shape, silhouette,
 * or artwork appears here - that is FAZ 5's CardArtworkPlaceholder, not
 * this loading surface (docs/UI_PREMIUM_V1.md FAZ 4).
 */
export function ShuffleReveal({ isLoading, reducedMotion }: ShuffleRevealProps) {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
      data-testid="shuffle-loading"
      className={`mt-4 flex flex-col items-center gap-3 rounded-[28px] border border-border-subtle bg-surface-raised/60 p-8 text-center ${
        reducedMotion ? '' : 'transition-opacity duration-shuffle'
      }`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Okumaya hazırlanıyor</p>
      <LoadingMark reducedMotion={reducedMotion} />
      <p className="text-lg text-foreground">Kartlar karılıyor...</p>
      <p className="text-sm text-foreground-secondary">Üç kartlık sembolik düzen hazırlanıyor.</p>
    </div>
  );
}
