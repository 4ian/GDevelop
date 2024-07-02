// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { getPlayerToken } from '../Utils/GDevelopServices/Play';
import PreferencesContext from './Preferences/PreferencesContext';
import { retryIfFailed } from '../Utils/RetryIfFailed';

const gd: libGDevelop = global.gd;

type PlayerTokensDict = { [gameId: string]: string };

type UseAuthenticatedPlayerOutput = {|
  getAuthenticatedPlayerForPreview: (
    currentProject: ?gdProject
  ) => Promise<?{|
    playerId: string,
    playerUsername: string,
    playerToken: string,
  |}>,
|};

export const useAuthenticatedPlayer = (): UseAuthenticatedPlayerOutput => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const { values: preferencesValues } = React.useContext(PreferencesContext);
  const playerTokensForPreview = React.useRef<PlayerTokensDict>({});

  const getAuthenticatedPlayerForPreview = React.useCallback(
    async (currentProject: ?gdProject) => {
      if (
        !profile ||
        !currentProject ||
        !preferencesValues.fetchPlayerTokenForPreviewAutomatically
      ) {
        return null;
      }

      const gameId = currentProject.getProjectUuid();

      const playerTokenForPreview = playerTokensForPreview.current[gameId];
      if (playerTokenForPreview) {
        // If we already have a token, let's use it.
        return {
          playerId: profile.id,
          playerUsername: profile.username || 'Player',
          playerToken: playerTokenForPreview,
        };
      }

      const isMultiplayerOrPlayerAuthenticationExtensionUsed = gd.UsedExtensionsFinder.scanProject(
        currentProject
      )
        .getUsedExtensions()
        .toNewVectorString()
        .toJSArray()
        .some(
          extensionName =>
            extensionName === 'Multiplayer' ||
            extensionName === 'PlayerAuthentication'
        );
      if (!isMultiplayerOrPlayerAuthenticationExtensionUsed) return null;

      try {
        const authPlayer = await retryIfFailed({ times: 2 }, async () => {
          const newPlayerTokenForGame = await getPlayerToken({
            getAuthorizationHeader,
            userId: profile.id,
            gameId,
          });
          playerTokensForPreview.current[gameId] = newPlayerTokenForGame;

          return {
            playerId: profile.id,
            playerUsername: profile.username || 'Player',
            playerToken: newPlayerTokenForGame,
          };
        });

        return authPlayer;
      } catch (error) {
        console.error('Error while fetching player token for preview:', error);

        return null;
      }
    },
    [
      profile,
      getAuthorizationHeader,
      preferencesValues.fetchPlayerTokenForPreviewAutomatically,
    ]
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
