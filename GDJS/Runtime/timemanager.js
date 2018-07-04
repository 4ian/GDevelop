/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

/**
 * Manage the timers and times elapsed during last
 * frame, since the beginning of the scene and other time related values.
 *
 * @class TimeManager
 * @memberof gdjs
 */
gdjs.TimeManager = function()
{
    this.reset();
}

gdjs.TimeManager.prototype.reset = function() {
    this._elapsedTime = 0;
    this._timeScale = 1;
    this._timeFromStart = 0;
    this._firstFrame = true;
    this._timers = new Hashtable();
}

gdjs.TimeManager.prototype.update = function(elapsedTime, minimumFPS) {
	if (this._firstUpdateDone) this._firstFrame = false;
	this._firstUpdateDone = true;

	//Compute the elapsed time since last frame
	this._elapsedTime = Math.min(elapsedTime, 1000/minimumFPS);
	this._elapsedTime *= this._timeScale;

	//Update timers and others members
	for(var name in this._timers.items) {
		if (this._timers.items.hasOwnProperty(name)) {
			this._timers.items[name].updateTime(this._elapsedTime);
		}
	}

	this._timeFromStart += this._elapsedTime;
};


/**
 * Set the time scale: time will be slower if time scale is < 1,
 * faster if > 1.
 * @param {number} timeScale The new time scale (must be positive).
 */
gdjs.TimeManager.prototype.setTimeScale = function(timeScale) {
	if ( timeScale >= 0 ) this._timeScale = timeScale;
};

/**
 * Get the time scale.
 * @return {number} The time scale (positive, 1 is normal speed).
 */
gdjs.TimeManager.prototype.getTimeScale = function() {
	return this._timeScale;
};

/**
 * Get the time since the instanciation of the manager (i.e: since
 * the beginning of the scene most of the time), in milliseconds.
 */
gdjs.TimeManager.prototype.getTimeFromStart = function() {
	return this._timeFromStart;
};

/**
 * Return true if update was called only once (i.e: if the scene
 * is rendering its first frame).
 */
gdjs.TimeManager.prototype.isFirstFrame = function() {
	return this._firstFrame;
};

/**
 * Return the time elapsed since the last call to update
 * (i.e: the last frame), in milliseconds.
 */
gdjs.TimeManager.prototype.getElapsedTime = function() {
	return this._elapsedTime;
};

gdjs.TimeManager.prototype.addTimer = function(name) {
	this._timers.put(name, new gdjs.Timer(name));
};

gdjs.TimeManager.prototype.hasTimer = function(name) {
	return this._timers.containsKey(name);
};

gdjs.TimeManager.prototype.getTimer = function(name) {
	return this._timers.get(name);
};

gdjs.TimeManager.prototype.removeTimer = function(name) {
	if (this._timers.containsKey(name)) this._timers.remove(name);
};
