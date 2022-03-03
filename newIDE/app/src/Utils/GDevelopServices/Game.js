// @flow
import axios from 'axios';
import { GDevelopGameApi, GDevelopGamesPlatform } from './ApiConfigs';
import { type Filters } from './Filters';
import { type UserPublicProfile } from './User';

export type PublicGame = {
  id: string,
  gameName: string,
  authorName: string, // this corresponds to the publisher name
  publicWebBuildId?: ?string,
  description?: string,
  authors: Array<?UserPublicProfile>,
  playWithKeyboard: boolean,
  playWithGamepad: boolean,
  playWithMobile: boolean,
  orientation: string,
  metrics?: {
    lastWeekSessionsCount: number,
    lastYearSessionsCount: number,
  },
  categories?: string[],
};

export type Game = {
  id: string,
  gameName: string,
  authorName: string, // this corresponds to the publisher name
  createdAt: number,
  publicWebBuildId?: ?string,
  description?: string,
};

export type ShowcasedGameLink = {
  url: string,
  type:
    | 'app-store'
    | 'play-store'
    | 'play'
    | 'download'
    | 'download-win-mac-linux'
    | 'learn-more',
};

export type ShowcasedGame = {
  title: string,
  author: string,
  description: string,
  genres: Array<string>,
  platforms: Array<string>,
  /** Represents the union of genres+platforms. */
  tags: Array<string>,
  imageUrls: Array<string>,
  links: Array<ShowcasedGameLink>,
  isFeatured: boolean,
  bannerUrl: string,
  bannerBackgroundPosition: string,
  thumbnailUrl: string,
  editorDescription: string,
};

export type AllShowcasedGames = {
  showcasedGames: Array<ShowcasedGame>,
  filters: Filters,
};

export const allGameCategories = [
  'action',
  'adventure',
  'shooter',
  'platformer',
  'rpg',
  'horror',
  'strategy',
  'puzzle',
  'story-rich',
  'survival',
  'racing',
  'building',
  'simulation',
  'sport',
  'multiplayer',
  'leaderboard',
];

export const getCategoryName = (category: string) => {
  switch (category) {
    case 'action':
      return 'Action';
    case 'adventure':
      return 'Adventure';
    case 'shooter':
      return 'Shooter';
    case 'platformer':
      return 'Platformer';
    case 'rpg':
      return 'RPG';
    case 'horror':
      return 'Horror';
    case 'strategy':
      return 'Strategy';
    case 'puzzle':
      return 'Puzzle';
    case 'racing':
      return 'Racing';
    case 'simulation':
      return 'Simulation';
    case 'sport':
      return 'Sport';
    case 'story-rich':
      return 'Story-Rich';
    case 'survival':
      return 'Survival';
    case 'building':
      return 'Building';
    case 'multiplayer':
      return 'Multiplayer';
    case 'leaderboard':
      return 'Leaderboard';
    default:
      return category;
  }
};

export const getGameUrl = (game: ?Game) => {
  if (!game) return null;
  return GDevelopGamesPlatform.getGameUrl(game.id);
};

export const getAclsFromAuthorIds = (
  authorIds: gdVectorString
): Array<{| userId: string, feature: string, level: string |}> =>
  authorIds.toJSArray().map(authorId => ({
    userId: authorId,
    feature: 'author',
    level: 'owner',
  }));

export const listAllShowcasedGames = (): Promise<AllShowcasedGames> => {
  return axios
    .get(`${GDevelopGameApi.baseUrl}/showcased-game`)
    .then(response => response.data)
    .then(({ gamesShowcaseUrl, filtersUrl }) => {
      if (!gamesShowcaseUrl || !filtersUrl) {
        throw new Error('Unexpected response from the resource endpoint.');
      }
      return Promise.all([
        axios.get(gamesShowcaseUrl).then(response => response.data),
        axios.get(filtersUrl).then(response => response.data),
      ]).then(([showcasedGames, filters]) => ({
        showcasedGames,
        filters,
      }));
    });
};

export const registerGame = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  {
    gameId,
    gameName,
    authorName,
  }: {|
    gameId: string,
    gameName: string,
    authorName: string,
  |}
): Promise<Game> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopGameApi.baseUrl}/game/${gameId}`,
        {
          gameName,
          authorName,
        },
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
};

export const updateGame = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  {
    gameName,
    categories,
    authorName,
    publicWebBuildId,
    description,
    playWithKeyboard,
    playWithGamepad,
    playWithMobile,
    orientation,
  }: {|
    gameName?: string,
    categories?: string[],
    authorName?: string,
    publicWebBuildId?: ?string,
    description?: string,
    playWithKeyboard?: boolean,
    playWithGamepad?: boolean,
    playWithMobile?: boolean,
    orientation?: string,
  |}
): Promise<Game> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.patch(
        `${GDevelopGameApi.baseUrl}/game/${gameId}`,
        {
          gameName,
          categories,
          authorName,
          publicWebBuildId,
          description,
          playWithKeyboard,
          playWithGamepad,
          playWithMobile,
          orientation,
        },
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
};

export const setGameUserAcls = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  acls: Array<{| userId: string, feature: string, level: string |}>
): Promise<void> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopGameApi.baseUrl}/game/action/set-acls`,
        {
          gameId,
          acls,
        },
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
};

export const getGame = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string
): Promise<Game> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopGameApi.baseUrl}/game/${gameId}`, {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const deleteGame = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string
): Promise<Game> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.delete(`${GDevelopGameApi.baseUrl}/game/${gameId}`, {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const getGames = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Array<Game>> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopGameApi.baseUrl}/game`, {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const getPublicGame = (gameId: string): Promise<PublicGame> => {
  return axios
    .get(`${GDevelopGameApi.baseUrl}/public-game/${gameId}`)
    .then(response => response.data);
};
