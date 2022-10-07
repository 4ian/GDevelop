namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Google Play Services extension');

  export namespace googlePlayGameServices {

    export namespace android {

      interface extensionDataInterface {
        AndroidReady: boolean;
        runtimeSceneContainer: gdjs.RuntimeScene;
      }

      // You can store global information, data, etc... directly in the namespace of your extension:
      let extensionData = {
          AndroidReady: false
      } as extensionDataInterface;

      /**
       * In **rare cases** you may want to run code at the start of the scene. You can define a callback
       * that will be called at this moment.
       */
      gdjs.registerRuntimeSceneLoadedCallback(function (runtimeScene: gdjs.RuntimeScene) {
        document.addEventListener('deviceready', ()=>{
            extensionData.AndroidReady = true;
            extensionData.runtimeSceneContainer = runtimeScene;
        }, false);
      });

      export const gameServicesReady = function () {
        return extensionData.AndroidReady;
      };

      export const googlePlayServicesAPI = function (method: string, resultSceneVariable: string) {
        cordova.plugins.playGamesServices[method](function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        },function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        });
      };

      export const googlePlayServicesAPIwParameters = function (method: string, resultSceneVariable: string, parameterSceneVariable: string) {
        const parameters = extensionData.runtimeSceneContainer.getVariables().get(parameterSceneVariable).toJSObject();

        cordova.plugins.playGamesServices[method](parameters, function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        },function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        });
      };
    }
  }
}
