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

  /**
   * Installed at preview startup by `installBreakpointDebugSupport`. Called
   * over CDP `Runtime.evaluate` while V8 is paused to serialize the minimal
   * variables dump for the IDE.
   */
  var __buildBreakpointDumpJson: (() => string) | undefined;

  /**
   * Last-created preview `RuntimeGame`. Exposed so the IDE and the CDP
   * bootstrap fallback can reach `_debugState` without traversing the
   * renderer.
   */
  var game: gdjs.RuntimeGame | undefined;
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
}
