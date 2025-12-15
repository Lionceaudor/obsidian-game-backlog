import { describe, it, expect, vi } from 'vitest';

import {
  DEFAULT_SETTINGS,
  PLATFORMS,
  PRIORITIES,
  type GameBacklogSettings,
  type Platform,
  type Priority,
} from '../../src/settings';

vi.mock('obsidian', () => import('../__mocks__/obsidian'));

describe('settings', () => {
  describe('DEFAULT_SETTINGS', () => {
    it('should have empty string for twitchClientId', () => {
      expect(DEFAULT_SETTINGS.twitchClientId).toBe('');
    });

    it('should have empty string for twitchClientSecret', () => {
      expect(DEFAULT_SETTINGS.twitchClientSecret).toBe('');
    });

    it('should have empty string for steamGridDbApiKey', () => {
      expect(DEFAULT_SETTINGS.steamGridDbApiKey).toBe('');
    });

    it('should have Steam Deck as default platform', () => {
      expect(DEFAULT_SETTINGS.defaultPlatform).toBe('Steam Deck');
    });

    it('should have Will Get Around To as default priority', () => {
      expect(DEFAULT_SETTINGS.defaultPriority).toBe('Will Get Around To');
    });

    it('should match GameBacklogSettings interface structure', () => {
      const settings: GameBacklogSettings = DEFAULT_SETTINGS;

      expect(settings).toHaveProperty('twitchClientId');
      expect(settings).toHaveProperty('twitchClientSecret');
      expect(settings).toHaveProperty('steamGridDbApiKey');
      expect(settings).toHaveProperty('defaultPlatform');
      expect(settings).toHaveProperty('defaultPriority');
    });
  });

  describe('PLATFORMS', () => {
    it('should contain exactly 4 platforms', () => {
      expect(PLATFORMS).toHaveLength(4);
    });

    it('should contain Full PC', () => {
      expect(PLATFORMS).toContain('Full PC');
    });

    it('should contain Gaming Laptop', () => {
      expect(PLATFORMS).toContain('Gaming Laptop');
    });

    it('should contain Steam Deck', () => {
      expect(PLATFORMS).toContain('Steam Deck');
    });

    it('should contain Android Handheld', () => {
      expect(PLATFORMS).toContain('Android Handheld');
    });

    it('should be a readonly array', () => {
      // TypeScript would prevent this at compile time, but we verify structure
      expect(Array.isArray(PLATFORMS)).toBe(true);
    });

    it('should have default platform as a valid option', () => {
      expect(PLATFORMS).toContain(DEFAULT_SETTINGS.defaultPlatform);
    });
  });

  describe('PRIORITIES', () => {
    it('should contain exactly 5 priorities', () => {
      expect(PRIORITIES).toHaveLength(5);
    });

    it('should contain Must Play', () => {
      expect(PRIORITIES).toContain('Must Play');
    });

    it('should contain Will Get Around To', () => {
      expect(PRIORITIES).toContain('Will Get Around To');
    });

    it('should contain Playing', () => {
      expect(PRIORITIES).toContain('Playing');
    });

    it('should contain Completed', () => {
      expect(PRIORITIES).toContain('Completed');
    });

    it('should contain Dropped', () => {
      expect(PRIORITIES).toContain('Dropped');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(PRIORITIES)).toBe(true);
    });

    it('should have default priority as a valid option', () => {
      expect(PRIORITIES).toContain(DEFAULT_SETTINGS.defaultPriority);
    });
  });

  describe('Type compatibility', () => {
    it('should allow Platform type assignment from PLATFORMS', () => {
      const platform: Platform = PLATFORMS[0];
      expect(PLATFORMS).toContain(platform);
    });

    it('should allow Priority type assignment from PRIORITIES', () => {
      const priority: Priority = PRIORITIES[0];
      expect(PRIORITIES).toContain(priority);
    });
  });
});
