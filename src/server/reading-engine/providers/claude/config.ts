/**
 * Model/config is managed from this one point - never hardcoded elsewhere
 * in the adapter. Safe defaults exist so the env vars are optional, except
 * ANTHROPIC_API_KEY, which has no safe default by definition.
 */
export const DEFAULT_MODEL = 'claude-sonnet-5';
export const DEFAULT_TIMEOUT_MS = 20_000;
export const DEFAULT_MAX_RETRIES = 1; // 1 initial call + 1 retry, per MVP scope

export class ClaudeConfigError extends Error {}

export interface ClaudeProviderConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

/**
 * Reads env fresh on every call (no module-level caching) so tests can set
 * process.env per-case without needing a reset hook. Never logs apiKey -
 * callers must not either.
 */
export function loadClaudeProviderConfig(env: NodeJS.ProcessEnv = process.env): ClaudeProviderConfig {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new ClaudeConfigError('ANTHROPIC_API_KEY is not set');
  }

  const timeoutMs = env.ANTHROPIC_TIMEOUT_MS !== undefined ? Number(env.ANTHROPIC_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new ClaudeConfigError(`ANTHROPIC_TIMEOUT_MS must be a positive number, got: "${env.ANTHROPIC_TIMEOUT_MS}"`);
  }

  const maxRetries = env.ANTHROPIC_MAX_RETRIES !== undefined ? Number(env.ANTHROPIC_MAX_RETRIES) : DEFAULT_MAX_RETRIES;
  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new ClaudeConfigError(
      `ANTHROPIC_MAX_RETRIES must be a non-negative integer, got: "${env.ANTHROPIC_MAX_RETRIES}"`
    );
  }

  return {
    apiKey,
    model: env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL,
    timeoutMs,
    maxRetries,
  };
}
