// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import {
  RecordingStatusChip,
  RecordingButton,
} from '../../../Debugger/RecordingControls';
import { ProfilerRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingStore';
import { makeFakeRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingFixtures';
import paperDecorator from '../../PaperDecorator';
import { Line } from '../../../UI/Grid';

export default {
  title: 'Debugger/RecordingControls',
  decorators: [paperDecorator],
};

export const StatusChipIdle = () => {
  const recordingStore = React.useMemo(() => new ProfilerRecordingStore(), []);
  return (
    <Line>
      <RecordingStatusChip
        recordingStore={recordingStore}
        debuggerId="0"
        profilingInProgress={false}
      />
    </Line>
  );
};

export const StatusChipProfiling = () => {
  const recordingStore = React.useMemo(() => new ProfilerRecordingStore(), []);
  return (
    <Line>
      <RecordingStatusChip
        recordingStore={recordingStore}
        debuggerId="0"
        profilingInProgress={true}
      />
    </Line>
  );
};

export const StatusChipRecording = () => {
  const recordingStore = React.useMemo(() => makeFakeRecordingStore(42000), []);
  return (
    <Line>
      <RecordingStatusChip
        recordingStore={recordingStore}
        debuggerId="0"
        profilingInProgress={false}
      />
    </Line>
  );
};

export const ControlsIdle = () => {
  const recordingStore = React.useMemo(() => new ProfilerRecordingStore(), []);
  return (
    <Line>
      <RecordingButton
        recordingStore={recordingStore}
        debuggerId="0"
        profilingInProgress={false}
        onStart={action('onStart')}
        onStop={action('onStop')}
        disabled={false}
      />
    </Line>
  );
};

export const ControlsProfiling = () => {
  const recordingStore = React.useMemo(() => new ProfilerRecordingStore(), []);
  return (
    <Line>
      <RecordingButton
        recordingStore={recordingStore}
        debuggerId="0"
        profilingInProgress={true}
        onStart={action('onStart')}
        onStop={action('onStop')}
        disabled={false}
      />
    </Line>
  );
};
