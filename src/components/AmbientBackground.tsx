/**
 * CSS-only atmosphere layer — no card art, no raster images, no WebGL
 * (docs/UI_PREMIUM_V1.md §6). Purely decorative: aria-hidden, fixed behind
 * all content, never intercepts pointer/keyboard interaction. The one
 * animated layer is a slow opacity/transform drift that is fully disabled
 * under prefers-reduced-motion via CSS (see globals.css), so no JS media-query
 * listener is needed here.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div
        className="ambient-background__glow absolute left-1/2 top-[-10%] h-[70vh] w-[70vh] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--color-accent-violet-deep) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] h-[55vh] w-[55vh] rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--color-accent-gold) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 55%, var(--color-background) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
