// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Error from '@material-ui/icons/Error';
import FirstPage from '@material-ui/icons/FirstPage';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import IconButton from '../../UI/IconButton';
import { Column, Line } from '../../UI/Grid';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import { type LeaderboardDisplayData } from '../../Utils/GDevelopServices/Play';

type Props = {|
  entries: ?Array<LeaderboardDisplayData>,
  onDeleteEntry: (entryId: string) => Promise<void>,
  disableActions: boolean,
  erroredEntry?: {| entryId: string, message: React$Node |},
  navigation: {|
    goToFirstPage: ?() => Promise<void>,
    goToPreviousPage: ?() => Promise<void>,
    goToNextPage: ?() => Promise<void>,
  |},
|};

const LeaderboardEntriesTable = ({
  entries,
  onDeleteEntry,
  disableActions,
  erroredEntry,
  navigation,
}: Props) => {
  if (!entries) return <PlaceholderLoader />;

  return (
    <I18n>
      {({ i18n }) => (
        <Column expand justifyContent="space-between">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '20%' }} align="center">
                  <Trans>Score</Trans>
                </TableCell>
                <TableCell style={{ width: '50%' }}>
                  <Trans>Player</Trans>
                </TableCell>
                <TableCell style={{ width: '15%' }}>
                  <Trans>Date</Trans>
                </TableCell>
                <TableCell style={{ width: '15%' }}>
                  <Trans>Action</Trans>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell align="center">{entry.score}</TableCell>
                  <TableCell
                    style={{
                      ...textEllipsisStyle,
                      maxWidth: 0, // to trigger the text ellipsis when overflowing
                    }}
                  >
                    <Tooltip title={entry.playerName}>
                      <span>{entry.playerName}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={i18n.date(entry.createdAt, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    >
                      <span>{i18n.date(entry.createdAt)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Line>
                      <Tooltip title={'Remove entry'}>
                        <IconButton
                          size="small"
                          onClick={() => onDeleteEntry(entry.id)}
                          disabled={disableActions}
                        >
                          <DeleteOutline size={20} />
                        </IconButton>
                      </Tooltip>
                      {erroredEntry && erroredEntry.entryId === entry.id ? (
                        <Tooltip title={erroredEntry.message}>
                          <IconButton
                            size="small"
                            onClick={() => {}} // wrap in icon button to match above icon padding
                          >
                            <Error size={20} color="error" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Line>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {entries.length === 0 ? (
            <Column expand justifyContent="center" alignItems="center">
              <Text size="body2">
                <Trans>No entries</Trans>
              </Text>
            </Column>
          ) : (
            <Line noMargin justifyContent="flex-end">
              <IconButton
                tooltip={t`Go to first page`}
                disabled={!navigation.goToFirstPage}
                onClick={navigation.goToFirstPage || (() => {})}
              >
                <FirstPage />
              </IconButton>
              <IconButton
                tooltip={t`Previous page`}
                disabled={!navigation.goToPreviousPage}
                onClick={navigation.goToPreviousPage || (() => {})}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                tooltip={t`Next page`}
                disabled={!navigation.goToNextPage}
                onClick={navigation.goToNextPage || (() => {})}
              >
                <NavigateNext />
              </IconButton>
            </Line>
          )}
        </Column>
      )}
    </I18n>
  );
};

export default LeaderboardEntriesTable;
