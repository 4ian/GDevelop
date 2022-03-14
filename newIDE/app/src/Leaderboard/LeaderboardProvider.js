// @flow

import * as React from 'react';
import LeaderboardContext from './LeaderboardContext';
import {
  type Leaderboard,
  type LeaderboardEntry,
  type LeaderboardSortOption,
  type LeaderboardDisplayData,
  createLeaderboard as doCreateLeaderboard,
  updateLeaderboard as doUpdateLeaderboard,
  listGameLeaderboards,
} from '../Utils/GDevelopServices/Play';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {| gameId: string, children: React.Node |};

const LeaderboardProvider = ({ gameId, children }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  // -- Context state --
  const [leaderboards, setLeaderboards] = React.useState<?Array<Leaderboard>>(
    null
  );
  const [
    currentLeaderboardId,
    setCurrentLeaderboardId,
  ] = React.useState<?string>(null);
  const [currentUrl, setCurrentUrl] = React.useState<string>('');
  const [nextUrl, setNextUrl] = React.useState<?string>(null);
  const [entries, setEntries] = React.useState<Array<LeaderboardDisplayData>>(
    []
  );
  const listLeaderboards = React.useCallback(
    async () => {
      const fetchedLeaderboards = await listGameLeaderboards(gameId);
      setLeaderboards(fetchedLeaderboards);
      if (!currentLeaderboardId && fetchedLeaderboards.length > 0)
        setCurrentLeaderboardId(fetchedLeaderboards[0].id);
    },
    [gameId, currentLeaderboardId]
  );
  const createLeaderboard = React.useCallback(
    async (creationPayload: {|
      name: string,
      sort: LeaderboardSortOption,
    |}) => {
      const newLeaderboard = await doCreateLeaderboard(
        authenticatedUser,
        gameId,
        creationPayload
      );
      listLeaderboards();
      return newLeaderboard;
    },
    [gameId, authenticatedUser, listLeaderboards]
  );
  const selectLeaderboard = React.useCallback(
    (leaderboardId: string) => {
      setCurrentLeaderboardId(leaderboardId);
    },
    [setCurrentLeaderboardId]
  );
  const updateLeaderboard = async (payload: {|
    name?: string,
    sort?: LeaderboardSortOption,
  |}) => {
    if (!currentLeaderboardId) return;
    await doUpdateLeaderboard(
      authenticatedUser,
      gameId,
      currentLeaderboardId,
      payload
    );
    listLeaderboards();
  };
  // --

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboards,
        currentLeaderboardId,
        browsing: { entries, currentUrl, nextUrl },
        createLeaderboard,
        listLeaderboards,
        selectLeaderboard,
        updateLeaderboard,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export default LeaderboardProvider;
