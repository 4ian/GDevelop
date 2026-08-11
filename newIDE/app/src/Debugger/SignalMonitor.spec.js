// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';
import { getSignalMonitorLogs, SignalMonitor } from './SignalMonitor';

const makeSignalRecord = (
  id: number,
  name: string,
  payload: string,
  receiverPositions: Array<any>
): any => ({
  id,
  name,
  payload,
  target: 'scene',
  emittedFrameId: id,
  deliveredFrameId: id + 1,
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
});

const makeSignalDiagnostics = (
  receiverPositions: Array<any>,
  recentSignals?: Array<any>
): any => {
  const signalRecord = makeSignalRecord(1, 'TestSignal', '', receiverPositions);
  return {
    frameId: 2,
    queuedSignalsCount: 0,
    emittedSignalsCount: recentSignals ? recentSignals.length : 1,
    throttledSignalsCount: 0,
    deliveredSignalsThisFrameCount: 1,
    receiversThisFrameCount: receiverPositions.length,
    signalsThisFrame: [signalRecord],
    recentSignals: recentSignals || [signalRecord],
  };
};

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

  it('restores cards for signals delivered in earlier frames', () => {
    const receiver = {
      objectName: 'NewMyObject',
      objectId: 1,
      receiverName: 'MyBehavior',
      receiverKind: 'behavior',
    };
    const logs = getSignalMonitorLogs(
      makeSignalDiagnostics(
        [receiver],
        [
          makeSignalRecord(1, 'TestSignal', 'tst1', [receiver]),
          makeSignalRecord(2, 'TestSignal222', 'test2', [
            {
              ...receiver,
              receiverName: 'NewMyObject',
              receiverKind: 'prefab',
            },
          ]),
        ]
      )
    );

    expect(logs.map(log => log.signalName)).toEqual([
      'TestSignal',
      'TestSignal222',
    ]);
  });

  it('uses the full header width and shows full details on hover', () => {
    const receiver = {
      objectName: 'NewMyObject',
      objectId: 1,
      receiverName: 'MyBehavior',
      receiverKind: 'behavior',
    };
    const signalName = 'A.Signal.Name.That.Needs.The.Available.Header.Width';
    const diagnostics = makeSignalDiagnostics(
      [receiver],
      [makeSignalRecord(1, signalName, 'tst1', [receiver])]
    );
    let renderer: any = null;
    act(() => {
      renderer = TestRenderer.create(
        <SignalMonitor signalDiagnostics={diagnostics} />
      );
    });

    const titles = renderer.root
      .findAll(node => !!node.props.title)
      .map(node => node.props.title);
    expect(titles).toContain(signalName);
    expect(titles).toContain('from scene -> NewMyObject#1.MyBehavior');
    expect(titles).toContain('payload: tst1');

    const signalNameNode = renderer.root.find(
      node => node.props.title === signalName
    );
    expect(signalNameNode.props.children).toBe(signalName);
    expect(signalNameNode.props.style.flex).toBe(1);
    expect(signalNameNode.props.style.minWidth).toBe(0);
    expect(signalNameNode.parent.props.style.width).toBe('100%');

    act(() => renderer.unmount());
  });
});
