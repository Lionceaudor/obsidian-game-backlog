import { requestUrl } from 'obsidian';

const SGDB_BASE_URL = 'https://www.steamgriddb.com/api/v2';

// Declare global console for ESLint
declare const console: Console;

export interface SgdbGame {
  id: number;
  name: string;
  types: string[];
  verified: boolean;
}

export interface SgdbGrid {
  id: number;
  score: number;
  style: string;
  width: number;
  height: number;
  nsfw: boolean;
  humor: boolean;
  notes: string | null;
  language: string;
  url: string;
  thumb: string;
  lock: boolean;
  epilepsy: boolean;
  upvotes: number;
  downvotes: number;
  author: {
    name: string;
    steam64: string;
    avatar: string;
  };
}

export interface SgdbHero extends SgdbGrid {
  type: 'hero';
}
export interface SgdbLogo extends SgdbGrid {
  type: 'logo';
}

/**
 * Client for interacting with the SteamGridDB API.
 * Handles game search and artwork retrieval.
 */
export class SteamGridDbClient {
  private apiKey: string;

  /**
   * Creates a new SteamGridDB client.
   * @param apiKey - SteamGridDB API key
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Makes a request to the SteamGridDB API.
   * @param endpoint - API endpoint to call
   * @returns Parsed response data
   * @throws {Error} If API key is not configured or request fails
   */
  private async request<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('SteamGridDB API key not configured');
    }

    const response = await requestUrl({
      url: `${SGDB_BASE_URL}${endpoint}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const data = response.json;

    if (!data.success) {
      throw new Error(data.errors?.join(', ') || 'SteamGridDB API error');
    }

    return data.data as T;
  }

  /**
   * Searches for games matching the query.
   * @param query - Search query
   * @returns Array of matching games
   */
  async searchGames(query: string): Promise<SgdbGame[]> {
    return this.request<SgdbGame[]>(
      `/search/autocomplete/${encodeURIComponent(query)}`
    );
  }

  /**
   * Gets grid artwork for a game.
   * @param gameId - SteamGridDB game identifier
   * @param options - Filtering options
   * @param options.styles - Array of style filters
   * @param options.dimensions - Array of dimension filters
   * @param options.nsfw - Whether to include NSFW content
   * @param options.humor - Whether to include humorous content
   * @returns Array of grid artwork
   */
  async getGrids(
    gameId: number,
    options?: {
      styles?: string[];
      dimensions?: string[];
      nsfw?: boolean;
      humor?: boolean;
    }
  ): Promise<SgdbGrid[]> {
    let endpoint = `/grids/game/${gameId}`;
    const params: string[] = [];

    if (options?.styles?.length) {
      params.push(`styles=${options.styles.join(',')}`);
    }
    if (options?.dimensions?.length) {
      params.push(`dimensions=${options.dimensions.join(',')}`);
    }
    if (options?.nsfw !== undefined) {
      params.push(`nsfw=${options.nsfw ? 'true' : 'false'}`);
    }
    if (options?.humor !== undefined) {
      params.push(`humor=${options.humor ? 'true' : 'false'}`);
    }

    if (params.length) {
      endpoint += `?${params.join('&')}`;
    }

    return this.request<SgdbGrid[]>(endpoint);
  }

  /**
   * Gets hero artwork for a game.
   * @param gameId - SteamGridDB game identifier
   * @returns Array of hero artwork
   */
  async getHeroes(gameId: number): Promise<SgdbHero[]> {
    return this.request<SgdbHero[]>(`/heroes/game/${gameId}`);
  }

  /**
   * Gets logo artwork for a game.
   * @param gameId - SteamGridDB game identifier
   * @returns Array of logo artwork
   */
  async getLogos(gameId: number): Promise<SgdbLogo[]> {
    return this.request<SgdbLogo[]>(`/logos/game/${gameId}`);
  }

  /**
   * Gets the best grid artwork for a game based on score.
   * @param gameId - SteamGridDB game identifier
   * @returns Best grid artwork or null if not found
   */
  async getBestGrid(gameId: number): Promise<SgdbGrid | null> {
    try {
      const grids = await this.getGrids(gameId, {
        styles: ['alternate', 'blurred', 'material'],
        nsfw: false,
        humor: false,
      });

      if (grids.length === 0) {
        // Try without style filter
        const allGrids = await this.getGrids(gameId, { nsfw: false });
        return allGrids.length > 0 ? allGrids[0] : null;
      }

      // Sort by score (upvotes - downvotes)
      grids.sort((a, b) => b.score - a.score);
      return grids[0];
    } catch (error) {
      console.error('SteamGridDB error:', error);
      return null;
    }
  }
}
