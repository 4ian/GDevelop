/**
 * Arms the stepping FSM in the preview so the next `checkBreakpoint` trips on
 * the target event, then the caller issues `Debugger.resume`. Thin wrapper
 * over `gdjs.Debugger.programStepping` (the logic lives in the runtime).
 *
 * Runs inside the preview V8 — see the `.toString()` caveats in `cdpEval.js`.
 *
 * @param {number} eventIndex Zero-based index of the paused event, or `-1` for a raw pause.
 * @param {string} functionId Events-function identifier, or `""` for scene code / raw pause.
 * @param {boolean} preFlipPassed Whether to mark the current event as already passed.
 * @returns {boolean} `true` if applied, `false` if the runtime debugger isn't ready yet.
 */
function programSteppingInPreview(eventIndex, functionId, preFlipPassed) {
  if (typeof gdjs === 'undefined' || !gdjs.Debugger) return false;
  return gdjs.Debugger.programStepping(eventIndex, functionId, preFlipPassed);
}

module.exports = {
  programSteppingInPreview,
};
