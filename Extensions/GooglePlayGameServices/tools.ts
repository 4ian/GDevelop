namespace gdjs {
  const logger = new gdjs.Logger('Google Play Services extension');

  export namespace googlePlayGameServices {

    export namespace android {
      // You can store global information, data, etc... directly in the namespace of your extension:
      let extensionData = {
          API: {
              Android: null
          },
          AndroidReady: false,
          runtimeSceneContainer: false
      };

      /**
       * In **rare cases** you may want to run code at the start of the scene. You can define a callback
       * that will be called at this moment.
       */
      gdjs.registerRuntimeSceneLoadedCallback(function (runtimeScene) {
        document.addEventListener('deviceready', ()=>{
            extensionData.AndroidReady = true;
            extensionData.API.Android = cordova.plugins.playGamesServices;
            extensionData.runtimeSceneContainer = runtimeScene;
        }, false);
      });

      export const gameServicesReady = function () {
        return extensionData.AndroidReady;
      };

      export const googlePlayServicesAPI = function (method, resultSceneVariable) {
        extensionData.API.Android[method](function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        },function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        });
      };

      export const googlePlayServicesAPIwParameters = function (method, resultSceneVariable, parameterSceneVariable) {
        const parameters = extensionData.runtimeSceneContainer.getVariables().get(parameterSceneVariable).toJSObject();

        extensionData.API.Android[method](parameters, function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        },function() {
            extensionData.runtimeSceneContainer.getVariables().get(resultSceneVariable).fromJSObject(arguments);
        });
      };
    }
  }
}
