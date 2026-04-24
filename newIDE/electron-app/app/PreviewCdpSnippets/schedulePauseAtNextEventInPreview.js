/**
 * Schedules a pause in the *running* preview so that the next call to
 * `__checkBreakpoint` emits a `debugger;` and pauses V8. Sets the stepping
 * flags and clears `runtimeGame._paused` — a held Debugger-panel-Pause
 * would otherwise keep the render loop dormant and `__checkBreakpoint`
 * would never run.
 *
 * Runs inside the preview V8 — see the `.toString()` caveats in `cdpEval.js`.
 *
 * @returns {boolean} `true` if the payload was applied, `false` if
 *   `gdjs.game` or its debug state isn't available yet.
 */
function schedulePauseAtNextEventInPreview() {
  var g = typeof gdjs !== 'undefined' ? gdjs.game : null;
  if (!g || !g._debugState) return false;
  var ds = g._debugState;
  ds.stepNextEvent = true;
  ds.stepPassedCurrentEvent = false;
  ds.stepCurrentEventIndex = -1;
  ds.stepCurrentFunctionId = '';
  ds.stepStartDepth = -1;
  if (typeof g.pause === 'function') g.pause(false);
  return true;
}

module.exports = {
  schedulePauseAtNextEventInPreview,
};
