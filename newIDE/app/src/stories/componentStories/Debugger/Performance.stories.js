// @flow
import * as React from 'react';

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

export const NeverRecorded = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Performance
      recordingStore={emptyStore}
      debuggerId="0"
      profilingInProgress={false}
      memoryLimitBytes={null}
    />
  </FixedHeightFlexContainer>
);

export const WithARecording = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Performance
      recordingStore={recordingStore}
      debuggerId="0"
      profilingInProgress={false}
      memoryLimitBytes={256 * 1024 * 1024}
    />
  </FixedHeightFlexContainer>
);
