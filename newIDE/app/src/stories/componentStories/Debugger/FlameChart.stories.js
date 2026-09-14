// @flow
import * as React from 'react';

import FlameChart from '../../../Debugger/Profiler/FlameChart';
import FrameStrip from '../../../Debugger/Profiler/FrameStrip';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import paperDecorator from '../../PaperDecorator';
import { type ProfilerFrame } from '../../../Debugger/ProfilerRecording/ProfilerRecordingStore';

export default {
  title: 'Debugger/FlameChart',
  decorators: [paperDecorator],
};

const makeFrame = (
  index: number,
  gameTimeMs: number,
  durationMs: number
): ProfilerFrame => ({
  gameTimeMs,
  durationMs,
  spans: [
    { nameIndex: 0, startMs: 0, durationMs: durationMs },
    { nameIndex: 1, startMs: 0.5, durationMs: durationMs * 0.6 },
    { nameIndex: 2, startMs: 1, durationMs: durationMs * 0.3 },
    { nameIndex: 3, startMs: 2, durationMs: durationMs * 0.2 },
  ],
});

const mockFrames: Array<ProfilerFrame> = Array.from({ length: 60 }, (_, i) =>
  makeFrame(i, i * 16.67, 14 + Math.random() * 4)
);

const mockNames = ['Frame', 'Events', 'Rendering', 'Physics'];

export const Default = () => (
  <FixedHeightFlexContainer height={300}>
    <FlameChart
      frames={mockFrames}
      names={mockNames}
      range={{ fromMs: 0, toMs: 1000 }}
    />
  </FixedHeightFlexContainer>
);

export const FewFrames = () => (
  <FixedHeightFlexContainer height={300}>
    <FlameChart
      frames={mockFrames.slice(0, 10)}
      names={mockNames}
      range={{ fromMs: 0, toMs: 167 }}
    />
  </FixedHeightFlexContainer>
);

export const Empty = () => (
  <FixedHeightFlexContainer height={200}>
    <FlameChart frames={[]} names={[]} range={{ fromMs: 0, toMs: 0 }} />
  </FixedHeightFlexContainer>
);

export const FrameStripDefault = () => (
  <FixedHeightFlexContainer height={100}>
    <FrameStrip
      frames={mockFrames}
      range={{ fromMs: 0, toMs: 1000 }}
      selection={{ fromMs: 200, toMs: 600 }}
      onChangeSelection={() => {}}
    />
  </FixedHeightFlexContainer>
);

export const FrameStripNoSelection = () => (
  <FixedHeightFlexContainer height={100}>
    <FrameStrip
      frames={mockFrames}
      range={{ fromMs: 0, toMs: 1000 }}
      selection={null}
      onChangeSelection={() => {}}
    />
  </FixedHeightFlexContainer>
);
