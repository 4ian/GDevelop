// @flow

import * as React from 'react';
import LeaderboardContext from './LeaderboardContext';
import {
  type Leaderboard,
  type LeaderboardEntry,
  type LeaderboardExtremePlayerScore,
  type LeaderboardSortOption,
  type LeaderboardPlayerUnicityDisplayOption,
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

const shouldDisplayOnlyBestEntries = (leaderboard: Leaderboard) =>
  leaderboard.playerUnicityDisplayChoice === 'PREFER_UNIQUE';

type ReducerState = {|
  currentLeaderboardId: ?string,
  currentLeaderboard: ?Leaderboard,
  leaderboardsByIds: ?{| [string]: Leaderboard |},
  displayOnlyBestEntry: boolean,
  entries: ?Array<LeaderboardDisplayData>,
|};

type ReducerAction =
  | {| type: 'SET_LEADERBOARDS', payload: ?Array<Leaderboard> |}
  | {| type: 'SET_ENTRIES', payload: ?Array<LeaderboardDisplayData> |}
  | {| type: 'SELECT_LEADERBOARD', payload: string |}
  | {| type: 'CHANGE_DISPLAY_ONLY_BEST_ENTRY', payload: boolean |}
  | {| type: 'UPDATE_OR_CREATE_LEADERBOARD', payload: Leaderboard |}
  | {| type: 'REMOVE_LEADERBOARD', payload: string |};

const reducer = (state: ReducerState, action: ReducerAction): ReducerState => {
  switch (action.type) {
    case 'SET_LEADERBOARDS':
      const leaderboards = action.payload;
      if (!leaderboards)
        return {
          ...state,
          leaderboardsByIds: null,
          currentLeaderboardId: null,
          currentLeaderboard: null,
        };

      const leaderboardsByIds = leaderboards.reduce((acc, leaderboard) => {
        acc[leaderboard.id] = leaderboard;
        return acc;
      }, {});
      const shouldDefineCurrentLeaderboardIfNoneSelected =
        !state.currentLeaderboard && leaderboards && leaderboards.length > 0;
      const newCurrentLeaderboard = shouldDefineCurrentLeaderboardIfNoneSelected
        ? leaderboards[0]
        : state.currentLeaderboard;
      return {
        ...state,
        leaderboardsByIds,
        displayOnlyBestEntry: newCurrentLeaderboard
          ? shouldDisplayOnlyBestEntries(newCurrentLeaderboard)
          : false,
        currentLeaderboardId: newCurrentLeaderboard
          ? newCurrentLeaderboard.id
          : null,
        currentLeaderboard: newCurrentLeaderboard,
      };
    case 'SET_ENTRIES':
      return {
        ...state,
        entries: action.payload,
      };
    case 'SELECT_LEADERBOARD':
      if (!state.leaderboardsByIds) return state;
      const leaderboard = state.leaderboardsByIds[action.payload];
      return {
        ...state,
        displayOnlyBestEntry: shouldDisplayOnlyBestEntries(leaderboard),
        currentLeaderboardId: leaderboard.id,
        currentLeaderboard: leaderboard,
      };
    case 'CHANGE_DISPLAY_ONLY_BEST_ENTRY':
      return {
        ...state,
        displayOnlyBestEntry: action.payload,
      };
    case 'UPDATE_OR_CREATE_LEADERBOARD':
      return {
        ...state,
        displayOnlyBestEntry: shouldDisplayOnlyBestEntries(action.payload),
        leaderboardsByIds: {
          ...state.leaderboardsByIds,
          [action.payload.id]: action.payload,
        },
        currentLeaderboardId: action.payload.id,
        currentLeaderboard: action.payload,
      };
    case 'REMOVE_LEADERBOARD':
      const newLeaderboardsByIds = { ...state.leaderboardsByIds };
      delete newLeaderboardsByIds[action.payload];
      const leaderboardsIds = Object.keys(newLeaderboardsByIds);
      if (leaderboardsIds.length === 0) {
        return {
          ...state,
          displayOnlyBestEntry: false,
          leaderboardsByIds: newLeaderboardsByIds,
          currentLeaderboard: null,
          currentLeaderboardId: null,
        };
      }
      return {
        ...state,
        displayOnlyBestEntry: shouldDisplayOnlyBestEntries(
          newLeaderboardsByIds[leaderboardsIds[0]]
        ),
        leaderboardsByIds: newLeaderboardsByIds,
        currentLeaderboard: newLeaderboardsByIds[leaderboardsIds[0]],
        currentLeaderboardId: leaderboardsIds[0],
      };
    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
};

const LeaderboardProvider = ({ gameId, children }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const [
    {
      currentLeaderboardId,
      currentLeaderboard,
      leaderboardsByIds,
      displayOnlyBestEntry,
      entries,
    },
    dispatch,
  ] = React.useReducer<ReducerState, ReducerAction>(reducer, {
    currentLeaderboardId: null,
    currentLeaderboard: null,
    leaderboardsByIds: null,
    displayOnlyBestEntry: false,
    entries: null,
  });

  const listLeaderboards = React.useCallback(
    async () => {
      dispatch({ type: 'SET_LEADERBOARDS', payload: null });
      const fetchedLeaderboards = await listGameLeaderboards(gameId);
      fetchedLeaderboards.sort((a, b) => a.name.localeCompare(b.name));
      dispatch({ type: 'SET_LEADERBOARDS', payload: fetchedLeaderboards });
    },
    [gameId]
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
      if (!newLeaderboard) return;

      dispatch({
        type: 'UPDATE_OR_CREATE_LEADERBOARD',
        payload: newLeaderboard,
      });
    },
    [gameId, authenticatedUser]
  );

  const fetchEntries = React.useCallback(
    async () => {
      if (!currentLeaderboardId) return;
      dispatch({ type: 'SET_ENTRIES', payload: null });
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
      if (!fetchedEntries) return;

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
      dispatch({ type: 'SET_ENTRIES', payload: entriesToDisplay });
    },
    [currentLeaderboardId, displayOnlyBestEntry, gameId]
  );

  React.useEffect(
    () => {
      if (!currentLeaderboardId) return;
      fetchEntries();
    },
    [currentLeaderboardId, displayOnlyBestEntry, fetchEntries]
  );

  const selectLeaderboard = React.useCallback((leaderboardId: string) => {
    dispatch({ type: 'SET_ENTRIES', payload: null });
    dispatch({ type: 'SELECT_LEADERBOARD', payload: leaderboardId });
  }, []);

  const setDisplayOnlyBestEntry = React.useCallback((newValue: boolean) => {
    dispatch({ type: 'CHANGE_DISPLAY_ONLY_BEST_ENTRY', payload: newValue });
  }, []);

  const updateLeaderboard = async (attributes: {|
    name?: string,
    sort?: LeaderboardSortOption,
    playerUnicityDisplayChoice?: LeaderboardPlayerUnicityDisplayOption,
  |}) => {
    if (!currentLeaderboardId) return;
    if (attributes.sort) dispatch({ type: 'SET_ENTRIES', payload: null });
    const updatedLeaderboard = await doUpdateLeaderboard(
      authenticatedUser,
      gameId,
      currentLeaderboardId,
      attributes
    );
    if (!updatedLeaderboard) return;

    dispatch({
      type: 'UPDATE_OR_CREATE_LEADERBOARD',
      payload: updatedLeaderboard,
    });

    if (attributes.sort) await fetchEntries();
  };

  const resetLeaderboard = async () => {
    if (!currentLeaderboardId) return;
    dispatch({ type: 'SET_ENTRIES', payload: null });
    const updatedLeaderboard = await doResetLeaderboard(
      authenticatedUser,
      gameId,
      currentLeaderboardId
    );
    if (!updatedLeaderboard) return;

    dispatch({
      type: 'UPDATE_OR_CREATE_LEADERBOARD',
      payload: updatedLeaderboard,
    });
    fetchEntries();
  };

  const deleteLeaderboard = async () => {
    if (!currentLeaderboardId || !leaderboardsByIds) return;
    dispatch({ type: 'SET_ENTRIES', payload: null });
    await doDeleteLeaderboard(authenticatedUser, gameId, currentLeaderboardId);
    dispatch({ type: 'REMOVE_LEADERBOARD', payload: currentLeaderboardId });
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
        leaderboards: !!leaderboardsByIds
          ? // $FlowFixMe
            Object.values(leaderboardsByIds)
          : null,
        currentLeaderboard,
        displayOnlyBestEntry,
        browsing: { entries },
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
