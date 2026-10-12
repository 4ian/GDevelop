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
       * @param instanceContainer - The current container.
       * @param label - A name for the recording, to find it in the debugger.
       * @param durationInSeconds - Stop the recording by itself after this
       * duration (0: only when stopped, or at the maximum duration).
       * @param measureRendering - false to leave out the draw calls and the
       * filters, whose measure costs the game something.
       * @param ifAlreadyRecording - "Keep" to leave a running recording as it
       * is, "Restart" to stop it and start a new one with these options.
       */
      export const startProfiling = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        label?: string,
        durationInSeconds?: float,
        measureRendering?: boolean,
        ifAlreadyRecording?: string
      ) {
        const runtimeGame = instanceContainer.getGame();
        const debuggerClient = runtimeGame.getDebuggerClient();
        if (!debuggerClient) return;

        if (runtimeGame.getProfiler()) {
          if (ifAlreadyRecording !== 'Restart') return;
          runtimeGame.stopProfiler();
        }

        const wasStarted = debuggerClient.startProfilerAndReport({
          label: label || '',
          maxDurationMs:
            durationInSeconds && durationInSeconds > 0
              ? durationInSeconds * 1000
              : 0,
          // Absent for the events written before the option existed.
          measureRendering: measureRendering !== false,
        });
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
       * Mark the current moment of the recording, shown as a labelled line on
       * the timelines of the debugger. Does nothing when not recording.
       * @param instanceContainer - The current container.
       * @param label - The text of the marker.
       */
      export const addProfilingMarker = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        label: string
      ) {
        const profiler = instanceContainer.getGame().getProfiler();
        if (profiler) profiler.addMarker(label);
      };

      /**
       * Check if the game is being recorded.
       * @param instanceContainer - The current container.
       */
      export const isProfiling = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): boolean {
        return !!instanceContainer.getGame().getProfiler();
      };

      /**
       * The duration of the recording in progress, in seconds (0 when not
       * recording).
       * @param instanceContainer - The current container.
       */
      export const getProfilingDuration = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ): float {
        const profiler = instanceContainer.getGame().getProfiler();
        return profiler ? profiler.getRecordingDurationMs() / 1000 : 0;
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
