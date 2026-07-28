'use client';

import { useId } from 'react';
import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface ErrorNoticeProps {
  userMessage: string;
  onRetry: () => void;
}

/**
 * Generic only - takes a user-safe message, never raw Zod issues or a stack
 * trace (docs/UI_PREMIUM_V1.md FAZ 8). The heading is fixed UI copy ("Bir
 * şeyler yolunda gitmedi"), not a prefix glued onto `userMessage` - the
 * governed message renders as its own paragraph, unmodified.
 */
export function ErrorNotice({ userMessage, onRetry }: ErrorNoticeProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = useId();

  return (
    <section
      role="alert"
      aria-labelledby={headingId}
      data-testid="error-state"
      className="rounded-[28px] border border-border-subtle bg-diagnostic-subtle p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Geçici bir aksaklık</p>
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="mt-2 font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
      >
        Bir şeyler yolunda gitmedi
      </h2>

      <p
        data-testid="error-message"
        className="mt-4 whitespace-pre-line break-words text-base text-foreground-secondary sm:text-lg"
      >
        {userMessage}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 min-h-[52px] w-full min-w-[44px] rounded-2xl bg-accent px-5 text-base font-medium text-background motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-[0.98] sm:w-auto"
      >
        Tekrar Dene
      </button>
    </section>
  );
}
