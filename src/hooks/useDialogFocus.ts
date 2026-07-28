'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseDialogFocusOptions {
  /** Called on Escape - the caller decides what that means (e.g. decline). */
  onEscape: () => void;
}

/**
 * Modal dialog behavior shared by any true dialog in this app: Tab/Shift+Tab
 * stay inside the dialog, Escape calls back to the caller, and background
 * scroll is locked while the dialog is mounted and restored on unmount.
 * Small and purpose-built rather than a general focus-trap dependency -
 * ConsentModal is the only current caller, but the contract (a ref to attach
 * to the dialog container) is generic enough for a future dialog to reuse.
 *
 * Initial focus placement is left to the caller (e.g. useFocusOnMount on the
 * dialog's heading, matching every other screen transition in this app) -
 * this hook only constrains where Tab can go once something inside is
 * focused.
 */
export function useDialogFocus<T extends HTMLElement>({ onEscape }: UseDialogFocusOptions) {
  const containerRef = useRef<T>(null);
  const onEscapeRef = useRef(onEscape);

  // Keep the latest callback without re-running the trap/scroll-lock effect
  // below on every render (ref mutation belongs in an effect, not render).
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscapeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !container) return;

      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return containerRef;
}
