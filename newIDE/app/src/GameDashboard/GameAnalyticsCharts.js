// @flow

import * as React from 'react';
import type { I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import {
  ResponsiveContainer,
  LineChart,
  Line as RechartsLine,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import Paper from '../UI/Paper';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import {
  type GameAnalyticsOverTimePoint,
  type GameAnalyticsPlayedDurationStep,
  type GameAnalyticsRetentionDay,
} from './GameAnalyticsEvaluator';

const chartMargins = {
  top: 20,
  bottom: 5,
  right: 10,
  left: 0,
};
// There is a known bug with recharts that causes the chart to not render if the width is 100%
// in a flexbox component. check https://github.com/recharts/recharts/issues/172
const chartWidth = '99%';
const barRadius = [3, 3, 0, 0];
const returningPlayersOpacity = 0.45;

const getChartsStyleFromTheme = (gdevelopTheme: GDevelopTheme) => ({
  tooltipContent: {
    color: gdevelopTheme.chart.textColor,
    padding: 10,
  },
  tickLabel: {
    fontFamily: gdevelopTheme.chart.fontFamily,
  },
  chartLineDot: {
    fill: gdevelopTheme.chart.dataColor1,
    strokeWidth: 0,
  },
  barLabel: {
    fill: gdevelopTheme.chart.textColor,
    fontFamily: gdevelopTheme.chart.fontFamily,
    fontSize: 12,
  },
});

// Small rates keep a decimal: retention is often a few percents.
export const formatPercent = (value: number): string =>
  `${Math.round(value * 10) / 10 < 10 ? value.toFixed(1) : Math.round(value)}%`;

const formatMinutes = (value: number): string =>
  value >= 10 || value % 1 === 0 ? `${Math.round(value)}` : value.toFixed(1);

const ChartTooltip = ({
  payload,
  title,
  customStyle,
  formatValue,
}: {|
  payload: ?Array<{ name: string, value: number, ... }>,
  title: ?string,
  customStyle: Object,
  formatValue: (value: number) => string,
|}) =>
  payload && payload.length > 0 ? (
    <Paper style={customStyle} background="light">
      <ColumnStackLayout noMargin>
        {title && (
          <Text size="sub-title" noMargin>
            {title}
          </Text>
        )}
        {payload.map(({ name, value }, index) => (
          <Text noMargin key={index}>
            {name}: {formatValue(value)}
          </Text>
        ))}
      </ColumnStackLayout>
    </Paper>
  ) : null;

const getFullLabel = (
  payload: ?Array<{ payload?: { fullLabel?: string }, ... }>
): ?string =>
  payload && payload.length > 0 && payload[0].payload
    ? payload[0].payload.fullLabel
    : null;

type OverTimeChartProps = {|
  i18n: I18nType,
  overTime: Array<GameAnalyticsOverTimePoint>,
  height: number,
|};

export const PlayersChart = ({
  i18n,
  overTime,
  height,
}: OverTimeChartProps): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const styles = getChartsStyleFromTheme(gdevelopTheme);

  return (
    <ResponsiveContainer width={chartWidth} height={height} debounce={1}>
      <BarChart data={overTime} margin={chartMargins}>
        <CartesianGrid
          stroke={gdevelopTheme.chart.gridColor}
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke={gdevelopTheme.chart.textColor}
          style={styles.tickLabel}
          tick={{ fontSize: 12 }}
          minTickGap={12}
        />
        <YAxis
          allowDecimals={false}
          stroke={gdevelopTheme.chart.textColor}
          style={styles.tickLabel}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: gdevelopTheme.chart.gridColor, fillOpacity: 0.2 }}
          content={({ payload }) => (
            <ChartTooltip
              payload={payload}
              title={getFullLabel(payload)}
              customStyle={styles.tooltipContent}
              formatValue={value => value.toString()}
            />
          )}
        />
        <Bar
          name={i18n._(t`New players`)}
          dataKey="newPlayersCount"
          stackId="players"
          fill={gdevelopTheme.chart.dataColor1}
          isAnimationActive={false}
        />
        <Bar
          name={i18n._(t`Returning players`)}
          dataKey="returningPlayersCount"
          stackId="players"
          fill={gdevelopTheme.chart.dataColor1}
          fillOpacity={returningPlayersOpacity}
          radius={barRadius}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PlayersChartLegend = ({
  i18n,
}: {|
  i18n: I18nType,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const squareStyle = {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
    backgroundColor: gdevelopTheme.chart.dataColor1,
  };

  return (
    <Text noMargin size="body-small" color="secondary">
      <span style={squareStyle} />
      {i18n._(t`New players`)}
      <span style={{ display: 'inline-block', width: 16 }} />
      <span style={{ ...squareStyle, opacity: returningPlayersOpacity }} />
      {i18n._(t`Returning players`)}
    </Text>
  );
};

type RateOverTimeChartProps = {|
  ...OverTimeChartProps,
  name: string,
  dataKey: 'bounceRatePercent' | 'playedDurationPerPlayerInMinutes',
  unit: string,
  formatValue: (value: number) => string,
|};

const RateOverTimeChart = ({
  overTime,
  height,
  name,
  dataKey,
  unit,
  formatValue,
}: RateOverTimeChartProps): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const styles = getChartsStyleFromTheme(gdevelopTheme);

  return (
    <ResponsiveContainer width={chartWidth} height={height} debounce={1}>
      <LineChart data={overTime} margin={chartMargins}>
        <CartesianGrid
          stroke={gdevelopTheme.chart.gridColor}
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke={gdevelopTheme.chart.textColor}
          style={styles.tickLabel}
          tick={{ fontSize: 12 }}
          minTickGap={12}
        />
        <YAxis
          unit={unit}
          stroke={gdevelopTheme.chart.textColor}
          style={styles.tickLabel}
          tick={{ fontSize: 12 }}
          tickFormatter={formatValue}
        />
        <Tooltip
          content={({ payload }) => (
            <ChartTooltip
              payload={payload}
              title={getFullLabel(payload)}
              customStyle={styles.tooltipContent}
              formatValue={value => `${formatValue(value)}${unit}`}
            />
          )}
        />
        {/* Days without players have no value: the line is cut there. */}
        <RechartsLine
          name={name}
          type="monotone"
          dataKey={dataKey}
          stroke={gdevelopTheme.chart.dataColor1}
          strokeWidth={2}
          dot={styles.chartLineDot}
          connectNulls={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const BounceRateChart = (props: OverTimeChartProps): React.Node => (
  <RateOverTimeChart
    {...props}
    name={props.i18n._(t`Left in the first minute`)}
    dataKey="bounceRatePercent"
    unit="%"
    formatValue={value => `${Math.round(value)}`}
  />
);

export const PlayedDurationChart = (props: OverTimeChartProps): React.Node => (
  <RateOverTimeChart
    {...props}
    name={props.i18n._(t`Average play time`)}
    dataKey="playedDurationPerPlayerInMinutes"
    unit={` ${props.i18n._(t`min`)}`}
    formatValue={formatMinutes}
  />
);

type PercentBarsChartProps = {|
  data: Array<{| label: string, percent: number |}>,
  name: string,
  height: number,
|};

const PercentBarsChart = ({
  data,
  name,
  height,
}: PercentBarsChartProps): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const styles = getChartsStyleFromTheme(gdevelopTheme);

  return (
    <ResponsiveContainer width={chartWidth} height={height} debounce={1}>
      <BarChart data={data} margin={chartMargins}>
        <CartesianGrid
          stroke={gdevelopTheme.chart.gridColor}
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke={gdevelopTheme.chart.textColor}
          style={styles.tickLabel}
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis
          unit="%"
          stroke={gdevelopTheme.chart.textColor}
          style={styles.tickLabel}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: gdevelopTheme.chart.gridColor, fillOpacity: 0.2 }}
          content={({ payload }) => (
            <ChartTooltip
              payload={payload}
              title={
                payload && payload.length > 0 && payload[0].payload
                  ? payload[0].payload.label
                  : null
              }
              customStyle={styles.tooltipContent}
              formatValue={formatPercent}
            />
          )}
        />
        <Bar
          name={name}
          dataKey="percent"
          fill={gdevelopTheme.chart.dataColor1}
          radius={barRadius}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="percent"
            position="top"
            formatter={formatPercent}
            style={styles.barLabel}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RetentionChart = ({
  i18n,
  retentionDays,
  height,
}: {|
  i18n: I18nType,
  retentionDays: Array<GameAnalyticsRetentionDay>,
  height: number,
|}): React.Node => (
  <PercentBarsChart
    name={i18n._(t`New players who came back`)}
    height={height}
    data={retentionDays.map(({ dayNumber, retentionPercent }) => ({
      label: i18n._(t`Day ${dayNumber}`),
      percent: retentionPercent,
    }))}
  />
);

export const PlayedDurationStepsChart = ({
  i18n,
  playedDurationSteps,
  height,
}: {|
  i18n: I18nType,
  playedDurationSteps: Array<GameAnalyticsPlayedDurationStep>,
  height: number,
|}): React.Node => (
  <PercentBarsChart
    name={i18n._(t`Players still playing`)}
    height={height}
    data={playedDurationSteps.map(({ durationInMinutes, playersPercent }) => ({
      label:
        durationInMinutes === 0
          ? i18n._(t`Start`)
          : i18n._(t`${durationInMinutes} min`),
      percent: playersPercent,
    }))}
  />
);
