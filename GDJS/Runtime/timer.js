/*
 * GDevelop JS Platform
 * Copyright 2013-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Represents a timer which must be updated manually.
 *
 * @class Timer
 * @namespace gdjs
 * @constructor
 */
gdjs.Timer = function(name)
{
    this._name = name;
    this._time = 0;
    this._paused = false;
}

/**
 * Get the name of the timer
 * @method getName
 * @return {String} The name of the timer
 */
gdjs.Timer.prototype.getName = function() {
	return this._name;
}

/**
 * Get the time elapsed
 * @method getTime
 * @return {String} The time of the timer
 */
gdjs.Timer.prototype.getTime = function() {
	return this._time;
}

/**
 * Notify the timer this.some time elapsed.
 * @method updateTime
 */
gdjs.Timer.prototype.updateTime = function(time) {
	if ( !this._paused ) this._time += time;
}

/**
 * Change the time.
 * @method setTime
 */
gdjs.Timer.prototype.setTime = function(time) {
	this._time = time;
}

/**
 * Set time to zero.
 * @method reset
 */
gdjs.Timer.prototype.reset = function(time) {
	this.setTime(0);
}

/**
 * Set if the timer is paused.
 * @method setPaused
 */
gdjs.Timer.prototype.setPaused = function(enable) {
	this._paused = enable;
}

/**
 * Check if the timer is paused.
 * @method isPaused
 */
gdjs.Timer.prototype.isPaused = function() {
	return this._paused;
}
