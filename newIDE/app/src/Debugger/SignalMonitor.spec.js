// @flow
import { getSignalMonitorLogs } from './SignalMonitor';

const makeSignalDiagnostics = (receiverPositions: Array<any>): any => ({
  frameId: 2,
  queuedSignalsCount: 0,
  emittedSignalsCount: 1,
  throttledSignalsCount: 0,
  deliveredSignalsThisFrameCount: 1,
  receiversThisFrameCount: receiverPositions.length,
  signalsThisFrame: [
    {
      id: 1,
      name: 'TestSignal',
      payload: '',
      target: 'scene',
      emittedFrameId: 1,
      deliveredFrameId: 2,
      status: receiverPositions.length > 0 ? 'delivered' : 'unhandled',
      source: {
        objectName: 'scene',
        objectId: -1,
      },
      receivers: receiverPositions.map(
        receiverPosition => receiverPosition.receiverName
      ),
      receiverPositions,
      targetPositions: [],
    },
  ],
});

describe('SignalMonitor', () => {
  it('creates one scene broadcast row for every concrete subscriber', () => {
    const logs = getSignalMonitorLogs(
      makeSignalDiagnostics([
        {
          objectName: 'NewMyObject',
          objectId: 7,
          receiverName: 'NewMyObject',
          receiverKind: 'prefab',
        },
        {
          objectName: 'NewMyObject',
          objectId: 7,
          receiverName: 'MyBehavior',
          receiverKind: 'behavior',
        },
      ])
    );

    expect(logs.map(log => log.destination)).toEqual([
      'NewMyObject#7 (prefab)',
      'NewMyObject#7.MyBehavior',
    ]);
  });

  it('labels an unhandled scene signal as a broadcast', () => {
    const logs = getSignalMonitorLogs(makeSignalDiagnostics([]));

    expect(logs).toHaveLength(1);
    expect(logs[0].destination).toBe('scene broadcast');
  });
});
