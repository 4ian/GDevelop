"use strict";
// Resolves the `@pixi/*` imports of the esbuild Spine bundle (B_spine-pixi-v7.js)
// to the global PIXI object. Adapted from the package's `dist/require-shim.js`,
// which is an ES module GDJS can't load as a script.
//
// `@pixi/*` is checked first (PIXI is a global, not a Node module), then anything
// else is delegated to the host's original `require` (Electron) or returns
// `undefined` (never throws). The shim is installed on the global `require` only
// while the bundle initializes; C_spine-pixi-v7-post.js restores the original
// `require` afterwards, so it does not linger.
//
// The A_/B_/C_ filename prefixes force the load order (pre -> bundle -> post):
// GDJS loads include files in alphabetical order, not declaration order.
(function () {
  var globalScope = typeof globalThis !== "undefined" ? globalThis : window;
  globalScope.__spineSavedRequire =
    typeof require !== "undefined" ? require : undefined;
  globalScope.require = function spineRequireShim(id) {
    if (typeof id === "string" && id.indexOf("@pixi/") === 0) return PIXI;
    if (typeof globalScope.__spineSavedRequire === "function")
      return globalScope.__spineSavedRequire(id);
    return undefined;
  };
})();
