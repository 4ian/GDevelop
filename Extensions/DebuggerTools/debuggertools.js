/**
 * @file
 * Tools for interacting with the debugger.
 */


/**
 * The namespace containing tools to interact with the debugger.
 * @namespace
 */
gdjs.evtTools.debugger = {};

/**
 * Stop the game execution.
 * @param {gdjs.RuntimeScene} runtimeScene - The current scene.
 */
gdjs.evtTools.debugger.pause = function(runtimeScene) {
    runtimeScene.getGame().pause(true);
}
