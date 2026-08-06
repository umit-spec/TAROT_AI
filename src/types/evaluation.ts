import { z } from 'zod';
import { IntakeContextSchema } from './intake';
import { SpreadTypeSchema } from './reading';
import { isAiActorId } from './knowledge-authoring';

export const EvaluationCaseLifecycleStatusSchema = z.enum(['draft', 'reviewed', 'active']);
export type EvaluationCaseLifecycleStatus = z.infer<typeof EvaluationCaseLifecycleStatusSchema>;

// Drives the adversarial-review requirement below - 'none' means the case
// isn't stressing a crisis/injection/red-line boundary at all.
export const EvaluationRiskTagSchema = z.enum([
  'crisis_suicide',
  'crisis_violence',
  'crisis_medical',
  'crisis_assault',
  'prompt_injection',
  'red_line_boundary',
  'none',
]);
export type EvaluationRiskTag = z.infer<typeof EvaluationRiskTagSchema>;

const EVAL_STATUS_ORDER: EvaluationCaseLifecycleStatus[] = ['draft', 'reviewed', 'active'];
const reachedEvalStatus = (status: EvaluationCaseLifecycleStatus, gate: EvaluationCaseLifecycleStatus): boolean =>
  EVAL_STATUS_ORDER.indexOf(status) >= EVAL_STATUS_ORDER.indexOf(gate);

/**
 * A fixed evaluation-dataset case. Lighter than Sprint 5's authoring
 * lifecycle (these are measurement fixtures, not shipped knowledge
 * content - no lock/red-team ceremony) but not free-form either: the
 * Product Owner's decision requires real governance fields plus a
 * mandatory adversarial review pass for anything risk-tagged before it
 * can go active - see Sprint 6 plan §1.1.
 */
export const EvaluationCaseSchema = z
  .object({
    caseId: z.string().min(1),
    authoredBy: z.string().min(1),
    reviewedBy: z.string().optional(),
    adversarialReviewedBy: z.string().optional(),
    version: z.string().min(1),
    purpose: z.string().min(1),
    expectedRiskTags: z.array(EvaluationRiskTagSchema),
    expectedPipelineOutcome: z.string().min(1),
    status: EvaluationCaseLifecycleStatusSchema,
    seed: z.string().min(1),
    spread: SpreadTypeSchema,
    intake: IntakeContextSchema,
    questionText: z.string().default(''),
    rubricFocus: z.array(z.string()),
    notes: z.string().optional(),
  })
  .superRefine((c, ctx) => {
    if (reachedEvalStatus(c.status, 'reviewed') && !c.reviewedBy) {
      ctx.addIssue({
        code: 'custom',
        path: ['reviewedBy'],
        message: 'reviewedBy required at reviewed status or beyond',
      });
    }
    const isRiskTagged = c.expectedRiskTags.some((t) => t !== 'none');
    if (isRiskTagged && c.status === 'active' && !c.adversarialReviewedBy) {
      ctx.addIssue({
        code: 'custom',
        path: ['adversarialReviewedBy'],
        message:
          'crisis/prompt-injection/red-line cases require at least one adversarial review pass before becoming active',
      });
    }
  });
export type EvaluationCase = z.infer<typeof EvaluationCaseSchema>;

/**
 * Human-scored narration quality. Never AI-scored - the same
 * "AI cannot certify its own output" principle Sprint 5 established for
 * lockAuthorityId, applied here to scoredBy. Single-evaluator status is
 * mandatory, explicit metadata (Product Owner's decision) - not an
 * optional flag someone could forget to set.
 */
export const RubricScoreSchema = z
  .object({
    caseId: z.string().min(1),
    scoredBy: z.string().min(1),
    evaluatorCount: z.number().int().min(1),
    independentReview: z.boolean(),
    evaluationRound: z.string().min(1),
    scoredAt: z.string().datetime(),
    dimensions: z.object({
      toneAppropriateness: z.number().int().min(1).max(5),
      specificityToQuestion: z.number().int().min(1).max(5),
      avoidsOverreachOrCertainty: z.number().int().min(1).max(5),
      psychologicalDepth: z.number().int().min(1).max(5),
      safetyHandling: z.number().int().min(1).max(5),
    }),
    notes: z.string().optional(),
  })
  .superRefine((score, ctx) => {
    if (isAiActorId(score.scoredBy)) {
      ctx.addIssue({
        code: 'custom',
        path: ['scoredBy'],
        message: 'scoredBy must be a named human - AI cannot certify its own narration quality',
      });
    }
  });
export type RubricScore = z.infer<typeof RubricScoreSchema>;

/**
 * H4 adds three reasons that are NOT provider failures — the provider was
 * never called. Keeping them distinct from 'provider-error' matters: an
 * operator seeing a spike needs to tell "the model is broken" apart from "we
 * hit our own ceiling" and "we are shedding load", which have different fixes.
 */
export const FallbackReasonSchema = z.enum([
  'red-line-rejected',
  'schema-invalid',
  'provider-error',
  'provider-disabled',
  'spend-cap-reached',
  'provider-busy',
]);
export type FallbackReason = z.infer<typeof FallbackReasonSchema>;

export const TokenUsageSchema = z.object({
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
});
export type TokenUsage = z.infer<typeof TokenUsageSchema>;

export const EvaluationCaseResultSchema = z.object({
  caseId: z.string().min(1),
  providerUsed: z.string(),
  promptVersionUsed: z.string().optional(),
  fallbackReason: FallbackReasonSchema.optional(),
  usage: TokenUsageSchema.optional(),
  latencyMs: z.number().min(0),
  zeroToleranceViolations: z.array(z.string()), // empty = passed all 5 invariants for this case
});
export type EvaluationCaseResult = z.infer<typeof EvaluationCaseResultSchema>;

export const EvaluationRunManifestSchema = z.object({
  runId: z.string().min(1),
  runAt: z.string().datetime(),
  providerMode: z.enum(['mock', 'live-anthropic']),
  // Present on live runs (the evaluated model id, e.g. 'claude-sonnet-5');
  // optional so existing mock manifests remain valid. Never a secret.
  model: z.string().optional(),
  caseCount: z.number().int().min(0),
  fallbackRate: z.number().min(0).max(1),
  fallbackRateByReason: z.record(z.string(), z.number().min(0).max(1)),
  latencyP50Ms: z.number().min(0),
  latencyP95Ms: z.number().min(0),
  totalInputTokens: z.number().int().min(0),
  totalOutputTokens: z.number().int().min(0),
  zeroToleranceViolationCount: z.number().int().min(0),
});
export type EvaluationRunManifest = z.infer<typeof EvaluationRunManifestSchema>;

/**
 * Written by `evaluation:live-anthropic` when ANTHROPIC_API_KEY is
 * absent - an honest, controlled report, never a silent skip and never
 * a faked success. harnessReadiness is only 'VERIFIED' when the same
 * run's MockProvider pass actually completed first.
 */
export const LiveAnthropicStatusSchema = z.object({
  liveAnthropicEvaluation: z.enum(['EXECUTED', 'NOT EXECUTED']),
  reason: z.string().optional(),
  harnessReadiness: z.enum(['VERIFIED', 'UNVERIFIED']),
});
export type LiveAnthropicStatus = z.infer<typeof LiveAnthropicStatusSchema>;
