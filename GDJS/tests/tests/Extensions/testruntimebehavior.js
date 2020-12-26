/**
 * A test behavior that set the variable of the object it's binded to according to lifecycle methods called.
 *
 * @class TestRuntimeBehavior
 * @extends gdjs.RuntimeBehavior
 * @constructor
 */
gdjs.TestRuntimeBehavior = class TestRuntimeBehavior extends gdjs.RuntimeBehavior {
  constructor(runtimeScene, behaviorData, owner) {
    super(runtimeScene, behaviorData, owner);
  }

  onCreated() {
    this.owner.getVariables().get('lastState').setString('created');
  }

  onDeActivate() {
    this.owner.getVariables().get('lastState').setString('deactivated');
  }

  onActivate() {
    this.owner.getVariables().get('lastState').setString('activated');
  }

  doStepPreEvents(runtimeScene) {
    this.owner.getVariables().get('lastState').setString('doStepPreEvents');
  }

  doStepPostEvents(runtimeScene) {
    this.owner.getVariables().get('lastState').setString('doStepPostEvents');
  }

  onDestroy() {
    this.owner.getVariables().get('lastState').setString('onDestroy');
  }
};

gdjs.registerBehavior('TestBehavior::TestBehavior', gdjs.TestRuntimeBehavior);
