/**
 * The DummyRuntimeBehavior changes a variable in the object that is owning
 * it, at every tick before events are run, to set it to the string that was
 * set in one of the behavior property.
 *
 * @class DummyRuntimeBehavior
 * @constructor
 */
gdjs.DummyRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    // Here you can access to the behavior data (JSON declared in JsExtension.js)
    // using behaviorData.content:
    this._textToSet = behaviorData.content.property1;
};

gdjs.DummyRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.DummyRuntimeBehavior.thisIsARuntimeBehaviorConstructor = "MyDummyExtension::DummyBehavior";

gdjs.DummyRuntimeBehavior.prototype.onDeActivate = function() {
};

gdjs.DummyRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    this.owner.getVariables().get("VariableSetFromBehavior").setString(this._textToSet);
};

gdjs.DummyRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
};
