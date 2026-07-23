'use client';

import { useEffect, useState } from 'react';
import type { ReadingResponse, CrisisResponse } from '../types/api';
import { ConsentModal } from '../components/ConsentModal';
import { QuestionForm } from '../components/QuestionForm';
import { ShuffleReveal } from '../components/ShuffleReveal';
import { ReadingResult } from '../components/ReadingResult';
import { CrisisNotice } from '../components/CrisisNotice';
import { ErrorNotice } from '../components/ErrorNotice';

// Sprint 4 UI Design Contract (docs/SPRINT_4_UI_DESIGN_CONTRACT_PLAN.md):
// this orchestrator owns ViewState and is the only place that calls
// fetch() - every component below receives data via props, none of them
// independently query the API.
type ViewState =
  | { status: 'consent' }
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ReadingResponse }
  | { status: 'crisis'; data: CrisisResponse }
  | { status: 'error'; message: string };

function randomSeed(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function HomePage() {
  const [state, setState] = useState<ViewState>({ status: 'consent' });
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  async function handleQuestionSubmit(input: { question: string; topicHint?: 'relationship' | 'career' | 'self' }) {
    setState({ status: 'loading' });

    try {
      const res = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seed: randomSeed(), question: input.question, topicHint: input.topicHint }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Bilinmeyen hata' });
        return;
      }
      if (data.status === 'crisis') {
        setState({ status: 'crisis', data: data as CrisisResponse });
        return;
      }
      setState({ status: 'success', data: data as ReadingResponse });
    } catch {
      setState({ status: 'error', message: 'Bağlantı hatası oluştu.' });
    }
  }

  function handleRetry() {
    setState({ status: 'idle' });
  }

  return (
    <main className="mx-auto max-w-2xl p-4 font-body text-ink-primary">
      <h1 className="font-heading text-2xl">Tarot AI</h1>

      {state.status === 'consent' && (
        <ConsentModal onAccept={() => setState({ status: 'idle' })} onDecline={() => setState({ status: 'idle' })} />
      )}

      {state.status !== 'consent' && (
        <>
          <QuestionForm onSubmit={handleQuestionSubmit} disabled={state.status === 'loading'} />
          <ShuffleReveal isLoading={state.status === 'loading'} reducedMotion={reducedMotion} />

          {state.status === 'crisis' && <CrisisNotice message={state.data.message} resources={state.data.resources} />}
          {state.status === 'error' && <ErrorNotice userMessage={state.message} onRetry={handleRetry} />}
          {state.status === 'success' && (
            <ReadingResult
              cards={state.data.cards}
              interpretation={state.data.interpretation}
              knowledgeMeta={state.data.knowledge.meta}
              providerUsed={state.data.provider}
              intakeContext={state.data.intakeContext}
            />
          )}
        </>
      )}
    </main>
  );
}
