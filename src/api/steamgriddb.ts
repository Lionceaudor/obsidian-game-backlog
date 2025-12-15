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

export class SteamGridDbClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

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

  async searchGames(query: string): Promise<SgdbGame[]> {
    return this.request<SgdbGame[]>(
      `/search/autocomplete/${encodeURIComponent(query)}`
    );
  }

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

  async getHeroes(gameId: number): Promise<SgdbHero[]> {
    return this.request<SgdbHero[]>(`/heroes/game/${gameId}`);
  }

  async getLogos(gameId: number): Promise<SgdbLogo[]> {
    return this.request<SgdbLogo[]>(`/logos/game/${gameId}`);
  }

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
