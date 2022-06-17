// @flow
import { Trans, t, number } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { formatISO, parseISO } from 'date-fns';
import { Column, Line, Spacer } from '../UI/Grid';
import { type Game } from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import {
  type GameMetrics,
  getGameMetricsFrom,
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
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  ResponsiveContainer,
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Tooltip,
  CartesianGrid,
  Legend,
  Brush,
  ErrorBar,
  AreaChart,
  Area,
  Label,
  LabelList,
} from 'recharts';

type ChartData = {|
  byDay: {
    timestamp: number,
    date: string,
    playersCount: number,
    viewersCount: number,
    meanPlayedTime: number,
  }[],
  byPlayedTime: { duration: number, playersCount: number }[],
|};

const evaluateChartData = (metrics: GameMetrics[]): ChartData => {
  let playersBelow60sSum = 0;
  let playersBelow180sSum = 0;
  let playersBelow300sSum = 0;
  let playersBelow600sSum = 0;
  let playersBelow900sSum = 0;

  metrics.forEach(metric => {
    playersBelow60sSum += metric.players ? metric.players.d0PlayersBelow60s : 0;
    playersBelow180sSum += metric.players
      ? metric.players.d0PlayersBelow180s
      : 0;
    playersBelow300sSum += metric.players
      ? metric.players.d0PlayersBelow300s
      : 0;
    playersBelow600sSum += metric.players
      ? metric.players.d0PlayersBelow600s
      : 0;
    playersBelow900sSum += metric.players
      ? metric.players.d0PlayersBelow900s
      : 0;
  });

  return {
    byDay: metrics
      .map(metric => ({
        timestamp: parseISO(metric.date).getTime(),
        date: metric.date,
        playersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow60s
          : 0,
        viewersCount: metric.players ? metric.players.d0Players : 0,
        meanPlayedTime: metric.sessions
          ? metric.sessions.d0SessionsDurationTotal / metric.sessions.d0Sessions
          : 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp),
    byPlayedTime: [
      { duration: 1, playersCount: playersBelow60sSum },
      { duration: 3, playersCount: playersBelow180sSum },
      { duration: 5, playersCount: playersBelow300sSum },
      { duration: 10, playersCount: playersBelow600sSum },
      { duration: 15, playersCount: playersBelow900sSum },
    ],
  };
};

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

  const [gameRollingMetrics, setGameMetrics] = React.useState<?(GameMetrics[])>(
    null
  );
  const chartData = React.useMemo(
    () =>
      gameRollingMetrics
        ? evaluateChartData(gameRollingMetrics)
        : { byDay: [], byPlayedTime: [] },
    [gameRollingMetrics]
  );

  const [gameRollingMetricsError, setGameMetricsError] = React.useState<?Error>(
    null
  );
  const [isGameMetricsLoading, setIsGameMetricsLoading] = React.useState(false);

  const lastMonthIsoDate = formatISO(subDays(new Date(), 30), {
    representation: 'date',
  });

  const loadGameMetrics = React.useCallback(
    async () => {
      if (!profile) return;

      const { id } = profile;

      setIsGameMetricsLoading(true);
      setGameMetricsError(null);
      try {
        const gameRollingMetrics = await getGameMetricsFrom(
          getAuthorizationHeader,
          id,
          game.id,
          lastMonthIsoDate
        );
        setGameMetrics(gameRollingMetrics);
      } catch (err) {
        console.error(`Unable to load game rolling metrics:`, err);
        setGameMetricsError(err);
      }
      setIsGameMetricsLoading(false);
    },
    [getAuthorizationHeader, profile, game, lastMonthIsoDate]
  );

  React.useEffect(
    () => {
      loadGameMetrics();
    },
    [loadGameMetrics]
  );

  const windowWidth = useResponsiveWindowWidth();
  const chartWidth = windowWidth === 'small' ? '100%' : '50%';

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
            {gameRollingMetrics &&
            (!gameRollingMetrics[0].retention ||
              !gameRollingMetrics[0].players) ? (
              <AlertMessage kind="info">
                Upgrade your account with a subscription to unlock all the
                metrics for your game.
              </AlertMessage>
            ) : null}
            <ResponsiveLineStackLayout expand noMargin>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>Players</Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <Area
                      type="monotone"
                      dataKey="viewersCount"
                      stroke="#777777"
                      fill="#777777"
                      fillOpacity={1}
                      yAxisId={0}
                    />
                    <Area
                      type="monotone"
                      dataKey="playersCount"
                      stroke="#ff7300"
                      fill="#ff7300"
                      fillOpacity={1}
                      yAxisId={0}
                    />
                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#f5f5f5" />
                    <YAxis dataKey="viewersCount" stroke="#f5f5f5" />
                    <Tooltip />
                  </AreaChart>
                </ResponsiveContainer>
              </Column>
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout expand noMargin>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>Mean played time</Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <RechartsLine
                      type="monotone"
                      dataKey="meanPlayedTime"
                      stroke="#ff7300"
                      yAxisId={0}
                    />
                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#f5f5f5" />
                    <YAxis dataKey="meanPlayedTime" stroke="#f5f5f5" />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </Column>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>Players per played time</Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData.byPlayedTime}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <RechartsLine
                      type="monotone"
                      dataKey="playersCount"
                      stroke="#ff7300"
                      yAxisId={0}
                    />
                    <XAxis
                      dataKey="duration"
                      type="number"
                      domain={[0, 15]}
                      ticks={[1, 3, 5, 10, 15]}
                      stroke="#f5f5f5"
                    />
                    <YAxis dataKey="playersCount" stroke="#f5f5f5" />
                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </Column>
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        )
      }
    </I18n>
  );
};
