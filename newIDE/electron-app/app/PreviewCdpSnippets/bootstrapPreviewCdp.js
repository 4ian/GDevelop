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
 * a preview-side global (`window`, `gdjs`, `Map`, `Set`). Stringified via
 * `.toString()` and sent over CDP.
 *
 * @param {Array<BreakpointEntry>} bps
 * @returns {void}
 */
function bootstrapPreviewCdp(bps) {
  if (typeof window !== 'undefined') {
    // Early path: signal the game to mark CDP as attached in its constructor.
    window.__gdjsWaitForCdp = true;
    if (bps.length > 0) {
      window.__gdjsInitialBreakpoints = bps;
    }
  }

  if (typeof gdjs !== 'undefined') {
    // Late path (Runtime.evaluate): game already running, set directly.
    gdjs.__cdpAttached = true;
    var g = gdjs.Debugger ? gdjs.Debugger.game : null;
    if (g && g._debugState && bps.length > 0) {
      var map = new Map();
      for (var i = 0; i < bps.length; i++) {
        var e = bps[i];
        if (e && e.functionId && e.eventIndices && e.eventIndices.length > 0) {
          map.set(e.functionId, new Set(e.eventIndices));
        }
      }
      if (map.size > 0) g._debugState.breakpointIndices = map;
    }
  }
}

module.exports = {
  bootstrapPreviewCdp,
};
