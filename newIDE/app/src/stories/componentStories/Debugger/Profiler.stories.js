// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import Profiler from '../../../Debugger/Profiler';
import { ProfilerRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingStore';
import { makeFakeRecordingStore } from '../../../Debugger/ProfilerRecording/ProfilerRecordingFixtures';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';

export default {
  title: 'Debugger/Profiler',
  component: Profiler,
};

const profilerProps = {
  debuggerId: '0',
  canRecord: true,
  onStartRecording: action('start recording'),
};

const emptyStore = new ProfilerRecordingStore();
const recordingStore = new ProfilerRecordingStore();
recordingStore.onStarted('0', { recordingId: 1, startedAtGameTimeMs: 2500 });
const shortRecordingStore = makeFakeRecordingStore(5000);
const longRecordingStore = makeFakeRecordingStore(120000);

export const NeverRecorded = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      recordingStore={emptyStore}
      profilingInProgress={false}
    />
  </FixedHeightFlexContainer>
);

export const Recording = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      recordingStore={recordingStore}
      profilingInProgress={true}
    />
  </FixedHeightFlexContainer>
);

export const WithAShortRecording = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      recordingStore={shortRecordingStore}
      profilingInProgress={false}
    />
  </FixedHeightFlexContainer>
);

export const WithALongRecording = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      recordingStore={longRecordingStore}
      profilingInProgress={false}
    />
  </FixedHeightFlexContainer>
);

/** The panel is short, so everything it shows must be reachable by scrolling. */
export const WithARecordingInAShortPanel = (): React.Node => (
  <FixedHeightFlexContainer height={260}>
    <Profiler
      {...profilerProps}
      recordingStore={shortRecordingStore}
      profilingInProgress={false}
    />
  </FixedHeightFlexContainer>
);

/** The width of the profiler pane of the debugger, in its default layout. */
export const WithARecordingInANarrowPanel = (): React.Node => (
  <FixedWidthFlexContainer width={340}>
    <FixedHeightFlexContainer height={550}>
      <Profiler
        {...profilerProps}
        recordingStore={shortRecordingStore}
        profilingInProgress={false}
      />
    </FixedHeightFlexContainer>
  </FixedWidthFlexContainer>
);
