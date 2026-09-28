// @flow
import {
  type DebuggerId,
  type DebuggerStatus,
} from '../ExportAndShare/PreviewLauncher.flow';
import { type DebuggerRecordingMetadata } from './Export/DebuggerRecordingFile';
import { type ResourcesDebugState } from './Resources/ResourcesDebugTypes';
import { type ResourcesDebugSnapshot } from '.';

/**
 * What the debugger keeps about each game: what it sent, what was imported,
 * and the recording every other one is compared to.
 *
 * The functions of this module compute the next state, without side effects:
 * the stores out of the React state (the recordings, the logs) are handled by
 * the debugger itself.
 */
export type DebuggerRecordingsState = {|
  debuggerGameData: { [DebuggerId]: any },
  resourcesDebugSnapshots: { [DebuggerId]: ResourcesDebugSnapshot },
  debuggerStatus: { [DebuggerId]: DebuggerStatus },
  profilingInProgress: { [DebuggerId]: boolean },
  importedRecordings: { [DebuggerId]: DebuggerRecordingMetadata },
  baselineDebuggerId: ?DebuggerId,
|};

/** Keep only what this module works on, out of the whole state of the debugger. */
export const getRecordingsState = (state: {
  ...DebuggerRecordingsState,
}): DebuggerRecordingsState => ({
  debuggerGameData: state.debuggerGameData,
  resourcesDebugSnapshots: state.resourcesDebugSnapshots,
  debuggerStatus: state.debuggerStatus,
  profilingInProgress: state.profilingInProgress,
  importedRecordings: state.importedRecordings,
  baselineDebuggerId: state.baselineDebuggerId,
});

/**
 * Forget the inspected data and resources of a game. `keepInspectedData`
 * leaves the tree of the Inspector alone, for the clears that are not asked
 * for by the user.
 */
export const forgetRecordedData = (
  state: DebuggerRecordingsState,
  id: DebuggerId,
  options: {| keepInspectedData: boolean |} = { keepInspectedData: false }
): DebuggerRecordingsState => {
  const debuggerGameData = { ...state.debuggerGameData };
  const resourcesDebugSnapshots = { ...state.resourcesDebugSnapshots };
  if (!options.keepInspectedData) delete debuggerGameData[id];
  delete resourcesDebugSnapshots[id];
  return { ...state, debuggerGameData, resourcesDebugSnapshots };
};

/**
 * Forget everything about a game: what it recorded and its status, so that
 * it disappears from the debugger.
 */
export const forgetDebugger = (
  state: DebuggerRecordingsState,
  id: DebuggerId
): DebuggerRecordingsState => {
  const stateWithoutData = forgetRecordedData(state, id);
  const importedRecordings = { ...stateWithoutData.importedRecordings };
  const debuggerStatus = { ...stateWithoutData.debuggerStatus };
  const profilingInProgress = { ...stateWithoutData.profilingInProgress };
  delete importedRecordings[id];
  delete debuggerStatus[id];
  delete profilingInProgress[id];
  return {
    ...stateWithoutData,
    importedRecordings,
    debuggerStatus,
    profilingInProgress,
    baselineDebuggerId:
      stateWithoutData.baselineDebuggerId === id
        ? null
        : stateWithoutData.baselineDebuggerId,
  };
};

/** The games that said they were running but are not connected anymore. */
export const getClosedDebuggerIds = (
  debuggerStatus: { [DebuggerId]: DebuggerStatus },
  connectedDebuggerIds: Array<DebuggerId>
): Array<DebuggerId> =>
  Object.keys(debuggerStatus).filter(id => !connectedDebuggerIds.includes(id));

/**
 * The closed game whose data a newly launched game takes over, if any: the
 * last one closed is the one that was being read.
 */
export const getCarriedOverDebuggerId = (
  closedDebuggerIds: Array<DebuggerId>,
  newDebuggerId: DebuggerId
): ?DebuggerId => {
  const previousId = closedDebuggerIds[closedDebuggerIds.length - 1];
  return previousId !== undefined && previousId !== newDebuggerId
    ? previousId
    : null;
};

/**
 * A game was just launched: the last values of the game it replaces are
 * given to it, so that the panels keep showing what they showed until the
 * new game sends its own. The closed games are then forgotten, so that
 * recordings do not pile up.
 */
export const carryOverClosedDebuggersData = (
  state: DebuggerRecordingsState,
  newDebuggerId: DebuggerId,
  closedDebuggerIds: Array<DebuggerId>
): DebuggerRecordingsState => {
  let nextState = state;
  const previousId = getCarriedOverDebuggerId(closedDebuggerIds, newDebuggerId);
  if (previousId != null) {
    const debuggerGameData = { ...nextState.debuggerGameData };
    const resourcesDebugSnapshots = { ...nextState.resourcesDebugSnapshots };
    if (
      debuggerGameData[previousId] &&
      debuggerGameData[newDebuggerId] === undefined
    ) {
      debuggerGameData[newDebuggerId] = debuggerGameData[previousId];
    }
    if (
      resourcesDebugSnapshots[previousId] &&
      resourcesDebugSnapshots[newDebuggerId] === undefined
    ) {
      resourcesDebugSnapshots[newDebuggerId] =
        resourcesDebugSnapshots[previousId];
    }
    nextState = { ...nextState, debuggerGameData, resourcesDebugSnapshots };
  }
  closedDebuggerIds.forEach(id => {
    nextState = forgetDebugger(nextState, id);
  });
  return nextState;
};

/** Show a recording read from a file as a game of its own, read only. */
export const addImportedRecording = (
  state: DebuggerRecordingsState,
  id: DebuggerId,
  metadata: DebuggerRecordingMetadata,
  resourcesDebugState: ?ResourcesDebugState
): DebuggerRecordingsState => ({
  ...state,
  resourcesDebugSnapshots: resourcesDebugState
    ? {
        ...state.resourcesDebugSnapshots,
        // Never updated: an imported recording is read only.
        [id]: { state: resourcesDebugState, lastUpdatedAt: 0, lastError: null },
      }
    : state.resourcesDebugSnapshots,
  importedRecordings: { ...state.importedRecordings, [id]: metadata },
});

/** The last game running in a preview, ignoring the game embedded in the editor. */
export const pickRunningDebuggerId = (
  debuggerIds: Array<DebuggerId>,
  debuggerStatus: { [DebuggerId]: DebuggerStatus }
): ?DebuggerId => {
  for (let index = debuggerIds.length - 1; index >= 0; index--) {
    const id = debuggerIds[index];
    const status = debuggerStatus[id];
    if (!status || !status.isInGameEdition) return id;
  }
  return null;
};
