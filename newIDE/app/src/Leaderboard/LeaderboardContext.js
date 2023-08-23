// @flow
import * as React from 'react';
import {
  type Leaderboard,
  type LeaderboardSortOption,
  type LeaderboardEntry,
  type LeaderboardUpdatePayload,
} from '../Utils/GDevelopServices/Play';

export type LeaderboardState = {|
  leaderboards: ?Array<Leaderboard>,
  currentLeaderboard: ?Leaderboard,
  displayOnlyBestEntry: boolean,
  browsing: {|
    entries: ?Array<LeaderboardEntry>,
    goToNextPage: ?() => Promise<void>,
    goToPreviousPage: ?() => Promise<void>,
    goToFirstPage: ?() => Promise<void>,
  |},
  createLeaderboard: ({|
    name: string,
    sort: LeaderboardSortOption,
  |}) => Promise<?Leaderboard>,
  listLeaderboards: (
    ?{
      shouldClearBeforeFetching?: boolean,
    }
  ) => Promise<void>,
  selectLeaderboard: (id: string) => void,
  setDisplayOnlyBestEntry: boolean => void,
  updateLeaderboard: (payload: LeaderboardUpdatePayload) => Promise<void>,
  resetLeaderboard: () => Promise<void>,
  deleteLeaderboard: () => Promise<void>,
  deleteLeaderboardEntry: (entryId: string) => Promise<void>,
  fetchLeaderboardEntries: () => Promise<void>,
|};

export const initialLeaderboardState = {
  leaderboards: null,
  currentLeaderboard: null,
  displayOnlyBestEntry: false,
  browsing: {
    entries: null,
    goToNextPage: null,
    goToPreviousPage: null,
    goToFirstPage: null,
  },
  createLeaderboard: async () => null,
  listLeaderboards: async () => {},
  selectLeaderboard: () => {},
  setDisplayOnlyBestEntry: () => {},
  updateLeaderboard: async () => {},
  resetLeaderboard: async () => {},
  deleteLeaderboard: async () => {},
  deleteLeaderboardEntry: async entryId => {},
  fetchLeaderboardEntries: async () => {},
};

const LeaderboardContext = React.createContext<LeaderboardState>(
  initialLeaderboardState
);

export default LeaderboardContext;
