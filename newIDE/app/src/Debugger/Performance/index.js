// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Background from '../../UI/Background';
import ScrollView from '../../UI/ScrollView';
import EmptyMessage from '../../UI/EmptyMessage';
import Text from '../../UI/Text';
import { type DebuggerId } from '../../ExportAndShare/PreviewLauncher.flow';
import {
  ProfilerRecordingStore,
  useProfilerRecording,
  type ProfilerRecording,
  type ProfilerRecordingRange,
} from '../ProfilerRecording/ProfilerRecordingStore';
import {
  formatGameTime,
  formatMilliseconds,
  getFrameStats,
  getFramesInRange,
  getRecordingTimeBounds,
  getSamplesInRange,
  getTimelineMarkers,
  extendSamplesToStarts,
  getShownRange,
} from '../ProfilerRecording/ProfilerRecordingAggregation';
import StartRecordingPlaceholder from '../StartRecordingPlaceholder';
import SmallCircledInfo from '../../UI/CustomSvgIcons/SmallCircledInfo';
import { tooltipEnterDelay } from '../../UI/Tooltip';
import { formatBytes } from '../Resources/ResourcesDebugTypes';
import PerformanceChart from './PerformanceChart';
import profilerClasses from '../Profiler/Profiler.module.css';

/**
 * Round to at most one decimal, without trailing ".0" on whole numbers.
 */
const formatNumber = (value: number): string =>
  Number.isFinite(value) ? (Math.round(value * 10) / 10).toLocaleString() : '-';

/**
 * How a number moved against the reference. `null` when one of the two sides
 * was not measured: `usedJSHeapBytes` is absent outside of Chromium, and an
 * empty cell says that, where a zero would claim they are equal.
 */
const getComparisonNode = (
  value: ?number,
  baselineValue: ?number,
  format: number => string,
  isLowerBetter: boolean = true
): React.Node => {
  if (value == null || baselineValue == null || baselineValue === 0) {
    return null;
  }
  const deltaValue = value - baselineValue;
  const deltaPercent = (deltaValue / baselineValue) * 100;
  const sign = deltaValue > 0 ? '+' : '';
  const formattedDelta = `${sign}${format(Math.abs(deltaValue))}`;
  const formattedPercent = `${sign}${deltaPercent.toFixed(0)}%`;
  const isBetter = isLowerBetter ? deltaValue < 0 : deltaValue > 0;
  // Two whole sentences rather than an injected word: a translator needs the
  // sentence, not a blank to fill.
  return isBetter ? (
    <Trans>
      {formattedDelta} ({formattedPercent}) better than the reference
    </Trans>
  ) : (
    <Trans>
      {formattedDelta} ({formattedPercent}) worse than the reference
    </Trans>
  );
};

type Stat = {|
  label: React.Node,
  value: React.Node,
  /** Shown under the value when there is something worth saying. */
  note?: React.Node,
  /**
   * What the number means and what to do about it: shown by the info icon of
   * the card. Every card has one - a number nobody can act on is noise.
   */
  help: React.Node,
  /** Set when clicking the card shows what it talks about in the profiler. */
  onClick?: () => void,
  /** How this number moved against the reference, when one is pinned. */
  comparison?: React.Node,
|};

/** Room kept around the slowest frame when it is selected in the profiler. */
const SLOWEST_FRAME_MARGIN_MS = 250;

/**
 * The high level numbers of a recording, as cards for the summary: the
 * frames of the selection, and what the engine measured over the whole run.
 * Every card is always there, with a dash for what is not measured yet: the
 * cards then never move while the recording goes on.
 */
const getStats = (
  recording: ProfilerRecording,
  onSelectRange: (range: ?ProfilerRecordingRange) => void,
  baselineRecording: ?ProfilerRecording
): Array<Stat> => {
  const shownRange = getShownRange(recording);
  const frames = getFramesInRange(recording.frames, shownRange);
  const frameStats = getFrameStats(frames);
  const samples = getSamplesInRange(recording.samples, shownRange);
  // The reference is taken over its whole run: a range selected on this
  // recording means nothing in one taken weeks earlier.
  const baselineFrameStats = baselineRecording
    ? getFrameStats(baselineRecording.frames)
    : null;
  const baselineSamples = baselineRecording ? baselineRecording.samples : [];
  const getLastSampleValue = (
    sampleList: Array<ProfilerPerformanceSample>,
    read: ProfilerPerformanceSample => ?number
  ): ?number => {
    for (let index = sampleList.length - 1; index >= 0; index--) {
      const value = read(sampleList[index]);
      if (value != null) return value;
    }
    return null;
  };
  const stats: Array<Stat> = [];
  // Named in lower case: the identifier of a message is the sentence itself.
  const renderedObjectsLabel = formatNumber(
    getLastSampleValue(samples, sample => sample.renderedObjectsCount) || 0
  );

  stats.push({
    label: <Trans>Frames</Trans>,
    value: formatNumber(frameStats.framesCount),
    note: recording.selectedRange ? (
      <Trans>in the selection</Trans>
    ) : (
      <Trans>in the recording</Trans>
    ),
    help: (
      <Trans>
        How many frames the numbers below are computed on. Select a range on the
        charts above to narrow every card down to that moment of the game.
      </Trans>
    ),
  });
  const hasFrames = frameStats.averageMs > 0;
  // Named in lower case: the identifier of a message is the sentence itself,
  // so an interpolated value must read well inside it.
  const framesPerSecond = formatNumber(frameStats.fps);
  stats.push({
    label: <Trans>Average frame</Trans>,
    value: hasFrames ? formatMilliseconds(frameStats.averageMs) : '-',
    note: hasFrames ? <Trans>{framesPerSecond} fps at this pace</Trans> : null,
    help: (
      <Trans>
        The time the game spends building one frame, on average. To run at 60
        frames per second, a frame must be built in less than 16.7 ms: above
        that, the game cannot keep up and the player sees it stutter. The
        profiler, on the left, shows where that time goes.
      </Trans>
    ),
    comparison: getComparisonNode(
      hasFrames ? frameStats.averageMs : null,
      baselineFrameStats && baselineFrameStats.averageMs
        ? baselineFrameStats.averageMs
        : null,
      formatMilliseconds
    ),
  });
  const hasSlowestFrame = hasFrames && frameStats.maxMs > 0;
  const slowestFrameTime = formatGameTime(frameStats.slowestFrameStartTimeMs);
  const slowFramesCount = formatNumber(frameStats.slowFramesCount);
  stats.push({
    label: <Trans>Slowest frame</Trans>,
    value: hasFrames ? formatMilliseconds(frameStats.maxMs) : '-',
    note: hasSlowestFrame ? (
      <Trans>
        at {slowestFrameTime}, {slowFramesCount} frames over 16.7 ms
      </Trans>
    ) : null,
    help: (
      <Trans>
        The single worst frame of the selection, and when it happened since the
        game started. Click this card to select that moment in the profiler and
        see which sections took the time. The first frames of a scene are often
        the worst ones: what the events do at the beginning of the scene can
        usually be spread over the next frames instead.
      </Trans>
    ),
    comparison: getComparisonNode(
      hasSlowestFrame ? frameStats.maxMs : null,
      baselineFrameStats && baselineFrameStats.maxMs
        ? baselineFrameStats.maxMs
        : null,
      formatMilliseconds
    ),
    onClick: hasSlowestFrame
      ? () =>
          onSelectRange({
            // A little room around the frame, so the flame chart shows it with
            // the frames it is worth comparing to.
            fromMs:
              frameStats.slowestFrameStartTimeMs - SLOWEST_FRAME_MARGIN_MS,
            toMs:
              frameStats.slowestFrameStartTimeMs +
              frameStats.maxMs +
              SLOWEST_FRAME_MARGIN_MS,
          })
      : undefined,
  });

  const lastSampleWithHeap = [...samples]
    .reverse()
    .find(sample => sample.usedJSHeapBytes != null);
  const peakHeap = samples.reduce(
    (peak, sample) => Math.max(peak, sample.usedJSHeapBytes || 0),
    0
  );
  const peakHeapValue = peakHeap ? formatBytes(peakHeap) : '-';
  stats.push({
    label: <Trans>Memory (JavaScript heap)</Trans>,
    value:
      lastSampleWithHeap && lastSampleWithHeap.usedJSHeapBytes != null
        ? formatBytes(lastSampleWithHeap.usedJSHeapBytes)
        : '-',
    note: <Trans>peak {peakHeapValue}</Trans>,
    help: (
      <Trans>
        The memory held by the game itself: objects, variables, sounds, and
        everything the events create. A number that keeps climbing while the
        game is played, and never goes back down, is the sign of objects that
        are created but never deleted.
      </Trans>
    ),
    comparison: getComparisonNode(
      lastSampleWithHeap ? lastSampleWithHeap.usedJSHeapBytes : null,
      getLastSampleValue(baselineSamples, sample => sample.usedJSHeapBytes),
      formatBytes
    ),
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
    help: (
      <Trans>
        What the loaded images take on the graphics card. This is what makes a
        game fail to start on a low end phone: if it grows too much, use smaller
        images, or unload the scenes that are not played anymore.
      </Trans>
    ),
    comparison: getComparisonNode(
      lastSampleWithGpu ? lastSampleWithGpu.estimatedGpuMemoryBytes : null,
      getLastSampleValue(
        baselineSamples,
        sample => sample.estimatedGpuMemoryBytes
      ),
      formatBytes
    ),
  });

  // Sent by the engine when the recording stops. The counters below prefer
  // the samples, which arrive while the game runs: reading only the summary
  // left every card on a dash for the whole recording, and forever on a game
  // that renders no 3D at all.
  const legacyStats = recording.legacyOutput
    ? recording.legacyOutput.stats
    : null;
  const formatLegacyNumber = (value: ?number): string =>
    value != null ? formatNumber(value) : '-';
  /** The average of a counter over the samples that carry it. */
  const getSampledAverage = (
    sampleList: Array<ProfilerPerformanceSample>,
    read: ProfilerPerformanceSample => ?number
  ): ?number => {
    let sum = 0;
    let count = 0;
    for (const sample of sampleList) {
      const value = read(sample);
      if (value != null) {
        sum += value;
        count++;
      }
    }
    return count ? sum / count : null;
  };

  const drawCalls3D =
    getSampledAverage(samples, sample => sample.drawCalls3DPerFrame) ??
    (legacyStats ? legacyStats.averageDrawCallsCount : null);
  stats.push({
    label: <Trans>3D draw calls</Trans>,
    value: formatLegacyNumber(drawCalls3D),
    note: <Trans>per frame, on average over the selection</Trans>,
    help: (
      <Trans>
        How many times per frame the game asks the graphics card to draw
        something in 3D. Each call costs, so a few hundred is usually fine and a
        few thousand is not: materials shared between objects, and fewer
        distinct models, bring this number down.
      </Trans>
    ),
    comparison: getComparisonNode(
      drawCalls3D,
      getSampledAverage(baselineSamples, sample => sample.drawCalls3DPerFrame),
      value => formatNumber(value)
    ),
  });
  const drawCalls2D = getSampledAverage(
    samples,
    sample => sample.drawCalls2DPerFrame
  );
  stats.push({
    label: <Trans>2D draw calls</Trans>,
    value: formatLegacyNumber(drawCalls2D),
    note: <Trans>per frame, on average over the selection</Trans>,
    help: (
      <Trans>
        How many times per frame the game asks the graphics card to draw
        something in 2D. This is what batching reduces: sprites sharing one
        atlas and one blend mode are drawn together, sprites that do not each
        cost a call of their own. Alternating between two atlases, or changing
        the blend mode of one object, breaks a batch in two.
      </Trans>
    ),
    comparison: getComparisonNode(
      drawCalls2D,
      getSampledAverage(baselineSamples, sample => sample.drawCalls2DPerFrame),
      value => formatNumber(value)
    ),
  });
  const triangles3D =
    getSampledAverage(samples, sample => sample.triangles3DPerFrame) ??
    (legacyStats ? legacyStats.averageTrianglesCount : null);
  stats.push({
    label: <Trans>3D triangles</Trans>,
    value: formatLegacyNumber(triangles3D),
    note: <Trans>per frame, on average over the selection</Trans>,
    help: (
      <Trans>
        How much geometry is drawn each frame. Unless it reaches millions, it is
        rarely what slows a game down: look at the draw calls first.
      </Trans>
    ),
    comparison: getComparisonNode(
      triangles3D,
      getSampledAverage(baselineSamples, sample => sample.triangles3DPerFrame),
      value => formatNumber(value)
    ),
  });
  const managedTextures = getLastSampleValue(
    samples,
    sample => sample.managedTexturesCount
  );
  const renderedObjects = getLastSampleValue(
    samples,
    sample => sample.renderedObjectsCount
  );
  stats.push({
    label: <Trans>Textures held by the 2D renderer</Trans>,
    value: formatLegacyNumber(managedTextures),
    note:
      renderedObjects != null ? (
        <Trans>for {renderedObjectsLabel} objects rendered</Trans>
      ) : null,
    help: (
      <Trans>
        How many distinct textures the 2D renderer is holding. Many more
        textures than objects rendered is the signature of a missing atlas: each
        image of its own forces the renderer to start a new batch, and the draw
        calls above climb with it.
      </Trans>
    ),
    comparison: getComparisonNode(
      managedTextures,
      getLastSampleValue(
        baselineSamples,
        sample => sample.managedTexturesCount
      ),
      value => formatNumber(value)
    ),
  });
  const rendered2DLayers = getLastSampleValue(
    samples,
    sample => sample.rendered2DLayersCount
  );
  const rendered3DLayers = getLastSampleValue(
    samples,
    sample => sample.rendered3DLayersCount
  );
  stats.push({
    label: <Trans>Layers rendered (2D / 3D)</Trans>,
    value: `${formatLegacyNumber(rendered2DLayers)} / ${formatLegacyNumber(
      rendered3DLayers
    )}`,
    note: <Trans>on the last frame measured</Trans>,
    help: (
      <Trans>
        How many layers each renderer drew on the last frame. Every switch
        between the 2D and the 3D renderer costs a reset of the graphics state:
        the profiler, on the left, shows it as the "state resets" section.
        Grouping the objects so that the two renderers alternate less often
        makes that section shrink.
      </Trans>
    ),
  });
  stats.push({
    label: <Trans>3D geometries / textures</Trans>,
    value: `${formatLegacyNumber(
      legacyStats ? legacyStats.geometriesCount : null
    )} / ${formatLegacyNumber(legacyStats ? legacyStats.texturesCount : null)}`,
    note: <Trans>held by the renderer</Trans>,
    help: (
      <Trans>
        What the renderer keeps in memory for the 3D of the game. If it only
        grows as the game is played, something is loaded again and again instead
        of being reused.
      </Trans>
    ),
  });
  stats.push({
    label: <Trans>Shader programs</Trans>,
    value: formatLegacyNumber(
      legacyStats ? legacyStats.shaderProgramsCount : null
    ),
    help: (
      <Trans>
        The programs the graphics card runs to draw the game. Their number
        itself is harmless: what costs is compiling them, which is the card
        below.
      </Trans>
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
        <>
          <Trans>on</Trans>{' '}
          {formatNumber(
            (legacyStats && legacyStats.framesWithShaderCompilationCount) || 0
          )}{' '}
          <Trans>dropped frame(s) - see the console for what differed</Trans>
        </>
      ) : (
        <Trans>none, so no frame was spent compiling</Trans>
      ),
    help: (
      <Trans>
        Compiling a shader freezes the game for a moment. It should happen while
        the scene loads, not in the middle of the action: if it does, show the
        objects and effects concerned once at the start of the scene.
      </Trans>
    ),
  });

  return stats;
};

type Props = {|
  recordingStore: ProfilerRecordingStore,
  /** The recording this one is compared to, when one was pinned. */
  baselineRecording?: ?ProfilerRecording,
  canRecord: boolean,
  onStartRecording: () => void,
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
  canRecord,
  onStartRecording,
  baselineRecording,
}: Props): React.Node => {
  const recording = useProfilerRecording(recordingStore, debuggerId);
  // The store appends to the recording in place: what changed is told by
  // these counters, which the memos below depend on.
  const framesCount = recording ? recording.frames.length : 0;
  const samplesCount = recording ? recording.samples.length : 0;
  const startsCount = recording ? recording.startsAtGameTimeMs.length : 0;
  const selectedRange = recording ? recording.selectedRange : null;
  const legacyOutput = recording ? recording.legacyOutput : null;
  const onSelectRange = React.useCallback(
    (range: ?ProfilerRecordingRange) =>
      recordingStore.setSelectedRange(debuggerId, range),
    [recordingStore, debuggerId]
  );
  const stats = React.useMemo(
    () =>
      recording ? getStats(recording, onSelectRange, baselineRecording) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      recording,
      framesCount,
      samplesCount,
      selectedRange,
      legacyOutput,
      onSelectRange,
      baselineRecording,
    ]
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
    return profilingInProgress ? (
      <Background>
        <EmptyMessage>
          <Trans>Recording: the measures appear in a moment.</Trans>
        </EmptyMessage>
      </Background>
    ) : (
      <StartRecordingPlaceholder
        description={
          <Trans>
            Record with the profiler to see the frames per second and the memory
            used over time.
          </Trans>
        }
        canRecord={canRecord}
        onStartRecording={onStartRecording}
      />
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
                onSelectRange={onSelectRange}
                markers={markers}
                memoryLimitBytes={memoryLimitBytes}
                baselineSamples={
                  baselineRecording ? baselineRecording.samples : null
                }
              />
            </div>
          )}
          <div className={profilerClasses.section}>
            <Text noMargin size="body-small" color="secondary">
              <Trans>Summary</Trans>
            </Text>
            <div className={profilerClasses.statsGrid}>
              {stats.map((stat, index) => (
                <div
                  className={profilerClasses.statCard}
                  key={index}
                  onClick={stat.onClick}
                  style={stat.onClick ? { cursor: 'pointer' } : undefined}
                >
                  <div className={profilerClasses.statCardHeader}>
                    <Text noMargin size="body-small" color="secondary">
                      {stat.label}
                    </Text>
                    {/* What the number means, and what to do about it: the
                        summary is useless to whoever cannot read it. */}
                    <Tooltip
                      title={stat.help}
                      placement="bottom"
                      enterDelay={tooltipEnterDelay}
                    >
                      <span className={profilerClasses.statCardHelp}>
                        <SmallCircledInfo fontSize="small" />
                      </span>
                    </Tooltip>
                  </div>
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
                  {stat.comparison && (
                    <Text noMargin size="body-small" color="secondary">
                      {stat.comparison}
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
