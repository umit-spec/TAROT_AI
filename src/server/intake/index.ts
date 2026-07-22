import { IntakeContext, IntakeContextSchema, IntakeRawInput } from '../../types/intake';
import { normalize } from './normalize';
import {
  scoreConfidence,
  scoreDomain,
  scoreEmotionalIntensity,
  scorePersona,
  scoreResponseDepth,
  scoreSpiritualPreference,
  scoreUrgency,
} from './rules';
import { computeSafetyFlags } from './safety';

/**
 * normalize -> rule evaluation -> confidence score -> persona + domain +
 * flags. No LLM call, no diagnosis, no personality verdict - a fixed rule
 * engine over form input + a controlled keyword layer over free text.
 * Ambiguity always resolves to the documented safe default:
 * persona: reflection-seeking, questionDomain: self, responseDepth: standard.
 */
export function classifyIntake(raw: IntakeRawInput): IntakeContext {
  const text = normalize(raw.questionText ?? '');

  const domainScoring = scoreDomain(text, raw.topicHint);
  const personaScoring = scorePersona(text);
  const emotionalIntensity = scoreEmotionalIntensity(text);
  const decisionUrgency = scoreUrgency(text);
  const spiritualPreference = scoreSpiritualPreference(text);
  const responseDepth = scoreResponseDepth(personaScoring.persona, emotionalIntensity);
  const safetyFlags = computeSafetyFlags(text, domainScoring.multiDomainDetected);
  const confidence = scoreConfidence(domainScoring.topScore, personaScoring.topScore);

  return IntakeContextSchema.parse({
    questionDomain: domainScoring.domain,
    persona: personaScoring.persona,
    emotionalIntensity,
    decisionUrgency,
    spiritualPreference,
    responseDepth,
    safetyFlags,
    confidence,
  });
}

export { toCardContext } from './rules';
