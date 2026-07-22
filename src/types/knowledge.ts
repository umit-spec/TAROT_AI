import { z } from 'zod';
import { CardDataSchema, CardIdSchema, CardPositionKeySchema } from './card';
import { PersonaSchema, QuestionDomainSchema, ResponseDepthSchema } from './intake';
import { SpreadTypeSchema } from './reading';

export const RelationTypeSchema = z.enum(['reinforces', 'contrasts', 'transforms', 'blocks', 'resolves']);
export type RelationType = z.infer<typeof RelationTypeSchema>;

export const PairRelationSchema = z.object({
  previousCardId: CardIdSchema,
  focusCardId: CardIdSchema,
  relationType: RelationTypeSchema,
  semanticEffect: z.array(z.string().min(1)),
  warnings: z.array(z.string()),
  // Always present, even when empty - ADR-012/Sprint 3 plan: real citations
  // are Milestone 3 work, but the response shape must not change when they
  // arrive, only stop being empty.
  sourceRefs: z.array(z.string()),
});
export type PairRelation = z.infer<typeof PairRelationSchema>;

export const PositionRuleSchema = z.object({
  position: CardPositionKeySchema,
  spread: SpreadTypeSchema,
  emphasis: z.enum(['low', 'medium', 'high']),
  framingGuidance: z.string().min(1),
});
export type PositionRule = z.infer<typeof PositionRuleSchema>;

export const DomainModifierSchema = z.object({
  domain: QuestionDomainSchema,
  emphasisKeywords: z.array(z.string()),
  cautionNotes: z.array(z.string()),
});
export type DomainModifier = z.infer<typeof DomainModifierSchema>;

export const PersonaModifierSchema = z.object({
  persona: PersonaSchema,
  toneGuidance: z.string().min(1),
  depthGuidance: ResponseDepthSchema.optional(),
});
export type PersonaModifier = z.infer<typeof PersonaModifierSchema>;

// `flag` values are whatever the Intake Engine's safetyFlags vocabulary
// produces (src/server/intake/keywords.ts, safety.ts) - not re-enumerated
// as its own Zod enum here, so the two lists can't drift out of sync by
// one of them being edited and not the other.
export const SafetyConstraintSchema = z.object({
  flag: z.string().min(1),
  action: z.enum(['block_reading', 'require_disclaimer', 'soften_language']),
  disclaimerText: z.string().optional(),
});
export type SafetyConstraint = z.infer<typeof SafetyConstraintSchema>;

export const KnowledgeBundleSchema = z.object({
  version: z.string().min(1),
  cards: z.array(CardDataSchema).length(22),
  pairRelations: z.array(PairRelationSchema),
  positionRules: z.array(PositionRuleSchema),
  domainModifiers: z.array(DomainModifierSchema),
  personaModifiers: z.array(PersonaModifierSchema),
  safetyConstraints: z.array(SafetyConstraintSchema),
});
export type KnowledgeBundle = z.infer<typeof KnowledgeBundleSchema>;

/**
 * The resolved, reading-specific slice actually handed to a provider - not
 * the whole bundle. domainModifier/personaModifier are nullable singles,
 * not arrays: a given reading has exactly one questionDomain and one
 * persona, so at most one modifier of each kind can match - not multiple.
 */
export const KnowledgeContextSchema = z.object({
  pairRelations: z.array(PairRelationSchema), // 0-2 entries for a 3-card spread (adjacent pairs only)
  positionRules: z.array(PositionRuleSchema), // exactly the drawn positions, when rules exist for them
  domainModifier: DomainModifierSchema.nullable(),
  personaModifier: PersonaModifierSchema.nullable(),
  safetyConstraints: z.array(SafetyConstraintSchema), // matching intake.safetyFlags, may be empty
});
export type KnowledgeContext = z.infer<typeof KnowledgeContextSchema>;

export const EMPTY_KNOWLEDGE_CONTEXT: KnowledgeContext = {
  pairRelations: [],
  positionRules: [],
  domainModifier: null,
  personaModifier: null,
  safetyConstraints: [],
};

/**
 * 'resolved': every lookup the reading could plausibly need had a bundle
 * entry. 'partial': resolution ran without error, but the proof-of-concept
 * bundle is missing an entry for this domain/persona - not a failure, just
 * incomplete data, and worth being able to see that distinction rather than
 * silently returning null. 'fallback': the KnowledgeProvider itself threw;
 * the orchestrator substituted EMPTY_KNOWLEDGE_CONTEXT.
 */
export const KnowledgeResolutionStatusSchema = z.enum(['resolved', 'partial', 'fallback']);
export type KnowledgeResolutionStatus = z.infer<typeof KnowledgeResolutionStatusSchema>;

export const KnowledgeResolutionMetaSchema = z.object({
  status: KnowledgeResolutionStatusSchema,
  provider: z.string(),
  version: z.string(), // KnowledgeBundle.version, or "unknown" on fallback
  errorCode: z.string().optional(),
});
export type KnowledgeResolutionMeta = z.infer<typeof KnowledgeResolutionMetaSchema>;

export const KnowledgeResolutionResultSchema = z.object({
  meta: KnowledgeResolutionMetaSchema,
  context: KnowledgeContextSchema,
});
export type KnowledgeResolutionResult = z.infer<typeof KnowledgeResolutionResultSchema>;

export const KnowledgeVersionSchema = z.object({
  deck: z.string(),
  algorithm: z.string(),
  knowledge: z.string(),
  prompt: z.string(),
});
export type KnowledgeVersion = z.infer<typeof KnowledgeVersionSchema>;
