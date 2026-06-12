/**
 * Schedules a pause in the running preview so the next `checkBreakpoint` emits
 * a `debugger;`. Thin wrapper over `gdjs.Debugger.schedulePauseAtNextEvent`
 * (clears a held Debugger-panel Pause so the render loop keeps running).
 *
 * Runs inside the preview V8 — see the `.toString()` caveats in `cdpEval.js`.
 *
 * @returns {boolean} `true` if applied, `false` if the runtime debugger isn't ready yet.
 */
function schedulePauseAtNextEventInPreview() {
  if (typeof gdjs === 'undefined' || !gdjs.Debugger) return false;
  return gdjs.Debugger.schedulePauseAtNextEvent();
}

module.exports = {
  schedulePauseAtNextEventInPreview,
};
