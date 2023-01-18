namespace gdjs {
  const logger = new gdjs.Logger('Example extension');

  export namespace evtTools {
    /**
     * This is an example of some functions that can be used through events.
     * They could live on any object but it's usual to store them in an object
     * with the extension name in `gdjs.evtTools`.
     *
     * Functions are being passed the arguments that were declared in the extension.
     */
    export namespace exampleJsExtension {
      export const myConditionFunction = function (number, text) {
        return number <= 10 && text.length < 5;
      };

      export const getString = function () {
        return 'Hello World';
      };

      // You can store global information, data, etc... directly in the namespace of your extension:
      let myGlobalString = 'Hello World';

      /**
       * In **rare cases** you may want to run code at the start of the scene. You can define a callback
       * that will be called at this moment.
       */
      gdjs.registerRuntimeSceneLoadedCallback(function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        logger.log('A gdjs.RuntimeScene was loaded:', runtimeScene);
      });

      /**
       * In **rare cases** you may want to run code at the end of a scene. You can define a callback
       * that will be called at this moment.
       */
      gdjs.registerRuntimeSceneUnloadedCallback(function (
        runtimeScene: gdjs.RuntimeScene
      ) {
        logger.log('A gdjs.RuntimeScene was unloaded:', runtimeScene);
      });

      /**
       * In **very rare cases** you may want to run code whenever an object is deleted.
       */
      gdjs.registerObjectDeletedFromSceneCallback(function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        runtimeObject
      ) {
        logger.log(
          'A gdjs.RuntimeObject was deleted from a gdjs.RuntimeScene:',
          instanceContainer,
          runtimeObject
        );
      });

      // Finally, note that you can also simply run code here. Most of the time you shouldn't need it though.
      logger.log(
        'gdjs.exampleJsExtension was created, with myGlobalString containing:' +
          myGlobalString
      );
    }
  }
}
