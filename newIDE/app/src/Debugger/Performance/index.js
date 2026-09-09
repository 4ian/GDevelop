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
  getSceneChanges,
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
 * Anything the engine did not measure (an older game, or a game that does
 * not render in 3D) is left out rather than shown as a zero.
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
  if (frameStats.averageMs) {
    stats.push({
      label: <Trans>Average frame</Trans>,
      value: formatMilliseconds(frameStats.averageMs),
      note: <Trans>{formatNumber(frameStats.fps)} frames per second</Trans>,
    });
    stats.push({
      label: <Trans>Slowest frame</Trans>,
      value: formatMilliseconds(frameStats.maxMs),
      note: (
        <Trans>
          {formatNumber(frameStats.slowFramesCount)} frames above 16.7 ms
        </Trans>
      ),
    });
  }

  const lastSampleWithHeap = [...samples]
    .reverse()
    .find(sample => sample.usedJSHeapBytes != null);
  if (lastSampleWithHeap && lastSampleWithHeap.usedJSHeapBytes != null) {
    const peakHeap = samples.reduce(
      (peak, sample) => Math.max(peak, sample.usedJSHeapBytes || 0),
      0
    );
    stats.push({
      label: <Trans>Memory (JavaScript heap)</Trans>,
      value: formatBytes(lastSampleWithHeap.usedJSHeapBytes),
      note: <Trans>peak {formatBytes(peakHeap)}</Trans>,
    });
  }
  const lastSampleWithGpu = [...samples]
    .reverse()
    .find(sample => sample.estimatedGpuMemoryBytes != null);
  if (lastSampleWithGpu && lastSampleWithGpu.estimatedGpuMemoryBytes != null) {
    stats.push({
      label: <Trans>GPU memory (textures)</Trans>,
      value: formatBytes(lastSampleWithGpu.estimatedGpuMemoryBytes),
      note: <Trans>estimated from the loaded textures</Trans>,
    });
  }

  const legacyStats = recording.legacyOutput
    ? recording.legacyOutput.stats
    : null;
  if (legacyStats) {
    if (legacyStats.averageDrawCallsCount != null) {
      stats.push({
        label: <Trans>3D draw calls</Trans>,
        value: formatNumber(legacyStats.averageDrawCallsCount),
        note: <Trans>per frame, on average over the run</Trans>,
      });
    }
    if (legacyStats.averageTrianglesCount != null) {
      stats.push({
        label: <Trans>3D triangles</Trans>,
        value: formatNumber(legacyStats.averageTrianglesCount),
        note: <Trans>per frame, on average over the run</Trans>,
      });
    }
    if (
      legacyStats.geometriesCount != null ||
      legacyStats.texturesCount != null
    ) {
      stats.push({
        label: <Trans>3D geometries / textures</Trans>,
        value: `${formatNumber(
          legacyStats.geometriesCount || 0
        )} / ${formatNumber(legacyStats.texturesCount || 0)}`,
        note: <Trans>held by the renderer</Trans>,
      });
    }
    if (legacyStats.shaderProgramsCount != null) {
      stats.push({
        label: <Trans>Shader programs</Trans>,
        value: formatNumber(legacyStats.shaderProgramsCount),
      });
    }
    if (legacyStats.shaderProgramCompilationsCount != null) {
      const compilations = legacyStats.shaderProgramCompilationsCount;
      stats.push({
        label: <Trans>Shaders compiled during the run</Trans>,
        value: formatNumber(compilations),
        note: compilations ? (
          <Trans>
            on {formatNumber(legacyStats.framesWithShaderCompilationCount || 0)}{' '}
            dropped frame(s) - see the console for what differed
          </Trans>
        ) : (
          <Trans>none, so no frame was spent compiling</Trans>
        ),
      });
    }
  }

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
 * The performance panel: the summary of the profiler recording, and the
 * counters sampled while recording (frames per second, memory) over time.
 */
const Performance = ({
  recordingStore,
  debuggerId,
  profilingInProgress,
  memoryLimitBytes,
}: Props): React.Node => {
  const recording = useProfilerRecording(recordingStore, debuggerId);
  const stats = React.useMemo(() => (recording ? getStats(recording) : []), [
    recording,
    recording && recording.frames.length, // eslint-disable-line react-hooks/exhaustive-deps
    recording && recording.selectedRange, // eslint-disable-line react-hooks/exhaustive-deps
    recording && recording.legacyOutput, // eslint-disable-line react-hooks/exhaustive-deps
  ]);
  const sceneChanges = React.useMemo(
    () => (recording ? getSceneChanges(recording.frames) : []),
    [recording, recording && recording.frames.length] // eslint-disable-line react-hooks/exhaustive-deps
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
          {recording.samples.length > 1 && (
            <div className={profilerClasses.section}>
              <Text noMargin size="body-small" color="secondary">
                <Trans>
                  Over the recording (drag the handles of the last chart to
                  select a range in the profiler)
                </Trans>
              </Text>
              <PerformanceChart
                samples={recording.samples}
                bounds={bounds}
                selectedRange={recording.selectedRange}
                onSelectRange={range =>
                  recordingStore.setSelectedRange(debuggerId, range)
                }
                sceneChanges={sceneChanges}
                memoryLimitBytes={memoryLimitBytes}
              />
            </div>
          )}
        </div>
      </ScrollView>
    </Background>
  );
};

export default Performance;
