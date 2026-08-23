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

// cardId is listed explicitly and must match data/knowledge/bundle-v0.1.0.json
// exactly. It used to be reconstructed as `${number}-${name_en.slug}`, which
// silently produced "00-the-fool" / "01-the-magician" / etc. (the bundle
// drops the "The " prefix) - every "--card <id>" lookup for a "The ..." card
// failed with "Card not found" as a result.
const CARD_METADATA = [
  { cardId: '00-fool', number: 0, name_en: 'The Fool', name_tr: 'Deli', archetype: 'beginning, courage, open-mindedness' },
  { cardId: '01-magician', number: 1, name_en: 'The Magician', name_tr: 'Büyücü', archetype: 'will, skill, intention' },
  { cardId: '02-high-priestess', number: 2, name_en: 'The High Priestess', name_tr: 'Yüksek Rahibe', archetype: 'intuition, wisdom, mystery' },
  { cardId: '03-empress', number: 3, name_en: 'The Empress', name_tr: 'İmparatoriçe', archetype: 'fertility, creation, abundance' },
  { cardId: '04-emperor', number: 4, name_en: 'The Emperor', name_tr: 'İmparator', archetype: 'authority, structure, power' },
  { cardId: '05-hierophant', number: 5, name_en: 'The Hierophant', name_tr: 'Hiyerofant', archetype: 'tradition, wisdom, belief' },
  { cardId: '06-lovers', number: 6, name_en: 'The Lovers', name_tr: 'Âşıklar', archetype: 'love, choice, connection' },
  { cardId: '07-chariot', number: 7, name_en: 'The Chariot', name_tr: 'Savaş Arabası', archetype: 'will, determination, control' },
  { cardId: '08-strength', number: 8, name_en: 'Strength', name_tr: 'Güç', archetype: 'inner strength, patience, compassion' },
  { cardId: '09-hermit', number: 9, name_en: 'The Hermit', name_tr: 'Ermiş', archetype: 'introspection, search, wisdom' },
  { cardId: '10-wheel-of-fortune', number: 10, name_en: 'Wheel of Fortune', name_tr: 'Kaderin Tekerleği', archetype: 'destiny, cycles, change' },
  { cardId: '11-justice', number: 11, name_en: 'Justice', name_tr: 'Adalet', archetype: 'truth, accountability, fairness' },
  { cardId: '12-hanged-man', number: 12, name_en: 'The Hanged Man', name_tr: 'Asılı Adam', archetype: 'perspective, pause, sacrifice' },
  { cardId: '13-death', number: 13, name_en: 'Death', name_tr: 'Ölüm', archetype: 'transformation, endings, renewal' },
  { cardId: '14-temperance', number: 14, name_en: 'Temperance', name_tr: 'Denge', archetype: 'balance, moderation, patience' },
  { cardId: '15-devil', number: 15, name_en: 'The Devil', name_tr: 'Şeytan', archetype: 'bondage, materialism, shadow' },
  { cardId: '16-tower', number: 16, name_en: 'The Tower', name_tr: 'Kule', archetype: 'upheaval, revelation, ruin' },
  { cardId: '17-star', number: 17, name_en: 'The Star', name_tr: 'Yıldız', archetype: 'hope, inspiration, serenity' },
  { cardId: '18-moon', number: 18, name_en: 'The Moon', name_tr: 'Ay', archetype: 'illusion, fear, dreams' },
  { cardId: '19-sun', number: 19, name_en: 'The Sun', name_tr: 'Güneş', archetype: 'joy, success, warmth' },
  { cardId: '20-judgement', number: 20, name_en: 'Judgement', name_tr: 'Yargı', archetype: 'awakening, renewal, reckoning' },
  { cardId: '21-world', number: 21, name_en: 'The World', name_tr: 'Dünya', archetype: 'completion, fulfillment, wholeness' }
];

async function main() {
  const args = process.argv.slice(2);
  const skill = new CardInterpreterSkill();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Card Interpretation Generator - Magician Reference   ');
  console.log('═══════════════════════════════════════════════════════\n');

  // Handle --audit flag
  if (args.includes('--audit')) {
    console.log('Running per-card audit (strict)...\n');
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

    console.log('\nRunning bundle-wide consistency audit (cross-card)...\n');
    const integrity = skill.auditBundleIntegrity();
    if (integrity.valid) {
      console.log('✓ No cross-card consistency issues (numbering, ids, names, duplicated text, pairRelations).');
    } else {
      console.log(`✗ ${integrity.issues.length} cross-card issue(s) found:\n`);
      for (const issue of integrity.issues) {
        console.log(`  • ${issue}`);
      }
    }

    if (audit.warnings.length > 0 || !integrity.valid) {
      process.exitCode = 1;
    }
    return;
  }

  // Handle single card generation
  if (args.includes('--card')) {
    const cardIndex = args.indexOf('--card') + 1;
    const cardId = args[cardIndex];
    console.log(`Generating prompt for card: ${cardId}\n`);

    const cardMeta = CARD_METADATA.find((c) => c.cardId === cardId);

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

  // Handle --validate flag (add --save to also write the card into the bundle)
  if (args.includes('--validate')) {
    const shouldSave = args.includes('--save');
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

          if (shouldSave) {
            skill.upsertCard(card);
            console.log(`\n✓ Saved into bundle: ${card.cardId}`);
          } else {
            console.log('\n(Not saved - re-run with --validate --save to write this card into the bundle.)');
          }
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
    console.log(`       ${c.cardId}`);
  });
  console.log('    → ... and 19 others\n');
  console.log('  npx ts-node scripts/generate-card-interpretations.ts --validate [--save]');
  console.log('    → Validate generated JSON output; --save also writes it into the bundle\n');

  console.log('WORKFLOW:');
  console.log('  1. Run: --audit (check current state)');
  console.log('  2. Run: --card <ID> (get prompt for one card)');
  console.log('  3. Send prompt to Claude, get JSON');
  console.log('  4. Run: --validate --save (check output and write it into the bundle)\n');
}

main().catch(console.error);
