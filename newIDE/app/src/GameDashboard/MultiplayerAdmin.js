// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { ColumnStackLayout } from '../UI/Layout';
import {
  getLobbyConfiguration,
  updateLobbyConfiguration,
  type LobbyConfiguration,
} from '../Utils/GDevelopServices/Play';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import TextField from '../UI/TextField';
import Text from '../UI/Text';
import { Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import LeftLoader from '../UI/LeftLoader';
import InfoBar from '../UI/Messages/InfoBar';
import PlaceholderError from '../UI/PlaceholderError';
import AlertMessage from '../UI/AlertMessage';
import Link from '../UI/Link';
import { getHelpLink } from '../Utils/HelpLink';
import Window from '../Utils/Window';

const maximumNumberOfPlayers = 8;
const minimumNumberOfPlayers = 2;

type Props = {|
  gameId: string,
|};

const MultiplayerAdmin = ({ gameId }: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [fetchingError, setFetchingError] = React.useState<React.Node>(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [maxPlayersValue, setMaxPlayersValue] = React.useState<number | ''>(2);
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    lobbyConfiguration,
    setLobbyConfiguration,
  ] = React.useState<?LobbyConfiguration>(null);
  const [infoBarMessage, setInfoBarMessage] = React.useState<React.Node>(null);
  const userId = profile ? profile.id : null;

  React.useEffect(
    () => {
      if (!lobbyConfiguration) return;
      setMaxPlayersValue(lobbyConfiguration.maxPlayers);
    },
    [lobbyConfiguration]
  );

  const fetchGameConfiguration = React.useCallback(
    async () => {
      if (!userId) {
        setLobbyConfiguration(null);
        return;
      }
      setIsLoading(true);
      setFetchingError(null);
      try {
        const configuration = await getLobbyConfiguration(
          getAuthorizationHeader,
          userId,
          { gameId }
        );
        setLobbyConfiguration(configuration);
      } catch (error) {
        setFetchingError(
          <Trans>
            An error happened when retrieving the game's configuration. Please
            check your internet connection or try again later.
          </Trans>
        );
        console.error(
          'An error occurred while fetching lobby configuration: ',
          error
        );
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, userId, getAuthorizationHeader]
  );

  React.useEffect(
    () => {
      fetchGameConfiguration();
    },
    // The game configuration is fetched every time fetchGameConfiguration changes
    // so it should be only at component mounting.
    [fetchGameConfiguration]
  );

  const onSaveLobbyConfiguration = React.useCallback(
    async () => {
      if (!userId || !maxPlayersValue) return;
      try {
        setIsSaving(true);
        const updatedLobbyConfiguration = await updateLobbyConfiguration(
          getAuthorizationHeader,
          userId,
          {
            gameId,
            maxPlayers: maxPlayersValue,
          }
        );
        setLobbyConfiguration(updatedLobbyConfiguration);
        setInfoBarMessage(<Trans>✅ Game configuration has been saved</Trans>);
      } catch (error) {
        console.error(
          'An error occurred while updating lobby configuration: ',
          error
        );
        setInfoBarMessage(
          <Trans>
            ❌ Game configuration could not be saved, please try again later.
          </Trans>
        );
      } finally {
        setIsSaving(false);
      }
    },
    [getAuthorizationHeader, gameId, userId, maxPlayersValue]
  );

  const hasUnsavedModifications =
    lobbyConfiguration && lobbyConfiguration.maxPlayers !== maxPlayersValue;
  const canSave = hasUnsavedModifications && maxPlayersValue !== '';

  const helpLink = getHelpLink('/all-features/multiplayer/');
  if (isLoading) return <PlaceholderLoader />;
  if (fetchingError) {
    return (
      <PlaceholderError onRetry={fetchGameConfiguration}>
        {fetchingError}
      </PlaceholderError>
    );
  }
  return (
    <>
      <ColumnStackLayout noMargin expand>
        <AlertMessage kind="info">
          <Trans>Learn more about Multiplayer configuration</Trans>{' '}
          <Link
            href={helpLink}
            onClick={() => Window.openExternalURL(helpLink)}
          >
            <Trans>in the Wiki</Trans>
          </Link>
          .
        </AlertMessage>
        <Text size="block-title">
          <Trans>Lobby configuration</Trans>
        </Text>
        <Line noMargin>
          <TextField
            type="number"
            min={minimumNumberOfPlayers}
            max={maximumNumberOfPlayers}
            fullWidth
            floatingLabelText={
              <Trans>Maximum number of players per lobby</Trans>
            }
            value={maxPlayersValue}
            onChange={(e, newValueAsString) => {
              if (newValueAsString === '') setMaxPlayersValue('');
              const newValue = parseInt(newValueAsString, 10);
              if (Number.isNaN(newValue)) return;
              setMaxPlayersValue(
                Math.min(
                  maximumNumberOfPlayers,
                  Math.max(minimumNumberOfPlayers, newValue)
                )
              );
            }}
            onBlur={e => {
              const valueAsString = e.currentTarget.value;
              if (!valueAsString && lobbyConfiguration) {
                setMaxPlayersValue(lobbyConfiguration.maxPlayers);
              }
            }}
          />
        </Line>
        <Line noMargin justifyContent="flex-end">
          <LeftLoader isLoading={isSaving}>
            <RaisedButton
              disabled={isSaving || !canSave}
              label={<Trans>Save</Trans>}
              onClick={onSaveLobbyConfiguration}
              primary
            />
          </LeftLoader>
        </Line>
      </ColumnStackLayout>
      <InfoBar
        message={infoBarMessage}
        visible={!!infoBarMessage}
        hide={() => setInfoBarMessage(null)}
      />
    </>
  );
};

export default MultiplayerAdmin;
