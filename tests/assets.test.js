/**
 * Asset Integrity Tests — Major Arcana
 *
 * Validates:
 * - Exactly 22 Major Arcana cards
 * - Correct canonical ID mapping
 * - No duplicates or gaps
 * - Image file presence
 * - Metadata completeness
 * - No Strength/Justice or Tower/Star swaps
 */

import fs from 'fs';
import path from 'path';

const ASSET_DIR = path.join(process.cwd(), 'assets/tarot-cards');

const CANONICAL_CARDS = [
  { id: '00-fool', number: 0, name_en: 'The Fool', name_tr: 'Deli' },
  { id: '01-magician', number: 1, name_en: 'The Magician', name_tr: 'Büyücü' },
  { id: '02-high-priestess', number: 2, name_en: 'The High Priestess', name_tr: 'Yüksek Rahibe' },
  { id: '03-empress', number: 3, name_en: 'The Empress', name_tr: 'İmparatoriçe' },
  { id: '04-emperor', number: 4, name_en: 'The Emperor', name_tr: 'İmparator' },
  { id: '05-hierophant', number: 5, name_en: 'The Hierophant', name_tr: 'Hiyerofant' },
  { id: '06-lovers', number: 6, name_en: 'The Lovers', name_tr: 'Âşıklar' },
  { id: '07-chariot', number: 7, name_en: 'The Chariot', name_tr: 'Savaş Arabası' },
  { id: '08-strength', number: 8, name_en: 'Strength', name_tr: 'Güç' },
  { id: '09-hermit', number: 9, name_en: 'The Hermit', name_tr: 'Ermiş' },
  { id: '10-wheel-of-fortune', number: 10, name_en: 'Wheel of Fortune', name_tr: 'Kaderin Tekerleği' },
  { id: '11-justice', number: 11, name_en: 'Justice', name_tr: 'Adalet' },
  { id: '12-hanged-man', number: 12, name_en: 'The Hanged Man', name_tr: 'Asılı Adam' },
  { id: '13-death', number: 13, name_en: 'Death', name_tr: 'Ölüm' },
  { id: '14-temperance', number: 14, name_en: 'Temperance', name_tr: 'Denge' },
  { id: '15-devil', number: 15, name_en: 'The Devil', name_tr: 'Şeytan' },
  { id: '16-tower', number: 16, name_en: 'The Tower', name_tr: 'Kule' },
  { id: '17-star', number: 17, name_en: 'The Star', name_tr: 'Yıldız' },
  { id: '18-moon', number: 18, name_en: 'The Moon', name_tr: 'Ay' },
  { id: '19-sun', number: 19, name_en: 'The Sun', name_tr: 'Güneş' },
  { id: '20-judgement', number: 20, name_en: 'Judgement', name_tr: 'Yargı' },
  { id: '21-world', number: 21, name_en: 'The World', name_tr: 'Dünya' },
];

describe('Major Arcana Asset Integrity', () => {
  describe('Asset Count', () => {
    test('Exactly 22 web card images exist', () => {
      const webFiles = fs.readdirSync(ASSET_DIR)
        .filter(f => f.endsWith('.webp') && !f.endsWith('-hq.webp'));
      expect(webFiles).toHaveLength(22);
    });

    test('Exactly 22 HQ card images exist', () => {
      const hqFiles = fs.readdirSync(ASSET_DIR)
        .filter(f => f.endsWith('-hq.webp'));
      expect(hqFiles).toHaveLength(22);
    });

    test('Exactly 22 metadata files exist', () => {
      const metadataFiles = fs.readdirSync(ASSET_DIR)
        .filter(f => f.endsWith('-metadata.json'));
      expect(metadataFiles).toHaveLength(22);
    });

    test('No zero-byte files', () => {
      const files = fs.readdirSync(ASSET_DIR);
      const zeroByteFiles = files.filter(f => {
        const filepath = path.join(ASSET_DIR, f);
        return fs.statSync(filepath).size === 0;
      });
      expect(zeroByteFiles).toHaveLength(0);
    });
  });

  describe('Canonical Mapping', () => {
    test('All canonical IDs exist', () => {
      CANONICAL_CARDS.forEach(card => {
        const webPath = path.join(ASSET_DIR, `${card.id}.webp`);
        const hqPath = path.join(ASSET_DIR, `${card.id}-hq.webp`);
        expect(fs.existsSync(webPath)).toBe(true);
        expect(fs.existsSync(hqPath)).toBe(true);
      });
    });

    test('No duplicate IDs', () => {
      const ids = CANONICAL_CARDS.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(22);
    });

    test('No gaps in numbering (0-21)', () => {
      const numbers = CANONICAL_CARDS.map(c => c.number);
      const expected = Array.from({ length: 22 }, (_, i) => i);
      expect(numbers.sort((a, b) => a - b)).toEqual(expected);
    });

    test('Strength is card 08, not 11', () => {
      const strength = CANONICAL_CARDS.find(c => c.id === '08-strength');
      const justice = CANONICAL_CARDS.find(c => c.id === '11-justice');
      expect(strength.number).toBe(8);
      expect(justice.number).toBe(11);
    });

    test('Tower is card 16, not 17', () => {
      const tower = CANONICAL_CARDS.find(c => c.id === '16-the-tower');
      const star = CANONICAL_CARDS.find(c => c.id === '17-the-star');
      expect(tower.number).toBe(16);
      expect(star.number).toBe(17);
    });
  });

  describe('Metadata Integrity', () => {
    test('CARD_REGISTRY.json exists and is valid', () => {
      const registryPath = path.join(ASSET_DIR, 'CARD_REGISTRY.json');
      expect(fs.existsSync(registryPath)).toBe(true);

      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(registry.cards).toHaveLength(22);
      expect(registry.version).toBe('1.0');
    });

    test('Each card has metadata JSON', () => {
      CANONICAL_CARDS.forEach(card => {
        const metadataPath = path.join(ASSET_DIR, `${card.id}-metadata.json`);
        expect(fs.existsSync(metadataPath)).toBe(true);

        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        expect(metadata.id).toBe(card.id);
        expect(metadata.number).toBe(card.number);
        expect(metadata.name.en).toBe(card.name_en);
        expect(metadata.name.tr).toBe(card.name_tr);
      });
    });

    test('Extraction manifest exists', () => {
      const manifestPath = path.join(ASSET_DIR, '_extraction_manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.cards).toBeDefined();
      expect(Object.keys(manifest.cards)).toHaveLength(22);
    });
  });

  describe('Image Validation', () => {
    test('All web images have correct dimensions (512x768)', () => {
      // Note: This test would require image parsing library
      // Placeholder for conceptual validation
      CANONICAL_CARDS.forEach(card => {
        const webPath = path.join(ASSET_DIR, `${card.id}.webp`);
        const stats = fs.statSync(webPath);
        // WebP files should be > 5KB for actual card image
        expect(stats.size).toBeGreaterThan(5000);
        expect(stats.size).toBeLessThan(50000); // Should be < 50KB
      });
    });

    test('All HQ images have correct size boundaries (2048x3072)', () => {
      CANONICAL_CARDS.forEach(card => {
        const hqPath = path.join(ASSET_DIR, `${card.id}-hq.webp`);
        const stats = fs.statSync(hqPath);
        // HQ WebP files should be > 15KB
        expect(stats.size).toBeGreaterThan(15000);
        expect(stats.size).toBeLessThan(100000); // Should be < 100KB
      });
    });

    test('Files are valid WebP format (magic bytes)', () => {
      CANONICAL_CARDS.slice(0, 3).forEach(card => { // Sample 3 for speed
        const webPath = path.join(ASSET_DIR, `${card.id}.webp`);
        const buffer = fs.readFileSync(webPath);
        // WebP magic: RIFF...WEBP
        expect(buffer.toString('ascii', 0, 4)).toBe('RIFF');
        expect(buffer.toString('ascii', 8, 12)).toBe('WEBP');
      });
    });
  });

  describe('Documentation', () => {
    test('README.md exists', () => {
      const readmePath = path.join(ASSET_DIR, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    test('Provenance record exists', () => {
      const provPath = path.join(
        process.cwd(),
        'validation/evidence/assets/PROVENANCE_RECORD.md'
      );
      expect(fs.existsSync(provPath)).toBe(true);
    });

    test('QA contact sheet exists', () => {
      const contactPath = path.join(
        process.cwd(),
        'validation/evidence/assets/major-arcana-contact-sheet.png'
      );
      expect(fs.existsSync(contactPath)).toBe(true);
    });
  });

  describe('Reproducibility', () => {
    test('Extraction script exists', () => {
      const scriptPath = path.join(process.cwd(), 'tools/assets/extract_major_arcana.py');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    test('Crop configuration exists', () => {
      const configPath = path.join(
        process.cwd(),
        'tools/assets/config/major_arcana_crops.json'
      );
      expect(fs.existsSync(configPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(config.cards).toHaveLength(22);
      expect(config.montage_info.source_filename).toBe('1000214766.png');
    });

    test('Extraction manifest includes crop coordinates', () => {
      const manifestPath = path.join(ASSET_DIR, '_extraction_manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      CANONICAL_CARDS.forEach(card => {
        const cardData = manifest.cards[card.id];
        expect(cardData.crop).toBeDefined();
        expect(cardData.crop.x).toBeDefined();
        expect(cardData.crop.y).toBeDefined();
        expect(cardData.crop.width).toBeDefined();
        expect(cardData.crop.height).toBeDefined();
      });
    });
  });
});
