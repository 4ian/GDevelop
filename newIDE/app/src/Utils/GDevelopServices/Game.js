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
    authorName,
    publicWebBuildId,
    description,
    playWithKeyboard,
    playWithGamepad,
    playWithMobile,
    orientation,
  }: {|
    gameName?: string,
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
