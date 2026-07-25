import type { Config } from 'tailwindcss';

// Sprint 4 UI Design Contract §6: structure and naming only, not a
// production visual identity. Every color below is a neutral/grayscale
// placeholder pending an actual Canva/Figma design lock - deliberately
// inert so nobody mistakes these for approved brand colors.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'], // docs/MVP_PLAN_REVISED.md Aşama 3, already locked
        body: ['Inter', 'sans-serif'], // Aşama 3, already locked
      },
      colors: {
        surface: { base: '#fafafa', raised: '#ffffff' },
        ink: { primary: '#1a1a1a', muted: '#6b6b6b' },
        accent: { DEFAULT: '#4a4a4a' },
        diagnostic: { subtle: '#e8e8e8', subtleText: '#555555' },
        crisis: { surface: '#fff5f5', accent: '#8b3a3a' },
      },
      transitionDuration: {
        shuffle: '280ms', // Aşama 3: animation principle "<300ms"
        reveal: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
