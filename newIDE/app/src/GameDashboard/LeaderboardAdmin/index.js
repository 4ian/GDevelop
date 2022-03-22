// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import MUITextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Add from '@material-ui/icons/Add';
import Save from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';
import Edit from '@material-ui/icons/Edit';
import Label from '@material-ui/icons/Label';
import Fingerprint from '@material-ui/icons/Fingerprint';
import Update from '@material-ui/icons/Update';
import Today from '@material-ui/icons/Today';
import Sort from '@material-ui/icons/Sort';
import PeopleAlt from '@material-ui/icons/PeopleAlt';
import SwapVertical from '@material-ui/icons/SwapVert';
import Refresh from '@material-ui/icons/Refresh';
import Delete from '@material-ui/icons/Delete';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Copy from '../../UI/CustomSvgIcons/Copy';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import { Column, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import PlaceholderError from '../../UI/PlaceholderError';
import AlertMessage from '../../UI/AlertMessage';
import RaisedButton from '../../UI/RaisedButton';
import TextField from '../../UI/TextField';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import {
  type Leaderboard,
  type LeaderboardSortOption,
  type LeaderboardPlayerUnicityDisplayOption,
} from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import LeaderboardProvider from '../../Leaderboard/LeaderboardProvider';
import Window from '../../Utils/Window';
import LeaderboardEntriesTable from './LeaderboardEntriesTable';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { shouldValidate } from '../../UI/KeyboardShortcuts/InteractionKeys';

const breakUuid = (uuid: string): string => `${uuid.split('-')[0]}-...`;

type Props = {| onLoading: boolean => void |};
type ContainerProps = {| ...Props, gameId: string |};

type ApiError = {|
  action:
    | 'entriesFetching'
    | 'entryDeletion'
    | 'leaderboardsFetching'
    | 'leaderboardNameUpdate'
    | 'leaderboardSortUpdate'
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
};

export const LeaderboardAdmin = ({ onLoading }: Props) => {
  const isOnline = useOnlineStatus();
  const windowWidth = useResponsiveWindowWidth();
  const [isEditingName, setIsEditingName] = React.useState<boolean>(false);
  const [isRequestPending, setIsRequestPending] = React.useState<boolean>(
    false
  );
  const [newName, setNewName] = React.useState<string>('');
  const [newNameError, setNewNameError] = React.useState<?string>(null);
  const newNameTextFieldRef = React.useRef<?TextField>(null);
  const [apiError, setApiError] = React.useState<?ApiError>(null);

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

  const disableActions = React.useCallback(
    (yesOrNo: boolean) => {
      setIsRequestPending(yesOrNo);
      onLoading(yesOrNo);
    },
    [onLoading]
  );

  const onUpdateLeaderboard = async (
    i18n: I18nType,
    payload: {|
      name?: string,
      sort?: LeaderboardSortOption,
      playerUnicityDisplayChoice?: LeaderboardPlayerUnicityDisplayOption,
    |}
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
    disableActions(true);
    setApiError(null);
    try {
      await updateLeaderboard(payload);
      if (payload.name) setIsEditingName(false);
    } catch (err) {
      console.error('An error occurred when updating leaderboard', err);
      setApiError({
        action: payload.name
          ? 'leaderboardNameUpdate'
          : payload.sort
          ? 'leaderboardSortUpdate'
          : 'leaderboardPlayerUnicityDisplayChoiceUpdate',
        message: payload.name ? (
          <Trans>
            An error occurred when updating the name of the leaderboard, please
            close the dialog, come back and try again.
          </Trans>
        ) : payload.sort ? (
          <Trans>
            An error occurred when updating the sort direction of the
            leaderboard, please close the dialog, come back and try again.
          </Trans>
        ) : (
          <Trans>
            An error occurred when updating the display choice of the
            leaderboard, please close the dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const onListLeaderboards = React.useCallback(
    () => {
      const fetchAndHandleError = async () => {
        disableActions(true);
        setApiError(null);
        try {
          await listLeaderboards();
        } catch (err) {
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
          disableActions(false);
        }
      };
      fetchAndHandleError();
    },
    [disableActions, listLeaderboards]
  );

  const onFetchLeaderboardEntries = async () => {
    disableActions(true);
    setApiError(null);
    try {
      await fetchLeaderboardEntries();
    } catch (err) {
      console.error('An error occurred when fetching leaderboard entries', err);
      setApiError({
        action: 'entriesFetching',
        message: (
          <Trans>
            An error occurred when fetching the entries of the leaderboard, you
            can hit refresh to try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const onCreateLeaderboard = async () => {
    disableActions(true);
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
      disableActions(false);
    }
  };

  const onResetLeaderboard = async (i18n: I18nType) => {
    const answer = Window.showConfirmDialog(
      i18n._(
        t`All current entries will be deleted, are you sure you want to reset this leaderboard? This can't be undone.`
      )
    );
    if (!answer) return;

    disableActions(true);
    setApiError(null);
    try {
      await resetLeaderboard();
    } catch (err) {
      console.error('An error occurred when resetting leaderboard', err);
      setApiError({
        action: 'leaderboardReset',
        message: (
          <Trans>
            An error occurred when resetting the leaderboard, please close the
            dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const onDeleteLeaderboard = async (i18n: I18nType) => {
    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to delete this leaderboard and all of its entries? This can't be undone.`
      )
    );
    if (!answer) return;

    disableActions(true);
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
      disableActions(false);
    }
  };

  const onDeleteEntry = async (i18n: I18nType, entryId: string) => {
    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to delete this entry? This can't be undone.`
      )
    );
    if (!answer) return;

    disableActions(true);
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
      disableActions(false);
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
        <PlaceholderError onRetry={onListLeaderboards} kind="error">
          {apiError.message}
        </PlaceholderError>
      </CenteredError>
    );
  }
  if (leaderboards === null) {
    if (isRequestPending) return <PlaceholderLoader />;
    else {
      return (
        <CenteredError>
          <PlaceholderError onRetry={onListLeaderboards} kind="error">
            <Trans>
              An error occurred when retrieving leaderboards, please try again
              later.
            </Trans>
          </PlaceholderError>
        </CenteredError>
      );
    }
  }

  if (!!leaderboards && leaderboards.length === 0)
    return (
      <Line noMargin expand justifyContent="center" alignItems="center">
        <EmptyPlaceholder
          title={<Trans>Create your game's first leaderboard</Trans>}
          description={<Trans>Leaderboards help retain your players</Trans>}
          actionLabel={<Trans>Create a leaderboard</Trans>}
          onAdd={() => {
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
            style={{ width: 125, fontSize: 14 }}
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
          <Typography
            variant="body2"
            style={{ ...textEllipsisStyle, width: 150 }}
          >
            {currentLeaderboard.name}
          </Typography>
        </Tooltip>
      ),
      secondaryText:
        apiError && apiError.action === 'leaderboardNameUpdate' ? (
          <Typography color="error" variant="body2">
            {apiError.message}
          </Typography>
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
          <Typography variant="body2">
            {breakUuid(currentLeaderboard.id)}
          </Typography>
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
      text: (
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
          <Typography variant="body2">
            {i18n.date(currentLeaderboard.startDatetime)}
          </Typography>
        </Tooltip>
      ),
      secondaryText:
        apiError && apiError.action === 'leaderboardReset' ? (
          <Typography color="error" variant="body2">
            {apiError.message}
          </Typography>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={() => onResetLeaderboard(i18n)}
          tooltip={t`Reset leaderboard`}
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <Update />
        </IconButton>
      ),
    },
    {
      key: 'sort',
      avatar: <Sort />,
      text: (
        <Typography variant="body2">
          {currentLeaderboard.sort === 'ASC' ? (
            <Trans>Lower is better</Trans>
          ) : (
            <Trans>Higher is better</Trans>
          )}
        </Typography>
      ),
      secondaryText:
        apiError && apiError.action === 'leaderboardSortUpdate' ? (
          <Typography color="error" variant="body2">
            {apiError.message}
          </Typography>
        ) : null,
      secondaryAction: (
        <IconButton
          onClick={async () => {
            await onUpdateLeaderboard(i18n, {
              sort: currentLeaderboard.sort === 'ASC' ? 'DESC' : 'ASC',
            });
          }}
          tooltip={t`Change sort direction`}
          edge="end"
          disabled={isRequestPending || isEditingName}
        >
          <SwapVertical />
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
          inputStyle={{ fontSize: '0.875em' }}
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
          {[
            <SelectOption
              key={'free'}
              value={'FREE'}
              primaryText={t`Let the user select`}
            />,
            <SelectOption
              key={'prefer-unique'}
              value={'PREFER_UNIQUE'}
              primaryText={t`Only best entry`}
            />,
            <SelectOption
              key={'prefer-non-unique'}
              value={'PREFER_NON_UNIQUE'}
              primaryText={t`All entries`}
            />,
          ]}
        </SelectField>
      ),
      secondaryText:
        apiError &&
        apiError.action === 'leaderboardPlayerUnicityDisplayChoiceUpdate' ? (
          <Typography color="error" variant="body2">
            {apiError.message}
          </Typography>
        ) : null,
      secondaryAction: null,
    },
  ];

  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout noMargin expand noColumnMargin>
          <div style={styles.leftColumn}>
            <Paper elevation={5} style={{ padding: 5, margin: 5 }}>
              <Column>
                <Line>
                  <Autocomplete
                    autoComplete
                    blurOnSelect
                    disableClearable
                    noOptionsText={<Trans>No matching leaderboard</Trans>}
                    style={{ flex: 1 }}
                    options={leaderboards}
                    getOptionLabel={option => option.name}
                    onChange={(e, leaderboard) => {
                      if (leaderboard) selectLeaderboard(leaderboard.id);
                    }}
                    getOptionSelected={(leaderboard, selectedLeaderboard) =>
                      leaderboard.id === selectedLeaderboard.id
                    }
                    value={currentLeaderboard}
                    renderInput={params => (
                      <MUITextField
                        {...params}
                        margin="dense"
                        label={<Trans>Leaderboard name</Trans>}
                        variant="filled"
                      />
                    )}
                  />
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
                      {getLeaderboardDescription(i18n, currentLeaderboard).map(
                        (item, index) => (
                          <>
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
                          </>
                        )
                      )}
                    </List>
                    <Line>
                      <RaisedButton
                        icon={<Delete />}
                        label={<Trans>Delete</Trans>}
                        disabled={isRequestPending || isEditingName}
                        onClick={() => onDeleteLeaderboard(i18n)}
                      />
                    </Line>
                    {apiError && apiError.action === 'leaderboardDeletion' ? (
                      <PlaceholderError kind="error">
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
              paddingLeft: windowWidth === 'small' ? 0 : 20,
            }}
          >
            <Line alignItems="center" justifyContent="flex-end">
              <Tooltip
                title={i18n._(
                  t`When checked, will only display the best score of each player (only for the display below).`
                )}
              >
                <Typography variant="body2">
                  <Trans>Player best entry</Trans>
                </Typography>
              </Tooltip>
              <Switch
                color="primary"
                size="small"
                checked={displayOnlyBestEntry}
                onClick={() => setDisplayOnlyBestEntry(!displayOnlyBestEntry)}
              />
              <Divider orientation="vertical" />
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
                <PlaceholderError
                  onRetry={onFetchLeaderboardEntries}
                  kind="error"
                >
                  {apiError.message}
                </PlaceholderError>
              </CenteredError>
            ) : (
              <LeaderboardEntriesTable
                entries={entries}
                onDeleteEntry={entryId => onDeleteEntry(i18n, entryId)}
                disableActions={isRequestPending || isEditingName}
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
