/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * @typedef BehaviorData Properties to set up a behavior.
 * @property {string} name The name of the behavior (for getting from an object (object.getBehavior) for example)
 * @property {string} type The behavior type. Used by GDJS to find the proper behavior to construct.
 */

/**
 * RuntimeBehavior represents a behavior being used by a RuntimeObject.
 *
 * @class RuntimeBehavior
 * @memberof gdjs
 * @param {gdjs.RuntimeScene} runtimeScene The scene owning the object of the behavior
 * @param {BehaviorData} behaviorData The properties used to setup the behavior
 * @param {gdjs.RuntimeObject} owner The object owning the behavior
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
 * Called when the behavior must be updated using the specified behaviorData. This is the
 * case during hot-reload, and is only called if the behavior was modified.
 *
 * @see gdjs.RuntimeBehavior#onObjectHotReloaded
 *
 * @param {BehaviorData} oldBehaviorData The previous data for the behavior.
 * @param {BehaviorData} newBehaviorData The new data for the behavior.
 * @returns {boolean} true if the behavior was updated, false if it could not (i.e: hot-reload is not supported).
 */
gdjs.RuntimeBehavior.prototype.updateFromBehaviorData = function(oldBehaviorData, newBehaviorData) {
    // If not redefined, mark by default the hot-reload as failed.
    return false;
}

/**
 * Get the name of the behavior.
 * @return {string} The behavior's name.
 */
gdjs.RuntimeBehavior.prototype.getName = function() {
	return this.name;
};

/**
 * Get the name identifier of the behavior.
 * @return {number} The behavior's name identifier.
 */
gdjs.RuntimeBehavior.prototype.getNameId = function() {
	return this._nameId;
};

/**
 * Called at each frame before events. Call doStepPreEvents.<br>
 * Behaviors writers: Please do not redefine this method. Redefine doStepPreEvents instead.
 * @param {gdjs.RuntimeScene} runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.stepPreEvents = function(runtimeScene) {
	if ( this._activated ) {
		var profiler = runtimeScene.getProfiler();
		if (profiler) profiler.begin(this.name);

		this.doStepPreEvents(runtimeScene);

		if (profiler) profiler.end(this.name);
	}
};

/**
 * Called at each frame after events. Call doStepPostEvents.<br>
 * Behaviors writers: Please do not redefine this method. Redefine doStepPreEvents instead.
 * @param {gdjs.RuntimeScene} runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.stepPostEvents = function(runtimeScene) {
	if ( this._activated ) {
		var profiler = runtimeScene.getProfiler();
		if (profiler) profiler.begin(this.name);

		this.doStepPostEvents(runtimeScene);

		if (profiler) profiler.end(this.name);
	}
};

/**
 * De/Activate the behavior
 * @param {boolean} enable true to enable the behavior, false to disable it
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
 * Reimplement this to do extra work when the behavior is created (i.e: an
 * object using it was created), after the object is fully initialized (so
 * you can use `this.owner` without risk).
 */
gdjs.RuntimeBehavior.prototype.onCreated = function() {

};

/**
 * Return true if the behavior is activated
 */
gdjs.RuntimeBehavior.prototype.activated = function() {
	return this._activated;
};

/**
 * Reimplement this method to do extra work when the behavior is activated (after
 * it has been deactivated, see `onDeActivate`).
 */
gdjs.RuntimeBehavior.prototype.onActivate = function() {

};

/**
 * Reimplement this method to do extra work when the behavior is deactivated.
 */
gdjs.RuntimeBehavior.prototype.onDeActivate = function() {

};

/**
 * This method is called each tick before events are done.
 * @param {gdjs.RuntimeScene} runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.doStepPreEvents = function(runtimeScene) {

};

/**
 * This method is called each tick after events are done.
 * @param {gdjs.RuntimeScene} runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeBehavior.prototype.doStepPostEvents = function(runtimeScene) {

}

/**
 * This method is called when the owner of the behavior
 * is being removed from the scene and is about to be destroyed/reused later
 * or when the behavior is removed from an object (can happen in case of
 * hot-reloading only. Otherwise, behaviors are just de-activated,
 * not removed. See `onDeActivate`).
 */
gdjs.RuntimeBehavior.prototype.onDestroy = function() {

};

/**
 * This method is called when the owner of the behavior
 * was hot reloaded, so its position, angle, size can have been changed outside
 * of events.
 */
gdjs.RuntimeBehavior.prototype.onObjectHotReloaded = function() {

};

gdjs.registerBehavior("", gdjs.RuntimeBehavior);
