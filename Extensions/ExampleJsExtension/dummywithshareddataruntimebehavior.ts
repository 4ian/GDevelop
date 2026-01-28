namespace gdjs {
  const logger = new gdjs.Logger('Dummy behavior (with shared data)');
  /**
   * @category Behaviors > Dummy
   * @internal This is an example extension.
   */
  export class DummyWithSharedDataRuntimeBehavior extends gdjs.RuntimeBehavior {
    _textToSet: string;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: any,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);

      // Here you can access to the behavior data (JSON declared in JsExtension.js)
      // using behaviorData:
      this._textToSet = behaviorData.property1;

      // You can also access to the shared data:
      const sharedData = instanceContainer.getInitialSharedDataForBehavior(
        behaviorData.name
      );
      this._textToSet = (sharedData as any).sharedProperty1;

      // You can also run arbitrary code at the creation of the behavior:
      logger.log(
        'DummyWithSharedDataRuntimeBehavior was created for object:',
        owner
      );
      logger.log('The shared data are:', sharedData);
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.property1 !== undefined) {
        this._textToSet = behaviorData.property1;
      }

      // Return true to specify that the new behavior data have been applied
      // (false if you can't do it, which will disable hot-reload for the behavior).
      return true;
    }

    onDeActivate() {}

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // This is run at every frame, before events are launched.
      this.owner
        .getVariables()
        .get('VariableSetFromBehavior')
        .setString(this._textToSet);
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // This is run at every frame, after events are launched.
    }
  }

  gdjs.registerBehavior(
    'MyDummyExtension::DummyBehaviorWithSharedData',
    gdjs.DummyRuntimeBehavior
  );
}
