/**
 * @typedef {Object} BreakpointEntry
 * @property {string} functionId
 * @property {Array<number>} eventIndices
 */

/**
 * Pushes the full breakpoint payload into the preview runtime. Thin wrapper
 * over `gdjs.Debugger.setBreakpoints`. Applied via `Runtime.evaluate`, which
 * works even while V8 is paused on a `debugger;` statement.
 *
 * Runs inside the preview V8 — see the `.toString()` caveats in `cdpEval.js`.
 *
 * @param {Array<BreakpointEntry>} entries
 * @returns {boolean} `true` if applied, `false` if the runtime debugger isn't ready yet.
 */
function setBreakpointsInPreview(entries) {
  if (typeof gdjs === 'undefined' || !gdjs.Debugger) return false;
  return gdjs.Debugger.setBreakpoints(entries);
}

module.exports = {
  setBreakpointsInPreview,
};
