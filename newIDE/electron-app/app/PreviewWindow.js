const {
  BrowserWindow, // Module to create native browser window.
  ipcMain,
  shell,
  screen,
} = require('electron');
const isDev = require('electron-is-dev');
const { load } = require('./Utils/UrlLoader');
const { serializeFunctionForCdp } = require('./PreviewCdpSnippets/cdpEval');
const {
  bootstrapPreviewCdp,
} = require('./PreviewCdpSnippets/bootstrapPreviewCdp');
const {
  readBreakpointPauseState,
} = require('./PreviewCdpSnippets/readBreakpointPauseState');
const {
  setBreakpointsInPreview,
} = require('./PreviewCdpSnippets/setBreakpointsInPreview');
const {
  programSteppingInPreview,
} = require('./PreviewCdpSnippets/programSteppingInPreview');
const {
  schedulePauseAtNextEventInPreview,
} = require('./PreviewCdpSnippets/schedulePauseAtNextEventInPreview');

/**
 * @typedef {import('electron').BrowserWindow} BrowserWindow
 * @typedef {import('electron').IpcMainEvent} IpcMainEvent
 */

/**
 * @typedef {Object} PreviewEntry
 * @property {BrowserWindow} previewWindow
 * @property {number | null} parentWindowId
 */

/**
 * Per-window CDP state. `isPaused` mirrors `Debugger.paused`/`Debugger.resumed`
 * events and may lag reality on races, so resume/step paths do not rely on it
 * as a gate.
 * @typedef {Object} CdpSession
 * @property {boolean} isAttached
 * @property {boolean} isPaused
 * @property {number | null} parentWindowId
 */

/**
 * @typedef {Object} BreakpointEntry
 * @property {string} functionId
 * @property {Array<number>} eventIndices
 */

/**
 * @typedef {Object} StepPayload
 * @property {number} [currentEventIndex] Zero-based index of the event the
 *   debugger is paused on; omit for a raw pause.
 * @property {string} [currentFunctionId] Events-function identifier; omit for
 *   top-level scene code / raw pause.
 */

/**
 * Keeps a reference to every preview window so they aren't garbage-collected
 * while alive.
 * @type {Array<PreviewEntry>}
 */
let previewWindows = [];

let openDevToolsByDefault = false;

/**
 * Per-window CDP session state, keyed by `BrowserWindow.id`.
 * @type {Map<number, CdpSession>}
 */
const cdpSessions = new Map();

/**
 * @param {Array<BreakpointEntry>} initialBreakpoints
 * @returns {string} CDP-ready expression wrapping {@link bootstrapPreviewCdp}.
 */
const buildBootstrapSource = initialBreakpoints =>
  serializeFunctionForCdp(
    bootstrapPreviewCdp,
    Array.isArray(initialBreakpoints) ? initialBreakpoints : []
  );

/**
 * Fire-and-forget: attaches CDP to the preview window and wires all event
 * handlers. The caller invokes `loadURL` immediately after — synchronous
 * `wc.debugger.attach('1.3')` already puts the inspector in place, so the
 * async commands that follow (Runtime.enable, Debugger.enable, addScript)
 * race with page parsing without blocking it. The bootstrap gets into the
 * page via *two* paths to cover both outcomes of that race:
 *   - `Page.addScriptToEvaluateOnNewDocument` if it lands first (future docs).
 *   - `Runtime.executionContextCreated` listener + `Runtime.evaluate` if the
 *     context is created before addScript registers (current doc fallback).
 * Must stay non-awaitable: `addScript` can hang silently (target state,
 * Electron debugger quirks), so awaiting it before `loadURL` risks a
 * black-screen deadlock.
 *
 * @param {BrowserWindow} previewWindow
 * @param {number | null} parentWindowId
 * @param {Array<BreakpointEntry>} initialBreakpoints
 * @returns {void}
 */
const attachCdpToPreview = (
  previewWindow,
  parentWindowId,
  initialBreakpoints
) => {
  const wc = previewWindow.webContents;
  const windowId = previewWindow.id;
  try {
    wc.debugger.attach('1.3');
  } catch (e) {
    console.warn('[preview-cdp] attach failed for window', windowId, e);
    return;
  }
  cdpSessions.set(windowId, { isAttached: true, isPaused: false, parentWindowId });

  const bootstrapSource = buildBootstrapSource(initialBreakpoints);

  wc.debugger.on('detach', () => {
    const entry = cdpSessions.get(windowId);
    const wasPaused = !!(entry && entry.isPaused);
    cdpSessions.delete(windowId);
    // CDP doesn't emit a synthetic `Debugger.resumed` on detach, so
    // listeners that mirror pause state from CDP only would keep a stale
    // "paused" flag after the preview closes. Forward a synthetic resume
    // notification so the IDE can clear its paused UI.
    if (wasPaused) {
      sendToParent(parentWindowId, 'preview-debugger-resumed', { windowId });
    }
    // Always signal that the preview window lost its CDP session — the IDE
    // uses this to reset per-session ephemeral UI state (e.g. the dragged
    // "Paused in debugger" toast position). Independent of `wasPaused`
    // because the user may have resumed manually before closing.
    sendToParent(parentWindowId, 'preview-debugger-closed', { windowId });
  });

  wc.debugger.on('message', (_event, method, params) => {
    switch (method) {
      case 'Runtime.executionContextCreated': {
        // Fresh context (initial navigation, hot reload, etc.) — re-inject
        // the bootstrap so a breakpoint set before preview launch is
        // applied in time for the first frame.
        const contextId =
          params && params.context && params.context.id;
        wc.debugger
          .sendCommand('Runtime.evaluate', {
            expression: bootstrapSource,
            contextId,
          })
          .catch(() => {});
        break;
      }
      case 'Debugger.paused': {
        const entry = cdpSessions.get(windowId);
        if (entry) entry.isPaused = true;
        wc.debugger
          .sendCommand('Runtime.evaluate', {
            expression: serializeFunctionForCdp(readBreakpointPauseState),
            returnByValue: true,
          })
          .then(evalResult => {
            let breakpoint = null;
            let dumpJson = '';
            const raw =
              evalResult && evalResult.result && evalResult.result.value;
            if (typeof raw === 'string' && raw.length > 0) {
              try {
                const parsed = JSON.parse(raw);
                breakpoint = parsed && parsed.bp ? parsed.bp : null;
                dumpJson = (parsed && parsed.dump) || '';
              } catch (_) {}
            }
            sendToParent(parentWindowId, 'preview-debugger-paused', {
              windowId,
              reason: params && params.reason,
              breakpoint,
              dumpJson,
            });
          })
          .catch(err => {
            console.warn('[preview-cdp] read pause state failed', err);
            sendToParent(parentWindowId, 'preview-debugger-paused', {
              windowId,
              reason: params && params.reason,
              breakpoint: null,
              dumpJson: '',
            });
          });
        break;
      }
      case 'Debugger.resumed': {
        const entry = cdpSessions.get(windowId);
        if (entry) entry.isPaused = false;
        sendToParent(parentWindowId, 'preview-debugger-resumed', { windowId });
        break;
      }
      default:
        break;
    }
  });

  // Required for `Runtime.executionContextCreated` events to be delivered.
  wc.debugger.sendCommand('Runtime.enable').catch(() => {});
  wc.debugger.sendCommand('Debugger.enable').catch(() => {});
  wc.debugger
    .sendCommand('Page.addScriptToEvaluateOnNewDocument', {
      source: bootstrapSource,
    })
    .catch(err => {
      console.warn('[preview-cdp] addScript failed', err);
    });
};

/**
 * @param {number | null} parentWindowId
 * @param {string} channel
 * @param {Object} payload
 * @returns {void}
 */
const sendToParent = (parentWindowId, channel, payload) => {
  if (!parentWindowId) return;
  const parent = BrowserWindow.fromId(parentWindowId);
  if (parent && !parent.isDestroyed() && parent.webContents) {
    parent.webContents.send(channel, payload);
  }
};

/**
 * @param {number} windowId
 * @param {string} method CDP method, e.g. `Debugger.resume`.
 * @param {Object} [commandParams]
 * @returns {Promise<any>}
 */
const sendCdpCommand = async (windowId, method, commandParams) => {
  const previewWindow = BrowserWindow.fromId(windowId);
  if (!previewWindow || previewWindow.isDestroyed()) {
    throw new Error('Preview window ' + windowId + ' is gone');
  }
  return previewWindow.webContents.debugger.sendCommand(
    method,
    commandParams || {}
  );
};

/**
 * Resolves the target preview window for a resume/step command. Prefers a
 * paused session when known, but falls back to any attached session — the
 * `Debugger.paused` event is the only source of truth for `isPaused` and
 * can be missed on races, so trying `Debugger.resume` on a running session
 * is safer than refusing to resume at all (Chromium returns an error which
 * we log and swallow).
 *
 * @param {number | null | undefined} explicitWindowId
 * @returns {number | null}
 */
const findTargetPreviewWindowId = explicitWindowId => {
  if (
    typeof explicitWindowId === 'number' &&
    cdpSessions.has(explicitWindowId)
  ) {
    return explicitWindowId;
  }
  for (const [id, entry] of cdpSessions) {
    if (entry.isPaused) return id;
  }
  for (const [id] of cdpSessions) {
    return id;
  }
  return null;
};

/**
 * Resumes the paused V8 renderer of a preview window.
 *
 * @param {number | null | undefined} windowId
 * @returns {Promise<boolean>}
 */
const resumePreviewDebugger = async windowId => {
  const target = findTargetPreviewWindowId(windowId);
  if (target === null) return false;
  try {
    await sendCdpCommand(target, 'Debugger.resume');
    return true;
  } catch (error) {
    console.warn('[preview-cdp] Debugger.resume failed', error);
    return false;
  }
};

/**
 * @param {number | null | undefined} windowId
 * @param {Array<BreakpointEntry>} breakpoints
 * @returns {Promise<boolean>}
 */
const setBreakpointsPreviewDebugger = async (windowId, breakpoints) => {
  const target = findTargetPreviewWindowId(windowId);
  if (target === null) return false;
  const expression = serializeFunctionForCdp(
    setBreakpointsInPreview,
    Array.isArray(breakpoints) ? breakpoints : []
  );
  try {
    await sendCdpCommand(target, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
    });
    return true;
  } catch (error) {
    console.warn('[preview-cdp] setBreakpoints via CDP failed', error);
    return false;
  }
};

/**
 * Programs the stepping state in the paused runtime, then issues
 * `Debugger.resume`. See {@link programSteppingInPreview} for the shape and
 * semantics of the programmed state.
 *
 * @param {number | null | undefined} windowId
 * @param {StepPayload | null | undefined} stepPayload
 * @returns {Promise<boolean>}
 */
const stepPreviewDebugger = async (windowId, stepPayload) => {
  const target = findTargetPreviewWindowId(windowId);
  if (target === null) return false;
  const eventIndex =
    stepPayload && typeof stepPayload.currentEventIndex === 'number'
      ? stepPayload.currentEventIndex
      : -1;
  const functionId =
    stepPayload && typeof stepPayload.currentFunctionId === 'string'
      ? stepPayload.currentFunctionId
      : '';
  const preFlipPassed = eventIndex >= 0;
  const expression = serializeFunctionForCdp(
    programSteppingInPreview,
    eventIndex,
    functionId,
    preFlipPassed
  );
  try {
    await sendCdpCommand(target, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
    });
    await sendCdpCommand(target, 'Debugger.resume');
    return true;
  } catch (error) {
    console.warn('[preview-cdp] step failed', error);
    return false;
  }
};

/**
 * @param {number | null | undefined} windowId
 * @returns {Promise<boolean>}
 */
const schedulePauseAtNextEventInPreviewDebugger = async windowId => {
  const target = findTargetPreviewWindowId(windowId);
  if (target === null) return false;
  const expression = serializeFunctionForCdp(schedulePauseAtNextEventInPreview);
  try {
    await sendCdpCommand(target, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
    });
    return true;
  } catch (error) {
    console.warn('[preview-cdp] schedule pause failed', error);
    return false;
  }
};

/**
 * @param {BrowserWindow | null | undefined} previewWindow
 * @returns {void}
 */
const detachCdpFromPreview = previewWindow => {
  try {
    if (previewWindow && !previewWindow.isDestroyed()) {
      previewWindow.webContents.debugger.detach();
    }
  } catch (e) {
    // Ignore — already detached or webContents gone.
  }
  if (previewWindow) cdpSessions.delete(previewWindow.id);
};

/**
 * Open 1 or multiple windows running a preview of an exported game.
 *
 * @param {Object} opts
 * @param {BrowserWindow | null} opts.parentWindow
 * @param {Object} opts.previewBrowserWindowOptions
 * @param {string} opts.previewGameIndexHtmlPath
 * @param {boolean} opts.alwaysOnTop
 * @param {boolean} opts.hideMenuBar
 * @param {number} opts.numberOfWindows
 * @param {Object} [opts.captureOptions]
 * @param {IpcMainEvent} opts.openEvent
 * @param {Array<BreakpointEntry>} opts.initialBreakpoints
 * @returns {void}
 */
const openPreviewWindow = ({
  parentWindow,
  previewBrowserWindowOptions,
  previewGameIndexHtmlPath,
  alwaysOnTop,
  hideMenuBar,
  numberOfWindows,
  captureOptions,
  openEvent,
  initialBreakpoints,
}) => {
  // If opening multiple windows at once, place them across the screen.
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const screenWidth = screenSize.width;
  const screenHeight = screenSize.height;
  const positions = {
    // top-left
    1: { x: 0, y: 0 },
    // top-right
    2: { x: screenWidth / 2, y: 0 },
    // bottom-left
    3: { x: 0, y: screenHeight / 2 },
    // bottom-right
    4: { x: screenWidth / 2, y: screenHeight / 2 },
  };
  for (let i = 0; i < numberOfWindows; i++) {
    const browserWindowOptions = {
      ...previewBrowserWindowOptions,
      parent: alwaysOnTop ? parentWindow : null,
      x: numberOfWindows > 1 ? positions[i + 1].x : undefined,
      y: numberOfWindows > 1 ? positions[i + 1].y : undefined,
    };

    let previewWindow = new BrowserWindow(browserWindowOptions);

    previewWindow.setMenuBarVisibility(hideMenuBar);
    previewWindow.webContents.on('devtools-opened', () => {
      openDevToolsByDefault = true;
    });
    previewWindow.webContents.on('devtools-closed', () => {
      openDevToolsByDefault = false;
    });

    if (openDevToolsByDefault) previewWindow.openDevTools();

    // Enable `@electron/remote` module for renderer process
    require('@electron/remote/main').enable(previewWindow.webContents);

    // Order matters: `attachCdpToPreview` is fire-and-forget and must run
    // before `loadURL` so its synchronous `wc.debugger.attach('1.3')`
    // installs the inspector before the page starts parsing.
    attachCdpToPreview(
      previewWindow,
      parentWindow ? parentWindow.id : null,
      initialBreakpoints
    );

    previewWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    previewWindow.loadURL(previewGameIndexHtmlPath);

    // Track this preview window with its parent
    previewWindows.push({
      previewWindow: previewWindow,
      parentWindowId: parentWindow ? parentWindow.id : null,
    });

    previewWindow.on('close', () => {
      detachCdpFromPreview(previewWindow);
      try {
        if (previewWindow && !previewWindow.isDestroyed()) {
          require('@electron/remote/main').disable(previewWindow.webContents);
        }
      } catch (e) {
        // Ignore — webContents may already be gone.
      }
    });

    previewWindow.on('closed', closeEvent => {
      previewWindows = previewWindows.filter(
        entry => entry.previewWindow !== previewWindow
      );
      if (openEvent.sender && !openEvent.sender.isDestroyed()) {
        openEvent.sender.send('preview-window-closed');
      }
      previewWindow = null;
    });
  }
};

/**
 * @param {number} windowId
 * @returns {void}
 */
const closePreviewWindow = windowId => {
  const entry = previewWindows.find(
    entry => entry.previewWindow.id === windowId
  );
  if (entry && entry.previewWindow) {
    entry.previewWindow.close();
  }
};

/**
 * @param {number | null} parentWindowId
 * @returns {void}
 */
const closePreviewWindowsForParent = parentWindowId => {
  const entriesToClose = previewWindows.filter(
    entry => entry.parentWindowId === parentWindowId
  );
  entriesToClose.forEach(entry => {
    try {
      if (entry.previewWindow && !entry.previewWindow.isDestroyed()) {
        entry.previewWindow.close();
      }
    } catch (error) {
      console.warn('Ignoring exception when closing preview window:', error);
    }
  });
};

/** @returns {void} */
const closeAllPreviewWindows = () => {
  previewWindows.forEach(entry => {
    try {
      if (entry.previewWindow && !entry.previewWindow.isDestroyed()) {
        entry.previewWindow.close();
      }
    } catch (error) {
      console.warn('Ignoring exception when closing preview window:', error);
    }
  });
};

module.exports = {
  openPreviewWindow,
  closePreviewWindow,
  closePreviewWindowsForParent,
  closeAllPreviewWindows,
  resumePreviewDebugger,
  stepPreviewDebugger,
  setBreakpointsPreviewDebugger,
  schedulePauseAtNextEventInPreviewDebugger,
};
