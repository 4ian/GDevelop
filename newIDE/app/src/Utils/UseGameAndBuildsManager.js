// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { safeGetProjectUuid } from './SafeProjectAccess';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { getBuilds, type Build } from './GDevelopServices/Build';
import { type GameAvailabilityError } from '../GameDashboard/GameRegistration';
import {
  getAclsFromUserIds,
  getGame,
  registerGame,
  setGameUserAcls,
  type Game,
  type SavedStatus,
} from './GDevelopServices/Game';
import { extractGDevelopApiErrorStatusAndCode } from './GDevelopServices/Errors';
import { useMultiplayerLobbyConfigurator } from '../MainFrame/UseMultiplayerLobbyConfigurator';
import {
  findLeaderboardsToReplaceInProject,
  replaceLeaderboardsInProject,
} from '../Leaderboard/UseLeaderboardReplacer';
import { useProjectsListFor } from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';

export const getDefaultRegisterGameProperties = ({
  projectId,
  projectName,
  projectAuthor,
  savedStatus,
}: {|
  projectId: string,
  projectName: ?string,
  projectAuthor: ?string,
  savedStatus: SavedStatus,
|}): {
  authorName: string,
  gameId: string,
  gameName: string,
  savedStatus: SavedStatus,
} => ({
  gameId: projectId,
  authorName: projectAuthor || 'Unspecified publisher',
  gameName: projectName || 'Untitled game',
  savedStatus,
});

export type GameManager = {|
  game: ?Game,
  setGame: Game => void,
  refreshGame: () => Promise<void>,
  gameAvailabilityError: ?GameAvailabilityError,
  registerGameIfNeeded: () => Promise<void>,
|};

export type GameAndBuildsManager = {|
  ...GameManager,
  gameBuilds: ?Array<Build>,
  refreshGameBuilds: () => Promise<void>,
|};

type Props = {|
  project: ?gdProject,
  copyLeaderboardsAndMultiplayerLobbiesFromGameId?: string,
  onGameRegistered?: () => Promise<void>,
|};

export const useGameManager = ({
  project,
  copyLeaderboardsAndMultiplayerLobbiesFromGameId,
  onGameRegistered,
}: Props): GameManager => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const {
    configureMultiplayerLobbiesIfNeeded,
  } = useMultiplayerLobbyConfigurator();

  const [game, setGame] = React.useState<?Game>(null);
  const projectId = safeGetProjectUuid(project);
  const projectFiles = useProjectsListFor(projectId);
  const [
    gameAvailabilityError,
    setGameAvailabilityError,
  ] = React.useState<?GameAvailabilityError>(null);

  const refreshGame = React.useCallback(
    async (): Promise<void> => {
      const gameId = safeGetProjectUuid(project);
      if (!profile || !gameId) return;

      const { id } = profile;
      try {
        setGameAvailabilityError(null);
        const game = await getGame(
          getAuthorizationHeader,
          id,
          gameId
        );
        setGame(game);
      } catch (error) {
        console.error('Unable to load the game', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
          setGameAvailabilityError('not-found');
          return;
        }
        if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
          setGameAvailabilityError('not-owned');
          return;
        }
        setGameAvailabilityError('unexpected');
      }
    },
    [project, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      // Load game only once.
      if (!game) {
        refreshGame();
      }
    },
    [refreshGame, game]
  );

  const tryUpdateAuthors = React.useCallback(
    async () => {
      const gameId = safeGetProjectUuid(project);
      if (!profile || !gameId) return;

      const authorAcls = getAclsFromUserIds(project.getAuthorIds().toJSArray());

      try {
        await setGameUserAcls(
          getAuthorizationHeader,
          profile.id,
          gameId,
          { author: authorAcls }
        );
      } catch (e) {
        // Best effort call, do not prevent exporting the game.
        console.error('Error while updating game authors:', e);
      }
    },
    [profile, project, getAuthorizationHeader]
  );

  const registerGameIfNeeded = React.useCallback(
    async () => {
      const { profile, getAuthorizationHeader } = authenticatedUser;
      const gameId = safeGetProjectUuid(project);
      if (!gameId || !profile) {
        return;
      }
      const userId = profile.id;
      try {
        // Try to fetch the game to see if it's registered but do not do anything with it.
        await getGame(getAuthorizationHeader, userId, gameId);
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
          const hasProjectFiles = projectFiles.length > 0;
          // If the game is not registered, register it before launching the export.
          await registerGame(
            getAuthorizationHeader,
            userId,
            // $FlowFixMe[incompatible-type]
            getDefaultRegisterGameProperties({
              projectId: gameId,
              projectName: project.getName(),
              projectAuthor: project.getAuthor(),
              savedStatus: hasProjectFiles ? 'saved' : 'draft',
            })
          );

          // We don't await for the authors update, as it is not required for publishing.
          tryUpdateAuthors();
          if (onGameRegistered) await onGameRegistered();

          if (copyLeaderboardsAndMultiplayerLobbiesFromGameId) {
            const leaderboardsToReplace = findLeaderboardsToReplaceInProject({
              project,
            });
            await Promise.all([
              configureMultiplayerLobbiesIfNeeded(
                project,
                copyLeaderboardsAndMultiplayerLobbiesFromGameId
              ),
              replaceLeaderboardsInProject({
                project,
                leaderboardsToReplace,
                sourceGameId: copyLeaderboardsAndMultiplayerLobbiesFromGameId,
                authenticatedUser,
                setProgress: () => {},
              }),
            ]).catch(error => {
              // Ignore the error for now, as it's not critical.
              console.error(
                'Error while copying leaderboards or setting up multiplayer lobbies:',
                error
              );
            });
          }

          refreshGame();
        }
      }
    },
    [
      project,
      tryUpdateAuthors,
      copyLeaderboardsAndMultiplayerLobbiesFromGameId,
      refreshGame,
      configureMultiplayerLobbiesIfNeeded,
      authenticatedUser,
      onGameRegistered,
      projectFiles,
    ]
  );

  const gameManager: GameManager = React.useMemo(
    () => ({
      game,
      setGame,
      refreshGame,
      gameAvailabilityError,
      registerGameIfNeeded,
    }),
    [game, setGame, refreshGame, gameAvailabilityError, registerGameIfNeeded]
  );

  return gameManager;
};

export const useGameAndBuildsManager = ({
  project,
  copyLeaderboardsAndMultiplayerLobbiesFromGameId,
  onGameRegistered,
}: Props): GameAndBuildsManager => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const { showAlert } = useAlertDialog();

  const gameManager = useGameManager({
    project,
    copyLeaderboardsAndMultiplayerLobbiesFromGameId,
    onGameRegistered,
  });

  const { game } = gameManager;

  const [gameBuilds, setGameBuilds] = React.useState<?Array<Build>>(null);
  const refreshGameBuilds = React.useCallback(
    async () => {
      if (!profile || !game) return;

      try {
        const gameBuilds = await getBuilds(
          getAuthorizationHeader,
          profile.id,
          game.id
        );
        setGameBuilds(gameBuilds);
      } catch (error) {
        console.error('Error while loading builds:', error);
        showAlert({
          title: t`Error while loading builds`,
          message: t`An error occurred while loading your builds. Verify your internet connection and try again.`,
        });
      }
    },
    [profile, getAuthorizationHeader, showAlert, game]
  );

  React.useEffect(
    () => {
      refreshGameBuilds();
    },
    [refreshGameBuilds]
  );

  const gameAndBuildsManager: GameAndBuildsManager = React.useMemo(
    () => ({
      ...gameManager,
      gameBuilds,
      refreshGameBuilds,
    }),
    [gameManager, refreshGameBuilds, gameBuilds]
  );

  return gameAndBuildsManager;
};
