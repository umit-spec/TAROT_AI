import { IntakeContext, Persona, QuestionDomain } from '../types/intake';
import { FramingPreview } from '../types/api';

/**
 * Turns the EXISTING classifyIntake() output into the two safe,
 * human-readable strings a framing preview may show
 * (docs/ADR-UX-FRAMING-PREVIEW.md R4/R12). This is a presentation-only
 * formatter:
 *
 *  - It adds NO new classifier, keyword set, or prediction logic. It reads
 *    only fields classifyIntake already computed.
 *  - It never emits a persona enum, confidence, emotional intensity, urgency,
 *    safety flag, provider name, a psychological diagnosis, or any inference
 *    about a third party. The persona only *selects* a curated safe phrase;
 *    the phrase itself never names the classification.
 *  - Every focus is phrased as the USER's own reflection ("...düşünebilir",
 *    "...gözden kaçırıyor olabileceğin..."), so a prediction-style question
 *    ("ne olacak?") or a third-party question ("o ne düşünüyor?") is reframed
 *    to the user's angle without ever producing a prediction or a claim about
 *    someone else.
 */

const TOPIC_LABELS: Record<QuestionDomain, string> = {
  relationship: 'İlişkiler',
  career: 'Kariyer',
  self: 'Kendin',
  general: 'Açık uçlu',
};

// Persona selects the reflective STANCE. Each string is user-focused,
// reflective, and free of prediction/diagnosis/third-party language.
const REFLECTIVE_FOCUS_BY_PERSONA: Record<Persona, string> = {
  'decision-seeking': 'Bu kararda gözden kaçırıyor olabileceğin etkenler',
  'reflection-seeking': 'Üzerine düşünmek isteyebileceğin açık uçlu yönler',
  'emotionally-overwhelmed': 'Şu an sana iyi gelebilecek, seni zorlamayan bir bakış',
  'curious-explorer': 'Merakını takip edebileceğin yeni bir bakış açısı',
  'experienced-practitioner': 'Deneyimine ekleyebileceğin bir düşünme açısı',
};

// Neutral framing for an empty / too-short question. Detected from the
// existing safety flag classifyIntake already sets - not re-derived here.
const EMPTY_INPUT_FLAG = 'empty_or_too_short_input';
const NEUTRAL_REFLECTIVE_FOCUS = 'Aklından geçenleri açık uçlu biçimde düşünmek';

export function presentFraming(intake: IntakeContext): FramingPreview {
  const topicLabel = TOPIC_LABELS[intake.questionDomain];

  const reflectiveFocus = intake.safetyFlags.includes(EMPTY_INPUT_FLAG)
    ? NEUTRAL_REFLECTIVE_FOCUS
    : REFLECTIVE_FOCUS_BY_PERSONA[intake.persona];

  return { topicLabel, reflectiveFocus };
}
