/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Represents a timer, which must be updated manually with {@link gdjs.Timer#updateTime}.
 *
 * @class Timer
 * @memberof gdjs
 * @param {string} name The name of the timer.
 */
gdjs.Timer = function(name)
{
    this._name = name;
    this._time = 0;
    this._paused = false;
}

/**
 * Get the name of the timer
 * @return {string} The name of the timer
 */
gdjs.Timer.prototype.getName = function() {
	return this._name;
}

/**
 * Get the time of the timer, in milliseconds.
 * @return {number} The time of the timer, in milliseconds.
 */
gdjs.Timer.prototype.getTime = function() {
	return this._time;
}

/**
 * Notify the timer that some time has passed.
 * @param {number} time The elapsed time, in milliseconds.
 */
gdjs.Timer.prototype.updateTime = function(time) {
	if ( !this._paused ) this._time += time;
}

/**
 * Change the time.
 * @param {number} time The new time, in milliseconds.
 */
gdjs.Timer.prototype.setTime = function(time) {
	this._time = time;
}

/**
 * Reset the time to zero.
 */
gdjs.Timer.prototype.reset = function() {
	this.setTime(0);
}

/**
 * Set if the timer is paused.
 * @param {boolean} enable true to pause the timer, false otherwise.
 */
gdjs.Timer.prototype.setPaused = function(enable) {
	this._paused = enable;
}

/**
 * Check if the timer is paused.
 */
gdjs.Timer.prototype.isPaused = function() {
	return this._paused;
}
