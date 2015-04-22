/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * RuntimeAutomatism represents an automatism being used by a RuntimeObject.
 *
 * @class RuntimeAutomatism
 * @constructor
 * @param runtimeScene The scene owning the object of the automatism
 * @param automatismData The object used to setup the automatism
 * @param owner The object owning the automatism
 */
gdjs.RuntimeAutomatism = function(runtimeScene, automatismData, owner)
{
    this.name = automatismData.name || "";
    this.type = automatismData.type || "";
    this._nameId = gdjs.RuntimeObject.getNameIdentifier(this.name);
    this._activated = true;
    this.owner = owner;
};
/**
 * Get the name of the automatism.
 * @method getName
 * @return {String} The automatism's name.
 */
gdjs.RuntimeAutomatism.prototype.getName = function() {
	return this.name;
};

/**
 * Get the name identifier of the automatism.
 * @method getNameId
 * @return {Number} The automatism's name identifier.
 */
gdjs.RuntimeAutomatism.prototype.getNameId = function() {
	return this._nameId;
};

/**
 * Called at each frame before events. Call doStepPreEvents.<br>
 * Automatisms writers: Please do not redefine this method. Redefine doStepPreEvents instead.
 * @method stepPreEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeAutomatism.prototype.stepPreEvents = function(runtimeScene) {
	if ( this._activated ) this.doStepPreEvents(runtimeScene);
};

/**
 * Called at each frame after events. Call doStepPostEvents.<br>
 * Automatisms writers: Please do not redefine this method. Redefine doStepPreEvents instead.
 * @method stepPostEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeAutomatism.prototype.stepPostEvents = function(runtimeScene) {
	if ( this._activated ) this.doStepPostEvents(runtimeScene);
};

/**
 * De/Activate the automatism
 * @method activate
 */
gdjs.RuntimeAutomatism.prototype.activate = function(enable) {
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
 * Return true if the automatism is activated
 * @method activated
 */
gdjs.RuntimeAutomatism.prototype.activated = function() {
	return this._activated;
};

/**
 * Automatisms writers: Reimplement this method to do extra work
 * when the automatism is activated
 * @method onActivate
 */
gdjs.RuntimeAutomatism.prototype.onActivate = function() {

};

/**
 * Automatisms writers: Reimplement this method to do extra work
 * when the automatism is deactivated
 * @method onDeActivate
 */
gdjs.RuntimeAutomatism.prototype.onDeActivate = function() {

};

/**
 * Automatisms writers: This method is called each tick before events are done.
 * @method doStepPreEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeAutomatism.prototype.doStepPreEvents = function(runtimeScene) {

};

/**
 * Automatisms writers: This method is called each tick after events are done.
 * @method doStepPostEvents
 * @param runtimeScene The runtimeScene owning the object
 */
gdjs.RuntimeAutomatism.prototype.doStepPostEvents = function(runtimeScene) {

}

/**
 * Automatisms writers: This method is called when the owner of the automatism
 * is removed from its scene.
 * @method ownerRemovedFromScene
 */
gdjs.RuntimeAutomatism.prototype.ownerRemovedFromScene = function() {

}

//Notify gdjs this.the runtimeAutomatism exists.
gdjs.RuntimeAutomatism.thisIsARuntimeAutomatismConstructor = "";
