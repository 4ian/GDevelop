// @flow

import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { ColumnStackLayout } from '../UI/Layout';
import {
  getLobbyConfiguration,
  updateLobbyConfiguration,
  type LobbyConfiguration,
} from '../Utils/GDevelopServices/Play';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';
import { Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import LeftLoader from '../UI/LeftLoader';
import InfoBar from '../UI/Messages/InfoBar';
import PlaceholderError from '../UI/PlaceholderError';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import InlineCheckbox from '../UI/InlineCheckbox';

const defaultMaximumNumberOfPlayers = 4;
const minimumValueForMaximumNumberOfPlayers = 2;
const maximumValueForMaximumNumberOfPlayers = 8;

type Props = {|
  gameId: string,
|};

const MultiplayerAdmin = ({ gameId }: Props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [fetchingError, setFetchingError] = React.useState<React.Node>(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [maxPlayersValue, setMaxPlayersValue] = React.useState<number>(2);
  const [minPlayersValue, setMinPlayersValue] = React.useState<number>(1);
  const [canJoinAfterStart, setCanJoinAfterStart] = React.useState<boolean>(
    false
  );
  const { getAuthorizationHeader, profile, limits } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    lobbyConfiguration,
    setLobbyConfiguration,
  ] = React.useState<?LobbyConfiguration>(null);
  const [infoBarMessage, setInfoBarMessage] = React.useState<React.Node>(null);
  const userId = profile ? profile.id : null;
  const maximumNumberOfPlayersAllowed = limits
    ? limits.capabilities.multiplayer.maxPlayersPerLobby
    : defaultMaximumNumberOfPlayers;

  React.useEffect(
    () => {
      if (lobbyConfiguration) {
        setMaxPlayersValue(lobbyConfiguration.maxPlayers);
        setMinPlayersValue(lobbyConfiguration.minPlayers);
        setCanJoinAfterStart(lobbyConfiguration.canJoinAfterStart);
        return;
      }

      if (limits) {
        setMaxPlayersValue(limits.capabilities.multiplayer.maxPlayersPerLobby);
        return;
      }
    },
    [lobbyConfiguration, limits]
  );

  const maxPlayersSelectOptions = React.useMemo(
    () => {
      const options = new Array(maximumNumberOfPlayersAllowed - 1)
        .fill(0)
        .map((_, index) => (
          <SelectOption
            key={index}
            value={index + 2}
            label={(index + 2).toString()}
            shouldNotTranslate
          />
        ));
      if (
        maximumNumberOfPlayersAllowed < maximumValueForMaximumNumberOfPlayers
      ) {
        options.push(
          <SelectOption
            key="more"
            value={maximumNumberOfPlayersAllowed + 1}
            label={t`${(
              maximumNumberOfPlayersAllowed + 1
            ).toString()}+ (Available with a subscription)`}
            disabled
          />
        );
      }
      return options;
    },
    [maximumNumberOfPlayersAllowed]
  );

  const minPlayersSelectOptions = React.useMemo(
    () => {
      const options = new Array(maxPlayersValue)
        .fill(0)
        .map((_, index) => (
          <SelectOption
            key={index}
            value={index + 1}
            label={(index + 1).toString()}
            shouldNotTranslate
          />
        ));
      return options;
    },
    [maxPlayersValue]
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
            minPlayers: minPlayersValue,
            canJoinAfterStart,
          }
        );
        setLobbyConfiguration(updatedLobbyConfiguration);
        setInfoBarMessage(<Trans>Game configuration has been saved</Trans>);
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
    [
      getAuthorizationHeader,
      gameId,
      userId,
      maxPlayersValue,
      minPlayersValue,
      canJoinAfterStart,
    ]
  );

  const hasUnsavedModifications =
    lobbyConfiguration &&
    (lobbyConfiguration.maxPlayers !== maxPlayersValue ||
      lobbyConfiguration.minPlayers !== minPlayersValue ||
      lobbyConfiguration.canJoinAfterStart !== canJoinAfterStart);
  const canSave = hasUnsavedModifications;

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
        <Text size="block-title">
          <Trans>Lobby configuration</Trans>
        </Text>
        <Line noMargin>
          <SelectField
            value={minPlayersValue}
            onChange={(e, i, newValueAsString) => {
              const newValue = parseInt(newValueAsString, 10);
              if (Number.isNaN(newValue)) return;
              setMinPlayersValue(newValue);
            }}
            fullWidth
            floatingLabelText={
              <Trans>Minimum number of players to start the lobby</Trans>
            }
          >
            {minPlayersSelectOptions}
          </SelectField>
        </Line>
        <Line noMargin>
          <SelectField
            value={maxPlayersValue}
            onChange={(e, i, newValueAsString) => {
              const newValue = parseInt(newValueAsString, 10);
              if (Number.isNaN(newValue)) return;
              const newRealValue = Math.min(
                maximumNumberOfPlayersAllowed,
                Math.max(minimumValueForMaximumNumberOfPlayers, newValue)
              );
              setMaxPlayersValue(newRealValue);
              if (newRealValue < minPlayersValue) {
                setMinPlayersValue(newRealValue);
              }
            }}
            fullWidth
            floatingLabelText={
              <Trans>Maximum number of players per lobby</Trans>
            }
          >
            {maxPlayersSelectOptions}
          </SelectField>
        </Line>
        <Line noMargin>
          <InlineCheckbox
            label={
              <Trans>Allow players to join after the game has started</Trans>
            }
            checked={canJoinAfterStart}
            onCheck={(e, checked) => {
              setCanJoinAfterStart(checked);
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
