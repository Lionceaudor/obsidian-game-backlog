import { App, PluginSettingTab, Setting } from 'obsidian';

import GameBacklogPlugin from '../main';
import { translate, LANG_NAMES, translatePriority } from './i18n';

export interface GameBacklogSettings {
  twitchClientId: string;
  twitchClientSecret: string;
  steamGridDbApiKey: string;
  defaultPlatform: string;
  defaultPriority: string;
  language: string;
}

export const DEFAULT_SETTINGS: GameBacklogSettings = {
  twitchClientId: '',
  twitchClientSecret: '',
  steamGridDbApiKey: '',
  defaultPlatform: 'Nintendo Switch',
  defaultPriority: 'Will Get Around To',
  language: 'en',
};

export const PLATFORMS = [
  'Full PC',
  'Gaming Laptop',
  'Steam Deck',
  'Nintendo Switch',
  'Android Handheld',
] as const;

export const PRIORITIES = [
  'Must Play',
  'Will Get Around To',
  'Playing',
  'Completed',
  'Dropped',
] as const;

export type Platform = (typeof PLATFORMS)[number];
export type Priority = (typeof PRIORITIES)[number];

/**
 * Settings tab for the Game Backlog plugin.
 * Provides UI for configuring API keys and default values.
 */
export class GameBacklogSettingTab extends PluginSettingTab {
  plugin: GameBacklogPlugin;

  /**
   * Creates a new settings tab.
   * @param app - Obsidian app instance
   * @param plugin - Game Backlog plugin instance
   */
  constructor(app: App, plugin: GameBacklogPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Renders the settings UI.
   */
  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // API Keys Section
    new Setting(containerEl).setName(translate(this.plugin.settings.language, 'api_credentials')).setHeading();

    new Setting(containerEl)
      .setName(translate(this.plugin.settings.language, 'twitch_client_id'))
      .setDesc(
        createFragment((frag) => {
          frag.appendText(translate(this.plugin.settings.language, 'twitch_client_id_desc_prefix'));
          frag.createEl('a', {
            text: 'dev.twitch.tv/console/apps',
            href: 'https://dev.twitch.tv/console/apps',
          });
          frag.appendText(translate(this.plugin.settings.language, 'twitch_client_id_desc_suffix'));
        })
      )
      .addText((text) =>
        text
          .setPlaceholder(translate(this.plugin.settings.language, 'twitch_client_id_placeholder'))
          .setValue(this.plugin.settings.twitchClientId)
          .onChange(async (value) => {
            this.plugin.settings.twitchClientId = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(translate(this.plugin.settings.language, 'twitch_client_secret'))
      .setDesc(translate(this.plugin.settings.language, 'twitch_client_secret_desc'))
      .addText((text) => {
        text
          .setPlaceholder(translate(this.plugin.settings.language, 'twitch_client_secret_placeholder'))
          .setValue(this.plugin.settings.twitchClientSecret)
          .onChange(async (value) => {
            this.plugin.settings.twitchClientSecret = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'password';
      });

    new Setting(containerEl)
      .setName(translate(this.plugin.settings.language, 'steamgriddb_api_key'))
      .setDesc(
        createFragment((frag) => {
          frag.appendText(translate(this.plugin.settings.language, 'steamgriddb_api_key_desc_prefix'));
          frag.createEl('a', {
            text: 'steamgriddb.com/profile/preferences/api',
            href: 'https://www.steamgriddb.com/profile/preferences/api',
          });
        })
      )
      .addText((text) =>
        text
          .setPlaceholder(translate(this.plugin.settings.language, 'steamgriddb_api_key_placeholder'))
          .setValue(this.plugin.settings.steamGridDbApiKey)
          .onChange(async (value) => {
            this.plugin.settings.steamGridDbApiKey = value;
            await this.plugin.saveSettings();
          })
      );

    // Defaults Section
    new Setting(containerEl).setName(translate(this.plugin.settings.language, 'defaults_heading')).setHeading();

    new Setting(containerEl)
      .setName(translate(this.plugin.settings.language, 'default_platform'))
      .setDesc(translate(this.plugin.settings.language, 'default_platform_desc'))
      .addDropdown((dropdown) => {
        PLATFORMS.forEach((platform) => {
          dropdown.addOption(platform, platform);
        });
        dropdown
          .setValue(this.plugin.settings.defaultPlatform)
          .onChange(async (value) => {
            this.plugin.settings.defaultPlatform = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(translate(this.plugin.settings.language, 'default_priority'))
      .setDesc(translate(this.plugin.settings.language, 'default_priority_desc'))
      .addDropdown((dropdown) => {
        PRIORITIES.forEach((priority) => {
          dropdown.addOption(priority, translatePriority(this.plugin.settings.language, priority));
        });
        dropdown
          .setValue(this.plugin.settings.defaultPriority)
          .onChange(async (value) => {
            this.plugin.settings.defaultPriority = value;
            await this.plugin.saveSettings();
          });
      });

    // Language selector
    new Setting(containerEl)
      .setName(translate(this.plugin.settings.language, 'language'))
      .setDesc(translate(this.plugin.settings.language, 'language_desc'))
      .addDropdown((dropdown) => {
        Object.entries(LANG_NAMES).forEach(([code, name]) => dropdown.addOption(code, name));
        dropdown
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            // Re-render to update translated labels
            this.display();
          });
      });
  }
}
