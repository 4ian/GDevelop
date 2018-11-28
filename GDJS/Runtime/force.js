/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * A vector used to move objects.
 *
 * @memberof gdjs
 * @class Force
 * @param {number} x The initial x component
 * @param {number} y The initial y component
 * @param {number} multiplier The multiplier (0 for a force that disappear on next frame, 1 for a permanent force)
 */
gdjs.Force = function(x,y, multiplier)
{
    this._x = x || 0;
    this._y = y || 0;
    this._angle = Math.atan2(y,x)*180/Math.PI;
    this._length = Math.sqrt(x*x+y*y);
    this._dirty = false;
    this._multiplier = multiplier;
}

/**
 * Returns the X component of the force.
 */
gdjs.Force.prototype.getX = function() {
	return this._x;
}

/**
 * Returns the Y component of the force.
 */
gdjs.Force.prototype.getY = function() {
	return this._y;
}

/**
 * Set the x component of the force.
 * @param {number} x The new X component
 */
gdjs.Force.prototype.setX = function(x) {
	this._x = x;
	this._dirty = true;
}

/**
 * Set the y component of the force.
 * @param {number} y The new Y component
 */
gdjs.Force.prototype.setY = function(y) {
	this._y = y;
	this._dirty = true;
}

/**
 * Set the angle of the force.
 * @param {number} angle The new angle
 */
gdjs.Force.prototype.setAngle = function(angle) {

	if ( this._dirty ) {
		this._length = Math.sqrt(this._x*this._x+this._y*this._y);
		this._dirty = false;
	}

	this._angle = angle;
	var angleInRadians = angle/180*Math.PI;
	this._x = Math.cos(angleInRadians)*this._length;
	this._y = Math.sin(angleInRadians)*this._length;
}

/**
 * Set the length of the force.
 * @param {number} len The length
 */
gdjs.Force.prototype.setLength = function(len) {

	if ( this._dirty ) {
		this._angle = Math.atan2(this._y, this._x)*180/Math.PI;
		this._dirty = false;
	}

	this._length = len;
	var angleInRadians = this._angle/180*Math.PI;
	this._x = Math.cos(angleInRadians)*this._length;
	this._y = Math.sin(angleInRadians)*this._length;
}

/**
 * Get the angle of the force
 */
gdjs.Force.prototype.getAngle = function() {
	if ( this._dirty ) {
		this._angle = Math.atan2(this._y, this._x)*180/Math.PI;
		this._length = Math.sqrt(this._x*this._x+this._y*this._y);

		this._dirty = false;
	}

	return this._angle;
}


/**
 * Get the length of the force
 */
gdjs.Force.prototype.getLength = function() {
	if ( this._dirty ) {
		this._angle = Math.atan2(this._y, this._x)*180/Math.PI;
		this._length = Math.sqrt(this._x*this._x+this._y*this._y);

		this._dirty = false;
	}

	return this._length;
};

/**
 * Return 1 (true) if the force is permanent, 0 (false) if it is instant.
 */
gdjs.Force.prototype.getMultiplier = function() {
	return this._multiplier;
};

/**
 * Set if the force multiplier.
 * @param {number} multiplier The new value
 */
gdjs.Force.prototype.setMultiplier = function(multiplier) {
	this._multiplier = multiplier;
};
