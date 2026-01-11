import { Notice, Plugin, TFile } from 'obsidian';
import type { App } from 'obsidian';

import { HltbClient } from './src/api/hltb';
import { IgdbClient } from './src/api/igdb';
import { SteamGridDbClient } from './src/api/steamgriddb';
import type { GameBacklogSettings, Platform, Priority } from './src/settings';
import { GameBacklogSettingTab, DEFAULT_SETTINGS } from './src/settings';
import { generateGameNote, generateFileName } from './src/templates/gameNote';
import { AddGameModal, type GameData } from './src/ui/AddGameModal';
import { translate } from './src/i18n';

// Declare global console for ESLint
declare const console: Console;

/**
 * Main plugin class for the Game Backlog Obsidian plugin.
 * Manages game backlog functionality including adding games, updating status, and dashboard generation.
 */
export default class GameBacklogPlugin extends Plugin {
  settings: GameBacklogSettings;
  private igdbClient: IgdbClient;
  private hltbClient: HltbClient;
  private steamGridDbClient: SteamGridDbClient;

  /**
   * Initializes the plugin when loaded by Obsidian.
   * Sets up commands, settings, and API clients.
   */
  async onload() {
    await this.loadSettings();

    // Initialize API clients
    this.initializeClients();

    // Add command to add a game
    this.addCommand({
      id: 'add-game-to-backlog',
      name: translate(this.settings.language, 'cmd_add_game'),
      callback: () => {
        this.openAddGameModal();
      },
    });

    // Add command to open backlog dashboard
    this.addCommand({
      id: 'open-game-backlog',
      name: translate(this.settings.language, 'cmd_open_backlog'),
      callback: async () => {
        await this.openBacklogDashboard();
      },
    });

    // Add command to update game status
    this.addCommand({
      id: 'update-game-status',
      name: translate(this.settings.language, 'cmd_update_status'),
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file) {
          const cache = this.app.metadataCache.getFileCache(file);
          const tags = cache?.frontmatter?.tags;
          if (Array.isArray(tags) && tags.includes('game')) {
            if (!checking) {
              void this.updateGameStatus(file.path);
            }
            return true;
          }
        }
        return false;
      },
    });

    // Add settings tab
    this.addSettingTab(new GameBacklogSettingTab(this.app, this));
  }

  /**
   * Initializes API clients with current settings.
   */
  private initializeClients() {
    this.igdbClient = new IgdbClient(
      this.settings.twitchClientId,
      this.settings.twitchClientSecret
    );
    this.hltbClient = new HltbClient();
    this.steamGridDbClient = new SteamGridDbClient(
      this.settings.steamGridDbApiKey
    );
  }

  /**
   * Loads plugin settings from Obsidian's data storage.
   */
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /**
   * Saves plugin settings to Obsidian's data storage.
   */
  async saveSettings() {
    await this.saveData(this.settings);
    // Reinitialize clients with new API keys
    this.initializeClients();
  }

  /**
   * Opens the Add Game modal for searching and adding games to the backlog.
   */
  private openAddGameModal() {
    if (!this.settings.twitchClientId || !this.settings.twitchClientSecret) {
      new Notice(translate(this.settings.language, 'missing_twitch_keys'));
      return;
    }

    const modal = new AddGameModal(
      this.app,
      this.igdbClient,
      this.hltbClient,
      this.steamGridDbClient,
      this.settings.defaultPlatform as Platform,
      this.settings.defaultPriority as Priority,
      async (data: GameData) => {
        await this.createGameNote(data);
      }
      ,
      this.settings.language
    );
    modal.open();
  }

  /**
   * Creates a new game note in the vault with the provided game data.
   * @param data - The game data to create a note for
   */
  private async createGameNote(data: GameData) {
    const fileName = generateFileName(data.title);
    const content = generateGameNote(data, this.settings.language);

    // Check if file already exists
    const existingFile = this.app.vault.getAbstractFileByPath(fileName);
    if (existingFile && existingFile instanceof TFile) {
      new Notice(translate(this.settings.language, 'note_exists_notice').replace('{title}', data.title));
      // Open the existing file
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(existingFile);
      return;
    }

    try {
      const file = await this.app.vault.create(fileName, content);
      new Notice(translate(this.settings.language, 'added_note_notice').replace('{title}', data.title));

      // Open the new note
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);
    } catch (error) {
      console.error('Failed to create game note:', error);
      new Notice(translate(this.settings.language, 'create_note_failed'));
    }
  }

  /**
   * Opens or creates the backlog dashboard file.
   */
  private async openBacklogDashboard() {
    const dashboardPath = 'Video Game Backlog.md';
    let file = this.app.vault.getAbstractFileByPath(dashboardPath);

    if (!file) {
      // Create the dashboard if it doesn't exist
      const content = this.generateBacklogDashboard();
      file = await this.app.vault.create(dashboardPath, content);
      new Notice(translate(this.settings.language, 'dashboard_created_notice'));
    }

    const leaf = this.app.workspace.getLeaf(false);
    if (file instanceof TFile) {
      await leaf.openFile(file);
    }
  }

  /**
   * Generates the content for the backlog dashboard file.
   * @returns The markdown content for the dashboard
   */
  private generateBacklogDashboard(): string {
    const lang = this.settings.language;

    // translated templates
    const summaryT = translate(lang, 'dashboard_summary');
    const nowPlayingFmt = translate(lang, 'dashboard_now_playing_format');
    const upNextDesc = translate(lang, 'dashboard_up_next_desc');
    const listFull = translate(lang, 'dashboard_list_format_full');
    const listNoRating = translate(lang, 'dashboard_list_format_no_rating');
    const listCompleted = translate(lang, 'dashboard_list_format_completed');
    const tableGame = translate(lang, 'table_game');
    const tableRating = translate(lang, 'table_rating');
    const tableTime = translate(lang, 'table_time');
    const tableValue = translate(lang, 'table_value');
    const tableOn = translate(lang, 'table_on');

    // helper: convert a format string with placeholders into a dataview JS expression
      const toExpr = (fmt: string) => {
        const parts: string[] = [];
        const re = /\{(title|platform|hours|rating|backlogCount|totalHours|playing|completed)\}/g;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(fmt)) !== null) {
          if (m.index > last) {
            parts.push(JSON.stringify(fmt.slice(last, m.index)));
          }
          const key = m[1];
          if (key === 'title') {
            parts.push('link(file.link, title)');
          } else if (key === 'platform') {
            parts.push('platform');
          } else if (key === 'hours') {
            parts.push('hltb_hours');
          } else if (key === 'rating') {
            parts.push('rating');
          } else if (key === 'backlogCount') {
            parts.push('backlogCount');
          } else if (key === 'totalHours') {
            parts.push('totalHours');
          } else if (key === 'playing') {
            parts.push('playing');
          } else if (key === 'completed') {
            parts.push('completed');
          }
          last = re.lastIndex;
        }
        if (last < fmt.length) parts.push(JSON.stringify(fmt.slice(last)));
        return parts.join(' + ');
      };

    const nowPlayingExpr = toExpr(nowPlayingFmt);
    const mustPlayExpr = toExpr(listFull);
    const eventuallyExpr = toExpr(listNoRating);
    const completedExpr = toExpr(listCompleted);
      const summaryExpr = toExpr(summaryT);

    // priority labels (localized/stored values)
    const pMust = translate(lang, 'priority_must_play');
    const pWill = translate(lang, 'priority_will_get_around_to');
    const pPlaying = translate(lang, 'priority_playing');
    const pCompleted = translate(lang, 'priority_completed');

    const content = `---
tags:
  - dashboard
  - gaming
obsidianUIMode: preview
---

# ${translate(lang, 'dashboard_title')}

## ${translate(lang, 'dashboard_at_a_glance')}

\`\`\`dataviewjs
const games = dv.pages('#game');
const backlog = games.where(p => p.priority === ${JSON.stringify(pMust)} || p.priority === ${JSON.stringify(pWill)});
const backlogCount = backlog.length;
const totalHours = Math.round(backlog.array().reduce((sum, p) => sum + (p.hltb_hours || 0), 0));
const completed = games.where(p => p.priority === ${JSON.stringify(pCompleted)}).length;
const playing = games.where(p => p.priority === ${JSON.stringify(pPlaying)}).length;

  dv.paragraph(${summaryExpr});
\`\`\`

---

## ${translate(lang, 'dashboard_now_playing')}

\`\`\`dataview
LIST WITHOUT ID ${nowPlayingExpr}
FROM #game
WHERE priority = ${JSON.stringify(pPlaying)}
\`\`\`

---

## ${translate(lang, 'dashboard_up_next')}

*${upNextDesc}*

\`\`\`dataview
TABLE WITHOUT ID
  link(file.link, title) AS "${tableGame}",
  rating AS "${tableRating}",
  hltb_hours + "h" AS "${tableTime}",
  efficiency AS "${tableValue}",
  platform AS "${tableOn}"
FROM #game
WHERE priority = ${JSON.stringify(pMust)}
SORT efficiency DESC
LIMIT 5
\`\`\`

---

## ${translate(lang, 'dashboard_the_backlog')}

### ${translate(lang, 'dashboard_must_play')}
\`\`\`dataview
LIST WITHOUT ID ${mustPlayExpr}
FROM #game
WHERE priority = ${JSON.stringify(pMust)}
SORT efficiency DESC
\`\`\`

### ${translate(lang, 'dashboard_eventually')}
\`\`\`dataview
LIST WITHOUT ID ${eventuallyExpr}
FROM #game
WHERE priority = ${JSON.stringify(pWill)}
SORT efficiency DESC
\`\`\`

---

## ${translate(lang, 'dashboard_completed')}

\`\`\`dataview
LIST WITHOUT ID ${completedExpr}
FROM #game
WHERE priority = ${JSON.stringify(pCompleted)}
SORT file.mtime DESC
\`\`\`
`;

    // Replace JSON-encoded placeholders for dataview variables
    return content.replace(/"\\\$\{backlogCount\}"/g, '**${backlogCount}**')
      .replace(/"\\\$\{totalHours\}"/g, '**${totalHours}h**')
      .replace(/"\\\$\{playing\}"/g, '**${playing}**')
      .replace(/"\\\$\{completed\}"/g, '**${completed}**');
  }

  /**
   * Updates the status of a game in the backlog.
   * @param filePath - Path to the game note file
   */
  private async updateGameStatus(filePath: string) {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) return;

    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache?.frontmatter) return;

    const initialPriority = typeof cache.frontmatter.priority === 'string' ? cache.frontmatter.priority : DEFAULT_SETTINGS.defaultPriority;

    // Create a simple modal to select new status
    const { Modal, Setting } = await import('obsidian');

    /**
     * Modal for updating game status.
     */
    class StatusModal extends Modal {
      private newPriority: string;
      private language: string;
      /** Callback function for when status is updated */
      private onSubmit: (priority: string) => void;

      /**
       * Creates a modal for updating game status.
       * @param app - Obsidian app instance
       * @param priority - Initial priority value
       * @param onSubmit - Callback when status is updated
       */
      constructor(
        app: App,
        priority: string,
        onSubmit: /**
         *
         */
        (priority: string) => void,
        language = 'en'
      ) {
        super(app);
        this.newPriority = priority;
        this.onSubmit = onSubmit;
        this.language = language;
      }

      /**
       * Sets up the modal content when opened.
       */
      onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: translate(this.language, 'status_modal_title') });

        new Setting(contentEl).setName(translate(this.language, 'status_label')).addDropdown((dropdown) => {
          const canonical = [
            'must_play',
            'will_get_around_to',
            'playing',
            'completed',
            'dropped',
          ];
          canonical.forEach((key) => {
            const stored = translate(this.language, `priority_${key}`);
            dropdown.addOption(stored, stored);
          });
          dropdown.setValue(this.newPriority);
          dropdown.onChange((value) => {
            this.newPriority = value;
          });
        });

        new Setting(contentEl).addButton((btn) => {
          btn
            .setButtonText(translate(this.language, 'update_button'))
            .setCta()
            .onClick(() => {
              this.onSubmit(this.newPriority);
              this.close();
            });
        });
      }

      /**
       * Cleans up the modal content when closed.
       */
      onClose() {
        const { contentEl } = this;
        contentEl.empty();
      }
    }

    const modal = new StatusModal(this.app, initialPriority, async (priority) => {
      // Update the frontmatter using processFrontMatter for atomic updates
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter.priority = priority;
      });
      new Notice(`${translate(this.settings.language, 'updated_status_notice')} "${priority}"`);
    });
    // pass language for translations inside the modal
    const _modal = modal as any;
    // If constructor supports language, create with language (older TS may have already created it)
    // For safety, recreate properly with language
    const modalWithLang = new (StatusModal as any)(this.app, initialPriority, async (priority: string) => {
      await this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
        frontmatter.priority = priority;
      });
      new Notice(`${translate(this.settings.language, 'updated_status_notice')} "${priority}"`);
    }, this.settings.language);
    modalWithLang.open();
  }

  /**
   * Cleans up resources when the plugin is unloaded.
   */
  onunload(): void {
    // Clean up injected styles
    const styleEl = document.getElementById('game-backlog-modal-styles');
    if (styleEl) {
      styleEl.remove();
    }
  }
}
