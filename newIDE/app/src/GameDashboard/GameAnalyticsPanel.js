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

export type MergedGameMetrics = GameMetrics & {
  endDate: string,
};

const mergeGameMetrics = (
  a: GameMetrics,
  b: GameMetrics
): MergedGameMetrics => {
  return {
    gameId: a.gameId,

    date: a.date,
    endDate: b.date,

    sessions: {
      d0Sessions: a.sessions.d0Sessions + b.sessions.d0Sessions,
      d0SessionsDurationTotal:
        a.sessions.d0SessionsDurationTotal + b.sessions.d0SessionsDurationTotal,
    },

    players: {
      d0Players: a.players.d0Players + b.players.d0Players,
      d0NewPlayers: a.players.d0NewPlayers + b.players.d0NewPlayers,
      d0PlayersBelow60s:
        a.players.d0PlayersBelow60s + b.players.d0PlayersBelow60s,
      d0PlayersBelow180s:
        a.players.d0PlayersBelow180s + b.players.d0PlayersBelow180s,
      d0PlayersBelow300s:
        a.players.d0PlayersBelow300s + b.players.d0PlayersBelow300s,
      d0PlayersBelow600s:
        a.players.d0PlayersBelow600s + b.players.d0PlayersBelow600s,
      d0PlayersBelow900s:
        a.players.d0PlayersBelow900s + b.players.d0PlayersBelow900s,
    },

    retention: null,
  };
};

const mergeGameMetricsByWeek = (
  gameMetrics: GameMetrics[]
): MergedGameMetrics[] => {
  const mergedGameMetrics: Array<MergedGameMetrics> = [];
  for (let weekIndex = 7; weekIndex < gameMetrics.length; weekIndex += 7) {
    let mergedGameMetric = gameMetrics[weekIndex];
    for (let index = weekIndex + 1; index < weekIndex + 7; index++) {
      mergedGameMetric = mergeGameMetrics(mergedGameMetric, gameMetrics[index]);
    }
    mergedGameMetrics.push(((mergedGameMetric: any): MergedGameMetrics));
  }
  return mergedGameMetrics;
};

type ChartData = {|
  overview: {|
    viewersCount: number,
    playersCount: number,
    bounceRatePercent: number,
    meanPlayedDurationInMinutes: number,
    nearestToMedianDuration: {|
      playersCount: number,
      playersPercent: number,
      durationInMinutes: number,
    |},
    greaterDurationPlayerSurface: {|
      playersCount: number,
      playersPercent: number,
      durationInMinutes: number,
    |},
  |},
  byDay: {|
    timestamp: number,
    date: string,
    playersCount: number,
    viewersCount: number,
    meanPlayedDurationInMinutes: number,
    bounceRatePercent: number,

    over60sPlayersCount: number,
    over180sPlayersCount: number,
    over300sPlayersCount: number,
    over600sPlayersCount: number,
    over900sPlayersCount: number,

    below60sPlayersCount: number,
    from60sTo180sPlayersCount: number,
    from180sTo300sPlayersCount: number,
    from300sTo600sPlayersCount: number,
    from600sTo900sPlayersCount: number,
    from900sToInfinityPlayersCount: number,

    over0sPlayersPercent: number,
    over60sPlayersPercent: number,
    over180sPlayersPercent: number,
    over300sPlayersPercent: number,
    over600sPlayersPercent: number,
    over900sPlayersPercent: number,

    below60sPlayersPercent: number,
    from60sTo180sPlayersPercent: number,
    from180sTo300sPlayersPercent: number,
    from300sTo600sPlayersPercent: number,
    from600sTo900sPlayersPercent: number,
    from900sToInfinityPlayersPercent: number,
  |}[],
  byPlayedTime: {| duration: number, playersCount: number |}[],
|};

const emptyChartData = {
  overview: {
    viewersCount: 0,
    playersCount: 0,
    bounceRatePercent: 0,
    meanPlayedDurationInMinutes: 0,
    nearestToMedianDuration: {},
    greaterDurationPlayerSurface: {},
  },
  byDay: [],
  byPlayedTime: [],
};

const durationIndexes: { [string]: number } = {
  for1Minute: 0,
  for3Minutes: 1,
  for5Minutes: 2,
  for10Minutes: 3,
  for15Minutes: 4,
};
const durationValues = [1, 3, 5, 10, 15];

const findNearestToMedianDurationIndex = (
  playersBelowSums: Array<number>,
  playersCount: number
): number => {
  const overMedianDurationIndex = playersBelowSums.findIndex(
    (value, index) => index > 0 && value > playersCount / 2
  );
  const overMedianDuration = playersBelowSums[overMedianDurationIndex];
  const underMedianDuration = playersBelowSums[overMedianDurationIndex + 1];
  return underMedianDuration &&
    Math.abs(overMedianDuration - playersCount / 2) <
      Math.abs(underMedianDuration - playersCount / 2)
    ? overMedianDurationIndex
    : overMedianDurationIndex + 1;
};

const findGreaterDurationPlayerIndex = (
  playersBelowSums: Array<number>,
  viewersCount: number
): number => {
  let durationPlayerMax = 0;
  let greaterDurationPlayerIndex = 0;
  for (let index = 0; index < playersBelowSums.length; index++) {
    const playersOverSum = viewersCount - playersBelowSums[index];
    const duration = durationValues[index];

    const durationPlayer = playersOverSum * duration;
    if (durationPlayer >= durationPlayerMax) {
      durationPlayerMax = durationPlayer;
      greaterDurationPlayerIndex = index;
    }
  }
  return greaterDurationPlayerIndex;
};

const evaluateChartData = (
  metrics: GameMetrics[] | MergedGameMetrics[]
): ChartData => {
  let playersBelowSums = [0, 0, 0, 0, 0];
  let playersSum = 0;
  let playedDurationSumInMinutes = 0;

  metrics.forEach(metric => {
    playersBelowSums[durationIndexes.for1Minute] += metric.players
      ? metric.players.d0PlayersBelow60s
      : 0;
    playersBelowSums[durationIndexes.for3Minutes] += metric.players
      ? metric.players.d0PlayersBelow180s
      : 0;
    playersBelowSums[durationIndexes.for5Minutes] += metric.players
      ? metric.players.d0PlayersBelow300s
      : 0;
    playersBelowSums[durationIndexes.for10Minutes] += metric.players
      ? metric.players.d0PlayersBelow600s
      : 0;
    playersBelowSums[durationIndexes.for15Minutes] += metric.players
      ? metric.players.d0PlayersBelow900s
      : 0;
    playersSum += metric.players ? metric.players.d0Players : 0;
    playedDurationSumInMinutes += metric.sessions
      ? metric.sessions.d0SessionsDurationTotal / 60
      : 0;
  });

  const viewersCount = playersSum;
  const playersCount =
    playersSum - playersBelowSums[durationIndexes.for1Minute];

  const nearestToMedianDurationIndex = findNearestToMedianDurationIndex(
    playersBelowSums,
    playersCount
  );
  const greaterDurationPlayerIndex = findGreaterDurationPlayerIndex(
    playersBelowSums,
    viewersCount
  );

  const dateFormatOptions = { month: 'short', day: 'numeric' };

  return {
    overview: {
      viewersCount: viewersCount,
      playersCount: playersCount,
      bounceRatePercent:
        viewersCount > 0 ? (100 * playersCount) / viewersCount : 0,
      meanPlayedDurationInMinutes:
        playersSum > 0 ? playedDurationSumInMinutes / playersSum : 0,
      nearestToMedianDuration: {
        playersCount:
          viewersCount - playersBelowSums[nearestToMedianDurationIndex],
        playersPercent:
          playersSum > 0
            ? (100 *
                (viewersCount -
                  playersBelowSums[nearestToMedianDurationIndex])) /
              playersSum
            : 0,
        durationInMinutes: durationValues[nearestToMedianDurationIndex],
      },
      greaterDurationPlayerSurface: {
        playersCount:
          viewersCount - playersBelowSums[greaterDurationPlayerIndex],
        playersPercent:
          playersSum > 0
            ? (100 *
                (viewersCount - playersBelowSums[greaterDurationPlayerIndex])) /
              playersSum
            : 0,
        durationInMinutes: durationValues[greaterDurationPlayerIndex],
      },
    },
    byDay: metrics
      .map(metric => ({
        timestamp: parseISO(metric.date).getTime(),
        date: parseISO(metric.date).toLocaleDateString(
          undefined,
          dateFormatOptions
        ),
        meanPlayedDurationInMinutes:
          metric.sessions && metric.players
            ? metric.sessions.d0SessionsDurationTotal /
              60 /
              metric.players.d0Players
            : 0,
        bounceRatePercent: metric.players
          ? (100 * metric.players.d0PlayersBelow60s) / metric.players.d0Players
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

        over0sPlayersPercent: metric.players ? 100 : 0,
        over60sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0Players - metric.players.d0PlayersBelow60s)) /
            metric.players.d0Players
          : 0,
        over180sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0Players - metric.players.d0PlayersBelow180s)) /
            metric.players.d0Players
          : 0,
        over300sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0Players - metric.players.d0PlayersBelow300s)) /
            metric.players.d0Players
          : 0,
        over600sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0Players - metric.players.d0PlayersBelow600s)) /
            metric.players.d0Players
          : 0,
        over900sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0Players - metric.players.d0PlayersBelow900s)) /
            metric.players.d0Players
          : 0,

        below60sPlayersPercent: metric.players
          ? (100 * metric.players.d0PlayersBelow60s) / metric.players.d0Players
          : 0,
        from60sTo180sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0PlayersBelow180s -
                metric.players.d0PlayersBelow60s)) /
            metric.players.d0Players
          : 0,
        from180sTo300sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0PlayersBelow300s -
                metric.players.d0PlayersBelow180s)) /
            metric.players.d0Players
          : 0,
        from300sTo600sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0PlayersBelow600s -
                metric.players.d0PlayersBelow300s)) /
            metric.players.d0Players
          : 0,
        from600sTo900sPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0PlayersBelow900s -
                metric.players.d0PlayersBelow600s)) /
            metric.players.d0Players
          : 0,
        from900sToInfinityPlayersPercent: metric.players
          ? (100 *
              (metric.players.d0Players - metric.players.d0PlayersBelow900s)) /
            metric.players.d0Players
          : 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp),
    byPlayedTime: [{ duration: 0, playersCount: viewersCount }].concat(
      Object.values(durationIndexes).map((durationIndex: number) => ({
        duration: durationValues[durationIndex],
        playersCount: viewersCount - playersBelowSums[durationIndex],
      }))
    ),
  };
};

const minutesFormatter = value => {
  return value.toFixed(2);
};

const percentFormatter = value => {
  return value.toFixed(2);
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
  const yearChartData = React.useMemo(
    () =>
      gameRollingMetrics
        ? evaluateChartData(mergeGameMetricsByWeek(gameRollingMetrics))
        : emptyChartData,
    [gameRollingMetrics]
  );
  const monthChartData = React.useMemo(
    () =>
      gameRollingMetrics
        ? evaluateChartData(gameRollingMetrics.slice(0, 30))
        : emptyChartData,
    [gameRollingMetrics]
  );

  const [gameRollingMetricsError, setGameMetricsError] = React.useState<?Error>(
    null
  );
  const [isGameMetricsLoading, setIsGameMetricsLoading] = React.useState(false);
  const [dataPeriod, setDataPeriod] = React.useState('month');
  const chartData = dataPeriod === 'year' ? yearChartData : monthChartData;

  // It's divisible by 7.
  const lastYearIsoDate = formatISO(subDays(new Date(), 364), {
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
          lastYearIsoDate
        );
        setGameMetrics(gameRollingMetrics);
      } catch (err) {
        console.error(`Unable to load game rolling metrics:`, err);
        setGameMetricsError(err);
      }
      setIsGameMetricsLoading(false);
    },
    [getAuthorizationHeader, profile, game, lastYearIsoDate]
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
            <Column expand noMargin alignItems="center">
              {!publicGame && <CircularProgress size={20} />}
            </Column>
            <SelectField
              value={dataPeriod}
              onChange={(e, i, period: string) => {
                setDataPeriod(period);
              }}
              disableUnderline
            >
              <SelectOption
                key="month"
                value="month"
                primaryText={i18n._(t`Month`)}
              />
              <SelectOption
                key="year"
                value="year"
                primaryText={i18n._(t`Year`)}
              />
            </SelectField>
            {gameRollingMetrics &&
            gameRollingMetrics.length > 0 &&
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
                    <Trans>
                      {chartData.overview.playersCount} sessions this month
                    </Trans>
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
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>
                      {Math.round(chartData.overview.bounceRatePercent)}% bounce
                      rate
                    </Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <RechartsLine
                      name={i18n._(t`Bounce rate`)}
                      unit="%"
                      formatter={minutesFormatter}
                      type="monotone"
                      dataKey="bounceRatePercent"
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
                      dataKey="bounceRatePercent"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
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
                    <Trans>
                      {Math.round(
                        chartData.overview.meanPlayedDurationInMinutes
                      )}{' '}
                      minutes per player
                    </Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData.byDay}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <RechartsLine
                      name={i18n._(t`Mean played time`)}
                      unit={' ' + i18n._(t`minutes`)}
                      formatter={minutesFormatter}
                      type="monotone"
                      dataKey="meanPlayedDurationInMinutes"
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
                      dataKey="meanPlayedDurationInMinutes"
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
                    <Trans>
                      {
                        chartData.overview.greaterDurationPlayerSurface
                          .playersCount
                      }{' '}
                      players >{' '}
                      {
                        chartData.overview.greaterDurationPlayerSurface
                          .durationInMinutes
                      }{' '}
                      minutes
                    </Trans>
                  </Text>
                </Line>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartData.byPlayedTime}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <Area
                      name={i18n._(t`Players`)}
                      type="monotone"
                      dataKey="playersCount"
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.25}
                      yAxisId={0}
                    />
                    <XAxis
                      name={i18n._(t`Played time`)}
                      dataKey="duration"
                      type="number"
                      domain={[0, 15]}
                      ticks={[1, 3, 5, 10, 15]}
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
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
                  </AreaChart>
                </ResponsiveContainer>
              </Column>
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout expand noMargin>
              <Column expand noMargin alignItems="center">
                <Line noMargin>
                  <Text size="title" align="center">
                    <Trans>
                      {chartData.overview.nearestToMedianDuration.playersCount}{' '}
                      players >{' '}
                      {
                        chartData.overview.nearestToMedianDuration
                          .durationInMinutes
                      }{' '}
                      minutes
                    </Trans>
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
                    <Trans>
                      {Math.round(
                        chartData.overview.nearestToMedianDuration
                          .playersPercent
                      )}
                      % of players >{' '}
                      {
                        chartData.overview.nearestToMedianDuration
                          .durationInMinutes
                      }{' '}
                      minutes
                    </Trans>
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
                      dataKey="over0sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      stroke="none"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.7 ** 6}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Players`)}
                      type="monotone"
                      dataKey="over60sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      stroke="none"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.7 ** 5}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 3 minutes`)}
                      type="monotone"
                      dataKey="over180sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      stroke="none"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.7 ** 4}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 5 minutes`)}
                      type="monotone"
                      dataKey="over300sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      stroke="none"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.7 ** 3}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 10 minutes`)}
                      type="monotone"
                      dataKey="over600sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      stroke="none"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.7 ** 2}
                      yAxisId={0}
                    />
                    <Area
                      name={i18n._(t`Played > 15 minutes`)}
                      type="monotone"
                      dataKey="over900sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      stroke="none"
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.7}
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
                      dataKey="over0sPlayersPercent"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                      unit={' %'}
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
                      dataKey="from900sToInfinityPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={1}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 10 to 15 minutes`)}
                      stackId="a"
                      dataKey="from600sTo900sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 5 to 10 minutes`)}
                      stackId="a"
                      dataKey="from300sTo600sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 2}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 3 to 5 minutes`)}
                      stackId="a"
                      dataKey="from180sTo300sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 3}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`From 1 to 3 minutes`)}
                      stackId="a"
                      dataKey="from60sTo180sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.75 ** 4}
                      yAxisId={0}
                    />
                    <Bar
                      name={i18n._(t`Less than 1 minute`)}
                      stackId="a"
                      dataKey="below60sPlayersPercent"
                      formatter={percentFormatter}
                      unit={' %'}
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
                      dataKey="over0sPlayersPercent"
                      stroke={gdevelopTheme.chart.textColor}
                      style={styles.tickLabel}
                      unit={' %'}
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
