# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Updated minimum Obsidian app version from 1.0.0 to 1.10.6
- Changed author URL from GitHub to personal website (pyk.ee)

## [1.0.3] - 2026-01-11

### Changed

- Added `Nintendo Switch` to supported platforms and set it as the default platform
- Documentation: updated README to mention Nintendo Switch support

## [1.0.4] - 2026-01-11

### Added

- Localized frontmatter fields for French (`platform_localized`, `priority_localized`, `genres_localized`)

### Changed

- Added `Nintendo Switch` to available platforms (non-default)
- i18n: added platform and genre translation helpers



## [1.0.2] - 2026-01-11

### Added

- French localization support for plugin UI and dashboard

### Changed

- Settings UI: added language selector and translations
- Dashboard: localized headings, summary and list/table formats
- Templates: generated game note supports localized labels

### Fixed

- Minor quoting fixes in French translations

## [1.0.1] - 2025-12-15

### Fixed

- Removed non-existent `styles.css` from release workflow to fix build failures

## [1.0.0] - 2025-12-15

### Added

- Initial release of Game Backlog plugin
- Game search and addition functionality
- Automatic metadata fetching from IGDB, HLTB, and SteamGridDB
- Value score calculation (rating ÷ hours to beat)
- Dataview-powered dashboard
- Game status tracking (Must Play, Playing, Completed, Dropped)
- Game note generation with rich metadata
- Platform and priority selection
- API settings configuration

### Features

- Add games to backlog with comprehensive metadata
- View backlog dashboard with stats and recommendations
- Update game status from command palette
- Automatic cover art fetching
- Game efficiency scoring

### Fixed

- Initial release - no fixes yet

### Changed

- Initial release - no changes yet

### Removed

- Initial release - no removals yet
