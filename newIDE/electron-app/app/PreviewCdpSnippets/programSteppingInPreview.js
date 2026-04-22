/**
 * Programs the stepping state in the paused runtime so the next
 * `__checkBreakpoint` call trips on the target event. The caller is
 * expected to follow up with `Debugger.resume`.
 *
 * Important: V8 is paused on `debugger;` that sits *after* the
 * `__checkBreakpoint(N)` check of the current event, meaning event N has
 * already been "passed" from the stepping FSM's point of view but its body
 * hasn't run yet. Callers pre-flip `preFlipPassed = true` so the very next
 * `__checkBreakpoint` at the same depth/function trips a pause (sub-event
 * of N, or sibling N+1 if N has no matching sub-event). Without this flip,
 * stepping would walk to end of frame without matching, the end-of-frame
 * wrap-around would reset `stepCurrentEventIndex` to -1, and the next frame
 * would pause at event 0 — producing the "stuck near the top of the scene"
 * symptom.
 *
 * A raw pause (e.g. F10) has no meaningful current event; callers pass
 * `eventIndex = -1` and `preFlipPassed = false` — the
 * `stepCurrentEventIndex < 0` branch in `__checkBreakpoint` handles it.
 *
 * Runs inside the preview V8 — see the `.toString()` caveats in `cdpEval.js`.
 *
 * @param {number} eventIndex Zero-based index of the event the debugger is
 *   paused on, or `-1` for a raw pause.
 * @param {string} functionId Identifier of the events function currently
 *   executing, or `""` for top-level scene code / raw pause.
 * @param {boolean} preFlipPassed Whether to mark the current event as
 *   already "passed" (see FSM note above).
 * @returns {boolean} `true` if the payload was applied, `false` if
 *   `gdjs.game` or its debug state isn't available yet.
 */
function programSteppingInPreview(eventIndex, functionId, preFlipPassed) {
  var g = typeof gdjs !== 'undefined' ? gdjs.game : null;
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
