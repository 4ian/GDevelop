// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { duplicateLobbyConfiguration } from '../Utils/GDevelopServices/Play';
import { registerGame } from '../Utils/GDevelopServices/Game';

const gd: libGDevelop = global.gd;

type UseMultiplayerLobbyConfiguratorOutput = {|
  configureMultiplayerLobbiesIfNeeded: (
    project: gdProject,
    sourceGameId: string
  ) => Promise<void>,
|};

/**
 * Hook allowing to duplicate lobby configuration from another project, useful after
 * opening a project from an example.
 */
export const useMultiplayerLobbyConfigurator = (): UseMultiplayerLobbyConfiguratorOutput => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const configureMultiplayerLobbiesIfNeeded = React.useCallback(
    async (project: gdProject, sourceGameId: string) => {
      const isMultiplayerExtensionUsed = gd.UsedExtensionsFinder.scanProject(
        project
      )
        .getUsedExtensions()
        .toNewVectorString()
        .toJSArray()
        .some(extensionName => extensionName === 'Multiplayer');
      if (!isMultiplayerExtensionUsed) return;

      if (!profile) {
        console.warn(
          'User is not connected. Aborting multiplayer lobby configuration.'
        );
        return;
      }

      try {
        // Register game. The error will silently be caught if the game already exists.
        try {
          await registerGame(getAuthorizationHeader, profile.id, {
            gameId: project.getProjectUuid(),
            authorName: project.getAuthor() || 'Unspecified publisher',
            gameName: project.getName() || 'Untitled game',
            templateSlug: project.getTemplateSlug(),
          });
        } catch (error) {
          console.error(
            'Could not register game before lobby configuration: ',
            error
          );
        }
        await duplicateLobbyConfiguration({
          userId: profile.id,
          getAuthorizationHeader,
          gameId: project.getProjectUuid(),
          sourceGameId,
        });
      } catch (error) {
        console.error(
          `An error occurred while copying lobby configuration from game with id ${sourceGameId}. Failing silently: `,
          error
        );
      }
    },
    [getAuthorizationHeader, profile]
  );
  return {
    configureMultiplayerLobbiesIfNeeded,
  };
};
