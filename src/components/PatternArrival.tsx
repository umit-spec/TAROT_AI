'use client';

import { useId } from 'react';
import { useFocusOnMount } from '../lib/use-focus-on-mount';

export interface PatternArrivalProps {
  /** interpretation.opening — a short governed lead-in. */
  opening: string;
  /** interpretation.practicalReflection — the MAIN synthesis. Rendered
   * verbatim; the client never re-interprets or authors new meaning. */
  practicalReflection: string;
  /** interpretation.patterns — supporting cues only, never a declared
   * "main theme"; patterns[0] is not singled out as truth. */
  patterns: string[];
  /** interpretation.uncertaintyNotice — a boundary note, NOT a reflection
   * question (that is S-UX-5, a separate governed field). */
  uncertaintyNotice: string;
  /** Primary: close the session with the single reflection question, WITHOUT
   * requiring the user to open the card details. */
  onComplete: () => void;
  /** Secondary: open the optional per-card details. */
  onSeeDetails: () => void;
}

/**
 * The single cross-card arrival screen (docs/UX_FLOW_V2.md §3.5, priority #4;
 * docs/UI_PREMIUM_V1.md FAZ 6). Replaces the old "wall of text" as the FIRST
 * thing shown after the reveal.
 *
 * It only arranges governed output; it authors no new card meaning or
 * synthesis. Safe hierarchy (Product Owner decision): practicalReflection is
 * the main synthesis, patterns are supporting cues, uncertaintyNotice is a
 * boundary note. There is no prop for provider/confidence/safetyFlags/persona,
 * so no technical diagnostic can appear here.
 */
export function PatternArrival({
  opening,
  practicalReflection,
  patterns,
  uncertaintyNotice,
  onComplete,
  onSeeDetails,
}: PatternArrivalProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = useId();
  const hasPatterns = patterns.length > 0;

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      data-testid="pattern-arrival"
      className="mt-4 rounded-[28px] border border-border-subtle bg-surface-raised/60 p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Okumanın özeti</p>
      {/* Non-interactive: only receives programmatic focus-on-mount, so it
          must never show the interactive focus-visible ring (same fix as
          every other screen heading, docs/UI_PREMIUM_V1.md FAZ 2.1 §14.1). */}
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="mt-2 font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
      >
        Üç kartın birlikte gösterdiği örüntü
      </h2>

      {opening ? <p className="mt-3 text-sm text-foreground-secondary sm:text-base">{opening}</p> : null}

      <section className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Ana içgörü</p>
        <p
          data-testid="main-synthesis"
          className="mt-2 whitespace-pre-line break-words rounded-2xl border-l-2 border-gold/60 bg-violet-deep/10 p-4 text-lg leading-[1.6] text-foreground sm:text-xl sm:leading-[1.65]"
        >
          {practicalReflection}
        </p>
      </section>

      {hasPatterns ? (
        <section data-testid="supporting-cues" className="mt-6">
          <h3 className="font-heading text-base text-foreground">Destekleyen ipuçları</h3>
          <ul className="mt-2 space-y-1.5">
            {patterns.map((p) => (
              <li
                key={p}
                className="relative break-words pl-4 text-sm text-foreground-secondary before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-gold/70"
              >
                {p}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <aside
        data-testid="uncertainty-note"
        className="mt-6 rounded-xl border border-border-subtle bg-surface p-3 text-[13px] text-foreground-secondary"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">Sınır notu</p>
        <p className="mt-1 whitespace-pre-line break-words">{uncertaintyNotice}</p>
      </aside>

      {/* DOM order matches visual order on every breakpoint (no reversal
          trick) - Bir soruyla tamamla before Kartların ayrıntılarını gör,
          everywhere (docs/UI_PREMIUM_V1.md FAZ 2.1 §14.3). */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onComplete}
          className="min-h-[52px] min-w-[44px] rounded-2xl bg-accent px-5 text-base font-medium text-background sm:flex-none"
        >
          Bir soruyla tamamla
        </button>
        <button
          type="button"
          onClick={onSeeDetails}
          className="min-h-[44px] min-w-[44px] rounded-2xl border border-border-strong px-5 text-base text-foreground sm:flex-none"
        >
          Kartların ayrıntılarını gör
        </button>
      </div>
    </section>
  );
}
