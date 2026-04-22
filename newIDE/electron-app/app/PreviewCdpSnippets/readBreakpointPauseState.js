/**
 * Reads breakpoint-hit info and builds a compact runtime dump while V8 is
 * paused. Calls `gdjs.__buildBreakpointDumpJson` to produce the variable
 * data the IDE tooltip needs.
 *
 * Runs inside the paused preview V8 — see the `.toString()` caveats in
 * `cdpEval.js`.
 *
 * @returns {string} A JSON string of the form
 *   `{"bp": BreakpointInfo | null, "dump": string}`. `bp` is read from
 *   `gdjs.game._debugState.lastBreakpoint`; `dump` is the JSON produced by
 *   `gdjs.__buildBreakpointDumpJson` (or `""` if it threw or wasn't
 *   available). Returns `""` if `gdjs` itself is not loaded.
 */
function readBreakpointPauseState() {
  if (typeof gdjs === 'undefined') return '';
  var bp =
    gdjs.game && gdjs.game._debugState
      ? gdjs.game._debugState.lastBreakpoint || null
      : null;
  var dump = '';
  try {
    if (typeof gdjs.__buildBreakpointDumpJson === 'function') {
      dump = gdjs.__buildBreakpointDumpJson();
    }
  } catch (e) {
    // Swallow: the pause flow must never depend on the dump succeeding.
  }
  return JSON.stringify({ bp: bp, dump: dump });
}

module.exports = {
  readBreakpointPauseState,
};
