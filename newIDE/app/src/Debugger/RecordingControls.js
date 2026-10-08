// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import StatusChip, { StatusDot } from '../UI/StatusChip';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import History from '../UI/CustomSvgIcons/History';
import { type DebuggerId } from '../ExportAndShare/PreviewLauncher.flow';
import {
  ProfilerRecordingStore,
  useProfilerRecording,
  type ProfilerRecording,
} from './ProfilerRecording/ProfilerRecordingStore';
import { getRecordingTimeBounds } from './ProfilerRecording/ProfilerRecordingAggregation';
import { formatClockDuration } from '../Utils/FormatMeasures';
import { useInterval } from '../Utils/UseInterval';
import useForceUpdate from '../Utils/UseForceUpdate';

/** Re-render the elapsed time of a running recording this often. */
const CLOCK_REFRESH_MS = 1000;

const useRecordingClock = (recording: ?ProfilerRecording): number => {
  const forceUpdate = useForceUpdate();
  const isRecording = !!recording && recording.status === 'recording';
  useInterval(forceUpdate, isRecording ? CLOCK_REFRESH_MS : null);
  if (!recording) return 0;
  const bounds = getRecordingTimeBounds(recording);
  return bounds.toMs - bounds.fromMs;
};

type StatusProps = {|
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  profilingInProgress: boolean,
|};

/**
 * The status of the recording (feeding the profiler, performance and
 * resources panels), shown at the left of the toolbar.
 */
export const RecordingStatusChip = ({
  recordingStore,
  debuggerId,
  profilingInProgress,
}: StatusProps): React.Node => {
  const recording = useProfilerRecording(recordingStore, debuggerId);
  const durationMs = useRecordingClock(recording);
  // Named in lower case: the identifier of the message is the sentence
  // itself, so an interpolated value must read well inside it.
  const clockDuration = formatClockDuration(durationMs);

  if (profilingInProgress) {
    return (
      <StatusChip
        tone="progress"
        loading
        label={<Trans>Recording {clockDuration}</Trans>}
      />
    );
  }
  if (recording) {
    return (
      <StatusChip
        tone={recording.stoppedByCap ? 'warning' : 'info'}
        icon={<History />}
        label={
          recording.stoppedByCap ? (
            <Trans>Stopped after 5 min</Trans>
          ) : (
            <Trans>Last recording {clockDuration}</Trans>
          )
        }
      />
    );
  }
  return (
    <StatusChip icon={<StatusDot />} label={<Trans>Never recorded</Trans>} />
  );
};

type ButtonProps = {|
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  profilingInProgress: boolean,
  onStart: () => void,
  onStop: () => void,
  disabled: boolean,
|};

/**
 * The button starting or stopping the recording.
 */
export const RecordingButton = ({
  recordingStore,
  debuggerId,
  profilingInProgress,
  onStart,
  onStop,
  disabled,
}: ButtonProps): React.Node => {
  const recording = useProfilerRecording(recordingStore, debuggerId);
  return profilingInProgress ? (
    <FlatButton
      primary
      label={<Trans>Stop</Trans>}
      onClick={onStop}
      disabled={disabled}
    />
  ) : (
    <RaisedButton
      primary={!recording}
      label={recording ? <Trans>Record again</Trans> : <Trans>Record</Trans>}
      onClick={onStart}
      disabled={disabled}
    />
  );
};
