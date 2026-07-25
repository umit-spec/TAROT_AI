/**
 * Fixed, constitution-mandated disclaimer - shared by every provider so it
 * can never drift or be silently dropped/rewritten by a model. Providers
 * (Claude included) never generate this text themselves.
 */
export const UNCERTAINTY_NOTICE = 'Bu okuma sembolik bir araçtır, kesin bir öngörü değildir.';

/**
 * The ONE central, server-side governed fallback reflection question
 * (docs/ADR-UX-REFLECTION-PROMPT.md §9). Used when a provider omits the field
 * or its prompt fails validation. It is itself compliant (one user-focused
 * question, no prediction). The client never fabricates a reflection prompt.
 */
export const REFLECTION_PROMPT_FALLBACK =
  'Bu okuma sana şu anda hangi noktayı yeniden düşünmek için alan açıyor?';
