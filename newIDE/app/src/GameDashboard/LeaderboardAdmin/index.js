// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

import Add from '../../UI/CustomSvgIcons/Add';
import TextFormat from '@material-ui/icons/TextFormat';
import Save from '../../UI/CustomSvgIcons/Floppy';
import Cross from '../../UI/CustomSvgIcons/Cross';
import Edit from '../../UI/CustomSvgIcons/Edit';
import EditFile from '../../UI/CustomSvgIcons/EditFile';
import Tag from '../../UI/CustomSvgIcons/Tag';
import AtSign from '../../UI/CustomSvgIcons/AtSign';
import Calendar from '../../UI/CustomSvgIcons/Calendar';
import Sort from '../../UI/CustomSvgIcons/Sort';
import Users from '../../UI/CustomSvgIcons/Users';
import Refresh from '../../UI/CustomSvgIcons/Refresh';
import Trash from '../../UI/CustomSvgIcons/Trash';
import Visibility from '../../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../../UI/CustomSvgIcons/VisibilityOff';
import Lock from '../../UI/CustomSvgIcons/Lock';
import LockOpen from '../../UI/CustomSvgIcons/LockOpen';
import Copy from '../../UI/CustomSvgIcons/Copy';

import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import PlaceholderError from '../../UI/PlaceholderError';
import AlertMessage from '../../UI/AlertMessage';
import RaisedButton from '../../UI/RaisedButton';
import TextField, { type TextFieldInterface } from '../../UI/TextField';
import SelectField from '../../UI/SelectField';
import CircularProgress from '../../UI/CircularProgress';
import SelectOption from '../../UI/SelectOption';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import {
  type Leaderboard,
  type LeaderboardCustomizationSettings,
  type LeaderboardUpdatePayload,
  type LeaderboardEntry,
  shortenUuidForDisplay,
} from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import LeaderboardProvider from '../../Leaderboard/LeaderboardProvider';
import LeaderboardEntriesTable from './LeaderboardEntriesTable';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import { shouldValidate } from '../../UI/KeyboardShortcuts/InteractionKeys';
import Text from '../../UI/Text';
import { GameRegistration } from '../GameRegistration';
import LeaderboardAppearanceDialog from './LeaderboardAppearanceDialog';
import FlatButton from '../../UI/FlatButton';
import LeaderboardSortOptionsDialog from './LeaderboardSortOptionsDialog';
import { type LeaderboardSortOption } from '../../Utils/GDevelopServices/Play';
import { formatScore } from '../../Leaderboard/LeaderboardScoreFormatter';
import Toggle from '../../UI/Toggle';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { SubscriptionSuggestionContext } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import MaxLeaderboardCountAlertMessage from './MaxLeaderboardCountAlertMessage';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import Paper from '../../UI/Paper';
import SwitchHorizontal from '../../UI/CustomSvgIcons/SwitchHorizontal';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';

type Props = {|
  onLoading: boolean => void,
  project?: gdProject,
  leaderboardIdToSelectAtOpening?: string,
|};

type ContainerProps = {| ...Props, gameId: string |};

type ApiError = {|
  action:
    | 'entriesFetching'
    | 'entryDeletion'
    | 'leaderboardsFetching'
    | 'leaderboardNameUpdate'
    | 'leaderboardSortUpdate'
    | 'leaderboardVisibilityUpdate'
    | 'leaderboardAutoPlayerNamePrefixUpdate'
    | 'leaderboardIgnoreCustomPlayerNamesUpdate'
    | 'leaderboardPrimaryUpdate'
    | 'leaderboardAppearanceUpdate'
    | 'leaderboardPlayerUnicityDisplayChoiceUpdate'
    | 'leaderboardCreation'
    | 'leaderboardReset'
    | 'leaderboardDeletion',
  message: React.Node,
  itemId?: string,
|};

const CenteredError = ({ children }: {| children: React.Node |}) => (
  <Column expand justifyContent="center" alignItems="center">
    <Line>{children}</Line>
  </Column>
);

const styles = {
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingRight: 5,
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: 2,
  },
  leaderboardConfigurationPaper: { padding: 5, margin: 5 },
  leaderboardNameText: { ...textEllipsisStyle, width: 150 },
  leaderboardNameTextField: { width: 125, fontSize: 14 },
};

const getApiError = (payload: LeaderboardUpdatePayload): ApiError => ({
  action: payload.name
    ? 'leaderboardNameUpdate'
    : payload.sort
    ? 'leaderboardSortUpdate'
    : payload.visibility
    ? 'leaderboardVisibilityUpdate'
    : payload.ignoreCustomPlayerNames !== undefined
    ? 'leaderboardIgnoreCustomPlayerNamesUpdate'
    : payload.autoPlayerNamePrefix !== undefined
    ? 'leaderboardAutoPlayerNamePrefixUpdate'
    : payload.primary
    ? 'leaderboardPrimaryUpdate'
    : payload.customizationSettings
    ? 'leaderboardAppearanceUpdate'
    : 'leaderboardPlayerUnicityDisplayChoiceUpdate',
  message: payload.name ? (
    <Trans>
      An error occurred when updating the name of the leaderboard, please close
      the dialog, come back and try again.
    </Trans>
  ) : payload.sort ? (
    <Trans>
      An error occurred when updating the sort direction of the leaderboard,
      please close the dialog, come back and try again.
    </Trans>
  ) : payload.visibility ? (
    <Trans>
      An error occurred when updating the visibility of the leaderboard, please
      close the dialog, come back and try again.
    </Trans>
  ) : payload.ignoreCustomPlayerNames !== undefined ? (
    <Trans>
      An error occurred when updating the handling of player names of the
      leaderboard, please close the dialog, come back and try again.
    </Trans>
  ) : payload.autoPlayerNamePrefix !== undefined ? (
    <Trans>
      An error occurred when updating the handling of player names of the
      leaderboard, please close the dialog, come back and try again.
    </Trans>
  ) : payload.primary ? (
    <Trans>
      An error occurred when setting the leaderboard as default, please close
      the dialog, come back and try again.
    </Trans>
  ) : payload.customizationSettings ? (
    <Trans>
      An error occurred when updating the appearance of the leaderboard, please
      close the dialog, come back and try again.
    </Trans>
  ) : (
    <Trans>
      An error occurred when updating the display choice of the leaderboard,
      please close the dialog, come back and try again.
    </Trans>
  ),
});

const getSortOrderText = (currentLeaderboard: Leaderboard) => {
  if (currentLeaderboard.extremeAllowedScore !== undefined) {
    const formattedScore = currentLeaderboard.customizationSettings
      ? formatScore(
          currentLeaderboard.extremeAllowedScore,
          currentLeaderboard.customizationSettings.scoreFormatting
        )
      : currentLeaderboard.extremeAllowedScore;
    if (currentLeaderboard.sort === 'ASC') {
      return <Trans>Lower is better (min: {formattedScore})</Trans>;
    }
    return <Trans>Higher is better (max: {formattedScore})</Trans>;
  }

  if (currentLeaderboard.sort === 'ASC') {
    return <Trans>Lower is better</Trans>;
  }
  return <Trans>Higher is better</Trans>;
};

export const LeaderboardAdmin = ({
  onLoading,
  project,
  leaderboardIdToSelectAtOpening,
}: Props) => {
  const isOnline = useOnlineStatus();
  const { isMobile } = useResponsiveWindowSize();
  const [isEditingAppearance, setIsEditingAppearance] = React.useState<boolean>(
    false
  );
  const { showConfirmation, showDeleteConfirmation } = useAlertDialog();
  const [
    displayMaxLeaderboardCountReachedWarning,
    setDisplayMaxLeaderboardCountReachedWarning,
  ] = React.useState<boolean>(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { limits } = authenticatedUser;

  const [
    isEditingSortOptions,
    setIsEditingSortOptions,
  ] = React.useState<boolean>(false);
  const [isEditingName, setIsEditingName] = React.useState<boolean>(false);
  const [
    isEditingAutoPlayerNamePrefix,
    setIsEditingAutoPlayerNamePrefix,
  ] = React.useState<boolean>(false);
  const [isRequestPending, setIsRequestPending] = React.useState<boolean>(
    false
  );
  const [newName, setNewName] = React.useState<string>('');
  const [newNameError, setNewNameError] = React.useState<?string>(null);
  const [
    newAutoPlayerNamePrefix,
    setNewAutoPlayerNamePrefix,
  ] = React.useState<string>('');
  const newNameTextFieldRef = React.useRef<?TextFieldInterface>(null);
  const newAutoPlayerNamePrefixTextFieldRef = React.useRef<?TextFieldInterface>(
    null
  );
  const [apiError, setApiError] = React.useState<?ApiError>(null);
  const [
    displayGameRegistration,
    setDisplayGameRegistration,
  ] = React.useState<boolean>(false);

  const {
    leaderboards,
    listLeaderboards,
    currentLeaderboard,
    createLeaderboard,
    selectLeaderboard,
    updateLeaderboard,
    resetLeaderboard,
    deleteLeaderboard,
    deleteLeaderboardEntry,
    displayOnlyBestEntry,
    setDisplayOnlyBestEntry,
    fetchLeaderboardEntries,
    browsing: { entries, goToNextPage, goToPreviousPage, goToFirstPage },
  } = React.useContext(LeaderboardContext);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );

  const setIsLoading = React.useCallback(
    (yesOrNo: boolean) => {
      setIsRequestPending(yesOrNo);
      onLoading(yesOrNo);
    },
    [onLoading]
  );

  const onUpdateLeaderboard = async (
    i18n: I18nType,
    payload: LeaderboardUpdatePayload
  ) => {
    setNewNameError(null);
    if (payload.name !== undefined && payload.name.length === 0) {
      setNewNameError(
        i18n._(
          t`Please enter a name that is at least one character long and 50 at most.`
        )
      );
      return;
    }
    setIsLoading(true);
    setApiError(null);
    try {
      await updateLeaderboard(payload);
      if (payload.name) setIsEditingName(false);
      if (payload.autoPlayerNamePrefix !== undefined)
        setIsEditingAutoPlayerNamePrefix(false);
    } catch (err) {
      console.error('An error occurred when updating leaderboard', err);
      setApiError(getApiError(payload));
    } finally {
      setIsLoading(false);
    }
  };

  const onListLeaderboards = React.useCallback(
    () => {
      const fetchAndHandleError = async () => {
        setIsRequestPending(true); // We only set the local loading state here to avoid blocking the dialog buttons on first load.
        setApiError(null);
        try {
          await listLeaderboards();
        } catch (error) {
          const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
            error
          );
          if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
            setDisplayGameRegistration(true);
            return;
          }
          console.error('An error occurred when fetching leaderboards', error);
          setApiError({
            action: 'leaderboardsFetching',
            message: (
              <Trans>
                An error occurred when fetching the leaderboards, please close
                the dialog and reopen it.
              </Trans>
            ),
          });
        } finally {
          setIsRequestPending(false);
        }
      };
      fetchAndHandleError();
    },
    [listLeaderboards]
  );

  const onFetchLeaderboardEntries = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      await fetchLeaderboardEntries();
    } catch (err) {
      console.error('An error occurred when fetching leaderboard entries', err);
      setApiError({
        action: 'entriesFetching',
        message: (
          <Trans>
            An error occurred when fetching the entries of the leaderboard,
            please try again.
          </Trans>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateLeaderboard = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      if (limits && leaderboards) {
        const leaderboardLimits = limits.capabilities.leaderboards;
        if (
          leaderboardLimits &&
          leaderboardLimits.maximumCountPerGame > 0 &&
          leaderboards.length >= leaderboardLimits.maximumCountPerGame
        ) {
          setDisplayMaxLeaderboardCountReachedWarning(true);
          return;
        }
      }

      await createLeaderboard({
        name: 'New leaderboard',
        sort: 'ASC',
      });
    } catch (err) {
      console.error('An error occurred when creating leaderboard', err);
      setApiError({
        action: 'leaderboardCreation',
        message: (
          <Trans>
            An error occurred when creating a new leaderboard, please close the
            dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetLeaderboard = async (i18n: I18nType) => {
    if (!currentLeaderboard) return;
    const answer = await showConfirmation({
      title: t`Reset leaderboard ${currentLeaderboard.name}`,
      message: t`All current entries will be deleted, are you sure you want to reset this leaderboard? This can't be undone.`,
      confirmButtonLabel: t`Reset leaderboard`,
    });
    if (!answer) return;

    setIsLoading(true);
    setApiError(null);
    try {
      await resetLeaderboard();
    } catch (error) {
      console.error('An error occurred when resetting leaderboard', error);
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      setApiError({
        action: 'leaderboardReset',
        message:
          extractedStatusAndCode && extractedStatusAndCode.status === 409 ? (
            <Trans>
              This leaderboard is already resetting, please wait a bit, close
              the dialog, come back and try again.
            </Trans>
          ) : (
            <Trans>
              An error occurred when resetting the leaderboard, please close the
              dialog, come back and try again.
            </Trans>
          ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteLeaderboard = async (i18n: I18nType) => {
    if (!currentLeaderboard) return;
    // Extract word translation to ensure it is not wrongly translated in the sentence.
    const translatedConfirmText = i18n._(t`delete`);

    const deleteAnswer = await showDeleteConfirmation({
      title: t`Do you really want to permanently delete the leaderboard ${
        currentLeaderboard.name
      }?`,
      message: t`You’re about to permanently delete this leaderboard and all of its entries. This can't be undone.`,
      fieldMessage: t`To confirm, type "${translatedConfirmText}"`,
      confirmText: translatedConfirmText,
      confirmButtonLabel: t`Delete Leaderboard`,
    });
    if (!deleteAnswer) return;

    setIsLoading(true);
    setApiError(null);
    try {
      await deleteLeaderboard();
    } catch (err) {
      console.error('An error occurred when deleting leaderboard', err);
      setApiError({
        action: 'leaderboardDeletion',
        message: (
          <Trans>
            An error occurred when deleting the leaderboard, please close the
            dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteEntry = async (i18n: I18nType, entry: LeaderboardEntry) => {
    if (!currentLeaderboard) return;
    const answer = await showConfirmation({
      title: t`Delete score ${entry.score} from ${entry.playerName}`,
      message: t`Are you sure you want to delete this entry? This can't be undone.`,
      confirmButtonLabel: t`Delete Entry`,
    });
    if (!answer) return;

    setIsLoading(true);
    setApiError(null);
    try {
      await deleteLeaderboardEntry(entry.id);
    } catch (err) {
      console.error('An error occurred when deleting entry', err);
      setApiError({
        action: 'entryDeletion',
        message: (
          <Trans>
            An error occurred when deleting the entry, please try again.
          </Trans>
        ),
        itemId: entry.id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(
    () => {
      if (isEditingName && newNameTextFieldRef.current) {
        newNameTextFieldRef.current.focus();
      }
    },
    [isEditingName]
  );

  React.useEffect(
    () => {
      if (leaderboards === null) {
        onListLeaderboards();
      }
    },
    [leaderboards, onListLeaderboards]
  );

  React.useEffect(() => {
    if (currentLeaderboard) onFetchLeaderboardEntries();
    // This has to be executed on component mount to refresh entries on each admin opening
    // eslint-disable-next-line
  }, []);

  React.useEffect(
    () => {
      if (!!leaderboardIdToSelectAtOpening)
        selectLeaderboard(leaderboardIdToSelectAtOpening);
    },
    [leaderboardIdToSelectAtOpening, selectLeaderboard]
  );

  const onCopy = React.useCallback(
    () => {
      if (!currentLeaderboard) return;
      // TODO: use Clipboard.js, after it's been reworked to use this API and handle text.
      navigator.clipboard.writeText(currentLeaderboard.id);
    },
    [currentLeaderboard]
  );
  if (!isOnline) {
    return (
      <CenteredError>
        <PlaceholderError>
          <Trans>
            An internet connection is required to administrate your game's
            leaderboards.
          </Trans>
        </PlaceholderError>
      </CenteredError>
    );
  }
  if (!!displayGameRegistration) {
    return (
      <CenteredError>
        <GameRegistration
          project={project}
          onGameRegistered={() => {
            setDisplayGameRegistration(false);
            onListLeaderboards();
          }}
        />
      </CenteredError>
    );
  }
  if (apiError && apiError.action === 'leaderboardCreation') {
    return (
      <CenteredError>
        <AlertMessage kind="error">{apiError.message}</AlertMessage>
      </CenteredError>
    );
  }
  if (apiError && apiError.action === 'leaderboardsFetching') {
    return (
      <CenteredError>
        <PlaceholderError onRetry={onListLeaderboards}>
          {apiError.message}
        </PlaceholderError>
      </CenteredError>
    );
  }
  if (leaderboards === null) {
    if (isRequestPending) return <PlaceholderLoader />;

    return (
      <CenteredError>
        <PlaceholderError onRetry={onListLeaderboards}>
          <Trans>
            An error occurred when retrieving leaderboards, please try again
            later.
          </Trans>
        </PlaceholderError>
      </CenteredError>
    );
  }

  if (!!leaderboards && leaderboards.length === 0)
    return (
      <Line noMargin expand justifyContent="center" alignItems="center">
        <EmptyPlaceholder
          title={<Trans>Create your game's first leaderboard</Trans>}
          description={<Trans>Leaderboards help retain your players</Trans>}
          actionLabel={<Trans>Create a leaderboard</Trans>}
          onAction={() => {
            onCreateLeaderboard();
          }}
          actionButtonId="add-new-leaderboard-button"
          isLoading={isRequestPending}
        />
      </Line>
    );

  const getLeaderboardDescription = (
    i18n: I18nType,
    currentLeaderboard: Leaderboard
  ) => [
    {
      key: 'name',
      avatar: <Tag />,
      text: isEditingName ? (
        <Line alignItems="center" expand noMargin>
          <TextField
            id="edit-name-field"
            ref={newNameTextFieldRef}
            margin="none"
            style={styles.leaderboardNameTextField}
            maxLength={50}
            value={newName}
            errorText={newNameError}
            onChange={(e, text) => setNewName(text)}
            onKeyPress={event => {
              if (shouldValidate(event) && !isRequestPending) {
                onUpdateLeaderboard(i18n, { name: newName });
              }
            }}
            disabled={isRequestPending}
          />
          {!isRequestPending && (
            <>
              <Spacer />
              <IconButton
                tooltip={t`Cancel`}
                style={{ padding: 0 }}
                onClick={() => {
                  setIsEditingName(false);
                }}
              >
                <Cross />
              </IconButton>
            </>
          )}
        </Line>
      ) : (
        <Tooltip title={currentLeaderboard.name}>
          <Text size="body2" style={styles.leaderboardNameText}>
            {currentLeaderboard.name}
          </Text>
        </Tooltip>
      ),
      secondaryText:
        apiError && apiError.action === 'leaderboardNameUpdate' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={() => {
            if (isEditingName) {
              onUpdateLeaderboard(i18n, { name: newName });
            } else {
              setNewName(currentLeaderboard.name);
              setIsEditingName(true);
            }
          }}
          tooltip={isEditingName ? t`Save` : t`Rename`}
          disabled={isRequestPending}
          edge="end"
          id={isEditingName ? 'save-name-button' : 'edit-name-button'}
        >
          {isEditingName ? (
            isRequestPending ? (
              <CircularProgress size={20} />
            ) : (
              <Save />
            )
          ) : (
            <Edit />
          )}
        </IconButton>
      ),
    },
    {
      key: 'id',
      avatar: <AtSign />,
      text: (
        <Tooltip title={currentLeaderboard.id}>
          <Text size="body2">
            {shortenUuidForDisplay(currentLeaderboard.id)}
          </Text>
        </Tooltip>
      ),
      secondaryText: null,
      secondaryAction: (
        <IconButton onClick={onCopy} tooltip={t`Copy`} edge="end">
          <Copy />
        </IconButton>
      ),
    },
    {
      key: 'startDatetime',
      avatar: <Calendar />,
      text: currentLeaderboard.resetLaunchedAt ? (
        <Text size="body2">
          <Trans>
            Reset requested the{' '}
            {i18n.date(currentLeaderboard.resetLaunchedAt, {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
            . Please wait a few minutes...
          </Trans>
        </Text>
      ) : (
        <Tooltip
          title={i18n._(
            t`Date from which entries are taken into account: ${i18n.date(
              currentLeaderboard.startDatetime,
              {
                dateStyle: 'short',
                timeStyle: 'short',
              }
            )}`
          )}
        >
          <Text size="body2">
            {i18n.date(currentLeaderboard.startDatetime)}
          </Text>
        </Tooltip>
      ),
      secondaryText:
        apiError && apiError.action === 'leaderboardReset' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={() => onResetLeaderboard(i18n)}
          tooltip={t`Reset leaderboard`}
          edge="end"
          disabled={
            isRequestPending ||
            isEditingName ||
            !!currentLeaderboard.resetLaunchedAt
          }
        >
          <Refresh />
        </IconButton>
      ),
    },
    {
      key: 'sort',
      avatar: <Sort />,
      text: <Text size="body2">{getSortOrderText(currentLeaderboard)}</Text>,
      secondaryText:
        apiError && apiError.action === 'leaderboardSortUpdate' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={() => setIsEditingSortOptions(true)}
          tooltip={t`Edit`}
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <Edit />
        </IconButton>
      ),
    },
    {
      key: 'visibility',
      avatar:
        currentLeaderboard.visibility === 'HIDDEN' ? (
          <VisibilityOff />
        ) : (
          <Visibility />
        ),
      text: (
        <Tooltip
          title={i18n._(
            currentLeaderboard.visibility === 'HIDDEN'
              ? t`Anyone with the link can see it, but it is not listed in your game's leaderboards.`
              : t`Anyone can access it.`
          )}
        >
          <Text size="body2">
            {currentLeaderboard.visibility === 'HIDDEN' ? (
              <Trans>Not visible</Trans>
            ) : (
              <Trans>Public</Trans>
            )}
          </Text>
        </Tooltip>
      ),
      secondaryText:
        apiError && apiError.action === 'leaderboardVisibilityUpdate' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={async () => {
            await onUpdateLeaderboard(i18n, {
              visibility:
                currentLeaderboard.visibility === 'HIDDEN'
                  ? 'PUBLIC'
                  : 'HIDDEN',
            });
          }}
          tooltip={
            currentLeaderboard.visibility === 'HIDDEN'
              ? t`Make the leaderboard public`
              : t`Hide the leaderboard`
          }
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <SwitchHorizontal />
        </IconButton>
      ),
    },
    {
      key: 'ignoreCustomPlayerNames',
      avatar: currentLeaderboard.ignoreCustomPlayerNames ? (
        <Lock />
      ) : (
        <LockOpen />
      ),
      text: (
        <Tooltip
          title={i18n._(
            currentLeaderboard.ignoreCustomPlayerNames
              ? t`Even if the action is used to send a score with a custom player username, this name will be ignored by the leaderboard.`
              : t`The player name sent in the action to send a score will be used.`
          )}
        >
          <Text size="body2">
            {currentLeaderboard.ignoreCustomPlayerNames ? (
              <Trans>Ignore unauthenticated player usernames</Trans>
            ) : (
              <Trans>Allow unauthenticated player usernames</Trans>
            )}
          </Text>
        </Tooltip>
      ),
      secondaryText:
        apiError &&
        apiError.action === 'leaderboardIgnoreCustomPlayerNamesUpdate' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={async () => {
            await onUpdateLeaderboard(i18n, {
              ignoreCustomPlayerNames: !currentLeaderboard.ignoreCustomPlayerNames,
            });
          }}
          tooltip={
            currentLeaderboard.ignoreCustomPlayerNames
              ? t`Change to allow custom player usernames`
              : t`Change to ignore custom player usernames`
          }
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <SwitchHorizontal />
        </IconButton>
      ),
    },
    {
      key: 'autoPlayerNamePrefix',
      avatar: <Tag />,
      text: isEditingAutoPlayerNamePrefix ? (
        <Line alignItems="center" expand noMargin>
          <TextField
            id="edit-autoPlayerNamePrefix-field"
            ref={newAutoPlayerNamePrefixTextFieldRef}
            margin="none"
            style={styles.leaderboardNameTextField}
            maxLength={40}
            value={newAutoPlayerNamePrefix}
            onChange={(e, text) => setNewAutoPlayerNamePrefix(text)}
            onKeyPress={event => {
              if (shouldValidate(event) && !isRequestPending) {
                onUpdateLeaderboard(i18n, {
                  autoPlayerNamePrefix: newAutoPlayerNamePrefix,
                });
              }
            }}
            disabled={isRequestPending}
          />
          {!isRequestPending && (
            <>
              <Spacer />
              <IconButton
                tooltip={t`Cancel`}
                style={{ padding: 0 }}
                onClick={() => {
                  setIsEditingAutoPlayerNamePrefix(false);
                }}
              >
                <Cross />
              </IconButton>
            </>
          )}
        </Line>
      ) : (
        <Tooltip
          title={
            currentLeaderboard.autoPlayerNamePrefix ||
            i18n._('No custom prefix for auto-generated player names')
          }
        >
          <Text size="body2" style={styles.leaderboardNameText}>
            {currentLeaderboard.autoPlayerNamePrefix ||
              i18n._('No custom prefix for auto-generated player names')}
          </Text>
        </Tooltip>
      ),
      secondaryText:
        apiError &&
        apiError.action === 'leaderboardAutoPlayerNamePrefixUpdate' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={() => {
            if (isEditingAutoPlayerNamePrefix) {
              onUpdateLeaderboard(i18n, {
                autoPlayerNamePrefix: newAutoPlayerNamePrefix,
              });
            } else {
              setNewAutoPlayerNamePrefix(
                currentLeaderboard.autoPlayerNamePrefix || ''
              );
              setIsEditingAutoPlayerNamePrefix(true);
            }
          }}
          tooltip={
            isEditingAutoPlayerNamePrefix
              ? t`Save`
              : t`Change the default prefix for player names`
          }
          disabled={isRequestPending}
          edge="end"
          id={
            isEditingAutoPlayerNamePrefix
              ? 'save-autoPlayerNamePrefix-button'
              : 'edit-autoPlayerNamePrefix-button'
          }
        >
          {isEditingAutoPlayerNamePrefix ? (
            isRequestPending ? (
              <CircularProgress size={20} />
            ) : (
              <Save />
            )
          ) : (
            <Edit />
          )}
        </IconButton>
      ),
    },
    {
      key: 'appearance',
      avatar: <TextFormat />,
      text: (
        <Text size="body2">
          <Trans>Leaderboard appearance</Trans>
        </Text>
      ),
      secondaryText:
        apiError && apiError.action === 'leaderboardAppearanceUpdate' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={() => setIsEditingAppearance(true)}
          tooltip={t`Edit`}
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <EditFile />
        </IconButton>
      ),
    },
    {
      key: 'playerUnicityDisplayChoice',
      avatar: <Users />,
      text: (
        <SelectField
          fullWidth
          margin="none"
          value={currentLeaderboard.playerUnicityDisplayChoice}
          onChange={(e, i, value) => {
            onUpdateLeaderboard(i18n, {
              // $FlowFixMe
              playerUnicityDisplayChoice: value,
            });
          }}
          disabled={isRequestPending || isEditingName}
          inputStyle={{ fontSize: 14 }}
          helperMarkdownText={
            currentLeaderboard.playerUnicityDisplayChoice === 'FREE'
              ? i18n._(
                  t`Users can chose to see only players' best entries or not.`
                )
              : currentLeaderboard.playerUnicityDisplayChoice ===
                'PREFER_UNIQUE'
              ? i18n._(t`Only player's best entries are displayed.`)
              : i18n._(t`All entries are displayed.`)
          }
        >
          <SelectOption
            key={'free'}
            value={'FREE'}
            label={t`Let the user select`}
          />
          <SelectOption
            key={'prefer-unique'}
            value={'PREFER_UNIQUE'}
            label={t`Only best entry`}
          />
          <SelectOption
            key={'prefer-non-unique'}
            value={'PREFER_NON_UNIQUE'}
            label={t`All entries`}
          />
        </SelectField>
      ),
      secondaryText:
        apiError &&
        apiError.action === 'leaderboardPlayerUnicityDisplayChoiceUpdate' ? (
          <Text color="error" size="body2">
            {apiError.message}
          </Text>
        ) : null,
      secondaryAction: null,
    },
  ];

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Column noMargin expand>
            {displayMaxLeaderboardCountReachedWarning && limits && (
              <MaxLeaderboardCountAlertMessage
                onUpgrade={() =>
                  openSubscriptionDialog({
                    analyticsMetadata: {
                      reason: 'Leaderboard count per game limit reached',
                    },
                  })
                }
                onClose={() =>
                  setDisplayMaxLeaderboardCountReachedWarning(false)
                }
                limits={limits}
              />
            )}
            <ResponsiveLineStackLayout
              noMargin
              expand
              noColumnMargin
              id="leaderboard-administration-panel"
            >
              <div style={styles.leftColumn}>
                <Paper
                  elevation={3}
                  style={styles.leaderboardConfigurationPaper}
                  background="light"
                >
                  <Column>
                    <Line noMargin>
                      {currentLeaderboard && leaderboards ? (
                        <SelectField
                          fullWidth
                          floatingLabelText={<Trans>Leaderboard name</Trans>}
                          value={currentLeaderboard.id}
                          onChange={(e, i, leaderboardId) => {
                            selectLeaderboard(leaderboardId);
                          }}
                        >
                          {leaderboards.map(leaderboard => (
                            <SelectOption
                              key={leaderboard.id}
                              value={leaderboard.id}
                              label={
                                leaderboard.primary
                                  ? t`${leaderboard.name} (default)`
                                  : leaderboard.name
                              }
                              shouldNotTranslate={!leaderboard.primary}
                            />
                          ))}
                        </SelectField>
                      ) : null}
                      <IconButton
                        onClick={onCreateLeaderboard}
                        disabled={isEditingName || isRequestPending}
                      >
                        <Add />
                      </IconButton>
                    </Line>
                    {currentLeaderboard ? (
                      <>
                        <List>
                          {getLeaderboardDescription(
                            i18n,
                            currentLeaderboard
                          ).map((item, index) => (
                            <React.Fragment key={`fragment-${item.key}`}>
                              {index > 0 ? (
                                <Divider
                                  key={`divider-${item.key}`}
                                  component="li"
                                />
                              ) : null}
                              <ListItem key={item.key} disableGutters>
                                <ListItemAvatar>
                                  <Avatar>{item.avatar}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  disableTypography
                                  secondary={item.secondaryText}
                                >
                                  {item.text}
                                </ListItemText>
                                {item.secondaryAction ? (
                                  <ListItemSecondaryAction>
                                    {item.secondaryAction}
                                  </ListItemSecondaryAction>
                                ) : null}
                              </ListItem>
                            </React.Fragment>
                          ))}
                        </List>
                        <Line justifyContent="space-between">
                          <FlatButton
                            leftIcon={<Trash />}
                            label={<Trans>Delete</Trans>}
                            disabled={isRequestPending || isEditingName}
                            onClick={() => onDeleteLeaderboard(i18n)}
                          />
                          <RaisedButton
                            label={
                              currentLeaderboard.primary ? (
                                <Trans>Default</Trans>
                              ) : (
                                <Trans>Set as default</Trans>
                              )
                            }
                            disabled={
                              isRequestPending ||
                              isEditingName ||
                              currentLeaderboard.primary
                            }
                            onClick={() =>
                              onUpdateLeaderboard(i18n, { primary: true })
                            }
                          />
                        </Line>
                        {apiError &&
                        (apiError.action === 'leaderboardDeletion' ||
                          apiError.action === 'leaderboardPrimaryUpdate') ? (
                          <PlaceholderError>
                            {apiError.message}
                          </PlaceholderError>
                        ) : null}
                      </>
                    ) : null}
                  </Column>
                </Paper>
              </div>
              <div
                style={{
                  ...styles.rightColumn,
                  paddingLeft: isMobile ? 0 : 20,
                }}
              >
                <Line alignItems="center" justifyContent="flex-end">
                  <Toggle
                    labelPosition="left"
                    toggled={displayOnlyBestEntry}
                    onToggle={(e, newValue) =>
                      setDisplayOnlyBestEntry(newValue)
                    }
                    label={
                      <Tooltip
                        title={i18n._(
                          t`When checked, will only display the best score of each player (only for the display below).`
                        )}
                      >
                        <Text size="body2">
                          <Trans>Player best entry</Trans>
                        </Text>
                      </Tooltip>
                    }
                  />
                  <LargeSpacer />
                  <Divider orientation="vertical" />
                  <Spacer />
                  <IconButton
                    onClick={onFetchLeaderboardEntries}
                    disabled={isRequestPending || isEditingName}
                    tooltip={t`Refresh`}
                    size="small"
                  >
                    <Refresh />
                  </IconButton>
                  <Spacer />
                </Line>
                {apiError && apiError.action === 'entriesFetching' ? (
                  <CenteredError>
                    <PlaceholderError onRetry={onFetchLeaderboardEntries}>
                      {apiError.message}
                    </PlaceholderError>
                  </CenteredError>
                ) : (
                  <LeaderboardEntriesTable
                    entries={entries}
                    customizationSettings={
                      currentLeaderboard
                        ? currentLeaderboard.customizationSettings
                        : null
                    }
                    onDeleteEntry={entry => onDeleteEntry(i18n, entry)}
                    isLoading={isRequestPending || isEditingName}
                    navigation={{
                      goToNextPage,
                      goToPreviousPage,
                      goToFirstPage,
                    }}
                    erroredEntry={
                      apiError &&
                      apiError.action === 'entryDeletion' &&
                      apiError.itemId
                        ? {
                            entryId: apiError.itemId,
                            message: apiError.message,
                          }
                        : undefined
                    }
                  />
                )}
              </div>
            </ResponsiveLineStackLayout>
          </Column>
          {isEditingAppearance ? (
            <LeaderboardAppearanceDialog
              open
              leaderboardCustomizationSettings={
                currentLeaderboard
                  ? currentLeaderboard.customizationSettings
                  : undefined
              }
              onClose={() => setIsEditingAppearance(false)}
              onSave={async (
                customizationSettings: LeaderboardCustomizationSettings
              ) => {
                try {
                  await onUpdateLeaderboard(i18n, {
                    customizationSettings,
                  });
                } finally {
                  setIsEditingAppearance(false);
                }
              }}
            />
          ) : null}
          {isEditingSortOptions && currentLeaderboard ? (
            <LeaderboardSortOptionsDialog
              open
              onClose={() => setIsEditingSortOptions(false)}
              onSave={async (sortOptions: {|
                sort: LeaderboardSortOption,
                extremeAllowedScore: ?number,
              |}) => {
                try {
                  await onUpdateLeaderboard(i18n, {
                    ...sortOptions,
                  });
                } finally {
                  setIsEditingSortOptions(false);
                }
              }}
              sort={currentLeaderboard.sort}
              extremeAllowedScore={currentLeaderboard.extremeAllowedScore}
            />
          ) : null}
        </>
      )}
    </I18n>
  );
};

const LeaderboardAdminContainer = ({
  gameId,
  ...otherProps
}: ContainerProps) => (
  <LeaderboardProvider gameId={gameId}>
    <LeaderboardAdmin {...otherProps} />
  </LeaderboardProvider>
);

export default LeaderboardAdminContainer;
