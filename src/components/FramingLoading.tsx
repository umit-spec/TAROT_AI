'use client';

import { LoadingMark } from './LoadingMark';

export interface FramingLoadingProps {
  reducedMotion: boolean;
}

/**
 * Shown directly under the still-visible, disabled QuestionForm while the
 * preview request is in flight (docs/UI_PREMIUM_V1.md FAZ 4). Renders for
 * exactly as long as the real request takes - no minimum delay, no
 * percentage, no fake stages. Carries no card data: it cannot, since it
 * receives nothing from the reading response.
 */
export function FramingLoading({ reducedMotion }: FramingLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
      data-testid="preview-loading"
      className="mt-4 w-full rounded-2xl border border-border-subtle bg-violet-deep/10 p-4"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Niyetin netleştiriliyor</p>
      <div className="mt-2 flex items-center gap-3">
        <LoadingMark reducedMotion={reducedMotion} />
        <p className="text-sm text-foreground">Sorun çerçeveleniyor...</p>
      </div>
      <p className="mt-1 text-xs text-foreground-secondary">Yazdıkların kısa bir yansıtma odağına dönüştürülüyor.</p>
    </div>
  );
}
