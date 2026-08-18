// @flow
import {
  onPreviewDebuggerPauseChange,
  resumePausedPreview,
  stepPausedPreview,
  schedulePauseAtNextEvent,
  type CDPPausePayload,
} from './ElectronCDPBridge';
import {
  extractVariablesFromDump,
  type RuntimeVariablesMap,
} from './RuntimeVariablesContext';

export type BreakpointHit = {|
  functionId: string,
  eventId: string,
  sceneName: string,
|};

export type BreakpointDebuggerSessionState = {|
  isPaused: boolean,
  hit: BreakpointHit | null,
  runtimeVariables: RuntimeVariablesMap | null,
|};

type Listener = (state: BreakpointDebuggerSessionState) => void;

const initialState: BreakpointDebuggerSessionState = {
  isPaused: false,
  hit: null,
  runtimeVariables: null,
};

let state: BreakpointDebuggerSessionState = initialState;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener(state));
};

const parseRuntimeVariables = (
  dumpJson: ?string
): RuntimeVariablesMap | null => {
  if (!dumpJson) return null;
  try {
    const parsed = JSON.parse(dumpJson);
    if (parsed && parsed.command === 'dump') {
      return extractVariablesFromDump(parsed);
    }
  } catch (_) {}
  return null;
};

// Single subscription to the CDP pause/resume events for the whole app: the
// dump is parsed here, once per pause, instead of once per events sheet.
onPreviewDebuggerPauseChange((isPaused: boolean, payload: ?CDPPausePayload) => {
  if (isPaused) {
    const breakpoint = payload && payload.breakpoint;
    state = {
      isPaused: true,
      hit:
        breakpoint &&
        typeof breakpoint.eventId === 'string' &&
        typeof breakpoint.functionId === 'string'
          ? {
              functionId: breakpoint.functionId,
              eventId: breakpoint.eventId,
              sceneName: breakpoint.sceneName || '',
            }
          : null,
      runtimeVariables: parseRuntimeVariables(payload && payload.dumpJson),
    };
  } else {
    state = initialState;
  }
  notifyListeners();
});

/** Current pause state, for callers that don't need to subscribe. */
export const getBreakpointDebuggerSessionState = (): BreakpointDebuggerSessionState =>
  state;

/** Subscribes to pause state changes. Returns an unsubscribe function. */
export const subscribeToBreakpointDebuggerSession = (
  listener: Listener
): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Safety net for callers that detect a stale connection through a channel
// other than CDP (e.g. the WebSocket debugger client), in case the CDP
// detach's synthetic resume event is ever missed.
export const resetBreakpointDebuggerSession = (): void => {
  state = initialState;
  notifyListeners();
};

export const resumeBreakpointDebugger = (): void => {
  resumePausedPreview();
};

/**
 * Steps from the current hit's identity (not a caller-supplied id), so a
 * stale id cached by a UI component can't desync stepping from the pause.
 */
export const stepBreakpointDebugger = (): void => {
  if (!state.hit) return;
  stepPausedPreview({
    currentEventId: state.hit.eventId,
    currentFunctionId: state.hit.functionId,
  });
};

/** Arms "pause at next event" in a running (not yet paused) preview. */
export const scheduleBreakpointDebuggerPauseAtNextEvent = (): void => {
  schedulePauseAtNextEvent();
};
