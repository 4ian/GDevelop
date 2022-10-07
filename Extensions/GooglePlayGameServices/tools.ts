namespace gdjs {
  declare var cordova: any;

  const logger = new gdjs.Logger('Google Play Services extension');

  export namespace googlePlayGameServices {

    export namespace android {
      // You can store global information, data, etc... directly in the namespace of your extension:
      let extensionData = {
          AndroidReady: false
      };

      /**
       * In **rare cases** you may want to run code at the start of the scene. You can define a callback
       * that will be called at this moment.
       */
      gdjs.registerRuntimeSceneLoadedCallback(function () {
        document.addEventListener('deviceready', ()=>{
            extensionData.AndroidReady = true;
        }, false);
      });

      export const gameServicesReady = function () {
        return extensionData.AndroidReady;
      };

      export const googlePlayServicesAPI = function (method: string, resultSceneVariable: string) {
        cordova.plugins.playGamesServices[method](function() {
            gdjs.runtimeScene.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        },function() {
            gdjs.runtimeScene.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        });
      };

      export const googlePlayServicesAPIwParameters = function (method: string, resultSceneVariable: string, parameterSceneVariable: string) {
        const parameters = gdjs.runtimeScene.getVariables().get(parameterSceneVariable).toJSObject();

        cordova.plugins.playGamesServices[method](parameters, function() {
            gdjs.runtimeScene.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        },function() {
            gdjs.runtimeScene.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        });
      };
    }
  }
}
