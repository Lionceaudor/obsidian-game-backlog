import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { IgdbClient } from '../../../src/api/igdb';
import { requestUrl } from '../../__mocks__/obsidian';
import {
  mockTwitchTokenResponse,
  mockIgdbSearchResults,
  mockIgdbGameById,
  mockIgdbGameMinimal,
  mockIgdbGameNoRating,
} from '../../fixtures/igdb-responses';

vi.mock('obsidian', () => import('../../__mocks__/obsidian'));

describe('IgdbClient', () => {
  let client: IgdbClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new IgdbClient('test-client-id', 'test-client-secret');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockRequestUrl = requestUrl;

  describe('constructor', () => {
    it('should create client with credentials', () => {
      const testClient = new IgdbClient('my-id', 'my-secret');
      expect(testClient).toBeInstanceOf(IgdbClient);
    });
  });

  describe('getCoverUrl', () => {
    it('should generate cover URL with default size', () => {
      const url = client.getCoverUrl('co1wyy');
      expect(url).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg');
    });

    it('should generate cover URL with cover_small size', () => {
      const url = client.getCoverUrl('co1wyy', 'cover_small');
      expect(url).toBe('https://images.igdb.com/igdb/image/upload/t_cover_small/co1wyy.jpg');
    });

    it('should generate cover URL with 720p size', () => {
      const url = client.getCoverUrl('abc123', '720p');
      expect(url).toBe('https://images.igdb.com/igdb/image/upload/t_720p/abc123.jpg');
    });

    it('should generate cover URL with 1080p size', () => {
      const url = client.getCoverUrl('xyz789', '1080p');
      expect(url).toBe('https://images.igdb.com/igdb/image/upload/t_1080p/xyz789.jpg');
    });

    it('should handle empty image ID', () => {
      const url = client.getCoverUrl('');
      expect(url).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big/.jpg');
    });
  });

  describe('searchGames', () => {
    it('should fetch access token and search games', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      const results = await client.searchGames('The Witcher 3');

      expect(mockRequestUrl).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('The Witcher 3: Wild Hunt');
    });

    it('should use default limit of 10', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('Test');

      const searchCall = mockRequestUrl.mock.calls[1];
      expect(searchCall[0].body).toContain('limit 10');
    });

    it('should use custom limit', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('Test', 5);

      const searchCall = mockRequestUrl.mock.calls[1];
      expect(searchCall[0].body).toContain('limit 5');
    });

    it('should include search query in body', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('Dark Souls');

      const searchCall = mockRequestUrl.mock.calls[1];
      expect(searchCall[0].body).toContain('search "Dark Souls"');
    });

    it('should return empty array when no results', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [] } as any);

      const results = await client.searchGames('NonexistentGame');

      expect(results).toEqual([]);
    });

    it('should throw error when credentials are missing', async () => {
      const clientNoCredentials = new IgdbClient('', '');

      await expect(clientNoCredentials.searchGames('Test')).rejects.toThrow(
        'Twitch Client ID and Secret not configured'
      );
    });

    it('should throw error when client ID is missing', async () => {
      const clientNoId = new IgdbClient('', 'secret');

      await expect(clientNoId.searchGames('Test')).rejects.toThrow(
        'Twitch Client ID and Secret not configured'
      );
    });

    it('should throw error when client secret is missing', async () => {
      const clientNoSecret = new IgdbClient('id', '');

      await expect(clientNoSecret.searchGames('Test')).rejects.toThrow(
        'Twitch Client ID and Secret not configured'
      );
    });

    it('should cache access token for subsequent requests', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('First');
      await client.searchGames('Second');

      // Should only call token endpoint once
      expect(mockRequestUrl).toHaveBeenCalledTimes(3);
      expect(mockRequestUrl.mock.calls[0][0].url).toContain('id.twitch.tv');
      expect(mockRequestUrl.mock.calls[1][0].url).toContain('api.igdb.com');
      expect(mockRequestUrl.mock.calls[2][0].url).toContain('api.igdb.com');
    });

    it('should include proper headers in IGDB request', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('Test');

      const igdbCall = mockRequestUrl.mock.calls[1][0];
      expect(igdbCall.headers['Client-ID']).toBe('test-client-id');
      expect(igdbCall.headers['Authorization']).toBe('Bearer test-access-token-12345');
      expect(igdbCall.headers['Content-Type']).toBe('text/plain');
    });

    it('should use POST method for IGDB requests', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('Test');

      const igdbCall = mockRequestUrl.mock.calls[1][0];
      expect(igdbCall.method).toBe('POST');
    });
  });

  describe('getGameById', () => {
    it('should fetch game by ID', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameById] } as any);

      const game = await client.getGameById(1942);

      expect(game).not.toBeNull();
      expect(game?.id).toBe(1942);
      expect(game?.name).toBe('The Witcher 3: Wild Hunt');
    });

    it('should return null when game not found', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [] } as any);

      const game = await client.getGameById(99999999);

      expect(game).toBeNull();
    });

    it('should include where clause with game ID', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameById] } as any);

      await client.getGameById(12345);

      const call = mockRequestUrl.mock.calls[1][0];
      expect(call.body).toContain('where id = 12345');
    });

    it('should request full game details including storyline and websites', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameById] } as any);

      await client.getGameById(1942);

      const call = mockRequestUrl.mock.calls[1][0];
      expect(call.body).toContain('storyline');
      expect(call.body).toContain('websites.url');
      expect(call.body).toContain('websites.category');
    });
  });

  describe('getGameBySlug', () => {
    it('should fetch game by slug', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameById] } as any);

      const game = await client.getGameBySlug('the-witcher-3-wild-hunt');

      expect(game).not.toBeNull();
      expect(game?.slug).toBe('the-witcher-3-wild-hunt');
    });

    it('should return null when slug not found', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [] } as any);

      const game = await client.getGameBySlug('nonexistent-game-slug');

      expect(game).toBeNull();
    });

    it('should include where clause with slug', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameById] } as any);

      await client.getGameBySlug('test-slug');

      const call = mockRequestUrl.mock.calls[1][0];
      expect(call.body).toContain('where slug = "test-slug"');
    });
  });

  describe('token expiry handling', () => {
    it('should refresh token when expired', async () => {
      // First token expires immediately (0 expiry)
      const expiredToken = { ...mockTwitchTokenResponse, expires_in: 0 };

      mockRequestUrl
        .mockResolvedValueOnce({ json: expiredToken } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any)
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('First');
      await client.searchGames('Second');

      // Should have fetched token twice
      const tokenCalls = mockRequestUrl.mock.calls.filter(
        call => call[0].url.includes('id.twitch.tv')
      );
      expect(tokenCalls).toHaveLength(2);
    });
  });

  describe('game data parsing', () => {
    it('should parse game with all fields', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameById] } as any);

      const game = await client.getGameById(1942);

      expect(game?.summary).toBeDefined();
      expect(game?.storyline).toBeDefined();
      expect(game?.rating).toBeDefined();
      expect(game?.aggregated_rating).toBeDefined();
      expect(game?.genres).toHaveLength(2);
      expect(game?.platforms).toHaveLength(2);
      expect(game?.websites).toHaveLength(2);
      expect(game?.cover?.image_id).toBe('co1wyy');
    });

    it('should handle minimal game data', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameMinimal] } as any);

      const game = await client.getGameById(99999);

      expect(game?.id).toBe(99999);
      expect(game?.name).toBe('Minimal Game');
      expect(game?.summary).toBeUndefined();
      expect(game?.cover).toBeUndefined();
      expect(game?.genres).toBeUndefined();
    });

    it('should handle game without rating', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: [mockIgdbGameNoRating] } as any);

      const game = await client.getGameById(88888);

      expect(game?.aggregated_rating).toBeUndefined();
      expect(game?.summary).toBe('A game without ratings');
    });
  });

  describe('API endpoint URLs', () => {
    it('should use correct Twitch auth URL', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('Test');

      const authCall = mockRequestUrl.mock.calls[0][0];
      expect(authCall.url).toContain('https://id.twitch.tv/oauth2/token');
      expect(authCall.url).toContain('client_id=test-client-id');
      expect(authCall.url).toContain('client_secret=test-client-secret');
      expect(authCall.url).toContain('grant_type=client_credentials');
    });

    it('should use correct IGDB API URL', async () => {
      mockRequestUrl
        .mockResolvedValueOnce({ json: mockTwitchTokenResponse } as any)
        .mockResolvedValueOnce({ json: mockIgdbSearchResults } as any);

      await client.searchGames('Test');

      const igdbCall = mockRequestUrl.mock.calls[1][0];
      expect(igdbCall.url).toBe('https://api.igdb.com/v4/games');
    });
  });
});
