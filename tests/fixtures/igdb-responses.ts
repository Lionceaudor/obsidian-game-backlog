import type { IgdbGame } from '../../src/api/igdb';

export const mockTwitchTokenResponse = {
  access_token: 'test-access-token-12345',
  expires_in: 5184000, // 60 days in seconds
  token_type: 'bearer',
};

export const mockIgdbSearchResults: IgdbGame[] = [
  {
    id: 1942,
    name: 'The Witcher 3: Wild Hunt',
    slug: 'the-witcher-3-wild-hunt',
    summary:
      'RPG and target on an attack that is powerful. The game features a vast open world that you can explore at your leisure.',
    aggregated_rating: 92.5,
    aggregated_rating_count: 50,
    total_rating: 94.2,
    first_release_date: 1431993600, // May 19, 2015
    cover: {
      id: 89386,
      image_id: 'co1wyy',
    },
    genres: [
      { id: 12, name: 'Role-playing (RPG)', slug: 'role-playing-rpg' },
      { id: 31, name: 'Adventure', slug: 'adventure' },
    ],
    platforms: [
      { id: 6, name: 'PC (Microsoft Windows)', abbreviation: 'PC' },
      { id: 48, name: 'PlayStation 4', abbreviation: 'PS4' },
      { id: 49, name: 'Xbox One', abbreviation: 'XONE' },
    ],
  },
  {
    id: 11208,
    name: 'The Witcher 3: Wild Hunt - Hearts of Stone',
    slug: 'the-witcher-3-wild-hunt-hearts-of-stone',
    summary: 'Hearts of Stone expansion pack for The Witcher 3.',
    aggregated_rating: 88.0,
    first_release_date: 1444694400, // October 13, 2015
    cover: {
      id: 89387,
      image_id: 'co1wyz',
    },
    genres: [{ id: 12, name: 'Role-playing (RPG)', slug: 'role-playing-rpg' }],
  },
];

export const mockIgdbGameById: IgdbGame = {
  id: 1942,
  name: 'The Witcher 3: Wild Hunt',
  slug: 'the-witcher-3-wild-hunt',
  summary:
    'The Witcher 3: Wild Hunt is an action role-playing game set in an open world environment.',
  storyline:
    'Geralt of Rivia, a monster hunter, is looking for his missing adopted daughter.',
  rating: 94.5,
  aggregated_rating: 92.5,
  aggregated_rating_count: 50,
  total_rating: 94.2,
  first_release_date: 1431993600,
  cover: {
    id: 89386,
    image_id: 'co1wyy',
  },
  genres: [
    { id: 12, name: 'Role-playing (RPG)', slug: 'role-playing-rpg' },
    { id: 31, name: 'Adventure', slug: 'adventure' },
  ],
  platforms: [
    { id: 6, name: 'PC (Microsoft Windows)', abbreviation: 'PC' },
    { id: 48, name: 'PlayStation 4', abbreviation: 'PS4' },
  ],
  websites: [
    { id: 1, url: 'https://thewitcher.com/', category: 1 },
    {
      id: 2,
      url: 'https://store.steampowered.com/app/292030/',
      category: 13,
    },
  ],
};

export const mockIgdbGameMinimal: IgdbGame = {
  id: 99999,
  name: 'Minimal Game',
  slug: 'minimal-game',
};

export const mockIgdbGameNoRating: IgdbGame = {
  id: 88888,
  name: 'No Rating Game',
  slug: 'no-rating-game',
  summary: 'A game without ratings',
  first_release_date: 1609459200, // Jan 1, 2021
  cover: {
    id: 12345,
    image_id: 'abc123',
  },
  genres: [{ id: 5, name: 'Shooter', slug: 'shooter' }],
};
