// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import CreateProfile from '../Profile/CreateProfile';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AlertMessage from '../UI/AlertMessage';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import {
  type Game,
  getGame,
  registerGame,
  updateGame,
} from '../Utils/GDevelopServices/Game';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import Toggle from '../UI/Toggle';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { ColumnStackLayout } from '../UI/Layout';
import MarketingPlansDialog from '../MarketingPlans/MarketingPlansDialog';

export type GameRegistrationProps = {|
  project: ?gdProject,
  suggestAdditionalActions?: boolean,
  hideLoader?: boolean,
  hideLogin?: boolean,
  onGameRegistered?: () => void | Promise<void>,
|};

export type GameAvailabilityError = 'not-found' | 'not-owned' | 'unexpected';

export const GameRegistration = ({
  project,
  suggestAdditionalActions,
  hideLoader,
  onGameRegistered,
}: GameRegistrationProps) => {
  const {
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    getAuthorizationHeader,
    profile,
    onAcceptGameStatsEmail,
  } = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();
  const [error, setError] = React.useState<Error | null>(null);
  const [
    gameAvailabilityError,
    setGameAvailabilityError,
  ] = React.useState<?GameAvailabilityError>(null);
  const [game, setGame] = React.useState<Game | null>(null);
  const [registrationInProgress, setRegistrationInProgress] = React.useState(
    false
  );
  const [
    toggleGameStatsEmailInProgress,
    setToggleGameStatsEmailInProgress,
  ] = React.useState(false);
  const [
    toggleGameCommentsInProgress,
    setToggleGameCommentsInProgress,
  ] = React.useState(false);
  const [
    marketingPlansDialogOpen,
    setMarketingPlansDialogOpen,
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
        setGameAvailabilityError(null);
        setGame(game);
      } catch (error) {
        console.error(
          `Unable to get the game ${project.getProjectUuid()}`,
          error
        );
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode) {
          if (extractedStatusAndCode.status === 403) {
            setGameAvailabilityError('not-owned');
            return;
          } else if (extractedStatusAndCode.status === 404) {
            setGameAvailabilityError('not-found');
            return;
          }
          setGameAvailabilityError('unexpected');
        }

        setError(error);
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
        showAlert({
          title: t`Unable to register the game`,
          message: t`Verify your internet connection or try again later.`,
        });
      }
      setRegistrationInProgress(false);
    },
    [
      getAuthorizationHeader,
      profile,
      project,
      loadGame,
      onGameRegistered,
      showAlert,
    ]
  );

  const onToggleGameStatsEmail = React.useCallback(
    async (value: boolean) => {
      if (!profile || !game) return;

      setToggleGameStatsEmailInProgress(true);
      try {
        await onAcceptGameStatsEmail(value);
      } catch (error) {
        console.error('Unable to change your email preferences.', error);
        showAlert({
          title: t`Unable to change your email preferences`,
          message: t`Verify your internet connection or try again later.`,
        });
      }
      setToggleGameStatsEmailInProgress(false);
    },
    [profile, game, onAcceptGameStatsEmail, showAlert]
  );

  const onToggleGameComments = React.useCallback(
    async (value: boolean) => {
      if (!profile || !game) return;

      setToggleGameCommentsInProgress(true);
      try {
        const newGame = await updateGame(
          getAuthorizationHeader,
          profile.id,
          game.id,
          {
            acceptsGameComments: value,
          }
        );
        setGame(newGame);
      } catch (error) {
        console.error('Unable to change feedback for this game.', error);
        showAlert({
          title: t`Unable to change feedback for this game`,
          message: t`Verify your internet connection or try again later.`,
        });
      }
      setToggleGameCommentsInProgress(false);
    },
    [profile, game, getAuthorizationHeader, showAlert]
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

  if (!profile) {
    return (
      <CreateProfile
        onOpenLoginDialog={onOpenLoginDialog}
        onOpenCreateAccountDialog={onOpenCreateAccountDialog}
      />
    );
  }

  if (gameAvailabilityError === 'not-found') {
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

  if (gameAvailabilityError === 'not-owned') {
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

  if (game && suggestAdditionalActions) {
    return (
      <>
        <ColumnStackLayout noMargin expand>
          <Column noMargin>
            <Text size="block-title">
              <Trans>Taking your game further</Trans>
            </Text>
            <Column>
              <Toggle
                onToggle={() =>
                  onToggleGameStatsEmail(!profile.getGameStatsEmail)
                }
                toggled={profile.getGameStatsEmail}
                labelPosition="right"
                label={
                  <Trans>Receive weekly stats about your game by email</Trans>
                }
                disabled={toggleGameStatsEmailInProgress}
              />
              <Toggle
                onToggle={() => onToggleGameComments(!game.acceptsGameComments)}
                toggled={!!game.acceptsGameComments}
                labelPosition="right"
                label={<Trans>Open game for player feedback</Trans>}
                disabled={toggleGameCommentsInProgress}
              />
            </Column>
          </Column>
          <Column>
            <Text size="sub-title">
              <Trans>Promoting your game to the community</Trans>
            </Text>
            <Text noMargin>
              <Trans>
                Get ready-made packs to make your game visible to the GDevelop
                community.
              </Trans>
            </Text>
            <Line>
              <RaisedButton
                label={<Trans>See marketing packs</Trans>}
                primary
                onClick={() => setMarketingPlansDialogOpen(true)}
              />
            </Line>
          </Column>
        </ColumnStackLayout>
        {marketingPlansDialogOpen && (
          <MarketingPlansDialog
            game={game}
            onClose={() => setMarketingPlansDialogOpen(false)}
          />
        )}
      </>
    );
  }

  return null; // Hide the component if the game is registered.
};
