import { z } from 'zod';
import { DrawnCardSchema } from './reading';
import { IntakeContextSchema } from './intake';
import { KnowledgeResolutionMetaSchema, KnowledgeContextSchema, KnowledgeVersionSchema } from './knowledge';
import { InterpretationOutputSchema } from './interpretation';

/**
 * Only untrusted raw input - never a client-supplied IntakeContext.
 * classifyIntake() always runs server-side (src/app/api/readings/route.ts);
 * accepting persona/confidence/safetyFlags/etc. directly from the client
 * would let a caller hand the server whatever it wants, defeating the
 * entire point of classifying server-side (a malicious or just buggy
 * client could set safetyFlags: [] to bypass the crisis gate).
 */
export const ReadingRequestSchema = z.object({
  seed: z.string().min(1),
  question: z.string().default(''),
  topicHint: z.enum(['relationship', 'career', 'self']).optional(),
});
export type ReadingRequest = z.infer<typeof ReadingRequestSchema>;

export const ReadingResponseSchema = z.object({
  readingId: z.string().nullable(), // null until persistence exists (Sprint 4+)
  seed: z.string(),
  cards: z.array(DrawnCardSchema),
  intakeContext: IntakeContextSchema,
  knowledge: z.object({
    meta: KnowledgeResolutionMetaSchema,
    context: KnowledgeContextSchema,
  }),
  interpretation: InterpretationOutputSchema,
  provider: z.string(),
  versions: KnowledgeVersionSchema,
});
export type ReadingResponse = z.infer<typeof ReadingResponseSchema>;

/**
 * Returned instead of ReadingResponse when the request's intake
 * classification produces a crisis_* safetyFlag - docs/02-ETHICAL_CONSTITUTION.md's
 * Response Flow: no reading, no card draw, a calm safety acknowledgment
 * and resource links only.
 */
export const CrisisResponseSchema = z.object({
  status: z.literal('crisis'),
  message: z.string(),
  resources: z.array(z.object({ label: z.string(), contact: z.string() })),
});
export type CrisisResponse = z.infer<typeof CrisisResponseSchema>;

/**
 * Framing-preview request (docs/ADR-UX-FRAMING-PREVIEW.md R2/R3). STRICT by
 * design: the same narrow surface as a reading request MINUS the seed - the
 * preview never draws - and `.strict()` so any attempt to smuggle a
 * classification field (persona/confidence/safetyFlags/framing) or a seed is
 * rejected with a 400 rather than silently ignored.
 */
export const PreviewRequestSchema = z
  .object({
    question: z.string().default(''),
    topicHint: z.enum(['relationship', 'career', 'self']).optional(),
  })
  .strict();
export type PreviewRequest = z.infer<typeof PreviewRequestSchema>;

/**
 * The ONLY thing a framing preview may return in the non-crisis case
 * (docs/ADR-UX-FRAMING-PREVIEW.md R4/R5): two safe, human-readable strings.
 * No raw IntakeContext, confidence, safetyFlags, persona enum, provider,
 * cards, or seed - the shape itself makes a leak impossible.
 */
export const FramingPreviewSchema = z.object({
  topicLabel: z.string(),
  reflectiveFocus: z.string(),
});
export type FramingPreview = z.infer<typeof FramingPreviewSchema>;

export const FramingPreviewResponseSchema = z.object({
  status: z.literal('preview'),
  framing: FramingPreviewSchema,
});
export type FramingPreviewResponse = z.infer<typeof FramingPreviewResponseSchema>;
