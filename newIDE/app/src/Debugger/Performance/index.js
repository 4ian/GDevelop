// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Background from '../../UI/Background';
import ScrollView from '../../UI/ScrollView';
import EmptyMessage from '../../UI/EmptyMessage';
import Text from '../../UI/Text';
import { type DebuggerId } from '../../ExportAndShare/PreviewLauncher.flow';
import {
  ProfilerRecordingStore,
  useProfilerRecording,
  type ProfilerRecording,
} from '../ProfilerRecording/ProfilerRecordingStore';
import {
  formatMilliseconds,
  getFrameStats,
  getFramesInRange,
  getRecordingTimeBounds,
  getSamplesInRange,
  getTimelineMarkers,
  extendSamplesToStarts,
  getShownRange,
} from '../ProfilerRecording/ProfilerRecordingAggregation';
import { formatBytes } from '../Resources/ResourcesDebugTypes';
import PerformanceChart from './PerformanceChart';
import profilerClasses from '../Profiler/Profiler.module.css';

/**
 * Round to at most one decimal, without trailing ".0" on whole numbers.
 */
const formatNumber = (value: number): string =>
  Number.isFinite(value) ? (Math.round(value * 10) / 10).toLocaleString() : '-';

type Stat = {|
  label: React.Node,
  value: React.Node,
  /** Shown under the value when there is something worth saying. */
  note?: React.Node,
|};

/**
 * The high level numbers of a recording, as cards for the summary: the
 * frames of the selection, and what the engine measured over the whole run.
 * Every card is always there, with a dash for what is not measured yet: the
 * cards then never move while the recording goes on.
 */
const getStats = (recording: ProfilerRecording): Array<Stat> => {
  const shownRange = getShownRange(recording);
  const frames = getFramesInRange(recording.frames, shownRange);
  const frameStats = getFrameStats(frames);
  const samples = getSamplesInRange(recording.samples, shownRange);
  const stats: Array<Stat> = [];

  stats.push({
    label: <Trans>Frames</Trans>,
    value: formatNumber(frameStats.framesCount),
    note: recording.selectedRange ? (
      <Trans>in the selection</Trans>
    ) : (
      <Trans>in the recording</Trans>
    ),
  });
  const hasFrames = frameStats.averageMs > 0;
  stats.push({
    label: <Trans>Average frame</Trans>,
    value: hasFrames ? formatMilliseconds(frameStats.averageMs) : '-',
    note: <Trans>{formatNumber(frameStats.fps)} frames per second</Trans>,
  });
  stats.push({
    label: <Trans>Slowest frame</Trans>,
    value: hasFrames ? formatMilliseconds(frameStats.maxMs) : '-',
    note: (
      <Trans>
        {formatNumber(frameStats.slowFramesCount)} frames above 16.7 ms
      </Trans>
    ),
  });

  const lastSampleWithHeap = [...samples]
    .reverse()
    .find(sample => sample.usedJSHeapBytes != null);
  const peakHeap = samples.reduce(
    (peak, sample) => Math.max(peak, sample.usedJSHeapBytes || 0),
    0
  );
  stats.push({
    label: <Trans>Memory (JavaScript heap)</Trans>,
    value:
      lastSampleWithHeap && lastSampleWithHeap.usedJSHeapBytes != null
        ? formatBytes(lastSampleWithHeap.usedJSHeapBytes)
        : '-',
    note: <Trans>peak {peakHeap ? formatBytes(peakHeap) : '-'}</Trans>,
  });
  const lastSampleWithGpu = [...samples]
    .reverse()
    .find(sample => sample.estimatedGpuMemoryBytes != null);
  stats.push({
    label: <Trans>GPU memory (textures)</Trans>,
    value:
      lastSampleWithGpu && lastSampleWithGpu.estimatedGpuMemoryBytes != null
        ? formatBytes(lastSampleWithGpu.estimatedGpuMemoryBytes)
        : '-',
    note: <Trans>estimated from the loaded textures</Trans>,
  });

  // Sent by the engine when the recording stops.
  const legacyStats = recording.legacyOutput
    ? recording.legacyOutput.stats
    : null;
  const formatLegacyNumber = (value: ?number): string =>
    value != null ? formatNumber(value) : '-';
  stats.push({
    label: <Trans>3D draw calls</Trans>,
    value: formatLegacyNumber(
      legacyStats ? legacyStats.averageDrawCallsCount : null
    ),
    note: <Trans>per frame, on average over the run</Trans>,
  });
  stats.push({
    label: <Trans>3D triangles</Trans>,
    value: formatLegacyNumber(
      legacyStats ? legacyStats.averageTrianglesCount : null
    ),
    note: <Trans>per frame, on average over the run</Trans>,
  });
  stats.push({
    label: <Trans>3D geometries / textures</Trans>,
    value: `${formatLegacyNumber(
      legacyStats ? legacyStats.geometriesCount : null
    )} / ${formatLegacyNumber(legacyStats ? legacyStats.texturesCount : null)}`,
    note: <Trans>held by the renderer</Trans>,
  });
  stats.push({
    label: <Trans>Shader programs</Trans>,
    value: formatLegacyNumber(
      legacyStats ? legacyStats.shaderProgramsCount : null
    ),
  });
  const compilations = legacyStats
    ? legacyStats.shaderProgramCompilationsCount
    : null;
  stats.push({
    label: <Trans>Shaders compiled during the run</Trans>,
    value: formatLegacyNumber(compilations),
    note:
      compilations == null ? (
        <Trans>known when the recording stops</Trans>
      ) : compilations ? (
        <Trans>
          on{' '}
          {formatNumber(
            (legacyStats && legacyStats.framesWithShaderCompilationCount) || 0
          )}{' '}
          dropped frame(s) - see the console for what differed
        </Trans>
      ) : (
        <Trans>none, so no frame was spent compiling</Trans>
      ),
  });

  return stats;
};

type Props = {|
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  profilingInProgress: boolean,
  /** The memory limit (artificial, or of the device), drawn on the memory chart. */
  memoryLimitBytes: ?number,
|};

/**
 * The performance panel: the counters sampled while recording (frames per
 * second, memory) over time, and the summary of the profiler recording.
 */
const Performance = ({
  recordingStore,
  debuggerId,
  profilingInProgress,
  memoryLimitBytes,
}: Props): React.Node => {
  const recording = useProfilerRecording(recordingStore, debuggerId);
  // The store appends to the recording in place: what changed is told by
  // these counters, which the memos below depend on.
  const framesCount = recording ? recording.frames.length : 0;
  const samplesCount = recording ? recording.samples.length : 0;
  const startsCount = recording ? recording.startsAtGameTimeMs.length : 0;
  const selectedRange = recording ? recording.selectedRange : null;
  const legacyOutput = recording ? recording.legacyOutput : null;
  const stats = React.useMemo(
    () => (recording ? getStats(recording) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recording, framesCount, samplesCount, selectedRange, legacyOutput]
  );
  const markers = React.useMemo(
    () => (recording ? getTimelineMarkers(recording) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recording, framesCount, startsCount]
  );
  // The store appends the samples in place: the charts only redraw when they
  // are given a new array, so one is made each time samples arrived. The game
  // samples at the end of each chunk, so the curves are extended back to each
  // start of the recording, otherwise they leave a gap after it.
  const samples = React.useMemo(
    () =>
      recording
        ? extendSamplesToStarts(recording.samples, recording.startsAtGameTimeMs)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recording, samplesCount, startsCount]
  );

  if (!recording || (!recording.frames.length && !recording.samples.length)) {
    return (
      <Background>
        <EmptyMessage>
          {profilingInProgress ? (
            <Trans>Recording: the measures appear in a moment.</Trans>
          ) : (
            <Trans>
              Record with the profiler to see the frames per second and the
              memory used over time.
            </Trans>
          )}
        </EmptyMessage>
      </Background>
    );
  }

  const bounds = getRecordingTimeBounds(recording);

  return (
    <Background>
      <ScrollView autoHideScrollbar>
        <div className={profilerClasses.content}>
          {/* The charts first: their height never changes, while the cards of
              the summary appear and grow as the recording goes on. */}
          {samples.length > 1 && (
            <div className={profilerClasses.section}>
              <Text noMargin size="body-small" color="secondary">
                <Trans>
                  Over the recording (drag the handles of the last chart to
                  select a range in the profiler)
                </Trans>
              </Text>
              <PerformanceChart
                samples={samples}
                bounds={bounds}
                selectedRange={recording.selectedRange}
                onSelectRange={range =>
                  recordingStore.setSelectedRange(debuggerId, range)
                }
                markers={markers}
                memoryLimitBytes={memoryLimitBytes}
              />
            </div>
          )}
          <div className={profilerClasses.section}>
            <Text noMargin size="body-small" color="secondary">
              <Trans>Summary</Trans>
            </Text>
            <div className={profilerClasses.statsGrid}>
              {stats.map((stat, index) => (
                <div className={profilerClasses.statCard} key={index}>
                  <Text noMargin size="body-small" color="secondary">
                    {stat.label}
                  </Text>
                  <Text
                    noMargin
                    size="block-title"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {stat.value}
                  </Text>
                  {stat.note && (
                    <Text noMargin size="body-small" color="secondary">
                      {stat.note}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollView>
    </Background>
  );
};

export default Performance;
