import { z } from 'zod';
import { CardPositionKeySchema } from './card';
import { IntakeContextSchema, PersonaSchema } from './intake';
import { KnowledgeContextSchema } from './knowledge';
import { DeterministicReadingSchema } from './reading';

// Persona is defined once, in ./intake (ADR-011 step 5: it originates at
// intake and flows through to narration unchanged). Re-exported here so
// existing `import { Persona } from '../types/interpretation'` call sites
// keep working.
export { PersonaSchema };
export type { Persona } from './intake';

/**
 * What every InterpretationProvider receives: Layer 1+2 output (ADR-011
 * steps 1-6), the full Intake classification, the resolved Knowledge
 * context (ADR-012 - pair relations/position rules/modifiers/safety
 * constraints for THIS reading, never a card selection), and - only for
 * providers that need it (Claude) - the raw user question text, carried as
 * an isolated data field, never as something a provider concatenates into
 * its own instructions. A provider has no access to anything it shouldn't
 * be able to invent from; swapping providers must never change what a
 * reading means, only how it reads.
 */
export const InterpretationInputSchema = z.object({
  reading: DeterministicReadingSchema,
  intake: IntakeContextSchema,
  knowledge: KnowledgeContextSchema,
  questionText: z.string().default(''),
});
export type InterpretationInput = z.infer<typeof InterpretationInputSchema>;

// Per-card narration, matching the ReadingResult.cards shape from
// docs/MVP_PLAN_REVISED.md Aşama 7.
export const CardNarrationSchema = z.object({
  cardId: z.string(),
  position: CardPositionKeySchema,
  symbolicMeaning: z.string(),
  relevanceToQuestion: z.string(),
  reflection: z.string(),
});
export type CardNarration = z.infer<typeof CardNarrationSchema>;

const InterpretationOutputBaseSchema = z.object({
  opening: z.string().min(1),
  cards: z.array(CardNarrationSchema).length(3),
  patterns: z.array(z.string()),
  practicalReflection: z.string().min(1),
  uncertaintyNotice: z.string().min(1),
  safetyFlags: z.array(z.string()),
});

/**
 * RAW provider output (docs/ADR-UX-REFLECTION-PROMPT.md A1). A provider's
 * `reflectionPrompt` may be missing/unknown here; the engine normalizes it
 * (validate-or-central-fallback) BEFORE producing the final output, so the
 * final-schema parse never throws ahead of the field-level fallback.
 */
export const RawInterpretationOutputSchema = InterpretationOutputBaseSchema.extend({
  reflectionPrompt: z.string().optional(),
});
export type RawInterpretationOutput = z.infer<typeof RawInterpretationOutputSchema>;

/**
 * FINAL governed output. `reflectionPrompt` is a governed field: exactly one
 * reflective question, required and non-empty. It is produced through the
 * provider boundary (never client-authored) and is distinct from
 * uncertaintyNotice (a boundary statement, not a question) — ADR-UX-REFLECTION-PROMPT.
 */
export const InterpretationOutputSchema = InterpretationOutputBaseSchema.extend({
  reflectionPrompt: z.string().min(1),
});
export type InterpretationOutput = z.infer<typeof InterpretationOutputSchema>;
