/**
 * @typedef {Object} BreakpointEntry
 * @property {string} functionId
 * @property {Array<number>} eventIndices
 */

/**
 * Seeds the initial breakpoints into the preview runtime.
 *
 * Handles both delivery paths: early (`addScriptToEvaluateOnNewDocument`, gdjs
 * not yet defined) stashes them on `window`; late (`Runtime.evaluate`, game
 * already running) writes straight into `_debugState`.
 *
 * MUST be self-contained: every identifier it uses is either a parameter or
 * a preview-side global (`window`, `gdjs`, `Map`, `Set`). Stringified via
 * `.toString()` and sent over CDP.
 *
 * @param {Array<BreakpointEntry>} bps
 * @returns {void}
 */
function bootstrapPreviewCdp(bps) {
  if (bps.length === 0) return;

  if (typeof window !== 'undefined') {
    // Early path: gdjs not defined yet; installBreakpointDebugSupport consumes this.
    window.__gdjsInitialBreakpoints = bps;
  }

  if (typeof gdjs !== 'undefined') {
    // Late path: game already running, write directly.
    var g = gdjs.Debugger ? gdjs.Debugger.game : null;
    if (g && g._debugState) {
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
