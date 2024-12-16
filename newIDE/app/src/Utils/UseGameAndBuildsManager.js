// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
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
|}) => ({
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
  builds: ?Array<Build>,
  refreshBuilds: () => Promise<void>,
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
  const [
    gameAvailabilityError,
    setGameAvailabilityError,
  ] = React.useState<?GameAvailabilityError>(null);

  const refreshGame = React.useCallback(
    async (): Promise<void> => {
      if (!profile || !project) return;

      const { id } = profile;
      try {
        setGameAvailabilityError(null);
        const game = await getGame(
          getAuthorizationHeader,
          id,
          project.getProjectUuid()
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
      if (!profile || !project) return;

      const authorAcls = getAclsFromUserIds(project.getAuthorIds().toJSArray());

      try {
        await setGameUserAcls(
          getAuthorizationHeader,
          profile.id,
          project.getProjectUuid(),
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
      if (!project || !profile) {
        return;
      }

      const gameId = project.getProjectUuid();
      const userId = profile.id;
      try {
        // Try to fetch the game to see if it's registered but do not do anything with it.
        await getGame(getAuthorizationHeader, userId, gameId);
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
          // If the game is not registered, register it before launching the export.
          await registerGame(
            getAuthorizationHeader,
            userId,
            getDefaultRegisterGameProperties({
              projectId: gameId,
              projectName: project.getName(),
              projectAuthor: project.getAuthor(),
              // Assume a project going through the export process is not saved yet.
              // It will be marked as saved when the user saves it next anyway.
              savedStatus: 'draft',
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

  const [builds, setBuilds] = React.useState<?Array<Build>>(null);
  const refreshBuilds = React.useCallback(
    async () => {
      if (!profile) return;

      try {
        const userBuilds = await getBuilds(getAuthorizationHeader, profile.id);
        setBuilds(userBuilds);
      } catch (error) {
        console.error('Error while loading builds:', error);
        showAlert({
          title: t`Error while loading builds`,
          message: t`An error occurred while loading your builds. Verify your internet connection and try again.`,
        });
      }
    },
    [profile, getAuthorizationHeader, showAlert]
  );

  React.useEffect(
    () => {
      refreshBuilds();
    },
    [refreshBuilds]
  );

  const gameAndBuildsManager: GameAndBuildsManager = React.useMemo(
    () => ({
      ...gameManager,
      builds,
      refreshBuilds,
    }),
    [gameManager, refreshBuilds, builds]
  );

  return gameAndBuildsManager;
};
