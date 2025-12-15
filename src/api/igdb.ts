import { requestUrl } from 'obsidian';

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';

export interface IgdbGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  rating?: number; // User rating (0-100)
  aggregated_rating?: number; // Critic rating (0-100)
  aggregated_rating_count?: number;
  total_rating?: number; // Combined user + critic rating
  first_release_date?: number; // Unix timestamp
  cover?: IgdbCover;
  genres?: IgdbGenre[];
  platforms?: IgdbPlatform[];
  websites?: IgdbWebsite[];
}

export interface IgdbCover {
  id: number;
  image_id: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface IgdbGenre {
  id: number;
  name: string;
  slug: string;
}

export interface IgdbPlatform {
  id: number;
  name: string;
  abbreviation?: string;
}

export interface IgdbWebsite {
  id: number;
  url: string;
  category: number; // 1=official, 4=twitter, 13=steam, etc.
}

/**
 * Client for interacting with the IGDB (Internet Game Database) API.
 * Handles authentication, game search, and data retrieval.
 */
export class IgdbClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Creates a new IGDB client.
   * @param clientId - Twitch Client ID for authentication
   * @param clientSecret - Twitch Client Secret for authentication
   */
  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Ensures a valid access token is available for API requests.
   * @throws {Error} If Twitch credentials are not configured
   */
  private async ensureAccessToken(): Promise<void> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Twitch Client ID and Secret not configured');
    }

    // Get new access token
    const response = await requestUrl({
      url: `${TWITCH_AUTH_URL}?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
      method: 'POST',
    });

    const data = response.json;
    this.accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry to be safe
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  }

  /**
   * Makes a request to the IGDB API.
   * @param endpoint - API endpoint to call
   * @param body - Query body in IGDB syntax
   * @returns Parsed response data
   * @throws {Error} If request fails
   */
  private async request<T>(endpoint: string, body: string): Promise<T> {
    await this.ensureAccessToken();

    const response = await requestUrl({
      url: `${IGDB_BASE_URL}${endpoint}`,
      method: 'POST',
      headers: {
        'Client-ID': this.clientId,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: body,
    });

    return response.json as T;
  }

  /**
   * Searches for games matching the query.
   * @param query - Search query
   * @param limit - Maximum number of results (default: 10)
   * @returns Array of matching games
   */
  async searchGames(query: string, limit: number = 10): Promise<IgdbGame[]> {
    const body = `
      search "${query}";
      fields id, name, slug, summary, aggregated_rating, aggregated_rating_count,
             total_rating, first_release_date, cover.image_id, cover.url,
             genres.name, genres.slug, platforms.name, platforms.abbreviation;
      limit ${limit};
    `;

    return this.request<IgdbGame[]>('/games', body);
  }

  /**
   * Gets detailed game information by IGDB ID.
   * @param gameId - IGDB game identifier
   * @returns Game data or null if not found
   */
  async getGameById(gameId: number): Promise<IgdbGame | null> {
    const body = `
      fields id, name, slug, summary, storyline, rating, aggregated_rating,
             aggregated_rating_count, total_rating, first_release_date,
             cover.image_id, cover.url, genres.name, genres.slug,
             platforms.name, platforms.abbreviation, websites.url, websites.category;
      where id = ${gameId};
    `;

    const results = await this.request<IgdbGame[]>('/games', body);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Gets detailed game information by slug.
   * @param slug - Game slug identifier
   * @returns Game data or null if not found
   */
  async getGameBySlug(slug: string): Promise<IgdbGame | null> {
    const body = `
      fields id, name, slug, summary, storyline, rating, aggregated_rating,
             aggregated_rating_count, total_rating, first_release_date,
             cover.image_id, cover.url, genres.name, genres.slug,
             platforms.name, platforms.abbreviation, websites.url, websites.category;
      where slug = "${slug}";
    `;

    const results = await this.request<IgdbGame[]>('/games', body);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get the cover image URL at the specified size.
   * @param imageId - IGDB image identifier
   * @param size - Image size (cover_small, cover_big, 720p, 1080p)
   * @returns Full URL to the cover image
   */
  getCoverUrl(imageId: string, size: string = 'cover_big'): string {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
  }
}
