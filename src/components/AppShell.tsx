import type { ReactNode } from 'react';
import { AmbientBackground } from './AmbientBackground';
import { BrandMark } from './BrandMark';

export interface AppShellProps {
  children: ReactNode;
}

/**
 * Page-level frame (docs/UI_PREMIUM_V1.md §4). Owns the atmosphere layer and
 * the quiet brand header; every screen state from page.tsx renders unchanged
 * inside the content column below. This component carries no state and
 * makes no fetch calls — src/app/page.tsx remains the sole orchestrator.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 sm:mb-12">
          <BrandMark />
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 font-body text-foreground">{children}</main>
      </div>
    </div>
  );
}
