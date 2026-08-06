/**
 * Validation-error redaction (H5).
 *
 * The routes returned `parsed.error.issues` verbatim. Several Zod issue kinds
 * carry the offending VALUE, so the response echoed user input straight back:
 *
 *   topicHint: "TC-12345678901"
 *     -> { received: "TC-12345678901", message: "... received 'TC-...'" }
 *
 *   { gizliAlan: "hassas-veri" }   (strict preview schema)
 *     -> { keys: ["gizliAlan"] }
 *
 * This is not a cross-user leak — the data returns to the client that sent it
 * — but it is avoidable surface. Anything that echoes user text into a
 * response body can end up in an intermediary's access log, a browser
 * extension, or an error tracker, none of which the privacy notice covers.
 *
 * The client needs to know WHICH FIELD failed and WHY. It does not need its
 * own value read back to it. This keeps the former and drops the latter.
 */

export interface RedactedIssue {
  /** Dotted field path, e.g. "question" or "cards.0.cardId". */
  path: string;
  /** Zod issue code, e.g. "too_big", "invalid_enum_value". */
  code: string;
  /**
   * Message, included ONLY when it is a message we authored (the central
   * limit copy in src/server/limits.ts). Zod's generated messages can embed
   * the received value, so they are dropped rather than filtered.
   */
  message?: string;
}

/** Messages we wrote ourselves and know contain no user input. */
const SAFE_MESSAGE_PREFIXES = ['Sorunuz en fazla', 'Seed en fazla'];

function isSafeMessage(message: string): boolean {
  return SAFE_MESSAGE_PREFIXES.some((p) => message.startsWith(p));
}

interface IssueLike {
  path?: Array<string | number>;
  code?: string;
  message?: string;
}

export function redactIssues(issues: readonly IssueLike[]): RedactedIssue[] {
  return issues.map((issue) => {
    const path = (issue.path ?? []).join('.');
    const message = issue.message;
    return {
      path,
      code: issue.code ?? 'invalid',
      // Deliberately allow-list rather than deny-list: a new Zod version could
      // add another value-carrying message shape, and an allow-list stays
      // correct when that happens.
      ...(message && isSafeMessage(message) ? { message } : {}),
    };
  });
}
