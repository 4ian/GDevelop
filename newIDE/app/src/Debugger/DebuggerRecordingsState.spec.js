// @flow
import {
  forgetRecordedData,
  forgetDebugger,
  getClosedDebuggerIds,
  carryOverClosedDebuggersData,
  addImportedRecording,
  pickRunningDebuggerId,
  type DebuggerRecordingsState,
} from './DebuggerRecordingsState';

const makeStatus = (isInGameEdition: boolean): any => ({
  isPaused: false,
  isInGameEdition,
});

const makeState = (): DebuggerRecordingsState => ({
  debuggerGameData: { '1': { game: 'closed' }, '2': { game: 'running' } },
  resourcesDebugSnapshots: {
    // $FlowFixMe[incompatible-type] - Not a real state of the resources.
    '1': { state: { resources: 'closed' }, lastUpdatedAt: 1, lastError: null },
  },
  debuggerStatus: { '1': makeStatus(false), '2': makeStatus(false) },
  profilingInProgress: { '1': false, '2': true },
  importedRecordings: {},
  baselineDebuggerId: '1',
});

describe('DebuggerRecordingsState', () => {
  it('forgets the recorded data, keeping the inspected data if asked', () => {
    const state = makeState();
    const withoutData = forgetRecordedData(state, '1');
    expect(withoutData.debuggerGameData['1']).toBeUndefined();
    expect(withoutData.resourcesDebugSnapshots['1']).toBeUndefined();
    expect(withoutData.debuggerStatus['1']).toBeDefined();

    const keepingInspectedData = forgetRecordedData(state, '1', {
      keepInspectedData: true,
    });
    expect(keepingInspectedData.debuggerGameData['1']).toEqual({
      game: 'closed',
    });
    expect(keepingInspectedData.resourcesDebugSnapshots['1']).toBeUndefined();

    // The given state is left untouched.
    expect(state.debuggerGameData['1']).toBeDefined();
  });

  it('forgets everything about a debugger, including the baseline', () => {
    const withoutDebugger = forgetDebugger(makeState(), '1');
    expect(withoutDebugger.debuggerStatus['1']).toBeUndefined();
    expect(withoutDebugger.profilingInProgress['1']).toBeUndefined();
    expect(withoutDebugger.baselineDebuggerId).toBe(null);
    expect(withoutDebugger.debuggerStatus['2']).toBeDefined();
    expect(forgetDebugger(makeState(), '2').baselineDebuggerId).toBe('1');
  });

  it('gives the data of the last closed game to the new one', () => {
    const state = makeState();
    const closedIds = getClosedDebuggerIds(state.debuggerStatus, ['2', '3']);
    expect(closedIds).toEqual(['1']);

    const nextState = carryOverClosedDebuggersData(state, '3', closedIds);
    expect(nextState.debuggerGameData['3']).toEqual({ game: 'closed' });
    expect(nextState.resourcesDebugSnapshots['3']).toBe(
      state.resourcesDebugSnapshots['1']
    );
    // The closed game is forgotten, the running one is untouched.
    expect(nextState.debuggerGameData['1']).toBeUndefined();
    expect(nextState.debuggerStatus['1']).toBeUndefined();
    expect(nextState.debuggerGameData['2']).toEqual({ game: 'running' });
  });

  it('does not overwrite what the new game already sent', () => {
    const state = {
      ...makeState(),
      debuggerGameData: { '1': { game: 'closed' }, '3': { game: 'new' } },
    };
    const nextState = carryOverClosedDebuggersData(state, '3', ['1']);
    expect(nextState.debuggerGameData['3']).toEqual({ game: 'new' });
  });

  it('adds an imported recording', () => {
    const metadata: any = { projectName: 'My game' };
    const nextState = addImportedRecording(
      makeState(),
      'imported:1',
      metadata,
      null
    );
    expect(nextState.importedRecordings['imported:1']).toBe(metadata);
    expect(nextState.resourcesDebugSnapshots['imported:1']).toBeUndefined();
  });

  it('picks the last game running in a preview', () => {
    const debuggerStatus = {
      '1': makeStatus(false),
      'embedded-game-frame': makeStatus(true),
    };
    expect(
      pickRunningDebuggerId(['1', 'embedded-game-frame'], debuggerStatus)
    ).toBe('1');
    expect(pickRunningDebuggerId(['embedded-game-frame'], debuggerStatus)).toBe(
      null
    );
  });
});
