// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import CreateProfile from '../Profile/CreateProfile';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AlertMessage from '../UI/AlertMessage';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import { updateGame } from '../Utils/GDevelopServices/Game';
import Text from '../UI/Text';
import { Column, Line } from '../UI/Grid';
import Toggle from '../UI/Toggle';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { ColumnStackLayout } from '../UI/Layout';
import MarketingPlansDialog from '../MarketingPlans/MarketingPlansDialog';
import { useGameManager } from '../Utils/UseGameAndBuildsManager';
import RightLoader from '../UI/RightLoader';

const styles = {
  buttonContainer: {
    flexShrink: 0, // To avoid the button content to be on multiple lines.
  },
};

export type GameRegistrationProps = {|
  project: ?gdProject,
  suggestAdditionalActions?: boolean,
  hideLoader?: boolean,
  onGameRegistered?: () => void | Promise<void>,
  customRegistrationMessage?: React.Node,
  icon?: React.Node,
|};

export type GameAvailabilityError = 'not-found' | 'not-owned' | 'unexpected';

export const GameRegistration = ({
  project,
  suggestAdditionalActions,
  hideLoader,
  onGameRegistered,
  customRegistrationMessage,
}: GameRegistrationProps) => {
  const {
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    getAuthorizationHeader,
    profile,
    onAcceptGameStatsEmail,
  } = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();
  const {
    game,
    setGame,
    gameAvailabilityError,
    refreshGame,
    registerGameIfNeeded,
  } = useGameManager({
    project,
  });
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

  const onRegisterGame = React.useCallback(
    async () => {
      setRegistrationInProgress(true);
      try {
        await registerGameIfNeeded();
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
    [registerGameIfNeeded, onGameRegistered, showAlert]
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
    [profile, game, setGame, getAuthorizationHeader, showAlert]
  );

  if (!project) {
    return null;
  }

  if (!profile) {
    return (
      <CreateProfile
        onOpenLoginDialog={onOpenLoginDialog}
        onOpenCreateAccountDialog={onOpenCreateAccountDialog}
        message={customRegistrationMessage}
      />
    );
  }

  if (gameAvailabilityError === 'not-found') {
    return (
      <AlertMessage
        kind="info"
        renderRightButton={() => (
          <div style={styles.buttonContainer}>
            <RaisedButton
              label={<Trans>Register the project</Trans>}
              disabled={registrationInProgress}
              primary
              onClick={onRegisterGame}
            />
          </div>
        )}
      >
        {customRegistrationMessage || (
          <Trans>
            The project currently opened is not registered online. Register it
            now to get access to leaderboards, player accounts, analytics and
            more!
          </Trans>
        )}
      </AlertMessage>
    );
  } else if (gameAvailabilityError === 'not-owned') {
    return (
      <AlertMessage kind="error">
        <Trans>
          This game is registered online but you don't have access to it. Ask
          the owner of the game to add your account to the list of owners to be
          able to manage it.
        </Trans>
      </AlertMessage>
    );
  } else if (gameAvailabilityError === 'unexpected') {
    return (
      <PlaceholderError onRetry={refreshGame}>
        <Trans>Can't check if the game is registered online.</Trans>{' '}
        <Trans>Verify your internet connection or try again later.</Trans>
      </PlaceholderError>
    );
  }

  if (suggestAdditionalActions) {
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
                onToggle={() =>
                  onToggleGameComments(!(game && game.acceptsGameComments))
                }
                toggled={!!(game && game.acceptsGameComments)}
                labelPosition="right"
                label={<Trans>Open game for player feedback</Trans>}
                disabled={!game || toggleGameCommentsInProgress}
              />
            </Column>
          </Column>
          <Column noMargin>
            <Text size="sub-title">
              <Trans>Promoting your game to the community</Trans>
            </Text>
            <Text noMargin>
              <Trans>
                Make your game visible to the GDevelop community and to the
                world with Marketing Boosts.
              </Trans>
            </Text>
            <Line>
              <RightLoader isLoading={!game}>
                <RaisedButton
                  label={<Trans>See Marketing Boosts</Trans>}
                  primary
                  onClick={() => setMarketingPlansDialogOpen(true)}
                  disabled={!game}
                />
              </RightLoader>
            </Line>
          </Column>
        </ColumnStackLayout>
        {marketingPlansDialogOpen && game && (
          <MarketingPlansDialog
            game={game}
            onClose={() => setMarketingPlansDialogOpen(false)}
          />
        )}
      </>
    );
  }

  if (!game && !hideLoader) {
    return <PlaceholderLoader />;
  }

  return null; // Hide the component if the game is registered.
};
