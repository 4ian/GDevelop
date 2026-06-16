"use strict";
// Shim: map @pixi/* package requires to the global PIXI object so the esbuild
// IIFE bundle can resolve its PixiJS dependencies in a browser <script> context.
var require = (function (originalRequire) {
  return function shimmedRequire(id) {
    if (typeof id === "string" && id.indexOf("@pixi/") === 0) return PIXI;
    if (typeof originalRequire === "function") return originalRequire(id);
    throw Error('Dynamic require of "' + id + '" is not supported');
  };
})(typeof require !== "undefined" ? require : undefined);
