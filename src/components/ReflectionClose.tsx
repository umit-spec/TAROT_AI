'use client';

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
 * The session's close (docs/UX_FLOW_V2.md §3.6, priority #5). Shows exactly
 * ONE governed reflection question and nothing else that could turn a
 * reflection into a product loop.
 *
 * It receives only `reflectionPrompt` — there is no prop for uncertaintyNotice,
 * provider, reflectionPromptSource, fallbackReason, confidence, safetyFlags,
 * or persona, so none of those can reach the screen (ADR-UX-REFLECTION-PROMPT
 * §10). The question is presented in a semantic paragraph, not an alert/live
 * region.
 */
export function ReflectionClose({ reflectionPrompt, onRestart }: ReflectionCloseProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <section aria-label="reflection-close" className="mt-4">
      <h2 ref={headingRef} tabIndex={-1} className="font-heading text-xl">
        Kendine bırakacağın soru
      </h2>

      <p aria-label="reflection-question" className="mt-3 text-lg">
        {reflectionPrompt}
      </p>

      <p className="mt-4 text-sm text-ink-muted">
        Yanıtlamak zorunda değilsin. Bu soruyu yanında taşıman yeterli.
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 min-h-[44px] min-w-[44px] rounded border px-4"
      >
        Yeniden başla
      </button>
    </section>
  );
}
