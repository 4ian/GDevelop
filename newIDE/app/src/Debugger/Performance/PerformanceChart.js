// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import type { I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Brush,
} from 'recharts';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Text from '../../UI/Text';
import Paper from '../../UI/Paper';
import {
  type ProfilerPerformanceSample,
  type ProfilerRecordingRange,
} from '../ProfilerRecording/ProfilerRecordingStore';
import { formatGameTime } from '../ProfilerRecording/ProfilerRecordingAggregation';
import { formatBytes } from '../Resources/ResourcesDebugTypes';
import classes from './Performance.module.css';

// There is a known bug with recharts that causes the chart to not render if
// the width is 100% in a flexbox component.
// See https://github.com/recharts/recharts/issues/172
const chartWidth = '99%';
const chartMargins = { top: 6, bottom: 4, right: 16, left: 0 };
const CHART_HEIGHT = 110;

type Props = {|
  samples: Array<ProfilerPerformanceSample>,
  bounds: ProfilerRecordingRange,
  selectedRange: ?ProfilerRecordingRange,
  onSelectRange: (range: ?ProfilerRecordingRange) => void,
  sceneChanges: Array<{| atMs: number, sceneName: string |}>,
  /** Drawn as a dashed line on the memory chart, like the limit of an offer. */
  memoryLimitBytes: ?number,
|};

type Series = {|
  key: 'fps' | 'usedJSHeapBytes' | 'estimatedGpuMemoryBytes',
  title: React.Node,
  format: number => string,
  /** A line worth marking on the chart (60 fps, the heap limit...). */
  referenceValue: ?number,
|};

const PerformanceTooltip = ({
  payload,
  label,
  format,
}: {|
  payload: ?Array<any>,
  label: number,
  format: number => string,
|}) =>
  payload && payload.length > 0 && payload[0].value != null ? (
    <Paper background="light" style={{ padding: '6px 10px' }}>
      <Text noMargin size="body-small" color="secondary">
        {formatGameTime(label)}
      </Text>
      <Text noMargin size="body-small">
        {format(payload[0].value)}
      </Text>
    </Paper>
  ) : null;

/**
 * The counters sampled while recording, one small chart per measure (they
 * have nothing in common but time, so they never share an axis). Drag on the
 * brush of the last chart to select a range.
 */
const PerformanceChart = ({
  samples,
  bounds,
  selectedRange,
  onSelectRange,
  sceneChanges,
  memoryLimitBytes,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const tickStyle = {
    fontFamily: gdevelopTheme.chart.fontFamily,
    fontSize: 11,
    fill: gdevelopTheme.chart.textColor,
  };

  const hasHeap = samples.some(sample => sample.usedJSHeapBytes != null);
  const hasGpu = samples.some(sample => sample.estimatedGpuMemoryBytes != null);
  let heapLimit: ?number = null;
  for (const sample of samples) {
    if (sample.jsHeapSizeLimitBytes != null) {
      heapLimit = sample.jsHeapSizeLimitBytes;
    }
  }

  const series: Array<Series> = [
    {
      key: 'fps',
      title: t`Frames per second`,
      format: value => `${Math.round(value)} fps`,
      referenceValue: 60,
    },
  ];
  if (hasHeap) {
    series.push({
      key: 'usedJSHeapBytes',
      title: t`Memory used by the game (JavaScript heap)`,
      format: value => formatBytes(value),
      referenceValue: null,
    });
  }
  if (hasGpu) {
    series.push({
      key: 'estimatedGpuMemoryBytes',
      title: t`Estimated GPU memory used by textures`,
      format: value => formatBytes(value),
      referenceValue: null,
    });
  }

  const onBrushChange = (brush: { startIndex?: number, endIndex?: number }) => {
    if (brush.startIndex == null || brush.endIndex == null) return;
    const firstSample = samples[brush.startIndex];
    const lastSample = samples[brush.endIndex];
    if (!firstSample || !lastSample) return;
    if (brush.startIndex === 0 && brush.endIndex === samples.length - 1) {
      onSelectRange(null);
      return;
    }
    onSelectRange({
      fromMs: firstSample.atGameTimeMs,
      toMs: lastSample.atGameTimeMs,
    });
  };

  return (
    <I18n>
      {({ i18n }: {| i18n: I18nType |}) => (
        <div className={classes.charts}>
          {series.map((oneSeries, index) => {
            const isLast = index === series.length - 1;
            return (
              <div className={classes.chart} key={oneSeries.key}>
                <Text noMargin size="body-small" color="secondary">
                  {i18n._(oneSeries.title)}
                </Text>
                <ResponsiveContainer
                  width={chartWidth}
                  height={CHART_HEIGHT + (isLast ? 40 : 0)}
                >
                  <AreaChart
                    data={samples}
                    margin={chartMargins}
                    syncId="debugger-performance"
                  >
                    <CartesianGrid
                      stroke={gdevelopTheme.chart.gridColor}
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="atGameTimeMs"
                      type="number"
                      domain={[bounds.fromMs, bounds.toMs]}
                      tickFormatter={formatGameTime}
                      tick={tickStyle}
                      stroke={gdevelopTheme.chart.gridColor}
                      hide={!isLast}
                      height={isLast ? 20 : 0}
                    />
                    <YAxis
                      tickFormatter={oneSeries.format}
                      tick={tickStyle}
                      stroke={gdevelopTheme.chart.gridColor}
                      width={64}
                      domain={
                        oneSeries.key === 'fps'
                          ? [0, (dataMax: number) => Math.max(65, dataMax)]
                          : [
                              0,
                              (dataMax: number) =>
                                // Keep the limit in view, with some room above.
                                Math.max(
                                  dataMax * 1.1,
                                  memoryLimitBytes != null &&
                                    oneSeries.key === 'usedJSHeapBytes'
                                    ? memoryLimitBytes * 1.15
                                    : 0
                                ),
                            ]
                      }
                    />
                    <Tooltip
                      content={props => (
                        <PerformanceTooltip
                          payload={props.payload}
                          label={props.label}
                          format={oneSeries.format}
                        />
                      )}
                    />
                    {oneSeries.referenceValue != null && (
                      <ReferenceLine
                        y={oneSeries.referenceValue}
                        stroke={gdevelopTheme.chart.textColor}
                        strokeDasharray="4 4"
                      />
                    )}
                    {oneSeries.key === 'usedJSHeapBytes' &&
                      memoryLimitBytes != null && (
                        <ReferenceLine
                          y={memoryLimitBytes}
                          stroke={gdevelopTheme.statusIndicator.error}
                          strokeDasharray="6 4"
                          strokeWidth={1.5}
                          label={{
                            value: i18n._(t`Memory limit`),
                            fill: gdevelopTheme.statusIndicator.error,
                            fontSize: 11,
                            position: 'insideTopLeft',
                          }}
                        />
                      )}
                    {oneSeries.key === 'usedJSHeapBytes' && heapLimit != null && (
                      <ReferenceLine
                        y={heapLimit}
                        stroke={gdevelopTheme.statusIndicator.error}
                        strokeDasharray="4 4"
                        label={{
                          value: i18n._(t`Heap limit`),
                          fill: gdevelopTheme.chart.textColor,
                          fontSize: 10,
                          position: 'insideTopRight',
                        }}
                      />
                    )}
                    {sceneChanges.map(sceneChange => (
                      <ReferenceLine
                        key={sceneChange.atMs}
                        x={sceneChange.atMs}
                        stroke={gdevelopTheme.chart.gridColor}
                        label={
                          index === 0
                            ? {
                                value: sceneChange.sceneName,
                                fill: gdevelopTheme.chart.textColor,
                                fontSize: 10,
                                position: 'insideTopLeft',
                              }
                            : undefined
                        }
                      />
                    ))}
                    {selectedRange && (
                      <ReferenceArea
                        x1={selectedRange.fromMs}
                        x2={selectedRange.toMs}
                        fill={gdevelopTheme.chart.dataColor1}
                        fillOpacity={0.12}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey={oneSeries.key}
                      stroke={gdevelopTheme.chart.dataColor1}
                      fill={gdevelopTheme.chart.dataColor1}
                      fillOpacity={0.25}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      connectNulls
                    />
                    {isLast && (
                      <Brush
                        dataKey="atGameTimeMs"
                        height={24}
                        tickFormatter={formatGameTime}
                        stroke={gdevelopTheme.chart.gridColor}
                        fill="transparent"
                        travellerWidth={8}
                        onChange={onBrushChange}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}
    </I18n>
  );
};

export default PerformanceChart;
