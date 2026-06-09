/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Preview-only globals attached to the `gdjs` namespace and `window` by
 * the Electron main process over Chrome DevTools Protocol and by
 * `gdjs.installBreakpointDebugSupport`. All fields are optional because
 * none exist in production builds.
 */

declare namespace gdjs {
  /**
   * Set to `true` by the CDP bootstrap script once Electron main's debugger
   * is driving the preview window. Generated event code gates the
   * `debugger;` branch on this flag.
   */
  var __cdpAttached: boolean | undefined;

  /** @deprecated Use `gdjs.Debugger.buildDumpJson` instead. */
  var __buildBreakpointDumpJson: (() => string) | undefined;

  /** @deprecated Use `gdjs.Debugger.game` instead. */
  var game: gdjs.RuntimeGame | undefined;

  /**
   * Public debugger API. Preview-only globals previously scattered on the
   * `gdjs` namespace now live here. All fields are `undefined` in exported
   * (non-preview) builds.
   */
  namespace Debugger {
    var game: gdjs.RuntimeGame | undefined;
    var buildDumpJson: (() => string) | undefined;

    function pushFunction(
      functionId: string,
      scene: gdjs.RuntimeScene | null | undefined
    ): void;
    function popFunction(scene: gdjs.RuntimeScene | null | undefined): void;
    function checkBreakpoint(
      functionId: string,
      eventIndex: number,
      container: gdjs.RuntimeInstanceContainer | null | undefined
    ): boolean;
  }
}

/**
 * Entry recognized inside `window.__gdjsInitialBreakpoints`. Injected by
 * the CDP bootstrap script before the generated game script runs; consumed
 * once by `installBreakpointDebugSupport` and then deleted.
 */
declare type InitialBreakpointEntry = {
  functionId: string;
  eventIndices: number[];
};

interface Window {
  __gdjsInitialBreakpoints?: InitialBreakpointEntry[];
  /**
   * Set by the CDP bootstrap script via `addScriptToEvaluateOnNewDocument`
   * before the game loads. `installBreakpointDebugSupport` reads this to set
   * `gdjs.__cdpAttached = true` synchronously, replacing the old poll-based
   * bootstrap approach.
   */
  __gdjsWaitForCdp?: boolean;
}
