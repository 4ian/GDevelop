// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { getPlayerToken } from '../Utils/GDevelopServices/Play';

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

/**
 * Hook allowing to duplicate lobby configuration from another project, useful after
 * opening a project from an example.
 */
export const useAuthenticatedPlayer = (): UseAuthenticatedPlayerOutput => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const playerTokensForPreview = React.useRef<PlayerTokensDict>({});

  const getAuthenticatedPlayerForPreview = React.useCallback(
    async (currentProject: ?gdProject) => {
      if (!profile || !currentProject) return null;
      const gameId = currentProject.getProjectUuid();

      // todo add preference param here to disable this feature.
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
      if (!isMultiplayerOrPlayerAuthenticationExtensionUsed) return;

      let playerTokenForPreview = playerTokensForPreview.current[gameId];

      if (!playerTokenForPreview) {
        const newPlayerTokenForGame = await getPlayerToken({
          getAuthorizationHeader,
          userId: profile.id,
          gameId,
        });
        playerTokensForPreview.current[gameId] = newPlayerTokenForGame;
        playerTokenForPreview = newPlayerTokenForGame;
      }

      return {
        playerId: profile.id,
        playerUsername: profile.username || 'Player',
        playerToken: playerTokenForPreview,
      };
    },
    [profile, getAuthorizationHeader]
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
