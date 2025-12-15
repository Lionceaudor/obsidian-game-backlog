import type { SgdbGame, SgdbGrid, SgdbHero, SgdbLogo } from '../../src/api/steamgriddb';

export const mockSgdbSearchResults: SgdbGame[] = [
  {
    id: 4614,
    name: 'The Witcher 3: Wild Hunt',
    types: ['steam'],
    verified: true,
  },
  {
    id: 4615,
    name: 'The Witcher 3: Wild Hunt - Game of the Year Edition',
    types: ['steam', 'gog'],
    verified: true,
  },
];

export const mockSgdbGrids: SgdbGrid[] = [
  {
    id: 123456,
    score: 150,
    style: 'alternate',
    width: 600,
    height: 900,
    nsfw: false,
    humor: false,
    notes: null,
    language: 'en',
    url: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/123456.png',
    thumb: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/thumb/123456.png',
    lock: false,
    epilepsy: false,
    upvotes: 200,
    downvotes: 50,
    author: {
      name: 'TestAuthor',
      steam64: '76561198000000000',
      avatar: 'https://avatars.steamstatic.com/avatar.jpg',
    },
  },
  {
    id: 123457,
    score: 100,
    style: 'blurred',
    width: 600,
    height: 900,
    nsfw: false,
    humor: false,
    notes: 'Great artwork',
    language: 'en',
    url: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/123457.png',
    thumb: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/thumb/123457.png',
    lock: false,
    epilepsy: false,
    upvotes: 120,
    downvotes: 20,
    author: {
      name: 'AnotherAuthor',
      steam64: '76561198000000001',
      avatar: 'https://avatars.steamstatic.com/avatar2.jpg',
    },
  },
  {
    id: 123458,
    score: 80,
    style: 'material',
    width: 600,
    height: 900,
    nsfw: false,
    humor: false,
    notes: null,
    language: 'en',
    url: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/grid/123458.png',
    thumb: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/thumb/123458.png',
    lock: false,
    epilepsy: false,
    upvotes: 90,
    downvotes: 10,
    author: {
      name: 'ThirdAuthor',
      steam64: '76561198000000002',
      avatar: 'https://avatars.steamstatic.com/avatar3.jpg',
    },
  },
];

export const mockSgdbGridsUnsorted: SgdbGrid[] = [
  { ...mockSgdbGrids[2], score: 50 },
  { ...mockSgdbGrids[0], score: 200 },
  { ...mockSgdbGrids[1], score: 100 },
];

export const mockSgdbHeroes: SgdbHero[] = [
  {
    id: 234567,
    score: 80,
    style: 'alternate',
    width: 1920,
    height: 620,
    nsfw: false,
    humor: false,
    notes: null,
    language: 'en',
    url: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/hero/234567.png',
    thumb: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/thumb/234567.png',
    lock: false,
    epilepsy: false,
    upvotes: 100,
    downvotes: 20,
    author: {
      name: 'HeroAuthor',
      steam64: '76561198000000003',
      avatar: 'https://avatars.steamstatic.com/avatar4.jpg',
    },
    type: 'hero',
  },
];

export const mockSgdbLogos: SgdbLogo[] = [
  {
    id: 345678,
    score: 60,
    style: 'official',
    width: 400,
    height: 200,
    nsfw: false,
    humor: false,
    notes: null,
    language: 'en',
    url: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/logo/345678.png',
    thumb: 'https://cdn2.steamgriddb.com/file/sgdb-cdn/thumb/345678.png',
    lock: false,
    epilepsy: false,
    upvotes: 70,
    downvotes: 10,
    author: {
      name: 'LogoAuthor',
      steam64: '76561198000000004',
      avatar: 'https://avatars.steamstatic.com/avatar5.jpg',
    },
    type: 'logo',
  },
];

export const mockSgdbApiError = {
  success: false,
  errors: ['Game not found', 'Invalid request'],
};

export const mockSgdbSuccessWrapper = <T>(data: T) => ({
  success: true,
  data,
});
