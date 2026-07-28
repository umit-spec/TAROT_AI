'use client';

import { useId } from 'react';
import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface ReflectionCloseProps {
  /** The governed reflection question (InterpretationOutput.reflectionPrompt).
   * Rendered verbatim; the client neither rewrites it, appends punctuation,
   * nor produces its own fallback. */
  reflectionPrompt: string;
  /** Neutral control to leave / start over. No save, share, upsell, or
   * "read again" nudge. */
  onRestart: () => void;
}

/**
 * The session's close (docs/UX_FLOW_V2.md §3.6, priority #5;
 * docs/UI_PREMIUM_V1.md FAZ 7). Shows exactly ONE governed reflection
 * question and nothing else that could turn a reflection into a product
 * loop - no save/share/journal/feedback, no second question, no
 * "read again" nudge on the restart control.
 *
 * It receives only `reflectionPrompt` — there is no prop for uncertaintyNotice,
 * provider, reflectionPromptSource, fallbackReason, confidence, safetyFlags,
 * or persona, so none of those can reach the screen (ADR-UX-REFLECTION-PROMPT
 * §10). The question is presented in a semantic paragraph, not an alert/live
 * region.
 */
export function ReflectionClose({ reflectionPrompt, onRestart }: ReflectionCloseProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = useId();

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      data-testid="reflection-close"
      className="mt-4 rounded-[28px] border border-border-subtle bg-surface-raised/60 p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Okumanın sonu</p>
      {/* Non-interactive: only receives programmatic focus-on-mount, so it
          must never show the interactive focus-visible ring (same fix as
          every other screen heading, docs/UI_PREMIUM_V1.md FAZ 2.1 §14.1). */}
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="mt-2 font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
      >
        Kendine bırakacağın soru
      </h2>

      <p
        data-testid="reflection-question"
        className="mt-6 whitespace-pre-line break-words rounded-2xl border-l-2 border-gold/60 bg-violet-deep/10 p-4 text-xl leading-[1.6] text-foreground sm:text-2xl sm:leading-[1.65]"
      >
        {reflectionPrompt}
      </p>

      <p className="mt-4 text-sm text-foreground-secondary">
        Yanıtlamak zorunda değilsin. Bu soruyu yanında taşıman yeterli.
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 min-h-[48px] w-full min-w-[44px] rounded-2xl border border-border-strong px-5 text-base text-foreground sm:w-auto"
      >
        Yeniden başla
      </button>
    </section>
  );
}
