// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import CreateProfile from '../Profile/CreateProfile';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AlertMessage from '../UI/AlertMessage';
import { showErrorBox } from '../UI/Messages/MessageBox';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import {
  type Game,
  getGame,
  registerGame,
} from '../Utils/GDevelopServices/Game';

export type GameRegistrationProps = {|
  project: ?gdProject,
  suggestGameStatsEmail?: boolean,
  hideLoader?: boolean,
  onGameRegistered?: () => void | Promise<void>,
|};

type UnavailableReason = 'unauthorized' | 'not-existing' | null;

export const GameRegistration = ({
  project,
  suggestGameStatsEmail,
  hideLoader,
  onGameRegistered,
}: GameRegistrationProps) => {
  const {
    authenticated,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    getAuthorizationHeader,
    profile,
    onAcceptGameStatsEmail,
  } = React.useContext(AuthenticatedUserContext);
  const [error, setError] = React.useState<Error | null>(null);
  const [
    unavailableReason,
    setUnavailableReason,
  ] = React.useState<UnavailableReason>(null);
  const [game, setGame] = React.useState<Game | null>(null);
  const [registrationInProgress, setRegistrationInProgress] = React.useState(
    false
  );
  const [
    acceptGameStatsEmailInProgress,
    setAcceptGameStatsEmailInProgress,
  ] = React.useState(false);

  const loadGame = React.useCallback(
    async () => {
      if (!profile || !project) return;

      const { id } = profile;
      setError(null);
      try {
        const game = await getGame(
          getAuthorizationHeader,
          id,
          project.getProjectUuid()
        );
        setUnavailableReason(null);
        setGame(game);
      } catch (err) {
        console.error(err);
        if (err.response) {
          if (err.response.status === 403) {
            setUnavailableReason('unauthorized');
            return;
          } else if (err.response.status === 404) {
            setUnavailableReason('not-existing');
            return;
          }
        }

        setError(err);
      }
    },
    [project, getAuthorizationHeader, profile]
  );

  const onRegisterGame = React.useCallback(
    async () => {
      if (!profile || !project) return;

      const { id } = profile;
      setRegistrationInProgress(true);
      try {
        await registerGame(getAuthorizationHeader, id, {
          gameId: project.getProjectUuid(),
          authorName: project.getAuthor() || 'Unspecified publisher',
          gameName: project.getName() || 'Untitled game',
          templateSlug: project.getTemplateSlug(),
        });
        loadGame();
        if (onGameRegistered) onGameRegistered();
      } catch (error) {
        console.error('Unable to register the game', error);
        showErrorBox({
          rawError: error,
          errorId: 'register-game-error',
          // TODO: i18n
          message:
            'Unable to register the game.' +
            ' ' +
            'Verify your internet connection or try again later.',
        });
      }
      setRegistrationInProgress(false);
    },
    [getAuthorizationHeader, profile, project, loadGame, onGameRegistered]
  );

  const _onAcceptGameStatsEmail = React.useCallback(
    async () => {
      if (!profile || !project) return;

      setAcceptGameStatsEmailInProgress(true);
      try {
        await onAcceptGameStatsEmail();
      } catch (error) {
        console.error('Unable to accept game stats email.', error);
        showErrorBox({
          rawError: error,
          errorId: 'game-stats-email-error',
          message:
            'Unable to accept game stats email. ' +
            ' ' +
            'Verify your internet connection or try again later.',
        });
      }
      setAcceptGameStatsEmailInProgress(false);
    },
    [profile, project, onAcceptGameStatsEmail]
  );

  React.useEffect(
    () => {
      if (!game) {
        loadGame();
      }
    },
    [loadGame, game]
  );

  if (!project) {
    return null;
  }

  if (!authenticated || !profile) {
    return (
      <CreateProfile
        onOpenLoginDialog={onOpenLoginDialog}
        onOpenCreateAccountDialog={onOpenCreateAccountDialog}
      />
    );
  }

  if (unavailableReason === 'not-existing') {
    return (
      <AlertMessage
        kind="info"
        renderRightButton={() => (
          <RaisedButton
            label={<Trans>Register the project</Trans>}
            disabled={registrationInProgress}
            primary
            onClick={onRegisterGame}
          />
        )}
      >
        <Trans>
          The project currently opened is not registered online. Register it now
          to get access to leaderboards, player accounts, analytics and more!
        </Trans>
      </AlertMessage>
    );
  }

  if (unavailableReason === 'unauthorized') {
    return (
      <AlertMessage kind="error">
        <Trans>
          The project currently opened is registered online but you don't have
          access to it. Ask the original owner of the game to share it with you
          to be able to manage it.
        </Trans>
      </AlertMessage>
    );
  }

  if (error) {
    return (
      <PlaceholderError
        onRetry={() => {
          loadGame();
        }}
      >
        <Trans>Can't check if the game is registered online.</Trans>{' '}
        <Trans>Verify your internet connection or try again later.</Trans>
      </PlaceholderError>
    );
  }

  if (!game && !hideLoader) {
    return <PlaceholderLoader />;
  }

  if (game && suggestGameStatsEmail && !profile.getGameStatsEmail) {
    return (
      <AlertMessage
        kind="info"
        renderRightButton={() => (
          <RaisedButton
            label={<Trans>Get game stats</Trans>}
            disabled={acceptGameStatsEmailInProgress}
            primary
            onClick={_onAcceptGameStatsEmail}
          />
        )}
      >
        <Trans>Receive weekly stats about your game by email!</Trans>
      </AlertMessage>
    );
  }

  return null; // Hide the component if the game is registered.
};
