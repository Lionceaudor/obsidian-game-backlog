import fr from './fr';

type Locale = 'en' | 'fr';

export const LANG_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

const en = {
  api_credentials: 'API credentials',
  cmd_add_game: 'Add game to backlog',
  cmd_open_backlog: 'Open game backlog dashboard',
  cmd_update_status: 'Update current game status',
  twitch_client_id: 'Twitch Client ID',
  twitch_client_id_desc_prefix: 'Create an app at ',
  twitch_client_id_desc_suffix: ' to get your Client ID (used for IGDB API)',
  twitch_client_id_placeholder: 'Enter your Twitch Client ID',
  twitch_client_secret: 'Twitch Client Secret',
  twitch_client_secret_desc: "Your Twitch application's Client Secret",
  twitch_client_secret_placeholder: 'Enter your Twitch Client Secret',
  steamgriddb_api_key: 'SteamGridDB API Key',
  steamgriddb_api_key_desc_prefix: 'Get your API key from ',
  steamgriddb_api_key_placeholder: 'Enter your SteamGridDB API key',
  defaults_heading: 'Defaults',
  default_platform: 'Default Platform',
  default_platform_desc: 'The platform selected by default when adding a new game',
  default_priority: 'Default Priority',
  default_priority_desc: 'The priority selected by default when adding a new game',
  language: 'Language',
  language_desc: 'Choose the plugin UI language',
  modal_add_game_title: 'Add Game to Backlog',
  search_for_game: 'Search for a game',
  search_for_game_desc: 'Type to search IGDB database',
  search_placeholder: 'Enter game title...',
  platform_label: 'Platform',
  platform_desc: 'Which platform will you play this on?',
  priority_label: 'Priority',
  priority_desc: 'How likely are you to play this?',
  fetching_game_data: 'Fetching game data...',
  add_game_button: 'Add Game',
  adding_button: 'Adding...',
  please_select_game: 'Please select a game first',
  search_failed_notice: 'Failed to search games. Check your Twitch API credentials.',
  fetch_failed_notice: 'Failed to fetch game data. Please try again.',
  critic_rating: 'Critic Rating',
  rating_label: 'Rating',
  hltb_label: 'HLTB',
  efficiency_label: 'Efficiency',
  platform_label_short: 'Platform',
  year_label: 'Year',
  description_heading: 'Description',
  notes_heading: 'Notes',
  status_modal_title: 'Update game status',
  status_label: 'Status',
  update_button: 'Update',
  updated_status_notice: 'Updated status to',
  missing_twitch_keys: 'Please configure your Twitch Client ID and Secret in the Game Backlog settings',
  note_exists_notice: 'A note for "{title}" already exists',
  added_note_notice: 'Added "{title}" to your backlog!',
  create_note_failed: 'Failed to create game note. Check console for details.',
  dashboard_title: 'Video Game Backlog',
  dashboard_at_a_glance: 'At a Glance',
  dashboard_now_playing: 'Now Playing',
  dashboard_up_next: 'Up Next (Best Value)',
  dashboard_up_next_desc: 'Highest rated games you can finish quickly',
  dashboard_the_backlog: 'The Backlog',
  dashboard_must_play: 'Must Play',
  dashboard_eventually: 'Eventually',
  dashboard_completed: 'Completed',
  dashboard_created_notice: 'Created Video Game Backlog dashboard',
  dashboard_summary: '**{backlogCount}** games in backlog · **{totalHours}h** to clear · **{playing}** now playing · **{completed}** completed',
  dashboard_now_playing_format: '**{title}** on {platform} ({hours}h remaining)',
  dashboard_list_format_full: '{title} — {rating}/100, {hours}h ({platform})',
  dashboard_list_format_no_rating: '{title} — {hours}h ({platform})',
  dashboard_list_format_completed: '{title} ({rating}/100)',
  table_game: 'Game',
  table_rating: 'Rating',
  table_time: 'Time',
  table_value: 'Value',
  table_on: 'On',
  priority_must_play: 'Must Play',
  priority_will_get_around_to: 'Will Get Around To',
  priority_playing: 'Playing',
  priority_completed: 'Completed',
  priority_dropped: 'Dropped',
};

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en,
  fr,
};

/**
 * Returns a translated string for the given locale and key.
 * Falls back to English when translation is missing.
 * @param locale - Locale code (e.g. 'en', 'fr')
 * @param key - Translation key
 */
export function translate(locale: string, key: string): string {
  const loc = (locale === 'fr' ? 'fr' : 'en') as Locale;
  return TRANSLATIONS[loc][key] ?? TRANSLATIONS.en[key] ?? key;
}

/**
 * Returns the translation key for a priority value and translates it.
 * Keeps internal value unchanged, only returns a localized label.
 * @param locale - locale code
 * @param priority - internal priority string (e.g. 'Must Play')
 */
export function translatePriority(locale: string, priority: string): string {
  const key = `priority_${priority
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')}`;
  return translate(locale, key);
}

/**
 * Translate a platform name into the target locale when available.
 * Falls back to the original platform string when no translation is found.
 * @param locale - locale code
 * @param platform - platform string in English
 */
export function translatePlatform(locale: string, platform: string): string {
  if (locale !== 'fr') return platform;
  const map: Record<string, string> = {
    'Full PC': 'PC',
    'Gaming Laptop': 'PC portable',
    'Steam Deck': 'Steam Deck',
    'Nintendo Switch': 'Nintendo Switch',
    'Android Handheld': 'Android',
  };
  return map[platform] ?? platform;
}

/**
 * Translate a genre name into the target locale when available.
 * Falls back to the original genre string when no translation is found.
 * @param locale - locale code
 * @param genre - genre string in English
 */
export function translateGenre(locale: string, genre: string): string {
  if (locale !== 'fr') return genre;
  const map: Record<string, string> = {
    Action: 'Action',
    Adventure: 'Aventure',
    'Role-playing': 'Jeu de rôle',
    RPG: 'RPG',
    Strategy: 'Stratégie',
    Puzzle: 'Puzzle',
    Sports: 'Sport',
    Simulation: 'Simulation',
    Racing: 'Course',
    Platformer: 'Plate-forme',
    Horror: 'Horreur',
    Indie: 'Indépendant',
    Fighting: 'Combat',
    Shooter: 'Tir',
    Stealth: 'Infiltration',
    Casual: 'Casual',
  };
  return map[genre] ?? genre;
}

export type { Locale };
