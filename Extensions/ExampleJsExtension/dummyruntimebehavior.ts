namespace gdjs {
  /**
   * The DummyRuntimeBehavior changes a variable in the object that is owning
   * it, at every tick before events are run, to set it to the string that was
   * set in one of the behavior property.
   *
   * @class DummyRuntimeBehavior
   * @extends gdjs.RuntimeBehavior
   */
  export class DummyRuntimeBehavior extends gdjs.RuntimeBehavior {
    _textToSet: string;

    constructor(runtimeScene: gdjs.RuntimeScene, behaviorData: any, owner: gdjs.RuntimeObject) {
      super(runtimeScene, behaviorData, owner);

      // Here you can access to the behavior data (JSON declared in JsExtension.js)
      // using behaviorData:
      this._textToSet = behaviorData.property1;

      // You can also run arbitrary code at the creation of the behavior:
      console.log('DummyRuntimeBehavior was created for object:', owner);
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
    'MyDummyExtension::DummyBehavior',
    gdjs.DummyRuntimeBehavior
  );
}
