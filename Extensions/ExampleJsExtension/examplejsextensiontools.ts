namespace gdjs {
  /**
   * This is an example of some functions that can be used through events.
   * They could live on any object but it's usual to store them in an object
   * with the extension name in `gdjs.evtTools`.
   *
   * Functions are being passed the arguments that were declared in the extension.
   *
   * @memberof gdjs.evtTools
   * @class exampleJsExtension
   * @static
   */
  gdjs.evtTools.exampleJsExtension = {};
  gdjs.evtTools.exampleJsExtension.myConditionFunction = function (
    number,
    text
  ) {
    return number <= 10 && text.length < 5;
  };
  gdjs.evtTools.exampleJsExtension.getString = function () {
    return 'Hello World';
  };

  /**
   * You can also attach an object to gdjs, that you can use to store more information
   * or objects - even if you should have doing so as global state can make things harder
   * to debug. Most of the time you can have all the logic in your functions, your gdjs.RuntimeBehavior
   * or your gdjs.RuntimeObject.
   */
  gdjs.exampleJsExtension = { myGlobalString: 'Hello World' };

  /**
   * In **rare cases** you may want to run code at the start of the scene. You can define a callback
   * that will be called at this moment.
   */
  gdjs.registerRuntimeSceneLoadedCallback(function (runtimeScene) {
    console.log('A gdjs.RuntimeScene was loaded:', runtimeScene);
  });

  /**
   * In **rare cases** you may want to run code at the end of a scene. You can define a callback
   * that will be called at this moment.
   */
  gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
    console.log('A gdjs.RuntimeScene was unloaded:', runtimeScene);
  });

  /**
   * In **very rare cases** you may want to run code whenever an object is deleted.
   */
  gdjs.registerObjectDeletedFromSceneCallback(function (
    runtimeScene,
    runtimeObject
  ) {
    console.log(
      'A gdjs.RuntimeObject was deleted from a gdjs.RuntimeScene:',
      runtimeScene,
      runtimeObject
    );
  });

  // Finally, note that you can also simply run code here. Most of the time you shouldn't need it though.
  console.log(
    'gdjs.exampleJsExtension was created, with myGlobalString containing:' +
      gdjs.exampleJsExtension.myGlobalString
  );
}
