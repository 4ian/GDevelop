// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { getPlayerToken } from '../Utils/GDevelopServices/Play';
import PreferencesContext from './Preferences/PreferencesContext';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { type GamesList } from '../GameDashboard/UseGamesList';

type PlayerTokensDict = { [gameId: string]: string };

type AuthenticatedPlayer = {|
  playerId: string,
  playerUsername: string,
  playerToken: string,
|};

type UseAuthenticatedPlayerOutput = {|
  getAuthenticatedPlayerForPreview: (
    project: ?gdProject
  ) => Promise<?AuthenticatedPlayer>,
|};

type Props = {|
  project: ?gdProject,
  gamesList: GamesList,
|};

export const useAuthenticatedPlayer = ({
  project,
  gamesList,
}: Props): UseAuthenticatedPlayerOutput => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const { values: preferencesValues } = React.useContext(PreferencesContext);
  const playerTokensForPreview = React.useRef<PlayerTokensDict>({});
  const tokenFetchingPromise = React.useRef<?Promise<any>>(null);
  const gameId = project ? project.getProjectUuid() : null;
  // We find the game in the list of games the user owns, as a token cannot be
  // generated if it does not exist.
  // (This can happen if the game is registered too late, or cannot be registered)
  // We assume a playerToken is useful only on a game that the user owns.
  const game = React.useMemo(
    () => {
      return gamesList.games && gameId
        ? gamesList.games.find(game => game.id === gameId)
        : null;
    },
    [gamesList.games, gameId]
  );

  const getAuthenticatedPlayerForPreview = React.useCallback(
    async (): Promise<?AuthenticatedPlayer> => {
      if (
        !profile ||
        !game ||
        !preferencesValues.fetchPlayerTokenForPreviewAutomatically
      ) {
        return null;
      }

      const playerTokenForPreview = playerTokensForPreview.current[game.id];
      if (playerTokenForPreview) {
        // If we already have a token, no need to fetch it again.
        return {
          playerId: profile.id,
          playerUsername: profile.username || 'Player',
          playerToken: playerTokenForPreview,
        };
      }

      if (tokenFetchingPromise.current) {
        return tokenFetchingPromise.current;
      }

      const fetchPlayerToken = async (): Promise<?AuthenticatedPlayer> => {
        try {
          await retryIfFailed({ times: 2 }, async () => {
            const newPlayerTokenForGame = await getPlayerToken({
              getAuthorizationHeader,
              userId: profile.id,
              gameId: game.id,
            });
            playerTokensForPreview.current[game.id] = newPlayerTokenForGame;

            return {
              playerId: profile.id,
              playerUsername: profile.username || 'Player',
              playerToken: newPlayerTokenForGame,
            };
          });
        } catch (error) {
          console.error(
            'Error while fetching player token for preview:',
            error
          );

          return null;
        } finally {
          tokenFetchingPromise.current = null;
        }
      };

      tokenFetchingPromise.current = fetchPlayerToken();

      return tokenFetchingPromise.current;
    },
    [
      game,
      profile,
      getAuthorizationHeader,
      preferencesValues.fetchPlayerTokenForPreviewAutomatically,
    ]
  );

  // When player is logged in with an opened project, we should fetch the token.
  React.useEffect(
    () => {
      getAuthenticatedPlayerForPreview();
    },
    [getAuthenticatedPlayerForPreview]
  );

  // When player logs out, we should clear the tokens.
  React.useEffect(
    () => {
      if (!profile) {
        playerTokensForPreview.current = {};
      }
    },
    [profile]
  );

  return {
    getAuthenticatedPlayerForPreview,
  };
};
