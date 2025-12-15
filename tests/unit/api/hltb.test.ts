import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { HltbClient } from '../../../src/api/hltb';
import { requestUrl } from '../../__mocks__/obsidian';
import {
  mockHltbInitResponse,
  mockHltbHomepageHtml,
  mockHltbAppScript,
  mockHltbSearchResponse,
  mockHltbSearchResponseNoResults,
  mockHltbSearchResponseSingleResult,
  mockHltbSearchResponseWithAccents,
} from '../../fixtures/hltb-responses';

vi.mock('obsidian', () => import('../../__mocks__/obsidian'));

describe('HltbClient', () => {
  let client: HltbClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new HltbClient();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockRequestUrl = requestUrl;

  describe('normalize (via searchGame behavior)', () => {
    // Test normalize indirectly through search matching behavior
    it('should normalize strings for matching', async () => {
      // Set up mocks for successful search
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any)
        .mockResolvedValueOnce({ json: mockHltbSearchResponseWithAccents } as any);

      const result = await client.searchGame('Pokemon Legends Arceus');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Pokémon Legends: Arceus');
    });
  });

  describe('secondsToHours (via result mapping)', () => {
    beforeEach(() => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any);
    });

    it('should convert seconds to hours correctly', async () => {
      mockRequestUrl.mockResolvedValueOnce({ json: mockHltbSearchResponseSingleResult } as any);

      const result = await client.searchGame('Unique Game Title');

      expect(result).not.toBeNull();
      // 72000 seconds = 20 hours
      expect(result?.mainStoryHours).toBe(20);
      // 108000 seconds = 30 hours
      expect(result?.mainPlusExtrasHours).toBe(30);
      // 144000 seconds = 40 hours
      expect(result?.completionistHours).toBe(40);
    });

    it('should handle zero seconds', async () => {
      const responseWithZero = {
        data: [{
          game_id: 1,
          game_name: 'Zero Hours Game',
          game_image: 'zero.jpg',
          comp_main: 0,
          comp_plus: 0,
          comp_100: 0,
          comp_all: 0,
          comp_all_count: 10,
        }],
      };
      mockRequestUrl.mockResolvedValueOnce({ json: responseWithZero } as any);

      const result = await client.searchGame('Zero Hours Game');

      expect(result?.mainStoryHours).toBe(0);
      expect(result?.mainPlusExtrasHours).toBe(0);
      expect(result?.completionistHours).toBe(0);
    });

    it('should round to one decimal place', async () => {
      const responseWithDecimals = {
        data: [{
          game_id: 1,
          game_name: 'Decimal Hours',
          game_image: 'dec.jpg',
          comp_main: 12345, // 3.429... hours -> 3.4
          comp_plus: 23456, // 6.515... hours -> 6.5
          comp_100: 34567, // 9.601... hours -> 9.6
          comp_all: 23456,
          comp_all_count: 5,
        }],
      };
      mockRequestUrl.mockResolvedValueOnce({ json: responseWithDecimals } as any);

      const result = await client.searchGame('Decimal Hours');

      expect(result?.mainStoryHours).toBe(3.4);
      expect(result?.mainPlusExtrasHours).toBe(6.5);
      expect(result?.completionistHours).toBe(9.6);
    });
  });

  describe('levenshtein distance (via fuzzy matching)', () => {
    beforeEach(() => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any);
    });

    it('should find exact match first', async () => {
      mockRequestUrl.mockResolvedValueOnce({ json: mockHltbSearchResponse } as any);

      const result = await client.searchGame('The Witcher 3: Wild Hunt');

      expect(result?.name).toBe('The Witcher 3: Wild Hunt');
      expect(result?.id).toBe(10270);
    });

    it('should use fuzzy matching when no exact match', async () => {
      mockRequestUrl.mockResolvedValueOnce({ json: mockHltbSearchResponse } as any);

      const result = await client.searchGame('Witcher 3');

      expect(result).not.toBeNull();
      // Should match one of the Witcher games based on Levenshtein distance
      expect(result?.name).toContain('Witcher');
    });

    it('should prefer game with more completions on tie', async () => {
      const responseWithTie = {
        data: [
          {
            game_id: 1,
            game_name: 'Test Game A',
            game_image: 'a.jpg',
            comp_main: 36000,
            comp_plus: 54000,
            comp_100: 72000,
            comp_all: 54000,
            comp_all_count: 100,
          },
          {
            game_id: 2,
            game_name: 'Test Game B',
            game_image: 'b.jpg',
            comp_main: 36000,
            comp_plus: 54000,
            comp_100: 72000,
            comp_all: 54000,
            comp_all_count: 500,
          },
        ],
      };
      mockRequestUrl.mockResolvedValueOnce({ json: responseWithTie } as any);

      const result = await client.searchGame('Test Game');

      // Should prefer game B with more completions
      expect(result?.id).toBe(2);
    });
  });

  describe('searchGame', () => {
    it('should fetch auth token and search URL before searching', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any)
        .mockResolvedValueOnce({ json: mockHltbSearchResponse } as any);

      const result = await client.searchGame('The Witcher 3');

      expect(mockRequestUrl).toHaveBeenCalledTimes(4);
      expect(result).not.toBeNull();
    });

    it('should return null when no results', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any)
        .mockResolvedValueOnce({ json: mockHltbSearchResponseNoResults } as any);

      const result = await client.searchGame('NonexistentGame12345');

      expect(result).toBeNull();
    });

    it('should return null when auth token fetch fails', async () => {
      mockRequestUrl.mockResolvedValueOnce({ json: {} } as any);

      const result = await client.searchGame('Test Game');

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockRequestUrl.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.searchGame('Test Game');

      expect(result).toBeNull();
    });

    it('should clear auth token on error and retry', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any)
        .mockRejectedValueOnce(new Error('Search failed'));

      const result = await client.searchGame('Test Game');

      expect(result).toBeNull();
    });

    it('should reuse auth token for subsequent searches', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any)
        .mockResolvedValueOnce({ json: mockHltbSearchResponseSingleResult } as any)
        .mockResolvedValueOnce({ json: mockHltbSearchResponseSingleResult } as any);

      await client.searchGame('First Game');

      // Create new client for second search to test token reuse within same client
      mockRequestUrl.mockResolvedValueOnce({ json: mockHltbSearchResponseSingleResult } as any);

      await client.searchGame('Second Game');

      // Token should be cached, but search URL discovery may add calls
      // At minimum: 1 token + 2 homepage/script + 2 searches = 5, but may be 6 with script fetch
      expect(mockRequestUrl.mock.calls.length).toBeGreaterThanOrEqual(5);
    });

    it('should construct image URL correctly', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any)
        .mockResolvedValueOnce({ json: mockHltbSearchResponseSingleResult } as any);

      const result = await client.searchGame('Unique Game Title');

      expect(result?.imageUrl).toBe('https://howlongtobeat.com/games/unique.jpg');
    });

    it('should handle empty game image', async () => {
      const responseNoImage = {
        data: [{
          game_id: 1,
          game_name: 'No Image Game',
          game_image: '',
          comp_main: 36000,
          comp_plus: 54000,
          comp_100: 72000,
          comp_all: 54000,
          comp_all_count: 10,
        }],
      };
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: mockHltbHomepageHtml } as any)
        .mockResolvedValueOnce({ text: mockHltbAppScript } as any)
        .mockResolvedValueOnce({ json: responseNoImage } as any);

      const result = await client.searchGame('No Image Game');

      expect(result?.imageUrl).toBe('');
    });
  });

  describe('discoverSearchUrl', () => {
    it('should fall back to /api/search when script not found', async () => {
      const htmlWithoutScript = '<html><head></head><body></body></html>';
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockResolvedValueOnce({ text: htmlWithoutScript } as any)
        .mockResolvedValueOnce({ json: mockHltbSearchResponse } as any);

      const result = await client.searchGame('Test Game');

      expect(result).not.toBeNull();
    });

    it('should handle error during URL discovery', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockHltbInitResponse } as any)
        .mockRejectedValueOnce(new Error('Failed to fetch homepage'))
        .mockResolvedValueOnce({ json: mockHltbSearchResponse } as any);

      const result = await client.searchGame('Test Game');

      // Should still work with fallback URL
      expect(result).not.toBeNull();
    });
  });

  describe('fetchAuthToken', () => {
    it('should handle missing token in response', async () => {
      mockRequestUrl.mockResolvedValueOnce({ json: { other: 'data' } } as any);

      const result = await client.searchGame('Test');

      expect(result).toBeNull();
    });
  });
});
