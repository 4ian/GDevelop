namespace gdjs {
  declare var cordova: any;

  interface extensionDataInterface {
    AndroidReady: boolean;
    runtimeSceneContainer: gdjs.RuntimeScene;
  }

  export namespace evtTools {
    export namespace googlePlayGameServices {
      /** Initial Extension data */
      let extensionData = {
        AndroidReady: false,
      } as extensionDataInterface;

      /** Initialize API */
      gdjs.registerRuntimeSceneLoadedCallback(function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        document.addEventListener(
          'deviceready',
          () => {
            extensionData.AndroidReady = true;
            extensionData.runtimeSceneContainer = runtimeScene;
          },
          false
        );
      });

      /** Check if the googlePlayServices API is ready. */
      export const gameServicesReady = function () {
        return extensionData.AndroidReady;
      };

      /** Calls googlePlayServices API with method and stores response to a scene variable provided. */
      export const googlePlayServicesAPI = function (
        method: string,
        resultSceneVariable: string
      ) {
        cordova.plugins.playGamesServices[method](
          function () {
            extensionData.runtimeSceneContainer
              .getVariables()
              .get(resultSceneVariable)
              .fromJSObject(arguments);
          },
          function () {
            extensionData.runtimeSceneContainer
              .getVariables()
              .get(resultSceneVariable)
              .fromJSObject(arguments);
          }
        );
      };

      /** Calls googlePlayServices API with method and parameters using a structured scene variable then stores response to a scene variable provided. */
      export const googlePlayServicesAPIwParameters = function (
        method: string,
        resultSceneVariable: string,
        parameterSceneVariable: string
      ) {
        const parameters = extensionData.runtimeSceneContainer
          .getVariables()
          .get(parameterSceneVariable)
          .toJSObject();

        cordova.plugins.playGamesServices[method](
          parameters,
          function () {
            extensionData.runtimeSceneContainer
              .getVariables()
              .get(resultSceneVariable)
              .fromJSObject(arguments);
          },
          function () {
            extensionData.runtimeSceneContainer
              .getVariables()
              .get(resultSceneVariable)
              .fromJSObject(arguments);
          }
        );
      };
    }
  }
}
