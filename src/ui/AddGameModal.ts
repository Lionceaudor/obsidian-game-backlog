import {
  App,
  Modal,
  Setting,
  Notice,
  debounce,
  TextComponent,
} from 'obsidian';

import { HltbClient, HltbResult } from '../api/hltb';
import { IgdbClient, IgdbGame } from '../api/igdb';
import { SteamGridDbClient } from '../api/steamgriddb';
import { PLATFORMS, PRIORITIES, Platform, Priority } from '../settings';

export interface GameData {
  title: string;
  platform: Platform;
  priority: Priority;
  rating: number | null; // IGDB aggregated_rating (critic score)
  hltbHours: number | null;
  efficiency: number | null;
  coverUrl: string | null;
  description: string | null;
  igdbId: number | null;
  genres: string[];
  releaseYear: number | null;
}

interface SearchResult {
  igdbGame: IgdbGame;
  displayName: string;
}

export class AddGameModal extends Modal {
  private igdbClient: IgdbClient;
  private hltbClient: HltbClient;
  private steamGridDbClient: SteamGridDbClient;
  private onSubmit: (data: GameData) => void;
  private defaultPlatform: Platform;
  private defaultPriority: Priority;

  private selectedGame: IgdbGame | null = null;
  private searchResults: SearchResult[] = [];
  private platform: Platform;
  private priority: Priority;

  private searchInput: TextComponent | null = null;
  private resultsContainer: HTMLElement | null = null;
  private selectedGameDisplay: HTMLElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private loadingEl: HTMLElement | null = null;

  constructor(
    app: App,
    igdbClient: IgdbClient,
    hltbClient: HltbClient,
    steamGridDbClient: SteamGridDbClient,
    defaultPlatform: Platform,
    defaultPriority: Priority,
    onSubmit: (data: GameData) => void
  ) {
    super(app);
    this.igdbClient = igdbClient;
    this.hltbClient = hltbClient;
    this.steamGridDbClient = steamGridDbClient;
    this.defaultPlatform = defaultPlatform;
    this.defaultPriority = defaultPriority;
    this.platform = defaultPlatform;
    this.priority = defaultPriority;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('game-backlog-modal');

    contentEl.createEl('h2', { text: 'Add Game to Backlog' });

    // Search input
    new Setting(contentEl)
      .setName('Search for a game')
      .setDesc('Type to search IGDB database')
      .addText((text) => {
        this.searchInput = text;
        text.setPlaceholder('Enter game title...');
        text.inputEl.addEventListener(
          'input',
          debounce(async () => {
            await this.performSearch(text.getValue());
          }, 300)
        );
      });

    // Search results container
    this.resultsContainer = contentEl.createDiv({
      cls: 'game-search-results',
    });

    // Selected game display
    this.selectedGameDisplay = contentEl.createDiv({
      cls: 'selected-game-display',
    });
    this.selectedGameDisplay.style.display = 'none';

    // Platform dropdown
    new Setting(contentEl)
      .setName('Platform')
      .setDesc('Which platform will you play this on?')
      .addDropdown((dropdown) => {
        PLATFORMS.forEach((p) => dropdown.addOption(p, p));
        dropdown.setValue(this.defaultPlatform);
        dropdown.onChange((value) => {
          this.platform = value as Platform;
        });
      });

    // Priority dropdown
    new Setting(contentEl)
      .setName('Priority')
      .setDesc('How likely are you to play this?')
      .addDropdown((dropdown) => {
        PRIORITIES.forEach((p) => dropdown.addOption(p, p));
        dropdown.setValue(this.defaultPriority);
        dropdown.onChange((value) => {
          this.priority = value as Priority;
        });
      });

    // Loading indicator
    this.loadingEl = contentEl.createDiv({ cls: 'game-loading' });
    this.loadingEl.style.display = 'none';
    this.loadingEl.setText('Fetching game data...');

    // Submit button
    const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
    this.submitButton = buttonContainer.createEl('button', {
      text: 'Add Game',
      cls: 'mod-cta',
    });
    this.submitButton.disabled = true;
    this.submitButton.addEventListener('click', () => this.handleSubmit());

    // Add some basic styles
    this.addStyles();
  }

  private addStyles() {
    const styleId = 'game-backlog-modal-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .game-backlog-modal {
        min-width: 400px;
      }
      .game-search-results {
        max-height: 200px;
        overflow-y: auto;
        margin-bottom: 1rem;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
      }
      .game-search-results:empty {
        display: none;
      }
      .game-search-result {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .game-search-result:hover {
        background: var(--background-modifier-hover);
      }
      .game-search-result img {
        width: 40px;
        height: 56px;
        object-fit: cover;
        border-radius: 4px;
      }
      .game-search-result-info {
        flex: 1;
      }
      .game-search-result-name {
        font-weight: 500;
      }
      .game-search-result-meta {
        font-size: 0.8em;
        color: var(--text-muted);
      }
      .selected-game-display {
        padding: 12px;
        background: var(--background-secondary);
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .selected-game-display img {
        width: 60px;
        height: 84px;
        object-fit: cover;
        border-radius: 4px;
      }
      .selected-game-info h3 {
        margin: 0 0 4px 0;
      }
      .selected-game-info p {
        margin: 0;
        font-size: 0.9em;
        color: var(--text-muted);
      }
      .game-loading {
        text-align: center;
        padding: 1rem;
        color: var(--text-muted);
        font-style: italic;
      }
      .modal-button-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 1rem;
      }
    `;
    document.head.appendChild(style);
  }

  private async performSearch(query: string) {
    if (!query || query.length < 2) {
      this.resultsContainer!.empty();
      return;
    }

    try {
      const games = await this.igdbClient.searchGames(query, 8);
      this.searchResults = games.map((game) => {
        const year = game.first_release_date
          ? new Date(game.first_release_date * 1000).getFullYear()
          : null;
        return {
          igdbGame: game,
          displayName: `${game.name}${year ? ` (${year})` : ''}`,
        };
      });
      this.renderSearchResults();
    } catch (error) {
      console.error('Search error:', error);
      new Notice('Failed to search games. Check your Twitch API credentials.');
    }
  }

  private renderSearchResults() {
    this.resultsContainer!.empty();

    for (const result of this.searchResults) {
      const el = this.resultsContainer!.createDiv({
        cls: 'game-search-result',
      });

      // IGDB cover image
      if (result.igdbGame.cover?.image_id) {
        const coverUrl = this.igdbClient.getCoverUrl(
          result.igdbGame.cover.image_id,
          'cover_small'
        );
        el.createEl('img', { attr: { src: coverUrl } });
      }

      const info = el.createDiv({ cls: 'game-search-result-info' });
      info.createDiv({
        cls: 'game-search-result-name',
        text: result.igdbGame.name,
      });

      const meta: string[] = [];
      if (result.igdbGame.first_release_date) {
        const year = new Date(result.igdbGame.first_release_date * 1000).getFullYear();
        meta.push(year.toString());
      }
      if (result.igdbGame.aggregated_rating) {
        meta.push(`Rating: ${Math.round(result.igdbGame.aggregated_rating)}`);
      }
      if (result.igdbGame.genres?.length) {
        meta.push(result.igdbGame.genres.slice(0, 2).map((g) => g.name).join(', '));
      }
      if (meta.length) {
        info.createDiv({ cls: 'game-search-result-meta', text: meta.join(' • ') });
      }

      el.addEventListener('click', () => this.selectGame(result.igdbGame));
    }
  }

  private async selectGame(game: IgdbGame) {
    this.selectedGame = game;
    this.resultsContainer!.empty();
    this.searchInput!.setValue(game.name);

    // Update selected game display
    this.selectedGameDisplay!.empty();
    this.selectedGameDisplay!.style.display = 'flex';

    if (game.cover?.image_id) {
      const coverUrl = this.igdbClient.getCoverUrl(game.cover.image_id, 'cover_big');
      this.selectedGameDisplay!.createEl('img', {
        attr: { src: coverUrl },
      });
    }

    const info = this.selectedGameDisplay!.createDiv({ cls: 'selected-game-info' });
    info.createEl('h3', { text: game.name });

    const meta: string[] = [];
    if (game.first_release_date) {
      const year = new Date(game.first_release_date * 1000).getFullYear();
      meta.push(year.toString());
    }
    if (game.aggregated_rating) {
      meta.push(`Critic Rating: ${Math.round(game.aggregated_rating)}`);
    }
    if (game.genres?.length) {
      meta.push(game.genres.map((g) => g.name).join(', '));
    }
    info.createEl('p', { text: meta.join(' • ') });

    this.submitButton!.disabled = false;
  }

  private async handleSubmit() {
    if (!this.selectedGame) {
      new Notice('Please select a game first');
      return;
    }

    this.loadingEl!.style.display = 'block';
    this.submitButton!.disabled = true;
    this.submitButton!.setText('Adding...');

    try {
      // Fetch full game details from IGDB
      const gameDetails = await this.igdbClient.getGameById(this.selectedGame.id);
      if (!gameDetails) {
        throw new Error('Failed to fetch game details');
      }

      // Fetch HLTB data
      let hltbData: HltbResult | null = null;
      try {
        hltbData = await this.hltbClient.searchGame(this.selectedGame.name);
      } catch (e) {
        console.warn('HLTB fetch failed:', e);
      }

      // Get cover URL - prefer SteamGridDB, fallback to IGDB
      let coverUrl: string | null = null;

      // Try IGDB cover first as fallback
      if (gameDetails.cover?.image_id) {
        coverUrl = this.igdbClient.getCoverUrl(gameDetails.cover.image_id, 'cover_big');
      }

      // Try SteamGridDB for higher quality art
      try {
        const sgdbGames = await this.steamGridDbClient.searchGames(this.selectedGame.name);
        if (sgdbGames.length > 0) {
          const grid = await this.steamGridDbClient.getBestGrid(sgdbGames[0].id);
          if (grid) {
            coverUrl = grid.url;
          }
        }
      } catch (e) {
        console.warn('SteamGridDB fetch failed, using IGDB cover:', e);
      }

      // Calculate efficiency score
      const rating = gameDetails.aggregated_rating
        ? Math.round(gameDetails.aggregated_rating)
        : null;
      const hltbHours = hltbData?.mainStoryHours || null;
      let efficiency: number | null = null;
      if (rating && hltbHours && hltbHours > 0) {
        efficiency = Math.round((rating / hltbHours) * 100) / 100;
      }

      const releaseYear = gameDetails.first_release_date
        ? new Date(gameDetails.first_release_date * 1000).getFullYear()
        : null;

      const gameData: GameData = {
        title: gameDetails.name,
        platform: this.platform,
        priority: this.priority,
        rating: rating,
        hltbHours: hltbHours,
        efficiency: efficiency,
        coverUrl: coverUrl,
        description: gameDetails.summary || gameDetails.storyline || null,
        igdbId: gameDetails.id,
        genres: gameDetails.genres?.map((g) => g.name) || [],
        releaseYear: releaseYear,
      };

      this.onSubmit(gameData);
      this.close();
    } catch (error) {
      console.error('Failed to add game:', error);
      new Notice('Failed to fetch game data. Please try again.');
      this.loadingEl!.style.display = 'none';
      this.submitButton!.disabled = false;
      this.submitButton!.setText('Add Game');
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
