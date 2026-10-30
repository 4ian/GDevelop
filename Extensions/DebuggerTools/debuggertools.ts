namespace gdjs {
  export namespace evtTools {
    /**
     * The namespace containing tools to interact with the debugger.
     * @namespace
     */
    export namespace debuggerTools {
      /**
       * Stop the game execution.
       * @param instanceContainer - The current container.
       */
      export const pause = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        instanceContainer.getGame().pause(true);
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

      /**
       * Enable or disable the 3D debug draw of collision shapes.
       * @param instanceContainer - The current container.
       * @param enableDebugDraw - true to enable the 3D debug draw, false to disable it.
       * @param color - Wireframe color string (format "R;G;B").
       * @param depthTest - true to enable depth testing on the wireframe.
       */
      export const enableDebugDraw3D = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        enableDebugDraw: boolean,
        color: string,
        depthTest: boolean
      ) {
        const rgb = (color || '0;255;0').split(';');
        const colorHex = gdjs.rgbToHexNumber(
          parseInt(rgb[0], 10) || 0,
          parseInt(rgb[1], 10) || 0,
          parseInt(rgb[2], 10) || 0
        );
        instanceContainer.enableDebugDraw3D(enableDebugDraw, colorHex, depthTest);
      };

      /**
       * Toggle the 3D debug draw of collision shapes, reusing the last color
       * and depth test settings (defaulting to green / depth test on).
       * @param instanceContainer - The current container.
       */
      export const toggleDebugDraw3D = function (
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        instanceContainer.enableDebugDraw3D(
          !instanceContainer._debugDraw3DEnabled,
          instanceContainer._debugDraw3DColorHex,
          instanceContainer._debugDraw3DDepthTest
        );
      };
    }
  }
}
