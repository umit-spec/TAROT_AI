export interface ErrorNoticeProps {
  userMessage: string;
  onRetry: () => void;
}

/** Generic only - takes a user-safe message, never raw Zod issues or a stack trace. */
export function ErrorNotice({ userMessage, onRetry }: ErrorNoticeProps) {
  return (
    <section aria-label="error-state" role="alert" className="rounded border border-diagnostic-subtle p-4">
      <p>Bir hata oluştu: {userMessage}</p>
      <button type="button" onClick={onRetry} className="mt-2 min-h-[44px] min-w-[44px] rounded border px-4">
        Tekrar Dene
      </button>
    </section>
  );
}
