// @flow
import axios from 'axios';
import { type I18n as I18nType } from '@lingui/core';
import { GDevelopGameApi, GDevelopGamesPlatform } from './ApiConfigs';
import { type Filters } from './Filters';
import { type UserPublicProfile } from './User';
import { t } from '@lingui/macro';

export type PublicGame = {
  id: string,
  gameName: string,
  authorName: string, // this corresponds to the publisher name
  publicWebBuildId?: ?string,
  description?: string,
  owners: Array<UserPublicProfile>,
  authors: Array<UserPublicProfile>,
  playWithKeyboard: boolean,
  playWithGamepad: boolean,
  playWithMobile: boolean,
  orientation: string,
  thumbnailUrl?: string,
  cachedLastWeekSessionsCount?: number,
  cachedLastYearSessionsCount?: number,
  categories?: string[],
  userSlug?: string,
  gameSlug?: string,
  discoverable?: boolean,
};

export type Game = {
  id: string,
  gameName: string,
  authorName: string, // this corresponds to the publisher name
  createdAt: number,
  publicWebBuildId?: ?string,
  description?: string,
  thumbnailUrl?: string,
  discoverable?: boolean,
  acceptsBuildComments?: boolean,
  acceptsGameComments?: boolean,
  displayAdsOnGamePage?: boolean,
};

export type GameSlug = {
  username: string,
  gameSlug: string,
  createdAt: number,
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

export type GameApiError = {|
  code: 'game-deletion/leaderboards-exist',
|};

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
  'educational',
];

export const getCategoryName = (category: string, i18n: I18nType) => {
  switch (category) {
    case 'action':
      return i18n._(t`Action`);
    case 'adventure':
      return i18n._(t`Adventure`);
    case 'shooter':
      return i18n._(t`Shooter`);
    case 'platformer':
      return i18n._(t`Platformer`);
    case 'rpg':
      return i18n._(t`RPG`);
    case 'horror':
      return i18n._(t`Horror`);
    case 'strategy':
      return i18n._(t`Strategy`);
    case 'puzzle':
      return i18n._(t`Puzzle`);
    case 'racing':
      return i18n._(t`Racing`);
    case 'simulation':
      return i18n._(t`Simulation`);
    case 'sport':
      return i18n._(t`Sport`);
    case 'story-rich':
      return i18n._(t`Story-Rich`);
    case 'survival':
      return i18n._(t`Survival`);
    case 'building':
      return i18n._(t`Building`);
    case 'multiplayer':
      return i18n._(t`Multiplayer`);
    case 'leaderboard':
      return i18n._(t`Leaderboard`);
    case 'educational':
      return i18n._(t`Educational`);
    default:
      return category;
  }
};

export const getGameUrl = (game: ?Game, slug: ?GameSlug) => {
  if (!game) return null;
  return slug
    ? GDevelopGamesPlatform.getGameUrlWithSlug(slug.username, slug.gameSlug)
    : GDevelopGamesPlatform.getGameUrl(game.id);
};

export const getAclsFromUserIds = (
  ownersIds: Array<string>
): Array<{| userId: string, level: string |}> =>
  ownersIds.map(ownerId => ({
    userId: ownerId,
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
    templateSlug,
  }: {|
    gameId: string,
    gameName: string,
    authorName: string,
    templateSlug: string,
  |}
): Promise<Game> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopGameApi.baseUrl}/game/${gameId}`,
        {
          gameName,
          authorName,
          templateSlug,
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
    thumbnailUrl,
    discoverable,
    acceptsBuildComments,
    acceptsGameComments,
    displayAdsOnGamePage,
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
    thumbnailUrl?: ?string,
    discoverable?: boolean,
    acceptsBuildComments?: boolean,
    acceptsGameComments?: boolean,
    displayAdsOnGamePage?: boolean,
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
          thumbnailUrl,
          discoverable,
          acceptsBuildComments,
          acceptsGameComments,
          displayAdsOnGamePage,
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
  acls: {|
    ownership?: Array<{| userId: string, level: string |}>,
    author?: Array<{| userId: string, level: string |}>,
  |}
): Promise<void> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopGameApi.baseUrl}/game/action/set-acls`,
        {
          gameId,
          newAcls: acls,
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

export const setGameSlug = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  userSlug: string,
  gameSlug: string
): Promise<void> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.post(
        `${GDevelopGameApi.baseUrl}/game/action/set-slug`,
        {
          gameId,
          userSlug,
          gameSlug,
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

export const getGameSlugs = (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string
): Promise<Array<GameSlug>> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      axios.get(`${GDevelopGameApi.baseUrl}/game-slug`, {
        params: {
          userId,
          gameId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};
