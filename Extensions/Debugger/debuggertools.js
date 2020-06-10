/**
 * Tools for interracting with the debugger.
 * @fileoverview
 */


/**
 * The namespace containing tools to interract with the debugger.
 * @namespace
 */
gdjs.evtTools.debugger = {};

/**
 * Breaks execution (breakpoint).
 * @param {gdjs.RuntimeScene} runtimeScene - The current scene.
 */
gdjs.evtTools.debugger.break = function(runtimeScene) {
    runtimeScene.getGame().pause(true);
}
