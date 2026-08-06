/**
 * Structured logging (Sprint S3, D4/D5). The log record is built from a fixed
 * set of NON-sensitive fields only. It NEVER carries the user's question text,
 * reflection text, crisis text, or provider payloads - those are structurally
 * absent from the builder's input type, so they cannot leak by accident. A
 * test asserts a request's free-text never appears in the emitted record.
 */

export interface ReadingLogRecord {
  event: 'reading_request';
  requestId: string;
  status: number;
  latencyMs: number;
  outcome: 'crisis' | 'reading' | 'invalid' | 'rate-limited' | 'error';
  // Derived, non-free-text signals only:
  persona?: string;
  questionDomain?: string;
  crisis?: boolean;
  safetyFlagCount?: number;
  provider?: string;
  fallbackReason?: string;
  inputTokens?: number;
  outputTokens?: number;
  // H4 spend/ops counters. All aggregate numbers - no user or model text.
  // `estimatedCostUsd` is present ONLY when attributed pricing is configured
  // (see spend-guard.ts); it is never a guessed figure.
  dailyProviderCalls?: number;
  dailyTotalTokens?: number;
  estimatedCostUsd?: number;
  providerConcurrencyActive?: number;
  providerConcurrencyQueued?: number;
}

export interface ReadingLogInput {
  requestId: string;
  status: number;
  latencyMs: number;
  outcome: ReadingLogRecord['outcome'];
  persona?: string;
  questionDomain?: string;
  crisis?: boolean;
  safetyFlagCount?: number;
  provider?: string;
  fallbackReason?: string;
  inputTokens?: number;
  outputTokens?: number;
  dailyProviderCalls?: number;
  dailyTotalTokens?: number;
  estimatedCostUsd?: number;
  providerConcurrencyActive?: number;
  providerConcurrencyQueued?: number;
}

/** Pure builder - no I/O, so it can be unit-tested for redaction. */
export function buildReadingLogRecord(input: ReadingLogInput): ReadingLogRecord {
  return {
    event: 'reading_request',
    requestId: input.requestId,
    status: input.status,
    latencyMs: Math.round(input.latencyMs),
    outcome: input.outcome,
    ...(input.persona ? { persona: input.persona } : {}),
    ...(input.questionDomain ? { questionDomain: input.questionDomain } : {}),
    ...(input.crisis !== undefined ? { crisis: input.crisis } : {}),
    ...(input.safetyFlagCount !== undefined ? { safetyFlagCount: input.safetyFlagCount } : {}),
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.fallbackReason ? { fallbackReason: input.fallbackReason } : {}),
    ...(input.inputTokens !== undefined ? { inputTokens: input.inputTokens } : {}),
    ...(input.outputTokens !== undefined ? { outputTokens: input.outputTokens } : {}),
    ...(input.dailyProviderCalls !== undefined ? { dailyProviderCalls: input.dailyProviderCalls } : {}),
    ...(input.dailyTotalTokens !== undefined ? { dailyTotalTokens: input.dailyTotalTokens } : {}),
    ...(input.estimatedCostUsd !== undefined ? { estimatedCostUsd: input.estimatedCostUsd } : {}),
    ...(input.providerConcurrencyActive !== undefined
      ? { providerConcurrencyActive: input.providerConcurrencyActive }
      : {}),
    ...(input.providerConcurrencyQueued !== undefined
      ? { providerConcurrencyQueued: input.providerConcurrencyQueued }
      : {}),
  };
}

export function logReading(input: ReadingLogInput): void {
  // Structured single-line JSON to stdout - safe for log aggregators; no
  // sensitive text, ever. Silent in the test environment to keep output clean.
  if (process.env.NODE_ENV === 'test') return;
  console.log(JSON.stringify(buildReadingLogRecord(input)));
}

/**
 * Framing-preview logging (docs/ADR-UX-FRAMING-PREVIEW.md R11). A DISTINCT
 * event type from reading, on purpose: a preview must never be counted as a
 * reading, or the reading-completion metric and conversion funnel are
 * corrupted. Shares the same redaction discipline - only derived, non-free-
 * text signals; never the question, framing, or crisis text.
 */
export interface PreviewLogRecord {
  event: 'preview_request';
  requestId: string;
  status: number;
  latencyMs: number;
  outcome: 'preview' | 'crisis' | 'invalid' | 'rate-limited' | 'error';
  questionDomain?: string;
  safetyFlagCount?: number;
}

export interface PreviewLogInput {
  requestId: string;
  status: number;
  latencyMs: number;
  outcome: PreviewLogRecord['outcome'];
  questionDomain?: string;
  safetyFlagCount?: number;
}

export function buildPreviewLogRecord(input: PreviewLogInput): PreviewLogRecord {
  return {
    event: 'preview_request',
    requestId: input.requestId,
    status: input.status,
    latencyMs: Math.round(input.latencyMs),
    outcome: input.outcome,
    ...(input.questionDomain ? { questionDomain: input.questionDomain } : {}),
    ...(input.safetyFlagCount !== undefined ? { safetyFlagCount: input.safetyFlagCount } : {}),
  };
}

export function logPreview(input: PreviewLogInput): void {
  if (process.env.NODE_ENV === 'test') return;
  console.log(JSON.stringify(buildPreviewLogRecord(input)));
}
