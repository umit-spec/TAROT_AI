'use client';

import { useId } from 'react';
import type { FramingPreview } from '../types/api';
import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface FramingReviewProps {
  framing: FramingPreview;
  onConfirm: () => void;
  onEdit: () => void;
  disabled?: boolean;
}

/**
 * The framing-review screen (docs/UX_FLOW_V2.md §3.3, priority #2). Shows the
 * user ONLY the two safe strings the preview endpoint returned - the topic and
 * the angle of reflection - and asks them to confirm before any card is drawn.
 *
 * It receives a `FramingPreview` ({ topicLabel, reflectiveFocus }) and nothing
 * else: there is no prop here for persona, confidence, emotional intensity,
 * urgency, safety flags, or provider, so none of those can reach the screen
 * (docs/ADR-UX-FRAMING-PREVIEW.md R5, mirrored in the UI layer). "Düzenle"
 * does not edit the framing text - it returns to the question, and a new
 * preview is requested on the next continue (R10).
 *
 * FAZ 4 (docs/UI_PREMIUM_V1.md) is presentation-only on top of that same
 * guarantee: the region's accessible name is now the real heading text
 * (aria-labelledby) rather than the "framing-review" test-hook string that
 * used to double as aria-label - data-testid carries the test-hook role now.
 */
export function FramingReview({ framing, onConfirm, onEdit, disabled = false }: FramingReviewProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = useId();

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      data-testid="framing-review"
      className="mt-4 rounded-[28px] border border-border-subtle bg-surface-raised/60 p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Çerçeveyi doğrula</p>
      {/* Non-interactive: only receives programmatic focus-on-mount, so it
          must never show the interactive focus-visible ring (same fix as
          ConsentModal/QuestionForm, docs/UI_PREMIUM_V1.md FAZ 2.1 §14.1). */}
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="mt-2 font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
      >
        Seni doğru mu anladım?
      </h2>
      <p className="mt-2 text-sm text-foreground-secondary sm:text-base">
        Kartlar çekilmeden önce, seni nasıl anladığımıza birlikte bakalım.
      </p>

      <dl className="mt-6">
        <dt className="text-xs uppercase tracking-wide text-foreground-muted">Konun</dt>
        <dd className="mt-1 inline-block rounded-full border border-border-subtle bg-surface px-3 py-1 text-sm text-foreground">
          {framing.topicLabel}
        </dd>

        <dt className="mt-5 text-xs uppercase tracking-wide text-foreground-muted">Bakacağımız açı</dt>
        <dd className="mt-2 break-words rounded-2xl border-l-2 border-gold/60 bg-violet-deep/10 p-4 text-lg leading-relaxed text-foreground sm:text-xl">
          {framing.reflectiveFocus}
        </dd>
      </dl>

      <p className="mt-4 text-[13px] text-foreground-secondary">
        Bu bir teşhis değil; sadece hangi açıdan bakacağımızı netleştiriyoruz.
      </p>

      {/* DOM order and visual order match on every breakpoint (no reversal
          trick) - Confirm before Edit, everywhere (docs/UI_PREMIUM_V1.md
          FAZ 2.1 §14.3 explains why a mismatch here would be a bug). */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className="min-h-[52px] min-w-[44px] rounded-2xl bg-accent px-5 text-base font-medium text-background disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          Evet, böyle devam et
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="min-h-[44px] min-w-[44px] rounded-2xl border border-border-strong px-5 text-base text-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          Sorumu düzenle
        </button>
      </div>
    </section>
  );
}
