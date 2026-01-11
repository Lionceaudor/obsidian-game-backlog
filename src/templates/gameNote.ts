import { GameData } from '../ui/AddGameModal';
import { translate } from '../i18n';

/**
 * Generates a complete game note with frontmatter and body content.
 * @param data - Game data to include in the note
 * @returns Complete markdown content for the game note
 */
export function generateGameNote(data: GameData, language = 'en'): string {
  const frontmatter = generateFrontmatter(data, language);
  const body = generateBody(data, language);
  return `${frontmatter}\n${body}`;
}

/**
 * Generates YAML frontmatter for the game note.
 * @param data - Game data to include in frontmatter
 * @returns YAML frontmatter string
 */
function generateFrontmatter(data: GameData, language = 'en'): string {
  const lines: string[] = ['---'];

  lines.push(`title: "${escapeYaml(data.title)}"`);
  lines.push(`platform: "${data.platform}"`);
  lines.push(`priority: "${data.priority}"`);

  // No localized duplicate frontmatter fields — use canonical fields only.

  if (data.rating !== null) {
    lines.push(`rating: ${data.rating}`);
  } else {
    lines.push('rating: null');
  }

  if (data.hltbHours !== null) {
    lines.push(`hltb_hours: ${data.hltbHours}`);
  } else {
    lines.push('hltb_hours: null');
  }

  if (data.efficiency !== null) {
    lines.push(`efficiency: ${data.efficiency}`);
  } else {
    lines.push('efficiency: null');
  }

  if (data.coverUrl) {
    lines.push(`cover: "${data.coverUrl}"`);
  }

  if (data.igdbId) {
    lines.push(`igdb_id: ${data.igdbId}`);
  }

  if (data.releaseYear) {
    lines.push(`release_year: ${data.releaseYear}`);
  }

  if (data.genres.length > 0) {
    lines.push('genres:');
    data.genres.forEach((genre) => {
      lines.push(`  - "${escapeYaml(genre)}"`);
    });

    // No localized genre duplicates.
  }

  lines.push(`added: ${new Date().toISOString().split('T')[0]}`);
  lines.push('tags:');
  lines.push('  - game');
  lines.push('  - backlog');

  lines.push('---');

  return lines.join('\n');
}

/**
 * Generates the markdown body content for the game note.
 * @param data - Game data to include in the body
 * @returns Markdown body content
 */
function generateBody(data: GameData, language = 'en'): string {
  const sections: string[] = [];

  // Cover image
  if (data.coverUrl) {
    sections.push(`![cover](${data.coverUrl})`);
    sections.push('');
  }

  // Game info summary
  const infoParts: string[] = [];
  if (data.rating !== null) {
    infoParts.push(`**${translate(language, 'rating_label')}:** ${data.rating}`);
  }
  if (data.hltbHours !== null) {
    infoParts.push(`**${translate(language, 'hltb_label')}:** ${data.hltbHours}h`);
  }
  if (data.efficiency !== null) {
    infoParts.push(`**${translate(language, 'efficiency_label')}:** ${data.efficiency}`);
  }
  infoParts.push(`**${translate(language, 'platform_label_short')}:** ${data.platform}`);
  if (data.releaseYear) {
    infoParts.push(`**${translate(language, 'year_label')}:** ${data.releaseYear}`);
  }

  if (infoParts.length > 0) {
    sections.push(infoParts.join(' | '));
    sections.push('');
  }

  // Description
  if (data.description) {
    sections.push(`## ${translate(language, 'description_heading')}`);
    sections.push('');
    // Truncate description if too long and clean it up
    let desc = data.description;
    // Remove HTML entities
    desc = desc.replace(/&#\d+;/g, '');
    // Limit to first 800 chars if very long
    if (desc.length > 800) {
      desc = `${desc.substring(0, 800).trim()  }...`;
    }
    sections.push(desc);
    sections.push('');
  }

  // Notes section for user
  sections.push(`## ${translate(language, 'notes_heading')}`);
  sections.push('');
  sections.push('');

  return sections.join('\n');
}

/**
 * Escapes special characters in a string for YAML compatibility.
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeYaml(str: string): string {
  return str.replace(/"/g, '\\"');
}

/**
 * Generates a safe filename for the game note.
 * @param title - Game title
 * @returns Safe filename with game emoji prefix
 */
export function generateFileName(title: string): string {
  // Sanitize the title for use as a filename
  const sanitized = title
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return `🎮 ${sanitized}.md`;
}
