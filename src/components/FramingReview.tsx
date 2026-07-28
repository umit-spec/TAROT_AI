'use client';

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
 */
export function FramingReview({ framing, onConfirm, onEdit, disabled = false }: FramingReviewProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  return (
    <section aria-label="framing-review" className="mt-4 rounded border p-4">
      <h2 ref={headingRef} tabIndex={-1} className="font-heading text-lg">
        Seni doğru mu anladım?
      </h2>

      <dl className="mt-3">
        <dt className="text-sm text-ink-muted">Konun</dt>
        <dd className="text-base">{framing.topicLabel}</dd>
        <dt className="mt-2 text-sm text-ink-muted">Bakacağımız açı</dt>
        <dd className="text-base">{framing.reflectiveFocus}</dd>
      </dl>

      <p className="mt-3 text-xs text-ink-muted">
        Bu bir teşhis değil; sadece hangi açıdan bakacağımızı netleştiriyoruz.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className="min-h-[44px] min-w-[44px] rounded bg-accent px-4 text-background disabled:opacity-40"
        >
          Evet, böyle devam et
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="min-h-[44px] min-w-[44px] rounded border px-4 disabled:opacity-40"
        >
          Sorumu düzenle
        </button>
      </div>
    </section>
  );
}
