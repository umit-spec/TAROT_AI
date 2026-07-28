export type DiagnosticBadgeKind = 'knowledge-partial' | 'knowledge-fallback' | 'narration-fallback';

/**
 * Takes an enum, not a free string, so copy can't drift per call site
 * (Sprint 4 UI Design Contract §5). Deliberately low-alarm styling -
 * these are visibility requirements, not error states (§4 Response-State
 * Matrix: knowledge partial/fallback and narration fallback are never
 * treated as errors). The caller (ReadingResult) is responsible for the
 * surrounding "Okuma durumu" panel; this component only renders its own
 * fixed line of text - no provider name, no "mock" string, no confidence,
 * no raw status ever appears here (docs/UI_PREMIUM_V1.md FAZ 6 §13).
 */
const COPY: Record<DiagnosticBadgeKind, string> = {
  'knowledge-partial': 'Bağlam bilgisi bu okuma için kısmi.',
  'knowledge-fallback': 'Bağlam kaynağına şu an ulaşılamadı.',
  'narration-fallback': 'Bu okuma yedek modda üretildi.',
};

export function DiagnosticBadge({ kind }: { kind: DiagnosticBadgeKind }) {
  return (
    <p data-testid={`diagnostic-${kind}`} className="text-[13px] text-foreground-secondary">
      {COPY[kind]}
    </p>
  );
}
