/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * RuntimeBehavior represents a behavior being used by a RuntimeObject.
 *
 * @class RuntimeBehavior
 * @constructor
 * @param runtimeScene The scene owning the object of the behavior
 * @param behaviorData The object used to setup the behavior
 * @param owner The object owning the behavior
 */
gdjs.RuntimeBehavior = function(runtimeScene, behaviorData, owner)
{
    this.name = behaviorData.name || "";
    this.type = behaviorData.type || "";
    this._nameId = gdjs.RuntimeObject.getNameIdentifier(this.name);
    this._activated = true;
    this.owner = owner;
};
/**
 * Get the name of the behavior.
 * @method getName
 * @return {String} The behavior's name.
 */
gdjs.RuntimeBehavior.prototype.getName = function() {
	return this.name;
};

/**
 * Get the name identifier of the behavior.
 * @method getNameId
 * @return {Number} The behavior's name identifier.
 */
gdjs.RuntimeBehavior.prototype.getNameId = function() {
	return this._nameId;
};

/**
 * Called at each frame before events. Call doStepPreEvents.<br>
 * Behaviors writers: Please do not redefine this method. Redefine doStepPreEvents instead.
 * @method stepPreEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.stepPreEvents = function(runtimeScene) {
	if ( this._activated ) this.doStepPreEvents(runtimeScene);
};

/**
 * Called at each frame after events. Call doStepPostEvents.<br>
 * Behaviors writers: Please do not redefine this method. Redefine doStepPreEvents instead.
 * @method stepPostEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.stepPostEvents = function(runtimeScene) {
	if ( this._activated ) this.doStepPostEvents(runtimeScene);
};

/**
 * De/Activate the behavior
 * @method activate
 */
gdjs.RuntimeBehavior.prototype.activate = function(enable) {
	if ( enable === undefined ) enable = true;
	if ( !this._activated && enable ) {
		this._activated = true;
		this.onActivate();
	}
	else if ( this._activated && !enable ) {
		this._activated = false;
		this.onDeActivate();
	}
};

/**
 * Return true if the behavior is activated
 * @method activated
 */
gdjs.RuntimeBehavior.prototype.activated = function() {
	return this._activated;
};

/**
 * Behaviors writers: Reimplement this method to do extra work
 * when the behavior is activated
 * @method onActivate
 */
gdjs.RuntimeBehavior.prototype.onActivate = function() {

};

/**
 * Behaviors writers: Reimplement this method to do extra work
 * when the behavior is deactivated
 * @method onDeActivate
 */
gdjs.RuntimeBehavior.prototype.onDeActivate = function() {

};

/**
 * Behaviors writers: This method is called each tick before events are done.
 * @method doStepPreEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {

};

/**
 * Behaviors writers: This method is called each tick after events are done.
 * @method doStepPostEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {

}

/**
 * Behaviors writers: This method is called when the owner of the behavior
 * is removed from its scene.
 * @method ownerRemovedFromScene
 */
gdjs.RuntimeBehavior.prototype.ownerRemovedFromScene = function() {

}

//Notify gdjs this.the runtimeBehavior exists.
gdjs.RuntimeBehavior.thisIsARuntimeBehaviorConstructor = "";
