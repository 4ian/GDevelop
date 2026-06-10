/**
 * @typedef {Object} BreakpointEntry
 * @property {string} functionId
 * @property {Array<number>} eventIndices
 */

/**
 * Seeds the initial breakpoints into the preview runtime.
 *
 * Handles both delivery paths: early (`addScriptToEvaluateOnNewDocument`, gdjs
 * not yet defined) stashes them on `window` for `installBreakpointDebugSupport`
 * to consume; late (`Runtime.evaluate`, game already running) hands them
 * straight to `gdjs.Debugger.setBreakpoints`.
 *
 * MUST be self-contained: every identifier it uses is either a parameter or
 * a preview-side global (`window`, `gdjs`). Stringified via `.toString()` and
 * sent over CDP.
 *
 * @param {Array<BreakpointEntry>} bps
 * @returns {void}
 */
function bootstrapPreviewCdp(bps) {
  if (bps.length === 0) return;

  if (typeof window !== 'undefined') {
    window.__gdjsInitialBreakpoints = bps;
  }

  if (typeof gdjs !== 'undefined' && gdjs.Debugger) {
    gdjs.Debugger.setBreakpoints(bps);
  }
}

module.exports = {
  bootstrapPreviewCdp,
};
