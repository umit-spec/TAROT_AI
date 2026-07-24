'use client';

import { useEffect, useRef } from 'react';

/**
 * Moves keyboard/screen-reader focus to an element when it mounts, so a
 * screen transition (framing review, crisis, error) lands the user in the new
 * context instead of leaving focus behind on a now-unmounted control.
 *
 * The target should be a semantic heading with tabIndex={-1}: programmatically
 * focusable but NOT inserted into the normal tab order (so tab sequence is
 * unchanged and no focus trap is introduced).
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
