import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { SteamGridDbClient } from '../../../src/api/steamgriddb';
import { requestUrl } from '../../__mocks__/obsidian';
import {
  mockSgdbSearchResults,
  mockSgdbGrids,
  mockSgdbGridsUnsorted,
  mockSgdbHeroes,
  mockSgdbLogos,
  mockSgdbApiError,
  mockSgdbSuccessWrapper,
} from '../../fixtures/steamgriddb-responses';

vi.mock('obsidian', () => import('../../__mocks__/obsidian'));

describe('SteamGridDbClient', () => {
  let client: SteamGridDbClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SteamGridDbClient('test-api-key');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockRequestUrl = requestUrl;

  describe('constructor', () => {
    it('should create client with API key', () => {
      const testClient = new SteamGridDbClient('my-key');
      expect(testClient).toBeInstanceOf(SteamGridDbClient);
    });
  });

  describe('searchGames', () => {
    it('should search games by query', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbSearchResults),
      } as any);

      const results = await client.searchGames('The Witcher 3');

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('The Witcher 3: Wild Hunt');
      expect(results[0].id).toBe(4614);
    });

    it('should encode search query in URL', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbSearchResults),
      } as any);

      await client.searchGames('Game With Spaces & Special');

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain(encodeURIComponent('Game With Spaces & Special'));
    });

    it('should use autocomplete endpoint', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbSearchResults),
      } as any);

      await client.searchGames('Test');

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('/search/autocomplete/');
    });

    it('should include Bearer token in authorization header', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbSearchResults),
      } as any);

      await client.searchGames('Test');

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.headers.Authorization).toBe('Bearer test-api-key');
    });

    it('should throw error when API key not configured', async () => {
      const clientNoKey = new SteamGridDbClient('');

      await expect(clientNoKey.searchGames('Test')).rejects.toThrow(
        'SteamGridDB API key not configured'
      );
    });

    it('should throw error on API error response', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbApiError,
      } as any);

      await expect(client.searchGames('Test')).rejects.toThrow(
        'Game not found, Invalid request'
      );
    });

    it('should return empty array when no results', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper([]),
      } as any);

      const results = await client.searchGames('NonexistentGame');

      expect(results).toEqual([]);
    });
  });

  describe('getGrids', () => {
    it('should fetch grids for game ID', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      const grids = await client.getGrids(4614);

      expect(grids).toHaveLength(3);
      expect(grids[0].id).toBe(123456);
    });

    it('should use correct endpoint', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(12345);

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('/grids/game/12345');
    });

    it('should add styles parameter when provided', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(4614, { styles: ['alternate', 'blurred'] });

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('styles=alternate,blurred');
    });

    it('should add dimensions parameter when provided', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(4614, { dimensions: ['600x900', '920x430'] });

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('dimensions=600x900,920x430');
    });

    it('should add nsfw parameter when true', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(4614, { nsfw: true });

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('nsfw=true');
    });

    it('should add nsfw parameter when false', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(4614, { nsfw: false });

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('nsfw=false');
    });

    it('should add humor parameter when provided', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(4614, { humor: false });

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('humor=false');
    });

    it('should combine multiple parameters', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(4614, {
        styles: ['alternate'],
        nsfw: false,
        humor: false,
      });

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('styles=alternate');
      expect(call.url).toContain('nsfw=false');
      expect(call.url).toContain('humor=false');
      expect(call.url).toContain('&');
    });

    it('should not add query string when no options provided', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getGrids(4614);

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).not.toContain('?');
    });
  });

  describe('getHeroes', () => {
    it('should fetch heroes for game ID', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbHeroes),
      } as any);

      const heroes = await client.getHeroes(4614);

      expect(heroes).toHaveLength(1);
      expect(heroes[0].id).toBe(234567);
    });

    it('should use correct endpoint', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbHeroes),
      } as any);

      await client.getHeroes(12345);

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('/heroes/game/12345');
    });
  });

  describe('getLogos', () => {
    it('should fetch logos for game ID', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbLogos),
      } as any);

      const logos = await client.getLogos(4614);

      expect(logos).toHaveLength(1);
      expect(logos[0].id).toBe(345678);
    });

    it('should use correct endpoint', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbLogos),
      } as any);

      await client.getLogos(12345);

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('/logos/game/12345');
    });
  });

  describe('getBestGrid', () => {
    it('should return highest scored grid', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGridsUnsorted),
      } as any);

      const grid = await client.getBestGrid(4614);

      expect(grid).not.toBeNull();
      expect(grid?.score).toBe(200);
    });

    it('should filter by preferred styles', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getBestGrid(4614);

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('styles=alternate,blurred,material');
    });

    it('should filter out NSFW content', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getBestGrid(4614);

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('nsfw=false');
    });

    it('should filter out humor content', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGrids),
      } as any);

      await client.getBestGrid(4614);

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('humor=false');
    });

    it('should fallback to unfiltered grids when no styled matches', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({
          json: mockSgdbSuccessWrapper([]),
        } as any)
        .mockResolvedValueOnce({
          json: mockSgdbSuccessWrapper(mockSgdbGrids),
        } as any);

      const grid = await client.getBestGrid(4614);

      expect(mockRequestUrl).toHaveBeenCalledTimes(2);
      expect(grid).not.toBeNull();
    });

    it('should return null when no grids found after fallback', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({
          json: mockSgdbSuccessWrapper([]),
        } as any)
        .mockResolvedValueOnce({
          json: mockSgdbSuccessWrapper([]),
        } as any);

      const grid = await client.getBestGrid(4614);

      expect(grid).toBeNull();
    });

    it('should return null on error', async () => {
      mockRequestUrl.mockRejectedValueOnce(new Error('Network error'));

      const grid = await client.getBestGrid(4614);

      expect(grid).toBeNull();
    });

    it('should sort grids by score descending', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbGridsUnsorted),
      } as any);

      const grid = await client.getBestGrid(4614);

      // Should return the one with highest score (200)
      expect(grid?.score).toBe(200);
    });
  });

  describe('API URL construction', () => {
    it('should use correct base URL', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbSearchResults),
      } as any);

      await client.searchGames('Test');

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.url).toContain('https://www.steamgriddb.com/api/v2');
    });

    it('should use GET method', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: mockSgdbSuccessWrapper(mockSgdbSearchResults),
      } as any);

      await client.searchGames('Test');

      const call = mockRequestUrl.mock.calls[0][0];
      expect(call.method).toBe('GET');
    });
  });

  describe('error handling', () => {
    it('should throw error with API error messages', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: { success: false, errors: ['Error 1', 'Error 2'] },
      } as any);

      await expect(client.searchGames('Test')).rejects.toThrow('Error 1, Error 2');
    });

    it('should throw generic error when no error messages', async () => {
      mockRequestUrl.mockResolvedValueOnce({
        json: { success: false },
      } as any);

      await expect(client.searchGames('Test')).rejects.toThrow('SteamGridDB API error');
    });
  });
});
