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
