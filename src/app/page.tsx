'use client';

import { useState } from 'react';
import type { ReadingResponse, CrisisResponse } from '../types/api';

// Functional shell only - per Sprint 3 plan, no design system, no visual
// polish until a Canva/Figma prototype is locked. This exists to prove the
// wiring (question -> submit -> 3 cards -> structured interpretation ->
// error/fallback/crisis state), not to look like the product.
type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ReadingResponse }
  | { status: 'crisis'; data: CrisisResponse }
  | { status: 'error'; message: string };

function randomSeed(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function HomePage() {
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<ViewState>({ status: 'idle' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: 'loading' });

    try {
      const res = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seed: randomSeed(), question }),
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

  return (
    <main>
      <h1>Tarot AI</h1>
      <p>Foundation &amp; Executable Core — functional shell, tasarım henüz kilitlenmedi.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="question">Sorunuz</label>
        <br />
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          cols={50}
        />
        <br />
        <button type="submit" disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Okuma hazırlanıyor...' : 'Kartları Çek'}
        </button>
      </form>

      {state.status === 'crisis' && (
        <section aria-label="crisis-resources">
          <p>{state.data.message}</p>
          <ul>
            {state.data.resources.map((r) => (
              <li key={r.label}>
                {r.label}: {r.contact}
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.status === 'error' && (
        <section aria-label="error-state">
          <p>Bir hata oluştu: {state.message}</p>
        </section>
      )}

      {state.status === 'success' && (
        <section aria-label="reading-result">
          <p>{state.data.interpretation.opening}</p>
          <ol>
            {state.data.cards.map((card, i) => (
              <li key={card.id}>
                <strong>{card.position}:</strong> {card.id} ({card.orientation})
                <p>{state.data.interpretation.cards[i]?.relevanceToQuestion}</p>
              </li>
            ))}
          </ol>
          <p>{state.data.interpretation.practicalReflection}</p>
          <p>
            <em>{state.data.interpretation.uncertaintyNotice}</em>
          </p>
          {state.data.provider === 'mock' && (
            <p aria-label="fallback-indicator">(Bu okuma yedek modda üretildi.)</p>
          )}
        </section>
      )}
    </main>
  );
}
