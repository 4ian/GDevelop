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

// Fix `MathUtils.atan2Deg` multiplying by `degRad` (PI/180) instead of
// `radDeg` (180/PI), making `PointAttachment.computeWorldRotation` (its only
// call site) always return ~0. The bug affects all spine-ts 4.2.x releases:
// introduced in EsotericSoftware/spine-runtimes@92164921a5, fixed only on the
// 4.3 branch (in @a2547097c2), never backported to 4.2. Harmless if the
// bundle is upgraded to a fixed version.
(function () {
  if (typeof spine !== "undefined" && spine.MathUtils) {
    spine.MathUtils.atan2Deg = function (y, x) {
      return Math.atan2(y, x) * (180 / Math.PI);
    };
  }
})();
