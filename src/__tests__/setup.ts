import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia - polyfill so components/tests that
// check prefers-reduced-motion (etc.) don't crash. Defaults to "no match";
// tests that need a specific match override this per-test.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
