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
   *
   * The `gdjs.Debugger` namespace itself is implemented (and typed) in
   * `breakpointDebugSupport.ts`; it must not be redeclared here.
   */
  var __cdpAttached: boolean | undefined;
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
