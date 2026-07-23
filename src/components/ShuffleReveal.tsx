export interface ShuffleRevealProps {
  isLoading: boolean;
  reducedMotion: boolean;
}

/**
 * Purely presentational + nothing else - has no access to card data at all
 * until the response arrives (it never computes which cards will appear;
 * that's the server's job). `reducedMotion` makes the transition instant,
 * per the wireframe's accessibility criterion.
 */
export function ShuffleReveal({ isLoading, reducedMotion }: ShuffleRevealProps) {
  if (!isLoading) return null;

  return (
    <div
      aria-label="shuffle-loading"
      role="status"
      className={`flex items-center justify-center p-8 ${reducedMotion ? '' : 'transition-opacity duration-shuffle'}`}
    >
      <p>Kartlar karılıyor...</p>
    </div>
  );
}
