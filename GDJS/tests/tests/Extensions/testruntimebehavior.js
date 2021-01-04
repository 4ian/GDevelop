/**
 * A test behavior that set the varialbe of the object it's binded to according to lifecycle methods called.
 *
 * @class TestRuntimeBehavior
 * @extends gdjs.RuntimeBehavior
 * @constructor
 */
gdjs.TestRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);
};

gdjs.TestRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.registerBehavior("TestBehavior::TestBehavior", gdjs.TestRuntimeBehavior);

gdjs.TestRuntimeBehavior.prototype.onCreated = function() {
    this.owner.getVariables().get("lastState").setString('created');
};

gdjs.TestRuntimeBehavior.prototype.onDeActivate = function() {
    this.owner.getVariables().get("lastState").setString('deactivated');
};

gdjs.TestRuntimeBehavior.prototype.onActivate = function() {
    this.owner.getVariables().get("lastState").setString('activated');
};

gdjs.TestRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    this.owner.getVariables().get("lastState").setString('doStepPreEvents');
};

gdjs.TestRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    this.owner.getVariables().get("lastState").setString('doStepPostEvents');
};

gdjs.TestRuntimeBehavior.prototype.onDestroy = function() {
    this.owner.getVariables().get("lastState").setString('onDestroy');
};
