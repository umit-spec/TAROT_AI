import { ClaudeHttpError, ClaudeOutputValidationError, ClaudeTimeoutError, isRetryable } from './errors';
import type { TokenUsage } from '../../../../types/evaluation';

const ANTHROPIC_API_BASE = 'https://api.anthropic.com';
const ANTHROPIC_API_VERSION = '2023-06-01';
const MAX_OUTPUT_TOKENS = 2000;
const RETRY_DELAY_MS = 300;

export interface AnthropicCallParams {
  apiKey: string;
  model: string;
  system: string;
  userMessage: string;
  timeoutMs: number;
}

// Sprint 6: the response text plus token usage, captured (not discarded)
// so a cost/latency evaluation harness has something real to measure.
export interface ClaudeCallResult {
  text: string;
  usage: TokenUsage;
}

function extractResult(json: unknown): ClaudeCallResult {
  const content = (json as { content?: Array<{ type?: string; text?: string }> } | null)?.content;
  const block = content?.find((b) => b.type === 'text' && typeof b.text === 'string');
  if (!block?.text) {
    throw new ClaudeOutputValidationError('Unexpected Anthropic response shape: no text content block found');
  }
  const usageRaw = (json as { usage?: { input_tokens?: number; output_tokens?: number } } | null)?.usage;
  return {
    text: block.text,
    usage: {
      inputTokens: typeof usageRaw?.input_tokens === 'number' ? usageRaw.input_tokens : 0,
      outputTokens: typeof usageRaw?.output_tokens === 'number' ? usageRaw.output_tokens : 0,
    },
  };
}

async function callOnce(params: AnthropicCallParams, fetchImpl: typeof fetch): Promise<ClaudeCallResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    let res: Response;
    try {
      res = await fetchImpl(`${ANTHROPIC_API_BASE}/v1/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': params.apiKey,
          'anthropic-version': ANTHROPIC_API_VERSION,
        },
        body: JSON.stringify({
          model: params.model,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: params.system,
          messages: [{ role: 'user', content: params.userMessage }],
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ClaudeTimeoutError(`Anthropic API call timed out after ${params.timeoutMs}ms`);
      }
      throw err;
    }

    if (!res.ok) {
      throw new ClaudeHttpError(res.status, `Anthropic API returned HTTP ${res.status}`);
    }

    const json: unknown = await res.json();
    return extractResult(json);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 1 initial call + up to maxRetries retries, only for transient failures
 * (see errors.ts isRetryable). Auth/client errors and output-validation
 * failures propagate on the first attempt - see ClaudeProvider.generate(),
 * which never reaches those failure modes here (they happen after this
 * returns), so this function's own retry scope is purely HTTP-transport.
 */
export async function callAnthropicWithRetry(
  params: AnthropicCallParams,
  maxRetries: number,
  fetchImpl: typeof fetch = fetch
): Promise<ClaudeCallResult> {
  const totalAttempts = 1 + maxRetries;
  let lastError: unknown;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      return await callOnce(params, fetchImpl);
    } catch (err) {
      lastError = err;
      if (attempt === totalAttempts || !isRetryable(err)) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  throw lastError;
}
