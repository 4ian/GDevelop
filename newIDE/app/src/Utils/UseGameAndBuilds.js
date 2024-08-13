// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { getBuilds, type Build } from '../Utils/GDevelopServices/Build';
import { type GameAvailabilityError } from '../GameDashboard/GameRegistration';
import { getGame, type Game } from '../Utils/GDevelopServices/Game';
import { extractGDevelopApiErrorStatusAndCode } from './GDevelopServices/Errors';

export type GameAndBuilds = {|
  game: ?Game,
  setGame: Game => void,
  refreshGame: () => Promise<void>,
  gameAvailabilityError: ?GameAvailabilityError,

  builds: ?Array<Build>,
  refreshBuilds: () => Promise<void>,
|};

type Props = {|
  project: ?gdProject,
|};

export const useGameAndBuilds = ({ project }: Props): GameAndBuilds => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const { showAlert } = useAlertDialog();

  const [game, setGame] = React.useState<?Game>(null);
  const [
    gameAvailabilityError,
    setGameAvailabilityError,
  ] = React.useState<?GameAvailabilityError>(null);

  const refreshGame = React.useCallback(
    async () => {
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

  const gameAndBuilds: GameAndBuilds = React.useMemo(
    () => ({
      game,
      setGame,
      refreshGame,
      gameAvailabilityError,

      builds,
      refreshBuilds,
    }),
    [game, setGame, refreshGame, gameAvailabilityError, refreshBuilds, builds]
  );

  return gameAndBuilds;
};
