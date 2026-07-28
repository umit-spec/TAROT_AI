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
   * the question textarea so a screen-reader/keyboard user lands on it.
   * On the very first compose entry (autoFocus=false) focus goes to the
   * screen heading instead (docs/UI_PREMIUM_V1.md FAZ 3). */
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
 * payload shape. FAZ 3 (docs/UI_PREMIUM_V1.md) is presentation-only on top
 * of that same guarantee.
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const hintIdBase = useId();
  const scaffoldNoteId = useId();

  useEffect(() => {
    // First compose entry: focus the screen heading (a calm entrance, not a
    // jump straight into an input). Returning from framing/error
    // (autoFocus=true): focus goes back to the textarea instead, so a
    // keyboard/screen-reader user lands where they were editing.
    if (autoFocus) textareaRef.current?.focus();
    else headingRef.current?.focus();
    // Only on mount: this fires once per screen entry, not on every re-render.
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
    <form onSubmit={handleSubmit} aria-labelledby={headingId} data-testid="question-form" aria-busy={disabled}>
      <div className="rounded-[28px] border border-border-subtle bg-surface-raised/60 p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.6)] sm:p-8">
        {/* A. Screen entry - non-interactive, only receives programmatic
            focus-on-mount, so it must never show the interactive
            focus-visible ring (same reasoning as ConsentModal's heading,
            docs/UI_PREMIUM_V1.md FAZ 2.1 §14.1). */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Niyetini belirle</p>
          <h2
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="mt-2 font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
          >
            Bugün neye bakmak istersin?
          </h2>
          <p className="mt-2 max-w-prose text-sm text-foreground-secondary sm:text-base">
            Bir konu seçebilir, kendi sorunuzu yazabilir veya alanı boş bırakarak devam edebilirsiniz.
          </p>
        </div>

        <div aria-hidden="true" className="my-6 h-px w-full bg-border-subtle" />

        {/* B. Topic selection */}
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="font-heading text-base text-foreground">Konu seçimi</h3>
            <span className="text-xs text-foreground-muted">İsteğe bağlı</span>
          </div>
          <div role="group" aria-label="topic-hint" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TOPIC_HINTS.map((hint, i) => {
              const hintId = `${hintIdBase}-topic-${i}`;
              const selected = topicHint === hint.value;
              return (
                <button
                  key={hint.value}
                  type="button"
                  aria-label={hint.label}
                  aria-pressed={selected}
                  aria-describedby={hintId}
                  onClick={() => setTopicHint(selected ? undefined : hint.value)}
                  disabled={disabled}
                  className={`flex min-h-[44px] min-w-[44px] flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-colors duration-reveal disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? 'border-border-strong bg-violet-deep/25'
                      : 'border-border-subtle bg-surface [@media(hover:hover)]:hover:border-border-strong/60'
                  }`}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="font-heading text-base text-foreground">{hint.label}</span>
                    {selected && (
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-none stroke-gold stroke-2">
                        <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span id={hintId} className="text-xs text-foreground-muted">
                    {hint.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* C. Reflective starting points */}
        <div className="mt-6">
          <h3 className="font-heading text-base text-foreground">Bir başlangıç seç</h3>
          <p className="mt-1 text-sm text-foreground-muted">Ne soracağını bilemiyorsan, buradan başlayabilirsin:</p>
          <div role="group" aria-label="soru-onerileri" className="mt-3 flex flex-col gap-2">
            {QUESTION_SCAFFOLDS.map((example) => (
              <button
                key={example}
                type="button"
                aria-label={`${example} — soruna ekle`}
                onClick={() => insertScaffold(example)}
                disabled={disabled}
                className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3 text-left text-sm text-foreground-secondary transition-colors duration-reveal disabled:cursor-not-allowed disabled:opacity-40 [@media(hover:hover)]:hover:border-border-strong/60"
              >
                <span>{example}</span>
                {/* CSS-generated content, not a DOM text node - keeps the
                    button's textContent exactly the scaffold text (the
                    anti-prophecy copy guard asserts it ends in "?"). */}
                <span aria-hidden="true" className="shrink-0 text-gold after:content-['+']" />
              </button>
            ))}
          </div>
        </div>

        {/* D. The textarea - the screen's main thinking space */}
        <div className="mt-6">
          <label htmlFor="question" className="block font-heading text-base text-foreground">
            Sorunuz
          </label>
          <textarea
            id="question"
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={disabled}
            rows={4}
            aria-describedby={scaffoldNoteId}
            placeholder="Merak ettiğiniz bir şey varsa yazabilirsiniz - boş da bırakabilirsiniz."
            className="mt-2 min-h-[8rem] w-full resize-y rounded-2xl border border-border-subtle bg-surface-raised p-4 text-base text-foreground placeholder:text-foreground-muted focus:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
          />

          {/* E. Reflection guidance note */}
          <p
            id={scaffoldNoteId}
            className="mt-3 rounded-xl border-l-2 border-gold/60 bg-violet-deep/10 px-3 py-2 text-[13px] text-foreground-secondary"
          >
            İpucu: &quot;ne olacak?&quot; yerine &quot;neyi düşünmeliyim?&quot; çoğu zaman daha çok işe yarar.
          </p>
        </div>

        {/* F. Primary CTA */}
        <button
          type="submit"
          disabled={disabled}
          className="mt-6 min-h-[52px] w-full min-w-[44px] rounded-2xl bg-accent px-4 text-base font-medium text-background motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {disabled ? 'Netleştiriliyor...' : 'Sorumu netleştir'}
        </button>
      </div>
    </form>
  );
}
