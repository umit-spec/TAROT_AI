import { ClaudeHttpError, ClaudeOutputValidationError, ClaudeTimeoutError, isRetryable } from './errors';

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

function extractText(json: unknown): string {
  const content = (json as { content?: Array<{ type?: string; text?: string }> } | null)?.content;
  const block = content?.find((b) => b.type === 'text' && typeof b.text === 'string');
  if (!block?.text) {
    throw new ClaudeOutputValidationError('Unexpected Anthropic response shape: no text content block found');
  }
  return block.text;
}

async function callOnce(params: AnthropicCallParams, fetchImpl: typeof fetch): Promise<string> {
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
    return extractText(json);
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
): Promise<string> {
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
