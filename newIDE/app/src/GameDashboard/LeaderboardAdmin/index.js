// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import Add from '@material-ui/icons/Add';
import Fingerprint from '@material-ui/icons/Fingerprint';
import Update from '@material-ui/icons/Update';
import Today from '@material-ui/icons/Today';
import Sort from '@material-ui/icons/Sort';
import SwapVertical from '@material-ui/icons/SwapVert';
import React from 'react';
import Copy from '../../UI/CustomSvgIcons/Copy';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import LeaderboardProvider from '../../Leaderboard/LeaderboardProvider';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import { Column, Line, Spacer } from '../../UI/Grid';
import IconButton from '../../UI/IconButton';
import PlaceholderError from '../../UI/PlaceholderError';
import RaisedButton from '../../UI/RaisedButton';
import MUITextField from '@material-ui/core/TextField';
import TextField from '../../UI/TextField';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import { textEllipsisStyle } from '../../UI/TextEllipsis';

const breakUuid = (uuid: string): string => {
  const parts = uuid.split('-');
  return `${parts[0]}-...-${parts[parts.length - 1]}`;
};

type Props = {| gameId: string |};

const styles = { leftColumn: { display: 'flex', flexDirection: 'column' } };

const LeaderboardAdmin = () => {
  const isOnline = useOnlineStatus();
  const [isEditingName, setIsEditingName] = React.useState<boolean>(false);
  const [isRequestPending, setIsRequestPending] = React.useState<boolean>(
    false
  );
  const [newName, setNewName] = React.useState<string>('');

  const {
    leaderboards,
    listLeaderboards,
    currentLeaderboardId,
    createLeaderboard,
    selectLeaderboard,
    updateLeaderboard,
  } = React.useContext(LeaderboardContext);

  const _updateLeaderboard = async payload => {
    setIsRequestPending(true);
    await updateLeaderboard(payload);
    setIsRequestPending(false);
  };

  React.useEffect(
    () => {
      if (leaderboards === null) listLeaderboards();
    },
    [listLeaderboards, leaderboards]
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
  if (!isOnline)
    return (
      <PlaceholderError>
        <Trans>
          An internet connection is required to administrate your game's
          leaderboards.
        </Trans>
      </PlaceholderError>
    );
  if (leaderboards === null)
    return (
      <PlaceholderError onRetry={listLeaderboards}>
        <Trans>
          An error ocurred when retrieving leaderboards, please try again later.
        </Trans>
      </PlaceholderError>
    );
  if (!!leaderboards && leaderboards.length === 0)
    return (
      <Line noMargin expand justifyContent="center">
        <EmptyPlaceholder
          title={<Trans>Create your game's first leaderboard</Trans>}
          description={<Trans>Leaderboards help retain your players</Trans>}
          actionLabel={<Trans>Create a leaderboard</Trans>}
          onAdd={() => {
            createLeaderboard({ name: 'New leaderboard', sort: 'ASC' });
          }}
        />
      </Line>
    );
  return (
    <I18n>
      {({ i18n }) => (
        <Line noMargin expand>
          <div style={styles.leftColumn}>
            <Column>
              <Line>
                {isEditingName ? (
                  <TextField
                    fullWidth
                    value={newName}
                    onChange={(e, text) => setNewName(text)}
                    onKeyPress={event => {
                      if (event.key === 'Enter' && !isRequestPending) {
                        _updateLeaderboard({ name: newName }).then(() =>
                          setIsEditingName(false)
                        );
                      }
                    }}
                    disabled={isRequestPending}
                    floatingLabelText={<Trans>Leaderboard name</Trans>}
                  />
                ) : (
                  <Autocomplete
                    autoComplete
                    autoSelect
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
                )}
                <IconButton
                  onClick={async () => {
                    const newLeaderboard = await createLeaderboard({
                      name: 'New leaderboard',
                      sort: 'ASC',
                    });
                    if (newLeaderboard) selectLeaderboard(newLeaderboard.id);
                  }}
                  disabled={isEditingName}
                >
                  <Add />
                </IconButton>
              </Line>
              {currentLeaderboard ? (
                <>
                  <Line>
                    {isEditingName && (
                      <>
                        <RaisedButton
                          label={<Trans>Cancel</Trans>}
                          onClick={async () => {
                            setIsEditingName(false);
                          }}
                          disabled={isRequestPending}
                        />
                        <Spacer />
                      </>
                    )}
                    <RaisedButton
                      primary={isEditingName}
                      label={
                        isEditingName ? (
                          <Trans>Save</Trans>
                        ) : (
                          <Trans>Rename</Trans>
                        )
                      }
                      disabled={isRequestPending}
                      onClick={async () => {
                        if (isEditingName) {
                          await _updateLeaderboard({ name: newName });
                          setIsEditingName(false);
                        } else {
                          setNewName(currentLeaderboard.name);
                          setIsEditingName(true);
                        }
                      }}
                    />
                  </Line>
                  <Divider />
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell align="center">
                          <Fingerprint />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={currentLeaderboard.id}>
                            <span style={textEllipsisStyle}>
                              {breakUuid(currentLeaderboard.id)}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={onCopy}
                            tooltip={t`Copy`}
                            edge="end"
                          >
                            <Copy />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center">
                          <Today />
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={i18n.date(currentLeaderboard.startDatetime, {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          >
                            <span>
                              {i18n.date(currentLeaderboard.startDatetime)}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => console.log('reset')}
                            tooltip={t`Reset leaderboard`}
                            edge="end"
                            disabled={isRequestPending}
                          >
                            <Update />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center">
                          <Sort />
                        </TableCell>
                        <TableCell>
                          <span>
                            {currentLeaderboard.sort === 'ASC' ? (
                              <Trans>Lower is better</Trans>
                            ) : (
                              <Trans>Higher is better</Trans>
                            )}
                          </span>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => console.log('swap')}
                            tooltip={t`Change sort direction`}
                            edge="end"
                            disabled={isRequestPending}
                          >
                            <SwapVertical />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </>
              ) : null}
            </Column>
          </div>
        </Line>
      )}
    </I18n>
  );
};

const LeaderboardAdminContainer = ({ gameId }: Props) => (
  <LeaderboardProvider gameId={gameId}>
    <LeaderboardAdmin />
  </LeaderboardProvider>
);

export default LeaderboardAdminContainer;
