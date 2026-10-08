namespace gdjs {
  export namespace evtTools {
    /**
     * The namespace containing tools to interact with the debugger.
     * @namespace
     */
    export namespace debuggerTools {
      /**
       * Stop the game execution.
       *
       * A breakpoint is there to look at the game as it is at this exact
       * moment: any recording in progress is stopped with it, so that the
       * panels of the debugger stop moving and can be read.
       * @param instanceContainer - The current container.
       */
      export const pause = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        const runtimeGame = instanceContainer.getGame();
        runtimeGame.stopProfiler();
        runtimeGame.pause(true);
      };

      /**
       * Start recording the game (the profiler, performance and resources
       * panels of the debugger), as the "Record" button of the debugger does.
       * Does nothing if a recording is already running.
       * @param instanceContainer - The current container.
       */
      export const startProfiling = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        const runtimeGame = instanceContainer.getGame();
        const debuggerClient = runtimeGame.getDebuggerClient();
        if (!debuggerClient) return;

        const wasStarted = debuggerClient.startProfilerAndReport();
        const profiler = runtimeGame.getProfiler();
        if (wasStarted && profiler) {
          debuggerClient.sendProfilerStarted(profiler);
        }
      };

      /**
       * Stop the recording of the game started with `startProfiling`: what was
       * measured stays in the debugger.
       * @param instanceContainer - The current container.
       */
      export const stopProfiling = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        instanceContainer.getGame().stopProfiler();
      };

      /**
       * Logs a message to the console.
       * @param message - The message to log.
       * @param type - The type of log (info, warning or error).
       * @param group - The group of messages it belongs to.
       */
      export const log = function (
        message: string,
        type: 'info' | 'warning' | 'error',
        group: string
      ) {
        gdjs.Logger.getLoggerOutput().log(group, message, type, false);
      };

      /**
       * Enable or disable the debug draw.
       * @param instanceContainer - The current container.
       * @param enableDebugDraw - true to enable the debug draw, false to disable it.
       * @param showHiddenInstances - true to apply the debug draw to hidden objects.
       * @param showPointsNames - true to show point names.
       * @param showCustomPoints - true to show custom points of Sprite objects.
       */
      export const enableDebugDraw = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        enableDebugDraw: boolean,
        showHiddenInstances: boolean,
        showPointsNames: boolean,
        showCustomPoints: boolean
      ) {
        instanceContainer.enableDebugDraw(
          enableDebugDraw,
          showHiddenInstances,
          showPointsNames,
          showCustomPoints
        );
      };
    }
  }
}
