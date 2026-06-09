/**
 * @typedef {Object} BreakpointEntry
 * @property {string} functionId
 * @property {Array<number>} eventIndices
 */

/**
 * Sets `gdjs.__cdpAttached`, seeds initial breakpoints into `_debugState`,
 * and handles the timing race between `addScriptToEvaluateOnNewDocument`
 * and `Runtime.executionContextCreated` delivery.
 *
 * MUST be self-contained: every identifier it uses is either a parameter or
 * a preview-side global (`window`, `gdjs`, `Map`, `Set`, `setInterval`,
 * `clearInterval`). Stringified via `.toString()` and sent over CDP.
 *
 * @param {Array<BreakpointEntry>} bps
 * @returns {void}
 */
function bootstrapPreviewCdp(bps) {
  if (bps.length > 0 && typeof window !== 'undefined') {
    window.__gdjsInitialBreakpoints = bps;
  }
  var flagDone = false;
  var bpsDone = bps.length === 0;
  function setFlag() {
    if (typeof gdjs === 'undefined') return false;
    gdjs.__cdpAttached = true;
    return true;
  }
  function setBps() {
    if (typeof gdjs === 'undefined' || !gdjs.game || !gdjs.game._debugState) {
      return false;
    }
    var existing = gdjs.game._debugState.breakpointIndices;
    if (existing && existing.size && existing.size > 0) return true;
    var map = new Map();
    for (var i = 0; i < bps.length; i++) {
      var e = bps[i];
      if (e && e.functionId && e.eventIndices && e.eventIndices.length > 0) {
        map.set(e.functionId, new Set(e.eventIndices));
      }
    }
    gdjs.game._debugState.breakpointIndices = map.size > 0 ? map : null;
    return true;
  }
  flagDone = setFlag();
  if (flagDone && !bpsDone) bpsDone = setBps();
  if (flagDone && bpsDone) return;
  var intervalId = setInterval(function() {
    if (!flagDone) flagDone = setFlag();
    if (flagDone && !bpsDone) bpsDone = setBps();
    if (flagDone && bpsDone) clearInterval(intervalId);
  }, 0);
}

module.exports = {
  bootstrapPreviewCdp,
};
