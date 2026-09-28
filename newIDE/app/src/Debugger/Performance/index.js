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
  type ProfilerRecordingRange,
} from '../ProfilerRecording/ProfilerRecordingStore';
import {
  getRecordingTimeBounds,
  getTimelineMarkers,
  extendSamplesToStarts,
} from '../ProfilerRecording/ProfilerRecordingAggregation';
import { getRecordingStats } from '../ProfilerRecording/ProfilerRecordingStats';
import StartRecordingPlaceholder from '../StartRecordingPlaceholder';
import StatCard from '../../UI/StatCard';
import { ColumnStackLayout } from '../../UI/Layout';
import PerformanceChart from './PerformanceChart';
import classes from './Performance.module.css';

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
      recording
        ? getRecordingStats(recording, onSelectRange, baselineRecording)
        : [],
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
        <div className={classes.content}>
          {/* The charts first: their height never changes, while the cards of
              the summary appear and grow as the recording goes on. */}
          {samples.length > 1 && (
            <ColumnStackLayout noMargin noOverflowParent>
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
            </ColumnStackLayout>
          )}
          <ColumnStackLayout noMargin noOverflowParent>
            <Text noMargin size="body-small" color="secondary">
              <Trans>Summary</Trans>
            </Text>
            <div className={classes.statsGrid}>
              {stats.map(stat => (
                // What the number means, and what to do about it (the help):
                // the summary is useless to whoever cannot read it.
                <StatCard
                  key={stat.id}
                  label={stat.label}
                  value={stat.value}
                  notes={[stat.note, stat.comparison]}
                  help={stat.help}
                  onClick={stat.onClick}
                />
              ))}
            </div>
          </ColumnStackLayout>
        </div>
      </ScrollView>
    </Background>
  );
};

export default Performance;
