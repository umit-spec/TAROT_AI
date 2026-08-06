/**
 * Central input limits (H1). ONE source of truth — the reading route, the
 * preview route, and every schema that bounds user input import from here,
 * so a limit can never drift between two endpoints that must agree.
 *
 * The two limits exist for DIFFERENT reasons and are deliberately not
 * expressed as one shared number:
 *
 * - MAX_QUESTION_CHARS bounds *provider cost*. `question` is the only
 *   user-controlled value that reaches an Anthropic call, so an unbounded
 *   question is an unbounded token bill. 1000 characters is far above any
 *   genuine reflective question (the UI's own guidance is a few sentences)
 *   while capping the worst case at a predictable prompt size.
 *
 * - MAX_SEED_CHARS is *request hygiene*, not cost. The seed never reaches a
 *   provider; it only feeds the deterministic draw. It is bounded so a caller
 *   cannot push megabytes of text through a field whose entire job is to be a
 *   short reproducibility token.
 *
 * Raising either value is a costed decision, not a formatting change.
 */

/** Upper bound on the free-text question. Provider-cost control. */
export const MAX_QUESTION_CHARS = 1000;

/** Upper bound on the deterministic draw seed. Request hygiene only. */
export const MAX_SEED_CHARS = 128;

/**
 * User-facing rejection copy, in Turkish, kept next to the limits so the
 * number in the message can never disagree with the number being enforced.
 */
export const QUESTION_TOO_LONG_MESSAGE = `Sorunuz en fazla ${MAX_QUESTION_CHARS} karakter olabilir.`;
export const SEED_TOO_LONG_MESSAGE = `Seed en fazla ${MAX_SEED_CHARS} karakter olabilir.`;
