/**
 * @typedef {Object} BreakpointEntry
 * @property {string} functionId
 * @property {Array<number>} eventIndices
 */

/**
 * Runs inside the preview window's V8 before generated event code executes.
 * It does three things:
 *   1. Sets `window.__gdjsInitialBreakpoints` so RuntimeGame's constructor
 *      can consume them synchronously via `_consumeInitialBreakpoints` —
 *      the only path that guarantees frame-0 events honour a breakpoint.
 *   2. Polls the `gdjs` namespace and sets `gdjs.__cdpAttached = true` so
 *      the breakpoints codegen switches to the `debugger;` branch.
 *   3. Late-path fallback: if the constructor ran before this script (e.g.
 *      `Page.addScriptToEvaluateOnNewDocument` lost the timing race and the
 *      script is instead delivered via `Runtime.evaluate` on
 *      `Runtime.executionContextCreated`), writes the payload directly into
 *      `gdjs.game._debugState.breakpointIndices`.
 *
 * This function is stringified (`.toString()`) and evaluated in the preview
 * renderer. It MUST be self-contained: every identifier it uses is either a
 * parameter or a preview-side global (`window`, `gdjs`, `Map`, `Set`,
 * `setInterval`, `clearInterval`).
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
  var intervalId = setInterval(function () {
    if (!flagDone) flagDone = setFlag();
    if (flagDone && !bpsDone) bpsDone = setBps();
    if (flagDone && bpsDone) clearInterval(intervalId);
  }, 0);
}

module.exports = {
  bootstrapPreviewCdp,
};
