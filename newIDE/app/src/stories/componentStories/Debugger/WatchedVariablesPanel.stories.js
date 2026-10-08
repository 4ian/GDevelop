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
const makeFakePreviewDebuggerServer = (value: any, instancesCount: number) => ({
  getExistingPreviewDebuggerIds: () => ['0'],
  sendMessageWithResponse: (message: Object) =>
    Promise.resolve({
      payload: (message.payload.codes || []).map(code => ({
        result: value,
        instancesCount,
        // Like the game: the instances are only sent when the generated code
        // asked for them, which is what the panel switches on when a row is
        // unfolded. Sending them all the time hides the case where the row
        // cannot even be unfolded.
        instances:
          instancesCount > 1 && code.includes('gdjsEvaluatedInstances')
            ? new Array(instancesCount).fill(null).map((_, index) => ({
                id: index + 9,
                result: index === 4 ? 'Michael' : index === 7 ? 'Bob' : '',
              }))
            : null,
        variables: {},
      })),
    }),
});

const makeStore = (
  value: any,
  watchedExpressions: Array<string>,
  instancesCount: number = 0
) => {
  const store = new EventsExecutionTrackingStore();
  store.setDebuggerOpened(true);
  // $FlowFixMe - only the methods used by the panel are needed here.
  store.setPreviewDebuggerServer(
    makeFakePreviewDebuggerServer(value, instancesCount)
  );
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

/** An object with several instances: the value shown is one of them. */
export const WithSeveralInstances = (): React.Node => (
  <EventsExecutionTrackingContext.Provider
    value={makeStore('', ['MyTextObject.Name', 'MyButton.X()'], 8)}
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

/** An object with a single instance: its value is not in doubt. */
export const WithASingleInstance = (): React.Node => (
  <EventsExecutionTrackingContext.Provider
    value={makeStore('Bob', ['MyTextObject.Name'], 1)}
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
