/**
 * Reads breakpoint-hit info and builds a compact runtime dump while V8 is
 * paused. Calls `gdjs.Debugger.buildDumpJson` to produce the variable
 * data the IDE tooltip needs.
 *
 * Runs inside the paused preview V8 — see the `.toString()` caveats in
 * `cdpEval.js`.
 *
 * @returns {string} A JSON string of the form
 *   `{"bp": BreakpointInfo | null, "dump": string}`. `bp` is read from
 *   `gdjs.Debugger.game._debugState.lastBreakpoint`; `dump` is the JSON
 *   produced by `gdjs.Debugger.buildDumpJson` (or `""` if it threw or
 *   wasn't available). Returns `""` if `gdjs` itself is not loaded.
 */
function readBreakpointPauseState() {
  if (typeof gdjs === 'undefined') return '';
  var game = gdjs.Debugger && gdjs.Debugger.game;
  var bp =
    game && game._debugState ? game._debugState.lastBreakpoint || null : null;
  var dump = '';
  try {
    var buildDump =
      gdjs.Debugger && typeof gdjs.Debugger.buildDumpJson === 'function'
        ? gdjs.Debugger.buildDumpJson
        : null;
    if (buildDump) dump = buildDump();
  } catch (e) {
    // Swallow: the pause flow must never depend on the dump succeeding.
  }
  return JSON.stringify({ bp: bp, dump: dump });
}

module.exports = {
  readBreakpointPauseState,
};
