// @flow
import optionalRequire from '../Utils/OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

/**
 * Ask the Electron main process to resume the V8 renderer of the paused
 * preview window (it was frozen on a `debugger;` statement emitted by the
 * breakpoints codegen).
 *
 * Returns true when a paused preview was found and resumed. Returns false
 * when running outside Electron or when no paused preview is currently
 * attached — callers should guard their UI with `isElectronCDPBridgeAvailable`
 * and `previewPausedRef` rather than depend on this return value, because
 * pause/step are only meaningful in local Electron preview.
 */
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
 * V8 so `__checkBreakpoint` trips on the target event.
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
 * paused — the actual pause fires inside the next `__checkBreakpoint` call.
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

// Latest pause state tracked at module scope so subscribers that mount
// AFTER a `preview-debugger-paused` IPC has already fired still receive it.
// This happens when a breakpoint hits inside an extension function whose
// `EventsSheet` isn't mounted yet: MainFrame navigates to the tab, which
// mounts a fresh sheet whose `componentDidMount`/subscribe runs after the
// IPC event was already delivered — without the replay, the paused frame
// and variable tooltips never appear on that sheet.
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
 * Subscribe to CDP pause/resume events forwarded from main. The payload
 * comes from `gdjs.__lastBreakpoint` + `gdjs.__lastDumpJson` read via
 * `Runtime.evaluate` on pause — see `PreviewWindow.js`. This is the
 * authoritative notification for paused-UI state and variable tooltips.
 *
 * If the preview is already paused at subscription time, the current
 * pause payload is replayed asynchronously so late subscribers (e.g. an
 * `EventsSheet` that was just mounted as a result of the breakpoint
 * navigation) still get a chance to render the paused UI.
 *
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
    // Deferred so the subscriber can finish its own mount/setup before the
    // callback fires (avoids setState-during-mount warnings). Re-read the
    // cache on the microtask: a `resumed` or newer `paused` IPC may have
    // arrived in between.
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
 * Subscribe to preview-window CDP detach events (fired on preview close).
 * Used to reset per-session ephemeral UI state in the IDE, such as the
 * dragged "Paused in debugger" toast position — each fresh preview
 * session should start with the toast docked at its default anchor.
 *
 * Returns an unsubscribe function.
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
