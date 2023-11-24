// @flow

import * as React from 'react';
import { getGames, type Game } from '../Utils/GDevelopServices/Game';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

const useGamesList = () => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    authenticated,
    firebaseUser,
    getAuthorizationHeader,
  } = authenticatedUser;

  const [games, setGames] = React.useState<?Array<Game>>(null);
  const [gamesFetchingError, setGamesFetchingError] = React.useState<?Error>(
    null
  );

  const fetchGames = React.useCallback(
    async () => {
      if (!authenticated || !firebaseUser) return;

      try {
        setGamesFetchingError(null);
        const games = await getGames(getAuthorizationHeader, firebaseUser.uid);
        setGames(games);
      } catch (error) {
        console.error('Error while loading user games.', error);
        setGamesFetchingError(error);
      }
    },
    [authenticated, firebaseUser, getAuthorizationHeader]
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

  return {
    games,
    gamesFetchingError,
    fetchGames,
    onGameUpdated,
  };
};

export default useGamesList;
