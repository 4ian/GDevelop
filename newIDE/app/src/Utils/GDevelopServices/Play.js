// @flow
import axios from 'axios';
import { GDevelopPlayApi } from './ApiConfigs';

import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

export type Leaderboard = {|
  id: string,
  gameId: string,
  name: string,
  sort: 'DESC' | 'ASC',
  startDatetime: string,
  deletedAt?: string,
|};

export type LeaderboardEntry = {|
  id: string,
  leaderboardId: string,
  playerId?: string,
  playerName: string,
  createdAt: string,
  score: number,
  deletedAt?: string,
  outdatedAt?: string,
|};

export type LeaderboardDisplayData = {|
  +id: string,
  +playerName: string,
  +createdAt: string,
  +score: number,
|};

export type LeaderboardSortOption = 'ASC' | 'DESC';

export const leaderboardSortOptions: LeaderboardSortOption[] = ['ASC', 'DESC'];

export type LeaderboardExtremePlayerScore = {|
  leaderboardId: string,
  playerId?: string,
  playerName: string,
  relatedEntryCreatedAt: string,
  score: number,
  relatedEntryId: string,
|};

export const extractEntryDisplayData = ({
  playerName,
  id,
  score,
  createdAt,
}: LeaderboardEntry): LeaderboardDisplayData => ({
  id,
  createdAt,
  playerName,
  score,
});

export const extractExtremeScoreDisplayData = ({
  playerName,
  relatedEntryId,
  score,
  relatedEntryCreatedAt,
}: LeaderboardExtremePlayerScore): LeaderboardDisplayData => ({
  id: relatedEntryId,
  createdAt: relatedEntryCreatedAt,
  playerName,
  score,
});

export const listGameLeaderboards = (gameId: string): Promise<Leaderboard[]> =>
  axios
    .get(`${GDevelopPlayApi.baseUrl}/game/${gameId}/leaderboards`)
    .then(response => response.data);

export const listLeaderboardEntries = (
  gameId: string,
  leaderboardId: string,
  options: {| pageSize: number, onlyBestEntry: boolean |}
): Promise<LeaderboardEntry[] | LeaderboardExtremePlayerScore[]> =>
  axios
    .get(
      `${
        GDevelopPlayApi.baseUrl
      }/game/${gameId}/leaderboard/${leaderboardId}/entries`,
      {
        params: {
          onlyBestEntry: options.onlyBestEntry,
          perPage: options.pageSize,
        },
      }
    )
    .then(response => response.data);

export const createLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  { name, sort }: {| name: string, sort: LeaderboardSortOption |}
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopPlayApi.baseUrl}/game/${gameId}/leaderboard`,
    {
      name,
      sort,
    },
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const updateLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string,
  payload: {| name?: string, sort?: LeaderboardSortOption |}
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.patch(
    `${GDevelopPlayApi.baseUrl}/game/${gameId}/leaderboard/${leaderboardId}`,
    payload,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const resetLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.put(
    `${
      GDevelopPlayApi.baseUrl
    }/game/${gameId}/leaderboard/${leaderboardId}/reset`,
    {},
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const deleteLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.delete(
    `${GDevelopPlayApi.baseUrl}/game/${gameId}/leaderboard/${leaderboardId}`,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const deleteLeaderboardEntry = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string,
  entryId: string
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.delete(
    `${
      GDevelopPlayApi.baseUrl
    }/game/${gameId}/leaderboard/${leaderboardId}/entry/${entryId}`,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};
