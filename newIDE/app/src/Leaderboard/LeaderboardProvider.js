// @flow

import * as React from 'react';
import LeaderboardContext from './LeaderboardContext';
import {
  type Leaderboard,
  type LeaderboardEntry,
  type LeaderboardExtremePlayerScore,
  type LeaderboardSortOption,
  type LeaderboardDisplayData,
  createLeaderboard as doCreateLeaderboard,
  updateLeaderboard as doUpdateLeaderboard,
  resetLeaderboard as doResetLeaderboard,
  deleteLeaderboardEntry as doDeleteLeaderboardEntry,
  deleteLeaderboard as doDeleteLeaderboard,
  extractExtremeScoreDisplayData,
  extractEntryDisplayData,
  listLeaderboardEntries,
  listGameLeaderboards,
} from '../Utils/GDevelopServices/Play';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {| gameId: string, children: React.Node |};

const pageSize = 10;

const LeaderboardProvider = ({ gameId, children }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  // -- Context state --
  const [leaderboards, setLeaderboards] = React.useState<?Array<Leaderboard>>(
    null
  );
  const [
    displayOnlyBestEntry,
    setDisplayOnlyBestEntry,
  ] = React.useState<boolean>(false);
  const [
    currentLeaderboardId,
    setCurrentLeaderboardId,
  ] = React.useState<?string>(null);
  const [currentUrl, setCurrentUrl] = React.useState<string>('');
  const [nextUrl, setNextUrl] = React.useState<?string>(null);
  const [entries, setEntries] = React.useState<?Array<LeaderboardDisplayData>>(
    null
  );

  const listLeaderboards = React.useCallback(
    async (ignoreCurrentLeaderboardId: boolean = false) => {
      const fetchedLeaderboards = await listGameLeaderboards(gameId);
      fetchedLeaderboards.sort((a, b) => a.name.localeCompare(b.name))
      setLeaderboards(fetchedLeaderboards);
      if (
        fetchedLeaderboards.length > 0 &&
        (ignoreCurrentLeaderboardId || !currentLeaderboardId)
      ) {
        setCurrentLeaderboardId(fetchedLeaderboards[0].id);
      }
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

  const fetchEntries = React.useCallback(
    async () => {
      if (!currentLeaderboardId) return;
      setEntries(null);
      const fetchedEntries:
        | LeaderboardEntry[]
        | LeaderboardExtremePlayerScore[] = await listLeaderboardEntries(
        gameId,
        currentLeaderboardId,
        {
          pageSize,
          onlyBestEntry: displayOnlyBestEntry,
        }
      );
      let entriesToDisplay: LeaderboardDisplayData[] = [];
      if (displayOnlyBestEntry) {
        entriesToDisplay = fetchedEntries.map(entry =>
          // $FlowIgnore
          extractExtremeScoreDisplayData(entry)
        );
      } else {
        entriesToDisplay = fetchedEntries.map(entry =>
          // $FlowIgnore
          extractEntryDisplayData(entry)
        );
      }
      setEntries(entriesToDisplay);
    },
    [displayOnlyBestEntry, currentLeaderboardId, gameId]
  );

  React.useEffect(
    () => {
      if (!currentLeaderboardId) return;
      fetchEntries();
    },
    [currentLeaderboardId, displayOnlyBestEntry, fetchEntries]
  );

  const selectLeaderboard = React.useCallback(
    (leaderboardId: string) => {
      setEntries(null);
      setCurrentLeaderboardId(leaderboardId);
    },
    [setCurrentLeaderboardId]
  );

  const updateLeaderboard = async (payload: {|
    name?: string,
    sort?: LeaderboardSortOption,
  |}) => {
    if (!currentLeaderboardId) return;
    if (payload.sort) setEntries(null);
    await doUpdateLeaderboard(
      authenticatedUser,
      gameId,
      currentLeaderboardId,
      payload
    );
    await listLeaderboards();
    if (payload.sort) await fetchEntries();
  };

  const resetLeaderboard = async () => {
    if (!currentLeaderboardId) return;
    setEntries(null);
    await doResetLeaderboard(authenticatedUser, gameId, currentLeaderboardId);
    listLeaderboards();
    fetchEntries();
  };

  const deleteLeaderboard = async () => {
    if (!currentLeaderboardId) return;
    setEntries(null);
    await doDeleteLeaderboard(authenticatedUser, gameId, currentLeaderboardId);
    setCurrentLeaderboardId(null);
    await listLeaderboards(true);
    fetchEntries();
  };

  const deleteLeaderboardEntry = async (entryId: string) => {
    if (!currentLeaderboardId) return;
    await doDeleteLeaderboardEntry(
      authenticatedUser,
      gameId,
      currentLeaderboardId,
      entryId
    );
    fetchEntries();
  };

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboards,
        currentLeaderboardId,
        displayOnlyBestEntry,
        browsing: { entries, currentUrl, nextUrl },
        setDisplayOnlyBestEntry,
        createLeaderboard,
        listLeaderboards,
        selectLeaderboard,
        updateLeaderboard,
        resetLeaderboard,
        deleteLeaderboard,
        deleteLeaderboardEntry,
        fetchLeaderboardEntries: fetchEntries,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export default LeaderboardProvider;
