'use client';

import { useId, useState } from 'react';
import { CONSENT_MODAL_COPY } from '../lib/constitution-copy';
import { useFocusOnMount } from '../lib/use-focus-on-mount';
import { useDialogFocus } from '../hooks/useDialogFocus';

export interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Static content only - CONSENT_MODAL_COPY text is the Ethical
 * Constitution's exact modal copy, not paraphrased (docs/UI_PREMIUM_V1.md
 * FAZ 2 §4). Only presentation changed in FAZ 2: layout, focus trap,
 * Escape-to-decline, scroll lock, and premium styling.
 */
export function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const containerRef = useDialogFocus<HTMLDivElement>({ onEscape: onDecline });
  const headingId = useId();
  const introId = useId();
  const checkboxId = useId();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={introId}
        data-testid="consent-modal"
        className="consent-modal__panel max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-border-subtle bg-surface-raised p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Başlamadan önce</p>

        {/* Non-interactive: only receives programmatic focus-on-mount so
            screen readers land here, so it must never show the interactive
            focus-visible ring - that reads as a form control, not a heading. */}
        <h2
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="mt-2 font-heading text-xl text-foreground focus-visible:outline-none sm:text-2xl"
        >
          {CONSENT_MODAL_COPY.title}
        </h2>
        <p id={introId} className="mt-3 text-sm text-foreground-secondary sm:text-base">
          {CONSENT_MODAL_COPY.intro}
        </p>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          {CONSENT_MODAL_COPY.notDoneHeading}
        </p>
        <ul className="mt-2 space-y-1.5">
          {CONSENT_MODAL_COPY.notDone.map((item) => (
            <li
              key={item}
              className="relative pl-4 text-sm text-foreground-secondary before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-gold/70"
            >
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          {CONSENT_MODAL_COPY.howToUseHeading}
        </p>
        <ul className="mt-2 space-y-1.5">
          {CONSENT_MODAL_COPY.howToUse.map((item) => (
            <li
              key={item}
              className="relative pl-4 text-sm text-foreground-secondary before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-violet/70"
            >
              {item}
            </li>
          ))}
        </ul>

        <label
          htmlFor={checkboxId}
          className="mt-6 flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-border-subtle px-3 py-2"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            aria-label={CONSENT_MODAL_COPY.checkboxLabel}
            className="h-5 w-5 shrink-0 accent-[var(--color-accent-gold)]"
          />
          <span className="text-sm text-foreground">{CONSENT_MODAL_COPY.checkboxLabel}</span>
        </label>

        {/* DOM order is Accept-then-Decline and intentionally matches the
            visual order on every breakpoint (no flex-*-reverse trick) - Tab
            order must match reading/visual order (WCAG 2.4.3), and a CSS
            reversal here previously made Tab visit Decline before the Accept
            it was visually below. */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onAccept}
            disabled={!checked}
            className={`min-h-[44px] min-w-[44px] rounded-xl px-5 text-sm font-medium sm:flex-none ${
              checked
                ? 'bg-gold text-background'
                : 'cursor-not-allowed border border-border-subtle bg-surface-interactive text-foreground-muted'
            }`}
          >
            {CONSENT_MODAL_COPY.acceptLabel}
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="min-h-[44px] min-w-[44px] rounded-xl border border-border-strong px-5 text-sm text-foreground sm:flex-none"
          >
            {CONSENT_MODAL_COPY.declineLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
