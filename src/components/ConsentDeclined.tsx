'use client';

import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface ConsentDeclinedProps {
  /** Returns the user to the consent screen - NOT directly to compose.
   * There is no prop or path here that reaches compose, reading, or any
   * API call; declining is a real exit, not a soft skip. */
  onReconsider: () => void;
}

/**
 * Shown when the user declines consent (docs/UI_PREMIUM_V1.md FAZ 2). Fixes
 * the prior bug where onDecline silently routed to compose, letting a user
 * bypass the "Anlıyorum" checkbox by pressing "Çıkış". This screen has no
 * QuestionForm, no fetch, and no path into the reading flow other than going
 * back through consent and re-accepting.
 */
export function ConsentDeclined({ onReconsider }: ConsentDeclinedProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <section aria-label="consent-declined" className="mt-4 rounded-2xl border border-border-subtle bg-surface p-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-heading text-xl text-foreground">
        Bu deneyimi kullanmamayı seçtiniz.
      </h2>
      <p className="mt-3 text-sm text-foreground-muted">İstediğiniz zaman geri dönebilirsiniz.</p>
      <button
        type="button"
        onClick={onReconsider}
        className="mt-6 min-h-[44px] min-w-[44px] rounded-xl border border-border-strong px-4 text-foreground"
      >
        Kararımı değiştir
      </button>
    </section>
  );
}
