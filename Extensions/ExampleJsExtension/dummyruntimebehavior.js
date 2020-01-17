/**
 * The DummyRuntimeBehavior changes a variable in the object that is owning
 * it, at every tick before events are run, to set it to the string that was
 * set in one of the behavior property.
 *
 * @class DummyRuntimeBehavior
 * @extends gdjs.RuntimeBehavior
 * @constructor
 */
gdjs.DummyRuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    gdjs.RuntimeBehavior.call(this, runtimeScene, behaviorData, owner);

    // Here you can access to the behavior data (JSON declared in JsExtension.js)
    // using behaviorData:
    this._textToSet = behaviorData.property1;

    // You can also run arbitrary code at the creation of the behavior:
    console.log("DummyRuntimeBehavior was created for object:", owner);
};

gdjs.DummyRuntimeBehavior.prototype = Object.create( gdjs.RuntimeBehavior.prototype );
gdjs.registerBehavior("MyDummyExtension::DummyBehavior", gdjs.DummyRuntimeBehavior);

gdjs.DummyRuntimeBehavior.prototype.onDeActivate = function() {
};

gdjs.DummyRuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {
    // This is run at every frame, before events are launched.
    this.owner.getVariables().get("VariableSetFromBehavior").setString(this._textToSet);
};

gdjs.DummyRuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {
    // This is run at every frame, after events are launched.
};
