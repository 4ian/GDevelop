// @flow
import React from 'react';
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
import {
  Avatar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from '@material-ui/core';

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
  message: React$Node,
  itemId?: string,
|};

const WrappedError = ({ children }: { children: React$Node }) => (
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

const LeaderboardAdmin = ({ onLoading }: Props) => {
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
    currentLeaderboardId,
    createLeaderboard,
    selectLeaderboard,
    updateLeaderboard,
    resetLeaderboard,
    deleteLeaderboard,
    deleteLeaderboardEntry,
    displayOnlyBestEntry,
    setDisplayOnlyBestEntry,
    fetchLeaderboardEntries,
    browsing: { entries },
  } = React.useContext(LeaderboardContext);

  const disableActions = React.useCallback(
    (yesOrNo: boolean) => {
      setIsRequestPending(yesOrNo);
      onLoading(yesOrNo);
    },
    [onLoading]
  );

  const _updateLeaderboard = async (
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
      console.error(err);
      setApiError({
        action: payload.name
          ? 'leaderboardNameUpdate'
          : payload.sort
          ? 'leaderboardSortUpdate'
          : 'leaderboardPlayerUnicityDisplayChoiceUpdate',
        message: payload.name ? (
          <Trans>
            An error ocurred when updating the name of the leaderboard, please
            close the dialog, come back and try again.
          </Trans>
        ) : payload.sort ? (
          <Trans>
            An error ocurred when updating the sort direction of the
            leaderboard, please close the dialog, come back and try again.
          </Trans>
        ) : (
          <Trans>
            An error ocurred when updating the display choice of the
            leaderboard, please close the dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const _listLeaderboards = React.useCallback(
    () => {
      const fetchAndHandleError = async () => {
        disableActions(true);
        setApiError(null);
        try {
          await listLeaderboards();
        } catch (err) {
          console.error(err);
          setApiError({
            action: 'leaderboardsFetching',
            message: (
              <Trans>
                An error ocurred when fetching the leaderboards, please close
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

  const _fetchLeaderboardEntries = async () => {
    disableActions(true);
    setApiError(null);
    try {
      await fetchLeaderboardEntries();
    } catch (err) {
      console.error(err);
      setApiError({
        action: 'entriesFetching',
        message: (
          <Trans>
            An error ocurred when fetching the entries of the leaderboard, you
            can hit refresh to try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const _createLeaderboard = async () => {
    disableActions(true);
    setApiError(null);
    try {
      const newLeaderboard = await createLeaderboard({
        name: 'New leaderboard',
        sort: 'ASC',
      });
      if (newLeaderboard) selectLeaderboard(newLeaderboard.id);
    } catch (err) {
      console.error(err);
      setApiError({
        action: 'leaderboardCreation',
        message: (
          <Trans>
            An error ocurred when creating a new leaderboard, please close the
            dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const _resetLeaderboard = async (i18n: I18nType) => {
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
      console.error(err);
      setApiError({
        action: 'leaderboardReset',
        message: (
          <Trans>
            An error ocurred when resetting the leaderboard, please close the
            dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const _deleteLeaderboard = async (i18n: I18nType) => {
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
      console.error(err);
      setApiError({
        action: 'leaderboardDeletion',
        message: (
          <Trans>
            An error ocurred when deleting the leaderboard, please close the
            dialog, come back and try again.
          </Trans>
        ),
      });
    } finally {
      disableActions(false);
    }
  };

  const _deleteEntry = async (i18n: I18nType, entryId: string) => {
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
      console.error(err);
      setApiError({
        action: 'entryDeletion',
        message: (
          <Trans>
            An error ocurred when deleting the entry, please try again.
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
        _listLeaderboards();
      }
    },
    [leaderboards, _listLeaderboards]
  );
  const currentLeaderboard = React.useMemo(
    () => {
      if (!leaderboards || !currentLeaderboardId) return null;
      return leaderboards.filter(
        leaderboard => leaderboard.id === currentLeaderboardId
      )[0];
    },
    [leaderboards, currentLeaderboardId]
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
      <WrappedError>
        <PlaceholderError>
          <Trans>
            An internet connection is required to administrate your game's
            leaderboards.
          </Trans>
        </PlaceholderError>
      </WrappedError>
    );
  }
  if (apiError && apiError.action === 'leaderboardCreation') {
    return (
      <WrappedError>
        <AlertMessage kind="error">{apiError.message}</AlertMessage>
      </WrappedError>
    );
  }
  if (apiError && apiError.action === 'leaderboardsFetching') {
    return (
      <WrappedError>
        <PlaceholderError onRetry={_listLeaderboards}>
          <AlertMessage kind="error">{apiError.message}</AlertMessage>
        </PlaceholderError>
      </WrappedError>
    );
  }
  if (leaderboards === null) {
    if (isRequestPending) return <PlaceholderLoader />;
    else {
      return (
        <WrappedError>
          <PlaceholderError onRetry={_listLeaderboards}>
            <AlertMessage kind="error">
              <Trans>
                An error ocurred when retrieving leaderboards, please try again
                later.
              </Trans>
            </AlertMessage>
          </PlaceholderError>
        </WrappedError>
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
            _createLeaderboard();
          }}
          isLoading={isRequestPending}
        />
      </Line>
    );

  const leaderboardDescription = (
    i18n: I18nType,
    currentLeaderboard: Leaderboard
  ) => [
    {
      key: 'name',
      avatar: <Label />,
      text: isEditingName ? (
        <Line alignItems="center">
          <TextField
            ref={newNameTextFieldRef}
            margin="none"
            fullWidth
            maxLength={50}
            value={newName}
            errorText={newNameError}
            onChange={(e, text) => setNewName(text)}
            onKeyPress={event => {
              if (event.key === 'Enter' && !isRequestPending) {
                _updateLeaderboard(i18n, { name: newName });
              }
            }}
            disabled={isRequestPending}
          />
          {!isRequestPending && (
            <IconButton
              style={{ padding: 0, marginLeft: 5 }}
              onClick={() => {
                setIsEditingName(false);
              }}
            >
              <Cancel />
            </IconButton>
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
              _updateLeaderboard(i18n, { name: newName });
            } else {
              setNewName(currentLeaderboard.name);
              setIsEditingName(true);
            }
          }}
          tooltip={t`Rename`}
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
          onClick={() => _resetLeaderboard(i18n)}
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
            await _updateLeaderboard(i18n, {
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
        <Tooltip
          title={i18n._(
            t`This parameter allows you to decide how you want the leaderboard to be displayed.`
          )}
        >
          <SelectField
            fullWidth
            margin="none"
            value={currentLeaderboard.playerUnicityDisplayChoice}
            onChange={(e, i, value) => {
              _updateLeaderboard(i18n, {
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
                primaryText={t`Only best`}
              />,
              <SelectOption
                key={'prefer-non-unique'}
                value={'PREFER_NON_UNIQUE'}
                primaryText={t`All entries`}
              />,
            ]}
          </SelectField>
        </Tooltip>
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
        <ResponsiveLineStackLayout noMargin expand>
          <div style={styles.leftColumn}>
            <Paper elevation={5} style={{ padding: 5, margin: 5 }}>
              <Column>
                <Line>
                  <Autocomplete
                    autoComplete
                    disableClearable
                    noOptionsText={<Trans>No matching leaderboard</Trans>}
                    style={{ flex: 1 }}
                    options={leaderboards}
                    getOptionLabel={option => option.name}
                    onChange={(e, leaderboard) => {
                      if (leaderboard) selectLeaderboard(leaderboard.id);
                    }}
                    getOptionSelected={(leaderboard, selectedId) => {
                      return leaderboard.id === selectedId;
                    }}
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
                    onClick={_createLeaderboard}
                    disabled={isEditingName || isRequestPending}
                  >
                    <Add />
                  </IconButton>
                </Line>
                {currentLeaderboard ? (
                  <>
                    <List>
                      {leaderboardDescription(i18n, currentLeaderboard).map(
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
                        onClick={() => _deleteLeaderboard(i18n)}
                      />
                    </Line>
                    {apiError && apiError.action === 'leaderboardDeletion' ? (
                      <PlaceholderError>
                        <AlertMessage kind="error">
                          {apiError.message}
                        </AlertMessage>
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
                size="small"
                checked={displayOnlyBestEntry}
                onClick={() => setDisplayOnlyBestEntry(!displayOnlyBestEntry)}
              />
              <Divider orientation="vertical" />
              <Tooltip title={i18n._(t`Refresh`)}>
                <IconButton
                  onClick={_fetchLeaderboardEntries}
                  disabled={isRequestPending || isEditingName}
                  size="small"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Spacer />
            </Line>
            {apiError && apiError.action === 'entriesFetching' ? (
              <WrappedError>
                <PlaceholderError onRetry={_fetchLeaderboardEntries}>
                  <AlertMessage kind="error">{apiError.message}</AlertMessage>
                </PlaceholderError>
              </WrappedError>
            ) : (
              <LeaderboardEntriesTable
                entries={entries}
                onDeleteEntry={entryId => _deleteEntry(i18n, entryId)}
                disableActions={isRequestPending || isEditingName}
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
