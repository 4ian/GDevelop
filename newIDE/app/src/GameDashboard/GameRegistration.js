// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import CreateProfile from '../Profile/CreateProfile';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AlertMessage from '../UI/AlertMessage';
import { Line } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import { showErrorBox } from '../UI/Messages/MessageBox';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import {
  type Game,
  getGame,
  registerGame,
} from '../Utils/GDevelopServices/Game';
import { type Profile } from '../Utils/GDevelopServices/Authentication';
import TimelineIcon from '@material-ui/icons/Timeline';
import { GameDetailsDialog } from './GameDetailsDialog';

type Props = {|
  project: ?gdProject,
  hideIfRegistered?: boolean,
  hideIfSubscribed?: boolean,
  hideLoader?: boolean,
  onGameRegistered?: () => void | Promise<void>,
|};

type DetailsTab = 'details' | 'analytics';
type UnavailableReason = 'unauthorized' | 'not-existing' | null;

export const GameRegistration = ({
  project,
  hideIfRegistered,
  hideIfSubscribed,
  hideLoader,
  onGameRegistered,
}: Props) => {
  const {
    authenticated,
    onLogin,
    onCreateAccount,
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
  const [detailsOpened, setDetailsOpened] = React.useState(false);
  const [detailsInitialTab, setDetailsInitialTab] = React.useState<DetailsTab>(
    'details'
  );

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

  return (
    <GameRegistrationWidget
      authenticated={authenticated}
      profile={profile}
      onLogin={onLogin}
      onCreateAccount={onCreateAccount}
      project={project}
      game={game}
      setGame={setGame}
      loadGame={loadGame}
      onRegisterGame={onRegisterGame}
      registrationInProgress={registrationInProgress}
      hideIfRegistered={hideIfRegistered}
      hideIfSubscribed={hideIfSubscribed}
      unavailableReason={unavailableReason}
      acceptGameStatsEmailInProgress={acceptGameStatsEmailInProgress}
      onAcceptGameStatsEmail={_onAcceptGameStatsEmail}
      detailsInitialTab={detailsInitialTab}
      setDetailsInitialTab={setDetailsInitialTab}
      detailsOpened={detailsOpened}
      setDetailsOpened={setDetailsOpened}
      error={error}
      hideLoader={hideLoader}
    />
  );
};

export type GameRegistrationWidgetProps = {|
  authenticated: boolean,
  profile?: ?Profile,
  onLogin: () => void,
  onCreateAccount: () => void,
  project?: ?gdProject,
  game: ?Game,
  setGame: Game => void,
  loadGame: () => Promise<void>,
  onRegisterGame: () => Promise<void>,
  registrationInProgress: boolean,
  hideIfRegistered?: boolean,
  hideIfSubscribed?: boolean,
  unavailableReason: ?UnavailableReason,
  acceptGameStatsEmailInProgress: boolean,
  onAcceptGameStatsEmail: () => Promise<void>,
  detailsInitialTab: DetailsTab,
  setDetailsInitialTab: (string: DetailsTab) => void,
  detailsOpened: boolean,
  setDetailsOpened: boolean => void,
  error: ?Error,
  hideLoader?: boolean,
|};

export const GameRegistrationWidget = ({
  authenticated,
  profile,
  onLogin,
  onCreateAccount,
  project,
  game,
  setGame,
  loadGame,
  onRegisterGame,
  registrationInProgress,
  hideIfRegistered,
  hideIfSubscribed,
  unavailableReason,
  acceptGameStatsEmailInProgress,
  onAcceptGameStatsEmail,
  detailsInitialTab,
  setDetailsInitialTab,
  detailsOpened,
  setDetailsOpened,
  error,
  hideLoader,
}: GameRegistrationWidgetProps) => {
  if (!project) {
    return null;
  }

  if (!authenticated || !profile) {
    return (
      <CreateProfile onLogin={onLogin} onCreateAccount={onCreateAccount} />
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
          This project is not registered online. Register it now to get access
          to metrics collected anonymously, like the number of daily players and
          retention of the players after a few days.
        </Trans>
      </AlertMessage>
    );
  }

  if (unavailableReason === 'unauthorized') {
    return (
      <AlertMessage kind="error">
        <Trans>
          This project is registered online but you don't have access to it. Ask
          the original owner of the game to share it with you to get access to
          the game metrics.
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

  if (game) {
    if (hideIfRegistered) return null;
    if (!profile.getGameStatsEmail) {
      return (
        <AlertMessage
          kind="info"
          renderRightButton={() => (
            <RaisedButton
              label={<Trans>Get game stats</Trans>}
              disabled={acceptGameStatsEmailInProgress}
              primary
              onClick={onAcceptGameStatsEmail}
            />
          )}
        >
          <Trans>Get stats about your game every week!</Trans>
        </AlertMessage>
      );
    }
    if (hideIfSubscribed) return null;
    return (
      <ColumnStackLayout noMargin>
        <Line justifyContent="center">
          <RaisedButton
            icon={<TimelineIcon />}
            label={<Trans>Analytics</Trans>}
            onClick={() => {
              setDetailsInitialTab('analytics');
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
  }

  return hideLoader ? null : <PlaceholderLoader />;
};
