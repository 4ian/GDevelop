/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Preview-only global attached to `window` by the Electron CDP bootstrap.
 * Optional because it never exists in production builds.
 */

/**
 * Entry recognized inside `window.__gdjsInitialBreakpoints`. Injected by
 * the CDP bootstrap script before the generated game script runs; consumed
 * once by the breakpoint manager and then deleted.
 */
declare type InitialBreakpointEntry = {
  functionId: string;
  eventIds: string[];
};

interface Window {
  __gdjsInitialBreakpoints?: InitialBreakpointEntry[];
}
