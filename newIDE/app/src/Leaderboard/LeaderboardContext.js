// @flow
import * as React from 'react';
import {
  type Leaderboard,
  type LeaderboardSortOption,
  type LeaderboardDisplayData,
} from '../Utils/GDevelopServices/Play';

export type LeaderboardState = {|
  leaderboards: ?Array<Leaderboard>,
  currentLeaderboardId: ?string,
  displayOnlyBestEntry: boolean,
  browsing: {|
    entries: ?Array<LeaderboardDisplayData>,
    currentUrl: ?string,
    nextUrl: ?string,
  |},
  createLeaderboard: ({|
    name: string,
    sort: LeaderboardSortOption,
  |}) => Promise<?Leaderboard>,
  listLeaderboards: () => Promise<void>,
  selectLeaderboard: (id: string) => void,
  setDisplayOnlyBestEntry: boolean => void,
  updateLeaderboard: ({|
    name?: string,
    sort?: LeaderboardSortOption,
  |}) => Promise<void>,
  resetLeaderboard: () => Promise<void>,
  deleteLeaderboard: () => Promise<void>,
  deleteLeaderboardEntry: (entryId: string) => Promise<void>,
  fetchLeaderboardEntries: () => Promise<void>,
|};

export const initialLeaderboardState = {
  leaderboards: null,
  currentLeaderboardId: null,
  displayOnlyBestEntry: false,
  browsing: {
    entries: null,
    currentUrl: null,
    nextUrl: null,
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
