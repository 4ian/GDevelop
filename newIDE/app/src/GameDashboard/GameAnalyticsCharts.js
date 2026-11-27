// @flow

import * as React from 'react';
import type { I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import {
  ResponsiveContainer,
  LineChart,
  Line as RechartsLine,
  BarChart,
  ComposedChart,
  Customized,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import Paper from '../UI/Paper';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import {
  type GameAnalyticsOverTimePoint,
  type GameAnalyticsPlayedDurationStep,
  type GameAnalyticsPlayerPlatforms,
  type GameAnalyticsRetentionDay,
} from './GameAnalyticsEvaluator';
import { type GameMetricsBenchmarks } from '../Utils/GDevelopServices/Analytics';

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
const animationDuration = 600;

const getChartsStyleFromTheme = (gdevelopTheme: GDevelopTheme) => ({
  tooltipContent: {
    color: gdevelopTheme.chart.textColor,
    padding: 10,
  },
  tickLabel: {
    fontFamily: gdevelopTheme.chart.fontFamily,
  },
  hoverCursor: {
    fill: gdevelopTheme.chart.gridColor,
    fillOpacity: 0.2,
  },
  // Line charts have no band to highlight: a wide line looks like the one of the bar charts.
  lineHoverCursor: {
    stroke: gdevelopTheme.chart.gridColor,
    strokeOpacity: 0.2,
    strokeWidth: 24,
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

const typicalDashArray = '4 4';
const legendItemStyle = { display: 'inline-block', marginRight: 16 };
const squareGlyphStyle = {
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: 2,
  marginRight: 6,
};

/** The average game is drawn with a dashed line, the best games with a continuous one. */
export const BenchmarkGlyph = ({
  kind,
}: {|
  kind: 'typical' | 'top',
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        marginRight: 6,
        verticalAlign: 'middle',
        borderTop:
          kind === 'typical'
            ? `2px dashed ${gdevelopTheme.chart.typicalGameColor}`
            : `2px solid ${gdevelopTheme.chart.topGamesColor}`,
      }}
    />
  );
};

export const BenchmarksLegend = (): React.Node => (
  <Text noMargin size="body-small" color="secondary">
    <span style={legendItemStyle}>
      <BenchmarkGlyph kind="typical" />
      <Trans>Average game</Trans>
    </span>
    <span style={legendItemStyle}>
      <BenchmarkGlyph kind="top" />
      <Trans>Best games</Trans>
    </span>
  </Text>
);

const ChartTooltip = ({
  payload,
  title,
  customStyle,
  formatValue,
  benchmarks,
  notes,
}: {|
  payload: ?Array<{
    name: string,
    value: number | null,
    color?: string,
    ...
  }>,
  title: ?string,
  customStyle: Object,
  formatValue: (value: number) => string,
  benchmarks?: ?{| typical: number, top: number |},
  notes?: Array<string>,
|}) =>
  payload && payload.length > 0 ? (
    <Paper style={customStyle} background="light">
      <ColumnStackLayout noMargin>
        {title && (
          <Text size="sub-title" noMargin>
            {title}
          </Text>
        )}
        {payload.map(({ name, value, color }, index) =>
          value === null ? null : (
            <Text noMargin key={index}>
              <span style={{ ...squareGlyphStyle, backgroundColor: color }} />
              {name}: <b>{formatValue(value)}</b>
            </Text>
          )
        )}
        {benchmarks && (
          <Text noMargin>
            <BenchmarkGlyph kind="typical" />
            <Trans>Average game:</Trans>{' '}
            <b>{formatValue(benchmarks.typical)}</b>
          </Text>
        )}
        {benchmarks && (
          <Text noMargin>
            <BenchmarkGlyph kind="top" />
            <Trans>Best games:</Trans> <b>{formatValue(benchmarks.top)}</b>
          </Text>
        )}
        {(notes || []).map(note => (
          <Text noMargin key={note} color="secondary">
            {note}
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

const getPointNotes = (
  i18n: I18nType,
  payload: ?Array<{ payload?: GameAnalyticsOverTimePoint, ... }>
): Array<string> => {
  const point = payload && payload.length > 0 ? payload[0].payload : null;
  if (!point) return [];
  return [
    point.hasMarketingBoost ? i18n._(t`Marketing Boost active`) : null,
    point.buildsCount > 0 ? i18n._(t`New build`) : null,
  ].filter(Boolean);
};

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
  // The bars of the days with a Marketing Boost stand out from the others.
  const barCells = overTime.map(point => (
    <Cell
      key={point.label}
      fill={
        point.hasMarketingBoost
          ? gdevelopTheme.statusIndicator.success
          : gdevelopTheme.chart.dataColor1
      }
    />
  ));

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
          cursor={styles.hoverCursor}
          content={({ payload }) => (
            <ChartTooltip
              payload={payload}
              title={getFullLabel(payload)}
              customStyle={styles.tooltipContent}
              formatValue={value => value.toString()}
              notes={getPointNotes(i18n, payload)}
            />
          )}
        />
        <Bar
          name={i18n._(t`New players`)}
          dataKey="newPlayersCount"
          stackId="players"
          fill={gdevelopTheme.chart.dataColor1}
          animationDuration={animationDuration}
        >
          {barCells}
        </Bar>
        <Bar
          name={i18n._(t`Returning players`)}
          dataKey="returningPlayersCount"
          stackId="players"
          fill={gdevelopTheme.chart.dataColor1}
          fillOpacity={returningPlayersOpacity}
          radius={barRadius}
          animationDuration={animationDuration}
        >
          {barCells}
        </Bar>
        {overTime
          .filter(point => point.buildsCount > 0)
          .map(point => (
            <ReferenceLine
              key={point.label}
              x={point.label}
              stroke={gdevelopTheme.chart.textColor}
            />
          ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PlayersChartLegend = ({
  i18n,
  overTime,
}: {|
  i18n: I18nType,
  overTime: Array<GameAnalyticsOverTimePoint>,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const squareStyle = {
    ...squareGlyphStyle,
    backgroundColor: gdevelopTheme.chart.dataColor1,
  };
  const itemStyle = legendItemStyle;

  return (
    <Text noMargin size="body-small" color="secondary">
      <span style={itemStyle}>
        <span style={squareStyle} />
        {i18n._(t`New players`)}
      </span>
      <span style={itemStyle}>
        <span style={{ ...squareStyle, opacity: returningPlayersOpacity }} />
        {i18n._(t`Returning players`)}
      </span>
      {overTime.some(point => point.hasMarketingBoost) && (
        <span style={itemStyle}>
          <span
            style={{
              ...squareStyle,
              backgroundColor: gdevelopTheme.statusIndicator.success,
            }}
          />
          {i18n._(t`Marketing Boost`)}
        </span>
      )}
      {overTime.some(point => point.buildsCount > 0) && (
        <span style={itemStyle}>
          <span
            style={{
              display: 'inline-block',
              height: 10,
              marginRight: 6,
              borderLeft: `2px solid ${gdevelopTheme.chart.textColor}`,
            }}
          />
          {i18n._(t`New build`)}
        </span>
      )}
    </Text>
  );
};

type RateOverTimeChartProps = {|
  ...OverTimeChartProps,
  name: string,
  dataKey: 'bounceRatePercent' | 'playedDurationPerPlayerInMinutes',
  unit: string,
  formatValue: (value: number) => string,
  benchmarks: {| typical: number, top: number |},
|};

const RateOverTimeChart = ({
  overTime,
  height,
  name,
  dataKey,
  unit,
  formatValue,
  benchmarks,
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
          cursor={styles.lineHoverCursor}
          content={({ payload }) => (
            <ChartTooltip
              payload={payload}
              title={getFullLabel(payload)}
              customStyle={styles.tooltipContent}
              formatValue={value => `${formatValue(value)}${unit}`}
              benchmarks={benchmarks}
            />
          )}
        />
        <ReferenceLine
          y={benchmarks.typical}
          stroke={gdevelopTheme.chart.typicalGameColor}
          strokeWidth={2}
          strokeDasharray={typicalDashArray}
          ifOverflow="extendDomain"
        />
        <ReferenceLine
          y={benchmarks.top}
          stroke={gdevelopTheme.chart.topGamesColor}
          strokeWidth={2}
          ifOverflow="extendDomain"
        />
        <RechartsLine
          name={name}
          type="monotone"
          dataKey={dataKey}
          stroke={gdevelopTheme.chart.dataColor1}
          strokeWidth={2}
          dot={styles.chartLineDot}
          animationDuration={animationDuration}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

type BenchmarkedOverTimeChartProps = {|
  ...OverTimeChartProps,
  benchmarks: GameMetricsBenchmarks,
|};

export const BounceRateChart = ({
  benchmarks,
  ...props
}: BenchmarkedOverTimeChartProps): React.Node => (
  <RateOverTimeChart
    {...props}
    name={props.i18n._(t`Left in the first minute`)}
    dataKey="bounceRatePercent"
    benchmarks={benchmarks.bounceRatePercent}
    unit="%"
    formatValue={value => `${Math.round(value)}`}
  />
);

export const PlayedDurationChart = ({
  benchmarks,
  ...props
}: BenchmarkedOverTimeChartProps): React.Node => (
  <RateOverTimeChart
    {...props}
    name={props.i18n._(t`Average play time`)}
    dataKey="playedDurationPerPlayerInMinutes"
    benchmarks={benchmarks.playedDurationPerPlayerInMinutes}
    unit={` ${props.i18n._(t`min`)}`}
    formatValue={formatMinutes}
  />
);

type PercentBarsChartProps = {|
  data: Array<{|
    label: string,
    percent: number,
    typicalPercent?: number,
    topPercent?: number,
  |}>,
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
    <>
      <ResponsiveContainer width={chartWidth} height={height} debounce={1}>
        <ComposedChart data={data} margin={chartMargins}>
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
            cursor={styles.hoverCursor}
            content={({ payload }) => {
              const point =
                payload && payload.length > 0 ? payload[0].payload : null;
              return (
                <ChartTooltip
                  payload={payload ? payload.slice(0, 1) : null}
                  title={point ? point.label : null}
                  customStyle={styles.tooltipContent}
                  formatValue={formatPercent}
                  benchmarks={
                    point && point.typicalPercent !== undefined
                      ? { typical: point.typicalPercent, top: point.topPercent }
                      : null
                  }
                />
              );
            }}
          />
          <Bar
            name={name}
            dataKey="percent"
            fill={gdevelopTheme.chart.dataColor1}
            radius={barRadius}
            animationDuration={animationDuration}
          >
            <LabelList
              dataKey="percent"
              position="top"
              formatter={formatPercent}
              style={styles.barLabel}
            />
          </Bar>
          {/* Not drawn: they keep the markers inside the axis. */}
          <RechartsLine
            dataKey="typicalPercent"
            stroke="none"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <RechartsLine
            dataKey="topPercent"
            stroke="none"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Customized
            component={({ xAxisMap, yAxisMap }) => {
              const xScale = xAxisMap[0].scale;
              const yScale = yAxisMap[0].scale;
              const bandWidth = xScale.bandwidth();
              return (
                <>
                  {data.map(point =>
                    point.typicalPercent !== undefined ? (
                      <line
                        key={point.label}
                        x1={xScale(point.label) + bandWidth * 0.1}
                        x2={xScale(point.label) + bandWidth * 0.9}
                        y1={yScale(point.typicalPercent)}
                        y2={yScale(point.typicalPercent)}
                        stroke={gdevelopTheme.chart.typicalGameColor}
                        strokeWidth={2}
                        strokeDasharray={typicalDashArray}
                      />
                    ) : null
                  )}
                  {data.map(point =>
                    point.topPercent !== undefined ? (
                      <line
                        key={point.label}
                        x1={xScale(point.label) + bandWidth * 0.1}
                        x2={xScale(point.label) + bandWidth * 0.9}
                        y1={yScale(point.topPercent)}
                        y2={yScale(point.topPercent)}
                        stroke={gdevelopTheme.chart.topGamesColor}
                        strokeWidth={2}
                      />
                    ) : null
                  )}
                </>
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

export const RetentionChart = ({
  i18n,
  retentionDays,
  benchmarks,
  height,
}: {|
  i18n: I18nType,
  retentionDays: Array<GameAnalyticsRetentionDay>,
  benchmarks: GameMetricsBenchmarks,
  height: number,
|}): React.Node => (
  <PercentBarsChart
    name={i18n._(t`New players who came back`)}
    height={height}
    data={retentionDays.map(({ dayNumber, retentionPercent }) => ({
      label: i18n._(t`Day ${dayNumber}`),
      percent: retentionPercent,
      typicalPercent: benchmarks.retentionPercents.typical[dayNumber - 1],
      topPercent: benchmarks.retentionPercents.top[dayNumber - 1],
    }))}
  />
);

export const PlayedDurationStepsChart = ({
  i18n,
  playedDurationSteps,
  benchmarks,
  height,
}: {|
  i18n: I18nType,
  playedDurationSteps: Array<GameAnalyticsPlayedDurationStep>,
  benchmarks: GameMetricsBenchmarks,
  height: number,
|}): React.Node => (
  <PercentBarsChart
    name={i18n._(t`Players still playing`)}
    height={height}
    data={playedDurationSteps.map(
      ({ durationInMinutes, playersPercent }, index) => ({
        label:
          durationInMinutes === 0
            ? i18n._(t`Start`)
            : i18n._(t`${durationInMinutes} min`),
        percent: playersPercent,
        typicalPercent:
          benchmarks.playersStillPlayingPercents.typical[index - 1],
        topPercent: benchmarks.playersStillPlayingPercents.top[index - 1],
      })
    )}
  />
);

export const PlayerDevicesChart = ({
  i18n,
  playerPlatforms,
  height,
}: {|
  i18n: I18nType,
  playerPlatforms: GameAnalyticsPlayerPlatforms,
  height: number,
|}): React.Node => (
  <PercentBarsChart
    name={i18n._(t`Players`)}
    height={height}
    data={[
      {
        label: i18n._(t`Touch screen`),
        percent: playerPlatforms.touchPlayersPercent,
      },
      {
        label: i18n._(t`No touch screen`),
        percent: 100 - playerPlatforms.touchPlayersPercent,
      },
    ]}
  />
);
