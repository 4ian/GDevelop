// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import MeasuresTable from './MeasuresTable';
import FrameStrip from './FrameStrip';
import FlameChart from './FlameChart';
import EmptyMessage from '../../UI/EmptyMessage';
import Background from '../../UI/Background';
import ScrollView from '../../UI/ScrollView';
import Text from '../../UI/Text';
import LinearProgress from '../../UI/LinearProgress';
import { type DebuggerId } from '../../ExportAndShare/PreviewLauncher.flow';
import { type ProfilerMeasuresSection } from '..';
import {
  ProfilerRecordingStore,
  useProfilerRecording,
  type ProfilerRecording,
} from '../ProfilerRecording/ProfilerRecordingStore';
import {
  aggregateFramesToMeasures,
  formatGameTime,
  formatMilliseconds,
  getFrameStats,
  getFramesInRange,
  getRecordingTimeBounds,
  getTimelineMarkers,
  getShownRange,
} from '../ProfilerRecording/ProfilerRecordingAggregation';
import StartRecordingPlaceholder from '../StartRecordingPlaceholder';
import classes from './Profiler.module.css';

/** Above this share of the frame, `render` is worth saying something about. */
const HEAVY_RENDER_SHARE = 0.5;
/** Above this share of the render, one section is what to look at first. */
const DOMINANT_SECTION_SHARE = 0.4;

/**
 * What the measures say to do, when they say something clear. Only the
 * render is covered: it is the section that carries no meaning on its own,
 * every other one being named after the events it runs.
 */
const getRenderAdvice = (measures: ?ProfilerMeasuresSection): React.Node => {
  if (!measures || !measures.time) return null;
  const renderSection = measures.subsections['render'];
  if (!renderSection || !renderSection.time) return null;
  if (renderSection.time < measures.time * HEAVY_RENDER_SHARE) return null;

  let heaviestName = null;
  let heaviestTime = 0;
  for (const name in renderSection.subsections) {
    const subsection = renderSection.subsections[name];
    if (subsection.time > heaviestTime) {
      heaviestTime = subsection.time;
      heaviestName = name;
    }
  }
  const renderPercent = Math.round((renderSection.time / measures.time) * 100);
  if (
    !heaviestName ||
    heaviestTime < renderSection.time * DOMINANT_SECTION_SHARE
  ) {
    return (
      <Trans>
        Rendering takes {renderPercent}% of the frame, spread over its sections:
        fewer objects on screen, or fewer layers, is what brings it down.
      </Trans>
    );
  }
  const heaviestPercent = Math.round((heaviestTime / renderSection.time) * 100);
  const heaviestSectionName = heaviestName;
  return (
    <Trans>
      Rendering takes {renderPercent}% of the frame, and {heaviestPercent}% of
      that goes into "{heaviestSectionName}": that is what to look at first.
    </Trans>
  );
};

type Props = {|
  profilingInProgress: boolean,
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  canRecord: boolean,
  onStartRecording: () => void,
  /** The recording this one is compared to, when one was pinned. */
  baselineRecording?: ?ProfilerRecording,
|};

/**
 * The timeline profiler: record for a while, then explore the frames (the
 * strip), the sections of the selected frames (the flame chart) and their
 * average over the selection (the table).
 */
const Profiler = ({
  profilingInProgress,
  recordingStore,
  debuggerId,
  canRecord,
  onStartRecording,
  baselineRecording,
}: Props): React.Node => {
  const recording = useProfilerRecording(recordingStore, debuggerId);
  // The store appends to the recording in place: what changed is told by
  // these counters, which the memos below depend on.
  const framesCount = recording ? recording.frames.length : 0;
  const startsCount = recording ? recording.startsAtGameTimeMs.length : 0;

  const bounds = recording ? getRecordingTimeBounds(recording) : null;
  const shownRange = recording ? getShownRange(recording) : null;
  const framesInRange = React.useMemo(
    () =>
      recording && shownRange
        ? getFramesInRange(recording.frames, shownRange)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recording, shownRange, framesCount]
  );
  const measures = React.useMemo(
    () =>
      recording
        ? aggregateFramesToMeasures(recording.names, framesInRange)
        : null,
    [recording, framesInRange]
  );
  // The reference is averaged over its whole run: the selection of the
  // current one has no meaning in a recording taken weeks earlier.
  const baselineMeasures = React.useMemo(
    () =>
      baselineRecording
        ? aggregateFramesToMeasures(
            baselineRecording.names,
            baselineRecording.frames
          )
        : null,
    [baselineRecording]
  );
  // What to conclude, when there is something to conclude: a number nobody
  // can act on is noise, and `render` at 75% was exactly that.
  const renderAdvice = React.useMemo(() => getRenderAdvice(measures), [
    measures,
  ]);
  const frameStats = React.useMemo(() => getFrameStats(framesInRange), [
    framesInRange,
  ]);
  // Named in lower case: the identifier of the message is the sentence
  // itself, so an interpolated value must read well inside it.
  const rangeStart = shownRange ? formatGameTime(shownRange.fromMs) : '';
  const rangeEnd = shownRange ? formatGameTime(shownRange.toMs) : '';
  const shownFramesCount = frameStats.framesCount;
  const averageDuration = formatMilliseconds(frameStats.averageMs);
  const maxDuration = formatMilliseconds(frameStats.maxMs);
  const slowFramesCount = frameStats.slowFramesCount;
  const markers = React.useMemo(
    () => (recording ? getTimelineMarkers(recording) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recording, framesCount, startsCount]
  );

  const hasFrames = !!recording && recording.frames.length > 0;

  return (
    <Background>
      {profilingInProgress && (
        <div className={classes.progressBar}>
          <LinearProgress style={{ height: 2 }} />
        </div>
      )}
      <ScrollView
        autoHideScrollbar
        // A column, so that the message shown when there is nothing to see
        // is centered in the whole panel.
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {recording && bounds && shownRange && hasFrames ? (
          <div className={classes.content}>
            <div className={classes.timeline}>
              <I18n>
                {({ i18n }) => (
                  <FrameStrip
                    frames={recording.frames}
                    bounds={bounds}
                    selectedRange={recording.selectedRange}
                    onSelectRange={range =>
                      recordingStore.setSelectedRange(debuggerId, range)
                    }
                    markers={markers}
                    recordingStartLabel={i18n._(t`Record start`)}
                  />
                )}
              </I18n>
              <div className={classes.rangeSummary}>
                <Text noMargin size="body-small" color="secondary">
                  <Trans>
                    {rangeStart} to {rangeEnd} ({shownFramesCount} frames) -
                    average {averageDuration}, max {maxDuration},{' '}
                    {slowFramesCount} slow frames
                  </Trans>
                </Text>
                {recording.selectedRange && (
                  <FlatButton
                    label={<Trans>Select all</Trans>}
                    onClick={() =>
                      recordingStore.setSelectedRange(debuggerId, null)
                    }
                  />
                )}
              </div>
              <FlameChart
                frames={framesInRange}
                names={recording.names}
                range={shownRange}
              />
            </div>
            <div className={classes.section}>
              <Text noMargin size="body-small" color="secondary">
                <Trans>
                  Time spent in each section of a frame, averaged over the
                  selection
                </Trans>
              </Text>
              <MeasuresTable
                profilerMeasures={measures}
                baselineMeasures={baselineMeasures}
              />
              {renderAdvice && (
                <Text noMargin size="body-small" color="secondary">
                  {renderAdvice}
                </Text>
              )}
            </div>
          </div>
        ) : recording && recording.legacyOutput && !profilingInProgress ? (
          // A game engine too old to send frames: only the averages.
          <div className={classes.content}>
            <div className={classes.section}>
              <Text noMargin size="body-small" color="secondary">
                <Trans>Time spent in each section of a frame</Trans>
              </Text>
              <MeasuresTable
                profilerMeasures={recording.legacyOutput.framesAverageMeasures}
              />
            </div>
          </div>
        ) : profilingInProgress ? (
          <EmptyMessage>
            <Trans>
              Recording: the frames appear as they are played. Stop when you
              have enough to look at.
            </Trans>
          </EmptyMessage>
        ) : (
          <StartRecordingPlaceholder
            description={
              <Trans>
                Record while playing the game, then stop to explore what
                happened in each frame.
              </Trans>
            }
            canRecord={canRecord}
            onStartRecording={onStartRecording}
          />
        )}
      </ScrollView>
    </Background>
  );
};

export default Profiler;
