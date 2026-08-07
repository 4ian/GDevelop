/**
 * Snippets injected into the preview window's V8 over CDP. Each is a plain,
 * self-contained named function: it may only reference its own parameters and
 * preview-side globals (`window`, `gdjs`), never any identifier from this
 * module. They are stringified individually via `Function.prototype.toString()`
 * (see `cdpEval.js`), so co-locating them here does not affect serialization.
 *
 * @typedef {{functionId: string, eventIds: Array<string>}} BreakpointEntry
 */

/**
 * Seeds the initial breakpoints into the preview runtime.
 *
 * Handles both delivery paths: early (`addScriptToEvaluateOnNewDocument`, gdjs
 * not yet defined) stashes them on `window` for `installBreakpointDebugSupport`
 * to consume; late (`Runtime.evaluate`, game already running) hands them
 * straight to `gdjs.BreakpointDebugger.setBreakpoints`.
 *
 * @param {Array<BreakpointEntry>} bps
 * @returns {void}
 */
function bootstrapPreviewCdp(bps) {
  if (bps.length === 0) return;

  if (typeof window !== 'undefined') {
    window.__gdjsInitialBreakpoints = bps;
  }

  if (typeof gdjs !== 'undefined' && gdjs.BreakpointDebugger) {
    gdjs.BreakpointDebugger.setBreakpoints(bps);
  }
}

/**
 * Reads breakpoint-hit info and builds a compact runtime dump while V8 is
 * paused. Thin wrapper over `gdjs.BreakpointDebugger.readPauseState`.
 *
 * @returns {string} A JSON string `{"bp": BreakpointInfo | null, "dump": string}`,
 *   or `""` if `gdjs` / the runtime debugger isn't available.
 */
function readBreakpointPauseState() {
  if (typeof gdjs === 'undefined' || !gdjs.BreakpointDebugger) return '';
  return gdjs.BreakpointDebugger.readPauseState();
}

/**
 * Pushes the full breakpoint payload into the preview runtime. Thin wrapper
 * over `gdjs.BreakpointDebugger.setBreakpoints`. Applied via `Runtime.evaluate`,
 * which works even while V8 is paused on a `debugger;` statement.
 *
 * @param {Array<BreakpointEntry>} entries
 * @returns {boolean} `true` if applied, `false` if the runtime debugger isn't ready yet.
 */
function setBreakpointsInPreview(entries) {
  if (typeof gdjs === 'undefined' || !gdjs.BreakpointDebugger) return false;
  return gdjs.BreakpointDebugger.setBreakpoints(entries);
}

/**
 * Arms the stepping FSM in the preview so the next `checkBreakpoint` trips on
 * the target event, then the caller issues `Debugger.resume`. Thin wrapper
 * over `gdjs.BreakpointDebugger.programStepping` (the logic lives in the runtime).
 *
 * @param {string} eventId UUID of the paused event, or `""` for a raw pause.
 * @param {string} functionId Events-function identifier, or `""` for scene code / raw pause.
 * @param {boolean} preFlipPassed Whether to mark the current event as already passed.
 * @returns {boolean} `true` if applied, `false` if the runtime debugger isn't ready yet.
 */
function programSteppingInPreview(eventId, functionId, preFlipPassed) {
  if (typeof gdjs === 'undefined' || !gdjs.BreakpointDebugger) return false;
  return gdjs.BreakpointDebugger.programStepping(
    eventId,
    functionId,
    preFlipPassed
  );
}

/**
 * Schedules a pause in the running preview so the next `checkBreakpoint` emits
 * a `debugger;`. Thin wrapper over
 * `gdjs.BreakpointDebugger.schedulePauseAtNextEvent` (clears a held
 * Debugger-panel Pause so the render loop keeps running).
 *
 * @returns {boolean} `true` if applied, `false` if the runtime debugger isn't ready yet.
 */
function schedulePauseAtNextEventInPreview() {
  if (typeof gdjs === 'undefined' || !gdjs.BreakpointDebugger) return false;
  return gdjs.BreakpointDebugger.schedulePauseAtNextEvent();
}

module.exports = {
  bootstrapPreviewCdp,
  readBreakpointPauseState,
  setBreakpointsInPreview,
  programSteppingInPreview,
  schedulePauseAtNextEventInPreview,
};
