"use strict";
// Restores the `require` saved by A_spine-pixi-v7-pre.js once the Spine bundle
// (B_spine-pixi-v7.js) has resolved its `@pixi/*` imports, so the shim does not
// stay on the global `require` (which would make engine code mis-detect
// Node/Electron via `typeof require`).
//
// The A_/B_/C_ filename prefixes force the load order (pre -> bundle -> post):
// GDJS loads include files in alphabetical order, not declaration order.
(function () {
  var globalScope = typeof globalThis !== "undefined" ? globalThis : window;
  if ("__spineSavedRequire" in globalScope) {
    globalScope.require = globalScope.__spineSavedRequire;
    delete globalScope.__spineSavedRequire;
  }
})();
