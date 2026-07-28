export interface LoadingMarkProps {
  reducedMotion: boolean;
}

/**
 * Three-dot abstract loading mark shared by FramingLoading and
 * ShuffleReveal (docs/UI_PREMIUM_V1.md FAZ 4) - purely decorative
 * (aria-hidden), holds no data, computes nothing. It is not a card shape or
 * silhouette and never will be; the caller's own role="status" text is what
 * a screen reader actually announces, this is only for sighted users.
 */
export function LoadingMark({ reducedMotion }: LoadingMarkProps) {
  return (
    <div aria-hidden="true" className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full bg-gold ${reducedMotion ? 'opacity-70' : 'loading-mark__dot'}`}
          style={reducedMotion ? undefined : { animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  );
}
