/**
 * @class DummyWithSharedDataRuntimeBehavior
 * @constructor
 */
gdjs.DummyWithSharedDataRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    // Here you can access to the behavior data (JSON declared in JsExtension.js)
    // using behaviorData.content:
    this._textToSet = behaviorData.content.property1;
};

gdjs.DummyWithSharedDataRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.DummyWithSharedDataRuntimeBehavior.thisIsARuntimeBehaviorConstructor = "MyDummyExtension::DummyBehaviorWithSharedData";

gdjs.DummyWithSharedDataRuntimeBehavior.prototype.onDeActivate = function() {
};

gdjs.DummyWithSharedDataRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    this.owner.getVariables().get("VariableSetFromBehavior").setString(this._textToSet);
};

gdjs.DummyWithSharedDataRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
};
