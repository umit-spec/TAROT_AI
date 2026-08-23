import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
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

    it('must stay in sync with the bundle\'s own 01-magician entry', () => {
      // generatePromptForCard() reads the live bundle, not this constant, so
      // this constant is now only used by tests/exports. If the bundle's
      // Magician entry is ever edited without updating this constant, this
      // test is what catches the drift.
      const liveReference = skill.getReferenceCard();
      expect(MAGICIAN_REFERENCE).toEqual(liveReference);
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

    it('should reject an empty redFlags.avoid array (previously passed silently)', () => {
      // `!card.redFlags.avoid` is false for `[]` since empty arrays are
      // truthy in JS - the old check only tested for that falsy case, so an
      // empty array satisfied a rule whose error text claimed "non-empty".
      const emptyAvoid = { ...MAGICIAN_REFERENCE, redFlags: { ...MAGICIAN_REFERENCE.redFlags, avoid: [] } };
      const result = skill.validateInterpretation(emptyAvoid);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('redFlags.avoid'))).toBe(true);
    });

    it('should reject more than 3 redFlags.avoid items', () => {
      const tooMany = {
        ...MAGICIAN_REFERENCE,
        redFlags: { ...MAGICIAN_REFERENCE.redFlags, avoid: ['a', 'b', 'c', 'd'] }
      };
      const result = skill.validateInterpretation(tooMany);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('redFlags.avoid'))).toBe(true);
    });

    it('should require redFlags.instead', () => {
      const missingInstead = { ...MAGICIAN_REFERENCE, redFlags: { avoid: MAGICIAN_REFERENCE.redFlags.avoid, instead: '' } };
      const result = skill.validateInterpretation(missingInstead);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('redFlags.instead'))).toBe(true);
    });

    it('should flag suspected English content in Turkish-only fields', () => {
      const englishLeak = {
        ...MAGICIAN_REFERENCE,
        symbolicMeaning: 'This card represents the journey you must take with your will.'
      };
      const result = skill.validateInterpretation(englishLeak);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Suspected English'))).toBe(true);
    });

    it('should not flag genuine Turkish content as English', () => {
      const result = skill.validateInterpretation(MAGICIAN_REFERENCE);
      expect(result.errors.some((e) => e.includes('Suspected English'))).toBe(false);
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
    it('should default to strict validation', () => {
      // auditInterpretations() used to default to strict=false, so
      // "npm run cards:audit" reported 22/22 valid while 18 of those cards
      // were actually failing the Magician length pattern - the audit
      // command couldn't catch the exact problem it exists to catch.
      const strictDefault = skill.auditInterpretations();
      const explicitStrict = skill.auditInterpretations(true);
      expect(strictDefault).toEqual(explicitStrict);
    });

    it('should run audit on all cards and report all 22 as valid', () => {
      const audit = skill.auditInterpretations();

      expect(audit.total).toBe(22);
      expect(audit.valid).toBe(22);
      expect(audit.warnings).toHaveLength(0);
    });

    it('should identify valid cards', () => {
      const audit = skill.auditInterpretations();

      // At minimum, Magician should be valid
      const magicianWarning = audit.warnings.find((w) => w.cardId === '01-magician');
      expect(magicianWarning).toBeUndefined();
    });

    it('should support an explicit non-strict pass', () => {
      const audit = skill.auditInterpretations(false);
      expect(audit.total).toBe(22);
      expect(audit.valid).toBe(22);
    });
  });

  describe('auditBundleIntegrity (cross-card consistency)', () => {
    // Per-card validateInterpretation() only ever looks at one card, so it
    // cannot catch a duplicated number, a copy-pasted sentence reused across
    // two cards, or a pairRelations entry pointing at a cardId that doesn't
    // exist. This is what actually checks that.
    it('should report the current bundle as internally consistent', () => {
      const result = skill.auditBundleIntegrity();
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect a duplicated card number', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'card-interpreter-test-'));
      try {
        const bundle = JSON.parse(
          readFileSync(join(process.cwd(), 'data', 'knowledge', 'bundle-v0.1.0.json'), 'utf-8')
        );
        bundle.cards[1].number = bundle.cards[0].number; // duplicate 0-fool's number onto 1-magician
        writeFileSync(join(tempDir, 'bundle-v0.1.0.json'), JSON.stringify(bundle));

        const scoped = new CardInterpreterSkill(tempDir);
        const result = scoped.auditBundleIntegrity();
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.includes('Duplicate card numbers'))).toBe(true);
        expect(result.issues.some((i) => i.includes('Missing card numbers'))).toBe(true);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should detect duplicated interpretive text reused across two cards', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'card-interpreter-test-'));
      try {
        const bundle = JSON.parse(
          readFileSync(join(process.cwd(), 'data', 'knowledge', 'bundle-v0.1.0.json'), 'utf-8')
        );
        bundle.cards[1].symbolicMeaning = bundle.cards[0].symbolicMeaning; // copy-paste artifact
        writeFileSync(join(tempDir, 'bundle-v0.1.0.json'), JSON.stringify(bundle));

        const scoped = new CardInterpreterSkill(tempDir);
        const result = scoped.auditBundleIntegrity();
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.includes('Duplicate symbolicMeaning'))).toBe(true);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should detect a pairRelations entry pointing at an unknown cardId', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'card-interpreter-test-'));
      try {
        const bundle = JSON.parse(
          readFileSync(join(process.cwd(), 'data', 'knowledge', 'bundle-v0.1.0.json'), 'utf-8')
        );
        bundle.pairRelations.push({ previousCardId: '99-nonexistent', focusCardId: '01-magician' });
        writeFileSync(join(tempDir, 'bundle-v0.1.0.json'), JSON.stringify(bundle));

        const scoped = new CardInterpreterSkill(tempDir);
        const result = scoped.auditBundleIntegrity();
        expect(result.valid).toBe(false);
        expect(result.issues.some((i) => i.includes('99-nonexistent'))).toBe(true);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('upsertCard + saveBundle', () => {
    let tempDir: string;
    let scopedSkill: CardInterpreterSkill;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'card-interpreter-test-'));
      copyFileSync(
        join(process.cwd(), 'data', 'knowledge', 'bundle-v0.1.0.json'),
        join(tempDir, 'bundle-v0.1.0.json')
      );
      scopedSkill = new CardInterpreterSkill(tempDir);
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should persist a new card into the bundle file', () => {
      const newCard: CardInterpretation = {
        ...MAGICIAN_REFERENCE,
        cardId: '99-test-card',
        name_en: 'Test Card',
        name_tr: 'Test Kartı',
        number: 99
      };

      scopedSkill.upsertCard(newCard);

      const written = JSON.parse(readFileSync(join(tempDir, 'bundle-v0.1.0.json'), 'utf-8'));
      const found = written.cards.find((c: CardInterpretation) => c.cardId === '99-test-card');
      expect(found).toBeDefined();
      expect(found.name_tr).toBe('Test Kartı');
      expect(written.cards).toHaveLength(23);
    });

    it('should replace an existing card by cardId rather than duplicate it', () => {
      const updatedMagician: CardInterpretation = {
        ...MAGICIAN_REFERENCE,
        symbolicMeaning: 'Değiştirilmiş test içeriği, en az yedi kelimeden oluşan bir cümle.'
      };

      scopedSkill.upsertCard(updatedMagician);

      const written = JSON.parse(readFileSync(join(tempDir, 'bundle-v0.1.0.json'), 'utf-8'));
      const magicianEntries = written.cards.filter((c: CardInterpretation) => c.cardId === '01-magician');
      expect(magicianEntries).toHaveLength(1);
      expect(magicianEntries[0].symbolicMeaning).toBe(updatedMagician.symbolicMeaning);
      expect(written.cards).toHaveLength(22);
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
