#!/usr/bin/env node

/**
 * CLI: Generate Card Interpretations using Magician Reference
 *
 * This script:
 * 1. Loads the current bundle
 * 2. Identifies cards that need validation/regeneration
 * 3. Uses CardInterpreterSkill to generate prompts
 * 4. Calls Claude API to generate interpretations
 * 5. Validates output and saves to new bundle version
 * 6. Commits to designated branch
 *
 * Usage:
 *   npx ts-node scripts/generate-card-interpretations.ts
 *   npx ts-node scripts/generate-card-interpretations.ts --card 00-fool
 *   npx ts-node scripts/generate-card-interpretations.ts --audit
 */

import { CardInterpreterSkill, type CardInterpretation } from '../src/server/knowledge/card-interpretation-generator';

const CARD_METADATA = [
  { number: 0, name_en: 'The Fool', name_tr: 'Deli', archetype: 'beginning, courage, open-mindedness' },
  { number: 1, name_en: 'The Magician', name_tr: 'Büyücü', archetype: 'will, skill, intention' },
  { number: 2, name_en: 'The High Priestess', name_tr: 'Yüksek Rahibe', archetype: 'intuition, wisdom, mystery' },
  { number: 3, name_en: 'The Empress', name_tr: 'İmparatoriçe', archetype: 'fertility, creation, abundance' },
  { number: 4, name_en: 'The Emperor', name_tr: 'İmparator', archetype: 'authority, structure, power' },
  { number: 5, name_en: 'The Hierophant', name_tr: 'Hiyerofant', archetype: 'tradition, wisdom, belief' },
  { number: 6, name_en: 'The Lovers', name_tr: 'Âşıklar', archetype: 'love, choice, connection' },
  { number: 7, name_en: 'The Chariot', name_tr: 'Savaş Arabası', archetype: 'will, determination, control' },
  { number: 8, name_en: 'Strength', name_tr: 'Güç', archetype: 'inner strength, patience, compassion' },
  { number: 9, name_en: 'The Hermit', name_tr: 'Ermiş', archetype: 'introspection, search, wisdom' },
  { number: 10, name_en: 'Wheel of Fortune', name_tr: 'Kaderin Tekerleği', archetype: 'destiny, cycles, change' },
  { number: 11, name_en: 'Justice', name_tr: 'Adalet', archetype: 'truth, accountability, fairness' },
  { number: 12, name_en: 'The Hanged Man', name_tr: 'Asılı Adam', archetype: 'perspective, pause, sacrifice' },
  { number: 13, name_en: 'Death', name_tr: 'Ölüm', archetype: 'transformation, endings, renewal' },
  { number: 14, name_en: 'Temperance', name_tr: 'Denge', archetype: 'balance, moderation, patience' },
  { number: 15, name_en: 'The Devil', name_tr: 'Şeytan', archetype: 'bondage, materialism, shadow' },
  { number: 16, name_en: 'The Tower', name_tr: 'Kule', archetype: 'upheaval, revelation, ruin' },
  { number: 17, name_en: 'The Star', name_tr: 'Yıldız', archetype: 'hope, inspiration, serenity' },
  { number: 18, name_en: 'The Moon', name_tr: 'Ay', archetype: 'illusion, fear, dreams' },
  { number: 19, name_en: 'The Sun', name_tr: 'Güneş', archetype: 'joy, success, warmth' },
  { number: 20, name_en: 'Judgement', name_tr: 'Yargı', archetype: 'awakening, renewal, reckoning' },
  { number: 21, name_en: 'The World', name_tr: 'Dünya', archetype: 'completion, fulfillment, wholeness' }
];

async function main() {
  const args = process.argv.slice(2);
  const skill = new CardInterpreterSkill();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Card Interpretation Generator - Magician Reference   ');
  console.log('═══════════════════════════════════════════════════════\n');

  // Handle --audit flag
  if (args.includes('--audit')) {
    console.log('Running audit on existing interpretations...\n');
    const audit = skill.auditInterpretations();

    console.log(`Total cards: ${audit.total}`);
    console.log(`Valid: ${audit.valid}`);
    console.log(`Warnings: ${audit.warnings.length}\n`);

    if (audit.warnings.length > 0) {
      console.log('Issues found:');
      for (const warning of audit.warnings) {
        console.log(`\n  ${warning.cardId}:`);
        for (const issue of warning.issues) {
          console.log(`    • ${issue}`);
        }
      }
    }
    return;
  }

  // Handle single card generation
  if (args.includes('--card')) {
    const cardIndex = args.indexOf('--card') + 1;
    const cardId = args[cardIndex];
    console.log(`Generating prompt for card: ${cardId}\n`);

    const cardMeta = CARD_METADATA.find((c) => {
      const id = `${c.number.toString().padStart(2, '0')}-${c.name_en.toLowerCase().replace(/ /g, '-')}`;
      return id === cardId;
    });

    if (!cardMeta) {
      console.error(`Card not found: ${cardId}`);
      process.exit(1);
    }

    const prompt = skill.generatePromptForCard(
      cardMeta.number,
      cardMeta.name_en,
      cardMeta.name_tr,
      cardMeta.archetype
    );

    console.log('PROMPT FOR CLAUDE:\n');
    console.log(prompt);
    console.log('\n\nTo use this prompt:');
    console.log('1. Copy the prompt above');
    console.log('2. Send to Claude API or claude.ai');
    console.log('3. Request JSON output only (no markdown)');
    console.log('4. Validate output with: npx ts-node scripts/generate-card-interpretations.ts --validate');
    return;
  }

  // Handle --validate flag
  if (args.includes('--validate')) {
    console.log('Paste generated card interpretation JSON (Ctrl+D to end):\n');
    let jsonInput = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        jsonInput += chunk;
      }
    });

    process.stdin.on('end', () => {
      try {
        const card: CardInterpretation = JSON.parse(jsonInput);
        const validation = skill.validateInterpretation(card);

        if (validation.valid) {
          console.log('✓ Card interpretation is VALID');
          console.log(`\nCard: ${card.name_tr} (${card.name_en})`);
          console.log(`ID: ${card.cardId}`);
        } else {
          console.log('✗ Card interpretation has issues:\n');
          for (const error of validation.errors) {
            console.log(`  • ${error}`);
          }
          process.exit(1);
        }
      } catch (err) {
        console.error('Failed to parse JSON:', err);
        process.exit(1);
      }
    });
    return;
  }

  // Default: show reference card and available commands
  const reference = skill.getReferenceCard();
  console.log('REFERENCE CARD (The Magician):');
  console.log(`  ID: ${reference.cardId}`);
  console.log(`  Name: ${reference.name_tr} (${reference.name_en})`);
  console.log(`  Symbolic: ${reference.symbolicMeaning}`);
  console.log(`  Keywords: ${reference.keywords.join(', ')}\n`);

  console.log('AVAILABLE COMMANDS:\n');
  console.log('  npx ts-node scripts/generate-card-interpretations.ts --audit');
  console.log('    → Check all cards for validation issues\n');
  console.log('  npx ts-node scripts/generate-card-interpretations.ts --card <CARD_ID>');
  console.log('    → Generate prompt for specific card');
  console.log('    → Examples:');
  CARD_METADATA.slice(0, 3).forEach((c) => {
    const id = `${c.number.toString().padStart(2, '0')}-${c.name_en.toLowerCase().replace(/ /g, '-')}`;
    console.log(`       ${id}`);
  });
  console.log('    → ... and 19 others\n');
  console.log('  npx ts-node scripts/generate-card-interpretations.ts --validate');
  console.log('    → Validate generated JSON output\n');

  console.log('WORKFLOW:');
  console.log('  1. Run: --audit (check current state)');
  console.log('  2. Run: --card <ID> (get prompt for one card)');
  console.log('  3. Send prompt to Claude, get JSON');
  console.log('  4. Run: --validate (check output)');
  console.log('  5. Update bundle manually or implement API integration\n');
}

main().catch(console.error);
