import { InterpretationInput, RawInterpretationOutput } from '../../../../types/interpretation';
import type { TokenUsage } from '../../../../types/evaluation';
import { assertNoForbiddenPhrases } from '../../validate';
import { InterpretationProvider } from '../types';
import { ClaudeProviderConfig, loadClaudeProviderConfig } from './config';
import { callAnthropicWithRetry } from './http';
import { mapToInterpretationOutput, parseClaudeResponseText } from './mapper';
import { buildSystemPrompt, buildUserMessage, PROMPT_VERSION } from './prompt';

/**
 * ADR-011 step 7 in concrete form: this class does exactly one job -
 * narrate the structured InterpretationInput it's given. It never selects
 * cards, never classifies intake, never invents a card meaning, never
 * touches persona/safetyFlags (those pass through untouched to the shared
 * red-line validator), and never logs the API key.
 *
 * Config is loaded lazily, inside generate() rather than the constructor,
 * so `new ClaudeProvider()` never throws by itself - a missing API key
 * only surfaces as a rejected generate() call, which is exactly what
 * generateInterpretedReading()'s existing try/catch already falls back to
 * MockProvider for. No special-casing needed for "no API key" - it's just
 * another generate() failure.
 */
export class ClaudeProvider implements InterpretationProvider {
  readonly name = 'claude';
  readonly promptVersion = PROMPT_VERSION;

  // Sprint 6: usage from the most recent successful call, exposed via the
  // optional getLastUsage() side channel below - additive, since
  // InterpretationProvider.generate()'s own return type (InterpretationOutput)
  // is untouched and every existing caller/test keeps working unmodified.
  private lastUsage: TokenUsage | undefined;

  constructor(
    private readonly configOverrides: Partial<ClaudeProviderConfig> = {},
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
    const config: ClaudeProviderConfig = { ...loadClaudeProviderConfig(), ...this.configOverrides };

    const system = buildSystemPrompt();
    const userMessage = buildUserMessage(input);

    const { text, usage } = await callAnthropicWithRetry(
      { apiKey: config.apiKey, model: config.model, system, userMessage, timeoutMs: config.timeoutMs },
      config.maxRetries,
      this.fetchImpl
    );
    this.lastUsage = usage;

    const claudeOutput = parseClaudeResponseText(text);
    const raw = mapToInterpretationOutput(claudeOutput, input.reading);
    // Red-line self-check on the narration. reflectionPrompt is excluded here
    // and validated by its own field-level guards downstream, so an unsafe
    // prompt is a field-level fallback (A2), not a whole-reading fallback.
    // The engine (runProvider) is the single final schema + normalization gate.
    assertNoForbiddenPhrases(JSON.stringify({ ...raw, reflectionPrompt: '' }));
    return raw;
  }

  getLastUsage(): TokenUsage | undefined {
    return this.lastUsage;
  }
}

export { ClaudeConfigError, loadClaudeProviderConfig } from './config';
export { ClaudeHttpError, ClaudeOutputValidationError, ClaudeTimeoutError } from './errors';
export { PROMPT_VERSION, buildSystemPrompt, buildUserMessage } from './prompt';
export { ClaudeInterpretationOutputSchema } from './mapper';
export type { ClaudeProviderConfig } from './config';
