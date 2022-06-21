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
  BarChart,
  Bar,
  AreaChart,
  Area,
  Label,
  LabelList,
} from 'recharts';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';

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
  let playersSum = 0;

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
    playersSum += metric.players ? metric.players.d0Players : 0;
  });

  const dateFormatOptions = { month: 'short', day: 'numeric' };

  return {
    byDay: metrics
      .map(metric => ({
        timestamp: parseISO(metric.date).getTime(),
        date: parseISO(metric.date).toLocaleDateString(
          undefined,
          dateFormatOptions
        ),
        meanPlayedTime: metric.sessions
          ? Math.round(
              metric.sessions.d0SessionsDurationTotal /
                metric.sessions.d0Sessions
            )
          : 0,
        viewersCount: metric.players ? metric.players.d0Players : 0,
        playersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow60s
          : 0,
        over60sPlayersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow60s
          : 0,
        over180sPlayersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow180s
          : 0,
        over300sPlayersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow300s
          : 0,
        over600sPlayersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow600s
          : 0,
        over900sPlayersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow900s
          : 0,

        below60sPlayersCount: metric.players
          ? metric.players.d0PlayersBelow60s
          : 0,
        from60sTo180sPlayersCount: metric.players
          ? metric.players.d0PlayersBelow180s - metric.players.d0PlayersBelow60s
          : 0,
        from180sTo300sPlayersCount: metric.players
          ? metric.players.d0PlayersBelow300s -
            metric.players.d0PlayersBelow180s
          : 0,
        from300sTo600sPlayersCount: metric.players
          ? metric.players.d0PlayersBelow600s -
            metric.players.d0PlayersBelow300s
          : 0,
        from600sTo900sPlayersCount: metric.players
          ? metric.players.d0PlayersBelow900s -
            metric.players.d0PlayersBelow600s
          : 0,
        from900sToInfinityPlayersCount: metric.players
          ? metric.players.d0Players - metric.players.d0PlayersBelow900s
          : 0,

        over0sPlayersRatio: metric.players ? 1 : 0,
        over60sPlayersRatio: metric.players
          ? (metric.players.d0Players - metric.players.d0PlayersBelow60s) /
            metric.players.d0Players
          : 0,
        over180sPlayersRatio: metric.players
          ? (metric.players.d0Players - metric.players.d0PlayersBelow180s) /
            metric.players.d0Players
          : 0,
        over300sPlayersRatio: metric.players
          ? (metric.players.d0Players - metric.players.d0PlayersBelow300s) /
            metric.players.d0Players
          : 0,
        over600sPlayersRatio: metric.players
          ? (metric.players.d0Players - metric.players.d0PlayersBelow600s) /
            metric.players.d0Players
          : 0,
        over900sPlayersRatio: metric.players
          ? (metric.players.d0Players - metric.players.d0PlayersBelow900s) /
            metric.players.d0Players
          : 0,

        below60sPlayersRatio: metric.players
          ? metric.players.d0PlayersBelow60s / metric.players.d0Players
          : 0,
        from60sTo180sPlayersRatio: metric.players
          ? (metric.players.d0PlayersBelow180s -
              metric.players.d0PlayersBelow60s) /
            metric.players.d0Players
          : 0,
        from180sTo300sPlayersRatio: metric.players
          ? (metric.players.d0PlayersBelow300s -
              metric.players.d0PlayersBelow180s) /
            metric.players.d0Players
          : 0,
        from300sTo600sPlayersRatio: metric.players
          ? (metric.players.d0PlayersBelow600s -
              metric.players.d0PlayersBelow300s) /
            metric.players.d0Players
          : 0,
        from600sTo900sPlayersRatio: metric.players
          ? (metric.players.d0PlayersBelow900s -
              metric.players.d0PlayersBelow600s) /
            metric.players.d0Players
          : 0,
        from900sToInfinityPlayersRatio: metric.players
          ? (metric.players.d0Players - metric.players.d0PlayersBelow900s) /
            metric.players.d0Players
          : 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp),
    byPlayedTime: [
      { duration: 1, playersCount: playersBelow60sSum },
      { duration: 3, playersCount: playersBelow180sSum - playersBelow60sSum },
      { duration: 5, playersCount: playersBelow300sSum - playersBelow180sSum },
      { duration: 10, playersCount: playersBelow600sSum - playersBelow300sSum },
      { duration: 15, playersCount: playersBelow900sSum - playersBelow600sSum },
    ],
  };
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

  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const styles = {
    tableRowStatColumn: {
      width: 100,
    },
    tooltipContent: {
      backgroundColor: gdevelopTheme.chart.tooltipBackgroundColor,
      border: 0,
      fontFamily: gdevelopTheme.chart.fontFamily,
    },
    tickLabel: {
      fontFamily: gdevelopTheme.chart.fontFamily,
    },
  };

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
                      name={i18n._(t`Viewers`)}
                      type="monotone"
                      dataKey="viewersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Players`)}
                      type="monotone"
                      dataKey="playersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.25}
                      yAxisId={0}
                    />
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <YAxis
                      dataKey="viewersCount"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <Tooltip contentStyle={styles.tooltipContent} />
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
                      name={i18n._(t`Mean played time`)}
                      type="monotone"
                      dataKey="meanPlayedTime"
                      stroke={gdevelopTheme.chart.dataColor1}
                      yAxisId={0}
                    />
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <YAxis
                      dataKey="meanPlayedTime"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <Tooltip contentStyle={styles.tooltipContent} />
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
                      name={i18n._(t`Players`)}
                      type="monotone"
                      dataKey="playersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      yAxisId={0}
                    />
                    <XAxis
                      name={i18n._(t`Played time`)}
                      dataKey="duration"
                      type="number"
                      domain={[0, 15]}
                      ticks={[1, 3, 5, 10, 15]}
                      stroke={gdevelopTheme.chart.textColor}
                      contentStyle={styles.tickLabel}
                    />
                    <YAxis
                      dataKey="playersCount"
                      stroke="#f5f5f5"
                      style={styles.tickLabel}
                    />
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                    />
                    <Tooltip contentStyle={styles.tooltipContent} />
                  </LineChart>
                </ResponsiveContainer>
              </Column>
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout expand noMargin>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>Players by played time</Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <Area
                      name={i18n._(t`Viewers`)}
                      type="monotone"
                      dataKey="viewersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Players`)}
                      type="monotone"
                      dataKey="over60sPlayersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 3 minutes`)}
                      type="monotone"
                      dataKey="over180sPlayersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 5 minutes`)}
                      type="monotone"
                      dataKey="over300sPlayersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 10 minutes`)}
                      type="monotone"
                      dataKey="over600sPlayersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 15 minutes`)}
                      type="monotone"
                      dataKey="over900sPlayersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <YAxis
                      dataKey="viewersCount"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <Tooltip contentStyle={styles.tooltipContent} />
                  </AreaChart>
                </ResponsiveContainer>
              </Column>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>Players by played time</Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <Area
                      name={i18n._(t`Viewers`)}
                      type="monotone"
                      dataKey="over0sPlayersRatio"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Players`)}
                      type="monotone"
                      dataKey="over60sPlayersRatio"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 3 minutes`)}
                      type="monotone"
                      dataKey="over180sPlayersRatio"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 5 minutes`)}
                      type="monotone"
                      dataKey="over300sPlayersRatio"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 10 minutes`)}
                      type="monotone"
                      dataKey="over600sPlayersRatio"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 15 minutes`)}
                      type="monotone"
                      dataKey="over900sPlayersRatio"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.125}
                      yAxisId={0}
                    />
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="date"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <YAxis
                      dataKey="over0sPlayersRatio"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <Tooltip contentStyle={styles.tooltipContent} />
                  </AreaChart>
                </ResponsiveContainer>
              </Column>
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout expand noMargin>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>Players by played time</Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <Bar
                      name={i18n._(t`More than 15 minutes`)}
                      stackId="a"
                      dataKey="from900sToInfinityPlayersCount"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={1}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 10 to 15 minutes`)}
                      stackId="a"
                      dataKey="from600sTo900sPlayersCount"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 5 to 10 minutes`)}
                      stackId="a"
                      dataKey="from300sTo600sPlayersCount"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 2}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 3 to 5 minutes`)}
                      stackId="a"
                      dataKey="from180sTo300sPlayersCount"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 3}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 1 to 3 minutes`)}
                      stackId="a"
                      dataKey="from60sTo180sPlayersCount"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 4}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`Less than 1 minute`)}
                      stackId="a"
                      dataKey="below60sPlayersCount"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 6}
                      yAxisId={0}
                    />
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <YAxis
                      dataKey="viewersCount"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <Tooltip contentStyle={styles.tooltipContent} />
                  </BarChart>
                </ResponsiveContainer>
              </Column>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>Players by played time</Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <Bar
                      name={i18n._(t`More than 15 minutes`)}
                      stackId="a"
                      dataKey="from900sToInfinityPlayersRatio"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={1}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 10 to 15 minutes`)}
                      stackId="a"
                      dataKey="from600sTo900sPlayersRatio"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 5 to 10 minutes`)}
                      stackId="a"
                      dataKey="from300sTo600sPlayersRatio"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 2}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 3 to 5 minutes`)}
                      stackId="a"
                      dataKey="from180sTo300sPlayersRatio"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 3}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 1 to 3 minutes`)}
                      stackId="a"
                      dataKey="from60sTo180sPlayersRatio"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 4}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`Less than 1 minute`)}
                      stackId="a"
                      dataKey="below60sPlayersRatio"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 6}
                      yAxisId={0}
                    />
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <YAxis
                      dataKey="over0sPlayersRatio"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                    />
                    <Tooltip contentStyle={styles.tooltipContent} />
                  </BarChart>
                </ResponsiveContainer>
              </Column>
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        )
      }
    </I18n>
  );
};
