namespace gdjs {
  export namespace evtTools {
    /**
     * The namespace containing tools to interact with the debugger.
     * @namespace
     */
    export namespace debuggerTools {
      /**
       * Stop the game execution.
       * @param runtimeScene - The current scene.
       */
      export const pause = function (runtimeScene: gdjs.RuntimeScene) {
        runtimeScene.getGame().pause(true);
      };

      /**
       * Logs a message to the console.
       * @param runtimeScene - The current scene.
       * @param message - The message to log.
       * @param group - The group of messages it belongs to.
       * @param type - The type of log (info, warning or error).
       */
      export const log = function (
        message: string,
        type: 'info' | 'warning' | 'error',
        group: string
      ) {
        gdjs.log(group, message, type);
      };

      /**
       * Enable or disable the debug draw.
       * @param runtimeScene - The current scene.
       * @param enableDebugDraw - true to enable the debug draw, false to disable it.
       * @param showHiddenInstances - true to apply the debug draw to hidden objects.
       * @param showPointsNames - true to show point names.
       * @param showCustomPoints - true to show custom points of Sprite objects.
       */
      export const enableDebugDraw = function (
        runtimeScene: gdjs.RuntimeScene,
        enableDebugDraw: boolean,
        showHiddenInstances: boolean,
        showPointsNames: boolean,
        showCustomPoints: boolean
      ) {
        runtimeScene.enableDebugDraw(
          enableDebugDraw,
          showHiddenInstances,
          showPointsNames,
          showCustomPoints
        );
      };
    }
  }
}
