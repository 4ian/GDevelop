// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import Performance from '../../../Debugger/Performance';
import { ProfilerRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingStore';
import { makeFakeRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingFixtures';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'Debugger/Performance',
  component: Performance,
};

const emptyStore = new ProfilerRecordingStore();
const recordingStore = makeFakeRecordingStore(60000);
// A second run, to serve as the reference a recording is compared to.
const baselineRecordingStore = makeFakeRecordingStore(45000, '0');

export const NeverRecorded = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Performance
      recordingStore={emptyStore}
      debuggerId="0"
      canRecord
      onStartRecording={action('start recording')}
      profilingInProgress={false}
      memoryLimitBytes={null}
    />
  </FixedHeightFlexContainer>
);

export const ComparedToABaseline = () => (
  <FixedHeightFlexContainer height={700}>
    <Performance
      recordingStore={recordingStore}
      debuggerId="0"
      canRecord
      onStartRecording={action('start recording')}
      profilingInProgress={false}
      memoryLimitBytes={256 * 1024 * 1024}
      baselineRecording={baselineRecordingStore.getRecording('0')}
    />
  </FixedHeightFlexContainer>
);

export const WithARecording = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Performance
      recordingStore={recordingStore}
      debuggerId="0"
      canRecord
      onStartRecording={action('start recording')}
      profilingInProgress={false}
      memoryLimitBytes={256 * 1024 * 1024}
    />
  </FixedHeightFlexContainer>
);
