// @flow
import * as React from 'react';
import {
  getUserCommentQualityRatingsLeaderboards,
  type UserLeaderboard,
} from '../Utils/GDevelopServices/User';
import {
  getGameCommentQualityRatingsLeaderboards,
  type GameLeaderboard,
} from '../Utils/GDevelopServices/Game';

type CommunityLeaderboardsState = {|
  userLeaderboards: Array<UserLeaderboard> | null,
  gameLeaderboards: Array<GameLeaderboard> | null,
  error: ?Error,
  fetchCommunityLeaderboards: () => Promise<void>,
|};

export const CommunityLeaderboardsContext = React.createContext<CommunityLeaderboardsState>(
  {
    userLeaderboards: null,
    gameLeaderboards: null,
    error: null,
    fetchCommunityLeaderboards: async () => {},
  }
);

type CommunityLeaderboardsStateProviderProps = {|
  children: React.Node,
|};

export const CommunityLeaderboardsStateProvider = ({
  children,
}: CommunityLeaderboardsStateProviderProps) => {
  const [userLeaderboards, setUserLeaderboards] = React.useState<
    Array<UserLeaderboard>
  >([]);
  const [gameLeaderboards, setGameLeaderboards] = React.useState<
    Array<GameLeaderboard>
  >([]);

  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const fetchCommunityLeaderboards = React.useCallback(async () => {
    if (isLoading.current) return;

    setError(null);
    isLoading.current = true;

    try {
      const [userLeaderboards, gameLeaderboards] = await Promise.all([
        getUserCommentQualityRatingsLeaderboards(),
        getGameCommentQualityRatingsLeaderboards(),
      ]);
      setUserLeaderboards(userLeaderboards);
      setGameLeaderboards(gameLeaderboards);
    } catch (error) {
      console.error(
        `Unable to load the community leaderboards from the api:`,
        error
      );
      setError(error);
    }

    isLoading.current = false;
  }, []);

  const communityLeaderboardsState = React.useMemo(
    () => ({
      gameLeaderboards,
      userLeaderboards,
      error,
      fetchCommunityLeaderboards,
    }),
    [gameLeaderboards, userLeaderboards, error, fetchCommunityLeaderboards]
  );

  return (
    <CommunityLeaderboardsContext.Provider value={communityLeaderboardsState}>
      {children}
    </CommunityLeaderboardsContext.Provider>
  );
};
