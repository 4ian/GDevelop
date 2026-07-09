// @flow

import * as React from 'react';
import {
  getGames,
  updateGame,
  type Game,
} from '../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

export type GamesList = {|
  games: ?Array<Game>,
  gamesFetchingError: ?Error,
  fetchGames: () => Promise<void>,
  onGameUpdated: (updatedGame: Game) => void,
  markGameAsSavedIfRelevant: (gameId: string) => Promise<void>,
|};

const useGamesList = (): GamesList => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const gamesFetchingPromise = React.useRef<?Promise<any>>(null);
  const {
    authenticated,
    firebaseUser,
    getAuthorizationHeader,
    loginState,
  } = authenticatedUser;

  const [games, setGames] = React.useState<?Array<Game>>(null);
  const [gamesFetchingError, setGamesFetchingError] = React.useState<?Error>(
    null
  );

  const fetchGames = React.useCallback(
    async (): Promise<void> => {
      if (loginState !== 'done') return;

      if (!authenticated || !firebaseUser) {
        // Forget any fetch that could still be running for a previously
        // authenticated user, so that its result is discarded when received.
        gamesFetchingPromise.current = null;
        setGames([]);
        return;
      }
      if (gamesFetchingPromise.current) return gamesFetchingPromise.current;

      const fetchPromise = getGames(getAuthorizationHeader, firebaseUser.uid);
      try {
        setGamesFetchingError(null);
        gamesFetchingPromise.current = fetchPromise;
        const fetchedGames = await fetchPromise;
        if (gamesFetchingPromise.current !== fetchPromise) {
          // The user logged out while the games were being fetched:
          // discard the result.
          return;
        }
        setGames(fetchedGames);
      } catch (error) {
        if (gamesFetchingPromise.current !== fetchPromise) return;
        console.error('Error while loading user games.', error);
        setGamesFetchingError(error);
      } finally {
        if (gamesFetchingPromise.current === fetchPromise) {
          gamesFetchingPromise.current = null;
        }
      }
    },
    [authenticated, firebaseUser, getAuthorizationHeader, loginState]
  );

  const onGameUpdated = React.useCallback(
    (updatedGame: Game) => {
      if (!games) return;
      setGames(
        games.map(game => (game.id === updatedGame.id ? updatedGame : game))
      );
    },
    [games]
  );

  const markGameAsSavedIfRelevant = React.useCallback(
    async (gameId: string) => {
      if (!games || !firebaseUser) return;
      const currentOpenedGame = games && games.find(game => game.id === gameId);

      if (!currentOpenedGame || currentOpenedGame.savedStatus !== 'draft')
        return;

      try {
        const updatedGame = await updateGame(
          getAuthorizationHeader,
          firebaseUser.uid,
          currentOpenedGame.id,
          {
            savedStatus: 'saved',
          }
        );
        onGameUpdated(updatedGame);
      } catch (error) {
        // Catch error, we'll try again later.
        console.error('Error while marking game as saved:', error);
      }
    },
    [games, onGameUpdated, firebaseUser, getAuthorizationHeader]
  );

  return {
    games,
    gamesFetchingError,
    fetchGames,
    onGameUpdated,
    markGameAsSavedIfRelevant,
  };
};

export default useGamesList;
