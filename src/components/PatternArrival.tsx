'use client';

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
 * The single cross-card arrival screen (docs/UX_FLOW_V2.md §3.5, priority #4).
 * Replaces the old "wall of text" as the FIRST thing shown after the reveal.
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
  const hasPatterns = patterns.length > 0;

  return (
    <section aria-label="pattern-arrival" className="mt-4">
      <h2 ref={headingRef} tabIndex={-1} className="font-heading text-xl">
        Üç kartın birlikte gösterdiği örüntü
      </h2>

      {opening ? <p className="mt-2 text-ink-muted">{opening}</p> : null}

      <p aria-label="main-synthesis" className="mt-3 text-lg">
        {practicalReflection}
      </p>

      {hasPatterns ? (
        <section aria-label="supporting-cues" className="mt-4">
          <h3 className="font-heading text-base">Destekleyen ipuçları</h3>
          <ul className="mt-1 list-inside list-disc text-sm">
            {patterns.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p aria-label="uncertainty-note" className="mt-4 text-sm italic text-ink-muted">
        {uncertaintyNotice}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onComplete}
          className="min-h-[44px] min-w-[44px] rounded bg-accent px-4 text-background"
        >
          Bir soruyla tamamla
        </button>
        <button
          type="button"
          onClick={onSeeDetails}
          className="min-h-[44px] min-w-[44px] rounded border px-4"
        >
          Kartların ayrıntılarını gör
        </button>
      </div>
    </section>
  );
}
