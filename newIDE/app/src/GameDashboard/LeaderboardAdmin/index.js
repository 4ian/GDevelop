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
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';

import Add from '@material-ui/icons/Add';
import Brush from '@material-ui/icons/Brush';
import TextFormat from '@material-ui/icons/TextFormat';
import Save from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';
import Edit from '@material-ui/icons/Edit';
import Label from '@material-ui/icons/Label';
import Fingerprint from '@material-ui/icons/Fingerprint';
import Update from '@material-ui/icons/Update';
import Today from '@material-ui/icons/Today';
import Sort from '@material-ui/icons/Sort';
import PeopleAlt from '@material-ui/icons/PeopleAlt';
import Refresh from '@material-ui/icons/Refresh';
import Delete from '@material-ui/icons/Delete';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Loop from '@material-ui/icons/Loop';

import Copy from '../../UI/CustomSvgIcons/Copy';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import { Column, LargeSpacer, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import PlaceholderError from '../../UI/PlaceholderError';
import AlertMessage from '../../UI/AlertMessage';
import RaisedButton from '../../UI/RaisedButton';
import TextField from '../../UI/TextField';
import SelectField from '../../UI/SelectField';
import CircularProgress from '../../UI/CircularProgress';
import SelectOption from '../../UI/SelectOption';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import {
  type Leaderboard,
  type LeaderboardCustomizationSettings,
  type LeaderboardUpdatePayload,
  shortenUuidForDisplay,
} from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import LeaderboardProvider from '../../Leaderboard/LeaderboardProvider';
import Window from '../../Utils/Window';
import LeaderboardEntriesTable from './LeaderboardEntriesTable';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
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
  leftColumn: { display: 'flex', flexDirection: 'column', flex: 1, padding: 5 },
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
  const windowWidth = useResponsiveWindowWidth();
  const [isEditingAppearance, setIsEditingAppearance] = React.useState<boolean>(
    false
  );
  const [
    isEditingSortOptions,
    setIsEditingSortOptions,
  ] = React.useState<boolean>(false);
  const [isEditingName, setIsEditingName] = React.useState<boolean>(false);
  const [isRequestPending, setIsRequestPending] = React.useState<boolean>(
    false
  );
  const [newName, setNewName] = React.useState<string>('');
  const [newNameError, setNewNameError] = React.useState<?string>(null);
  const newNameTextFieldRef = React.useRef<?TextField>(null);
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
        setIsLoading(true);
        setApiError(null);
        try {
          await listLeaderboards();
        } catch (err) {
          if (err.response && err.response.status === 404) {
            setDisplayGameRegistration(true);
            return;
          }
          console.error('An error occurred when fetching leaderboards', err);
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
          setIsLoading(false);
        }
      };
      fetchAndHandleError();
    },
    [setIsLoading, listLeaderboards]
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
    const answer = Window.showConfirmDialog(
      i18n._(
        t`All current entries will be deleted, are you sure you want to reset this leaderboard? This can't be undone.`
      )
    );
    if (!answer) return;

    setIsLoading(true);
    setApiError(null);
    try {
      await resetLeaderboard();
    } catch (err) {
      console.error('An error occurred when resetting leaderboard', err);
      setApiError({
        action: 'leaderboardReset',
        message:
          err.status && err.status === 409 ? (
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
    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to delete this leaderboard and all of its entries? This can't be undone.`
      )
    );
    if (!answer) return;

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

  const onDeleteEntry = async (i18n: I18nType, entryId: string) => {
    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to delete this entry? This can't be undone.`
      )
    );
    if (!answer) return;

    setIsLoading(true);
    setApiError(null);
    try {
      await deleteLeaderboardEntry(entryId);
    } catch (err) {
      console.error('An error occurred when deleting entry', err);
      setApiError({
        action: 'entryDeletion',
        message: (
          <Trans>
            An error occurred when deleting the entry, please try again.
          </Trans>
        ),
        itemId: entryId,
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
          hideIfRegistered
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
      avatar: <Label />,
      text: isEditingName ? (
        <Line alignItems="center" expand noMargin>
          <TextField
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
                <Cancel />
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
      avatar: <Fingerprint />,
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
      avatar: <Today />,
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
          <Update />
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
          <Brush />
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
          <Loop />
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
          <Brush />
        </IconButton>
      ),
    },
    {
      key: 'playerUnicityDisplayChoice',
      avatar: <PeopleAlt />,
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
            primaryText={i18n._(t`Let the user select`)}
          />
          <SelectOption
            key={'prefer-unique'}
            value={'PREFER_UNIQUE'}
            primaryText={i18n._(t`Only best entry`)}
          />
          <SelectOption
            key={'prefer-non-unique'}
            value={'PREFER_NON_UNIQUE'}
            primaryText={i18n._(t`All entries`)}
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
          <ResponsiveLineStackLayout noMargin expand noColumnMargin>
            <div style={styles.leftColumn}>
              <Paper elevation={5} style={styles.leaderboardConfigurationPaper}>
                <Column>
                  <Line>
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
                            primaryText={
                              leaderboard.primary
                                ? t`${leaderboard.name} (default)`
                                : leaderboard.name
                            }
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
                          leftIcon={<Delete />}
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
                        <PlaceholderError>{apiError.message}</PlaceholderError>
                      ) : null}
                    </>
                  ) : null}
                </Column>
              </Paper>
            </div>
            <div
              style={{
                ...styles.rightColumn,
                paddingLeft: windowWidth === 'small' ? 0 : 20,
              }}
            >
              <Line alignItems="center" justifyContent="flex-end">
                <Toggle
                  size="small"
                  labelPosition="left"
                  toggled={displayOnlyBestEntry}
                  onToggle={(e, newValue) => setDisplayOnlyBestEntry(newValue)}
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
                  onDeleteEntry={entryId => onDeleteEntry(i18n, entryId)}
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
                      ? { entryId: apiError.itemId, message: apiError.message }
                      : undefined
                  }
                />
              )}
            </div>
          </ResponsiveLineStackLayout>
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
