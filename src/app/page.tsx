'use client';

import { useEffect, useState } from 'react';
import type { ReadingResponse, CrisisResponse, FramingPreview } from '../types/api';
import { ConsentModal } from '../components/ConsentModal';
import { QuestionForm } from '../components/QuestionForm';
import { FramingReview } from '../components/FramingReview';
import { ShuffleReveal } from '../components/ShuffleReveal';
import { CardReveal } from '../components/CardReveal';
import { PatternArrival } from '../components/PatternArrival';
import { ReadingResult } from '../components/ReadingResult';
import { CrisisNotice } from '../components/CrisisNotice';
import { ErrorNotice } from '../components/ErrorNotice';

type TopicHint = 'relationship' | 'career' | 'self';
type Pending = { question: string; topicHint?: TopicHint };

// Sprint 4 UI Design Contract + UX_FLOW_V2 §2: this orchestrator owns the
// screen state and is the ONLY place that calls fetch() - both the framing
// preview and the reading go through here, every component below receives
// data via props. The flow is:
//   compose -> previewing -> (crisis | framing | error)
//   framing --confirm--> reading -> (success | crisis | error)
//   framing --edit--> compose (prior input preserved)
type ViewState =
  | { status: 'consent' }
  | { status: 'compose'; initial?: Pending }
  | { status: 'previewing' }
  | { status: 'framing'; framing: FramingPreview; pending: Pending }
  | { status: 'reading' }
  | { status: 'revealing'; data: ReadingResponse }
  | { status: 'pattern'; data: ReadingResponse }
  | { status: 'success'; data: ReadingResponse }
  | { status: 'crisis'; data: CrisisResponse }
  | { status: 'error'; message: string; initial?: Pending };

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

  // Step 1: the question is framed (preview only). No card is drawn here.
  async function handleCompose(input: Pending) {
    setState({ status: 'previewing' });
    try {
      const res = await fetch('/api/readings/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: input.question, topicHint: input.topicHint }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Bilinmeyen hata', initial: input });
        return;
      }
      if (data.status === 'crisis') {
        setState({ status: 'crisis', data: data as CrisisResponse });
        return;
      }
      setState({ status: 'framing', framing: (data as { framing: FramingPreview }).framing, pending: input });
    } catch {
      setState({ status: 'error', message: 'Bağlantı hatası oluştu.', initial: input });
    }
  }

  // Step 2: the user confirmed the framing - now the reading is drawn.
  async function handleConfirm(pending: Pending) {
    setState({ status: 'reading' });
    try {
      const res = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seed: randomSeed(), question: pending.question, topicHint: pending.topicHint }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Bilinmeyen hata', initial: pending });
        return;
      }
      if (data.status === 'crisis') {
        setState({ status: 'crisis', data: data as CrisisResponse });
        return;
      }
      // The cards are resolved, but the interpretation is NOT shown yet - the
      // user reveals the cards at their own pace first (UX_FLOW_V2 §3.4).
      setState({ status: 'revealing', data: data as ReadingResponse });
    } catch {
      setState({ status: 'error', message: 'Bağlantı hatası oluştu.', initial: pending });
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-4 font-body text-ink-primary">
      <h1 className="font-heading text-2xl">Tarot AI</h1>

      {state.status === 'consent' && (
        <ConsentModal
          onAccept={() => setState({ status: 'compose' })}
          onDecline={() => setState({ status: 'compose' })}
        />
      )}

      {(state.status === 'compose' || state.status === 'previewing') && (
        <QuestionForm
          onSubmit={handleCompose}
          disabled={state.status === 'previewing'}
          initialQuestion={state.status === 'compose' ? state.initial?.question : undefined}
          initialTopicHint={state.status === 'compose' ? state.initial?.topicHint : undefined}
          autoFocus={state.status === 'compose' && state.initial !== undefined}
        />
      )}

      {state.status === 'previewing' && (
        <p role="status" aria-label="preview-loading" className="mt-4 text-sm text-ink-muted">
          Sorun çerçeveleniyor...
        </p>
      )}

      {state.status === 'framing' && (
        <FramingReview
          framing={state.framing}
          onConfirm={() => handleConfirm(state.pending)}
          onEdit={() => setState({ status: 'compose', initial: state.pending })}
        />
      )}

      {state.status === 'reading' && <ShuffleReveal isLoading reducedMotion={reducedMotion} />}

      {state.status === 'revealing' && (
        <CardReveal
          cards={state.data.cards}
          reducedMotion={reducedMotion}
          onContinue={() => setState({ status: 'pattern', data: state.data })}
        />
      )}

      {state.status === 'pattern' && (
        <PatternArrival
          opening={state.data.interpretation.opening}
          practicalReflection={state.data.interpretation.practicalReflection}
          patterns={state.data.interpretation.patterns}
          uncertaintyNotice={state.data.interpretation.uncertaintyNotice}
          onSeeDetails={() => setState({ status: 'success', data: state.data })}
        />
      )}

      {state.status === 'crisis' && <CrisisNotice message={state.data.message} resources={state.data.resources} />}

      {state.status === 'error' && (
        <ErrorNotice
          userMessage={state.message}
          onRetry={() => setState({ status: 'compose', initial: state.initial })}
        />
      )}

      {state.status === 'success' && (
        <ReadingResult
          cards={state.data.cards}
          interpretation={state.data.interpretation}
          knowledgeMeta={state.data.knowledge.meta}
          providerUsed={state.data.provider}
          intakeContext={state.data.intakeContext}
        />
      )}
    </main>
  );
}
