// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
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
import {
  type LeaderboardDisplayData,
  type LeaderboardCustomizationSettings,
} from '../../Utils/GDevelopServices/Play';
import { formatScore } from '../../Leaderboard/LeaderboardScoreFormatter';

type Props = {|
  entries: ?Array<LeaderboardDisplayData>,
  customizationSettings: ?LeaderboardCustomizationSettings,
  onDeleteEntry: (entry: LeaderboardDisplayData) => Promise<void>,
  isLoading: boolean,
  erroredEntry?: {| entryId: string, message: React.Node |},
  navigation: {|
    goToFirstPage: ?() => Promise<void>,
    goToPreviousPage: ?() => Promise<void>,
    goToNextPage: ?() => Promise<void>,
  |},
|};

const LeaderboardEntriesTable = ({
  entries,
  customizationSettings,
  onDeleteEntry,
  isLoading,
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
                  {customizationSettings ? (
                    customizationSettings.scoreTitle
                  ) : (
                    <Trans>Score</Trans>
                  )}
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
                  <TableCell align="center">
                    {customizationSettings
                      ? formatScore(
                          entry.score,
                          customizationSettings.scoreFormatting
                        )
                      : entry.score}
                  </TableCell>
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
                      <IconButton
                        size="small"
                        onClick={() => onDeleteEntry(entry)}
                        disabled={isLoading}
                        tooltip={t`Remove entry`}
                      >
                        <DeleteOutline size={20} />
                      </IconButton>
                      {erroredEntry && erroredEntry.entryId === entry.id ? (
                        <IconButton
                          size="small"
                          onClick={() => {}} // wrap in icon button to match above icon padding
                          tooltip={erroredEntry.message}
                        >
                          <Error size={20} color="error" />
                        </IconButton>
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
                onClick={() => {
                  if (navigation.goToFirstPage) navigation.goToFirstPage();
                }}
              >
                <FirstPage />
              </IconButton>
              <IconButton
                tooltip={t`Previous page`}
                disabled={!navigation.goToPreviousPage}
                onClick={() => {
                  if (navigation.goToPreviousPage)
                    navigation.goToPreviousPage();
                }}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                tooltip={t`Next page`}
                disabled={!navigation.goToNextPage}
                onClick={() => {
                  if (navigation.goToNextPage) navigation.goToNextPage();
                }}
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
