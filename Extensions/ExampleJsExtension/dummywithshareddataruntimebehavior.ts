namespace gdjs {
  /**
   * @class DummyWithSharedDataRuntimeBehavior
   * @extends gdjs.RuntimeBehavior
   */
  export class DummyWithSharedDataRuntimeBehavior extends gdjs.RuntimeBehavior {
    _textToSet: string;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData: any,
      owner: gdjs.Object
    ) {
      super(runtimeScene, behaviorData, owner);

      // Here you can access to the behavior data (JSON declared in JsExtension.js)
      // using behaviorData:
      this._textToSet = behaviorData.property1;

      // You can also access to the shared data:
      const sharedData = runtimeScene.getInitialSharedDataForBehavior(
        behaviorData.name
      );
      this._textToSet = sharedData.sharedProperty1;

      // You can also run arbitrary code at the creation of the behavior:
      console.log(
        'DummyWithSharedDataRuntimeBehavior was created for object:',
        owner
      );
      console.log('The shared data are:', sharedData);
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.property1 !== newBehaviorData.property1) {
        this._textToSet = newBehaviorData.property1;
      }

      // Return true to specify that the new behavior data have been applied
      // (false if you can't do it, which will disable hot-reload for the behavior).
      return true;
    }

    onDeActivate() {}

    doStepPreEvents(runtimeScene) {
      // This is run at every frame, before events are launched.
      this.owner
        .getVariables()
        .get('VariableSetFromBehavior')
        .setString(this._textToSet);
    }

    doStepPostEvents(runtimeScene) {
      // This is run at every frame, after events are launched.
    }
  }

  gdjs.registerBehavior(
    'MyDummyExtension::DummyBehaviorWithSharedData',
    gdjs.DummyRuntimeBehavior
  );
}
