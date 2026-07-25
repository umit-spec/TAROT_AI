import { RESULT_DISCLAIMER_COPY } from '../lib/constitution-copy';

/**
 * Fixed copy, no props - the text never varies per render. Same principle
 * as InterpretationOutput.uncertaintyNotice (server-side): safety-critical
 * boilerplate must be deterministic, not something a component "decides"
 * how to phrase.
 */
export function DisclaimerFooter() {
  return (
    <footer aria-label="result-disclaimer" className="mt-6 border-t border-diagnostic-subtle pt-4 text-sm text-ink-muted">
      <p className="font-semibold">{RESULT_DISCLAIMER_COPY.heading}</p>
      <p>{RESULT_DISCLAIMER_COPY.body}</p>
      <p>{RESULT_DISCLAIMER_COPY.professionalNote}</p>
      <p>{RESULT_DISCLAIMER_COPY.autonomyNote}</p>
    </footer>
  );
}
