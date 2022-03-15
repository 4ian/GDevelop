// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import React from 'react';
import { Column } from '../../UI/Grid';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import Text from '../../UI/Text';
import { type LeaderboardDisplayData } from '../../Utils/GDevelopServices/Play';

type Props = {|
  entries: ?Array<LeaderboardDisplayData>,
  onDeleteEntry: (entryId: string) => Promise<void>,
|};

const LeaderboardEntriesTable = ({ entries, onDeleteEntry }: Props) => {
  if (!entries) return <PlaceholderLoader />;

  if (entries.length === 0) {
    return (
      <Column expand justifyContent="center" alignItems="center">
        <Text size="body2">
          <Trans>No entries</Trans>
        </Text>
      </Column>
    );
  }

  return (
    <I18n>
      {({ i18n }) => (
        <Column expand>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '20%' }} align="center">
                  <Trans>Score</Trans>
                </TableCell>
                <TableCell style={{ width: '35%' }}>
                  <Trans>Player</Trans>
                </TableCell>
                <TableCell style={{ width: '30%' }}>
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
                  <TableCell>{entry.playerName}</TableCell>
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
                    <Tooltip title={'Remove entry'}>
                      <IconButton onClick={() => onDeleteEntry(entry.id)}>
                        <DeleteOutline size={20} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Column>
      )}
    </I18n>
  );
};

export default LeaderboardEntriesTable;
