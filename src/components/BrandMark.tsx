/**
 * Quiet, non-interactive product mark. Name change (docs/UI_PREMIUM_V1.md §1):
 * "Insight Engine" replaces the bare "Tarot AI" heading text; existing
 * behavior, routes, and API names are untouched — this is copy/branding only.
 */
export function BrandMark() {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h1 className="font-heading text-2xl tracking-wide text-foreground sm:text-3xl">Insight Engine</h1>
      <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted sm:text-sm">
        Sembolik yansıtma deneyimi
      </p>
    </div>
  );
}
