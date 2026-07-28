'use client';

import { useId } from 'react';
import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface CrisisNoticeProps {
  message: string;
  resources: Array<{ label: string; contact: string }>;
}

/**
 * Structurally cannot receive tarot content - there is no `cards` or
 * `interpretation` field on this interface. If a future change tried to
 * pass reading data in, it would be a type error, not a rendering choice
 * someone has to remember to avoid (Sprint 4 UI Design Contract §5;
 * docs/UI_PREMIUM_V1.md FAZ 8).
 *
 * The heading is fixed UI copy ("Destek kaynakları"), not `message` itself -
 * this keeps the region's accessible name stable and semantic regardless of
 * what the governed message contains, and lets `message` render as an
 * ordinary paragraph instead of being squeezed into heading semantics.
 */
export function CrisisNotice({ message, resources }: CrisisNoticeProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = useId();

  return (
    <section
      role="alert"
      aria-labelledby={headingId}
      data-testid="crisis-resources"
      className="rounded-[28px] border border-crisis-accent/30 bg-crisis-surface p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-crisis-accent/80">Önce güvenlik</p>
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="mt-2 font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
      >
        Destek kaynakları
      </h2>

      <p
        data-testid="crisis-message"
        className="mt-4 whitespace-pre-line break-words text-lg leading-[1.6] text-foreground sm:text-xl"
      >
        {message}
      </p>

      {resources.length > 0 && (
        <div className="mt-6">
          <h3 className="font-heading text-base text-foreground">Şimdi ulaşabileceğin kaynaklar</h3>
          <ul data-testid="crisis-resource-list" className="mt-3 flex flex-col gap-2">
            {resources.map((r, i) => (
              <li
                key={i}
                className="min-h-[44px] rounded-2xl border border-crisis-accent/25 bg-surface-raised/40 px-4 py-3"
              >
                <span className="block text-sm text-foreground-secondary">{r.label}</span>
                <span className="block text-base font-medium text-foreground">{r.contact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
