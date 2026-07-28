import type { Config } from 'tailwindcss';

// docs/UI_PREMIUM_V1.md §3: premium token values, sourced from CSS custom
// properties in globals.css (single source of truth). Semantic names below
// that already existed under the Sprint 4 grayscale placeholder
// (surface.base/raised, ink.primary/muted, accent, diagnostic.*, crisis.*)
// keep their exact names so every existing component inherits the new
// palette with zero markup changes. New names (background, surface-raised,
// foreground, accent-gold, accent-violet, border-subtle/strong, focus) are
// additive, for the new shell primitives only.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Values come from next/font's generated CSS variables (src/app/layout.tsx),
        // which self-host Playfair Display / Inter at build time.
        heading: ['var(--font-heading)', '"Playfair Display"', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      colors: {
        // Existing semantic names — values updated to the premium palette.
        surface: {
          base: 'var(--color-background)',
          raised: 'var(--color-surface-raised)',
        },
        ink: {
          primary: 'var(--color-foreground)',
          muted: 'var(--color-foreground-muted)',
        },
        accent: { DEFAULT: 'var(--color-accent-gold)' },
        diagnostic: {
          subtle: 'var(--color-surface-interactive)',
          subtleText: 'var(--color-foreground-secondary)',
        },
        crisis: {
          surface: 'var(--color-crisis-surface)',
          accent: 'var(--color-crisis-accent)',
        },

        // New additive tokens for AppShell / future premium primitives.
        background: {
          DEFAULT: 'var(--color-background)',
          elevated: 'var(--color-background-elevated)',
        },
        'surface-interactive': 'var(--color-surface-interactive)',
        foreground: {
          DEFAULT: 'var(--color-foreground)',
          secondary: 'var(--color-foreground-secondary)',
          muted: 'var(--color-foreground-muted)',
        },
        gold: {
          DEFAULT: 'var(--color-accent-gold)',
          soft: 'var(--color-accent-gold-soft)',
        },
        violet: {
          DEFAULT: 'var(--color-accent-violet)',
          deep: 'var(--color-accent-violet-deep)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
        },
        focus: 'var(--color-focus)',
      },
      transitionDuration: {
        shuffle: '280ms',
        reveal: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
