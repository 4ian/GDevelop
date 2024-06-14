// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { duplicateLobbyConfiguration } from '../Utils/GDevelopServices/Play';

const gd = global.gd;

type UseMultiplayerLobbyConfiguratorOutput = {
  configureMultiplayerLobbiesIfNeeded: (
    project: gdProject,
    sourceGameId: string
  ) => Promise<void>,
};

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
      if (!profile) {
        console.warn(
          'User is not connected. Aborting multiplayer lobby configuration.'
        );
        return;
      }

      const isMultiplayerExtensionUsed = gd.UsedExtensionsFinder.scanProject(
        project
      )
        .getUsedExtensions()
        .toNewVectorString()
        .toJSArray()
        .some(extensionName => extensionName === 'Multiplayer');
      if (!isMultiplayerExtensionUsed) return;

      try {
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
