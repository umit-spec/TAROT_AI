'use client';

import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface CrisisNoticeProps {
  message: string;
  resources: Array<{ label: string; contact: string }>;
}

/**
 * Structurally cannot receive tarot content - there is no `cards` or
 * `interpretation` field on this interface. If a future change tried to
 * pass reading data in, it would be a type error, not a rendering choice
 * someone has to remember to avoid (Sprint 4 UI Design Contract §5).
 */
export function CrisisNotice({ message, resources }: CrisisNoticeProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  return (
    <section aria-label="crisis-resources" role="alert" className="rounded bg-crisis-surface p-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-semibold text-crisis-accent">
        {message}
      </h2>
      <ul className="mt-4 list-none">
        {resources.map((r) => (
          <li key={r.label} className="py-1">
            {r.label}: <strong>{r.contact}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
