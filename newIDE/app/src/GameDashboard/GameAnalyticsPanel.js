// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { formatISO, subDays } from 'date-fns';
import { Column, Line } from '../UI/Grid';
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
import { ResponsiveLineStackLayout } from '../UI/Layout';
import {
  ResponsiveContainer,
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import {
  evaluateGameMetrics,
  daysShownForYear,
  durationValues,
} from './GameAnalyticsEvaluator';

const minutesFormatter = value => {
  return value.toFixed(2);
};

const percentFormatter = value => {
  return value.toFixed(2);
};

type Props = {|
  game: Game,
|};

export const GameAnalyticsPanel = ({ game }: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const [gameRollingMetrics, setGameMetrics] = React.useState<?(GameMetrics[])>(
    null
  );
  const { yearChartData, monthChartData } = React.useMemo(
    () => evaluateGameMetrics(gameRollingMetrics),
    [gameRollingMetrics]
  );

  const [gameRollingMetricsError, setGameMetricsError] = React.useState<?Error>(
    null
  );
  const [isGameMetricsLoading, setIsGameMetricsLoading] = React.useState(false);
  const [dataPeriod, setDataPeriod] = React.useState('month');
  const chartData = dataPeriod === 'year' ? yearChartData : monthChartData;

  // It's divisible by 7.
  const lastYearIsoDate = formatISO(subDays(new Date(), daysShownForYear), {
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

  const chartMargins = {
    top: 5,
    bottom: 5,
    right: 25,
    left: 0,
  };
  // There is a known bug with recharts that causes the chart to not render if the width is 100%
  // in a flexbox component. check https://github.com/recharts/recharts/issues/172
  const chartWidth = '99%';
  const chartHeight = 300;

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
            {isGameMetricsLoading && <PlaceholderLoader />}
            <>
              <Line noMargin justifyContent="flex-end">
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
              </Line>
              <ResponsiveLineStackLayout
                expand
                noMargin
                justifyContent="center"
              >
                <Column noMargin alignItems="center" expand>
                  <Text size="title" align="center">
                    <Trans>
                      {chartData.overview.playersCount} sessions this month
                    </Trans>
                  </Text>
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <AreaChart data={chartData.byDay} margin={chartMargins}>
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
                <Column noMargin alignItems="center" expand>
                  <Text size="title" align="center">
                    <Trans>
                      {Math.round(chartData.overview.bounceRatePercent)}% bounce
                      rate
                    </Trans>
                  </Text>
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <LineChart data={chartData.byDay} margin={chartMargins}>
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
              <ResponsiveLineStackLayout
                expand
                noMargin
                justifyContent="center"
              >
                <Column expand noMargin alignItems="center">
                  <Text size="title" align="center">
                    <Trans>
                      {Math.round(
                        chartData.overview.meanPlayedDurationInMinutes
                      )}{' '}
                      minutes per player
                    </Trans>
                  </Text>
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <LineChart data={chartData.byDay} margin={chartMargins}>
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
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <AreaChart
                      data={chartData.byPlayedTime}
                      margin={chartMargins}
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
                        domain={[0, durationValues[durationValues.length - 1]]}
                        ticks={durationValues}
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
              <ResponsiveLineStackLayout
                expand
                noMargin
                justifyContent="center"
              >
                <Column expand noMargin alignItems="center">
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
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <AreaChart data={chartData.byDay} margin={chartMargins}>
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
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <AreaChart data={chartData.byDay} margin={chartMargins}>
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
              <ResponsiveLineStackLayout
                expand
                noMargin
                justifyContent="center"
              >
                <Column expand noMargin alignItems="center">
                  <Text size="title" align="center">
                    <Trans>Players by played time</Trans>
                  </Text>
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <BarChart data={chartData.byDay} margin={chartMargins}>
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
                  <Text size="title" align="center">
                    <Trans>Players by played time</Trans>
                  </Text>
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <BarChart data={chartData.byDay} margin={chartMargins}>
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
            </>
          </ColumnStackLayout>
        )
      }
    </I18n>
  );
};
