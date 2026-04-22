/**
 * @typedef {Object} BreakpointEntry
 * @property {string} functionId
 * @property {Array<number>} eventIndices
 */

/**
 * Pushes the full breakpoint payload into the preview runtime. Applied
 * atomically via `Runtime.evaluate`, which works even while V8 is paused on
 * a `debugger;` statement.
 *
 * Runs inside the preview V8 — see the `.toString()` caveats in `cdpEval.js`.
 *
 * @param {Array<BreakpointEntry>} entries
 * @returns {boolean} `true` if the payload was applied, `false` if `gdjs.game`
 *   or its debug state isn't available yet (can happen during very early
 *   navigation races).
 */
function setBreakpointsInPreview(entries) {
  var g = typeof gdjs !== 'undefined' ? gdjs.game : null;
  if (!g || !g._debugState) return false;
  var map = new Map();
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e && e.functionId && e.eventIndices && e.eventIndices.length > 0) {
      map.set(e.functionId, new Set(e.eventIndices));
    }
  }
  g._debugState.breakpointIndices = map.size > 0 ? map : null;
  return true;
}

module.exports = {
  setBreakpointsInPreview,
};
