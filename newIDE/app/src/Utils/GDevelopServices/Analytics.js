// @flow
import axios from 'axios';
import { GDevelopAnalyticsApi } from './ApiConfigs';

export type GameMetrics = {
  date: string,

  sessions: ?{
    /** Number of sessions for this day. */
    d0Sessions: number,
    /** Total, cumulative, duration of sessions for this day. */
    d0SessionsDurationTotal: ?number,
  },
  players: ?{
    /** Number of players for this day. */
    d0Players: number,
    /** Number of new players for this day. */
    d0NewPlayers: number,
    /** Number of players who played the game less than 1 minute for this day. */
    d0PlayersBelow60s: ?number,
    /** Number of players who played the game less than 3 minutes for this day. */
    d0PlayersBelow180s: ?number,
    /** Number of players who played the game less than 5 minutes for this day. */
    d0PlayersBelow300s: ?number,
    /** Number of players who played the game less than 10 minutes for this day. */
    d0PlayersBelow600s: ?number,
    /** Number of players who played the game less than 15 minutes for this day. */
    d0PlayersBelow900s: ?number,
  },
  retention: ?{
    /** Day 1 retained players (number of players who played this day, and were new players 1 days earlier). */
    d1RetainedPlayers: number,
    /** Day 2 retained players (number of players who played this day, and were new players 2 days earlier). */
    d2RetainedPlayers: number,
    /** Day 3 retained players (number of players who played this day, and were new players 3 days earlier). */
    d3RetainedPlayers: number,
    /** Day 4 retained players (number of players who played this day, and were new players 4 days earlier). */
    d4RetainedPlayers: number,
    /** Day 5 retained players (number of players who played this day, and were new players 5 days earlier). */
    d5RetainedPlayers: number,
    /** Day 6 retained players (number of players who played this day, and were new players 6 days earlier). */
    d6RetainedPlayers: number,
    /** Day 7 retained players (number of players who played this day, and were new players 7 days earlier). */
    d7RetainedPlayers: number,
  },
};

export const getGameMetrics = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  dayIsoDate: string
): Promise<?GameMetrics> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await axios.get(
    `${GDevelopAnalyticsApi.baseUrl}/game-metrics`,
    {
      params: {
        userId,
        gameId,
        dayIsoDate,
      },
      headers: {
        Authorization: authorizationHeader,
      },
      validateStatus: status =>
        (status >= 200 && status < 300) || status === 404,
    }
  );

  if (response.status === 404) return null;
  return response.data;
};

export const getGameMetricsFrom = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  firstDayIsoDate: string
): Promise<?(GameMetrics[])> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await axios.get(
    `${GDevelopAnalyticsApi.baseUrl}/game-metrics`,
    {
      params: {
        userId,
        gameId,
        firstDayIsoDate,
      },
      headers: {
        Authorization: authorizationHeader,
      },
      validateStatus: status =>
        (status >= 200 && status < 300) || status === 404,
    }
  );

  if (response.status === 404) return null;
  return response.data;
};
