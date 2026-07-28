'use client';

import { useId } from 'react';
import { RESULT_DISCLAIMER_COPY } from '../lib/constitution-copy';

/**
 * Fixed copy, no props - the text never varies per render. Same principle
 * as InterpretationOutput.uncertaintyNotice (server-side): safety-critical
 * boilerplate must be deterministic, not something a component "decides"
 * how to phrase. docs/UI_PREMIUM_V1.md FAZ 6: the four lines keep their
 * exact order and text; only presentation and the accessible-name wiring
 * changed (aria-labelledby to the real visible heading instead of a
 * test-hook aria-label).
 */
export function DisclaimerFooter() {
  const headingId = useId();

  return (
    <footer
      aria-labelledby={headingId}
      data-testid="result-disclaimer"
      className="mt-8 border-t border-border-subtle pt-6 text-sm text-foreground-secondary"
    >
      <p id={headingId} className="font-semibold text-foreground">
        {RESULT_DISCLAIMER_COPY.heading}
      </p>
      <p className="mt-2">{RESULT_DISCLAIMER_COPY.body}</p>
      <p className="mt-1">{RESULT_DISCLAIMER_COPY.professionalNote}</p>
      <p className="mt-1">{RESULT_DISCLAIMER_COPY.autonomyNote}</p>
    </footer>
  );
}
