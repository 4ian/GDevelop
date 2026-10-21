// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';
import debuggerGameDataDump from '../../fixtures/DebuggerGameDataDump.json';
import profilerOutputsTestData from '../../fixtures/ProfilerOutputsTestData.json';
import consoleTestData from '../../fixtures/ConsoleTestData';
import DebuggerContent from '../../Debugger/DebuggerContent';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'DebuggerContent',
};

export const WithData = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={550}>
      <DebuggerContent
        gameData={debuggerGameDataDump}
        onPause={action('on pause')}
        onPlay={action('on play')}
        onRefresh={action('on refresh')}
        onEdit={() => false}
        onCall={() => false}
        onStartProfiler={action('start profiler')}
        onStopProfiler={action('stop profiler')}
        profilerOutput={profilerOutputsTestData}
        profilingInProgress={false}
        logsManager={consoleTestData}
        onOpenedEditorsChanged={() => {}}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);
WithData.storyName = 'with data';

export const WithoutData = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={550}>
      <DebuggerContent
        gameData={null}
        onPause={action('on pause')}
        onPlay={action('on play')}
        onRefresh={action('on refresh')}
        onEdit={() => false}
        onCall={() => false}
        onStartProfiler={action('start profiler')}
        onStopProfiler={action('stop profiler')}
        profilerOutput={profilerOutputsTestData}
        profilingInProgress={true}
        logsManager={consoleTestData}
        onOpenedEditorsChanged={() => {}}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);
WithoutData.storyName = 'without data';
