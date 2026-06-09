/**
 * Programs the stepping FSM so the next `gdjs.Debugger.checkBreakpoint` trips
 * on the target event, then the caller issues `Debugger.resume`.
 *
 * V8 pauses on the `debugger;` that sits *after* `checkBreakpoint(N)`,
 * meaning event N is already "passed" but its body hasn't run. Pass
 * `preFlipPassed = true` so the FSM immediately advances to the next event
 * instead of waiting for N to be seen again. For a raw pause (F10 with no
 * current event) pass `eventIndex = -1` and `preFlipPassed = false`.
 *
 * Runs inside the preview V8 — see the `.toString()` caveats in `cdpEval.js`.
 *
 * @param {number} eventIndex Zero-based index of the paused event, or `-1` for a raw pause.
 * @param {string} functionId Events-function identifier, or `""` for scene code / raw pause.
 * @param {boolean} preFlipPassed Whether to mark the current event as already passed.
 * @returns {boolean} `true` if applied, `false` if `gdjs.Debugger.game` isn't available yet.
 */
function programSteppingInPreview(eventIndex, functionId, preFlipPassed) {
  var g =
    typeof gdjs !== 'undefined' && gdjs.Debugger ? gdjs.Debugger.game : null;
  if (!g || !g._debugState) return false;
  var ds = g._debugState;
  ds.stepNextEvent = true;
  ds.stepPassedCurrentEvent = !!preFlipPassed;
  ds.stepCurrentEventIndex = eventIndex;
  ds.stepCurrentFunctionId = functionId;
  ds.stepStartDepth = -1;
  return true;
}

module.exports = {
  programSteppingInPreview,
};
