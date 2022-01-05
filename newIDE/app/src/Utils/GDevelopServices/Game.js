// @flow
import axios from 'axios';
import { GDevelopGameApi, GDevelopGamesPlatform } from './ApiConfigs';
import { type Filters } from './Filters';

export type Game = {
  id: string,
  gameName: string,
  authorName: string,
  createdAt: number,
  publicWebBuildId?: ?string,
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
  return `${GDevelopGamesPlatform.baseUrl}/games/${game.id}`;
};

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
  }: {|
    gameName?: string,
    authorName?: string,
    publicWebBuildId?: ?string,
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
