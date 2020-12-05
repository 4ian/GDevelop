// @flow
import axios from 'axios';
import { GDevelopGameApi } from './ApiConfigs';

export type Game = {
  id: string,
  gameName: string,
  authorName: string,
  createdAt: number,
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
      axios.patch(
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
