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
  updateLeaderboard: ({|
    name?: string,
    sort?: LeaderboardSortOption,
  |}) => Promise<void>,
  resetLeaderboard: () => Promise<void>,
|};

export const initialLeaderboardState = {
  leaderboards: null,
  currentLeaderboardId: null,
  browsing: {
    entries: null,
    currentUrl: null,
    nextUrl: null,
  },
  createLeaderboard: async () => null,
  listLeaderboards: async () => {},
  selectLeaderboard: () => {},
  updateLeaderboard: async () => {},
  resetLeaderboard: async () => {},
};

const LeaderboardContext = React.createContext<LeaderboardState>(
  initialLeaderboardState
);

export default LeaderboardContext;
