'use client';

import { useState } from 'react';

type TopicHint = 'relationship' | 'career' | 'self';

export interface QuestionFormProps {
  onSubmit: (input: { question: string; topicHint?: TopicHint }) => void;
  disabled: boolean;
}

const TOPIC_HINTS: Array<{ value: TopicHint; label: string }> = [
  { value: 'relationship', label: 'İlişki' },
  { value: 'career', label: 'Kariyer' },
  { value: 'self', label: 'Kendim' },
];

/**
 * The ONLY component that constructs a request body. onSubmit's payload
 * shape is exactly { question, topicHint? } - there is no field, prop, or
 * state slot here for persona/confidence/safetyFlags, so there is no
 * mechanism by which a client-supplied IntakeContext could ever be sent
 * (Sprint 4 UI Design Contract §5 - the client-side mirror of the API's
 * own request-schema guarantee).
 */
export function QuestionForm({ onSubmit, disabled }: QuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [topicHint, setTopicHint] = useState<TopicHint | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ question, topicHint });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="question-form">
      <div role="group" aria-label="topic-hint" className="flex gap-2">
        {TOPIC_HINTS.map((hint) => (
          <button
            key={hint.value}
            type="button"
            aria-pressed={topicHint === hint.value}
            onClick={() => setTopicHint(topicHint === hint.value ? undefined : hint.value)}
            disabled={disabled}
            className="min-h-[44px] min-w-[44px] rounded border px-3 aria-pressed:bg-accent aria-pressed:text-white"
          >
            {hint.label}
          </button>
        ))}
      </div>

      <label htmlFor="question" className="mt-4 block">
        Sorunuz
      </label>
      <textarea
        id="question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="Merak ettiğiniz bir şey varsa yazabilirsiniz - boş da bırakabilirsiniz."
        className="mt-1 w-full rounded border p-2"
      />

      <button
        type="submit"
        disabled={disabled}
        className="mt-4 min-h-[44px] min-w-[44px] rounded bg-accent px-4 text-white disabled:opacity-40"
      >
        {disabled ? 'Okuma hazırlanıyor...' : 'Kartları Çek'}
      </button>
    </form>
  );
}
