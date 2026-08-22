import { describe, it, expect, beforeEach } from 'vitest';
import {
  CardInterpreterSkill,
  MAGICIAN_REFERENCE,
  type CardInterpretation
} from '../../server/knowledge/card-interpretation-generator';

describe('CardInterpreterSkill', () => {
  let skill: CardInterpreterSkill;

  beforeEach(() => {
    skill = new CardInterpreterSkill();
  });

  describe('Reference Card', () => {
    it('should have The Magician as reference', () => {
      expect(MAGICIAN_REFERENCE.cardId).toBe('01-magician');
      expect(MAGICIAN_REFERENCE.name_tr).toBe('Büyücü');
      expect(MAGICIAN_REFERENCE.number).toBe(1);
    });

    it('should have complete Magician structure', () => {
      expect(MAGICIAN_REFERENCE.symbolicMeaning).toBeTruthy();
      expect(MAGICIAN_REFERENCE.psychologicalReflection).toBeTruthy();
      expect(MAGICIAN_REFERENCE.keywords).toHaveLength(3);
      expect(MAGICIAN_REFERENCE.positionMeanings).toHaveProperty('past');
      expect(MAGICIAN_REFERENCE.positionMeanings).toHaveProperty('present');
      expect(MAGICIAN_REFERENCE.positionMeanings).toHaveProperty('future');
      expect(MAGICIAN_REFERENCE.contextualMeanings).toHaveProperty('relationship');
      expect(MAGICIAN_REFERENCE.contextualMeanings).toHaveProperty('career');
      expect(MAGICIAN_REFERENCE.contextualMeanings).toHaveProperty('general');
      expect(MAGICIAN_REFERENCE.reflectionQuestions).toHaveLength(2);
      expect(MAGICIAN_REFERENCE.redFlags).toHaveProperty('avoid');
      expect(MAGICIAN_REFERENCE.redFlags).toHaveProperty('instead');
    });
  });

  describe('Bundle Loading', () => {
    it('should load bundle successfully', () => {
      const bundle = skill.loadBundle();
      expect(bundle).toBeDefined();
      expect(bundle.cards).toBeDefined();
      expect(Array.isArray(bundle.cards)).toBe(true);
    });

    it('should find Magician in loaded bundle', () => {
      const magician = skill.getReferenceCard();
      expect(magician.cardId).toBe('01-magician');
    });

    it('should return 21 non-reference cards', () => {
      const nonRef = skill.getNonReferenceCards();
      expect(nonRef).toHaveLength(21);
      expect(nonRef.every((c) => c.cardId !== '01-magician')).toBe(true);
    });

    it('should have exactly 22 cards total', () => {
      const bundle = skill.loadBundle();
      expect(bundle.cards).toHaveLength(22);
    });
  });

  describe('Validation', () => {
    it('should validate Magician reference as correct', () => {
      const result = skill.validateInterpretation(MAGICIAN_REFERENCE);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing fields', () => {
      const incomplete: Partial<CardInterpretation> = {
        cardId: '99-test',
        name_en: 'Test',
        // missing name_tr
        number: 99
      };

      const result = skill.validateInterpretation(incomplete as CardInterpretation);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should check keyword count', () => {
      const badKeywords = { ...MAGICIAN_REFERENCE, keywords: ['only', 'two'] };
      const result = skill.validateInterpretation(badKeywords);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('keywords'))).toBe(true);
    });

    it('should check reflection questions count', () => {
      const badQuestions = { ...MAGICIAN_REFERENCE, reflectionQuestions: ['only one'] as any };
      const result = skill.validateInterpretation(badQuestions);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('reflectionQuestions'))).toBe(true);
    });

    it('should validate all position meanings', () => {
      const missingPositions = {
        ...MAGICIAN_REFERENCE,
        positionMeanings: { past: 'test', present: 'test' } // missing future
      };
      const result = skill.validateInterpretation(missingPositions as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('positionMeanings'))).toBe(true);
    });

    it('should validate all contextual meanings', () => {
      const missingContextual = {
        ...MAGICIAN_REFERENCE,
        contextualMeanings: { relationship: 'test', career: 'test' } // missing general
      };
      const result = skill.validateInterpretation(missingContextual as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('contextualMeanings'))).toBe(true);
    });
  });

  describe('Prompt Generation', () => {
    it('should generate prompt for a card', () => {
      const prompt = skill.generatePromptForCard(
        0,
        'The Fool',
        'Deli',
        'beginning, courage, open-mindedness'
      );

      expect(prompt).toContain('The Magician');
      expect(prompt).toContain('The Fool');
      expect(prompt).toContain('Deli');
      expect(prompt).toContain('symbolicMeaning');
      expect(prompt).toContain('psychologicalReflection');
    });

    it('should include reference card in prompt', () => {
      const prompt = skill.generatePromptForCard(5, 'The Hierophant', 'Hiyerofant', 'tradition');

      expect(prompt).toContain(MAGICIAN_REFERENCE.symbolicMeaning);
      expect(prompt).toContain(MAGICIAN_REFERENCE.psychologicalReflection);
    });

    it('should request JSON output format', () => {
      const prompt = skill.generatePromptForCard(10, 'Wheel of Fortune', 'Kaderin Tekerleği', 'destiny');

      expect(prompt).toContain('JSON');
      expect(prompt).toContain('cardId');
      expect(prompt).toContain('symbolicMeaning');
    });
  });

  describe('Audit', () => {
    it('should run audit on all cards', () => {
      const audit = skill.auditInterpretations();

      expect(audit.total).toBe(22);
      expect(audit.valid).toBeGreaterThan(0);
      expect(Array.isArray(audit.warnings)).toBe(true);
    });

    it('should identify valid cards', () => {
      const audit = skill.auditInterpretations();

      // At minimum, Magician should be valid
      const magicianWarning = audit.warnings.find((w) => w.cardId === '01-magician');
      expect(magicianWarning).toBeUndefined();
    });
  });

  describe('Integration with Bundle', () => {
    it('all cards should follow same structure', () => {
      const bundle = skill.loadBundle();

      for (const card of bundle.cards) {
        expect(card).toHaveProperty('cardId');
        expect(card).toHaveProperty('name_en');
        expect(card).toHaveProperty('name_tr');
        expect(card).toHaveProperty('number');
        expect(card).toHaveProperty('symbolicMeaning');
        expect(card).toHaveProperty('psychologicalReflection');
        expect(card).toHaveProperty('keywords');
        expect(card).toHaveProperty('positionMeanings');
        expect(card).toHaveProperty('contextualMeanings');
        expect(card).toHaveProperty('reflectionQuestions');
        expect(card).toHaveProperty('redFlags');
      }
    });

    it('all cards should have Turkish names', () => {
      const bundle = skill.loadBundle();

      for (const card of bundle.cards) {
        expect(card.name_tr).toBeTruthy();
        expect(card.name_tr.length).toBeGreaterThan(0);
      }
    });
  });
});
