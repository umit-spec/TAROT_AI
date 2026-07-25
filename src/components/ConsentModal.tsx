'use client';

import { useState } from 'react';
import { CONSENT_MODAL_COPY } from '../lib/constitution-copy';

export interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

/** Static content only - text is the Ethical Constitution's exact modal copy, not paraphrased. */
export function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div role="dialog" aria-modal="true" aria-label="consent-modal" className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="max-w-md rounded bg-surface-raised p-6">
        <h2 className="font-heading text-xl">{CONSENT_MODAL_COPY.title}</h2>
        <p className="mt-2">{CONSENT_MODAL_COPY.intro}</p>

        <p className="mt-4 font-semibold">{CONSENT_MODAL_COPY.notDoneHeading}</p>
        <ul className="list-inside list-disc">
          {CONSENT_MODAL_COPY.notDone.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="mt-4 font-semibold">{CONSENT_MODAL_COPY.howToUseHeading}</p>
        <ul className="list-inside list-disc">
          {CONSENT_MODAL_COPY.howToUse.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <label className="mt-4 flex min-h-[44px] items-center gap-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            aria-label={CONSENT_MODAL_COPY.checkboxLabel}
          />
          {CONSENT_MODAL_COPY.checkboxLabel}
        </label>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onAccept}
            disabled={!checked}
            className="min-h-[44px] min-w-[44px] rounded bg-accent px-4 text-white disabled:opacity-40"
          >
            {CONSENT_MODAL_COPY.acceptLabel}
          </button>
          <button type="button" onClick={onDecline} className="min-h-[44px] min-w-[44px] rounded border px-4">
            {CONSENT_MODAL_COPY.declineLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
