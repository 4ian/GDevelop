// @flow
import optionalRequire from '../Utils/OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

/** Resume the paused preview V8 (frozen on a `debugger;` statement). */
export const resumePausedPreview = async (): Promise<boolean> => {
  if (!ipcRenderer) return false;
  try {
    return !!(await ipcRenderer.invoke('preview-debugger-resume', {}));
  } catch (error) {
    console.warn('[cdp-bridge] resume failed:', error);
    return false;
  }
};

/**
 * Program the stepping state inside the paused preview runtime and resume
 * V8 so the next `checkBreakpoint` trips on the target event.
 */
export const stepPausedPreview = async (payload: {|
  currentEventIndex: number,
  currentFunctionId?: string,
|}): Promise<boolean> => {
  if (!ipcRenderer) return false;
  try {
    return !!(await ipcRenderer.invoke('preview-debugger-step', { payload }));
  } catch (error) {
    console.warn('[cdp-bridge] step failed:', error);
    return false;
  }
};

/**
 * Schedule "pause at next event" inside a *running* preview. Writes the
 * stepping FSM via CDP Runtime.evaluate; V8 is not paused, so no
 * Debugger.resume is issued. Used by F10 when the preview is not currently
 * paused — the actual pause fires inside the next `checkBreakpoint` call.
 */
export const schedulePauseAtNextEvent = async (): Promise<boolean> => {
  if (!ipcRenderer) return false;
  try {
    return !!(await ipcRenderer.invoke('preview-debugger-schedule-pause', {}));
  } catch (error) {
    console.warn('[cdp-bridge] schedule pause failed:', error);
    return false;
  }
};

export type CDPBreakpointInfo = {|
  eventIndex: number,
  sceneName: string,
  functionId: string,
|};

export type CDPPausePayload = {|
  breakpoint: ?CDPBreakpointInfo,
  // JSON string of the runtime `dump` message
  // (`{ command: "dump", payload: {...} }`). Empty when the runtime hasn't
  // published a dump for this pause.
  dumpJson: string,
|};

// Module-level cache so subscribers that attach after the IPC was already
// delivered (e.g. an EventsSheet mounted as a result of breakpoint navigation)
// still receive the current pause state via the replay in onPreviewDebuggerPauseChange.
let lastPaused: boolean = false;
let lastPayload: ?CDPPausePayload = null;

if (ipcRenderer) {
  ipcRenderer.on('preview-debugger-paused', (_event, payload) => {
    lastPaused = true;
    lastPayload = {
      breakpoint: payload && payload.breakpoint ? payload.breakpoint : null,
      dumpJson: (payload && payload.dumpJson) || '',
    };
  });
  ipcRenderer.on('preview-debugger-resumed', () => {
    lastPaused = false;
    lastPayload = null;
  });
}

/**
 * Subscribe to CDP pause/resume events forwarded from Electron main.
 * Replays the current pause payload asynchronously to late subscribers.
 * Returns an unsubscribe function.
 */
export const onPreviewDebuggerPauseChange = (
  callback: (isPaused: boolean, payload: ?CDPPausePayload) => void
): (() => void) => {
  if (!ipcRenderer) return () => {};
  const onPaused = (_event: mixed, payload: ?CDPPausePayload) =>
    callback(true, {
      breakpoint: payload && payload.breakpoint ? payload.breakpoint : null,
      dumpJson: (payload && payload.dumpJson) || '',
    });
  const onResumed = () => callback(false, null);
  ipcRenderer.on('preview-debugger-paused', onPaused);
  ipcRenderer.on('preview-debugger-resumed', onResumed);

  if (lastPaused && lastPayload) {
    // Deferred to avoid setState-during-mount; re-reads cache on the microtask
    // in case a newer IPC arrived between subscribe and the Promise tick.
    Promise.resolve().then(() => {
      if (lastPaused && lastPayload) callback(true, lastPayload);
    });
  }

  return () => {
    ipcRenderer.removeListener('preview-debugger-paused', onPaused);
    ipcRenderer.removeListener('preview-debugger-resumed', onResumed);
  };
};

/**
 * Subscribe to preview-window CDP detach (preview closed). Used to reset
 * per-session ephemeral UI state. Returns an unsubscribe function.
 */
export const onPreviewDebuggerClosed = (callback: () => void): (() => void) => {
  if (!ipcRenderer) return () => {};
  const onClosed = () => callback();
  ipcRenderer.on('preview-debugger-closed', onClosed);
  return () => {
    ipcRenderer.removeListener('preview-debugger-closed', onClosed);
  };
};

/**
 * Push the full session breakpoint payload to the preview runtime via CDP
 * `Runtime.evaluate`, which applies atomically even while V8 is paused on
 * a `debugger;` statement.
 */
export const setPreviewBreakpointsViaCdp = async (
  breakpoints: Array<{|
    functionId: string,
    eventIndices: Array<number>,
  |}>
): Promise<boolean> => {
  if (!ipcRenderer) return false;
  try {
    return !!(await ipcRenderer.invoke('preview-debugger-set-breakpoints', {
      breakpoints,
    }));
  } catch (error) {
    console.warn('[cdp-bridge] setBreakpoints failed:', error);
    return false;
  }
};

export const isElectronCDPBridgeAvailable = (): boolean => !!ipcRenderer;
