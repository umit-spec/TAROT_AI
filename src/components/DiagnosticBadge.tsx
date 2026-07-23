export type DiagnosticBadgeKind = 'knowledge-partial' | 'knowledge-fallback' | 'narration-fallback';

/**
 * Takes an enum, not a free string, so copy can't drift per call site
 * (Sprint 4 UI Design Contract §5). Deliberately low-alarm styling -
 * these are visibility requirements, not error states (§4 Response-State
 * Matrix: knowledge partial/fallback and narration fallback are never
 * treated as errors).
 */
const COPY: Record<DiagnosticBadgeKind, string> = {
  'knowledge-partial': 'Bağlam bilgisi bu okuma için kısmi.',
  'knowledge-fallback': 'Bağlam kaynağına şu an ulaşılamadı.',
  'narration-fallback': 'Bu okuma yedek modda üretildi.',
};

export function DiagnosticBadge({ kind }: { kind: DiagnosticBadgeKind }) {
  return (
    <p aria-label={`diagnostic-${kind}`} className="mt-2 rounded bg-diagnostic-subtle px-2 py-1 text-xs text-diagnostic-subtleText">
      {COPY[kind]}
    </p>
  );
}
