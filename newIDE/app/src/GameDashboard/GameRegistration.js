// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import CreateProfile from '../Profile/CreateProfile';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AlertMessage from '../UI/AlertMessage';
import { Line, Spacer } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import { showErrorBox } from '../UI/Messages/MessageBox';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import {
  type Game,
  getGame,
  registerGame,
} from '../Utils/GDevelopServices/Game';
import TimelineIcon from '@material-ui/icons/Timeline';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import { GameDetailsDialog } from './GameDetailsDialog';

type Props = {|
  project: ?gdProject,
  hideIfRegistered?: boolean,
  hideLoader?: boolean,
  onGameRegistered?: () => void,
|};

export const GameRegistration = ({
  project,
  hideIfRegistered,
  hideLoader,
  onGameRegistered,
}: Props) => {
  const {
    authenticated,
    onLogin,
    onCreateAccount,
    getAuthorizationHeader,
    profile,
  } = React.useContext(AuthenticatedUserContext);
  const [error, setError] = React.useState<Error | null>(null);
  const [unavailableReason, setUnavailableReason] = React.useState<
    'unauthorized' | 'not-existing' | null
  >(null);
  const [game, setGame] = React.useState<Game | null>(null);
  const [registrationInProgress, setRegistrationInProgress] = React.useState(
    false
  );
  const [detailsOpened, setDetailsOpened] = React.useState(false);
  const [detailsInitialTab, setDetailsInitialTab] = React.useState<
    'details' | 'analytics' | 'monetization'
  >('details');

  const loadGame = React.useCallback(
    async () => {
      if (!profile || !project) return;

      const { id } = profile;
      setError(null);
      setUnavailableReason(null);
      try {
        const game = await getGame(
          getAuthorizationHeader,
          id,
          project.getProjectUuid()
        );
        setGame(game);
      } catch (err) {
        console.log(err);
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
          authorName: project.getAuthor() || 'Unspecified author',
          gameName: project.getName() || 'Untitled game',
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
            'Unable to register the game. ' +
            ' ' +
            'Verify your internet connection or try again later.',
        });
      }
      setRegistrationInProgress(false);
    },
    [getAuthorizationHeader, profile, project, loadGame, onGameRegistered]
  );

  React.useEffect(
    () => {
      loadGame();
    },
    [loadGame]
  );

  if (!authenticated) {
    return (
      <CreateProfile onLogin={onLogin} onCreateAccount={onCreateAccount} />
    );
  } else if (!project) {
    return null;
  } else if (game) {
    if (hideIfRegistered) return null;

    return (
      <ColumnStackLayout noMargin>
        <Text>
          <Trans>
            Your project is registered online. This allows you to get access to
            metrics collected anonymously, like the number of daily players and
            retention of the players after a few days.
          </Trans>
        </Text>
        <Line justifyContent="center">
          <RaisedButton
            primary
            icon={<TimelineIcon />}
            label={<Trans>Analytics</Trans>}
            onClick={() => {
              setDetailsInitialTab('analytics');
              setDetailsOpened(true);
            }}
          />
          <Spacer />
          <RaisedButton
            primary
            icon={<MonetizationOnIcon />}
            label={<Trans>Monetization</Trans>}
            onClick={() => {
              setDetailsInitialTab('monetization');
              setDetailsOpened(true);
            }}
          />
        </Line>
        {detailsOpened && (
          <GameDetailsDialog
            game={game}
            project={project}
            initialTab={detailsInitialTab}
            onClose={() => {
              setDetailsOpened(false);
            }}
            onGameUpdated={updatedGame => {
              setGame(updatedGame);
            }}
            onGameDeleted={() => {
              setDetailsOpened(false);
              loadGame();
            }}
          />
        )}
      </ColumnStackLayout>
    );
  } else if (unavailableReason === 'unauthorized') {
    return (
      <AlertMessage kind="error">
        <Trans>
          This project is registered online but you don't have access to it. Ask
          the original owner of the game to share it with you to get access to
          the game metrics.
        </Trans>
      </AlertMessage>
    );
  } else if (unavailableReason === 'not-existing') {
    return (
      <AlertMessage
        kind="info"
        renderRightButton={() => (
          <RaisedButton
            label={<Trans>Register the project</Trans>}
            disabled={registrationInProgress}
            primary
            onClick={() => {
              onRegisterGame();
            }}
          />
        )}
      >
        <Trans>
          This project is not registered online. Register it now to get access
          to metrics collected anonymously, like the number of daily players and
          retention of the players after a few days.
        </Trans>
      </AlertMessage>
    );
  } else if (error) {
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

  return hideLoader ? null : <PlaceholderLoader />;
};
