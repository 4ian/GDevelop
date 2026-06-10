/**
 * Reads breakpoint-hit info and builds a compact runtime dump while V8 is
 * paused. Thin wrapper over `gdjs.Debugger.readPauseState`.
 *
 * Runs inside the paused preview V8 — see the `.toString()` caveats in
 * `cdpEval.js`.
 *
 * @returns {string} A JSON string `{"bp": BreakpointInfo | null, "dump": string}`,
 *   or `""` if `gdjs` / the runtime debugger isn't available.
 */
function readBreakpointPauseState() {
  if (typeof gdjs === 'undefined' || !gdjs.Debugger) return '';
  return gdjs.Debugger.readPauseState();
}

module.exports = {
  readBreakpointPauseState,
};
