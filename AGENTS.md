# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start dev server with watch mode (esbuild)
npm run build    # Type-check and build for production
```

The build outputs `main.js` to the project root. For testing in Obsidian, symlink or copy the project folder to your vault's `.obsidian/plugins/game-backlog/` directory.

## Architecture

This is an Obsidian plugin that helps users manage their video game backlog. It integrates with three external APIs to fetch game metadata:

### API Clients (`src/api/`)

- **IGDB** (`igdb.ts`): Primary game database. Uses Twitch OAuth for authentication. Provides game metadata, ratings, genres, release dates, and cover images.
- **HowLongToBeat** (`hltb.ts`): Fetches completion time estimates. Uses web scraping with auth token discovery from the HLTB website.
- **SteamGridDB** (`steamgriddb.ts`): Fetches high-quality game artwork (grids, heroes, logos).

### Core Flow

1. User opens "Add Game" modal via command palette
2. `AddGameModal` (`src/ui/AddGameModal.ts`) searches IGDB as user types
3. On game selection, fetches HLTB time estimates and SteamGridDB artwork
4. Calculates "efficiency" score: `rating / hltb_hours`
5. `generateGameNote()` (`src/templates/gameNote.ts`) creates markdown note with YAML frontmatter
6. Notes are tagged with `#game` and `#backlog` for Dataview queries

### Settings (`src/settings.ts`)

Stores API credentials (Twitch Client ID/Secret, SteamGridDB API Key) and default values for platform/priority dropdowns.

### Generated Dashboard

The plugin creates a Dataview-powered dashboard at `Video Game Backlog.md` that displays games organized by priority and platform, sorted by efficiency score.

## Frontmatter Schema

Game notes use this frontmatter structure:

```yaml
title: 'Game Name'
platform: 'Steam Deck' # Full PC | Gaming Laptop | Steam Deck | Android Handheld
priority: 'Must Play' # Must Play | Will Get Around To | Playing | Completed | Dropped
rating: 85 # IGDB aggregated_rating (critic score, 0-100)
hltb_hours: 12.5 # Main story completion time
efficiency: 6.8 # rating / hltb_hours
cover: 'https://...'
igdb_id: 12345
release_year: 2023
genres: ['RPG', 'Action']
added: '2024-01-15'
tags: [game, backlog]
```
