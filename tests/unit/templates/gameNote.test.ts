import { describe, it, expect } from 'vitest';

import {
  generateGameNote,
  generateFileName,
} from '../../../src/templates/gameNote';
import type { GameData } from '../../../src/ui/AddGameModal';

describe('gameNote', () => {
  describe('generateFileName', () => {
    it('should generate filename with emoji prefix', () => {
      const result = generateFileName('The Witcher 3');
      expect(result).toBe('🎮 The Witcher 3.md');
    });

    it('should remove invalid filename characters', () => {
      const result = generateFileName('Game: The "Test" Edition');
      expect(result).toBe('🎮 Game The Test Edition.md');
    });

    it('should remove all invalid characters', () => {
      const result = generateFileName('Test<>:/\\|?*Game');
      expect(result).toBe('🎮 TestGame.md');
    });

    it('should normalize whitespace', () => {
      const result = generateFileName('Game   With    Spaces');
      expect(result).toBe('🎮 Game With Spaces.md');
    });

    it('should trim whitespace', () => {
      const result = generateFileName('  Trimmed Title  ');
      expect(result).toBe('🎮 Trimmed Title.md');
    });

    it('should handle unicode characters', () => {
      const result = generateFileName('Pokémon Legends: Arceus');
      expect(result).toBe('🎮 Pokémon Legends Arceus.md');
    });

    it('should handle empty string', () => {
      const result = generateFileName('');
      expect(result).toBe('🎮 .md');
    });
  });

  describe('generateGameNote', () => {
    const completeGameData: GameData = {
      title: 'The Witcher 3: Wild Hunt',
      platform: 'Steam Deck',
      priority: 'À jouer absolument',
      rating: 92,
      hltbHours: 50.5,
      efficiency: 1.82,
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
      description: 'An action role-playing game set in an open world environment.',
      igdbId: 1942,
      genres: ['Role-playing (RPG)', 'Adventure'],
      releaseYear: 2015,
    };

    it('should generate complete note with all data', () => {
      const result = generateGameNote(completeGameData);

      // Check frontmatter
      expect(result).toContain('---');
      expect(result).toContain('title: "The Witcher 3: Wild Hunt"');
      expect(result).toContain('platform: "Steam Deck"');
      expect(result).toContain('priority: "À jouer absolument"');
      expect(result).toContain('rating: 92');
      expect(result).toContain('hltb_hours: 50.5');
      expect(result).toContain('efficiency: 1.82');
      expect(result).toContain('cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg"');
      expect(result).toContain('igdb_id: 1942');
      expect(result).toContain('release_year: 2015');
      expect(result).toContain('genres:');
      expect(result).toContain('  - "Role-playing (RPG)"');
      expect(result).toContain('  - "Adventure"');
      expect(result).toContain('tags:');
      expect(result).toContain('  - game');
      expect(result).toContain('  - backlog');

      // Check body
      expect(result).toContain('![cover](https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg)');
      expect(result).toContain('**Rating:** 92');
      expect(result).toContain('**HLTB:** 50.5h');
      expect(result).toContain('**Efficiency:** 1.82');
      expect(result).toContain('**Platform:** Steam Deck');
      expect(result).toContain('**Year:** 2015');
      expect(result).toContain('## Description');
      expect(result).toContain('An action role-playing game set in an open world environment.');
      expect(result).toContain('## Notes');
    });

    it('should handle minimal data with null values', () => {
      const minimalData: GameData = {
        title: 'Minimal Game',
        platform: 'Full PC',
        priority: 'Plus tard',
        rating: null,
        hltbHours: null,
        efficiency: null,
        coverUrl: null,
        description: null,
        igdbId: null,
        genres: [],
        releaseYear: null,
      };

      const result = generateGameNote(minimalData);

      expect(result).toContain('title: "Minimal Game"');
      expect(result).toContain('platform: "Full PC"');
      expect(result).toContain('priority: "Plus tard"');
      expect(result).toContain('rating: null');
      expect(result).toContain('hltb_hours: null');
      expect(result).toContain('efficiency: null');
      expect(result).not.toContain('cover:');
      expect(result).not.toContain('igdb_id:');
      expect(result).not.toContain('release_year:');
      expect(result).not.toContain('genres:');
      expect(result).not.toContain('![cover]');
      expect(result).not.toContain('## Description');
      expect(result).toContain('## Notes');
    });

    it('should escape quotes in title', () => {
      const dataWithQuotes: GameData = {
        title: 'Game "With" Quotes',
        platform: 'Steam Deck',
        priority: 'En cours',
        rating: null,
        hltbHours: null,
        efficiency: null,
        coverUrl: null,
        description: null,
        igdbId: null,
        genres: [],
        releaseYear: null,
      };

      const result = generateGameNote(dataWithQuotes);
      expect(result).toContain('title: "Game \\"With\\" Quotes"');
    });

    it('should escape quotes in genre names', () => {
      const dataWithGenreQuotes: GameData = {
        title: 'Test Game',
        platform: 'Full PC',
        priority: 'À jouer absolument',
        rating: 80,
        hltbHours: 10,
        efficiency: 8,
        coverUrl: null,
        description: null,
        igdbId: 12345,
        genres: ['Action "Test"', 'Adventure'],
        releaseYear: 2023,
      };

      const result = generateGameNote(dataWithGenreQuotes);
      expect(result).toContain('  - "Action \\"Test\\""');
    });

    it('should truncate long descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      const dataWithLongDesc: GameData = {
        title: 'Long Desc Game',
        platform: 'Gaming Laptop',
        priority: 'Terminés',
        rating: 75,
        hltbHours: 20,
        efficiency: 3.75,
        coverUrl: null,
        description: longDescription,
        igdbId: 99999,
        genres: ['Action'],
        releaseYear: 2022,
      };

      const result = generateGameNote(dataWithLongDesc);
      expect(result).toContain('## Description');
      // Should be truncated to 800 chars + "..."
      expect(result).toContain(`${'A'.repeat(800)  }...`);
    });

    it('should remove HTML entities from description', () => {
      const dataWithHtmlEntities: GameData = {
        title: 'HTML Entity Game',
        platform: 'Android Handheld',
        priority: 'Abandonné',
        rating: 60,
        hltbHours: 5,
        efficiency: 12,
        coverUrl: null,
        description: 'Test &#39; description &#8217; with entities &#65;',
        igdbId: 11111,
        genres: [],
        releaseYear: 2021,
      };

      const result = generateGameNote(dataWithHtmlEntities);
      expect(result).toContain('Test  description  with entities ');
      expect(result).not.toContain('&#');
    });

    it('should include added date in ISO format', () => {
        const data: GameData = {
        title: 'Date Test',
        platform: 'Steam Deck',
        priority: 'En cours',
        rating: null,
        hltbHours: null,
        efficiency: null,
        coverUrl: null,
        description: null,
        igdbId: null,
        genres: [],
        releaseYear: null,
      };

      const result = generateGameNote(data);
      // Check for ISO date format (YYYY-MM-DD)
      expect(result).toMatch(/added: \d{4}-\d{2}-\d{2}/);
    });

    it('should handle rating without hours (no efficiency line)', () => {
        const data: GameData = {
        title: 'Rating Only',
        platform: 'Full PC',
        priority: 'À jouer absolument',
        rating: 85,
        hltbHours: null,
        efficiency: null,
        coverUrl: null,
        description: null,
        igdbId: null,
        genres: [],
        releaseYear: null,
      };

      const result = generateGameNote(data);
      expect(result).toContain('**Rating:** 85');
      expect(result).not.toContain('**HLTB:**');
      expect(result).not.toContain('**Efficiency:**');
    });

    it('should handle hours without rating', () => {
        const data: GameData = {
        title: 'Hours Only',
        platform: 'Full PC',
        priority: 'Plus tard',
        rating: null,
        hltbHours: 25,
        efficiency: null,
        coverUrl: null,
        description: null,
        igdbId: null,
        genres: [],
        releaseYear: null,
      };

      const result = generateGameNote(data);
      expect(result).toContain('**HLTB:** 25h');
      expect(result).not.toContain('**Rating:**');
      expect(result).not.toContain('**Efficiency:**');
    });

    it('should handle all priority values', () => {
      const priorities = ['À jouer absolument', 'Plus tard', 'En cours', 'Terminés', 'Abandonné'] as const;

      for (const priority of priorities) {
        const data: GameData = {
          title: `Test ${priority}`,
          platform: 'Steam Deck',
          priority: priority,
          rating: null,
          hltbHours: null,
          efficiency: null,
          coverUrl: null,
          description: null,
          igdbId: null,
          genres: [],
          releaseYear: null,
        };

        const result = generateGameNote(data);
        expect(result).toContain(`priority: "${priority}"`);
      }
    });

    it('should handle all platform values', () => {
      const platforms = ['Full PC', 'Gaming Laptop', 'Steam Deck', 'Android Handheld'] as const;

      for (const platform of platforms) {
        const data: GameData = {
          title: `Test ${platform}`,
          platform: platform,
          priority: 'Must Play',
          rating: null,
          hltbHours: null,
          efficiency: null,
          coverUrl: null,
          description: null,
          igdbId: null,
          genres: [],
          releaseYear: null,
        };

        const result = generateGameNote(data);
        expect(result).toContain(`platform: "${platform}"`);
        expect(result).toContain(`**Platform:** ${platform}`);
      }
    });
  });
});
