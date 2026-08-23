// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import Profiler from '../../../Debugger/Profiler';
import profilerOutputsTestData from '../../../fixtures/ProfilerOutputsTestData.json';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';

export default {
  title: 'Debugger/Profiler',
  component: Profiler,
};

const profilerProps = {
  onStart: action('start profiler'),
  onStop: action('stop profiler'),
};

export const NeverRun = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      profilerOutput={null}
      profilingInProgress={false}
    />
  </FixedHeightFlexContainer>
);

export const Profiling = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      profilerOutput={null}
      profilingInProgress={true}
    />
  </FixedHeightFlexContainer>
);

export const WithAnOutput = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      profilerOutput={profilerOutputsTestData}
      profilingInProgress={false}
    />
  </FixedHeightFlexContainer>
);

/** The panel is short, so everything it shows must be reachable by scrolling. */
export const WithAnOutputInAShortPanel = (): React.Node => (
  <FixedHeightFlexContainer height={260}>
    <Profiler
      {...profilerProps}
      profilerOutput={profilerOutputsTestData}
      profilingInProgress={false}
    />
  </FixedHeightFlexContainer>
);

/** The width of the profiler pane of the debugger, in its default layout. */
export const WithAnOutputInANarrowPanel = (): React.Node => (
  <FixedWidthFlexContainer width={340}>
    <FixedHeightFlexContainer height={550}>
      <Profiler
        {...profilerProps}
        profilerOutput={profilerOutputsTestData}
        profilingInProgress={false}
      />
    </FixedHeightFlexContainer>
  </FixedWidthFlexContainer>
);

export const ProfilingAgainAfterARun = (): React.Node => (
  <FixedHeightFlexContainer height={550}>
    <Profiler
      {...profilerProps}
      profilerOutput={profilerOutputsTestData}
      profilingInProgress={true}
    />
  </FixedHeightFlexContainer>
);
