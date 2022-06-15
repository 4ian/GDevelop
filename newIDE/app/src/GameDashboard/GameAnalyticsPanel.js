// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { formatISO } from 'date-fns';
import { Line, Spacer } from '../UI/Grid';
import { type Game } from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import {
  type GameMetrics,
  getGameMetrics,
} from '../Utils/GDevelopServices/Analytics';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderError from '../UI/PlaceholderError';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { CircularProgress } from '@material-ui/core';
import { Table, TableBody, TableRow, TableRowColumn } from '../UI/Table';
import AlertMessage from '../UI/AlertMessage';
import subDays from 'date-fns/subDays';
import { type PublicGame } from '../Utils/GDevelopServices/Game';

const styles = {
  tableRowStatColumn: {
    width: 100,
  },
};

type Props = {|
  game: Game,
  publicGame: ?PublicGame,
|};

export const GameAnalyticsPanel = ({ game, publicGame }: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [gameRollingMetrics, setGameMetrics] = React.useState<?GameMetrics>(
    null
  );
  const [gameRollingMetricsError, setGameMetricsError] = React.useState<?Error>(
    null
  );
  const [isGameMetricsLoading, setIsGameMetricsLoading] = React.useState(false);

  const yesterdayIsoDate = formatISO(subDays(new Date(), 1), {
    representation: 'date',
  });
  const [analyticsDate, setAnalyticsDate] = React.useState(yesterdayIsoDate);

  const loadGameMetrics = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;

      setIsGameMetricsLoading(true);
      setGameMetricsError(null);
      try {
        const gameRollingMetrics = await getGameMetrics(
          getAuthorizationHeader,
          id,
          game.id,
          analyticsDate
        );
        setGameMetrics(gameRollingMetrics);
      } catch (err) {
        console.error(`Unable to load game rolling metrics:`, err);
        setGameMetricsError(err);
      }
      setIsGameMetricsLoading(false);
    },
    [getAuthorizationHeader, profile, game, analyticsDate]
  );

  React.useEffect(
    () => {
      loadGameMetrics();
    },
    [loadGameMetrics]
  );

  return (
    <I18n>
      {({ i18n }) =>
        gameRollingMetricsError ? (
          <PlaceholderError
            onRetry={() => {
              loadGameMetrics();
            }}
          >
            <Trans>There was an issue getting the game analytics.</Trans>{' '}
            <Trans>Verify your internet connection or try again later.</Trans>
          </PlaceholderError>
        ) : (
          <ColumnStackLayout expand>
            <Line noMargin alignItems="center">
              <Text size="title">
                <Trans>Consolidated metrics</Trans>
              </Text>
              <Spacer />
              {!publicGame && <CircularProgress size={20} />}
            </Line>
            <Table>
              <TableBody>
                <TableRow>
                  <TableRowColumn>
                    <Trans>Last week sessions count</Trans>
                  </TableRowColumn>
                  <TableRowColumn style={styles.tableRowStatColumn}>
                    {publicGame && publicGame.cachedLastWeekSessionsCount
                      ? publicGame.cachedLastWeekSessionsCount
                      : '-'}
                  </TableRowColumn>
                </TableRow>
                <TableRow>
                  <TableRowColumn>
                    <Trans>Last year sessions count</Trans>
                  </TableRowColumn>
                  <TableRowColumn style={styles.tableRowStatColumn}>
                    {publicGame && publicGame.cachedLastYearSessionsCount
                      ? publicGame.cachedLastYearSessionsCount
                      : '-'}
                  </TableRowColumn>
                </TableRow>
              </TableBody>
            </Table>
            <Line noMargin alignItems="center">
              <Text size="title">
                <Trans>Daily metrics</Trans>
              </Text>
              <Spacer />
              {isGameMetricsLoading && <CircularProgress size={20} />}
            </Line>
            <Line noMargin>
              <SelectField
                fullWidth
                floatingLabelText={<Trans>Day</Trans>}
                value={analyticsDate}
                onChange={(_, _index, newIsoDate) => {
                  setAnalyticsDate(newIsoDate);
                }}
              >
                {Array(5)
                  .fill('')
                  .map((_, index) => {
                    const isoDate = formatISO(subDays(new Date(), index + 2), {
                      representation: 'date',
                    });
                    return (
                      <SelectOption
                        key={isoDate}
                        value={isoDate}
                        primaryText={isoDate}
                      />
                    );
                  })
                  .reverse()}
                <SelectOption
                  value={yesterdayIsoDate}
                  primaryText={t`Yesterday`}
                />
                <SelectOption
                  value={formatISO(new Date(), {
                    representation: 'date',
                  })}
                  primaryText={t`Today (so far, in real time)`}
                />
              </SelectField>
            </Line>
            {!isGameMetricsLoading && !gameRollingMetrics ? (
              <AlertMessage kind="warning">
                <Trans>
                  There were no players or stored metrics for this day. Be sure
                  to publish your game and get players to try it to see the
                  collected anonymous analytics.
                </Trans>
              </AlertMessage>
            ) : null}
            <Table>
              <TableBody>
                <TableRow>
                  <TableRowColumn>
                    <Trans>Players count</Trans>
                  </TableRowColumn>
                  <TableRowColumn style={styles.tableRowStatColumn}>
                    {gameRollingMetrics && gameRollingMetrics.players
                      ? gameRollingMetrics.players.d0Players
                      : '-'}
                  </TableRowColumn>
                </TableRow>
                <TableRow>
                  <TableRowColumn>
                    <Trans>Sessions count</Trans>
                  </TableRowColumn>
                  <TableRowColumn style={styles.tableRowStatColumn}>
                    {gameRollingMetrics && gameRollingMetrics.sessions
                      ? gameRollingMetrics.sessions.d0Sessions
                      : '-'}
                  </TableRowColumn>
                </TableRow>
                <TableRow>
                  <TableRowColumn>
                    <Trans>New players count</Trans>
                  </TableRowColumn>
                  <TableRowColumn style={styles.tableRowStatColumn}>
                    {gameRollingMetrics && gameRollingMetrics.players
                      ? gameRollingMetrics.players.d0NewPlayers
                      : '-'}
                  </TableRowColumn>
                </TableRow>
              </TableBody>
            </Table>
            {gameRollingMetrics &&
            (!gameRollingMetrics.retention || !gameRollingMetrics.players) ? (
              <AlertMessage kind="info">
                Upgrade your account with a subscription to unlock all the
                metrics for your game.
              </AlertMessage>
            ) : null}
            <Table>
              <TableBody>
                {[1, 2, 3, 4, 5, 6, 7].map(dayIndex => (
                  <TableRow key={dayIndex}>
                    <TableRowColumn>
                      <Trans>Day {dayIndex} retained players</Trans>
                    </TableRowColumn>
                    <TableRowColumn style={styles.tableRowStatColumn}>
                      {gameRollingMetrics &&
                      gameRollingMetrics.retention &&
                      gameRollingMetrics.retention[
                        `d${dayIndex}RetainedPlayers`
                      ] != null
                        ? gameRollingMetrics.retention[
                            `d${dayIndex}RetainedPlayers`
                          ]
                        : '-'}
                    </TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ColumnStackLayout>
        )
      }
    </I18n>
  );
};
