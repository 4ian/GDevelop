/**
 * A test behavior that set the variable of the object it's binded to according to lifecycle methods called.
 *
 * @class TestRuntimeBehavior
 * @extends gdjs.RuntimeBehavior
 * @constructor
 */
gdjs.TestRuntimeBehavior = class TestRuntimeBehavior extends (
  gdjs.RuntimeBehavior
) {
  constructor(runtimeScene, behaviorData, owner) {
    super(runtimeScene, behaviorData, owner);
  }

  onCreated() {
    this.owner.getVariables().get('lastState').setString('created');
  }

  onPlacedInScene() {
    const variables = this.owner.getVariables();
    variables.get('lastState').setString('placed');
    variables.get('placedCount').add(1);
    variables.get('placedX').setNumber(this.owner.getX());
    variables.get('placedY').setNumber(this.owner.getY());
    variables.get('placedLayer').setString(this.owner.getLayer());
    variables.get('placedZOrder').setNumber(this.owner.getZOrder());

    const ownerContainer = this.owner.getInstanceContainer();
    if (ownerContainer.getOwner) {
      const globalPosition = [0, 0];
      ownerContainer
        .getOwner()
        .applyObjectTransformation(
          this.owner.getX(),
          this.owner.getY(),
          globalPosition
        );
      variables.get('placedGlobalX').setNumber(globalPosition[0]);
      variables.get('placedGlobalY').setNumber(globalPosition[1]);
    } else {
      variables.get('placedGlobalX').setNumber(this.owner.getX());
      variables.get('placedGlobalY').setNumber(this.owner.getY());
    }
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
