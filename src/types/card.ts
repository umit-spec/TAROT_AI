import { z } from 'zod';

export const CardPositionKeySchema = z.enum(['past', 'present', 'future']);
export type CardPositionKey = z.infer<typeof CardPositionKeySchema>;

export const CardContextKeySchema = z.enum(['relationship', 'career', 'general']);
export type CardContextKey = z.infer<typeof CardContextKeySchema>;

// Shared with src/types/knowledge.ts (PairRelation) - one definition so the
// canonical NN-cardname format can't drift between the two.
export const CardIdSchema = z.string().regex(/^\d{2}-[a-z-]+$/, 'cardId must match canonical NN-cardname format');

export const CardDataSchema = z.object({
  cardId: CardIdSchema,
  name_en: z.string().min(1),
  name_tr: z.string().min(1),
  arcana: z.literal('major'),
  number: z.number().int().min(0).max(21),
  symbolicMeaning: z.string().min(1),
  psychologicalReflection: z.string().min(1),
  keywords: z.array(z.string().min(1)).min(1),
  // Explicit required keys (not z.record) so every card is guaranteed to
  // have all three positions/contexts - z.record with an enum key infers
  // Partial<Record<...>>, which would let a missing translation slip through.
  positionMeanings: z.object({
    past: z.string().min(1),
    present: z.string().min(1),
    future: z.string().min(1),
  }),
  contextualMeanings: z.object({
    relationship: z.string().min(1),
    career: z.string().min(1),
    general: z.string().min(1),
  }),
  reflectionQuestions: z.array(z.string().min(1)).min(1),
  redFlags: z.object({
    avoid: z.array(z.string().min(1)),
    instead: z.string().min(1),
  }),
});

export type CardData = z.infer<typeof CardDataSchema>;
