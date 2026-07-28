'use client';

import { useEffect, useId, useRef, useState } from 'react';

type TopicHint = 'relationship' | 'career' | 'self';

export interface QuestionFormProps {
  onSubmit: (input: { question: string; topicHint?: TopicHint }) => void;
  disabled: boolean;
  /** Seed values so returning from framing review ("Sorumu düzenle")
   * preserves what the user already wrote (docs/UX_FLOW_V2.md §3.3). */
  initialQuestion?: string;
  initialTopicHint?: TopicHint;
  /** When returning here from framing review or an error, move focus back to
   * the question textarea so a screen-reader/keyboard user lands on it. */
  autoFocus?: boolean;
}

const TOPIC_HINTS: Array<{ value: TopicHint; label: string; hint: string }> = [
  { value: 'relationship', label: 'İlişki', hint: 'Bir bağ, bir mesafe, bir soru işareti üzerine.' },
  { value: 'career', label: 'Kariyer', hint: 'Bir karar, bir yön, bir tıkanma üzerine.' },
  { value: 'self', label: 'Kendim', hint: 'Kendi halin, kendi ritmin üzerine.' },
];

/**
 * Reflective scaffolding (UX_FLOW_V2 §3.2, priority #1). These steer a user
 * toward "neyi düşünmeliyim?" phrasing and away from "ne olacak?" prediction
 * - the copy-layer expression of the anti-prophecy contract
 * (UX_COPY_CONTRACT §3). Inserting one is optional; it never overwrites the
 * user's own text and the textarea stays fully skippable.
 */
const QUESTION_SCAFFOLDS: string[] = [
  'Bu konuda neyi gözden kaçırıyor olabilirim?',
  'Kendime hangi soruyu sormalıyım?',
  'Şu an neye dikkat etmem iyi olur?',
];

/**
 * The ONLY component that constructs a request body. onSubmit's payload
 * shape is exactly { question, topicHint? } - there is no field, prop, or
 * state slot here for persona/confidence/safetyFlags, so there is no
 * mechanism by which a client-supplied IntakeContext could ever be sent
 * (Sprint 4 UI Design Contract §5 / UX_FLOW_V2 §7.1 - the client-side mirror
 * of the API's own request-schema guarantee). S-UX-1 adds topic cards and
 * reflective scaffolding on top of that guarantee without touching the
 * payload shape.
 */
export function QuestionForm({
  onSubmit,
  disabled,
  initialQuestion,
  initialTopicHint,
  autoFocus = false,
}: QuestionFormProps) {
  const [question, setQuestion] = useState(initialQuestion ?? '');
  const [topicHint, setTopicHint] = useState<TopicHint | undefined>(initialTopicHint);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hintIdBase = useId();
  const scaffoldNoteId = useId();

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
    // Only on mount: this fires when the form is re-entered from framing/error.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ question, topicHint });
  }

  // Non-destructive insert: fill an empty textarea, otherwise append after a
  // blank line so a user's own words are never lost ("aktarma", not overwrite).
  function insertScaffold(example: string) {
    setQuestion((current) => (current.trim() === '' ? example : `${current.trimEnd()}\n\n${example}`));
    textareaRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} aria-label="question-form">
      <div role="group" aria-label="topic-hint" className="flex flex-wrap gap-2">
        {TOPIC_HINTS.map((hint, i) => {
          const hintId = `${hintIdBase}-topic-${i}`;
          return (
            <button
              key={hint.value}
              type="button"
              aria-label={hint.label}
              aria-pressed={topicHint === hint.value}
              aria-describedby={hintId}
              onClick={() => setTopicHint(topicHint === hint.value ? undefined : hint.value)}
              disabled={disabled}
              className="flex min-h-[44px] min-w-[44px] flex-col items-start rounded border px-3 py-2 text-left aria-pressed:bg-accent aria-pressed:text-background"
            >
              <span>{hint.label}</span>
              <span id={hintId} className="text-xs text-ink-muted">
                {hint.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div role="group" aria-label="soru-onerileri" className="mt-4">
        <p className="text-sm text-ink-muted">Ne soracağını bilemiyorsan, buradan başlayabilirsin:</p>
        <div className="mt-2 flex flex-col gap-2">
          {QUESTION_SCAFFOLDS.map((example) => (
            <button
              key={example}
              type="button"
              aria-label={`${example} — soruna ekle`}
              onClick={() => insertScaffold(example)}
              disabled={disabled}
              className="min-h-[44px] rounded border border-dashed px-3 py-2 text-left text-sm disabled:opacity-40"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="question" className="mt-4 block">
        Sorunuz
      </label>
      <textarea
        id="question"
        ref={textareaRef}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={disabled}
        rows={3}
        aria-describedby={scaffoldNoteId}
        placeholder="Merak ettiğiniz bir şey varsa yazabilirsiniz - boş da bırakabilirsiniz."
        className="mt-1 w-full rounded border p-2"
      />
      <p id={scaffoldNoteId} className="mt-1 text-xs text-ink-muted">
        İpucu: &quot;ne olacak?&quot; yerine &quot;neyi düşünmeliyim?&quot; çoğu zaman daha çok işe yarar.
      </p>

      <button
        type="submit"
        disabled={disabled}
        className="mt-4 min-h-[44px] min-w-[44px] rounded bg-accent px-4 text-background disabled:opacity-40"
      >
        {disabled ? 'Netleştiriliyor...' : 'Sorumu netleştir'}
      </button>
    </form>
  );
}
