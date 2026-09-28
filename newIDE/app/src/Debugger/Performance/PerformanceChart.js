// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import type { I18n as I18nType } from '@lingui/core';
import { type TimelineMarker } from '../ProfilerRecording/ProfilerRecordingAggregation';
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
import { ChartTooltip } from '../../UI/ChartTooltip';
import { chartWidth, getChartsStyleFromTheme } from '../../UI/ChartsStyle';
import {
  type ProfilerPerformanceSample,
  type ProfilerRecordingRange,
} from '../ProfilerRecording/ProfilerRecordingStore';
import { formatGameTime } from '../ProfilerRecording/ProfilerRecordingAggregation';
import classes from './Performance.module.css';
import { formatBytes } from '../../Utils/FormatMeasures';

const chartMargins = { top: 6, bottom: 4, right: 16, left: 0 };
const CHART_HEIGHT = 110;

type Props = {|
  samples: Array<ProfilerPerformanceSample>,
  bounds: ProfilerRecordingRange,
  selectedRange: ?ProfilerRecordingRange,
  onSelectRange: (range: ?ProfilerRecordingRange) => void,
  markers: Array<TimelineMarker>,
  /** Drawn as a dashed line on the memory chart, like the limit of an offer. */
  memoryLimitBytes: ?number,
  /** The samples of the recording pinned as the reference, if any. */
  baselineSamples?: ?Array<ProfilerPerformanceSample>,
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
  title,
}: {|
  payload: ?Array<any>,
  label: number,
  format: number => string,
  title: React.Node,
|}) =>
  payload && payload.length > 0 && payload[0].value != null ? (
    // Each piece on its own line, and each one said in full: the measure, its
    // value with its unit, then when it was measured. Put together, the time
    // and the value read as a single meaningless number.
    <ChartTooltip size="small" title={title}>
      <Text
        noMargin
        size="sub-title"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {format(payload[0].value)}
      </Text>
      <Text noMargin size="body-small" color="secondary">
        <Trans>Time since the game started</Trans>
      </Text>
      <Text
        noMargin
        size="body-small"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatGameTime(label)}
      </Text>
    </ChartTooltip>
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
  markers,
  memoryLimitBytes,
  baselineSamples,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const tickStyle = {
    ...getChartsStyleFromTheme(gdevelopTheme).tickLabel,
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

  // The reference is drawn on the time elapsed since the start of each
  // recording, not on absolute game time: two runs taken weeks apart never
  // start at the same moment of the game, and comparing them on the absolute
  // axis would put them side by side instead of on top of each other.
  const hasBaseline = !!baselineSamples && baselineSamples.length > 0;
  const chartData = React.useMemo(
    () => {
      if (!baselineSamples || baselineSamples.length === 0) return samples;

      const baselineStartMs = baselineSamples[0].atGameTimeMs;
      const retimedBaselinePoints = baselineSamples.map(sample => ({
        atGameTimeMs: bounds.fromMs + (sample.atGameTimeMs - baselineStartMs),
        fpsBaseline: sample.fps,
        usedJSHeapBytesBaseline: sample.usedJSHeapBytes,
        estimatedGpuMemoryBytesBaseline: sample.estimatedGpuMemoryBytes,
      }));
      return [...samples, ...retimedBaselinePoints].sort(
        (first, second) => first.atGameTimeMs - second.atGameTimeMs
      );
    },
    [samples, baselineSamples, bounds.fromMs]
  );

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
    const firstSample = chartData[brush.startIndex];
    const lastSample = chartData[brush.endIndex];
    if (!firstSample || !lastSample) return;
    if (brush.startIndex === 0 && brush.endIndex === chartData.length - 1) {
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
                    data={chartData}
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
                          title={i18n._(oneSeries.title)}
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
                    {markers.map(marker => (
                      <ReferenceLine
                        key={`${marker.kind}-${marker.atMs}`}
                        x={marker.atMs}
                        stroke={
                          marker.kind === 'recordingStart'
                            ? gdevelopTheme.chart.textColor
                            : gdevelopTheme.chart.gridColor
                        }
                        strokeDasharray={
                          marker.kind === 'recordingStart' ? '2 3' : undefined
                        }
                        label={
                          index === 0
                            ? {
                                value:
                                  marker.kind === 'recordingStart'
                                    ? i18n._(t`Record start`)
                                    : marker.label,
                                fill: gdevelopTheme.chart.textColor,
                                fontSize: 10,
                                // Scene names at the top, record starts at
                                // the bottom: they often share the same time.
                                position:
                                  marker.kind === 'recordingStart'
                                    ? 'insideBottomLeft'
                                    : 'insideTopLeft',
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
                    {hasBaseline && (
                      <Area
                        type="monotone"
                        dataKey={`${oneSeries.key}Baseline`}
                        stroke={gdevelopTheme.chart.textColor}
                        strokeDasharray="5 4"
                        fill="none"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                      />
                    )}
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
