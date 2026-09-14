// @flow
import * as React from 'react';

import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../GDevelopJsInitializerDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import WatchedVariablesPanel from '../../../EventsExecutionTracking/WatchedVariablesPanel';
import EventsExecutionTrackingContext from '../../../EventsExecutionTracking/EventsExecutionTrackingContext';
import { EventsExecutionTrackingStore } from '../../../EventsExecutionTracking/EventsExecutionTrackingStore';

export default {
  title: 'Debugger/WatchedVariablesPanel',
  component: WatchedVariablesPanel,
  decorators: [GDevelopJsInitializerDecorator],
};

/** A structure with a lot of children, the case that was unreadable inline. */
const makeBigStructure = () => {
  const inventory = {};
  for (let index = 0; index < 120; index++) {
    inventory[`Item${index}`] = {
      Count: index,
      Name: `Item number ${index}`,
      IsEquipped: index % 7 === 0,
    };
  }
  return {
    Life: 100,
    Name: 'Player one',
    Inventory: inventory,
    Positions: [{ X: 12, Y: 34 }, { X: 56, Y: 78 }],
  };
};

/**
 * A preview that answers every expression with the same value, so that the
 * panel can be seen without a game running.
 */
const makeFakePreviewDebuggerServer = (value: any) => ({
  getExistingPreviewDebuggerIds: () => ['0'],
  sendMessageWithResponse: (message: Object) =>
    Promise.resolve({
      payload: (message.payload.codes || []).map(() => ({
        result: value,
        variables: {},
      })),
    }),
});

const makeStore = (value: any, watchedExpressions: Array<string>) => {
  const store = new EventsExecutionTrackingStore();
  store.setDebuggerOpened(true);
  // $FlowFixMe - only the methods used by the panel are needed here.
  store.setPreviewDebuggerServer(makeFakePreviewDebuggerServer(value));
  watchedExpressions.forEach(expression =>
    store.addWatchedExpression(expression)
  );
  return store;
};

export const WithAStructure = (): React.Node => (
  <EventsExecutionTrackingContext.Provider
    value={makeStore(makeBigStructure(), ['Player', 'Player.Life'])}
  >
    <FixedHeightFlexContainer height={550}>
      <WatchedVariablesPanel
        project={testProject.project}
        layout={testProject.testLayout}
        onClose={() => {}}
      />
    </FixedHeightFlexContainer>
  </EventsExecutionTrackingContext.Provider>
);

export const WithNoPreviewRunning = (): React.Node => {
  const store = new EventsExecutionTrackingStore();
  store.addWatchedExpression('Score');
  return (
    <EventsExecutionTrackingContext.Provider value={store}>
      <FixedHeightFlexContainer height={550}>
        <WatchedVariablesPanel
          project={testProject.project}
          layout={testProject.testLayout}
          onClose={() => {}}
        />
      </FixedHeightFlexContainer>
    </EventsExecutionTrackingContext.Provider>
  );
};
