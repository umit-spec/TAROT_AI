import { IntakeContext } from '../../types/intake';
import { KnowledgeResolutionResult } from '../../types/knowledge';
import { DeterministicReading } from '../../types/reading';
import { loadKnowledgeBundle } from './bundle';
import { KnowledgeProvider } from './types';

export class LocalJsonKnowledgeProvider implements KnowledgeProvider {
  readonly name = 'local-json';

  async resolveContext(reading: DeterministicReading, intake: IntakeContext): Promise<KnowledgeResolutionResult> {
    const bundle = loadKnowledgeBundle(); // throws on load/validation failure - caller (resolveKnowledge) catches

    const cardIds = reading.cards.map((c) => c.id);
    const pairRelations = bundle.pairRelations.filter((rel) =>
      cardIds.some((id, i) => id === rel.previousCardId && cardIds[i + 1] === rel.focusCardId)
    );

    const drawnPositions = new Set(reading.cards.map((c) => c.position));
    const positionRules = bundle.positionRules.filter(
      (rule) => rule.spread === reading.spread && drawnPositions.has(rule.position)
    );

    const domainModifier = bundle.domainModifiers.find((dm) => dm.domain === intake.questionDomain) ?? null;
    const personaModifier = bundle.personaModifiers.find((pm) => pm.persona === intake.persona) ?? null;

    const safetyConstraints = bundle.safetyConstraints.filter((sc) => intake.safetyFlags.includes(sc.flag));

    // Missing domain/persona coverage or an incomplete position-rule set is
    // a real (if harmless) data gap in this proof-of-concept bundle, worth
    // surfacing as 'partial' rather than silently reporting 'resolved'. An
    // empty pairRelations list is NOT by itself partial - most card pairs
    // simply have no authored relation yet, and that's expected at this
    // bundle's size, not a completeness failure.
    const isPartial = domainModifier === null || personaModifier === null || positionRules.length < drawnPositions.size;

    return {
      meta: {
        status: isPartial ? 'partial' : 'resolved',
        provider: this.name,
        version: bundle.version,
      },
      context: {
        pairRelations,
        positionRules,
        domainModifier,
        personaModifier,
        safetyConstraints,
      },
    };
  }
}
