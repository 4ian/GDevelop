/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * A Force is used to move objects.
 *
 * @namespace gdjs
 * @class Force
 * @constructor
 * @param x The initial x component
 * @param y The initial y component
 * @param clearing The clearing
 */
gdjs.Force = function(x,y, clearing)
{
    this._x = x || 0;
    this._y = y || 0;
    this._angle = Math.atan2(y,x)*180/3.14159;
    this._length = Math.sqrt(x*x+y*y);
    this._dirty = false;
    this._clearing = clearing;
}

/**
 * Returns the X component of the force.
 * @method getX
 */
gdjs.Force.prototype.getX = function() {
	return this._x;
}

/**
 * Returns the Y component of the force.
 * @method getY
 */
gdjs.Force.prototype.getY = function() {
	return this._y;
}

/**
 * Set the x component of the force.
 * @method setX
 * @param x {Number} The new X component
 */
gdjs.Force.prototype.setX = function(x) {
	this._x = x;
	this._dirty = true;
}

/**
 * Set the y component of the force.
 * @method setY
 * @param y {Number} The new Y component
 */
gdjs.Force.prototype.setY = function(y) {
	this._y = y;
	this._dirty = true;
}

/**
 * Set the angle of the force.
 * @method setAngle
 * @param angle {Number} The new angle
 */
gdjs.Force.prototype.setAngle = function(angle) {

	if ( this._dirty ) {
		this._length = Math.sqrt(this._x*this._x+this._y*this._y);
		this._dirty = false;
	}

	this._angle = angle;
	this._x = Math.cos(angle/180*3.14159)*this._length;
	this._y = Math.sin(angle/180*3.14159)*this._length;
}

/**
 * Set the length of the force.
 * @method setLength
 * @param len {Number} The length
 */
gdjs.Force.prototype.setLength = function(len) {

	if ( this._dirty ) {
		this._angle = Math.atan2(this._y, this._x)*180/3.14159;
		this._dirty = false;
	}

	this._length = len;
	this._x = Math.cos(this._angle/180*3.14159)*this._length;
	this._y = Math.sin(this._angle/180*3.14159)*this._length;
}

/**
 * Get the angle of the force
 * @method getAngle
 */
gdjs.Force.prototype.getAngle = function() {
	if ( this._dirty ) {
		this._angle = Math.atan2(this._y, this._x)*180/3.14159;
		this._length = Math.sqrt(this._x*this._x+this._y*this._y);

		this._dirty = false;
	}

	return this._angle;
}


/**
 * Get the length of the force
 * @method getLength
 */
gdjs.Force.prototype.getLength = function() {
	if ( this._dirty ) {
		this._angle = Math.atan2(this._y, this._x)*180/3.14159;
		this._length = Math.sqrt(this._x*this._x+this._y*this._y);

		this._dirty = false;
	}

	return this._length;
};

/**
 * Return true if the force is temporary, false if it is permanent.
 * @method getClearing
 */
gdjs.Force.prototype.getClearing = function() {
	return this._clearing;
};

/**
 * Set if the force clearing.
 * @method setClearing
 */
gdjs.Force.prototype.setClearing = function(clearing) {
	this._clearing = clearing;
};
