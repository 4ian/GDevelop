namespace gdjs {
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
   * @param runtimeScene - The current scene.
   */
  gdjs.evtTools.debugger.pause = function (runtimeScene: gdjs.RuntimeScene) {
    runtimeScene.getGame().pause(true);
  };
}
