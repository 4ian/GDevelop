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

  /** Public debugger API for preview builds. Undefined in exported builds. */
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
  /** Set by the bootstrap before game code runs; consumed by `installBreakpointDebugSupport` to set `gdjs.__cdpAttached`. */
  __gdjsWaitForCdp?: boolean;
}
