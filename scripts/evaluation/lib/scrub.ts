/**
 * Secret scrubber for evaluation artifacts (Sprint S2, Product Owner decision
 * 3). Scans text for anything resembling an Anthropic API key or Authorization
 * header before an artifact is shown or committed. It NEVER prints the secret
 * it finds - only that a match occurred, where, and a masked fingerprint.
 */

export interface SecretFinding {
  pattern: string;
  /** A masked, non-reversible marker - never the secret itself. */
  masked: string;
}

// Anthropic keys look like `sk-ant-...`; OAuth tokens `sk-ant-oat...`. Also
// catch a generic `Authorization: Bearer <token>` header leaking into an
// artifact. High-entropy catch-all is intentionally conservative to avoid
// false positives on normal reading text.
const KEY_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'anthropic-api-key', re: /sk-ant-[A-Za-z0-9_-]{8,}/g },
  { name: 'authorization-bearer', re: /Authorization"?\s*:?\s*"?Bearer\s+[A-Za-z0-9._-]{8,}/gi },
  { name: 'x-api-key-header', re: /x-api-key"?\s*:?\s*"?[A-Za-z0-9_-]{16,}/gi },
];

function mask(value: string): string {
  if (value.length <= 8) return '***';
  return `${value.slice(0, 6)}…(${value.length} chars)…redacted`;
}

/**
 * Returns every secret-like finding in `text`. `extraSecrets` lets a caller
 * pass the live process's actual key value (read from env, never logged) so an
 * exact-match leak is caught even if it doesn't match the shape patterns.
 */
export function scanForSecrets(text: string, extraSecrets: string[] = []): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const { name, re } of KEY_PATTERNS) {
    for (const match of text.matchAll(re)) {
      findings.push({ pattern: name, masked: mask(match[0]) });
    }
  }

  for (const secret of extraSecrets) {
    const trimmed = secret.trim();
    if (trimmed.length >= 8 && text.includes(trimmed)) {
      findings.push({ pattern: 'exact-env-secret-match', masked: mask(trimmed) });
    }
  }

  return findings;
}

export function hasSecrets(text: string, extraSecrets: string[] = []): boolean {
  return scanForSecrets(text, extraSecrets).length > 0;
}
